"""Fourteen shot-specific interpretations of a Swift value-parameter call."""
from functools import lru_cache
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageOps

TITLES = ["도예 공방의 압인", "등대의 두 번째 불빛", "목판을 들어 올리면", "현미경의 초점면", "벨벳 무대의 대역", "눈 내리는 역의 차창", "필사본의 두 번째 이니셜", "잠수정의 관측 일지", "법정 속기록", "두 채널의 오실로스코프", "암실의 인화지", "셸 디버깅 세션", "농구 전술 작전판", "신문 조판 마감"]
@lru_cache(None)
def font(f,s):
    name={"k":"/System/Library/Fonts/AppleSDGothicNeo.ttc","m":"/System/Library/Fonts/Supplemental/Courier New Bold.ttf","s":"/System/Library/Fonts/Supplemental/Georgia.ttf","i":"/System/Library/Fonts/Supplemental/Impact.ttf"}[f]
    return ImageFont.truetype(name,s)
def text(d,x,y,s,size,fill,f="k",anchor="lm",stroke=0):
    d.text((x,y),s,font=font(f,size),fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill="#222018")
def ease(t):return max(0,min(1,t))**2*(3-2*max(0,min(1,t)))
@lru_cache(None)
def plate(i):
    im=Image.open(Path(__file__).with_name(("material-plates.png","scenery-plates.png")[i//4])).convert("RGB")
    w,h=im.size; col=i%2; row=(i%4)//2
    return im.crop((col*w//2+2,row*h//2+2,(col+1)*w//2-2,(row+1)*h//2-2)).resize((960,540),Image.Resampling.LANCZOS)
def label(d,xy,s,light=False):
    x,y=xy;w=d.textlength(s,font=font("m",25))+24
    d.rectangle((x,y-19,x+w,y+19), fill="#e9ddbf" if light else "#222827")
    text(d,x+12,y,s,25,"#302c25" if light else "#e8dbbd","m")
def draw(im,idx,t):
    d=ImageDraw.Draw(im); i=idx-1
    enter=ease((t-.5)/1.2); ch=ease((t-3.51)/.62); result=t>=5.78
    num="2" if ch>=.5 else "1"; cream="#fff0cf"; black="#242422"
    if i<8:
        im.paste(plate(i)); d=ImageDraw.Draw(im)
    if i==0: # A physical print appears on the tile under the seal.
        text(d,214,372,"x = 1",32,cream,"m","mm",1)
        if enter:
            x=599;y=251+int(13*(1-enter))
            text(d,x+2,y+2,num,round(60+59*enter),"#d8c69c","s","mm");text(d,x,y,num,round(60+59*enter),"#73553c","s","mm")
        if enter:
            length=48*enter
            d.line([(501,305),(501+length,305-length*.55)],fill="#966f4b",width=3)
            for k in range(1,5+int(ch>.5)):
                xx=500+k*8;yy=305-k*4
                d.line([(xx,yy),(xx-1,yy-8)],fill="#805839",width=2)
        text(d,600,367,"i = 2" if ch>=.5 else "setTwo(x)",24,"#634630","m","mm")
    elif i==1: # One fixed lighthouse, then two separate reflections after the assignment.
        x=746; y=round(587-232*enter)
        d.ellipse((x-125,y-78,x+128,y+81),fill="#b89158",outline="#5b482e",width=3)
        for j in range(58):
            a=j*.57;rr=2.8*math.sqrt(j);cx=x-23+rr*math.cos(a);cy=y+rr*.76*math.sin(a)
            d.ellipse((cx-18,cy-5,cx+17,cy+6),fill=("#374357","#364758","#4b566a")[j%3])
        for j in range(round(ch*38)):
            a=j*.43;rr=2.8*math.sqrt(j);cx=x-22+rr*math.cos(a);cy=y+rr*.78*math.sin(a)
            d.arc((cx-27,cy-12,cx+24,cy+10),193,339,fill="#e3a266" if j%3 else "#a17774",width=3)
        label(d,(48,418),"x = 1");label(d,(699,431),"i = "+num)
    elif i==2: # Paper pulls out of the woodcut while the carved block stays behind.
        if enter:
            x=346+75*enter;y=375-30*enter
            d.polygon([(x,y),(x+334,y-7),(x+351,y+78),(x-30,y+83)],fill="#e6d1a8",outline=black)
            text(d,x+149,y+38,"i = "+num,48,black,"m","mm")
        if ch:
            pts=[(486+q*3,402-9*math.sin(q*.12)) for q in range(max(2,round(67*ch)))]
            d.line(pts,fill="#29251e",width=3)
        label(d,(75,290),"x = 1")
    elif i==3: # Optical rack focus: an inset magnifies a distinct, growing cell.
        r=int(29+98*enter);cx,cy=614,268
        zoom=plate(i).crop((440,150,665,375)).resize((2*r,2*r));mask=Image.new("L",zoom.size);ImageDraw.Draw(mask).ellipse((0,0,2*r-1,2*r-1),fill=255)
        im.paste(zoom,(cx-r,cy-r),mask);d.ellipse((cx-r,cy-r,cx+r,cy+r),outline="#ecdfb4",width=2)
        text(d,cx,cy,"i = "+num,38,cream,"m","mm",2);label(d,(83,392),"x = 1")
        if ch:
            d.polygon([(63,99),(302,87),(311,293),(72,305)],fill="#d8d5b6")
            for k in range(2):
                q=math.pi*.4*k
                pts=[(178+(44+5*math.cos(3*a))*math.cos(a)+int(19*ch)*(2*k-1),192+(59-8*math.sin(a*2+q))*math.sin(a)) for a in [v*.08 for v in range(80)]]
                d.line(pts,fill="#45534b",width=2)
            text(d,90,274,"관찰지",17,black)
    elif i==4:
        def puppet(x,y,k,body,letter):
            y+=int(8*math.sin(t*2)*k);d.line((x,38,x,y-22),fill="#e9c391")
            d.ellipse((x-17,y-34,x+17,y),fill="#e1ba80",outline=black)
            d.polygon([(x,y-3),(x-37,y+83),(x+37,y+83)],fill=body,outline=black)
            text(d,x,y+43,letter,32,cream,"s","mm")
        puppet(290,260,0,"#574454","1");puppet(993-400*enter,275,1,"#98432f",num)
        label(d,(91,412),"print(x)  // 1" if result else "setTwo(x)")
    elif i==5:
        x=round(1130-570*enter+410*ease((t-6.2)/2.1))
        d.rounded_rectangle((x-93,126,x+93,229),radius=12,fill="#273844",outline="#e5d4a2",width=5)
        text(d,x,178,"i = "+num,34,cream,"m","mm")
        if ch:
            film=Image.new('RGBA',im.size);hand=ImageDraw.Draw(film)
            hand.ellipse((507,248,564,305),fill=(243,223,184,83))
            for a,b,h in [(508,517,44),(522,531,58),(536,545,62),(550,559,46)]:
                hand.rounded_rectangle((a,260-h,b,267),5,fill=(244,228,196,90))
            hand.line([(512,272),(526,284),(551,275)],fill=(67,64,53,109),width=2)
            im.paste(film,(0,0),film)
        d.rectangle((70,283,262,339),fill="#d9d7c2",outline="#293e3f",width=3);text(d,165,311,"x = 1",34,black,"m","mm")
    elif i==6:
        x=438;y=135
        for n,s in enumerate(["var x = 1","setTwo(x)","i = 2","print(x)  // 1"]):
            at=[0,.95,3.51,5.78][n];extent=ease((t-at)/.75)
            if extent: text(d,x,y+64*n,s[:math.ceil(len(s)*extent)],36,"#792f25" if n==2 else "#423120","s")
    elif i==7:
        scope=Image.new('RGBA',im.size);g=ImageDraw.Draw(scope)
        g.line([(479,244),(479+150*math.cos(t*.53),244+123*math.sin(t*.53))],fill=(112,244,177,135),width=2)
        g.ellipse((435,245,465,275),outline=(175,240,193,220),width=2)
        im.paste(scope,(0,0),scope);label(d,(62,414),"x = 1")
        if enter:
            x=int(995-302*enter);d.polygon([(x,230),(x+221,245),(x+207,445),(x-14,430)],fill="#d4c9ac")
            text(d,x+18,265,"관측 일지",22,"#364745")
            for n in range(3):d.line((x+12,310+36*n,x+191,323+36*n),fill="#a8a58c")
            d.ellipse((x+38,303,x+84,342),outline="#425953",width=2)
            if ch:d.ellipse((x+70,310,x+132,354),outline="#425953",width=3)
            text(d,x+31,399,"i = "+num,22,"#2c4a45","m")
    elif i==8: # Stenographer writes a timed exchange. No travelling value.
        im.paste("#ded6c4",(0,0,960,540))
        for y in range(75,470,30):d.line((107,y,866,y),fill="#bcb2a2")
        d.line((205,39,205,477),fill="#bb8077",width=2)
        for at,y,s,who in [(0,121,"var x = 1","호출자"),(.9,203,"setTwo(x)","속기"),(3.51,285,"i = 2","함수"),(5.78,367,"print(x)  // 1","기록")]:
            q=ease((t-at)/.84)
            if q:text(d,130,y,who,23,black);text(d,238,y,s[:math.ceil(len(s)*q)],38,"#342f2e","m")
    elif i==9:
        im.paste("#132128",(0,0,960,540))
        for gx in range(52,920,26):d.line((gx,61,gx,453),fill="#293b42")
        for gy in range(67,454,26):d.line((52,gy,914,gy),fill="#293b42")
        for channel,y0,color in [(0,174,"#ecaf81"),(1,358,"#8fdec8")]:
            xend=int(110+770*ease(t/6.5))
            pts=[]
            for x in range(84,xend):
                phase=((x-84)/770)*6.5
                amp=0 if channel and phase<1 else 21 if not channel or phase<3.51 else 46
                pts.append((x,y0-amp*(1 if math.sin(phase*5)>0 else -1)))
            if len(pts)>1:d.line(pts,fill=color,width=3)
            text(d,83,y0-73,("x = 1" if not channel else "i = "+num),28,color,"m")
        if result:label(d,(629,423),"print(x)  // 1")
    elif i==10:
        im.paste("#371213",(0,0,960,540));d.rounded_rectangle((65,75,897,453),33,fill="#130f13",outline="#b45446",width=5)
        v=round(213-111*ease((t-.6)/3));d.polygon([(173,143),(713,103),(776,362),(234,404)],fill=(v,int(v*.83),int(v*.68)))
        text(d,305,245,"x = 1",46,"#3c3030","s");text(d,553,302,"i = "+num,46,"#573831","s")
        for j in range(3):d.arc((117-j*12,132-j*6,820+j*9,389+j*8),14+t*6,90+t*6,fill="#ac7765",width=2)
        if result:text(d,117,428,"print(x)  // 1",22,cream,"m")
    elif i==11:
        im.paste("#0d1815",(0,0,960,540))
        for y in range(42,480,5):d.line((0,y,960,y),fill="#13231c")
        commands=[(0,"swift2> var x = 1"),(.6,"swift2> setTwo(x)"),(1.5,"  frame: setTwo(var i: Int)"),(3.51,"  step: i = 2"),(4.8,"  return"),(5.78,"swift2> print(x)"),(6.35,"1")]
        for j,(at,s) in enumerate(commands):
            if t>=at:text(d,91,85+54*j,s[:max(1,int((t-at)*32))],32,"#f4d58e" if j==6 else "#96d3a9","m")
    elif i==12:
        im.paste("#b98554",(0,0,960,540))
        for j in range(25):d.line((0,49+j*18,960,49+j*18),fill="#986b43")
        d.rectangle((52,65,907,449),outline=cream,width=4);d.line((480,65,480,449),fill=cream,width=3)
        d.ellipse((409,188,551,330),outline=cream,width=3);d.arc((-133,90,214,431),-75,76,fill=cream,width=4);d.arc((747,90,1095,431),105,255,fill=cream,width=4)
        for x,y,s in [(241,252,"x"),(687,252,"i")]:
            d.ellipse((x-41,y-41,x+41,y+41),fill="#244454",outline=cream,width=3);text(d,x,y,s,44,cream,"m","mm")
        text(d,480,109,"setTwo(x)" if not result else "print(x)  →  1",30,black,"m","mm")
        for j in range(1+(ch>=.5)):
            x=244+438*enter+j*31;y=320-58*math.sin(math.pi*enter)
            d.ellipse((x-12,y-12,x+12,y+12),fill="#ec842e",outline=black,width=2)
        text(d,240,372,"x = 1",24,black,"m","mm")
    else:
        im.paste("#eee6d1",(0,0,960,540));text(d,55,95,"THE SWIFT RECORD",57,black,"s")
        d.line((53,140,908,140),fill=black,width=5);d.line((53,150,908,150),fill=black,width=1)
        text(d,56,204,"함수에 건넨 1" if not result else "함수 밖에는 1이 남았다",50,black)
        for j,s in enumerate(["var x = 1","setTwo(x)","i = 2","print(x)  // 1"]):
            x=59+j*220;d.line((x,260,x,430),fill="#99907f")
            if t>=[0,.85,3.51,5.78][j]:
                text(d,x+10,281,s,22,"#9b352c","m")
                for k in range(7):d.line((x+12,319+k*14,x+170-((j+2*k)%3)*13,319+k*14),fill="#87816e",width=2)
