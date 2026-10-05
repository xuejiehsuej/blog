import {filterPosts} from './content.js';
import {rows,article,emptyResults} from './views.js';
import {unseal} from './crypto.js';
import {bindEntrance} from './entrance.js';
import {refreshAtmosphere} from './atmosphere.js';

const main=document.querySelector('main'),door=document.querySelector('#door');
const root=document.body.dataset.root||'./',page=document.body.dataset.page;
const initialHTML=main.innerHTML,initialTitle=document.title;
let posts=null,privatePosts=null,privateView=false,unlockVersion=0;

function resetNavigation(){
 document.querySelectorAll('.site-navigation a').forEach(a=>a.removeAttribute('aria-current'));
 const current=page==='home'?'.nav-home':page==='about'?'.nav-about':['archive','article'].includes(page)?'.nav-archive':null;
 if(current)document.querySelector(current).setAttribute('aria-current','page');
}
function enterView(){refreshAtmosphere({enter:true});window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true})}
function showStudy(){
 main.innerHTML=`<section class="study"><div class="reading-tools"><button id="lock" class="return-button">← 收好手记，返回原页</button></div><span class="eyebrow">LETTERS AFTER THE RAIN</span><h1>雨停之后。</h1><p class="standfirst">这里没有结论的期限。<br>只有学习的痕迹，和一些写给自己的话。</p><div class="study-label">PRIVATE MARGINALIA <span>／ 页边手记</span></div>${rows(privatePosts,{privateView:true,root})}</section>`;
}
function restorePublic(){
 if(!privateView)return;
 privateView=false;main.innerHTML=initialHTML;document.title=initialTitle;resetNavigation();
 if(page==='archive'&&posts)applyFilters(false);
 refreshAtmosphere({enter:true});
}
function privateRoute(){
 const hash=location.hash;
 if(hash!=='#study'&&!hash.startsWith('#private/')){restorePublic();return}
 privateView=true;document.querySelectorAll('.site-navigation a').forEach(a=>a.removeAttribute('aria-current'));
 if(!privatePosts){main.innerHTML=`<section class="about"><span class="eyebrow">THE MARGIN</span><h1>这一页还没有展开。</h1><p>请从刊名进入，或返回公开札记。</p><button id="lock" class="return-button">← 返回原页</button></section>`;document.title='封存的手记 · 素屿札记'}
 else if(hash==='#study'){showStudy();document.title='雨停之后 · 素屿札记'}
 else {let id='';try{id=decodeURIComponent(hash.slice(9))}catch{}const p=privatePosts.find(p=>p.id===id);if(p){main.innerHTML=article(p,{root,privateView:true});document.title=p.title+' · 素屿札记'}else showStudy()}
 enterView();
}
function lock(){
 privatePosts=null;
 history.replaceState(null,'',location.pathname+location.search);
 restorePublic();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
}

async function loadPosts(){
 if(posts)return posts;
 const response=await fetch(root+'data/posts.json');if(!response.ok)throw Error('Article index unavailable');
 posts=await response.json();return posts;
}
function applyFilters(writeURL=true){
 if(!posts||privateView||page!=='archive')return;
 const params=new URLSearchParams(location.search);
 const category=params.get('category')||'全部',query=params.get('q')||'';
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
 document.querySelector('#search').value=query;
 const results=filterPosts(posts,category,query);
 document.querySelector('#post-list').innerHTML=rows(results,{root})||emptyResults();
 document.querySelector('#result-count').textContent=`${results.length} / ${posts.length} 篇札记`;
 if(writeURL){history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash)}
 refreshAtmosphere();
}
function setFilter(key,value){
 const url=new URL(location.href);
 if(!value||(key==='category'&&value==='全部'))url.searchParams.delete(key);else url.searchParams.set(key,value);
 history.replaceState(null,'',url);applyFilters(false);
}
main.addEventListener('click',event=>{
 if(event.target.closest('#lock')){lock();return}
 const category=event.target.closest('[data-category]');if(category){setFilter('category',category.dataset.category);return}
 if(event.target.closest('#reset')){history.replaceState(null,'',location.pathname);applyFilters(false)}
 // Private headings are within a client-only view; keep its route while scrolling.
 const toc=event.target.closest('#toc a');if(toc&&privateView){event.preventDefault();document.getElementById(toc.hash.slice(1))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
});
main.addEventListener('input',event=>{if(event.target.id==='search')setFilter('q',event.target.value)});

function themeLabel(){const dark=document.documentElement.dataset.theme==='dark';document.querySelector('#theme').setAttribute('aria-label',dark?'切换日间模式':'切换夜间模式');document.querySelector('#theme').textContent=dark?'☼':'◐'}
themeLabel();document.querySelector('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('sovue-theme',t)}catch{}themeLabel()};
bindEntrance(document.querySelector('#imprint'),()=>{document.querySelector('#unlock-status').textContent='';door.showModal();document.querySelector('#pass').focus()});
door.querySelector('.close').onclick=()=>door.close();
door.addEventListener('click',event=>{if(event.target===door){const r=door.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)door.close()}});
door.addEventListener('close',()=>{unlockVersion++;document.querySelector('#pass').value='';if(privatePosts)main.focus({preventScroll:true})});
document.querySelector('#unlock').onsubmit=async event=>{
 event.preventDefault();const version=++unlockVersion,status=document.querySelector('#unlock-status'),button=door.querySelector('[type=submit]');button.disabled=true;status.textContent='正在展开手记……';
 try{const response=await fetch(root+'data/archive.enc.json');if(!response.ok)throw Error('load');const decrypted=await unseal(await response.json(),document.querySelector('#pass').value);if(version!==unlockVersion)return;privatePosts=decrypted;door.close();if(location.hash==='#study')privateRoute();else location.hash='#study'}
 catch{if(version===unlockVersion)status.textContent='暗号还不对，或者信件暂时未能送达。再试一次。'}finally{button.disabled=false}
};
document.querySelector('.skip').onclick=event=>{event.preventDefault();main.focus({preventScroll:true});main.scrollIntoView()};
window.addEventListener('hashchange',privateRoute);
window.addEventListener('pageshow',()=>{if(page==='archive'&&posts)applyFilters(false)});
// Leaving this document locks private content, including a browser back/forward-cache restore.
window.addEventListener('pagehide',()=>{if(privateView||privatePosts){privatePosts=null;main.innerHTML=initialHTML;privateView=false;document.title=initialTitle;resetNavigation()}});
window.addEventListener('pageshow',event=>{if(event.persisted)privateRoute()});
refreshAtmosphere();privateRoute();
if(page==='archive')loadPosts().then(()=>applyFilters(false)).catch(()=>{document.querySelector('#archive-status').textContent='筛选暂时不可用，仍可直接阅读下列文章。'});
// Preserve previously shared public links from the first version.
if(location.hash==='#archive')location.replace(root+'archive/');
else if(location.hash==='#about')location.replace(root+'about/');
else if(location.hash.startsWith('#post/')){
 let id='';try{id=decodeURIComponent(location.hash.slice(6))}catch{}
 loadPosts().then(list=>{if(list.some(p=>p.id===id))location.replace(root+'posts/'+encodeURIComponent(id)+'/');else{history.replaceState(null,'',location.pathname+location.search+'#study');privateRoute()}}).catch(()=>{});
}
