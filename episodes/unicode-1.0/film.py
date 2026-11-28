"""Page layouts and time ranges for the two documentary cuts."""
from functools import lru_cache
from PIL import Image
from draw import ROOT, Item, Layout, Detail, item_text, ruler, layout, MUTED, RED, INK

@lru_cache(None)
def page_background(portrait):
    w,h=(1080,1920) if portrait else (1920,1080)
    paper=Image.open(ROOT/'motion/paper.png').convert('RGB')
    tile=paper.resize((paper.width*2,paper.height*2),Image.Resampling.BICUBIC)
    bg=Image.new('RGB',(w,h))
    for y in range(0,h,tile.height):
        for x in range(0,w,tile.width):
            bg.paste(tile,(x,y))
    return bg

def header(out, portrait):
    w=720 if portrait else 1280
    left=52 if portrait else 72
    item_text(out,'series','유니코드 1.0 연대기','title',24,left,62 if portrait else 43)
    item_text(out,'edition','1986 — 1992','label',17,w-(180 if portrait else 190),69 if portrait else 49,MUTED)
    ruler(out,'headrule',left,120 if portrait else 94,w-2*left,'#a2a69f')

# Date, title, exhibit label, exhibit text and dated source.
RECORDS = {
    'userfont': ('1986–1987 · 토론토','일본 문자표에서 찾은 한자','Xerox · Nakajima','중국 문자표 보완','제록스 사용 사례 · Unicode 1.0 연대기'),
    'davis': ('1987 · 애플','컴퓨터 사이의 파일 교환','Mark Davis','Apple File Exchange','초기 개발자 회고 · Early Years of Unicode'),
    'library': ('1983 · 도서관 전산화','책 제목을 원래 문자로','도서관 공동 목록','한·중·일 서지 기록','Karen Smith-Yoshimura · A Decade of RLIN CJK'),
    'karen': ('1988년 여름 · 팔로알토','어느 한자를 같은 글자로 볼까','Research Libraries Group','Karen Smith-Yoshimura · Alan Tucker','Joe Becker · Lee Collins와 한자 통합 기준 논의'),
    'cjk': ('1988.07 · 애플과 RLG','도서관의 한·중·일 문자 자료','Chinese · Japanese · Korean','CJK','애플, RLG 문자 데이터베이스 구입 · Unicode 1.0 연대기'),
    'network': ('1989.02 · 작업 그룹','전자우편으로 이어진 토론','Glenn Wright · Sun','Unicode@sun.com','Unicode 1.0 연대기 · 1989년 2월'),
    'nonhan': ('1990.10 · 양방향 문자','한 줄에 섞인 두 방향','Asmus Freytag · 양방향 소위원회','왼쪽에서 오른쪽으로   →','아랍어는 오른쪽에서 왼쪽으로 · Unicode 1.0 연대기'),
    'editing': ('1991.02–05 · 초판 편집','출판사로 간 원고','Erica Liederman · 편집','5월 8일','교정 전 원고 전달 · 출판사 Addison-Wesley'),
    'iso': ('1991.06–07 · 국제 표준','두 표준의 번호를 맞추다','ISO 10646 · Unicode','6월 초안 부결','7월에 분권 결정 · Unicode 1.0 연대기'),
    'krcjk': ('1991–1992 · CJK-JRG 한국 대표단','공동 목록을 검토한 한국 측 위원','Oh Young-taik · Lee Choon Tack','수석대표 오영택 · 편집위원 이춘택','유니코드 표준 1.0 제2권 감사의 글 (pp. v–vi)'),
    'press': ('1992.09 · PC Magazine','컴퓨터 잡지에 실린 유니코드','John C. Dvorak · 컴퓨터 칼럼니스트','Kiss Your ASCII Goodbye','영문 연대기 마지막 기록 · 드보락 자판 고안자 August Dvorak과 다른 인물'),
    'afterbecker': ('1991–1998 · 후일담','조 베커','Joseph D. Becker','컨소시엄 기술 부회장','유니코드 컨소시엄 역대 임원 기록'),
    'afterkaren': ('2023.04 · 구술 인터뷰','캐런 스미스요시무라','Karen Smith-Yoshimura','첫 서지 기록을 기다린 도서관들','2020년 OCLC 은퇴 · 2023년 구술 기록 120–121쪽'),
    'afterdavis': ('2026.09 · 컨소시엄 발표','마크 데이비스','Mark Davis · CLDR','날짜와 숫자의 지역별 표기','데이비스상 발표 · 첫 시상은 2027년 예정'),
    'afternelson': ('2025.07 취임 · 팔로알토','넬슨 응','Nelson Ng · Palo Alto Museum','제록스 인턴에서 박물관 이사장으로','팔로알토 박물관 이사회 · 2026년 11월 확인'),
    'aftermiyazawa': ('도쿄 · 일본 국립정보학연구소','미야자와 아키라','宮澤 彰 · Akira Miyazawa','명예교수','국립정보학연구소 명예교수 명단 · 2026년 11월 확인'),
    'afterchoontack': ('공주 · 공주대학교','이춘택','Lee Choon Tack · 문헌정보교육과','명예교수','1990–1991 CJK-JRG 한국 편집위원 · 공주대 명예교수 명단'),
    'afterkim': ('부산 · 부산대학교','김경석','Kyongsok Kim · 정보컴퓨터공학부','첫가끝 한글 자모 · 명예교수','초판 제1·2권 감사의 글 · 부산대 명예교수 명단'),
    'afterlee': ('2026.02 · 베트남 측 제안','리 콜린스와 두 공동 저자','Eiso Chan · Lee Collins · Ngô Trung Việt','따이어로 ‘누구’','제안서 L2/26-068 · 2026년 2월 4일'),
    'afterform': ('2026.02 · 베트남 측 제안','사전에서 확인한 글자꼴','등록 문자 U+2B8A0','글자꼴 수정 제안','제안서 L2/26-068 · 첫 쪽에 실린 근거 자료'),
    'cookiever': ('2026.09.16 · 최신 표준','유니코드 18.0','The Unicode Standard · Version 18.0','수록 문자 172,808자','유니코드 18.0 문자 통계 · 2026년 9월 16일 발표'),
    'cookielang': ('2026.10 · 문자 체계와 언어','175개 문자와 지원 언어','Supported Scripts 18.0 · CLDR 49','수천 개 언어 표기','유니코드 18.0 지원 문자 목록 · CLDR 49 (2026년 10월)'),
    'cookierare': ('희귀 언어 · 인도 토토파라 마을','인도 한 마을의 토토어','Dhaniram Toto (2015) · U+1E290–U+1E2BF','화자 약 1,500명 · 31자','제안서 L2/19-330 · 유니코드 18.0 토토 문자표'),
    'cookiemost': ('문자 수 비중 · 동아시아와 한국어','한자와 한글의 문자 수','통합·호환 한자 1위 · 단일 언어 문자 한글 1위','한자 102,999자 (약 60%)','유니코드 18.0 문자 통계 및 UCD Scripts.txt'),
}

