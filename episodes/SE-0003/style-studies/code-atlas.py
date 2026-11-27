"""Render 40 code-led art studies as one film. Run from the project root."""
import json
import math
import random
import re
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

EP = Path("episodes/SE-0003")
OUT = EP / "out/style-studies"
SCENE = json.loads((EP / "audio/long/manifest.json").read_text())["scenes"][1]
CODE = json.loads((EP / "script.json").read_text())["scenes"][1]["code"]["code"].splitlines() + ["print(x)"]
FPS, FRAMES = 24, 312
families = [
 ("제본", "f1e8d2", "302c25", "a44635", ["접힌 책장","여백의 교정쇄","책갈피","아코디언 북","투사지"]),
 ("건축", "203e4c", "e5e3ca", "e6a069", ["평면도","등각 단면","나선 계단","교량","채광창"]),
 ("자연 관찰", "e1e4c9", "243c36", "a34a28", ["잎맥","나이테","지층","강의 지류","씨방"]),
 ("직물", "402d40", "f3dfc3", "f0a388", ["날실과 씨실","자수틀","누비 조각","직조 띠","매듭"]),
 ("광학", "17293c", "d2e1d9", "f2bc76", ["프리즘","두 렌즈","조리개","회절 무늬","반사경"]),
 ("종이 무대", "efe0c9", "443245", "aa4534", ["팝업 계단","그림자극","모빌","접힌 부채","겹친 산등성이"]),
 ("지도", "e6e1cc", "293e42", "a54a33", ["등고선","환승 노선","항로","측량 격자","군도"]),
 ("시간 기록", "2b3331", "e7dec3", "efaa78", ["필름 콘택트시트","피아노 롤","악보","해시계","주사 기록"]),
]
def shade(a,b,k):
 return tuple(round(x+(y-x)*k) for x,y in zip(bytes.fromhex(a),bytes.fromhex(b)))
@lru_cache(None)
def font(size,kind):
 files={"k":"/System/Library/Fonts/AppleSDGothicNeo.ttc","m":"/System/Library/Fonts/Supplemental/Courier New Bold.ttf","s":"/System/Library/Fonts/Supplemental/Georgia.ttf"}
 return ImageFont.truetype(files[kind],size)
def txt(d,xy,s,size,color,kind="k",anchor="lm"):
 d.text(xy,s,font=font(size,kind),fill=color,anchor=anchor)
def ease(x):
 x=min(1,max(0,x)); return x*x*(3-2*x)
