// Runs unchanged both in the source repo and in the public static repo's read-only CI.
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(process.argv[2]??'.');
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(join(root,'website-release.json'),'utf8'));
if(manifest.domain!=='lastar.me'||manifest.appPublic!==false||manifest.adminPublic!==false||manifest.supportConfirmation!=='owner-attested-roundtrip-2026-10-17')throw Error('Release scope gate failed');
let bytes=0;
for(const file of manifest.files){
 if(/(?:^|\/)(?:\.git|\.env|node_modules|qa|admin)(?:\/|$)|\.(?:apk|map|keystore|jks|dart|ts|tsx)$/i.test(file.path))throw Error('Non-public artifact: '+file.path);
 const b=await readFile(join(root,file.path));if(hash(b)!==file.sha256||b.length!==file.size)throw Error('Artifact digest mismatch: '+file.path);bytes+=b.length;
 if(/\.(?:html|txt|js|json|css)$/.test(file.path)&&!file.path.startsWith('legacy-beta/')){
  const text=b.toString('utf8');
  if(/sb_(?:secret|publishable)_[a-zA-Z0-9_-]{20,}|gh[pousr]_[a-zA-Z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:https?:\/\/)(?:127\.0\.0\.1|192\.168\.|10\.\d+\.)|nmatqskbcxbrkdxwohgi|build41/i.test(text))throw Error('Private configuration/artifact reference: '+file.path);
 }
}
for(const route of manifest.routes){
 const html=await readFile(join(root,route==='/'?'index.html':route.slice(1)+'index.html'),'utf8');
 if(!html.includes('<h1')||!html.includes('https://lastar.me'+route))throw Error('Page metadata gate failed: '+route);
 if(/<script[^>]*src="[^">]*\/_next\//i.test(html)||html.includes('self.__next_f.push'))throw Error('Framework hydration prohibited: '+route);
 if(route==='/'&&manifest.cinematic?.version==='Cinematic-R2-FastStart'){
  if(!html.includes('<script type="module" src="/'+manifest.cinematic.module+'"></script>')||!html.includes('id="community-film"')||!html.includes('AI 情境影像')||!html.includes('id="motion-toggle"')||!html.includes('hero-preload'))throw Error('Cinematic root gate failed');
  const runtime=await readFile(join(root,manifest.cinematic.module),'utf8');if(/__lastarOrbit|diagnose\(/.test(runtime)||!runtime.includes('/assets/cinematic-faststart/'))throw Error('Runtime scope failed');
 }else if(!/<script defer src="\/lastar-ui\.[a-f0-9]+\.js"><\/script>/.test(html))throw Error('Information website must use lean first-party interactions: '+route);
 if(/<form\b|href=["'][^"']*(?:\.apk|localhost|127\.0\.0\.1|\/admin\/)|noindex/i.test(html))throw Error('Public content gate failed: '+route);
 for(const tag of ['description','og:title','og:image','canonical'])if(!html.includes(tag))throw Error('Missing SEO '+tag+route);
}
if((await readFile(join(root,'CNAME'),'utf8')).trim()!=='lastar.me')throw Error('CNAME changed');
if((await stat(join(root,'.nojekyll'))).size!==0)throw Error('Missing static Pages marker');
const walk=async(dir)=>{const files=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='.git')continue;const path=join(dir,e.name);if(e.isDirectory())files.push(...await walk(path));else files.push(relative(root,path).replaceAll('\\','/'))}return files};
const forbidden=(await walk(root)).filter(p=>/\.(?:apk|map|keystore|jks|p12)$/.test(p));if(forbidden.length)throw Error('Private artifacts present: '+forbidden.join(','));
console.log(JSON.stringify({status:'PASS',routes:manifest.routes.length,files:manifest.files.length,bytes,sourceCommit:manifest.sourceCommit,appPublic:false,adminPublic:false}));
