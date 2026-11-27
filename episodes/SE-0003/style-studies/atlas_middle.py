"""Hand-staged scenes for the middle twelve studies of the SE-0003 reel."""
from functools import lru_cache
from math import cos, pi, sin
from PIL import ImageDraw, ImageFont

TITLES = ["시간이 흐르는 만화 칸", "종이를 벗겨 본 단면", "두 성부의 악보", "잉크를 접은 자리",
          "함수 안으로 줌인", "필름 게이트", "자카드 천공 카드", "봉투 안의 메모",
          "두 바늘의 턴테이블", "표본 서랍", "두 색의 접촉 인화", "움직이는 활자 포스터"]


@lru_cache(None)
def face(size, family):
    return ImageFont.truetype({
        'kr': '/System/Library/Fonts/AppleSDGothicNeo.ttc',
        'mono': '/System/Library/Fonts/Supplemental/Courier New Bold.ttf',
        'serif': '/System/Library/Fonts/Supplemental/Georgia.ttf',
        'bold': '/System/Library/Fonts/Supplemental/Arial Black.ttf',
    }[family], size)


def label(d, x, y, string, size=25, color='#282a2a', family='kr', anchor='mm'):
    d.text((int(x), int(y)), string, fill=color, font=face(size, family), anchor=anchor)


def prog(t, start, duration):
    u = min(1, max(0, (t-start)/duration))
    return u*u*(3-2*u)


def paper(d, color):
    d.rectangle((0, 39, 959, 481), fill=color)


def oval(d, x, y, r, fill, outline=None, width=1):
    d.ellipse((x-r, y-r, x+r, y+r), fill=fill, outline=outline, width=width)


def comic(d, t):
    cream, ink, blue = '#f1e4c6', '#22292d', '#5e9094'
    paper(d, ink)
    # A narrow establishing shot gives way to a tall action panel, then a wide reaction panel.
    for box, col in [((21,58,263,463),cream),((277,58,937,261),blue),((277,276,937,463),'#de9c71')]:
        d.rectangle(box, fill=col)
    for y in range(74,445,12):
        for x in range(34,250,12):
            if (x-153)**2+(y-236)**2>95**2:
                oval(d,x,y,1,'#aa9f8b')
    label(d,140,125,'호출한 곳',27)
    def portrait(x,y,smiling):
        oval(d,x,y,47,cream,ink,3)
        oval(d,x-16,y-9,4,ink);oval(d,x+16,y-9,4,ink)
        if smiling:d.arc((x-24,y-5,x+24,y+26),8,172,fill=ink,width=3)
        else:d.line((x-16,y+15,x+16,y+15),fill=ink,width=3)
    portrait(140,238,False)
    label(d,142,385,'var x = 1',27,ink,'mono')
    p=prog(t,.7,1.3)
    if p:
        for i in range(9):
            d.line([(290,84+i*18),(415+p*103,107+i*12)],fill='#4d7378')
        portrait(343+56*p,158,t>3.7)
        label(d,434+249*p,157,'i = '+('2' if t>3.7 else '1'),58,ink,'bold')
        label(d,697,225,'함수 안',21)
    if t>5.78:
        q=prog(t,5.78,.7)
        d.ellipse((315,305,675,424),fill=cream,outline=ink,width=3)
        d.polygon([(591,408),(652,440),(632,403)],fill=cream,outline=ink)
        label(d,494,366,'print(x)',39,ink,'mono')
        label(d,798,359,'1',int(55+35*q),ink,'bold')


def strata(d,t):
    paper(d,'#f1e8d2');ink='#413931'
    # Lift entire annotated sheets vertically to expose the duplicate underneath.
    peel=prog(t,.55,1.8);settle=prog(t,5.8,1)
    for j,col in enumerate(['#9f654c','#c89163','#dbaa72','#e7c594']):
        y=391-24*j
        pts=[(x,y+8*sin(x*.021+j*.67)) for x in range(-10,975,16)]
        d.polygon(pts+[(960,480),(0,480)],fill=col)
    top=195-82*peel+15*settle
    d.polygon([(47,top),(840,top-23),(914,top+36),(128,top+71)],fill='#edd3a6',outline=ink,width=2)
    label(d,300,top+26,'var x = 1',37,ink,'mono')
    if peel>.05:
        label(d,219,276,'함수 안에서 꺼낸 층',24,ink)
        label(d,624,268,'i = '+('2' if t>3.58 else '1'),62,ink,'serif')
    if settle:
        d.line([(770,top+10),(868,88),(930,88)],fill=ink,width=2)
        label(d,835,64,'print(x) → 1',19,ink,'mono')
    for j in range(4):d.line([(32,325+j*28),(67,325+j*28)],fill=ink,width=2)


