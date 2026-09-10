import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateRelease } from './release-schema.mjs';
const root=resolve(new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const meta=JSON.parse(await readFile(resolve(root,'release-meta.json'),'utf8'));validateRelease(meta);
for(const asset of ['assets/og-lastar.png','assets/apple-touch-icon.png','assets/download-qr.png'])assert.ok((await stat(resolve(root,asset))).size>0,`Missing ${asset}`);
const routes=['index.html','download/index.html','privacy/index.html','terms/index.html','community-guidelines/index.html','safety/index.html','delete-account/index.html','changelog/index.html','404.html','privacy.html','terms.html','community-guidelines.html'];let links=0;
for(const route of routes){const html=await readFile(resolve(root,route),'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${route}: one h1`);for(const required of ['name="description"','rel="canonical"','property="og:image"','name="theme-color"','rel="apple-touch-icon"','class="skip"'])assert.ok(html.includes(required),`${route}: missing ${required}`);assert.ok(!/mailto:|hello@|support@|google-analytics|googletagmanager|hotjar|<iframe|javascript:|innerHTML|eval\(/i.test(html),`${route}: forbidden integration`);for(const match of html.matchAll(/\b(href|src)="([^"]+)"/g)){const url=match[2];if(url.startsWith('#')){assert.ok(html.includes(`id="${url.slice(1)}"`),`${route}: missing anchor ${url}`);continue;}if(/^https:/.test(url)){const host=new URL(url).hostname;assert.ok(['lastar.me','github.com'].includes(host),`${route}: unknown external host`);continue;}assert.ok(url.startsWith('/'),`${route}: noncanonical relative link ${url}`);let path=resolve(root,'.'+url.split('#')[0]);try{if((await stat(path)).isDirectory())path=resolve(path,'index.html');await stat(path);}catch{assert.fail(`${route}: missing local asset/link ${url}`);}links++;}if(!meta.public_verified)assert.ok(!/href="https:\/\/github.com\/[^\"]+\.apk"/.test(html),`${route}: unverified binary link`);}
const css=await readFile(resolve(root,'site.css'),'utf8');assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes('focus-visible'));
assert.equal((await readFile(resolve(root,'CNAME'),'utf8')).trim(),'lastar.me');
// Bounded release-readiness copy regressions; public APK metadata is not service acceptance.
const home=await readFile(resolve(root,'index.html'),'utf8');
const download=await readFile(resolve(root,'download/index.html'),'utf8');
if(meta.service_status!=='active')for(const [name,html]of [['home',home],['download',download]]){
 assert.equal((html.match(/data-service-status="paused"/g)||[]).length,1,`${name}: one clear readiness notice`);
 assert.ok(html.includes('Beta 服务恢复验收尚未完成。'),`${name}: restoration is not accepted yet`);
 assert.ok(!html.includes('当前开放 Android Beta。'),`${name}: must not claim open service`);
 assert.ok(!html.includes('当前注册、登录与在线内容暂不可用。'),`${name}: must not confuse incomplete acceptance with a verified outage`);
}
for(const route of ['download/index.html','safety/index.html']){
 const html=await readFile(resolve(root,route),'utf8');
 assert.ok(html.includes('data-push-compatibility')&&html.includes('没有 GMS')&&html.includes('不能依赖远程通知送达'),`${route}: no-GMS boundary`);
}
for(const slug of ['privacy','terms','community-guidelines']){
 const html=await readFile(resolve(root,`${slug}/index.html`),'utf8');
 assert.ok(html.includes('data-legal-supplement')&&html.includes('2026-08-26')&&html.includes('不会自动加载本网页')&&html.includes('不代表你已重新同意'),`${slug}: distinguish website explanation from in-app consent`);
 assert.equal(await readFile(resolve(root,`${slug}.html`),'utf8'),html,`${slug}: legacy legal route stays consistent`);
}
const privacy=await readFile(resolve(root,'privacy/index.html'),'utf8');
assert.ok(privacy.includes('主数据库所在区域已确认为日本东京（ap-northeast-1）')&&privacy.includes('这不表示所有后端函数、日志、备份或其他服务商的数据都只在东京处理'), 'Tokyo assertion is scoped to the primary database');
console.log(`PASS: ${routes.length} documents, ${links} local links/assets, metadata, canonical URLs, privacy and fail-closed download gates.`);
console.log('PASS: recovery status, no-GMS notifications, in-app legal-version boundary, scoped Tokyo disclosure, and legacy legal-route consistency.');
