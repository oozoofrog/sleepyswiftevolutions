"""Render four treatments of the same historical Swift excerpt and voice take."""
import math
import json
import re
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

EP = Path(__file__).resolve().parents[2]
AUDIO = EP / "audio"
OUT = EP / "out/style-studies/SE-0003-code-motion.mp4"
SCENE = json.loads((AUDIO / "long/manifest.json").read_text())["scenes"][1]
CODE = json.loads((EP / "script.json").read_text())["scenes"][0]["code"]["code"].splitlines()
FPS, SECONDS = 24, 14
NAMES = ["01   활판 편집", "02   디버거", "03   동적 타이포그래피", "04   실행 시간표"]
PALETTES = [
    ("#f1e8d7", "#25251e", "#9f3824", "#726348"),
    ("#192627", "#e4eeee", "#ffad76", "#8dbbad"),
    ("#242139", "#f2e9eb", "#ffac86", "#c6b6d7"),
    ("#e3eae8", "#193231", "#a33920", "#4a6f76"),
]
CUES = [(round(c["startSec"]-SCENE["startSec"],2),round(c["endSec"]-SCENE["startSec"],2)) for c in SCENE["cues"]]
FONTS = {
    "ko": "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "mono": "/System/Library/Fonts/Menlo.ttc",
    "serif": "/System/Library/Fonts/Supplemental/Georgia.ttf",
}
@lru_cache(None)
def font(key, size):
    return ImageFont.truetype(FONTS[key], size)

def frame(style, t):
    bg, ink, accent, dim = PALETTES[style]
    img = Image.new("RGB", (1280,720),bg)
    d = ImageDraw.Draw(img)
    def label(x,y,value,size=24,color=ink,face="ko"):
        d.text((x,y),value,font=font(face,size),fill=color,anchor="lt")
    def rule(x,y,x2,y2,color=dim,width=1):
        d.line((x,y,x2,y2),fill=color,width=width)
    def code(x,y,size,leading):
        for j,line in enumerate(CODE):
            offset=x
            if j==line_index:
                rule(x-18,y+j*leading-2,x-18,y+j*leading+size+3,accent,4)
            for token in re.findall(r'\s+|\w+|[^\s\w]',line):
                color=accent if token in ("func","var","1","2") else dim if token=="Int" else ink
                label(offset,y+j*leading,token,size,color,"mono")
                offset+=d.textlength(token,font=font("mono",size))
    stage=sum(t>=s for s,_ in CUES[1:])
    read_output = CUES[1][1]
    line_index = 3 if t < 1.55 else 4
    if t >= CUES[1][0]:
        line_index = 1
    if t >= read_output:
        line_index = 5
    if CUES[3][0] <= t < CUES[3][1]:
        line_index = 0
    label(60,40,NAMES[style],27)
    label(924,43,"SE-0003   /   Swift 2",22,dim,"mono")
    rule(60,86,1220,86)
    def ease(start, duration):
        u = max(0, min(1, (t-start)/duration))
        return u*u*(3-2*u)

    call, assign, reveal, explain = (cue[0] for cue in CUES)
    if style == 0:
        code(105,172,35,56)
        rule(755,125,755,573)
        label(800,150,["호출 인자","함수 안","출력","출력"][stage],27,dim)
        # A fixed aperture lets the incoming type push its predecessor off the page.
        entry = (call, assign, reveal, reveal)[stage]
        progress = ease(entry, .48)
        aperture = Image.new("RGB",(375,225),bg)
        types = ImageDraw.Draw(aperture)
        previous, current = [("", "1"),("1","2"),("2","1"),("2","1")][stage]
        for value, y in [(previous,-225*progress),(current,225*(1-progress))]:
            types.text((4,y),value,font=font("serif",235),fill=accent,anchor="lt")
        img.paste(aperture,(800,208))
        rule(800,445,800+340*progress,445,accent,2)
        label(812,488,["setTwo(x)","i = 2","print(x)","print(x)"][stage],29,ink,"mono")
    elif style == 1:
        code(92,174,29,53)
        rule(602,116,602,570)
        label(655,134,"호출한 곳",26,dim)
        label(655,186,"x = 1",55,ink,"mono")
        if t >= call:
            f = ease(call,.95)
            # Carry a duplicate along a curved path. The caller stays in place.
            x = 791+136*math.sin(math.pi*f)
            y = 199+177*f
            if f < 1:
                label(x,y,"1",42,accent,"mono")
            label(655,315,"함수 안",26,dim)
            if f >= 1:
                label(655,370,"i =",55,ink,"mono")
                label(790,370,"2" if t>=assign else "1",55,accent,"mono")
                if assign <= t < assign+.7:
                    r=33+23*ease(assign,.7)
                    d.arc((807-r,390-r,807+r,390+r),-95,240,fill=accent,width=3)
        if t >= read_output:
            f=ease(read_output,reveal-read_output)
            rule(655,265,655+190*f,265,accent,3)
        if t >= reveal:
            label(655,500,"print(x)  →  1",36,ink,"mono")
    elif style == 2:
        code(810,174,23,48)
        rule(760,124,760,567)
        entry = (call,assign,reveal,reveal)[stage]
        formula = ["x = 1","i = 2","1","1"][stage]
        size = 124 if stage < 2 else 192
        for j,char in enumerate(formula):
            f=ease(entry+j*.065,.48)
            if f:
                label(75+j*78,220+(1-f)*100,char,round(size*(.70+.30*f)),accent,"mono")
        label(86,484,["호출한 곳의 값","함수 안에서 대입","print(x)의 출력","print(x)의 출력"][stage],34)
    else:
        code(85,124,24,38)
        label(790,158,"두 변수의 실행 기록",36)
        label(790,227,["호출","대입","출력","지역 복사본"][stage],27,dim)
        label(78,425,"x",29,ink,"mono")
        label(78,520,"i",29,ink,"mono")
        def trace(x1,y1,x2,y2,start,end,color):
            f=ease(start,end-start)
            if f:
                rule(x1,y1,x1+(x2-x1)*f,y1+(y2-y1)*f,color,5)
        trace(135,442,445,442,0,call+.7,dim)
        trace(310,442,445,537,call,call+.7,accent)
        trace(445,537,720,537,call+.7,assign,accent)
        trace(445,442,1110,442,call+.7,reveal,dim)
        trace(720,537,900,537,assign,read_output,accent)
        label(152,395,"1",34,ink,"mono")
        if t>=call+.7: label(450,545,"1",31,ink,"mono")
        if t>=assign: label(715,545,"2",31,accent,"mono")
        if t>=read_output: rule(900,527,900,547,accent,3)
        if t>=reveal:label(1002,387,"출력  1",34,ink)
    return img