def score(d,t):
    paper(d,'#f4ead2');ink='#242a29';red='#a94436'
    p=prog(t,.35,6.1);play=170+654*p
    for base in [169,342]:
        for j in range(5):d.line((133,base+j*12,881,base+j*12),fill='#9f9685',width=1)
        for x in [137,385,637,877]:d.line((x,base,x,base+48),fill=ink,width=2)
    label(d,75,192,'x',54,ink,'serif');label(d,75,364,'i',54,ink,'serif')
    label(d,75,240,'어머니',19,ink);label(d,75,413,'아이',19,ink)
    for x in [177,421,671,825]:
        d.ellipse((x-10,183,x+10,196),fill=ink);d.line((x+9,190,x+9,141),fill=ink,width=2)
        label(d,x,234,'1',23,ink,'serif')
    if t>.9:
        for x,pitch,value,at in [(272,366,'1',1),(504,354,'2',3.55),(754,354,'2',5.5)]:
            if t<at:continue
            d.ellipse((x-10,pitch-6,x+10,pitch+6),fill=red);d.line((x+9,pitch,x+9,pitch-44),fill=red,width=2)
            label(d,x,409,value,26,red,'serif')
    d.line((play,128,play,401),fill='#c68550',width=2)
    label(d,480,85,'setTwo(x)' if t<3.5 else 'i = 2' if t<5.8 else 'print(x)  →  1',32,ink,'mono')


def inkfold(d,t):
    paper(d,'#ded3bf');ink='#203d48';rust='#943b33'
    d.line((477,52,477,469),fill='#aa9983',width=2)
    def blot(cx,cy,rx,ry,color):
        pts=[]
        for n in range(120):
            a=n*pi/60;r=1+.095*sin(5*a+.1)+.038*cos(11*a+1.4)+.028*sin(17*a)
            pts.append((cx+rx*r*cos(a),cy+ry*r*sin(a)))
        d.polygon(pts,fill=color)
    blot(278,258,131,110,ink);label(d,280,255,'1',101,'#f4ead4','serif')
    label(d,279,427,'x · 원본',28,ink)
    unfold=prog(t,.62,1.36)
    if unfold:
        cx=477+196*unfold
        blot(cx,258,max(2,131*unfold),110,ink if t<3.62 else rust)
        if unfold>.5:label(d,cx,255,'1' if t<3.62 else '2',101,'#f4ead4','serif')
        label(d,676,427,'i · 복사본',28,ink)
    if t>5.78:
        d.line((203,384,355,384),fill=rust,width=3)
        label(d,277,78,'print(x) → 1',24,ink,'mono')


def zoom(d,t):
    paper(d,'#182731');edge='#8caba7';cream='#eee1bc'
    zoom=prog(t,.62,1.45)*(1-prog(t,5.82,1.35))
    # The function frame expands towards the viewer. Zoom out returns to the caller's sheet.
    left=299-219*zoom;top=147-62*zoom;right=715+142*zoom;bottom=355+61*zoom
    d.rectangle((42,69,914,450),outline=edge,width=2)
    label(d,66,98,'var x = 1',29,cream,'mono','lm')
    d.rounded_rectangle((left,top,right,bottom),radius=11,fill='#284452',outline='#91b9b5',width=3)
    label(d,left+22,top+36,'func setTwo(var i: Int) {',int(19+8*zoom),cream,'mono','lm')
    if t>1:label(d,(left+right)/2,(top+bottom)/2,'i = '+('2' if t>=3.6 else '1'),int(37+27*zoom),'#f2b36e','mono')
    label(d,left+26,bottom-30,'}',29,cream,'mono')
    if t>5.8:label(d,675,413,'print(x) → 1',31,'#f2b36e','mono')


