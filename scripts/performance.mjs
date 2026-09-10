import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { mkdir,writeFile } from 'node:fs/promises';
import { createServer } from './serve.mjs';
const server=createServer();await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));await mkdir('qa-artifacts',{recursive:true});
const browser=await chromium.launch({args:['--remote-debugging-port=9223']});
try{for(const route of ['/','/download']){const result=await lighthouse('http://127.0.0.1:4173'+route,{port:9223,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});const name=route==='/'?'home':'download';await writeFile(`qa-artifacts/lighthouse-${name}.json`,result.report[0]);await writeFile(`qa-artifacts/lighthouse-${name}.html`,result.report[1]);const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)]));console.log(JSON.stringify({route,scores,LCP:result.lhr.audits['largest-contentful-paint'].numericValue,CLS:result.lhr.audits['cumulative-layout-shift'].numericValue}));if(scores.performance<85||scores.accessibility<95||scores['best-practices']<95||scores.seo<95)process.exitCode=1;}}finally{await browser.close();server.close();}
