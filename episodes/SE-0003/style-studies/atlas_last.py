"""Fourteen staged interpretations of the Swift 2 local parameter example."""
from functools import lru_cache
from math import pi, sin, cos
from random import Random
from PIL import ImageDraw, ImageFont

TITLES = ["영수증의 먹줄", "유리창의 오후", "모래 정원", "등대 당직실", "베틀의 북",
          "물레 위의 항아리", "줄인형의 손", "왜가리와 수면", "조폐소의 압인", "산 위의 운해",
          "유리 세공실", "무대의 암전", "바둑 기보", "철제 서랍장"]

@lru_cache(None)
def face(size, kind):
    files = {"c":"/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
             "b":"/System/Library/Fonts/Supplemental/Arial Black.ttf",
             "s":"/System/Library/Fonts/Supplemental/Georgia.ttf",
             "k":"/System/Library/Fonts/AppleSDGothicNeo.ttc"}
    return ImageFont.truetype(files[kind], size)

def text(d,x,y,s,size,c,kind="c",anchor="lm"):
    d.text((x,y),s,fill=c,font=face(size,kind),anchor=anchor)

def ease(v):
    v=max(0,min(1,v))
    return v*v*(3-2*v)

def line(d,pts,c,w=2):
    d.line(pts,fill=c,width=w,joint="curve")

def circ(d,x,y,r,c,o=None,w=1):
    d.ellipse((x-r,y-r,x+r,y+r),fill=c,outline=o,width=w)

def ellipse(d,x,y,rx,ry,c,o=None,w=1):
    d.ellipse((x-rx,y-ry,x+rx,y+ry),fill=c,outline=o,width=w)

def receipt(d,t):
    bg,ink,paper="#254d47","#353729","#f1e5c9"
    d.rectangle((0,0,960,540),fill=bg)
    for x in range(-34,970,32): line(d,[(x,40),(x+170,480)],"#2f5951")
    end=round(180+78*ease(t/1.4)+87*ease((t-3.51)/1.1)+80*ease((t-5.78)/.9))
    d.rounded_rectangle((264,41,697,121),radius=14,fill="#afaa8f",outline="#162f2d",width=5)
    d.rectangle((290,77,669,98),fill="#293635")
    pts=[(297,86),(661,86),(661,end)]+[(x,end+7*(i%2)) for i,x in enumerate(range(661,296,-7))]+[(297,86)]
    d.polygon(pts,fill=paper)
    text(d,323,124,"SWIFT 2",25,ink)
    for y,code,start in [(161,"var x = 1",0),(222,"setTwo(x)",.45),(307,"i = 2",3.51),(382,"print(x)   // 1",5.78)]:
        if y+12<end and t>=start:text(d,322,y,code,27,ink)
    for y in [188,270,340]:
        if end>y+10:
            for x in range(319,640,12):line(d,[(x,y),(x+5,y)],"#a4987b")
    if t>6.5:
        for j in range(74):d.rectangle((320+4*j,403,320+4*j+(j%3),417),fill=ink)

def glass(d,t):
    d.rectangle((0,0,960,540),fill="#1c2432")
    lead="#17262c"; x,y=650,252
    warm=["#dba969","#b78e64","#dfbb80","#c79262"]; cool=["#427e80","#678c93","#486d81","#78988e"]
    for n in range(12):
        a=n*pi/6;b=(n+1)*pi/6
        pt=lambda a,r:(x+r*cos(a),y+r*sin(a))
        poly=[pt(a,62),pt(a,186),pt((a+b)/2,221),pt(b,186),pt(b,62)]
        d.polygon(poly,fill=(warm if n<round(12*ease((t-.7)/2)) else cool)[n%4],outline=lead,width=5)
        line(d,[pt(a,122),pt(b,122)],lead,5)
    circ(d,x,y,70,"#e1ad64",lead,8)
    text(d,x,y+2,"2" if t>3.7 else "1",92,lead,"s","mm")
    d.polygon([(101,428),(101,166),(195,71),(290,166),(290,428)],fill="#6a8790",outline=lead,width=8)
    for a in [148,335]:line(d,[(104,a),(285,a)],lead,6)
    text(d,196,245,"1",117,"#eee0b1","s","mm")
    text(d,197,384,"var x = 1" if t<5.78 else "print(x)",22,"#fff1c6","c","mm")
    text(d,648,463,"setTwo(x)" if t<3.51 else "i = 2",24,"#ebd59e","c","mm")