COOKIE_ROWS = {
    'cookiever': [
        ('1991–1992 초판   28,294자', 'body', 22, MUTED),
        ('2026.09  18.0   172,808자', 'body', 26, RED),
        ('소전 11,328자 · 여진 문자 · 원시 쐐기 숫자 추가', 'body', 18, MUTED),
    ],
    'cookielang': [
        ('문자 체계 175개  ·  기본 언어 172개', 'body', 24, INK),
        ('로마자 등 공유 문자로 현대·고대 수천 개 언어 기록', 'body', 18, MUTED),
        ('CLDR 49 지역화 표준 · 185개 로케일 · 821개 언어 자료', 'body', 18, MUTED),
    ],
    'cookiemost': [
        ('一  U+4E00     ·     ㄱ  U+3131', 'title', 28, INK),
        ('동아시아 공유 한자  102,999자 (전체의 59.6%)', 'body', 19, INK),
        ('한국어 전용 한글  11,739자 (완성형 음절 11,172자)', 'body', 19, RED),
    ],
}

@lru_cache(None)
def archive_portrait(name):
    with Image.open(ROOT/'art'/(name+'.jpg')) as im:
        return im.convert('RGBA')

def record_layout(key,p):
    date,title,byline,exhibit,source=RECORDS[key]
    a=Layout('scan-paper',{})
    header(a,p)
    left=52 if p else 72
    if key.startswith(('after','cookie')):
        item_text(a,'edition','1991 — 2026','label',17,(720-180) if p else (1280-190),69 if p else 49,MUTED)
    item_text(a,'section',date,'body',19,left,165 if p else 132,MUTED)
    item_text(a,'chapter',title,'title',41,left,215 if p else 174)
    item_text(a,'under',byline,'latin' if key=='afterlee' else 'body',22,left,320 if p else 260)
    item_text(a,'recordText',exhibit,'body',32 if p else 39,left,413 if p else 348)
    if key in ('afterbecker','afterdavis'):
        name='joe-becker' if key=='afterbecker' else 'mark-davis'
        portrait=archive_portrait(name)
        x,y=(left,520) if p else (800,195)
        a.items['portrait']=Item(portrait,x,y,width=174)
        item_text(a,'portraitSource','유니코드 사진 기록 · 촬영 연도 미상','small',16,x,y+187,MUTED)
    elif key in ('afterlee','afterform'):
        window=(55,494,610,280) if p else (646,166,565,349)
        box=(.108,.13,.75,.232) if key=='afterlee' else (.156,.434,.847,.61)
        a.detail=Detail('collins26',box,window)
    elif key=='cookierare':
        window=(55,494,610,280) if p else (646,166,565,349)
        box=(.135,.042,.865,.36) if p else (.18,.042,.78,.44)
        a.detail=Detail('toto18',box,window)
    elif key in COOKIE_ROWS:
        ruler(a,'recordRule',left,490 if p else 430,545 if p else 520,'#aaaba4')
        rx,ry=(left,530) if p else (660,228)
        for i,(txt,face,sz,color) in enumerate(COOKIE_ROWS[key]):
            item_text(a,'cookie'+str(i),txt,face,sz,rx,ry+i*(64 if p else 66),color)
    else:
        ruler(a,'recordRule',left,502 if p else 430,545 if p else 735,'#aaaba4')
    item_text(a,'folio',source,'body',17,left,795 if p else 558,MUTED)
    return a

