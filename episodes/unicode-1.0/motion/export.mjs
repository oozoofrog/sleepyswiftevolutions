import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {once} from 'node:events';
const dir=resolve('episodes/unicode-1.0/motion'),tmp=resolve(process.argv[2]);
const profile=await mkdtemp(join(tmp,'chrome-'));
const app=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--disable-extensions','--disable-background-networking','--disable-breakpad','--no-first-run','--no-default-browser-check','--remote-debugging-pipe','--user-data-dir='+profile],{stdio:['ignore','ignore','ignore','pipe','pipe']});
let id=0,rest='';const req=new Map();
app.stdio[4].on('data',data=>{rest+=data.toString();let split;while((split=rest.indexOf('\0'))!==-1){const msg=JSON.parse(rest.slice(0,split));rest=rest.slice(split+1);const job=req.get(msg.id);if(job){req.delete(msg.id);if(msg.error)job.reject(Error(JSON.stringify(msg.error)));else job.resolve(msg.result)}}});
const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const n=++id;req.set(n,{resolve,reject});app.stdio[3].write(JSON.stringify({id:n,method,params,sessionId})+'\0')});
try{
 const {targetId}=await call('Target.createTarget',{url:'about:blank'});const {sessionId:s}=await call('Target.attachToTarget',{targetId,flatten:true});
 const test=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},s);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await call('Page.navigate',{url:pathToFileURL(join(dir,'초판-스캔.html')).href},s);
 for(let i=0;i<120;++i){if(await test('Boolean(window.motion?.ready)'))break;await new Promise(r=>setTimeout(r,150))}
 if(!await test('Boolean(window.motion?.ready)'))throw Error('Viewer startup failed');

 const verified=await test('window.motion.verify()');
 if(Object.values(verified).some(n=>n!==0))throw Error(JSON.stringify(verified));
 console.log('Mismatched native pixels',verified);
 const controls=await test(`(()=>{document.querySelector('[data-mode=grain]').click();const a=mode==='grain';ui.seek.value=4.5;ui.seek.oninput();ui.compare.click();const b=comparing&&time===4.5;ui.compare.click();return a&&b&&!comparing})()`);
 if(!controls)throw Error('Reader controls failed');
 const requested=process.argv.slice(3);
 for(const m of requested.length?requested:['mapping','grid','forms','grain']){
   const frames=await test('window.motion.frames('+JSON.stringify(m)+')');
   const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','24','-vcodec','png','-i','pipe:0','-i',join(tmp,m+'.m4a'),'-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-tune','grain','-crf','13','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',join(dir,m+'.mp4')],{stdio:['pipe','ignore','inherit']});
   const finished=once(ff,'exit');
   for(let n=0;n<frames;n++){
     const data=await test('window.motion.sample('+JSON.stringify(m)+','+n+'/24)');
     const buf=Buffer.from(data,'base64');
     if(n===Math.floor(frames*.62)||n===frames-1)await writeFile(join(tmp,m+'-'+(n===frames-1?'end':'study')+'.png'),buf);
     if(!ff.stdin.write(buf))await once(ff.stdin,'drain');
   }
   ff.stdin.end();const [exit]=await finished;if(exit!==0)throw Error(m);console.log(m,frames);
 }
}finally{await call('Browser.close').catch(()=>{});app.kill();await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:600}).catch(()=>{})}