def sand(d,t):
    d.rectangle((0,0,960,540),fill="#dac9a6")
    focus=(587,231); rng=Random(48)
    for _ in range(900):
        px=rng.randrange(960);py=rng.randrange(42,480);d.point((px,py),fill="#ada084")
    for j in range(29):
        pts=[(x,44+16*j+14*sin(x*.009+j*.05)+33*sin(x*.015)*sin(j*.105)) for x in range(-8,984,8)]
        line(d,pts,"#b3a182",2)
    for k in range(6):
        ellipse(d,focus[0],focus[1],74+14*k,41+10*k,None,"#ab9373",2)
    def stone(x,y,r):
        ellipse(d,x+5,y+9,r,r*.57,"#b3a181")
        ellipse(d,x,y,r,r*.57,"#55574a")
        d.arc((x-r+9,y-r*.57+6,x+r-9,y+r*.57),210,310,fill="#888a78",width=4)
    stone(185,350,73);text(d,186,348,"1",43,"#eae3c7","s","mm")
    if t>.7:
        stone(588,230,53)
        if t>=3.51:stone(644,207+39*(1-ease((t-3.51)/.8)),34)
    text(d,115,430,"var x = 1" if t<5.78 else "print(x)  // 1",22,"#423e32")
    text(d,538,99,"setTwo(x)" if t<3.51 else "i = 2",23,"#423e32")
    sweep=ease((t-.55)/1.7)
    if 0<sweep<1:
        xx=290+365*sweep;line(d,[(xx-30,128),(xx+44,70)],"#745738",9)
        line(d,[(xx-48,120),(xx-14,145)],"#745738",8)
        for j in range(5):line(d,[(xx-47+j*8,120+j*6),(xx-56+j*8,131+j*6)],"#745738",3)

def lighthouse(d,t):
    d.rectangle((0,0,960,540),fill="#233c55")
    for j in range(14):d.rectangle((0,110+j*13,960,123+j*13), fill=(55+j*4,76+j*3,89+j*2))
    circ(d,726,125,36,"#f4d0a4")
    d.rectangle((0,278,960,482),fill="#315466")
    for j in range(17):
        line(d,[(xx,286+j*10+3*sin(xx*.019+j+t*.4)) for xx in range(0,970,8)],"#4b6973",2)
    d.polygon([(0,350),(125,306),(213,324),(292,363),(345,380),(420,483),(0,483)],fill="#243d3e")
    d.polygon([(129,313),(146,128),(186,128),(207,319)],fill="#eee2c3")
    d.polygon([(136,240),(197,221),(191,179),(141,198)],fill="#b75e50")
    d.rectangle((144,108,190,143),fill="#f8d88e",outline="#353d42",width=4)
    d.polygon([(135,107),(164,86),(199,107)],fill="#3f4645")
    beam=ease((t-.7)/1.75)
    if beam:
        p=90+430*beam;d.polygon([(189,118),(189+p,116+8*beam),(189+p,156+22*beam)],fill="#d6c798")
    d.polygon([(571,310),(668,310),(645,332),(596,330)],fill="#302f35")
    if t>=1:
        for j in range(1+int(t>=3.65)):circ(d,600+j*35,303,8,"#edbb74")
    text(d,55,435,"var x = 1" if t<5.78 else "print(x)  // 1",24,"#efe6cd")
    text(d,539,367,"setTwo(x)" if t<3.51 else "i = 2",24,"#f6ddaa")

