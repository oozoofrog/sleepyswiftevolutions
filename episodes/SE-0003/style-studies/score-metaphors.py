"""Master approved-voice takes from a Qwen batch with aligned follow-on phrases."""
import json
import math
from pathlib import Path
import subprocess
import sys
import wave
import numpy as np

HERE=Path(__file__).resolve().parent
ep=HERE.parent
work=Path(sys.argv[1])
rows=json.loads((HERE/'metaphors.json').read_text())
aligned=json.loads((work/'aligned.json').read_text())['items']
score=[]
raw=work/'spoken.pcm'
with raw.open('wb') as full:
    for i,((title,script),row) in enumerate(zip(rows,aligned,strict=True)):
        with wave.open(row['wavPath']) as f:
            rate=f.getframerate()
            assert rate==24000 and f.getnchannels()==1
            take=np.frombuffer(f.readframes(f.getnframes()),'<i2').astype(float)
        chars=[(c,item) for item in row['alignedItems'] for c in item['text'] if c.isalnum()]
        words=''.join(c for c,_ in chars)
        expected=''.join(c for c in script if c.isalnum())
        assert words==expected+'잠시쉬어볼까요',(i,words,expected)
        a,b=script.split('. ',1)
        second=chars[sum(c.isalnum() for c in a)][1]['startSec']
        last=chars[len(expected)-1][1]
        boundary=(last['endSec']+chars[len(expected)][1]['startSec'])/2
        rms=np.sqrt(np.mean(take[:len(take)//240*240].reshape(-1,240)**2,axis=1))
        lo=max(0,int((boundary-.18)*100));hi=min(len(rms)-4,int((boundary+.18)*100))
        gap=min(range(lo,hi+1),key=lambda n: rms[n:n+4].mean()+abs(n/100-boundary)*80)
        audible=np.flatnonzero(rms[:gap+1]>max(34,rms[:gap+1].max()*.022))
        start=max(0,(audible[0]-5)*240)
        stop=min((gap+2)*240,(audible[-1]+8)*240)
        gain=1+.75*np.clip((np.arange(stop)/rate-max(last['startSec']-.05,audible[-1]/100-.30))/.10,0,1)
        filtered=take[start:stop]*gain[start:stop]
        filtered[-240:]*=np.linspace(1,0,240)
        pcm=filtered.clip(-32768,32767).astype('<i2').tobytes()
        # Give the code reprise three seconds at the end of each reading.
        lead=.30
        end=lead+len(pcm)/(2*rate)
        recap=max(end+.16,7.0)
        frames=math.ceil((recap+3.1)*24)
        padding=frames*(rate//24)-round(lead*rate)-len(pcm)//2
        full.write(bytes(round(lead*rate)*2)+pcm+bytes(padding*2))
        score.append(dict(title=title,frames=frames,recap=recap,end=end,
                          second=lead+second-start/rate,lines=[a+'.',b]))
target=ep/'audio'/'style-studies'
target.mkdir(parents=True,exist_ok=True)
length=sum(r['frames'] for r in score)/24
subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar','24000','-ac','1','-i',str(raw),
                '-stream_loop','-1','-i',str(ep/'audio/evening-keys.m4a'),'-filter_complex',
                f'[0:a]highpass=f=65,loudnorm=I=-17:TP=-2:LRA=8[voice];[1:a]volume=0.24,afade=t=in:d=2,afade=t=out:st={length-3}:d=3[music];[voice][music]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.86[out]',
                '-map','[out]','-t',str(length),'-ar','48000','-c:a','aac','-b:a','160k',str(target/'metaphor-score.m4a')],check=True)
(HERE/'metaphor-timing.json').write_text(json.dumps(score,ensure_ascii=False,indent=2)+'\n')
