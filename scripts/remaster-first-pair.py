"""Rebuild selected code scenes over the first-edition picture and original sound."""
from pathlib import Path
from functools import lru_cache
import json, math, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

@lru_cache(None)
def face(size, mono):
    path = '/System/Library/Fonts/' + ('Menlo.ttc' if mono else 'AppleSDGothicNeo.ttc')
    return ImageFont.truetype(path, size)

def ease(t):
    t=min(1,max(0,t))
    return t*t*(3-2*t)

def paint(ep, short, scene, t):
    w,h=(720,1280) if short else (1280,720)
    paper,ink,orange='#202926','#eee8d9','#ffad80'
    im=Image.new('RGB',(w,h),paper)
    d=ImageDraw.Draw(im)
    def txt(x,y,s,size=32,color=ink,mono=False):
        d.text((x,y),s,anchor='lt',font=face(size,mono),fill=color)
    x=48; top=330 if short else 190
    txt(x,90 if short else 54,f'SE-000{ep}    /    Swift '+('2.2' if ep==1 else '2'),26,orange,True)
    txt(x,top-70,('어떤 두 글자가 빠질까요?' if scene['sceneId'] in ('01-intro','s01-hook') else '백틱이 사라졌다') if ep==1 else '두 번째 괄호가 함수 선언에서 사라졌다',33 if short else 45)
    cues=scene['cues'];times=[c['startSec']-scene['startSec'] for c in cues]
    now=t-scene['startSec']
    if ep==1:
        intro=scene['sceneId'] in ('01-intro','s01-hook')
        drop=times[2] if intro or not short else times[-1]
        f=ease((now-drop)/.45)
        size=36 if short else 60
        cw=d.textlength('M',font=face(size,True))
        y=top+80
        if not intro and not short:
            size=32
            cw=d.textlength('M',font=face(size,True))
            txt(x,y-65,'기존 호출',24,orange)
            txt(650,y-65,'Swift 2.2에서 허용된 호출',24,orange)
            d.text((650,y+size),'indexOf(value, in: list)',anchor='ls',font=face(size,True),fill=ink)
            f=0
        source='indexOf(value, `in`: list)'
        for j,c in enumerate(source):
            mark=c=='`'
            removed=source[:j].count('`')
            if mark and f>=1:continue
            xx=x+(j-removed*f)*cw
            baseline=y+size-(55*f if mark else 0)
            highlight=mark and (not intro or now>=times[1])
            d.text((xx,baseline),c,anchor='ls',font=face(size,True),fill=orange if highlight else ink)
        d.line((x,y+size+12,x+cw*(len(source)-2*f),y+size+12),fill='#666f62',width=2)
    else:
        intro=scene['sceneId']=='01-hook'
        assign=times[-2] if intro else times[0]
        result=times[-1] if intro else times[1]
        txt(x,top+35,'func add(x: Int)(y: Int)',37 if short else 62,ink,True)
        y=top+155
        if now>=assign:
            f=ease((now-assign)/.55)
            txt(x+int(44*(1-f)),y,'let addTwo = add(2)',39 if short else 53,orange,True)
        if now>=result:
            f=ease((now-result)/.52)
            txt(x,y+95,'addTwo(3)',42 if short else 55,ink,True)
            if f>.65:txt(x+(270 if short else 350),y+95,'→  5',50,orange,True)
    caption=next((c['text'] for c in cues if c['startSec']<=t<=c['endSec']),'')
    lines=['']
    for word in caption.split():
        cand=(lines[-1]+' '+word).strip()
        if d.textlength(cand,font=face(30,False))>w-110:lines.append(word)
        else:lines[-1]=cand
    for k,line in enumerate(lines):
        d.text((w/2,h-(242 if short else 92)+k*42),line,anchor='mt',font=face(30,False),fill=ink)
    return im

def build(ep,short,tmp):
    tag=f'SE-000{ep}';root=Path('episodes')/tag;fmt='short' if short else 'long'
    scenes=json.loads((root/'audio'/fmt/'manifest.json').read_text())['scenes']
    ratio='9x16' if short else '16x9'
    base=root/'out'/f'{tag}-{ratio}.mp4'
    name=base.with_stem(base.stem+('-motion-v2' if ep==1 else '-motion'))
    original = base.parent/'first-edition'/base.name
    inputs=['-i',str(original if original.exists() else base)];filters=[];last='0:v'
    for scene in scenes:
        if scene['sceneId'] not in ('01-intro','s01-hook','03-compare','s02-compare','01-hook','05-result'):continue
        clip=tmp/(scene['sceneId']+'.mp4')
        w,h=(720,1280) if short else (1280,720)
        with subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r','30','-i','-','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',str(clip)],stdin=subprocess.PIPE) as p:
            for n in range(round((scene['endSec']-scene['startSec'])*30)):
                p.stdin.write(paint(ep,short,scene,scene['startSec']+n/30).tobytes())
            p.stdin.close()
            if p.wait():raise RuntimeError(clip)
        i=len(inputs)//2; inputs+=['-i',str(clip)]
        filters.extend([f'[{i}:v]scale={w*3//2}:{h*3//2},setpts=PTS+{scene["startSec"]}/TB[c{i}]',f'[{last}][c{i}]overlay=eof_action=pass[v{i}]'])
        last=f'v{i}'
    subprocess.run(['ffmpeg','-loglevel','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map',f'[{last}]','-map','0:a','-c:a','copy','-c:v','h264_videotoolbox','-b:v','7M','-movflags','+faststart',str(name)],check=True)
if __name__=='__main__':
    with tempfile.TemporaryDirectory() as tmp:
        for ep in (1,2):
            for short in (False,True):build(ep,short,Path(tmp))
