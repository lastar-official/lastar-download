import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { validateRelease } from './release-schema.mjs';
const expected=JSON.parse(await readFile('release-meta.json','utf8'));
const nonce=Date.now();
const metaResponse=await fetch(`https://lastar.me/release-meta.json?verify=${nonce}`,{cache:'no-store'});
assert.equal(metaResponse.status,200);const meta=await metaResponse.json();validateRelease(meta);
for(const key of ['version','version_code','sha256','public_verified','latest_verified','service_status'])assert.equal(meta[key],expected[key],`Public metadata mismatch: ${key}`);
const rows=[];
for(const path of ['/','/download','/privacy','/terms','/community-guidelines','/safety','/delete-account','/changelog']){
 const response=await fetch(`https://lastar.me${path}?verify=${nonce}`,{cache:'no-store'});assert.equal(response.status,200,`${path} must be 200`);assert.equal(new URL(response.url).protocol,'https:');const html=await response.text();assert.ok(html.includes(`rel="canonical" href="https://lastar.me${path}"`),`${path} canonical`);assert.ok(!/mailto:hello@|mailto:support@/.test(html));
 if(path==='/download'){assert.ok(html.includes(meta.sha256));assert.ok(html.includes(meta.latest_verified?meta.stable_download_url:meta.direct_download_url));if(meta.service_status!=='active')assert.ok(html.includes('当前注册、登录与在线内容暂不可用'));}
 const assets=[...html.matchAll(/(?:src|href)="(\/[^"#]+\.(?:css|js|png|webp|jpg|svg))"/g)].map(x=>x[1]);for(const asset of new Set(assets)){const r=await fetch(`https://lastar.me${asset}?verify=${nonce}`,{cache:'no-store'});assert.equal(r.status,200,`${asset} asset`);assert.ok((await r.arrayBuffer()).byteLength>0);}
 rows.push(`${path}: HTTPS/200/canonical/assets PASS`);
}
const notFound=await fetch(`https://lastar.me/lastar-qa-missing-${nonce}`,{cache:'no-store'});assert.equal(notFound.status,404);assert.ok((await notFound.text()).includes('这颗星好像离开了轨道'));
await mkdir('qa-artifacts',{recursive:true});await writeFile('qa-artifacts/public-check.txt',rows.join('\n')+'\nCustom 404 PASS\n');console.log(rows.join('\n'));console.log('Custom 404, verified metadata and maintenance-state copy PASS');