def path(d,pts,c,w=2):d.line(pts,fill=c,width=w,joint="curve")
def oval(d,x,y,r,h,c,w=2):d.ellipse((x-r,y-h,x+r,y+h),outline=c,width=w)
def art(d,f,v,ink,light,mid,solid):
 # Draw within a 440 x 296 plate. Each study has its own spatial grammar.
 P=lambda pts,w=2,c=mid:path(d,pts,c,w)
 E=lambda x,y,r,h,w=2,c=mid:oval(d,x,y,r,h,c,w)
 R=lambda box,c=mid,w=2:d.rectangle(box,outline=c,width=w)
 poly=lambda pts,c=solid:d.polygon(pts,fill=c,outline=mid)
 if f==0:
  if v==0:
   for j in range(10): P([(20,53+j*3),(205,80+j*3),(413,46+j*3),(413,224+j*3),(205,253+j*3),(20,223+j*3),(20,53+j*3)],1)
   P([(205,81),(205,253)])
  elif v==1:
   R((22,30,419,257));R((37,44,407,242),light)
   for y in range(65,235,22):P([(59,y),(175+(y%47),y)],2)
   P([(205,113),(244,56),(380,56)],2,ink)
  elif v==2:
   for j in range(7):R((32+j*2,35-j*2,390+j*2,246-j*2))
   poly([(265,23),(323,23),(323,175),(294,153),(265,175)])
  elif v==3:
   for j in range(6):
    x=15+j*68;y=37+26*(j%2);poly([(x,y),(x+68,100-y),(x+68,267-y),(x,y+167)],solid if j%2 else light)
  else:
   for j in range(5):R((26+28*j,83-12*j,305+26*j,250-13*j),mid,2)
 elif f==1:
  if v==0:
   for x,y,w,h in [(20,52,165,184),(191,52,105,88),(301,52,116,88),(191,148,226,88)]:R((x,y,x+w,y+h),mid,4)
   d.arc((173,112,238,178),0,100,fill=ink,width=2)
  elif v==1:
   for j in range(3):
    y=89+j*46;poly([(26,y),(167,y-60),(410,y-4),(272,y+63)]);P([(26,y),(26,y+8),(272,y+72),(410,y+4)])
  elif v==2:
   for j in range(30):
    a=j*.29;x=225+121*math.cos(a);y=209+33*math.sin(a)-4*j;P([(220,216-4*j),(x,y),(x,y+6)])
  elif v==3:
   P([(12,188),(426,188)],6)
   for x in (101,330):P([(x,222),(x,57)],5)
   for x in range(20,427,13):P([(x,185),(101 if x<215 else 330, 62)],1)
  else:
   for j in range(9):P([(46+j*29,65),(173+j*29,203),(180+j*29,225)],2)
   P([(25,46),(302,46),(426,183)],4)
 elif f==2:
  if v==0:
   pts=[(25+i,190-64*math.sin(math.pi*i/378)-.22*i) for i in range(0,379,3)];P(pts,3)
   for x,y in pts[5::7]:P([(x-12,y+30),(x,y),(x+10,y-38)],1)
  elif v==1 or v==2:
   for j in range(1,17):
    if v==1:P([(213+(j*11+5*math.sin(a*5+j*.16))*math.cos(a),148+(j*7+3*math.cos(a*3))*math.sin(a)) for a in [i*.05 for i in range(128)]],1)
    else:P([(x,52+j*9+17*math.sin(x*.018+j*.17)+7*math.cos(x*.044)) for x in range(12,427,4)],2)
  elif v==3:
   for j in range(9):P([(x,145+45*math.sin(x*.014)+(max(0,210-x)*.09*(j-4))) for x in range(15,426,4)],2)
  else:
   for j in range(7):
    a=j*.9;E(215+74*math.cos(a),144+57*math.sin(a),57,48)
   E(215,144,138,106,3)
 elif f==3:
  if v==0:
   for x in range(25,418,12):P([(x,39),(x,244)],2)
   for y in range(44,244,12):P([(x,y+3*math.sin(x*.2)) for x in range(25,417,3)],2)
  elif v==1:
   E(218,150,133,111,6);E(218,150,126,104)
   for j in range(27):
    a=j*.23;P([(218+119*math.cos(a),150+95*math.sin(a)),(218+120*math.cos(a+2.4),150+95*math.sin(a+2.4))],1)
  elif v==2:
   for y in range(3):
    for x in range(6):
     a=20+x*67;b=44+y*62;poly([(a,b),(a+63,b),(a,b+58)],solid if (y+x)%2 else light);P([(a+63,b+5),(a+63,b+58),(a+5,b+58)],1)
  elif v==3:
   for j in range(14):P([(x,88+j*6+34*math.sin(x*.018+j*.09)) for x in range(12,429,3)],3)
  else:
   for j in range(7):P([(215+(137+j*2)*math.sin(a*2),145+(72+j*2)*math.sin(3*a+.3)) for a in [i*.025 for i in range(254)]],2)
 elif f==4:
  if v==0:
   poly([(170,232),(236,59),(311,232)]);P([(14,137),(205,137)],3)
   for j in range(6):P([(205,137),(267,145),(426,88+j*26)],2)
  elif v==1:
   E(140,147,34,95,3);E(294,147,28,82,3)
   for j in range(-4,5):P([(13,147+j*15),(140,147+j*14),(294,147-j*8),(427,147+j*11)],1)
  elif v==2:
   for j in range(9):
    a=j*2*math.pi/9;P([(215+110*math.cos(a),145+110*math.sin(a)),(215+49*math.cos(a+.85),145+49*math.sin(a+.85)),(215+48*math.cos(a+1.55),145+48*math.sin(a+1.55))],3)
   E(215,145,114,114)
  elif v==3:
   for x in (141,292):
    for j in range(1,11):E(x,145,j*11,j*11,1)
  else:
   for j in range(7):P([(14,228-j*9),(130,68+j*4),(289,218-j*4),(424,60+j*9)],2)
   for x,y in [(130,67),(289,218)]:P([(x-37,y),(x+37,y)],5)
 elif f==5:
  if v==0:
   for j in range(7):
    x=29+j*53;y=216-j*20;poly([(x,y),(x+45,y-12),(x+69,y),(x+22,y+13)]);poly([(x+22,y+13),(x+69,y),(x+69,244),(x+22,255)],light)
  elif v==1:
   for x in (20,345):
    for j in range(6):poly([(x+j*9,36),(x+30+j*8,36),(x+21+j*6,179),(x+j*7,232)])
   P([(19,36),(418,36)],4);P([(20,239),(418,239)],5)
  elif v==2:
   P([(214,25),(214,77),(113,90),(308,66)],3)
   for x,y,r in [(116,88,43),(220,78,22),(308,66,53)]:P([(x,y),(x,y+61)]);E(x,y+72,r,r*.6,3)
  elif v==3:
   for j in range(15):
    a=math.pi*(1.08+j*.061);b=a+.19;poly([(212,235),(212+172*math.cos(a),235+172*math.sin(a)),(212+172*math.cos(b),235+172*math.sin(b))],light if j%2 else solid)
  else:
   for j in range(4):
    pts=[(x,129+j*27+33*math.cos(x*.018+j*1.3)) for x in range(10,432,4)]
    poly(pts+[(430,260),(10,260)],light if j%2 else solid)
 elif f==6:
  if v==0 or v==4:
   for cx,cy in [(112,140),(312,148)]:
    for j in range(1,9 if v==0 else 4):
     P([(cx+(j*(12 if v==0 else 19)+7*math.sin(3*a))*math.cos(a),cy+(j*(9 if v==0 else 13)+6*math.cos(4*a))*math.sin(a)) for a in [i*.05 for i in range(128)]],2)
  elif v==1:
   for j in range(3):
    y=73+j*53;P([(16,y),(117,y),(171,y+40),(284,y+40),(337,y),(423,y)],4)
    for x in [54,97,350,404]:E(x,y,5,5)
  elif v==2:
   P([(12,210),(101,169),(160,182),(202,100),(291,132),(421,66)],2)
   for x,y in [(101,169),(202,100),(291,132)]:E(x,y,34,34,1);P([(x-12,y),(x+12,y)]);P([(x,y-12),(x,y+12)])
  else:
   for j in range(9):P([(34+j*39,42),(23+j*44,242)],1)
   for j in range(7):P([(20,50+j*29),(419,36+j*34)],1)
   P([(48,190),(180,77),(360,184),(48,190)],3)
 else:
  if v==0:
   for j in range(3):R((18+j*136,65,145+j*136,220),mid,4)
   for y in (48,231):
    for x in range(20,421,17):R((x,y,x+9,y+6))
  elif v==1:
   for j in range(13):P([(18,50+j*15),(421,50+j*15)],1)
   for j in range(24):
    x=24+(j*53)%357;y=57+(j*5%12)*15;R((x,y,x+24,y+7),mid,3)
  elif v==2:
   for y in [89,171]:
    for j in range(5):P([(16,y+j*8),(424,y+j*8)],1)
   for j in range(13):
    x=36+j*29;y=100+int(13*math.sin(j))+76*(j%3==0);E(x,y,6,4,3);P([(x+5,y),(x+5,y-25)])
  elif v==3:
   E(218,172,174,67);poly([(131,192),(237,47),(246,159)])
   for j in range(18):
    a=j*.35;P([(218+137*math.cos(a),172+51*math.sin(a)),(218+168*math.cos(a),172+64*math.sin(a))])
  else:
   for y in range(65,237,25):P([(16,y),(420,y)],1,light)
   P([(x,155+42*math.sin(x*.09)*math.exp(-((x-222)/88)**2)) for x in range(16,421)],3)

