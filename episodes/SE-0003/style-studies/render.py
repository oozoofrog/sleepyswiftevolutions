from PIL import Image,ImageDraw,ImageFont
from functools import lru_cache
from math import sin,cos,pi
from pathlib import Path
import subprocess,random,json,sys
W,H=960,540
base=Path('episodes/SE-0003'); out=base/'out/style-studies'
out.mkdir(parents=True, exist_ok=True)
scene=json.loads((base/'audio/long/manifest.json').read_text())['scenes'][1]
def ease(t):
 t=min(1,max(0,t));return t*t*(3-2*t)
@lru_cache(None)
def font(s,f):
 path={'s':'/System/Library/Fonts/Supplemental/Didot.ttc','k':'/System/Library/Fonts/AppleSDGothicNeo.ttc','m':'/System/Library/Fonts/Courier.ttc','b':'/System/Library/Fonts/Supplemental/Arial Black.ttf'}[f]
 return ImageFont.truetype(path,s)
def tx(d,x,y,v,size,col,f='k',a='mm'): d.text((x,y),v,font=font(size,f),fill=col,anchor=a)
def ring(d,x,y,r,c,w=1): d.ellipse((x-r,y-r,x+r,y+r),outline=c,width=w)
def disc(d,x,y,r,c):d.ellipse((x-r,y-r,x+r,y+r),fill=c)
kind=sys.argv[1]; rng=random.Random(351); inside='함수 안 · i'; outside='함수 밖 · x'
if kind=='print':
 paper='#e9d7ad';ink='#232a25';red='#ab412a'
 bg=Image.new('RGB',(W,H),paper);d=ImageDraw.Draw(bg)
 d.polygon([(520,0),(960,0),(960,H),(356,H)],fill=red)
 for i in range(65000):
  x=rng.randrange(W);y=rng.randrange(H);d.point((x,y),fill=rng.choice(['#993d29','#b84830']) if x>520-164*y/H else rng.choice(['#dfcba4','#f0dfbc']))
 for y in range(74,405,8):
  for x in range(58,282,8):
   if ((x-170)/104)**2+((y-250)/148)**2<1:disc(d,x,y,1,'#a39271')
 tx(d,50,33,'SE–0003  /  SWIFT 2',17,ink,'m','lm');tx(d,907,33,'활판 인쇄',18,paper,'k','rm')
 tx(d,108,102,outside,21,ink,'k','lm');tx(d,600,102,inside,21,paper,'k','lm')
elif kind=='orbit':
 bg=Image.new('RGB',(W,H),'#111c31');d=ImageDraw.Draw(bg); gold='#eacb91';ice='#a4c9db'
 for i in range(560):
  x=rng.randrange(W);y=rng.randrange(H);disc(d,x,y,rng.choice([.5,.5,1,1.4]),rng.choice(['#445774','#637589','#8696a0']))
 for r in [112,124,143,168]:ring(d,318,256,r,'#384759')
 for r in range(0,360,3):
  a=r*pi/180;v=148 if r%15 else 156;d.line([(318+143*cos(a),256+143*sin(a)),(318+v*cos(a),256+v*sin(a))],fill='#71808c')
 d.ellipse([314,131,814,344],outline='#586675',width=1)
 tx(d,55,38,'SE–0003    /    천체도',18,ice,'k','lm')
 tx(d,318,439,outside,21,ice);tx(d,759,421,inside,21,ice)
else:
 bg=Image.new('RGB',(W,H),'#13372f');d=ImageDraw.Draw(bg)
 for i in range(11000):
  d.point((rng.randrange(W),rng.randrange(H)),fill='#1b4037')
 for x in range(22,950,18):d.line([(x,18),(x,27 if x%36==22 else 23)],fill='#769990')
 tx(d,57,61,'SE–0003    /    기계식 계수기',21,'#c7dfc5','k','lm')
 for x in [74,885]:
  for y in [106,405]:
   disc(d,x,y,6,'#87978b');d.line([(x-3,y+2),(x+3,y-2)],fill='#21382e',width=2)
