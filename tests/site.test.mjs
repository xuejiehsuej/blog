import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,access} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
const config={url:'https://example.github.io/sovue-blog'};
const posts=[1,4,2,3].map(n=>({id:`note-${n}`,title:`Article ${n}`,summary:`Summary ${n}`,category:'AI 观察',date:`2026-09-0${n}`,body:'## First section\n\nReadable without JavaScript.',read:'2'}));

test('build produces independent static pages, sorted editorial levels and relative links',async()=>{
 const {buildSite}=await import('../scripts/build.mjs');
 const output=await mkdtemp(path.join(os.tmpdir(),'sovue-pages-'));
 await buildSite({posts,config,output});
 const home=await readFile(path.join(output,'index.html'),'utf8');
 assert.match(home,/data-page="home"/);assert.match(home,/data-primary="note-4"/);
 assert.match(home,/data-secondary="note-3"/);assert.match(home,/data-secondary="note-2"/);
 assert.match(home,/data-latest="note-1"/);assert.ok(home.indexOf('data-primary')<home.indexOf('data-secondary'));
 assert.match(home,/href="\.\/posts\/note-4\/"/);assert.doesNotMatch(home,/#post\//);
 const article=await readFile(path.join(output,'posts/note-4/index.html'),'utf8');
 assert.match(article,/Readable without JavaScript/);assert.match(article,/href="\.\.\/\.\.\/archive\/"/);
 assert.match(article,/src="\.\.\/\.\.\/assets\/app.js"/);assert.match(article,/aria-current="page"/);
 assert.match(article,/https:\/\/example.github.io\/sovue-blog\/posts\/note-4\//);
 for(const file of ['archive/index.html','about/index.html','404.html','sitemap.xml','feed.xml'])await access(path.join(output,file));
 const feed=await readFile(path.join(output,'feed.xml'),'utf8');assert.match(feed,/\/posts\/note-4\//);assert.doesNotMatch(feed,/#post/);
});

test('empty site remains navigable and old article files disappear on rebuild',async()=>{
 const {buildSite}=await import('../scripts/build.mjs');const output=await mkdtemp(path.join(os.tmpdir(),'sovue-empty-'));
 await buildSite({posts,config,output});await buildSite({posts:[],config,output});
 assert.match(await readFile(path.join(output,'index.html'),'utf8'),/第一篇札记/);
 assert.match(await readFile(path.join(output,'archive/index.html'),'utf8'),/全部文章/);
 await assert.rejects(()=>access(path.join(output,'posts/note-4/index.html')));
});

test('Issue source paginates, accepts only owner open posts and fails closed',async()=>{
 const {fetchIssuePosts}=await import('../scripts/issues.mjs');let calls=0;
 const issue=(n,user='owner',extra={})=>({number:n,title:`[POST] Article ${n}`,body:'A summary\n\n## Heading\n\nText',state:'open',created_at:'2026-09-01T00:00:00Z',user:{login:user},labels:[{name:'AI'}],...extra});
 const fake=async()=>({ok:true,json:async()=>++calls===1?[issue(1),issue(2,'other'),issue(3,'owner',{pull_request:{}}),...Array.from({length:97},(_,i)=>issue(i+4,'other'))]:[issue(101),issue(102,'owner',{state:'closed'})]});
 const data=await fetchIssuePosts({repo:'owner/blog',token:'test',fetcher:fake});
 assert.equal(calls,2);assert.deepEqual(data.map(p=>p.id),['issue-1','issue-101']);
 await assert.rejects(()=>fetchIssuePosts({repo:'owner/blog',token:'test',fetcher:async()=>({ok:false,status:403})}),/403/);
});
