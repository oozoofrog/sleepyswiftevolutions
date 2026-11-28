"""Extract a Poppler facsimile and register a point inside its first printed letter."""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
from xml.etree import ElementTree

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

def register(pdf, page, crop, word, output):
    scale = 16
    left, top, right, bottom = crop
    if page < 1 or min(left,top) < 0 or right <= left or bottom <= top or not word:
        raise ValueError('Use a positive page number, a nonempty word and a valid crop')
    with tempfile.TemporaryDirectory() as directory:
        prefix = Path(directory) / 'excerpt'
        options = ['-f', str(page), '-l', str(page)]
        xml = subprocess.check_output(['pdftotext', *options, '-bbox', str(pdf), '-'])
        words = [w for w in ElementTree.fromstring(xml).findall('.//{*}word')
                 if w.text == word and left <= float(w.get('xMin')) < right
                 and top <= float(w.get('yMin')) < bottom and float(w.get('xMax')) <= right
                 and float(w.get('yMax')) <= bottom]
        if len(words) != 1:
            raise ValueError('Select a crop that contains exactly one matching anchor word')
        subprocess.run(['pdftoppm', *options, '-r', str(scale*72), '-x', str(left*scale),
                        '-y', str(top*scale), '-W', str((right-left)*scale),
                        '-H', str((bottom-top)*scale), '-singlefile', '-gray', '-png',
                        str(pdf), str(prefix)], check=True)
        with Image.open(prefix.with_suffix('.png')) as pic:
            excerpt = pic.convert('L')
    box = tuple(round((float(words[0].get(key))-offset)*scale)
                for key, offset in zip(('xMin','yMin','xMax','yMax'), (left,top,left,top)))
    ink = np.asarray(excerpt.crop(box)) < 100
    cols = np.flatnonzero(ink.any(axis=0))
    breaks = np.flatnonzero(np.diff(cols)>1)
    if not len(cols) or (len(word)>1 and not len(breaks)):
        raise ValueError('Anchor needs a separated initial glyph')
    start, end = cols[0], cols[breaks[0]]+1 if len(breaks) else cols[-1]+1
    distance = distance_transform_edt(np.pad(ink[:, start:end],1))[1:-1,1:-1]
    # Prefer an interior junction near the optical centre over an outer serif.
    rows,cols = np.where(distance >= .65*distance.max())
    by,bx = np.where(ink[:, start:end])
    nearest = np.argmin(((rows-(by.min()+by.max())/2)/max(1,np.ptp(by)))**2
                        +((cols-(bx.min()+bx.max())/2)/max(1,np.ptp(bx)))**2)
    y,x = rows[nearest],cols[nearest]
    output.parent.mkdir(parents=True,exist_ok=True)
    excerpt.save(output.with_suffix('.png'))
    metadata = dict(page=page,cropPoints=crop,word=word,pixelsPerPoint=scale,
                    pdfSha256=hashlib.sha256(pdf.read_bytes()).hexdigest(),
                    anchor=[int(box[0]+start+x),int(box[1]+y)],radius=float(distance[y,x]))
    output.with_suffix('.json').write_text(json.dumps(metadata,indent=2)+'\n')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf',type=Path)
    parser.add_argument('--page',type=int,required=True)
    parser.add_argument('--crop',type=int,nargs=4,required=True)
    parser.add_argument('--word',required=True)
    parser.add_argument('--output',type=Path,required=True)
    args = parser.parse_args()
    register(args.pdf,args.page,args.crop,args.word,args.output)