def render(number, target, audio):
 f,v=divmod(number,5)
 family,paper,ink,accent,names=families[f]
 bg=Image.new('RGB',(960,540),'#'+paper)
 light=shade(paper,ink,.12);mid=shade(paper,ink,.45);solid=shade(paper,ink,.19)
 fg='#'+ink; key='#'+accent
 d=ImageDraw.Draw(bg)
 txt(d,(44,42),f'{number+1:02d} / 40',22,fg,'m')
 txt(d,(205,41),family+'   /   '+names[v],24,fg)
 txt(d,(912,42),'SE–0003',19,fg,'m','rm')
 path(d,[(44,72),(916,72)],mid,1)
 txt(d,(52,110),'Swift 2  ·  당시 문법',19,fg)
 path(d,[(477,98),(477,422)],light,2)
 plate=Image.new('RGB',(440,296),'#'+paper)
 art(ImageDraw.Draw(plate),f,v,fg,light,mid,solid)
 # Rely on fixed source coordinates so the same lines can be compared across cuts.
 code_states=[]
 for active in range(6):
  im=bg.copy();q=ImageDraw.Draw(im)
  for j,line in enumerate(CODE):
   y=166+j*41
   if active==j:
    q.rounded_rectangle((44,y-19,464,y+19),radius=4,fill=light)
    q.rectangle((44,y-17,48,y+17),fill=key)
   txt(q,(61,y),str(j+1),14,mid,'m')
   x=90
   for token in re.findall(r'\s+|[A-Za-z_]+|\d+|.',line):
    color=key if token in {'func','var','Int','1','2'} else fg
    txt(q,(x,y),token,22,color,'m')
    x+=font(22,'m').getlength(token)
  code_states.append(im)
 starts=[c['startSec']-SCENE['startSec'] for c in SCENE['cues']]
 # Each route belongs to the illustrated medium. The two fixed ends retain their identities.
 positions=[[(86,241),(333,132)],[(81,219),(342,92)],[(81,194),(333,134)],[(77,146),(344,146)],
            [(71,150),(355,150)],[(78,225),(340,119)],[(77,175),(348,112)],[(77,154),(349,154)]]
 (ax,ay),(bx,by)=positions[f]
 def badge(q,x,y,s,highlight=False):
  fill=key if highlight else fg
  w=font(24,'m').getlength(s)+24
  q.rounded_rectangle((x-w/2,y-21,x+w/2,y+21),radius=5 if f in (0,1,3,7) else 20,fill=fill)
  txt(q,(x,y),s,24,'#'+paper,'m','mm')
 p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','960x540','-r',str(FPS),'-i','pipe:0','-i',str(audio),'-map','0:v','-map','1:a','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','copy','-t','13',str(target)],stdin=subprocess.PIPE)
 for n in range(FRAMES):
  t=n/FPS
  launch=ease((t-starts[0]-.35)/1.26);change=ease((t-starts[1])/.63);answer=ease((t-starts[2])/.70)
  active=3 if t<.8 else 4 if launch<.88 else 0 if not change else 1 if not answer else 5 if t<starts[3] else 0
  im=code_states[active].copy();q=ImageDraw.Draw(im)
  # Hold the text block still. Drift the illustration by only a few pixels.
  px=481+round(3*math.sin(.65*t+v));py=120
  im.paste(plate,(px,py));q=ImageDraw.Draw(im)
  def route(u):
   wave=math.sin(math.pi*u)
   dx=[0,12,18,0,0,-10,0,0][f]*wave
   dy=[-42,-30,-22,18,-15,-56,22,-12][f]*wave
   dy+=(v-2)*9*math.sin(2*math.pi*u)
   return (px+ax+(bx-ax)*u+dx,py+ay+(by-ay)*u+dy)
  if launch:
   path(q,[route(launch*i/48) for i in range(49)],key,3)
  x0,y0=route(0);x1,y1=route(1)
  badge(q,x0,y0,'x = 1',answer>.3)
  if launch>=1:
   badge(q,x1,y1,'i = 2' if change>=.5 else 'i = 1',change>0)
  elif launch>0:
   x,y=route(launch);badge(q,x,y,'1',True)
  if change and change<1:
   x,y=route(1);oval(q,x,y,49+17*change,23+10*change,key,2)
  # Use a code fragment for the last spoken beat to tie the diagram back to execution.
  note='setTwo(x)' if not change else 'i = 2' if not answer else 'print(x)  →  1'
  txt(q,(912,111),note,19,key,'m','rm')
  cap=next((c['text'] for c in SCENE['cues'] if c['startSec']<=t+SCENE['startSec']<c['endSec']),None)
  path(q,[(44,447),(916,447)],mid,1)
  if cap:txt(q,(480,486),cap,24,fg,'k','mm')
  if n==169:im.resize((320,180),Image.Resampling.LANCZOS).save(target.with_suffix('.jpg'))
  p.stdin.write(im.tobytes())
 p.stdin.close()
 if p.wait(): raise RuntimeError(f'Render failed for study {number+1}')

