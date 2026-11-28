"""Render an illustrative Go review and the historical Swift value example."""
from pathlib import Path
from functools import lru_cache
import json, math, random, subprocess, sys, wave
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
EP=HERE.parents[1]
TMP=Path(sys.argv[1])
OUT=EP/'out/style-studies/SE-0003-baduk-review.mp4'
FPS=24
rows=json.loads((TMP/'lines.json').read_text())

def mix():
    import numpy as np
    items=json.loads((TMP/'aligned.json').read_text())['items']
    sound=bytearray(bytes(19200)); cues=[]
    for (caption,reading),row in zip(rows,items,strict=True):
        with wave.open(row['wavPath']) as f:
            rate=f.getframerate(); assert rate==24000
            x=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(float)
        chars=[(c,s) for s in row['alignedItems'] for c in s['text'] if c.isalnum()]
        expected=''.join(c for c in reading if c.isalnum())
        assert ''.join(c for c,_ in chars)==expected+'잠시쉬어볼까요'
        last=chars[len(expected)-1][1];mid=(last['endSec']+chars[len(expected)][1]['startSec'])/2
        rms=np.sqrt(np.mean(x[:len(x)//240*240].reshape(-1,240)**2,axis=1))
        gap=min(range(max(0,int((mid-.19)*100)),min(len(rms)-4,int((mid+.19)*100))+1),key=lambda k:rms[k:k+4].mean()+abs(k/100-mid)*80)
        active=np.flatnonzero(rms[:gap+1]>max(36,rms[:gap+1].max()*.023))
        a=max(0,(active[0]-5)*240);b=min((gap+2)*240,(active[-1]+8)*240)
        gain=1+.75*np.clip((np.arange(b)/rate-max(last['startSec']-.04,active[-1]/100-.30))/.1,0,1)
        clip=(x*1.)[a:b]*gain[a:b];clip[-240:]*=np.linspace(1,0,240)
        start=len(sound)/48000;sound.extend(clip.clip(-32768,32767).astype('<i2').tobytes());cues.append((start,len(sound)/48000,caption))
        sound.extend(bytes(round((.90 if len(cues) in (2,6,9) else .57)*rate)*2))
    frames=math.ceil((len(sound)/48000)*FPS);sound.extend(bytes(frames*2000-len(sound)))
    with wave.open(str(TMP/'voice.wav'),'wb') as f:f.setparams((1,2,rate,0,'NONE',''));f.writeframes(sound)
    return cues,frames

@lru_cache(None)
def face(kind,size):
    n={'kr':'/System/Library/Fonts/AppleSDGothicNeo.ttc','mono':'/System/Library/Fonts/Supplemental/Courier New Bold.ttf','serif':'/System/Library/Fonts/Supplemental/Georgia.ttf'}
    return ImageFont.truetype(n[kind],size)
def txt(d,x,y,s,size,col,kind='kr',anchor='lm'):
    d.text((x,y),s,font=face(kind,size),fill=col,anchor=anchor)
def e(t):t=max(0,min(1,t));return t*t*(3-2*t)
cream='#f0e5cd';muted='#c6b99c';ink='#222921';rust='#af502f'
# Legal illustrative position on a nine-line board. White C5 and E5 can connect at D5.
setup=[(1,4,0),(2,4,1),(2,5,0),(4,4,1),(5,5,0),(4,6,1),(6,2,0),(5,2,1),(1,7,0),(6,6,1)]
played=(2,3);alternate=(3,4)
bg=Image.new('RGB',(1280,720),'#202a26');bgd=ImageDraw.Draw(bg);rng=random.Random(179)
for i in range(33000):
    x=rng.randrange(1280);y=rng.randrange(720);bgd.point((x,y),fill=rng.choice(['#242d28','#26312b','#1f2824']))
@lru_cache(None)
def slab(side,paper):
    im=Image.new('RGB',(side,side),'#dfc491' if not paper else '#e8dfca');d=ImageDraw.Draw(im);r=random.Random(side)
    if not paper:
        for j in range(side*2):
            x=r.uniform(0,side);p=r.uniform(0,6);col=r.choice(['#dfc18d','#ddbe89','#e3c795','#e2c491'])
            d.line([(x+2*math.sin(y*.016+p),y) for y in range(0,side+8,8)],fill=col)
    pad=side*.102;step=(side-2*pad)/8
    for i in range(9):
        v=pad+i*step
        d.line((v,pad,v,side-pad),fill='#716148',width=1);d.line((pad,v,side-pad,v),fill='#716148',width=1)
    for a,b in [(2,2),(6,2),(4,4),(2,6),(6,6)]:
        x=pad+a*step;y=pad+b*step;d.ellipse((x-2,y-2,x+2,y+2),fill=ink)
    return im,pad,step
def board(im,x,y,side,stones,last=None,paper=False,dropping=1,bridge=0):
    plate,pad,step=slab(side,paper);d=ImageDraw.Draw(im)
    d.rectangle((x+4,y+6,x+side+4,y+side+6),fill='#17201a');im.paste(plate,(x,y))
    for a,b,white in stones+([(*last,1)] if last is not None else []):
        active=(a,b)==last;cx=x+pad+a*step;cy=y+pad+b*step-(13*(1-dropping) if active else 0);r=step*.444
        if not paper:d.ellipse((cx-r+2,cy-r+4,cx+r+2,cy+r+4),fill='#856e4d')
        d.ellipse((cx-r,cy-r,cx+r,cy+r),fill='#f6f0dd' if white else '#282d28',outline='#4a4439',width=1)
        if not paper:d.arc((cx-r+2,cy-r+2,cx+r-3,cy+r-2),208,301,fill='#fff9eb' if white else '#696c5e',width=2)
        if active:d.ellipse((cx-r*.29,cy-r*.29,cx+r*.29,cy+r*.29),outline=rust,width=2)
    if bridge:
        cy=y+pad+4*step
        d.line((x+pad+2*step,cy,x+pad+(2+2*bridge)*step,cy),fill=rust,width=3)
def render():
    cues,frames=mix();summary=json.loads((EP/'script.json').read_text())['scenes'][1]['code']['code'].splitlines()+['print(x)']
    cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','pipe:0','-i',str(TMP/'voice.wav'),'-stream_loop','-1','-i',str(EP.parent.parent/'assets/music/evening-keys.m4a'),'-filter_complex',f'[1:a]highpass=f=65,loudnorm=I=-17:TP=-2:LRA=8[v];[2:a]volume=0.22,afade=t=in:d=1.4,afade=t=out:st={frames/FPS-2}:d=2[m];[v][m]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.88[a]','-map','0:v','-map','[a]','-t',str(frames/FPS),'-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(OUT)]
    with subprocess.Popen(cmd,stdin=subprocess.PIPE) as p:
        for n in range(frames):
            t=n/FPS;i=max((i for i,c in enumerate(cues) if c[0]<=t),default=0);a,b,cap=cues[i];u=e((t-a)/.48)
            im=bg.copy();d=ImageDraw.Draw(im);txt(d,48,42,'SE–0003   /   Swift 2',20,muted,'mono')
            txt(d,1228,42,'복기  ·  설명용 가상 대국',22,muted,anchor='rm');d.line((48,73,1232,73),fill='#5e675a')
            if i<2:
                board(im,105,113,456,setup,played if i else None,dropping=u)
                txt(d,634,198,'실전',23,'#e9ad83');txt(d,634,276,'마음에 남은 한 수',55,cream)
                txt(d,638,370,'백돌 한 점이' if not i else '위로 한 칸',38,muted)
                txt(d,638,423,'흑돌 사이에 놓였습니다.' if not i else '달아났습니다.',38,muted)
            elif i<6:
                txt(d,97,124,'기보에 남은 수',34,cream);txt(d,680,124,'다시 놓아 본 수',34,cream)
                board(im,101,170,401,setup,played,paper=True)
                stones=setup[:int(len(setup)*e((t-a)/1.2))] if i==2 else setup
                board(im,680,170,401,stones,alternate if i>=3 else None,dropping=u if i==3 else 1,bridge=u if i==4 else 0)
                txt(d,525,370,'실전',18,muted);txt(d,596,370,'복기',18,muted)
            else:
                txt(d,66,122,'함수 안에서만 바뀌는 값',40,cream)
                for j,line in enumerate(summary):
                    yy=204+j*59
                    if (i==7 and j==(4 if t-a<(b-a)*.48 else 1)) or (i==8 and j==5):
                        d.rounded_rectangle((62,yy-24,697,yy+27),radius=5,fill='#40483c')
                        d.rectangle((62,yy-24,67,yy+27),fill='#e9a274')
                    txt(d,91,yy,line,31,'#f0ba8e' if j in (0,1) else cream,'mono')
                txt(d,785,226,'호출한 곳',25,muted);txt(d,784,295,'x = 1',47,cream,'mono')
                if i>=7:
                    txt(d,785,382,'함수 안',25,muted)
                    txt(d,784,449,'i = 2' if (i>7 or t-a>(b-a)*.48) else 'i = 1',47,'#f0ba8e','mono')
                if i==8:txt(d,787,535,'출력  1',32,cream)
            d.line((48,610,1232,610),fill='#5e675a')
            if a<=t<=b:txt(d,640,660,cap,31,cream,anchor='mm')
            p.stdin.write(im.tobytes())
        p.stdin.close()
        if p.wait():raise RuntimeError('video encode failed')
    (TMP/'cues.json').write_text(json.dumps(cues,ensure_ascii=False))
    print(OUT,frames/FPS)
if __name__=='__main__':render()
