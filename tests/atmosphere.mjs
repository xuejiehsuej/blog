import {chromium,staticHost} from './support.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const host=await staticHost();
const browser=await chromium.launch({headless:true,channel:'msedge'});await mkdir('docs/qa/atmosphere',{recursive:true});const report=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(host.base+'/');await page.locator('.home-primary').waitFor();await page.waitForTimeout(700);
  const tap=async()=>width===390?page.locator('#imprint').tap():page.locator('#imprint').click();
  await tap();assert.equal(await page.locator('#door').evaluate(el=>el.open),false);
  await page.waitForTimeout(1350);
  for(let i=0;i<4;i++)await tap();assert.equal(await page.locator('#door').evaluate(el=>el.open),false);
  await tap();await page.locator('#pass').waitFor();await page.locator('.close').click();
  await page.waitForTimeout(150);
  await tap();await tap();await page.locator('.edition').click();for(let i=0;i<3;i++)await tap();assert.equal(await page.locator('#door').evaluate(el=>el.open),false);
  const entrance=await page.locator('#imprint').evaluate(el=>({background:getComputedStyle(el).backgroundColor,selection:getSelection().toString(),tap:getComputedStyle(el).webkitTapHighlightColor,shadow:getComputedStyle(el).boxShadow}));
  assert.equal(entrance.background,'rgba(0, 0, 0, 0)');assert.equal(entrance.selection,'');assert.equal(entrance.shadow,'none');assert.equal(await page.locator('#secret').count(),0);assert.ok(!(await page.locator('footer').innerText()).includes('页边'));
  if(width===1440){const before=await page.locator('.hero-art').evaluate(el=>getComputedStyle(el).transform);await page.mouse.move(1300,720);await page.waitForTimeout(450);const after=await page.locator('.hero-art').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(before,after)}
  await page.mouse.move(1,1);await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60))}scrollTo({top:0,behavior:'instant'})});await page.waitForTimeout(850);await page.screenshot({path:`docs/qa/atmosphere/home-${width}.png`,fullPage:true});
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width),'horizontal overflow');
  await page.goto(host.base+'/archive/');await page.waitForFunction(()=>document.querySelector('#result-count').textContent.includes('/'));await page.locator('.post-row').first().scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  await page.evaluate(()=>scrollTo({top:300,behavior:'instant'}));await page.waitForTimeout(150);const drift=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--drift'));assert.ok(parseFloat(drift)>0);
  if(width===1440){await page.locator('.post-row').first().hover();await page.waitForTimeout(600);assert.ok(await page.locator('.row-preview').first().evaluate(el=>el.getBoundingClientRect().height>70));await page.screenshot({path:'docs/qa/atmosphere/expanded-row.png'})}
  
  await page.locator('#search').fill('AI');assert.equal(await page.locator('main').evaluate(el=>el.getAnimations().length),0,'search must not animate the whole page');await page.locator('#search').fill('');
  const beforeMotion=await page.locator('.rain i').first().evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(120);assert.notEqual(await page.locator('.rain i').first().evaluate(el=>getComputedStyle(el).transform),beforeMotion);
  await page.locator('#theme').click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);await page.screenshot({path:`docs/qa/atmosphere/night-${width}.png`,fullPage:true});
  await page.goto(host.base+'/');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.film-travel').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await page.locator('.rain i').first().evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await page.locator('.post-row').last().evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.deepEqual(errors,[]);report.push({width,entrance,drift,checks:'five consecutive clicks/taps, timeout, outside click reset, no pointer highlight or selection, parallax, scrolling, card expansion, film animation, reduced motion, no overflow',errors});await context.close();
 }
 await writeFile('docs/qa/atmosphere/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await host.close()}