def film_layout(key,p,short=False):
    if key.startswith('scookie'):key=key[1:]
    left=52 if p else 72
    if key in RECORDS:return record_layout(key,p)
    if key in ('mapping','twoforms','credits'):
        a=Layout('scan-paper',{})
        header(a,p)
        if key=='credits':
            item_text(a,'creditHead','자료와 제작','title',42,left,230 if p else 165)
            for i,(heading,name) in enumerate([('원작 글','oozoofrog · 유니코드 1.0 연대기'),('참고 자료','The Unicode Standard · 제1권·제2권과 18.0'),('','Joseph D. Becker · Unicode 88 (1988)')]):
                y=(415 if p else 295)+i*(130 if p else 88)
                item_text(a,'h'+str(i),heading,'body',18,left,y,MUTED)
                item_text(a,'n'+str(i),name,'body',24 if p else 27,left if p else 254,y+(34 if p else -4))
            item_text(a,'blog','oozoofrog.dev/blog/chronology_unicode/','mono',17,left,911 if p else 590,MUTED)
            return a
        labels={'mapping':('세 나라의 문자표','중국 GB 2312   ·   일본 JIS X 0208   ·   한국 KS C 5601'),
                'twoforms':('두 개의 푸를 청','두 글자의 아랫부분')}
        head,note=labels[key]
        item_text(a,'chapter',head,'title',46,left,205 if p else 118)
        item_text(a,'under',note,'body',19,left,300 if p else 183,MUTED)
        source='제2권 98쪽 · 한자 문자표' if key=='twoforms' else '제2권 171쪽 · 한자 대조표'
        item_text(a,'folio',source,'body',17,left,884 if p else 584,MUTED)
        return a
    original={'name':'apple','merge':'pair','uro':'review','volume':'second'}.get(key,key)
    a=layout(original,p,short)
    a.background='scan-paper';a.items.pop('seal',None);header(a,p)
    def change(k,txt,face,size,x,y,color=INK):
        item_text(a,k,txt,face,size,x,y,color)
    def chapter(txt):
        change('chapter',txt,'title',44,left,211 if p else 172)
    def tag(txt):
        change('under',txt,'body',21,left,291 if p else 248,MUTED)
    def exhibit(page,box,credit):
        win=(56,550,608,280) if p else (665,185,535,334)
        a.detail=Detail(page,box,win)
        change('folio',credit,'body',16,win[0],win[1]+win[3]+15,MUTED)
    def right_text(rows):
        x,y=(left,670) if p else (688,255)
        for i,(txt,face,size) in enumerate(rows):
            change('right'+str(i),txt,face,size,x,y+i*(76 if p else 67),INK if i==0 else MUTED)
    if key in ('xerox','compare','why','apple','name','becker','shared','fixed','cost'):
        if key in ('xerox','compare','why'):
            right_text([('JIS   ↔   간체·번체','body',29),('일본 문자표          중국 문자표','body',19),('같은 한자를 찾아 대응표에 기록','body',20)])
        elif key in ('apple','name','becker','shared'):
            if key in ('apple','name'):
                right_text([('Apple File Exchange','label',32),('같은 파일을 서로 다른 기종에서 읽기','body',22)])
            else:
                exhibit('becker88',(.61,.045,.94,.27),'조 베커 · 1988년 8월 29일 제안서')
        else:
            right_text([('16 bit     16 bit','mono',33),('첫 문자               다음 문자','body',20),('1988년 제안의 고정 길이 설계','body',18)])
        if key=='name':
            tag('처음 기록된 이름')
            change('codes','1987.12  /  UNICODE','mono',21,left,534 if p else 496,RED)
    dates={'xerox':'1986–1987   ·   제록스','compare':'1986–1987   ·   제록스','why':'1986–1987   ·   제록스','apple':'1987   ·   애플','name':'1987.12','becker':'1988.08','shared':'1988.08','fixed':'1988.08','cost':'1988.08','merge':'1989.08','taiwan':'한자 통합','loss':'한자 통합','seoul':'1990.02','proposal':'1990.02','tokyo':'1991.07','review':'1991.07','book':'1991.10','empty':'1991.10','reason':'1991.10','uro':'1992.03','volume':'1992.06','question':'1992.06','unified':'1992.06','return':'1992.06','end':'1992.06'}
    if key in dates:
        change('section',dates[key],'body',19,left,165 if p else 132,MUTED)
    if key=='xerox':
        from film_opening import threshold_layout
        a.items.pop('specimen')
        exhibit_items=threshold_layout(p).items
        for name in ('print','documentCredit'):
            a.items[name]=exhibit_items[name]
        for redundant in ('under','codes','right0','right1','right2'):a.items.pop(redundant,None)
        right_text([('일본·중국 한자 대응표를 만든 네 사람','title',28),('Huan-mei Liao · Nelson Ng','label',23),('Dave Opstad · Lee Collins','label',23)])
    if key=='merge':
        for k in ['qing0','qing1']:a.items.pop(k,None)
        chapter('두 회사의 문자표를 합치다');tag('1989년 8월')
        change('merged','Apple   +   Xerox','label',39,left,415 if p else 354)
        right_text([('기존 문자표의 구별','title',31),('원래 문서로 돌아가기 위한 조건','body',22)])
    if key in ('tokyo','review','uro'):
        for k in ['group','groupko','groupkr']:a.items.pop(k,None)
        exhibit('p013',(.115,.245,.89,.435) if key!='uro' else (.12,.23,.89,.37),'유니코드 표준 1.0 · 제2권 13쪽')
        if key=='uro':
            chapter('공동 목록의 완성');tag('통합 한자와 배열 순서')
            change('city','URO 2.0','label',57,left,350 if p else 335)
            change('codes','1992.03','mono',23,left,450 if p else 434,RED)
    if p and key in ('apple','name','xerox','compare','why','fixed','cost'):
        a.items.pop('codes',None)
        if key=='name':tag('1987년 12월 · 처음 기록된 이름')
    if p and key in ('becker','shared'):
        a.items.pop('codes',None)
    return a
