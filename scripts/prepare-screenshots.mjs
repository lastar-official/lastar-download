// Approved privacy-preserving crops of genuine QA screenshots. No UI is fabricated.
// Usage: node scripts/prepare-screenshots.mjs D:/Projects/LaStar
import sharp from 'sharp';
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const appRoot=process.argv[2];if(!appRoot)throw new Error('Pass the existing LaStar app artifact root');
const normal='artifacts/android_qa/20260827_000249/screenshots/normal_font_1_0/';
const phase2='artifacts/android_qa_phase2/20260826_174753/screenshots/A/';
const release='artifacts/release_qa/20260910_pinned_smoke/site-screens/';
const sources=[
 {name:'universe',source:release+'universe.png',crop:{left:0,top:120,width:1080,height:2220},description:'Pinned 1.4.0+7 Release; cached/offline empty Universe. No identities.'},
 {name:'activities',source:phase2+'a_activities.png',crop:{left:0,top:120,width:1080,height:1670},description:'Activity menu; no identities or private shared content.'},
 {name:'living-universe',source:phase2+'a_living_universe.png',crop:{left:0,top:120,width:1080,height:1980},description:'Living Universe tools; no identities or private content.'},
 {name:'star-map',source:normal+'constellation.png',crop:{left:0,top:120,width:1080,height:2220},description:'Personal Star Map empty state; no entries or identity.'},
 {name:'safety',source:release+'safety.png',crop:{left:0,top:120,width:1080,height:2220},description:'Pinned 1.4.0+7 Release; local Safety Center interface. No identities.'},
 {name:'privacy-guard',source:release+'privacy-guard.png',crop:{left:0,top:120,width:1080,height:2220},description:'Pinned 1.4.0+7 Release; local Privacy Guard interface. No identities.'}
];
await mkdir('assets/screenshots',{recursive:true});
for(const item of sources){await sharp(resolve(appRoot,item.source)).extract(item.crop).resize({width:540,withoutEnlargement:true}).webp({quality:88}).toFile(`assets/screenshots/${item.name}.webp`);}
let mark=await readFile(resolve(appRoot,'assets/brand/lastar_mark.svg'),'utf8');mark=mark.replace(/\s*<rect[^>]+\/>/,'');await writeFile('assets/brand-mark.svg',mark);
await writeFile('content/screenshot-provenance.json',JSON.stringify({source:'Real Android Beta QA artifacts, 2026-08-26/27; pinned 1.4.0+7 Release screenshots, 2026-09-10',treatment:'Crop system bars and resize only. No replacement text, compositing, AI UI or identity retouching. September captures show cached/local UI while Beta backend was paused; they do not demonstrate live server data.',images:sources},null,2)+'\n');
console.log('Prepared six identity-free real interface screenshots/details and existing transparent brand mark.');
