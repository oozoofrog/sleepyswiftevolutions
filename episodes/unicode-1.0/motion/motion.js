const canvas = document.getElementById('stage'), ctx = canvas.getContext('2d');
const images = {}, chapters = DATA.chapters;
const specs = {
  mapping: ['같은 한자, 서로 다른 번호', '한자 대조표', '171'],
  grid: ['76행과 73열이 만나는 곳', '한자 대조표', '171'],
  forms: ['두 개의 푸를 청', '한자 문자표', '98'],
  grain: ['한 획의 오른쪽 끝', '한자 대조표', '171'],
};
const ui = Object.fromEntries(['play','seek','timer','compare'].map(id => [id,document.getElementById(id)]));
const audio = new Audio();
let mode='mapping', time=0, comparing=false, ground;
const ease = x => { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
const ramp = (t,a,b) => ease((t-a)/(b-a));
const mix = (a,b,f) => a+(b-a)*f;
const pos = (x,y,s) => ({x,y,s});
const blend = (a,b,f) => pos(mix(a.x,b.x,f),mix(a.y,b.y,f),mix(a.s,b.s,f));
const at = (base,r) => pos(base.x+r.x*base.s,base.y+r.y*base.s,base.s);
const rect = (id,x,y,w,h) => ({id,x,y,w,h});
const row = [rect('code',0,0,63,38),rect('one',73,10,32,14),rect('oneTop',63,0,45,10),rect('oneLeft',63,10,10,14),rect('oneRight',105,10,3,14),rect('oneFoot',63,24,45,14),rect('rule',0,38,353,5)];
for(const [x,w,ids] of [[108,73,['china','japan','F']],[181,71,['B','korea','A']],[252,101,['C','I','X']]]){
  row.push(rect(ids[0],x,0,w,15),rect(ids[1],x,15,w,10),rect(ids[2],x,25,w,13));
}
const grid = row.filter(r=>r.id!=='korea').concat([rect('prefix',181,15,37,10),rect('r76',218,15,15,10),rect('c73',233,15,19,10)]);
const forms=[];
for(const [i,y,h,split,base] of [[0,0,61,26,43],[1,61,61,84,102]]){
  forms.push(rect('left'+i,0,y,14,h),rect('right'+i,51,y,15,h),rect('head'+i,14,y,37,8),
    rect('top'+i,14,y+8,37,split-y-8),rect('low'+i,14,split,37,base-split),
    rect('num'+i,14,base,37,y+h-base));
}
const rowBase=pos(110,294,3), formBase=pos(523,161,3.55);
function drawPart(img,r,p){
  ctx.drawImage(img,r.x,r.y,r.w,r.h,p.x,p.y,r.w*p.s,r.h*p.s);
}
function label(str,x,y,size=18,color='#51564e',family='"Apple SD Gothic Neo",sans-serif',align='left'){
  ctx.fillStyle=color;ctx.font=size+'px '+family;ctx.textAlign=align;ctx.fillText(str,x,y);
}
function rule(x1,y1,x2,y2,color='#999e94',w=1){
  ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function opacity(f,paint){if(f<=0)return;ctx.save();ctx.globalAlpha*=Math.min(1,f);paint();ctx.restore();}
function complete(img,base){ctx.drawImage(img,base.x,base.y,img.width*base.s,img.height*base.s);}
function layout(mode,t){
  const ch=chapters[mode],c=ch.cues, last=ch.duration;
  const p=ramp(t,c[0].start+.08,c[0].start+1.95);
  const back=ramp(t,mode==='grid'?c[3].start+.05:last-2.75,last-.52);
  const f=p*(1-back);
  const cue=(i,offset=0)=>ramp(t,c[i].start+offset,c[i].start+offset+1.3);
  return {c,f,back,cue};
}
function mapScene(t){
  const {f,cue,back}=layout('mapping',t);
  if(f===0){complete(images.row,rowBase);return;}
  const compact=pos(485,514,1.50);
  const lanes={china:[1,171,'중국'],japan:[2,285,'일본'],korea:[3,399,'한국']};
  const targets={};
  for(const [id,[i,y,country]] of Object.entries(lanes)){
    const k=cue(i)*(1-back);
    opacity(k,()=>{
      ctx.strokeStyle='#9b9f93';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(417,313);
      ctx.bezierCurveTo(540,313,519,y+37,666,y+37);ctx.stroke();
      label(country,704,y+12,20);
    });
    const r=row.find(r=>r.id===id);
    targets[id]=blend(blend(at(rowBase,r),at(compact,r),f),pos(697,y+19,4.15),k);
  }
  for(const r of row){
    let target=at(compact,r);
    if(r.id==='one')target=pos(161,254,8.25);
    if(r.id==='code')target=pos(177,364,2.55);
    drawPart(images.row,r,targets[r.id]??blend(at(rowBase,r),target,f));
  }
}
function gridScene(t){
  const {f,cue}=layout('grid',t);
  if(f===0){complete(images.row,rowBase);return;}
  const small=pos(768,467,1.04), left=367, top=227, cell=72, cx=left+3.5*cell, cy=top+2.5*cell;
  const col=cue(1),meet=cue(2);
  opacity(f,()=>{
    for(let i=0;i<=5;i++)rule(left+i*cell,top,left+i*cell,top+4*cell,'#c3c5bf');
    for(let i=0;i<=4;i++)rule(left,top+i*cell,left+5*cell,top+i*cell,'#c3c5bf');
    rule(left-13,cy,left+5*cell,cy,'#8a9280',1.4);
    opacity(col,()=>rule(cx,top-13,cx,top+4*cell,'#8a9280',1.4));
    opacity(meet,()=>{ctx.strokeStyle='#484f42';ctx.lineWidth=2;ctx.strokeRect(cx-cell/2,cy-cell/2,cell,cell);});
    label('행',332,cy+9,23);opacity(col,()=>label('열',cx+59,top-27,22));
    label('한국 문자표',806,396,25,'#454b43');
    label('설명을 위한 격자',806,428,17,'#686d65');
  });
  for(const r of grid){
    let dest=at(small,r);
    if(r.id==='r76')dest=pos(260,cy-28,4.8);
    if(r.id==='c73')dest=blend(dest,pos(cx-32,top-62,4.6),col);
    if(r.id==='one')dest=blend(dest,pos(cx-30,cy-13,1.88),meet);
    drawPart(images.row,r,blend(at(rowBase,r),dest,f));
  }
}
function formScene(t){
  const {f,cue}=layout('forms',t);
  if(f===0){complete(images.forms,formBase);return;}
  const separate=cue(1)*(1-cue(2)), pairX=[336,754], s=4.9;
  forms.forEach(r=>{
    const i=Number(r.id.slice(-1)), first=r.id.slice(0,-1), rel=r.y-61*i;
    let dest;
    if(['top','low','num'].includes(first)){
      let dx=pairX[i],dy=201+rel*s;
      if(first==='low'){dx+=(i===0?-17:17)*separate;dy+=36*separate;}
      if(first==='num')dy+=32*separate;
      dest=pos(dx,dy,s);
    }else{
      const x=pairX[i]+(r.x-14)*s;
      dest=pos(x,201+rel*s,s);
    }
    drawPart(images.forms,r,blend(at(formBase,r),dest,f));
  });
  opacity(f*separate,()=>{
    const y=387;
    rule(588,y,665,y,'#969c90');label('안쪽 획',626,y-14,19,'#565c51',undefined,'center');
  });
}
// Fine variations in density resolve before the black body of the stroke opens up.
const lensBuffers = ['typePlate','typeTone'].map(key=>{
  const surface=document.createElement('canvas');
  surface.width=1108;surface.height=390;
  return {key,context:surface.getContext('2d',{willReadFrequently:true})};
});
function drawOpticalDetail(camera,octave){
  if(octave<=2)return;
  const plate=DATA.plate, x=camera.x+plate.x*camera.s, y=camera.y+plate.y*camera.s;
  const w=plate.width*camera.s, h=plate.height*camera.s;
  const left=Math.max(86,Math.ceil(x)),top=Math.max(163,Math.ceil(y));
  const width=Math.min(1194,Math.floor(x+w))-left,height=Math.min(553,Math.floor(y+h))-top;
  if(width<=0||height<=0)return;
  if(octave>=6.6){
    ctx.drawImage(images.typePlate,x,y,w,h);
    return;
  }
  const [detail,mean]=lensBuffers.map(({key,context})=>{
    context.imageSmoothingQuality='high';
    context.drawImage(images[key],x-left,y-top,w,h);
    return context.getImageData(0,0,width,height).data;
  });
  const scan=ctx.getImageData(left,top,width,height);
  const textureGain=new Float32Array(256), toneGain=new Float32Array(256);
  for(let gray=0;gray<256;gray++){
    const ink=1-gray/255;
    textureGain[gray]=ramp(octave,2+.45*ink,4.45+.35*ink);
    toneGain[gray]=ramp(octave,3.2+.85*ink,5.8+.8*ink);
  }
  const pixels=scan.data;
  for(let i=0;i<pixels.length;i+=4){
    const gray=pixels[i];
    const value=gray+(mean[i]-gray)*toneGain[gray]+(detail[i]-mean[i])*textureGain[gray];
    pixels[i]=value;pixels[i+1]=pixels[i];pixels[i+2]=pixels[i];
  }
  ctx.putImageData(scan,left,top);
}
function grainScene(t, original=false){
  const cues=chapters.grain.cues;
  const inward=ramp(t,cues[0].start+.12,cues[1].end-.65);
  const outward=ramp(t,cues[2].start+.12,cues[2].end+.45);
  const travel=inward*(1-outward);

  const scale=rowBase.s*2**(7*travel);
  const px=99.35, py=16.38;
  const sx=mix(rowBase.x+px*rowBase.s,640,ramp(travel,0,.68));
  const sy=mix(rowBase.y+py*rowBase.s,353,ramp(travel,0,.68));
  const camera=pos(sx-px*scale,sy-py*scale,scale);
  ctx.save();ctx.beginPath();ctx.rect(86,163,1108,390);ctx.clip();
  const octave=7*travel;
  ctx.imageSmoothingEnabled=!original||octave<=2;
  complete(images.row,camera);
  if(!original)drawOpticalDetail(camera,octave);
  ctx.restore();
  opacity(ramp(travel,0,.24),()=>{
    if(original)label('초판 스캔 원본',86,588,17);
    else opacity(ramp(octave,4.9,6),()=>label('활자로 재구성한 확대 장면',86,588,17));
    label((scale/rowBase.s).toFixed(1)+' ×',1194,588,17,'#55594e','Menlo,monospace','right');
  });
}
function render(m,t,original=false){
  ctx.drawImage(ground,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const [title,kind,page]=specs[m];
  label('유니코드 표준 1.0  /  제2권',77,58,17);
  label(title,74,124,50,'#252923','AppleMyungjo,serif');
  label(kind+'  ·  '+page+'쪽',1203,59,18,'#5c6157',undefined,'right');
  rule(77,146,1203,146,'#bec2b9');
  if(original && m==='grain')grainScene(t,true);
  else if(original) complete(m==='forms'?images.forms:images.row,m==='forms'?formBase:rowBase);
  else ({mapping:mapScene,grid:gridScene,forms:formScene,grain:grainScene})[m](t);
  rule(77,611,1203,611,'#bec2b9');
  const cue=chapters[m].cues.find(c=>t>=c.start&&t<c.end);
  if(original)label('초판 원본',640,665,25,'#383d34',undefined,'center');
  else if(cue)label(cue.caption,640,665,29,'#21251f',undefined,'center');
}
function verify(parts,img){
  const surface=document.createElement('canvas');surface.width=img.width;surface.height=img.height;
  const c=surface.getContext('2d',{willReadFrequently:true});
  c.drawImage(img,0,0);const ref=c.getImageData(0,0,img.width,img.height).data;c.clearRect(0,0,img.width,img.height);
  for(const {x,y,w,h} of parts)c.drawImage(img,x,y,w,h,x,y,w,h);
  const actual=c.getImageData(0,0,img.width,img.height).data;
  let pixels=0;for(let i=0;i<actual.length;i+=4)if(actual[i]!==ref[i]||actual[i+3]!==ref[i+3])pixels++;
  return pixels;
}
function display(){render(mode,time,comparing);ui.seek.value=time;ui.timer.value=new Date(time*1000).toISOString().slice(14,19);}
function select(m){
  audio.pause();mode=m;time=0;comparing=false;ui.compare.setAttribute('aria-pressed','false');
  audio.src=chapters[m].audio;ui.seek.max=chapters[m].duration;ui.play.textContent='재생';
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));display();
}
function tick(){if(!audio.paused){time=audio.currentTime;display();requestAnimationFrame(tick);}}
ui.play.onclick=async()=>{if(!audio.paused){audio.pause();return;}if(time>=chapters[mode].duration-.05)time=0;audio.currentTime=time;await audio.play();tick();};
audio.onplay=()=>ui.play.textContent='일시 정지';audio.onpause=()=>ui.play.textContent='재생';
audio.onended=()=>{time=chapters[mode].duration;display();};
ui.seek.oninput=()=>{time=Number(ui.seek.value);audio.currentTime=time;display();};
ui.compare.onclick=()=>{comparing=!comparing;ui.compare.setAttribute('aria-pressed',comparing);display();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>select(b.dataset.mode));
async function start(){
  await Promise.all(Object.entries(DATA.images).map(async([name,src])=>{const img=new Image();img.src=src;await img.decode();images[name]=img;}));
  ground=document.createElement('canvas');ground.width=1280;ground.height=720;
  const g=ground.getContext('2d');g.fillStyle=g.createPattern(images.paper,'repeat');g.fillRect(0,0,1280,720);
  select(location.hash==='#grain'?'grain':mode);
  window.motion={ready:true, duration:m=>chapters[m].duration, frames:m=>chapters[m].frames,
    verify:()=>({mapping:verify(row,images.row),grid:verify(grid,images.row),forms:verify(forms,images.forms)}),
    sample:(m,t)=>{render(m,t);return canvas.toDataURL('image/png').split(',')[1];}};
}
start();
