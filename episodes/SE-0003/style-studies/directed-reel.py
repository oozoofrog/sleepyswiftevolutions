"""Render the forty authored interpretations as one chaptered comparison."""
from concurrent.futures import ProcessPoolExecutor
from functools import lru_cache
from pathlib import Path
import json
import os
import subprocess
import tempfile
from PIL import Image, ImageDraw
import atlas_first
import atlas_middle
import atlas_last

EP = Path(__file__).resolve().parents[1]
OUT = EP / "out/style-studies/SE-0003-metaphors-40.mp4"
M = json.loads((EP/"audio/long/manifest.json").read_text())["scenes"][1]
S = json.loads((EP/"script.json").read_text())["scenes"][1]
SOURCE = S["code"]["code"].splitlines()+["print(x)"]
SCORE = json.loads(Path(__file__).with_name("metaphor-timing.json").read_text())
TITLES = [s["title"] for s in SCORE]
font = atlas_first.font
FPS = 24
FRAMES = 312

@lru_cache(None)
def source_card():
    card=Image.new("RGB",(513,443),"#242b2a")
    d=ImageDraw.Draw(card)
    d.text((35,40),"Swift 2  ·  당시 문법",font=font("k",24),fill="#d9cca8")
    for i,line in enumerate(SOURCE):
        d.text((35,99+i*43),line,font=font("m",26),fill="#ecb98d" if i in (1,5) else "#e8eadf")
    d.text((35,381),"함수 안의 i는 2, 바깥의 x는 1",font=font("k",25),fill="#b8d7cb")
    return card

def render(args):
    i,work=args
    fn=atlas_first.draw if i<=14 else atlas_middle.draw if i<=26 else atlas_last.draw
    target=work/f'{i:02}.mp4'
    cmd=['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size','960x540','-framerate',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',str(target)]
    with subprocess.Popen(cmd,stdin=subprocess.PIPE) as process:
        row=SCORE[i-1]
        for n in range(row["frames"]):
            t=n/FPS
            im=Image.new('RGB',(960,540),'#222624')
            second=row["second"]; turn=min(row["end"]-.25,second+max(.8,(row["end"]-second)*.55))
            if t < second: beat=3.51*t/max(.01,second)
            elif t < turn: beat=3.51+2.27*(t-second)/max(.01,turn-second)
            else: beat=5.78+min(4.5,(t-turn)*1.6)
            fn(im,i,beat)
            if t>=row["recap"]:
                u=atlas_first.ease((t-row["recap"])/.35)
                width=int(513*u)
                if width:
                    # Frame the artwork alongside the shared source at the close.
                    art=im.crop((0,39,960,482))
                    height=round(443*(960-width)/960)
                    im.paste("#202523",(width,39,960,482))
                    im.paste(art.resize((960-width,height),Image.Resampling.BILINEAR),
                             (width,39+(443-height)//2))
                    im.paste(source_card().crop((513-width,0,513,443)),(0,39))
            d=ImageDraw.Draw(im)
            d.rectangle((0,0,959,38),fill="#212522")
            d.text((26,19),f"{i:02d} / 40",font=font('m',19),anchor="lm",fill="#edb58c")
            d.text((149,19),TITLES[i-1],font=font('k',22),anchor="lm",fill="#f8eee0")
            d.text((934,19),"SE–0003  /  Swift 2",font=font('m',16),anchor="rm",fill="#c9c6b9")
            d.rectangle((0,482,959,539),fill="#212522")
            if .25<=t<row['end']+.12:
                line=row['lines'][int(t>=second)]
                size=25 if len(line)<38 else 22
                d.text((480,508),line,font=font('k',size),anchor='mm',fill='#f7f0e6')
            if n==int(turn*FPS)+4: im.resize((288,162),Image.Resampling.LANCZOS).save(work/f'{i:02}.jpg')
            process.stdin.write(im.tobytes())
        process.stdin.close()
        if process.wait():raise RuntimeError(target)
    return target

if __name__=='__main__':
    OUT.parent.mkdir(exist_ok=True,parents=True)
    with tempfile.TemporaryDirectory(dir='/Volumes/eyedisk/tmp') as tmp:
        work=Path(tmp)
        with ProcessPoolExecutor(max_workers=4) as workers:
            clips=list(workers.map(render,[(i,work) for i in range(1,41)]))
        (work/'files').write_text(''.join(f"file '{p.name}'\n" for p in clips))
        chapters=[';FFMETADATA1'];start=0
        for i,row in enumerate(SCORE):
            finish=start+row['frames']
            chapters.extend(['[CHAPTER]','TIMEBASE=1/24',f'START={start}',f'END={finish}',f'title={i+1:02} · {row["title"]}'])
            start=finish
        (work/'chapters').write_text('\n'.join(chapters)+'\n')
        subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','1','-i',str(work/'files'),'-i',str(EP/'audio/style-studies/metaphor-score.m4a'),'-i',str(work/'chapters'),'-map','0:v','-map','1:a','-map_chapters','2','-c','copy','-movflags','+faststart',str(OUT)],check=True)
        sheet=Image.new('RGB',(1440,1296))
        for k in range(40):sheet.paste(Image.open(work/f'{k+1:02}.jpg'),(288*(k%5),162*(k//5)))
        sheet.save('/Volumes/eyedisk/tmp/se3-directed-sheet.jpg')
