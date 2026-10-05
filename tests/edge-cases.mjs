import assert from 'node:assert/strict';
import {chromium,staticHost} from './support.mjs';
const host=await staticHost(),b=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await b.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(host.base+'/#post/on-attention');await page.waitForURL('**/posts/on-attention/');assert.equal(await page.locator('.prose').count(),1);
 await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.prose').count(),1);assert.ok(page.url().endsWith('/posts/on-attention/'));
 await page.goto(host.base+'/#archive');await page.waitForURL('**/archive/');assert.equal(await page.locator('#search').count(),1);
 await page.goto(host.base+'/#about');await page.waitForURL('**/about/');assert.equal(await page.locator('.about').count(),1);
 await page.goto(host.base+'/sovue-blog/posts/tools/');await page.locator('#imprint').click({clickCount:5,delay:80});await page.locator('#pass').fill('雨停之后');await page.locator('.solid').click();await page.locator('#lock').waitFor();await page.reload();await page.getByRole('heading',{name:'这一页还没有展开。'}).waitFor();assert.equal(await page.locator('.study .post-row').count(),0);
 await page.locator('#lock').click();assert.equal(await page.locator('.prose').count(),1);
 await page.goto(host.base+'/sovue-blog/archive/?q=把一句话');await page.locator('.empty').waitFor();assert.equal(await page.locator('.post-row').count(),0);
 for(const width of [320,768,1280]){await page.setViewportSize({width,height:900});await page.goto(host.base+'/');await page.waitForTimeout(500);assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w,width),`overflow at ${width}`)}
 assert.deepEqual(errors,[]);console.log('PASS legacy links, skip-reading, private refresh locks, public isolation, 320/768/1280 layouts');
}finally{await b.close();await host.close()}
