import {escape as e,renderBody} from './content.js';

export const postUrl=(p,root='./')=>`${root}posts/${encodeURIComponent(p.id)}/`;
export const categoryUrl=(category,root='./')=>`${root}archive/?category=${encodeURIComponent(category)}`;
export const plainTitle=p=>p.title.replaceAll('\n','');
export const meta=p=>`<span class="eyebrow">${e(p.category)}</span><time datetime="${e(p.date)}">${e(p.date.replaceAll('-',' / '))}</time><span>${e(p.read||'3')} MIN READ</span>`;

export function rows(list,{root='./',privateView=false,compact=false}={}){
 return list.map((p,i)=>`<a class="post-row ${compact?'compact-row':''}" ${compact?`data-latest="${e(p.id)}"`:''} href="${privateView?`#private/${encodeURIComponent(p.id)}`:postUrl(p,root)}"><span class="row-no">${String(i+1).padStart(2,'0')}</span><div><div class="post-meta">${meta(p)}</div><h3>${e(plainTitle(p))}</h3>${compact?'':`<p>${e(p.summary)}</p>`}</div><span class="row-arrow">↗</span>${compact?'':`<div class="row-preview"><span>OPEN THE FILE</span><p>${e(p.body.replace(/^## .*$/gm,'').replace(/\n+/g,' ').trim().slice(0,125))}</p><b>继续阅读 ↗</b></div>`}</a>`).join('');
}

export const emptyResults=()=>'<div class="empty"><span>∅</span><h3>这一页，暂时空着。</h3><p>换一个关键词，或回到全部文章。</p><button id="reset">清除筛选 ↗</button></div>';

export function article(p,{root='./',privateView=false,next=null}={}){
 const headings=[];
 const body=renderBody(p.body).replace(/<h2>(.*?)<\/h2>/g,(_,text)=>{const id=`section-${headings.length}`;headings.push({id,text});return `<h2 id="${id}">${text}</h2>`});
 const back=privateView?'#study':`${root}archive/`;
 const label=privateView?'返回手记目录':'返回文章列表';
 return `<article class="reading"><div class="reading-tools"><a class="return-button" href="${back}"><span>←</span>${label}</a><a class="quiet-home" href="${root}">回到首页 ↗</a></div><div class="breadcrumbs" role="navigation" aria-label="当前位置"><a href="${root}">首页</a><span>›</span><a href="${privateView?'#study':categoryUrl(p.category,root)}">${e(p.category)}</a><span>›</span><span aria-current="page">${e(plainTitle(p))}</span></div><header class="article-heading"><div class="article-label">${privateView?'FROM THE PRIVATE SHELF':'SOVUE NOTES · THE JOURNAL'}</div><h1>${e(p.title)}</h1><div class="post-meta">${meta(p)}</div><p class="standfirst">${e(p.summary)}</p></header><div class="article-layout"><aside><span class="eyebrow">此页目录</span><div id="toc">${headings.map(h=>`<a href="#${h.id}">${h.text}</a>`).join('')}</div><a class="aside-return" href="${back}">← ${label}</a></aside><div class="prose">${body}<div class="article-end">✦</div></div></div>${next?`<a class="next-article" href="${postUrl(next,root)}"><span class="eyebrow">下一篇札记</span><strong>${e(plainTitle(next))}</strong><span>继续阅读 ↗</span></a>`:''}<div class="article-foot"><a class="return-button" href="${back}"><span>←</span>${label}</a><a class="quiet-home" href="${root}">回到首页 ↗</a></div></article>`;
}