def loom(d,t):
    d.rectangle((0,0,960,540),fill="#423138")
    # View down the warp. The woven band advances toward the spectator.
    for j in range(54):
        x=246+j*8.5;line(d,[(x,53),(60+j*15.8,461)],"#c39a75" if j%4 else "#f1c394",2)
    bottom=155+127*ease((t-.65)/2)+122*ease((t-3.51)/2.2)
    for y in range(65,int(bottom),6):
        left=245-(y-53)*.45;right=690+(y-53)*.55
        line(d,[(left,y),(right,y)],"#ab5148" if y<268 else "#6e9295",5)
        for j in range(10):
            x=left+(right-left)*(j+.5)/10;l=3+6*(1+sin(y*.075+j*pi))
            line(d,[(x-l,y),(x+l,y)],"#dabe96",3)
    a=ease((t-.7)/1.45) if t<3.51 else 1-ease((t-3.51)/1.1)
    x=210+535*a;y=bottom+8
    d.polygon([(x-72,y),(x-31,y-15),(x+55,y-9),(x+74,y),(x+24,y+12),(x-50,y+8)],fill="#ddbd91",outline="#352a2b",width=3)
    text(d,27,90,"x = 1",26,"#f4d6ae")
    text(d,740,133,"setTwo(x)" if t<3.51 else "i = 2",21,"#f4d6ae")
    if t>=5.78:text(d,480,445,"print(x)  // 1",25,"#ffe2b9","c","mm")

def pottery(d,t):
    d.rectangle((0,0,960,540),fill="#eee1bc")
    d.polygon([(0,340),(960,295),(960,483),(0,483)],fill="#c78f66")
    d.rectangle((77,91,238,183),fill="#eee8ce",outline="#775b49",width=2)
    text(d,158,141,"x = 1",27,"#5a453e","c","mm")
    ellipse(d,520,376,179,35,"#7d5947");ellipse(d,520,360,179,32,"#ad8766")
    lift=ease((t-.8)/1.7);z=ease((t-3.51)/1.35)
    rings=[]
    for n in range(54):
        k=n/53; yy=354-(67+177*lift)*k
        rad=69+72*sin(pi*k)**.75-14*k+z*12*sin(2*pi*k)
        rings.append((yy,rad))
    pts=[(520-r,yy) for yy,r in rings]+[(520+r,yy) for yy,r in reversed(rings)]
    d.polygon(pts,fill="#b65d49")
    for j,(yy,r) in enumerate(rings):
        if j%3==0:
            d.arc((520-r,yy-12,520+r,yy+13),0,180,fill="#cb7960",width=2)
        if j==18 or (j==33 and z>.45):d.arc((520-r,yy-11,520+r,yy+12),0,180,fill="#f0bc84",width=8)
    yy,r=rings[-1];ellipse(d,520,yy,r,12,"#85473c","#e29b78",4)
    text(d,693,180,"setTwo(x)" if t<3.51 else "i = 2",25,"#754735")
    if t>5.78:text(d,69,425,"print(x)  // 1",26,"#462f2b")

def puppet(d,t):
    d.rectangle((0,0,960,540),fill="#8c554e")
    d.rounded_rectangle((134,60,838,447),radius=28,fill="#e8c893",outline="#583d3a",width=8)
    for j in range(8):
        line(d,[(165+j*90,76),(179+j*88,426)],"#ddbd8c",1)
    arm=ease((t-.7)/1.3);rise=ease((t-3.51)/1.1)
    x=382;y=240
    for ox in [-50,2,66]:line(d,[(x+ox,64),(x+ox+15,y+15+ox*.15)],"#766351",1)
    circ(d,x,y-50,35,"#43383a")
    d.polygon([(x-31,y-21),(x+24,y-18),(x+54,y+89),(x-52,y+90)],fill="#43383a")
    line(d,[(x+17,y-8),(x+53,y+22),(x+80+44*arm,y+2-64*arm)],"#43383a",16)
    line(d,[(x-21,y),(x-62,y+41),(x-90,y+23)],"#43383a",13)
    text(d,x-1,y+40,"1",45,"#efd5ad","s","mm")
    if arm:
        xx=x+133;yy=y-55-19*rise
        line(d,[(xx,67),(xx,yy-18)],"#766351")
        d.polygon([(xx,yy-31),(xx+31,yy),(xx,yy+31),(xx-31,yy)],fill="#844b38")
        text(d,xx,yy,"2" if rise>.4 else "1",38,"#f2d398","s","mm")
    text(d,189,394,"print(x)  // 1" if t>5.78 else "var x = 1",24,"#483636")
    text(d,558,274,"i = 2" if rise else "setTwo(x)",25,"#5e4138")

