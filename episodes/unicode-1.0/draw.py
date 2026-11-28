"""Typeset the ink-wash film and move a camera through unretouched printed pages."""
from pathlib import Path
from functools import lru_cache
from dataclasses import dataclass
import csv, json, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent
ART = ROOT/'art'
DOC = json.loads((ROOT/'facsimiles.json').read_text())
TEXT = {r['key']:r for r in csv.DictReader((ROOT/'narration.tsv').open(),delimiter='\t')}
LONG = 'open tables china japan korea question xerox compare why apple becker shared fixed cost pair lower taiwan loss keep seoul proposal tokyo review book empty reason second unified return end'.split()
SHORT = ['open','tables','korea','unified','return','lower','keep','end']
INK='#242a29'; MUTED='#4f5651'; RED='#913d32'; PAPER='#f2eee4'
FONTS={'latin':('/System/Library/Fonts/Supplemental/Verdana.ttf',0),
       'title':('/System/Library/Fonts/Supplemental/AppleMyungjo.ttf',0),
       'han':('/System/Library/Fonts/Supplemental/Songti.ttc',2),
       'body':('/System/Library/Fonts/AppleSDGothicNeo.ttc',4),
       'small':('/System/Library/Fonts/AppleSDGothicNeo.ttc',2),
       'mono':('/System/Library/Fonts/Menlo.ttc',0),
       'label':(str(ROOT.parents[1]/'src/remotion/fonts/AtkinsonHyperlegibleNext.ttf'),0)}
kai=subprocess.check_output(['fc-match','-f','%{file}|%{index}','Kaiti TC'],text=True).split('|')
FONTS['brush']=(kai[0],int(kai[1]))
@lru_cache(None)
def font(name,size): return ImageFont.truetype(FONTS[name][0],size,index=FONTS[name][1])
@lru_cache(maxsize=400)
def letters(string,face,size,color):
    ft=font(face,size)
    l,t,r,b=ft.getbbox(string)
    im=Image.new('RGBA',(max(1,r-l+4),max(1,b-t+4)))
    ImageDraw.Draw(im).text((2-l,2-t),string,fill=color,font=ft,stroke_width=0)
    return im
