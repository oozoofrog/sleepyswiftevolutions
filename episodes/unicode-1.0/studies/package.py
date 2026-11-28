"""Make a portable reader with source scans and the same soundtrack used in all three cuts."""
from pathlib import Path
import base64,io,json,subprocess
from PIL import Image
p=Path(__file__).resolve().parent
root=p.parent
audio=p/'study.m4a'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'audio/long/open.mp3'),'-i',str(root/'audio/long/korea.mp3'),
 '-filter_complex','[0:a]adelay=530:all=1[a];[1:a]adelay=4080:all=1[b];[a][b]amix=inputs=2:normalize=0,apad=whole_dur=10[v]','-map','[v]','-t','10','-c:a','aac','-b:a','128k',str(audio)],check=True)
docs=json.loads((root/'facsimiles.json').read_text())
def uri(data,mime):return 'data:'+mime+';base64,'+base64.b64encode(data).decode()
data={}
for page in docs['pages']:
    im=Image.open(root/'art'/(page+'.png')).convert('L')
    if page!='p171':im.thumbnail((1900,2500))
    out=io.BytesIO();im.save(out,format='WEBP',quality=87,method=4)
    data[page]=uri(out.getvalue(),'image/webp')
html=(p/'viewer.template.html').read_text().replace('__PAGES__',json.dumps(data)).replace('__FACS__',json.dumps(docs,ensure_ascii=False)).replace('__AUDIO__',uri(audio.read_bytes(),'audio/mp4'))
poster=p/'cover.jpg'
if poster.exists():html=html.replace('__POSTER__',uri(poster.read_bytes(),'image/jpeg'))
(p/'수묵-시안.html').write_text(html)