def tile(d,x,y,v,scale=1,angle=0):
 # Offset registration creates a printed shadow.
 tx(d,x+4,y+4,v,round(206*scale),'#813e2d','b');tx(d,x,y,v,round(206*scale),'#f6e8c6','b')
def wheel(d,x,lab,v,progress=0):
 d.rounded_rectangle([x-114,112,x+114,389],radius=20,fill='#09261f',outline='#62816b',width=2)
 d.rounded_rectangle([x-93,130,x+93,329],radius=10,fill='#26312b',outline='#96a28f',width=2)
 face=Image.new('RGB',(178,185),'#212c27');f=ImageDraw.Draw(face)
 if progress:
  tx(f,89,88-190*progress,'1',145,'#e7d7ab','s');tx(f,89,278-190*progress,'2',145,'#f1bb77','s')
 elif v:tx(f,89,88,v,145,'#e7d7ab','s')
 im.paste(face,(x-89,138));d.line([(x-92,229),(x+92,229)],fill='#0e1c16',width=4)
 tx(d,x,357,lab,22,'#cbd7b9')
dest=out/(kind+'.mp4')
proc=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','960x540','-r','24','-i','pipe:0','-ss',str(scene['startSec']),'-i',str(base/'out/SE-0003-16x9.mp4'),'-map','0:v','-map','1:a:0','-t','13.0','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(dest)],stdin=subprocess.PIPE)
for n in range(312):
 t=n/24;copy=ease((t-.62)/1.4);change=ease((t-3.55)/.83);answer=ease((t-5.85)/.75)
 im=bg.copy();d=ImageDraw.Draw(im)
 if kind=='print':
  tx(d,218,255,'1',224,ink,'b')
  if copy:
   x=218+461*copy;y=255-63*sin(pi*copy)
   if 0<change<1:
    panel=Image.new('RGB',(248,228),red);pd=ImageDraw.Draw(panel)
    tx(pd,124,107-228*change,'1',206,'#f6e8c6','b');tx(pd,124,335-228*change,'2',206,'#f6e8c6','b');im.paste(panel,(555,148))
   else:tile(d,x,y,'2' if change else '1',.75+.25*copy)
  d.line([(105,390),(105+226*answer,390)],fill=ink,width=5)
 elif kind=='orbit':
  disc(d,318,256,79,'#ddc49c')
  for j in range(-70,71,7):
   half=(79**2-j*j)**.5;d.line([(318-half,256+j),(318+half,256+j)],fill='#c9ae86')
  tx(d,318,252,'1',101,'#283247','s')
  if copy:
   x=318+441*copy;y=256-116*sin(pi*copy);r=19+31*copy
   disc(d,x,y,r,'#63869a');ring(d,x,y,r+5,'#a4c9db')
   tx(d,x,y,'2' if change>=.5 else '1',int(r*1.28),'#f7e8c6','s')
   if change: ring(d,x,y,r+8+16*change,'#bb976b')
  if answer:d.arc([222,160,414,352],210,210+int(295*answer),fill=gold,width=3)
 else:
  for j in range(13):
   x=380+j*16;y=233+8*sin(pi*j/12);disc(d,x,y,5,'#e8b273' if copy and j/12<=copy else '#506e58')
  wheel(d,247,outside,'1');wheel(d,709,inside,'1' if copy>.97 else '',change)
  if answer: d.line([(157,383),(157+180*answer,383)],fill='#e8b273',width=3)
 cap=next((c['text'] for c in scene['cues'] if c['startSec']<=t+scene['startSec']<c['endSec']),None)
 if cap:
  color={'print':'#212821','orbit':'#19263b','machine':'#0d2b24'}[kind]
  w=d.textlength(cap,font=font(22,'k'));d.rounded_rectangle([480-w/2-18,470,480+w/2+18,514],radius=4,fill=color)
  tx(d,480,492,cap,22,'#fff2db')
 proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait():raise SystemExit(1)
