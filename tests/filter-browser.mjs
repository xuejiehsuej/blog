import assert from 'node:assert/strict';
import {chromium,staticHost} from './support.mjs';
const host=await staticHost(),browser=await chromium.launch({headless:true,channel:'msedge'});
try{const p=await browser.newPage();await p.goto(host.base+'/archive/');await p.waitForFunction(()=>document.querySelector('#result-count').textContent.includes('/'));await p.locator('#search').fill('全部');assert.equal(await p.locator('#search').inputValue(),'全部');assert.equal(new URL(p.url()).searchParams.get('q'),'全部');console.log('PASS literal search 全部 remains a query')}finally{await browser.close();await host.close()}
