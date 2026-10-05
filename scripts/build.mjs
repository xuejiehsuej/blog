import {readFile,writeFile,mkdir,cp,rm,mkdtemp,rename} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {home,archive,about,article,shell} from './templates.mjs';
import {fetchIssuePosts} from './issues.mjs';
import {escape as e} from '../assets/content.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export function orderPosts(posts){
 return [...posts].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date)||b.id.localeCompare(a.id,undefined,{numeric:true}));
}
export async function buildSite({posts,config,output=path.join(ROOT,'dist')}){
 const target=path.resolve(output);
 // Destructive replacement is restricted to this project's generated dist or owned test temp folders.
 const tempRoot=path.resolve(os.tmpdir());
 if(target!==path.join(ROOT,'dist')&&!(target.startsWith(tempRoot+path.sep)&&/^sovue-[a-z0-9-]+$/i.test(path.basename(target))))throw Error('Refusing to replace an unrelated output directory');
 const seen=new Set();
 for(const p of posts){if(!/^[a-zA-Z0-9_-]+$/.test(p.id)||seen.has(p.id))throw Error('Invalid or duplicate post ID');seen.add(p.id)}
 posts=orderPosts(posts);
 const base=config.url.replace(/\/$/,'');const url=new URL(base);if(!['https:','http:'].includes(url.protocol))throw Error('Invalid site URL');
 const template=await readFile(path.join(ROOT,'index.html'),'utf8');
 const stage=await mkdtemp(path.join(path.dirname(target),'.sovue-build-'));
 try{
  await mkdir(path.join(stage,'data'),{recursive:true});
  await cp(path.join(ROOT,'assets'),path.join(stage,'assets'),{recursive:true});
  await cp(path.join(ROOT,'data/archive.enc.json'),path.join(stage,'data/archive.enc.json'));
  await writeFile(path.join(stage,'data/posts.json'),JSON.stringify(posts));
  await writeFile(path.join(stage,'.nojekyll'),'');
  const description='素屿札记：关于技术、时代与日常的私人刊物。';
  async function page(file,settings){const out=path.join(stage,file);await mkdir(path.dirname(out),{recursive:true});await writeFile(out,shell(template,{description,...settings}));}
  await page('index.html',{page:'home',root:'./',title:'首页 · 素屿札记',canonical:base+'/',content:home(posts)});
  await page('archive/index.html',{page:'archive',root:'../',title:'全部文章 · 素屿札记',canonical:base+'/archive/',content:archive(posts)});
  await page('about/index.html',{page:'about',root:'../',title:'关于 · 素屿札记',canonical:base+'/about/',content:about()});
  for(const [i,p] of posts.entries())await page(`posts/${p.id}/index.html`,{page:'article',root:'../../',title:p.title.replaceAll('\n','')+' · 素屿札记',description:p.summary,canonical:`${base}/posts/${p.id}/`,content:article(p,{root:'../../',next:posts[i+1]})});
  const siteRoot=url.pathname.replace(/\/$/,'')+'/';
  await page('404.html',{page:'not-found',root:siteRoot,title:'这页暂未收录 · 素屿札记',content:`<section class="about"><span class="eyebrow">PAGE NOT FOUND</span><h1>这页暂未收录。</h1><p>文章可能已被收起，或地址发生了变化。</p><a class="return-button" href="${e(siteRoot)}">← 回到首页</a></section>`});
  const addresses=['','archive/','about/',...posts.map(p=>`posts/${p.id}/`)];
  await writeFile(path.join(stage,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${addresses.map(p=>`<url><loc>${e(base+'/'+p)}</loc></url>`).join('')}</urlset>`);
  await writeFile(path.join(stage,'feed.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>素屿札记</title><link>${e(base)}/</link><description>技术、时代与日常。</description>${posts.map(p=>`<item><title>${e(p.title)}</title><link>${e(base)}/posts/${p.id}/</link><guid>${e(base)}/posts/${p.id}/</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${e(p.summary)}</description></item>`).join('')}</channel></rss>`);
  // target has been checked above; stage is created by mkdtemp next to that target.
  await rm(target,{recursive:true,force:true});await rename(stage,target);
 }catch(error){await rm(stage,{recursive:true,force:true});throw error}
 return posts.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const config=JSON.parse(await readFile(path.join(ROOT,'site.json'),'utf8'));
 if(process.env.SITE_URL)config.url=process.env.SITE_URL;
 const posts=process.env.GITHUB_TOKEN&&process.env.GITHUB_REPOSITORY?await fetchIssuePosts({repo:process.env.GITHUB_REPOSITORY,token:process.env.GITHUB_TOKEN}):JSON.parse(await readFile(path.join(ROOT,'data/posts.json'),'utf8'));
 const count=await buildSite({posts,config});console.log(`Built home, archive, about, ${count} static article pages, RSS and sitemap.`);
}
