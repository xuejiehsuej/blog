import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium,staticHost,revealPage} from './support.mjs';
const host=await staticHost(),browser=await chromium.launch({headless:true,channel:'msedge'});const report=[];
await mkdir('docs/qa/multipage',{recursive:true});
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:950},hasTouch:width===390,isMobile:width===390});const page=await context.newPage();const errors=[],failedResources=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failedResources.push([r.url(),r.status()])});
  const base=host.base+'/sovue-blog/';
  await page.goto(base);await page.locator('.home-primary').waitFor();
  assert.equal(await page.locator('[data-primary="on-attention"]').count(),1);assert.equal(await page.locator('.secondary-card').count(),2);assert.equal(await page.locator('.compact-row').count(),1);
  assert.equal(await page.locator('.nav-home').getAttribute('aria-current'),'page');assert.equal(await page.locator('#search').count(),0);
  await revealPage(page);await page.screenshot({path:`docs/qa/multipage/home-${width}.png`,fullPage:true});
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width));
  await page.locator('.primary-read').click();await page.waitForURL('**/posts/on-attention/');await page.locator('.prose').waitFor();
  assert.ok((await page.locator('.prose').innerText()).includes('热闹之外'));assert.equal(await page.locator('.return-button').count(),2);assert.equal(await page.locator('.nav-archive').getAttribute('aria-current'),'page');
  const path=page.url();await page.reload();await page.locator('.prose').waitFor();assert.equal(page.url(),path);
  await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(page.url(),path);assert.equal(await page.locator('.prose').count(),1);
  await page.locator('#toc a').first().click();assert.ok(page.url().includes('#section-0'));assert.equal(await page.locator('.prose').count(),1);
  await revealPage(page);await page.screenshot({path:`docs/qa/multipage/article-${width}.png`,fullPage:true});
  await page.locator('.prose p').last().scrollIntoViewIfNeeded();assert.ok(await page.locator('.site-navigation').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<2),'navigation must remain visible');
  await page.locator('.reading-tools .return-button').click();await page.waitForURL('**/archive/');await page.locator('#search').waitFor();
  await page.waitForFunction(()=>document.querySelector('#result-count').textContent.includes('/'));
  await page.locator('[data-category="AI 评论"]').click();assert.equal(await page.locator('.post-row').count(),1);
  await page.locator('#search').fill('不存在的文章');await page.locator('.empty').waitFor();await page.locator('#reset').click();assert.equal(await page.locator('.post-row').count(),4);
  await page.locator('[data-category="AI 评论"]').click();await page.locator('.post-row').first().click();await page.waitForURL('**/posts/tools/');
  await page.goBack();await page.waitForURL('**/archive/?category=*');await page.waitForFunction(()=>document.querySelectorAll('.post-row').length===1);
  await page.locator('[data-category="全部"]').click();await revealPage(page);await page.screenshot({path:`docs/qa/multipage/archive-${width}.png`,fullPage:true});
  await page.locator('#theme').click();await page.reload();await page.locator('#search').waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await revealPage(page);await page.screenshot({path:`docs/qa/multipage/night-${width}.png`,fullPage:true});
  await page.goto(base+'posts/on-attention/');await page.locator('.prose').waitFor();
  const knock=async()=>{for(let i=0;i<5;i++){if(width===390)await page.locator('#imprint').tap();else await page.locator('#imprint').click()}};
  await knock();await page.locator('#pass').fill('错误');await page.locator('.solid').click();await page.getByText('暗号还不对，或者信件暂时未能送达。再试一次。').waitFor();
  await page.locator('#pass').fill('雨停之后');await page.locator('.solid').click();await page.locator('#lock').waitFor();assert.equal(await page.locator('.post-row').count(),2);
  await page.locator('.post-row').first().click();await page.locator('.prose').waitFor();assert.ok((await page.locator('.prose').innerText()).includes('加密演示稿'));
  await page.locator('#toc a').first().click();assert.ok(page.url().includes('#private/'));await page.locator('.reading-tools .return-button').click();await page.locator('#lock').click();assert.equal(await page.locator('.prose').count(),1);assert.equal(await page.locator('.study').count(),0);
  await page.locator('.nav-about').click();await page.waitForURL('**/about/');assert.equal(await page.locator('.nav-about').getAttribute('aria-current'),'page');await page.locator('.nav-home').click();await page.waitForURL(base);
  assert.deepEqual(errors,[]);assert.deepEqual(failedResources,[]);report.push({width,basePath:'/sovue-blog/',checks:'hierarchy, independent article, reload, TOC, skip link, sticky nav, return buttons, filter, browser back, theme, nested private unlock/read/lock, about, home',errors,failedResources});await context.close();
 }
 const noScriptBrowser=await chromium.launch({headless:true,channel:'msedge'});const context=await noScriptBrowser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto(host.base+'/sovue-blog/posts/on-attention/');assert.ok((await page.locator('.prose').innerText()).includes('热闹之外'));await page.locator('.reading-tools .return-button').click();assert.equal(await page.locator('.post-row').count(),4);await page.locator('.nav-home').click();assert.equal(await page.locator('.home-primary').count(),1);await context.close();await noScriptBrowser.close();
 report.push({javaScriptDisabled:'article, archive and home readable and navigable'});
 await writeFile('docs/qa/multipage/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await host.close()}