def film(d,t):
    paper(d,'#1b1e22');cream='#e8d6ae';sepia='#d79d64'
    advance=prog(t,.58,1.25)+prog(t,3.52,1.1)+prog(t,5.78,1.12)
    for j,(line,val) in enumerate([('var x = 1','1'),('setTwo(x)','1'),('i = 2','2'),('print(x)','1')]):
        x=480+round((j-advance)*318)
        if x<-160 or x>1120:continue
        d.rectangle((x-151,103,x+151,397),fill='#564e44')
        d.rectangle((x-135,118,x+135,381),fill=cream if j!=2 else sepia)
        label(d,x,151,line,25,'#332a25','mono')
        label(d,x,254,val,114,'#332a25','serif')
        label(d,x,346,['함수 밖','전달된 값','함수 안','출력'][j],22,'#332a25')
    for y in [80,409]:
        for j in range(-1,25):
            x=round(j*47-(advance*318)%47)
            d.rounded_rectangle((x,y,x+24,y+12),radius=3,fill=cream)
    d.line((466,54,494,54,480,72,466,54),fill=sepia,width=3)


def loom(d,t):
    paper(d,'#e9d8aa');ink='#273d39';burn='#ad4f34'
    label(d,72,87,'setTwo(x)',30,ink,'mono','lm')
    label(d,884,85,'펀치 카드',22,ink,'kr','rm')
    for j in range(2):
        x=73+j*429
        d.polygon([(x,132),(x+328,132),(x+369,168),(x+369,390),(x,390)],fill='#d1b882' if j==0 else '#dfc99a',outline=ink,width=2)
        label(d,x+23,166,'x' if j==0 else 'i',32,ink,'mono','lm')
        for r in range(4):
            for col in range(8):
                cx=x+47+col*39;cy=219+r*33
                on=(col==2 and r==1 and (not j or t>1.05)) or (j and t>3.61 and col==5 and r==2)
                d.rounded_rectangle((cx-8,cy-10,cx+8,cy+10),radius=2,fill=ink if on else '#e8d6ac',outline='#b59463')
        if j==0 or t>1.05:label(d,x+260,358,str(2 if j and t>3.61 else 1),38,burn,'mono')
    head=prog(t,.7,1.45);stroke=sin(pi*prog(t,3.53,.58))*32
    d.rectangle((95+head*440,99+stroke,220+head*440,118+stroke),fill=ink)
    if t>5.78:label(d,260,435,'print(x) → 1',27,ink,'mono')


def envelope(d,t):
    cream,ink,orange='#e6c79c','#4b2f36','#ba6555';paper(d,'#393b51')
    d.rounded_rectangle((39,104,317,400),radius=6,fill=cream)
    label(d,178,163,'받은 편지',26,ink);label(d,178,251,'x = 1',49,ink,'serif')
    p=prog(t,.65,1.35);q=prog(t,3.5,1);show=prog(t,5.79,.9)
    x=170+481*p;y=300-81*p-105*q
    if p:
        d.rectangle((x-112,y-70,x+112,y+70),fill='#f3e5c8',outline=ink,width=2)
        label(d,x,y-28,'답장',21,ink);label(d,x,y+16,'i = '+('2' if q>.4 else '1'),36,ink,'mono')
    d.polygon([(446,251),(653,157+80*(1-p)),(866,251),(866,410),(446,410)],fill='#975553',outline=ink,width=2)
    d.polygon([(446,250),(652,342),(866,250),(866,410),(446,410)],fill=orange,outline=ink,width=2)
    label(d,655,367,'setTwo',35,'#f7e2b9','serif')
    if show:label(d,178,338,'print(x) → 1',23,ink,'mono')