def heron(d,t):
    d.rectangle((0,0,960,540),fill="#e6e1c7")
    d.ellipse((625,56,721,152),fill="#ce7867")
    for j in range(5):
        pts=[(xx,189+j*12+17*sin(xx*.01+j*.4)+7*cos(xx*.022)) for xx in range(0,970,7)]
        d.polygon(pts+[(960,317),(0,317)],fill=(179-j*8,187-j*6,164-j*5))
    d.rectangle((0,298,960,482),fill="#a7b9ac")
    for j in range(13):line(d,[(xx,302+13*j+2*sin(xx*.05+t)) for xx in range(0,970,8)],"#bdcab6",1)
    def bird(x,y,k,tint,reflect=False):
        h=-1 if reflect else 1
        def pt(a,b):return x+a*k,y+b*k*h
        d.polygon([pt(-105,1),pt(-34,-28),pt(12,-19),pt(33,1),pt(-23,14)],fill=tint)
        line(d,[pt(13,0),pt(38,-35),pt(30,-63),pt(50,-82),pt(74,-80)],tint,max(2,int(8*k)))
        d.polygon([pt(65,-84),pt(111,-78),pt(68,-76)],fill=tint)
        for a in [-23,-6]:line(d,[pt(a,7),pt(a-4,49),pt(a-9,81)],tint,max(1,int(3*k)))
    bird(340,239,.73,"#344344")
    if t>.8:
        z=ease((t-.8)/1.3);bird(340,351,.58*z,"#657e78",True)
    if t>3.51:
        k=ease((t-3.51)/1.4);bird(420+115*k,357,.53*k,"#697f79",True)
    text(d,62,121,"var x = 1" if t<5.78 else "print(x)  // 1",25,"#374d48")
    text(d,667,382,"setTwo(x)" if t<3.51 else "i = 2",24,"#334c48")

def mint(d,t):
    d.rectangle((0,0,960,540),fill="#373d3b")
    for x in range(0,970,22):line(d,[(x,39),(x-40,482)],"#404843",2)
    cx=400; top=94+112*sin(pi*ease((t-3.51)/1.2))
    d.rectangle((348,38,452,top+8),fill="#a2a597",outline="#242d2a",width=5)
    d.polygon([(291,top),(510,top),(484,top+42),(318,top+42)],fill="#8d9389",outline="#252c28",width=4)
    d.rectangle((235,335,570,375),fill="#626d64",outline="#29322d",width=4)
    d.polygon([(247,375),(559,375),(594,435),(211,435)],fill="#49594e")
    move=ease((t-.7)/1.6);spin=sin(pi*ease((t-3.51)/1.3))
    x=720-320*move;y=305-72*sin(pi*move)
    ellipse(d,x,y+8,91,26,"#845f36")
    ellipse(d,x,y,91,26+14*spin,"#dbb66d","#a47c43",5)
    text(d,x,y,"2" if t>4.08 else "1",33,"#735731","s","mm")
    text(d,636,147,"var x = 1" if t<5.78 else "print(x) // 1",25,"#f4dfac")
    text(d,283,404,"i = 2" if t>3.51 else "setTwo(x)",23,"#ede1bf")

