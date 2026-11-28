import { checkKoreanCopy } from "../../../src/lib/korean-copy";
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { synthesizeQwenScenes } from '../../../src/services/tts/qwen';
import { endingDigest } from '../../../src/services/ending-check';
import type { Scene } from '../../../src/schema/script';
const rows: string[][] = JSON.parse(await readFile(new URL('lines.json',import.meta.url),'utf8'));
let saved: {key:string;digest:string;seconds:number}[] = [];
try { saved = JSON.parse(await readFile(new URL('../audio/motion/manifest.json',import.meta.url),'utf8')); } catch {}
const folder=fileURLToPath(new URL('../audio/motion',import.meta.url));
const scenes: Scene[] = [];
for (const [id,caption,text] of rows) {
  const issue = checkKoreanCopy(caption) ?? checkKoreanCopy(text);
  if (issue) throw Error(id + ": " + issue);
  const scene = {id,narration:caption,speech:[{language:'ko',text,caption}]} as Scene;
  const digest = await endingDigest(scene,folder+'/'+id+'.mp3').catch(()=>null);
  if (!saved.some(r=>r.key===id && r.digest===digest)) scenes.push(scene);
}
saved=saved.filter(r=>!scenes.some(scene=>scene.id===r.key));
const clips=await synthesizeQwenScenes(scenes,folder,'qwen3-clone');
for(const [i,{result}] of clips.entries()) if(await endingDigest(scenes[i],result.audioPath)!==result.endingDigest) throw Error(scenes[i].id);
await writeFile(folder+'/manifest.json',JSON.stringify(saved.concat(clips.map(({result},i)=>({key:scenes[i].id,digest:result.endingDigest,seconds:result.durationSec}))),null,2));
