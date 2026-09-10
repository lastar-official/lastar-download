import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('qa-artifacts',{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
try{for(const [width,height]of [[1440,1000],[390,844],[320,568]]){const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173');await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode();})));await page.screenshot({path:`qa-artifacts/preview-${width}.png`,fullPage:true});await page.screenshot({path:`qa-artifacts/hero-${width}.png`});await page.locator('#screenshots').screenshot({path:`qa-artifacts/gallery-${width}.png`});await page.close();}}finally{await browser.close();}