def clouds(d,t):
    d.rectangle((0,0,960,540),fill="#d6ddc6")
    circ(d,722,109,42,"#da9d70")
    d.polygon([(0,364),(168,300),(316,190),(402,229),(491,119),(734,345),(960,366),(960,480),(0,480)],fill="#758e83")
    d.polygon([(257,355),(481,110),(514,151),(561,93),(754,361)],fill="#456f6d")
    d.polygon([(439,154),(481,110),(514,151),(561,93),(596,147),(565,130),(547,153),(517,173),(479,139)],fill="#f2e9c9")
    for j in range(4):
        shift=38*sin(t*.16+j);yy=269+j*38
        pts=[(x,yy+16*cos((x+shift)*.021+j)) for x in range(-8,977,8)]
        d.polygon(pts+[(970,490),(0,490)],fill=["#bbc7b1","#cad4bc","#dce0c7","#e8e8cd"][j])
    text(d,48,98,"var x = 1",26,"#335a57")
    if t>.75:
        d.rectangle((585,178,914,371),fill="#efe3c8",outline="#827c65",width=5)
        ridge=[(603,322),(691,251),(720,272),(767,208),(794,242),(820,199),(888,324)]
        line(d,ridge,"#435350",4)
        if t>3.51:
            width=round(236*ease((t-3.51)/1.2))
            d.ellipse((620,253,621+width,293),fill="#cbd1c4")
        tx=671
        text(d,tx,344,"setTwo(x)" if t<3.51 else "i = 2",26,"#243e3a","c","mm")
    if t>=5.78:text(d,116,418,"print(x)  // 1",28,"#3c5d59")

def glasswork(d,t):
    d.rectangle((0,0,960,540),fill="#182729")
    cx,cy=590,246;lift=ease((t-.65)/1.5);swell=ease((t-3.51)/1.6)
    line(d,[(73,98),(cx,cy)],"#a6bac1",12)
    line(d,[(73,95),(cx,cy-3)],"#e4dfc5",3)
    for j in range(6):
        x=536+j*19
        tip=272-19*sin(t*1.5+j*.7)
        d.polygon([(x-17,379),(x+6,tip),(x+21,375)],fill="#d07b4e" if j%2 else "#dda46f")
    d.rounded_rectangle((489,378,706,411),radius=12,fill="#52716a")
    if lift:
        rx=19+54*lift+38*swell;ry=17+62*lift-12*swell
        ellipse(d,cx,cy,rx,ry,"#99745b","#e5c593",4)
        ellipse(d,cx-7,cy-3,rx-9,ry-8,None,"#b69a79",2)
        d.arc((cx-rx+12,cy-ry+7,cx+rx-5,cy+ry-4),203,262,fill="#f7dfb5",width=5)
        text(d,cx+5,cy+5,"2" if swell>.45 else "1",52,"#f9e0ad","s","mm")
    text(d,72,209,"var x = 1" if t<5.78 else "print(x)  // 1",24,"#d4d8bf")
    text(d,650,90,"setTwo(x)" if t<3.51 else "i = 2",24,"#e7bd85")

def stage(d,t):
    d.rectangle((0,0,960,540),fill="#17191c")
    f=ease((t-.62)/1.4);g=ease((t-3.51)/1.35);h=ease((t-5.78)/1.35)
    # A single travelling light directs attention through three depths.
    x=258+402*f-373*h;y=326-102*f+89*h
    d.polygon([(481,43),(503,43),(x+103,y),(x-103,y)],fill="#403a34")
    ellipse(d,x,y,105,20,"#8a7354")
    for xx,yy,n in [(259,301,"1"),(661,200,"2" if g>.4 else "1")]:
        if xx==661 and not f:continue
        lit=abs(xx-x)<140
        text(d,xx,yy,n,110 if xx<300 else 79,"#f4d79c" if lit else "#71685d","s","mm")
    line(d,[(79,363),(830,363)],"#655a51",2)
    text(d,480,417,"print(x)   // 1" if h else ("i = 2" if g else "setTwo(x)"),27,"#e5d5ba","c","mm")
    for j in range(5):
        off=36*j;d.polygon([(off-60,39),(off+31,39),(off-8,136),(off-66,209)],fill=["#493438","#593a3c"][j%2])
        d.polygon([(960-off+60,39),(960-off-31,39),(960-off+8,136),(960-off+66,209)],fill=["#493438","#593a3c"][j%2])

