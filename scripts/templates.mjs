import {escape as e} from '../assets/content.js';
import {postUrl,categoryUrl,plainTitle,meta,rows,article} from '../assets/views.js';
import {heroStage,film} from './fragments.mjs';

export function home(posts){
 if(!posts.length)return '<section class="about"><span class="eyebrow">首页 / HOME</span><h1>第一篇札记，还在路上。</h1><p>这里很快会有新的文字。</p><a class="return-button" href="./archive/">浏览文章索引 ↗</a></section>';
 const primary=posts[0],secondary=posts.slice(1,3),latest=posts.slice(3,7),categories=[...new Set(posts.map(p=>p.category))];
 return `<section class="hero home-primary" data-primary="${e(primary.id)}"><div class="hero-copy"><div class="eyebrow"><i></i> 最新主推 <span>THE LATEST STORY</span></div><a href="${postUrl(primary)}"><h1>${e(primary.title).replace('\n','<br>')}</h1></a><p>${e(primary.summary)}</p><a class="primary-read" href="${postUrl(primary)}">阅读全文 <span>↗</span></a><div class="hero-bottom">${e(primary.category)} <span>／</span> ${e(primary.date.replaceAll('-',' / '))}</div></div>${heroStage(primary,'./')}</section>
 ${secondary.length?`<section class="secondary-section" aria-labelledby="secondary-heading"><div class="section-heading secondary-heading"><h2 id="secondary-heading">也值得一读<small>ALSO IN THIS JOURNAL</small></h2><span>接着翻阅</span></div><div class="secondary-grid">${secondary.map((p,i)=>`<a class="secondary-card" data-secondary="${e(p.id)}" href="${postUrl(p)}"><div class="secondary-top"><span class="eyebrow">${e(p.category)}</span><span>0${i+2}</span></div><h2>${e(plainTitle(p))}</h2><p>${e(p.summary)}</p><div class="secondary-bottom"><time>${e(p.date.replaceAll('-',' / '))}</time><span>阅读札记 ↗</span></div></a>`).join('')}</div></section>`:''}
 <div class="home-lower-grid"><section class="latest-section"><div class="section-heading"><h2>更多札记<small>FROM THE ARCHIVE</small></h2><a href="./archive/">全部 ${posts.length} 篇 ↗</a></div>${latest.length?rows(latest,{compact:true}):'<p class="small-empty">更多文字，正在慢慢写下。</p>'}<a class="archive-link" href="./archive/">前往文章索引 <span>浏览、分类与搜索 ↗</span></a></section><aside class="topic-shelf"><span class="eyebrow">按主题翻阅</span><h2>从一个兴趣开始。</h2>${categories.map(c=>`<a href="${categoryUrl(c)}"><span>${e(c)}</span><small>${String(posts.filter(p=>p.category===c).length).padStart(2,'0')} ↗</small></a>`).join('')}</aside></div>
 ${film()}<section class="editor-note"><span>编者按<br><small>EDITOR’S NOTE</small></span><p>这里收录对技术与时代的观察，也容纳一些不那么确定的想法。<br>慢慢写，慢慢想。</p><span class="signature">Sovue</span></section>${posts.some(p=>p.demo)?'<p class="demo-note">创刊预览 · 当前文章为排版演示稿</p>':''}`;
}

export function archive(posts){
 const categories=[...new Set(posts.map(p=>p.category))];
 return `<section class="archive-page"><div class="breadcrumbs" role="navigation" aria-label="当前位置"><a href="../">首页</a><span>›</span><span aria-current="page">全部文章</span></div><div class="archive-heading"><div><span class="eyebrow">THE COMPLETE JOURNAL</span><h1>全部文章</h1><p>按时间翻阅，或从一个主题开始寻找。</p></div><span class="archive-total"><b>${String(posts.length).padStart(2,'0')}</b>篇札记</span></div><div class="filters"><div class="categories" aria-label="文章分类">${['全部',...categories].map(c=>`<button data-category="${e(c)}" aria-pressed="${c==='全部'}">${e(c)}</button>`).join('')}</div><label class="search"><span>⌕</span><input id="search" type="search" placeholder="寻找一段文字…" aria-label="搜索文章"></label></div><div class="archive-caption"><span id="result-count" role="status">共 ${posts.length} 篇札记</span><span>新 → 旧</span></div><div id="post-list">${rows(posts,{root:'../'})||'<div class="empty"><h2>第一篇札记，还在路上。</h2></div>'}</div><p id="archive-status" role="status"></p><div class="endnote"><span>✦</span>慢慢翻阅，不必着急。<span>✦</span></div><a class="return-button" href="../"><span>←</span>回到首页</a></section>`;
}

export const about=()=>`<section class="about"><div class="breadcrumbs" role="navigation" aria-label="当前位置"><a href="../">首页</a><span>›</span><span aria-current="page">关于</span></div><span class="eyebrow">ABOUT THIS JOURNAL</span><h1>文字是时间的<br><em>另一种刻度。</em></h1><p>素屿札记，一本不定期更新的私人刊物。</p><p>这里记录 AI 新闻与行业变化，也收录愿意与人分享的日常思考。它不急着给所有问题一个答案，更希望留下观察、推敲与改变看法的过程。</p><div class="about-rule"></div><p>愿你在这里找到一点共鸣，也带走一个新的问题。</p><span class="signature">Sovue</span><div class="about-return"><a class="return-button" href="../"><span>←</span>回到首页</a></div></section>`;

export function shell(template,{page,root,title,description,canonical,content}){
 const replacements={page,root,title:e(title),description:e(description),canonical:canonical?`<link rel="canonical" href="${e(canonical)}">`:'',content,bodyClass:page==='home'?'home-page':'inner-page',homeActive:page==='home'?'aria-current="page"':'',archiveActive:['archive','article'].includes(page)?'aria-current="page"':'',aboutActive:page==='about'?'aria-current="page"':''};
 return template.replace(/\{\{(\w+)\}\}/g,(_,key)=>replacements[key]??'');
}
export {article};
