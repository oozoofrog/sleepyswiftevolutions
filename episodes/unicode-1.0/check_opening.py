"""Check that the optical material and the document stay registered at both cuts."""
from unittest.mock import patch
import numpy as np
import microtype
from PIL import ImageChops

from document_zoom import document_frame
from draw import render_frame
from film import film_layout
from film_opening import ink_patch, opening, threshold_layout

def check(portrait):
    duration = 5
    peak = opening('travel',duration,.25,duration,portrait)
    arrival = opening('archive',0,.25,duration,portrait)
    assert ImageChops.difference(peak, arrival).getbbox() is None, 'heap moved at cut'

    # Exercise the moving camera, including independent sampling of the actual
    # grain. A matching still at the edit alone cannot catch a displaced plate.
    before = np.asarray(ink_patch(portrait,13.3,1).getchannel('A'),dtype=float)
    after = np.asarray(document_frame(portrait,1e-8).getchannel('A'),dtype=float)
    assert np.max(np.abs(before-after)) <= 2, 'grain is displaced at pullback'

    landing = opening('archive',duration,.25,duration,portrait)
    chapter = render_frame(threshold_layout(portrait),film_layout('xerox',portrait,portrait),portrait,0)
    assert ImageChops.difference(landing,chapter).getbbox() is None, 'document moved at cut'

def check_same_ink(portrait):
    # Remove one registered group of letters. Its absence must be visible through
    # the real opening compositor at reading distance and at the closest view.
    original=microtype.plate()
    fx,fy=map(round,microtype.focus(original))
    aperture=(fx-128,fy-80,fx+128,fy+80)
    altered=original.copy()
    altered.paste(microtype.PAPER,aperture)
    def samples():
        ink_patch.cache_clear()
        microtype.levels.cache_clear()
        return [opening(key,t,.25,5,portrait) for key,t in
                [('intro',0),('choose',5),('travel',2.5),('travel',5)]]
    reference=samples()
    with patch.object(microtype,'plate',return_value=altered):
        changed=samples()
    ink_patch.cache_clear()
    microtype.levels.cache_clear()
    for a,b in zip(reference,changed):
        difference=np.asarray(ImageChops.difference(a,b))
        assert np.count_nonzero(difference[:,:,0]>12)>12, 'camera lost the registered letters'

if __name__ == '__main__':
    for portrait in (False,True):
        check(portrait)
        check_same_ink(portrait)
    print('Both editions share the same printed letters from frame one to the document cut.')