@lru_cache(None)
def scan(name): return Image.open(ART/(name+'.png')).convert('RGB')
@lru_cache(None)
def painting(name,portrait):
    if name=='scan-paper':
        from film import page_background
        return page_background(portrait)
    im=Image.open(ART/(name+'.jpg')).convert('L')
    im=ImageOps.colorize(ImageOps.autocontrast(im,cutoff=.2),'#242928','#f4efe3')
    # Keep the imagery as a painted margin underneath the archival and type study.
    W,H=(1080,1920) if portrait else (1920,1080)
    if not portrait: return ImageOps.fit(im,(W,H),centering=(0.55,0.65))
    bg=im.crop((0,0,im.width//3,im.height//5)).resize((W,H),Image.Resampling.BICUBIC)
    lower=ImageOps.fit(im,(W,920),centering=(.76,.85))
    mask=Image.new('L',(1,920));mask.putdata([int(255*min(1,y/270)) for y in range(920)])
    bg.paste(lower,(0,H-920),mask.resize((W,920)))
    return bg
def ease(v): v=max(0,min(1,v)); return v*v*(3-2*v)
def interp(a,b,v):return a+(b-a)*v
@dataclass
class Item:
    pic:Image.Image
    x:float
    y:float
    reveal:bool=False
    width:float|None=None  # Design width for a print carried between layouts.
@dataclass
class Detail:
    page:str
    box:tuple
    window:tuple
    mark:tuple|None=None
@dataclass
class Layout:
    background:str
    items:dict
    detail:Detail|None=None
# All design coordinates use a 1280x720 or 720x1280 layout.
S=1.5
def px(v):return int(round(v*S))
def item_text(layout,key,txt,face,size,x,y,color=INK,center=False,reveal=False):
    image=letters(txt,face,px(size),color)
    layout.items[key]=Item(image,x-image.width/S/2 if center else x,y,reveal)
def ruler(layout,key,x,y,width,color):
    pic=Image.new('RGBA',(px(width),px(1.2)),color)
    layout.items[key]=Item(pic,x,y,True)
def seal():
    im=Image.new('RGBA',(px(34),px(37)));d=ImageDraw.Draw(im)
    d.rounded_rectangle((1,1,im.width-2,im.height-2),radius=4,outline=RED,width=3)
    p=letters('文','brush',px(27),RED);im.alpha_composite(p,((im.width-p.width)//2,(im.height-p.height)//2))
    return im
XEROX_TITLE='제록스의 한자 대조표'
APPLE_TITLE='애플의 파일 교환 프로그램'
GROUPS=[('open tables china japan korea question','같은 한자, 서로 다른 번호','一'),('xerox compare why',XEROX_TITLE,'二'),('apple',APPLE_TITLE,'二'),('becker shared fixed cost','공통 번호의 제안','三'),('pair lower taiwan loss keep','두 개의 푸를 청','四'),('seoul proposal tokyo review','함께 검토한 문자표','五'),('book empty reason','109쪽의 여백','六'),('second unified return end','원래 문자표로 되돌리기','七')]
def layout(key,portrait,short=False):
    group,title,number=next(g for g in GROUPS if key in g[0].split())
    P=portrait; w,h=(720,1280) if P else (1280,720)
    left=56 if P else 72
    bookart=key in 'xerox compare why apple becker shared fixed cost book empty reason'.split()
    a=Layout('inkstone-and-book' if bookart else 'river-and-pine',{})
    a.items['seal']=Item(seal(),left,59 if P else 44)
    item_text(a,'series','문자의 연대기','title',21,left+47,67 if P else 52)
    item_text(a,'edition','UNICODE  1.0','label',15,w-(167 if P else 182),71 if P else 54,MUTED)
    ruler(a,'headrule',left,118 if P else 101,w-2*left,'#9c9c8f')
    item_text(a,'section',('제 '+number+' 장') if not short else '한자 통합', 'small',16,left,165 if P else 137,RED)
    item_text(a,'chapter',title,'title',48 if P else 48,left,211 if P else 178)
    # Wide composition reserves a quiet left column. Portrait puts the exhibit underneath its title.
    def tag(s):
        item_text(a,'under',s,'body',23,left,295 if P else 252,MUTED)
    def specimen(s, x, y, size=200, face='han',name='specimen',color=INK):
        item_text(a,name,s,face,size,x,y,color,True,True)
    def caption_small(s, x,y):
        item_text(a,'folio',s,'body',17,x,y,MUTED)
    def codes(s, x,y): item_text(a,'codes',s,'mono',20,x,y,RED)
    def doc(page,box,mark=None):
        win=(55,412,610,425) if P else (665,164,539,309)
        a.detail=Detail(page,box,win,mark)
        caption_small(DOC['pages'][page]['folio']+'   ·   초판 영인',win[0],win[1]+win[3]+17)
    def focal(spot,view=None,highlight=False):
        page,label,box=DOC['spots'][spot]
        doc(page,view or box,box if highlight else None)
    full=(0,0,1,1)
    if key=='open':
        tag('한 일');specimen('一',339 if P else 349,503 if P else 345,420 if P else 432,'brush')
    elif key in ('tables','china','japan','korea','question','second','unified','return','end'):
        tags={'tables':'세 문자표에서 찾은 글자','china':'중국  ·  GB 2312','japan':'일본  ·  JIS X 0208','korea':'한국  ·  KS C 5601','question':'원래 문자 번호 복원','second':'1992년 6월  ·  두 번째 권','unified':'같은 문자, 하나의 번호','return':'한국 문자표로 되돌리기','end':'같은 글자를 함께 쓰는 방법'}
        tag(tags[key])
        specimen('一',187 if P else 237,354 if P else 346,168 if P else 263,'brush')
        if key in ('china','japan','korea','return'):
            place={'china':'50행 27열','japan':'16행 76열','korea':'76행 73열','return':'76행 73열'}[key]
            item_text(a,'position',place,'body',27,326 if P else left,344 if P else 431)
        if key in ('unified','end'): codes('U+4E00',326 if P else left,349 if P else 432)
        if key in ('tables','second'):doc('p171',full)
        else:
            spot=key if key in ('china','japan','korea') else ('korea' if key=='return' else 'row')
            box=DOC['spots'][spot][2]
            center=(box[0]+box[2])/2
            view=(center-.069,.113,center+.069,.14) if spot!='row' else (.073,.096,.364,.151)
            focal(spot,view,spot!='row')
    elif key in ('xerox','compare','why','apple','becker','shared','fixed','cost'):
        info={'xerox':('제록스','1986–1987'),'compare':('두 문자표에 담긴 한 글자','JIS   /   GB'),'why':('글꼴에 더할 글자를 찾다','XEROX'),'apple':('다른 기종에서도 같은 파일 읽기','APPLE FILE EXCHANGE'),'becker':('조 베커의 제안','UNICODE 88'),'shared':('각자의 표에서 공통 표로','1988.08'),'fixed':('문자마다 같은 길이','16 BIT'),'cost':('다음 글자는 어디서 시작할까','16 BIT  /  16 BIT')}
        t,num=info[key];tag(t)
        if key in ('compare','why','shared'):
            specimen('一',200 if P else 176,480 if P else 351,178,'brush');specimen('一',490 if P else 441,480 if P else 351,178,'han','secondGlyph')
            ruler(a,'bridge',268 if P else 231,495 if P else 365,145,'#989684')
        else:specimen('字',254 if P else 279,413 if P else 303,162 if P else 144,'brush')
        codes(num,left,690 if P else 496)
    elif key in ('pair','lower','taiwan','loss','keep'):
        tag('대만 문자표가 지킨 구별' if key in ('taiwan','loss','keep') else '두 글자의 아랫부분')
        # The two specimens share the same family, size and baseline.
        if not P:
            xs=(213,527); yy=299;size=228
        else:xs=(205,516); yy=415;size=246
        for i,(char,x) in enumerate(zip('青靑',xs)):
            specimen(char,x,yy,size,'han','qing'+str(i))
            if key in ('lower','loss'):ruler(a,'tick'+str(i),x-37,yy+size*.85,75,RED)
            if key=='keep':item_text(a,'code'+str(i),f'U+{ord(char):04X}','mono',21,x,yy+size+13,RED,True)
        if key in ('taiwan','loss','keep'):
            win=(66,761,587,161) if P else (735,315,465,145)
            a.detail=Detail('p016',(.17,.239,.49,.267) if key!='taiwan' else (.14,.238,.86,.286),win,DOC['spots']['forms'][2] if key=='loss' else None)
            caption_small('제2권 16쪽   ·   CNS 11643',win[0],win[1]+win[3]+12)
    elif key in ('seoul','proposal','tokyo','review'):
        seoul=key in ('seoul','proposal')
        tag('공동 연구를 제안하다' if seoul else '같은 기준으로 대조하다')
        city='서울' if seoul else '도쿄'
        item_text(a,'city',city,'title',76,left,329 if not P else 336)
        codes('1990.02' if seoul else '1991.07',left,434 if not P else 434)
        if P:
            a.detail=Detail('p012',full if key=='seoul' else (.085,.674,.887,.795),(56,529,605,330),None) if seoul else None
            if seoul:caption_small('제2권 12쪽   ·   서울 회의',56,870)
        elif seoul:focal('seoul',full if key=='seoul' else (.087,.674,.89,.79),key=='proposal')
        if not seoul:
            item_text(a,'group','CJK–JRG','label',40,78 if P else 677,611 if P else 313)
            item_text(a,'groupko','한·중·일 공동 연구 그룹','body',25,78 if P else 677,681 if P else 378)
            # Unicode 1.0 vol. 2 acknowledgments name the Korean members.
            item_text(a,'groupkr','한국 측  ·  오영택 수석대표  ·  이춘택 편집 위원','body',19,78 if P else 677,735 if P else 428,MUTED)
            caption_small('초판 제2권 감사의 글',78 if P else 677,775 if P else 462)
    else:
        tag('1991년 10월  ·  첫 번째 권')
        if key=='book':doc('p109',full)
        else:focal('blank',(.216,.28,.798,.34),False)
        if not P: item_text(a,'pageNum','109','label',81,left,342,MUTED)
    return a
def paste(frame,pic,x,y,alpha=1):
    if alpha<=0:return
    channel=pic.getchannel('A')
    if alpha<.998:channel=channel.point(lambda a:int(a*alpha))
    frame.paste(pic,(px(x),px(y)),channel)
def page_layer(dest,detail,alpha):
    if not detail or alpha<=0:return
    page=scan(detail.page); iw,ih=page.size
    x,y,w,h=map(px,detail.window)
    l,t,r,b=detail.box
    scale=min(w/((r-l)*iw),h/((b-t)*ih))
    cw,ch=w/scale,h/scale
    cx,cy=(l+r)*iw/2,(t+b)*ih/2
    source=(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2)
    stage=page.transform((w,h),Image.Transform.EXTENT,source,Image.Resampling.BILINEAR,fillcolor='#e1dfd8')
    d=ImageDraw.Draw(stage);d.rectangle((0,0,w-1,h-1),outline='#9b9c91',width=2)
    if detail.mark:
        ml,mt,mr,mb=detail.mark
        # Hairline below the printed type, so the scan and ink remain visible.
        yy=round((mb*ih-source[1])*scale)+3
        d.line((round((ml*iw-source[0])*scale),yy,round((mr*iw-source[0])*scale),yy),fill=RED,width=3)
    if alpha>.998:dest.paste(stage,(x,y))
    else:dest.paste(stage,(x,y),Image.new('L',stage.size,int(255*alpha)))
def camera_move(old,new,v):
    def center(box):l,t,r,b=box;return ((l+r)/2,(t+b)/2,r-l,b-t)
    x,y,w,h=center(old.box); X,Y,W,H=center(new.box)
    u=w*(W/w)**v;z=h*(H/h)**v
    # Follow the zoom focus from the outset, keeping the target inside the frame.
    k=(w-u)/(w-W) if abs(w-W)>1e-6 else v
    m=(h-z)/(h-H) if abs(h-H)>1e-6 else v
    cx,cy=interp(x,X,k),interp(y,Y,m)
    return Detail(new.page,(cx-u/2,cy-z/2,cx+u/2,cy+z/2),tuple(interp(i,j,v) for i,j in zip(old.window,new.window)),new.mark if v>.88 else None)
def fitted(item,width):
    if width is None:return item.pic
    w=px(width)
    if w==item.pic.width:return item.pic
    h=max(1,round(w*item.pic.height/item.pic.width))
    return item.pic.resize((w,h),Image.Resampling.LANCZOS)

def render_frame(prev,cur,P,v):
    v=ease(v)
    frame=painting(cur.background,P).copy()
    if prev and prev.background!=cur.background and v<1:
        frame=Image.blend(painting(prev.background,P),frame,v)
    old=prev.detail if prev else None;new=cur.detail
    if old and new and old.page==new.page:page_layer(frame,camera_move(old,new,v),1)
    else:
        if v<1:page_layer(frame,old,1-v)
        page_layer(frame,new,v)
    before=prev.items if prev else {}
    for k in dict.fromkeys((*before,*cur.items)):
        a,b=before.get(k),cur.items.get(k)
        if a and b and a.pic is b.pic:
            width=interp(a.width,b.width,v) if a.width is not None and b.width is not None else b.width
            paste(frame,fitted(b,width),interp(a.x,b.x,v),interp(a.y,b.y,v))
        elif cur.background=='scan-paper' and a and b:
            # Clear the outgoing text before revealing different words on the same line.
            if v<.5:paste(frame,fitted(a,a.width),a.x,a.y-3*v,1-ease(2*v))
            else:paste(frame,fitted(b,b.width),b.x,b.y+3*(1-v),ease(2*v-1))
        elif b and a and k=='specimen' and old is None and v<1:
            paste(frame,a.pic,a.x-9*v,a.y,1-v);paste(frame,b.pic,b.x+12*(1-v),b.y,v)
        else:
            if a and v<1:paste(frame,fitted(a,a.width),a.x-8*v,a.y,1-v)
            if b:
                # Set type only as the moving print clears its destination column.
                enter=ease((v-.74)/.26) if 'print' in before and 'print' in cur.items and a is None else v
                if enter==0:continue
                pic=fitted(b,b.width)
                if b.reveal and v<1 and pic.width>2:
                    visible=max(1,round(pic.width*enter))
                    pic=pic.crop((0,0,visible,pic.height))
                paste(frame,pic,b.x,b.y+6*(1-enter),enter if not b.reveal else 1)
    return frame
