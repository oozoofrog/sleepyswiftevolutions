"""Render the Unicode chronology from the recorded lines and approved optical study."""
from pathlib import Path
import json, math, re, subprocess as sp, sys
import numpy as np
from PIL import Image
from draw import ROOT, TEXT, Item, render_frame, XEROX_TITLE, APPLE_TITLE
from render import RATE,FPS,OUT,srt_time,write_audio,run
from film import film_layout
from film_opening import opening, motion_chapters, threshold_layout
from sanjo import write_score

LONG = (
    'intro choose travel archive xerox userfont compare why apple davis name library karen cjk '
    'becker shared fixed cost network merge pair lower taiwan loss keep seoul proposal '
    'nonhan editing iso tokyo review book empty reason uro krcjk volume tables china japan korea '
    'question unified return end press afterbecker afterkaren afternelson aftermiyazawa afterchoontack afterkim afterdavis afterlee afterform '
    'credits cookiever cookielang cookierare cookiemost'
).split()
SHORT = (
    'intro choose travel archive xerox karen cjk becker pair lower taiwan loss keep uro volume korea '
    'unified return end afterlee afterform credits scookiever scookielang scookierare scookiemost'
).split()
CHAPTERS = {
    'intro':'1988년 8월 29일 · 조 베커의 제안', 'xerox':f'1986–1987 · {XEROX_TITLE}', 'apple':f'1987 · {APPLE_TITLE}',
    'karen':'1988 · 도서관의 한·중·일 문자 자료', 'becker':'1988 · 공통 번호의 제안',
    'merge':'1989 · 두 개의 푸를 청', 'seoul':'1990 · 한국 대표단의 제안',
    'editing':'1991 · 초판이 두 권으로 나온 이유', 'uro':'1992 · 원래 문자표로 되돌리기',
    'afterbecker':'그 뒤의 사람들', 'afterlee':'2026 · 리 콜린스의 제안서', 'credits':'자료와 제작',
    'cookiever':'쿠키 · 오늘의 유니코드',
    'scookiever':'쿠키 · 오늘의 유니코드',
}
MAPPING={'tables':'open','china':'china','japan':'japan','korea':'korea'}
PAIR={'pair':'pair','lower':'lower','keep':'keep'}

