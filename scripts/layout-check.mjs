import { chromium } from 'playwright';
import { createServer } from './serve.mjs';
const server=createServer();await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge'});
try{for(const [width,zoom]of [[768,false],[390,true]]){const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173');if(zoom)await page.evaluate(()=>document.documentElement.style.fontSize='200%');console.log(JSON.stringify({width,zoom,overflow:await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.className,right:Math.round(e.getBoundingClientRect().right)})))}));await page.screenshot({path:`qa-artifacts/layout-${width}.png`});await page.close();}}finally{await browser.close();server.close();}