def timestamp(sec):
    ms=round(sec*1000)
    return f"00:{ms//60000:02}:{ms//1000%60:02},{ms%1000:03}"

def render(tmp):
    dst=Path(tmp)
    inputs=[]
    for suffix,tag in [("", "kor"),(".en","eng"),(".ja","jpn"),(".zh-Hans","zho")]:
        blocks=(AUDIO/f"long/subtitles{suffix}.srt").read_text().strip().split("\n\n")[3:7]
        srt=dst/f"{tag}.srt"
        cues=[]
        for k in range(4):
            for (start,end),block in zip(CUES,blocks,strict=True):
                cues.append(f"{len(cues)+1}\n{timestamp(k*SECONDS+start)} --> {timestamp(k*SECONDS+end)}\n"+'\n'.join(block.splitlines()[2:]))
        srt.write_text('\n\n'.join(cues)+'\n')
        inputs+=['-i',str(srt)]
    meta=[]
    for k,tag in enumerate(["kor","eng","jpn","zho"]):
        meta+=['-map',f'{3+k}:s',f'-metadata:s:s:{k}',f'language={tag}',f'-disposition:s:{k}','default' if k==0 else '0']
    filt='[1:a]adelay=400:all=1,apad,atrim=duration=14,aresample=48000,aloop=loop=3:size=672000[v];[2:a]volume=0.19,afade=t=in:d=1,afade=t=out:st=54:d=2[m];[v][m]amix=inputs=2:duration=first:normalize=0[a]'
    cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r',str(FPS),'-i','pipe:0','-i',str(AUDIO/'long/approved-vowel/02-copy.soft.m4a'),'-stream_loop','-1','-i',str(AUDIO/'evening-keys.m4a'),*inputs,'-filter_complex',filt,'-map','0:v','-map','[a]',*meta,'-t','56','-c:v','libx264','-crf','17','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-c:s','mov_text','-movflags','+faststart',str(OUT)]
    with subprocess.Popen(cmd,stdin=subprocess.PIPE) as proc:
        for style in range(4):
            for n in range(SECONDS*FPS):
                proc.stdin.write(frame(style,n/FPS).tobytes())
        proc.stdin.close()
        if proc.wait():raise RuntimeError("Encoding failed")

if __name__=="__main__":
    with tempfile.TemporaryDirectory() as tmp:render(tmp)