def voice(key):
    src=ROOT/'audio/long'/(key+'.mp3')
    pcm=np.frombuffer(sp.check_output(['ffmpeg','-v','error','-i',str(src),'-ar',str(RATE),'-ac','1','-f','s16le','-']),'<i2')
    blocks=pcm[:len(pcm)//480*480].astype(float).reshape(-1,480)
    env=np.sqrt((blocks**2).mean(axis=1));active=np.where(np.convolve((env>max(50,env.max()*.012)).astype(int),[1,1,1],mode='same')>=2)[0]
    return pcm,active[0]*.01,(active[-1]+1)*.01

def sequence(keys,folder,p=False):
    manifest={r['key']:r for r in json.loads((ROOT/'audio/manifest.json').read_text())}
    samples=[];rows=[];now=0
    tracks={lang:[] for lang in ('ko','en','ja','zh-Hans')}
    for key in keys:
        if key=='credits':
            frames=round((2.5 if p else 3.5)*FPS)
            rows.append(('credits',now,frames,0))
            samples.append(np.zeros(frames*(RATE//FPS),'<i2'))
            now+=frames
            continue
        pcm,on,off=voice(key)
        lead=.65 if key in ('cookiever','scookiever') else (.5 if key=='intro' else .24)
        tail=(1.10 if p else 1.35) if key in ('cookiemost','scookiemost') else (.80 if key in ('travel','keep','reason','end','afterform') else .32)
        frames=math.ceil((lead+len(pcm)/RATE+tail)*FPS)
        head=round(lead*RATE)
        samples.extend((np.zeros(head,'<i2'),pcm,np.zeros(frames*(RATE//FPS)-head-len(pcm),'<i2')))
        recorded=manifest[key]['cues']
        for lang,track in tracks.items():
            if len(recorded)==1:
                lines=[TEXT[key][lang]]
            elif lang=='ko':
                lines=[cue['text'] for cue in recorded]
            else:
                lines=re.split(r'(?<=[。！？])|(?<=[!?\.])\s+',TEXT[key][lang])
                lines=[line for line in lines if line]
            if len(lines)!=len(recorded):raise ValueError(f'{key}: {lang} caption count')
            for i,(line,cue) in enumerate(zip(lines,recorded)):
                start=on if i==0 else cue['startSec']
                end=off if i==len(lines)-1 else cue['endSec']
                track.append((now/FPS+lead+start,now/FPS+lead+end,line))
        rows.append((key,now,frames,lead+on));now+=frames
    write_audio(folder/'speech.wav',np.concatenate(samples))
    for lang,cues in tracks.items():
        (folder/(lang+'.srt')).write_text('\n\n'.join(f'{i}\n{srt_time(a)} --> {srt_time(b)}\n{line}' for i,(a,b,line) in enumerate(cues,1))+'\n')
    chapters=[(start,CHAPTERS[key]) for key,start,n,o in rows if key in CHAPTERS]
    total=now
    meta=[';FFMETADATA1','title=유니코드 1.0 연대기 — 한 획에 붙은 세 번호','artist=oozoofrog']
    for i,(start,title) in enumerate(chapters):
        end=chapters[i+1][0] if i+1<len(chapters) else total
        meta+=['[CHAPTER]','TIMEBASE=1/1000',f'START={round(start*1000/FPS)}',f'END={round(end*1000/FPS)}',f'title={title}']
    (folder/'chapters.ffmeta').write_text('\n'.join(meta)+'\n')
    landing = next(start/FPS for key,start,_,_ in rows if key=='xerox')
    credits_at = next(start/FPS for key,start,_,_ in rows if key=='credits')
    cookie_at = next(start/FPS for key,start,_,_ in rows if key in ('cookiever','scookiever'))
    write_score(folder/'sanjo.wav',total/FPS,landing,credits_at,cookie_at)
    run(['ffmpeg','-v','error','-y','-i',str(folder/'speech.wav'),'-i',str(folder/'sanjo.wav'),
         '-filter_complex','[0:a]pan=stereo|c0=c0|c1=c0,asplit[v][key];[1:a][key]sidechaincompress=threshold=0.035:ratio=2.6:attack=22:release=420:makeup=1[m];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.92:level=0:latency=1,volume=-1.5dB[a]',
         '-map','[a]','-t',str(total/FPS),'-c:a','aac','-b:a','192k',str(folder/'mix.m4a')])
    return rows

def motion_art(kind,key,t,duration,p,work):
    ch=motion_chapters()[kind]
    cue=next(c for c in ch['cues'] if c['key']==key)
    i=ch['cues'].index(cue)
    start=0 if i==0 else cue['start']
    end=ch['cues'][i+1]['start'] if i+1<len(ch['cues']) else ch['duration']
    index=min(ch['frames']-1,int((start+(end-start)*min(1,t/duration))*FPS))
    with Image.open(work/kind/f'{index:04d}.jpg') as f:
        art=f.convert('RGB')
    if p and kind=='forms':art=art.crop((95,0,1025,art.height))
    width=928 if p else 1440
    return art.resize((width,round(width*art.height/art.width)),Image.Resampling.BICUBIC)

def pictures(rows,p,work,folder):
    w,h=(1080,1920) if p else (1920,1080)
    output=folder/'picture.mp4'
    enc=sp.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{w}x{h}','-framerate','24','-i','-',
                  '-c:v','h264_videotoolbox','-b:v','10M','-pix_fmt','yuv420p',str(output)],stdin=sp.PIPE)
    prev=None
    previous_part=None
    try:
        for key,start,frames,on in rows:
            moving=key in MAPPING or key in PAIR
            intro=key in ('intro','choose','travel','archive')
            part='mapping' if key in MAPPING else 'twoforms' if key in PAIR else key
            cur=None if intro else film_layout(part,p,p)
            base=render_frame(None,cur,p,1) if moving else None
            still=None
            for frame in range(frames):
                t=frame/FPS
                progress=min(1,t/(1.65 if key=='xerox' else 1.15))
                if intro:
                    img=opening(key,t,on,frames/FPS,p)
                elif moving:
                    kind='mapping' if key in MAPPING else 'forms'
                    src=(MAPPING if kind=='mapping' else PAIR)[key]
                    art=motion_art(kind,src,t,frames/FPS,p,work)
                    x=(w-art.width)//2
                    y=(1000 if p else 598)-art.height//2
                    if progress<1 and previous_part!=part:
                        cur.items['exhibit']=Item(art.convert('RGBA'),x/1.5,y/1.5,reveal=True)
                        img=render_frame(prev,cur,p,progress)
                    else:
                        img=base.copy()
                        img.paste(art,(x,y))
                    if frame==frames-1:
                        cur.items['exhibit']=Item(art.convert('RGBA'),x/1.5,y/1.5,reveal=True)
                elif still is not None:
                    img=still
                else:
                    img=render_frame(prev,cur,p,progress)
                    if progress==1:still=img
                enc.stdin.write(img.tobytes())
            prev=threshold_layout(p) if key=='archive' else cur
            previous_part=part
            print(('short' if p else 'long'),key,flush=True)
    finally:enc.stdin.close()
    if enc.wait():raise RuntimeError('Picture encoder failed')

def mux_master(folder,master):
    mux=['ffmpeg','-v','error','-y','-i',str(folder/'picture.mp4'),'-i',str(folder/'mix.m4a'),'-i',str(folder/'chapters.ffmeta')]
    for lang in ('ko','en','ja','zh-Hans'):mux+=['-i',str(folder/f'{lang}.srt')]
    mux+=['-map','0:v','-map','1:a','-map_metadata','2','-map_chapters','2','-metadata:s:a:0','language=kor']
    for i,lang in enumerate(('kor','eng','jpn','zho')):
        mux+=['-map',f'{3+i}:s',f'-metadata:s:s:{i}',f'language={lang}',f'-disposition:s:{i}','default' if i==0 else '0']
    run(mux+['-c:v','copy','-c:a','copy','-c:s','mov_text','-movie_timescale','1000','-movflags','+faststart',str(master)])

def deliver(p,work):
    label='short' if p else 'long';folder=work/label;folder.mkdir()
    rows=sequence(SHORT if p else LONG,folder,p)
    pictures(rows,p,work,folder)
    master=folder/f'unicode-chronology-{label}.mp4'
    mux_master(folder,master)
    # A Korean viewing copy renders captions into the lower paper margin.
    style='FontName=Apple SD Gothic Neo,FontSize='+('13' if p else '14')+',PrimaryColour=&H00252A27,OutlineColour=&H00F8F8F7,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,MarginL=18,MarginR=18,MarginV='+('43' if p else '14')
    ko=folder/f'unicode-chronology-{label}-ko.mp4'
    run(['/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg','-v','error','-y','-i',str(master),'-map','0:v:0','-map','0:a:0','-vf',f"subtitles='{folder}/ko.srt':force_style='{style}'",'-c:v','h264_videotoolbox','-b:v','10M','-c:a','copy','-movie_timescale','1000','-movflags','+faststart',str(ko)])
    (folder/'timing.json').write_text(json.dumps(rows))
    if not p:
        run(['ffmpeg','-v','error','-y','-i',str(folder/'sanjo.wav'),'-c:a','aac','-b:a','192k',str(OUT/'unicode-tungso-sanjo.m4a')])
    master.replace(OUT/master.name)
    ko.replace(OUT/ko.name)
    print(OUT/master.name,flush=True)

if __name__=='__main__':
    run([str(ROOT.parents[1]/'node_modules/.bin/tsx'),str(ROOT.parents[1]/'scripts/lint-korean.ts')])
    run([str(ROOT.parents[1]/'node_modules/.bin/tsx'),str(ROOT/'voice.ts'),'--check'])
    work=Path(sys.argv[1]);work.mkdir(exist_ok=True);OUT.mkdir(exist_ok=True)
    for kind in ('mapping','forms'):
        target=work/kind;target.mkdir(exist_ok=True)
        run(['ffmpeg','-v','error','-y','-i',str(ROOT/'motion'/f'{kind}.mp4'),'-vf','crop=1120:432:80:153','-q:v','2','-start_number','0',str(target/'%04d.jpg')])
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(2) as pool:
        list(pool.map(lambda p:deliver(p,work),[False,True]))