def record(d,t):
    paper(d,'#e1cab0');d.rounded_rectangle((63,64,890,445),radius=30,fill='#805344',outline='#453c31',width=3)
    ink='#202c2c';cream='#f2e3bb';cx,cy=350,255
    oval(d,cx,cy,171,ink)
    for r in range(83,165,7):oval(d,cx,cy,r,None,'#516161')
    oval(d,cx,cy,71,'#bb6f4d');label(d,cx,cy-8,'x = 1',30,cream,'serif')
    a=t*.36
    for i in range(3):
        aa=a+2*pi*i/3
        oval(d,cx+149*cos(aa),cy+149*sin(aa),3,cream)
    p=prog(t,.7,1.4);q=prog(t,5.8,1.5)
    needle=(int(558-94*p+58*q),int(150+115*p-45*q))
    d.line([(729,122),(661,125),needle],fill=ink,width=13)
    d.line([(729,119),(661,122),needle],fill='#d8d6b2',width=5);oval(d,732,122,21,ink)
    d.rounded_rectangle((596,245,828,382),radius=8,fill='#d5bd9e',outline=ink,width=2)
    label(d,711,280,'로컬 값',21,ink)
    label(d,711,329,'i = '+('2' if t>3.55 else '1' if t>1.2 else '·'),34,ink,'mono')
    if q:label(d,705,416,'print(x) → 1',22,cream,'mono')


def drawers(d,t):
    paper(d,'#d7d5c2');ink='#263b3a'
    for j in range(3):
        y=99+j*107;pull=prog(t,.7,1.1) if j==1 else prog(t,5.8,.8) if j==2 else 0
        x=160+int(pull*84)
        d.rectangle((114,y-8,827,y+78),fill='#455550',outline=ink,width=2)
        d.polygon([(x,y),(x+612,y),(x+627,y+11),(x+13,y+11)],fill='#dcccb1',outline=ink)
        d.rectangle((x+13,y+11,x+627,y+78),fill=['#a19475','#9d8c73','#b59d76'][j],outline=ink,width=2)
        d.rectangle((x+36,y+24,x+199,y+65),fill='#e7e0c7',outline=ink)
        label(d,x+117,y+46,['원래 값','함수 안','출력'][j],24,ink)
        val=['x = 1','i = '+('2' if t>3.55 else '1'),'print(x) → 1'][j]
        if j==0 or pull>.15:label(d,x+405,y+46,val,30,ink,'mono')
        for off in [222,593]:oval(d,x+off,y+43,5,ink)


def contact(d,t):
    paper(d,'#ede3c4');teal='#438d89';red='#b35848';ink='#333931'
    # Two registered impressions start together. Only the red local plate receives the edit.
    split=prog(t,.8,1.6);u=prog(t,3.54,.68)
    for x,y in [(72,90),(887,90),(72,417),(887,417)]:
        d.line((x-12,y,x+12,y),fill=ink);d.line((x,y-12,x,y+12),fill=ink)
    xa=453-185*split;xb=459+189*split
    d.rectangle((xa-114,120,xa+114,361),outline=teal,width=4)
    label(d,xa,233,'1',150,teal,'bold')
    if t>.7:
        d.rectangle((xb-111,126,xb+117,367),outline=red,width=3)
        label(d,xb,240,'2' if u>.5 else '1',int(139+9*sin(pi*u)),red,'bold')
    label(d,xa,389,'x · 원판',24,ink)
    if split>.45:label(d,xb,389,'i · 인화',24,ink)
    if t>5.8:d.line((xa-96,410,xa+96,410),fill=teal,width=4)


def broadside(d,t):
    paper(d,'#eadcc1');ink='#2b292e';red='#b04436'
    d.polygon([(0,39),(470,39),(304,482),(0,482)],fill='#d1b489')
    label(d,76,112,'var',45,ink,'serif')
    label(d,112,265,'x',int(146+7*sin(t*.4)),ink,'bold')
    label(d,239,270,'= 1',73,ink,'mono')
    p=prog(t,.65,1.25)
    y=319-190*p
    if p:
        label(d,603,y,'setTwo(x)',38,ink,'mono')
        d.line((433,y+42,881,y+42),fill=ink,width=3)
    if t>1.35:
        q=prog(t,3.52,.48)
        label(d,519,270,'i',109,ink,'serif')
        label(d,707,271,'= '+('2' if q>.35 else '1'),int(73+18*sin(pi*q)),red,'bold')
    if t>5.8:
        d.rectangle((415,352,960,435),fill=ink)
        label(d,681,393,'print(x)  →  1',38,'#f5e0b7','mono')


SCENES = [comic, strata, score, inkfold, zoom, film, loom, envelope, record, drawers, contact, broadside]


def draw(ctx, idx, t):
    SCENES[idx-15](ImageDraw.Draw(ctx),t)
