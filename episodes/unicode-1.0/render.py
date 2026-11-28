from pathlib import Path
import subprocess as sp, json, math, sys, hashlib, wave
from tempfile import TemporaryDirectory
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from draw import ROOT, TEXT, LONG, layout, render_frame, font, px

FPS=24
RATE=48000
OUT=ROOT/'out'
MUSIC=ROOT.parent.parent/'assets/music/quiet-pulse.m4a'
SHORT=['open','tables','korea','unified','return','pair','lower','taiwan','keep','end']
def run(args):sp.run(args,check=True)
def srt_time(sec):
    ms=round(sec*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
def write_audio(path,data):
    with wave.open(str(path),'wb') as f:
        f.setparams((1,2,RATE,0,'NONE',''));f.writeframes(data.tobytes())
def edition(short,work):
    keys=SHORT if short else LONG; label='short' if short else 'long';w,h=(1080,1920) if short else (1920,1080)
    man={s['key']:s for s in json.loads((ROOT/'audio/manifest.json').read_text())}
    samples=[]; cues=[]; records=[]; now=0
    for idx,key in enumerate(keys):
        src=ROOT/'audio/long'/(key+'.mp3')
        assert man[key]['digest']
        audio=np.frombuffer(sp.check_output(['ffmpeg','-v','error','-i',str(src),'-ar',str(RATE),'-ac','1','-f','s16le','-']),dtype='<i2')
        blocks=audio[:len(audio)//480*480].astype(float).reshape(-1,480)
        env=np.sqrt((blocks*blocks).mean(axis=1))
        active=np.where(np.convolve((env>max(50,env.max()*.012)).astype(int),[1,1,1],mode='same')>=2)[0]
        onset=active[0]*.01;end=(active[-1]+1)*.01
        pre=.72 if idx==0 else .28
        last=idx==len(keys)-1
        tail=1.15 if last else (.55 if key in ('question','apple','cost','keep','review','reason') else .29)
        nframes=math.ceil((pre+len(audio)/RATE+tail)*FPS)
        lead=round(RATE*pre);length=nframes*RATE//FPS
        samples.extend([np.zeros(lead,'<i2'),audio,np.zeros(length-lead-len(audio),'<i2')])
        cues.append((now/FPS+pre+onset,now/FPS+pre+end,key))
        records.append((key,nframes,pre+onset))
        now+=nframes
    write_audio(work/f'{label}.wav',np.concatenate(samples))
    subdir=ROOT/'audio'/label;subdir.mkdir(exist_ok=True)
    for lang in ('ko','en','ja','zh-Hans'):
        srt='\n\n'.join(f'{i+1}\n{srt_time(a)} --> {srt_time(b)}\n{TEXT[k][lang]}' for i,(a,b,k) in enumerate(cues))
        (subdir/f'{lang}.srt').write_text(srt+'\n')
    (subdir/'timeline.json').write_text(json.dumps([dict(key=k,frameCount=n,voiceOnset=s) for k,n,s in records],indent=2))
    # The score ducks under narration; one low kick pulse remains audible in the room tone.
    mixed=work/f'{label}.m4a'
    run(['ffmpeg','-v','error','-y','-i',str(work/f'{label}.wav'),'-stream_loop','-1','-i',str(MUSIC),
         '-filter_complex',f'[0:a]pan=stereo|c0=c0|c1=c0[v];[1:a]volume=0.19,afade=t=in:d=1.6,afade=t=out:st={now/FPS-2.0}:d=2[m];[m][v]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.92[a]',
         '-map','[a]','-t',str(now/FPS),'-c:a','aac','-b:a','192k',str(mixed)])
    silent=work/f'{label}-picture.mp4'
    enc=sp.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(FPS),'-i','-',
                  '-c:v','h264_videotoolbox','-b:v','8M' if not short else '7M','-pix_fmt','yuv420p','-threads','2',str(silent)],stdin=sp.PIPE)
    prev=None
    try:
        for key,count,onset in records:
            current=layout(key,short,short)
            cached=None
            for n in range(count):
                # The comparison underline arrives only after its spoken reference starts.
                duration=1.75 if key in ('china','empty','proposal','second','return') else 1.12
                transition=max(0,(n/FPS-(onset if key in ('china','japan','korea','lower','return') else 0))/duration)
                if transition<1 or cached is None:
                    raw=render_frame(prev,current,short,min(1,transition)).tobytes()
                    if transition>=1:cached=raw
                else:raw=cached
                enc.stdin.write(raw)
            prev=current
    finally:enc.stdin.close()
    if enc.wait():raise RuntimeError('Video encoder failed')
    master=OUT/f'unicode-1.0-{label}-v1.mp4'
    args=['ffmpeg','-v','error','-y','-i',str(silent),'-i',str(mixed)]
    for lang in ('ko','en','ja','zh-Hans'):args+=['-i',str(subdir/f'{lang}.srt')]
    args+=['-map','0:v','-map','1:a']
    for i,lang in enumerate(['kor','eng','jpn','zho']):args+=['-map',f'{2+i}:s','-metadata:s:s:'+str(i),'language='+lang,'-disposition:s:'+str(i),'default' if i==0 else '0']
    args+=['-c:v','copy','-c:a','copy','-c:s','mov_text','-metadata:s:a:0','language=kor','-movflags','+faststart',str(master)]
    run(args)
    # Keep a Korean open-caption review print for players with no subtitle selector.
    ff='/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg'
    margin=315 if short else 73
    style=f'FontName=Apple SD Gothic Neo,FontSize={12 if short else 16},Bold=1,PrimaryColour=&H00F6F2E9,BackColour=&H321C211E,OutlineColour=&H321C211E,BorderStyle=3,Outline=3,Shadow=0,MarginV={round(margin*288/h)},MarginL=16,MarginR=16'
    ko=OUT/f'unicode-1.0-{label}-ko-v1.mp4'
    run([ff,'-v','error','-y','-i',str(master),'-map','0:v','-map','0:a','-vf',f"subtitles='{subdir}/ko.srt':original_size={w}x{h}:force_style='{style}'",'-c:v','h264_videotoolbox','-b:v','7M','-c:a','copy','-movflags','+faststart',str(ko)])
    print(label,now/FPS,'seconds',len(cues),'cues',flush=True)
if __name__=='__main__':
    OUT.mkdir(exist_ok=True)
    with TemporaryDirectory(dir='/Volumes/eyedisk/tmp',prefix='unicode-export-') as t:
        with ThreadPoolExecutor(2) as pool:
            list(pool.map(lambda portrait:edition(portrait,Path(t)),[False,True]))