def baduk(d,t):
    d.rectangle((0,0,960,540),fill="#eadbb9")
    # Cropped diagonal board, entering stones cast a shadow only at contact.
    origin=(450,39);u=(53,13);v=(-30,35)
    def pt(a,b):return origin[0]+a*u[0]+b*v[0],origin[1]+a*u[1]+b*v[1]
    d.polygon([pt(-1,0),pt(11,0),pt(11,10),pt(-1,10)],fill="#cca069")
    for j in range(11):
        line(d,[pt(j,0),pt(j,10)],"#836047",2)
        line(d,[pt(0,j),pt(10,j)],"#836047",2)
    def piece(a,b,white,fall):
        x,y=pt(a,b);ellipse(d,x+4,y+5,22,14,"#947348");ellipse(d,x,y-(1-fall)*55,23,16,"#e5e0ca" if white else "#302e2a")
    piece(2,3,False,1)
    if t>.7:piece(6,2,True,ease((t-.7)/.7))
    if t>3.51:piece(7,3,True,ease((t-3.51)/.7))
    text(d,40,92,"var x = 1",25,"#423c31")
    text(d,37,148,"setTwo(x)" if t<3.51 else "i = 2",24,"#70583d")
    if t>5.78:text(d,38,426,"print(x) // 1",27,"#3f392e")

def cabinet(d,t):
    d.rectangle((0,0,960,540),fill="#566667")
    g=ease((t-.55)/1.35); h=ease((t-3.51)/.9); close=ease((t-5.78)/1.2)
    # Reverse perspective. The middle drawer slides toward the viewer.
    for r in range(3):
        for c in range(4):
            x=24+c*233;y=61+r*134
            d.rounded_rectangle((x,y,x+219,y+119),radius=7,fill="#77857c",outline="#455657",width=4)
            d.rounded_rectangle((x+78,y+34,x+144,y+54),radius=4,fill="#3d4f4e",outline="#bcc0a7",width=2)
    text(d,131,142,"x = 1",21,"#eee5c9","c","mm")
    amt=g*(1-close);x=257-54*amt;y=195+51*amt;ww=219+112*amt
    d.polygon([(257,195),(476,195),(x+ww,y+30),(x,y+30)],fill="#364446")
    if amt>.03:
        for j in range(5):
            yy=y-18+j*5;d.polygon([(x+18,yy),(x+ww-22,yy),(x+ww-13,yy+21),(x+10,yy+21)],fill="#e4d9b8",outline="#b6a98c")
        text(d,x+ww/2,y-4,"i = 2" if h else "i = 1",24,"#4b5146","c","mm")
    d.rounded_rectangle((x,y+24*amt,x+ww,y+116+24*amt),radius=7,fill="#83968d",outline="#405454",width=4)
    text(d,x+ww/2,y+70+24*amt,"setTwo(x)",24,"#253f3d","c","mm")
    if close:
        d.rectangle((36,123,230,160),fill="#e9dcb7");text(d,131,142,"print(x) // 1",19,"#3e4038","c","mm")

def elevator(d,t):
    d.rectangle((0,39,960,482),fill="#283335")
    for n in range(3):
        y=385-126*n
        d.line((80,y,893,y),fill="#b99462",width=4)
        text(d,104,y-35,str(n+1),42,"#dac6a1","s")
    lift=ease((t-3.51)/1.7);y=385-lift*126
    for x in (553,581):d.line((x,39,x,y-104),fill="#a59e89",width=2)
    d.rectangle((453,y-108,680,y-8),fill="#d2c4a5",outline="#745d49",width=6)
    text(d,568,y-55,"i = "+("2" if lift>.5 else "1"),34,"#372f26","c","mm")
    text(d,197,420,"print(x)  // 1" if t>5.78 else "var x = 1",26,"#f4dec0")

_SCENES = [receipt,glass,sand,lighthouse,loom,pottery,puppet,heron,mint,clouds,glasswork,stage,baduk,elevator]

def draw(ctx, idx, t):
    _SCENES[idx-27](ImageDraw.Draw(ctx),t)