if __name__=='__main__':
 OUT.mkdir(exist_ok=True,parents=True)
 with tempfile.TemporaryDirectory(dir='/Volumes/eyedisk/tmp') as scratch:
  work=Path(scratch);audio=work/'scene.m4a'
  subprocess.run(['ffmpeg','-v','error','-ss',str(SCENE['startSec']),'-i',str(EP/'out/SE-0003-16x9.mp4'),'-t','13','-vn','-c:a','aac','-b:a','160k',str(audio)],check=True)
  from concurrent.futures import ThreadPoolExecutor
  with ThreadPoolExecutor(max_workers=3) as pool:
   def one(i):
    target=work/f'{i+1:02}.mp4';render(i,target,audio);return target
   files=list(pool.map(one,range(40)))
  (work/'list.txt').write_text(''.join(f"file '{p.name}'\n" for p in files))
  meta=work/'chapters.txt'
  meta.write_text(';FFMETADATA1\n'+''.join(f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={i*13000}\nEND={(i+1)*13000}\ntitle={i+1:02} · {families[i//5][4][i%5]}\n' for i in range(40)))
  # Encode the audio once across the entire reel to avoid repeating AAC priming at each join.
  dest=OUT/'SE-0003-code-atlas-40.mp4'
  subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(work/'list.txt'),'-stream_loop','39','-i',str(audio),'-i',str(meta),'-map','0:v','-map','1:a','-map_chapters','2','-c:v','copy','-c:a','aac','-b:a','160k','-t','520','-movflags','+faststart',str(dest)],check=True)
  sheet=Image.new('RGB',(1600,1440))
  for i,p in enumerate(files):sheet.paste(Image.open(p.with_suffix('.jpg')),(320*(i%5),180*(i//5)))
  sheet.save('/Volumes/eyedisk/tmp/se3-code-atlas-contact.jpg')
