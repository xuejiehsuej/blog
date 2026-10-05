const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer: fine)');
const root=document.documentElement;
const rain=document.querySelector('.rain');
for(let i=0;i<46;i++){
  const drop=document.createElement('i');
  drop.style.cssText=`--x:${(i*37.73)%100}%;--delay:${-(i%13)*.67}s;--duration:${1.1+(i%9)*.22}s;--length:${25+(i%7)*17}px;--alpha:${.12+(i%5)*.07}`;
  rain.append(drop);
}

let targetX=0,targetY=0,x=0,y=0,frame=0;
function update(){
  frame=0;
  if(reduced.matches||document.hidden)return;
  x+=(targetX-x)*.085;y+=(targetY-y)*.085;
  root.style.setProperty('--look-x',x.toFixed(3));
  root.style.setProperty('--look-y',y.toFixed(3));
  const scroll=Math.min(scrollY,900);
  root.style.setProperty('--drift',`${(scroll*.075).toFixed(1)}px`);
  root.style.setProperty('--scroll-turn',`${(scroll*.006).toFixed(2)}deg`);
  const height=document.documentElement.scrollHeight-innerHeight;
  root.style.setProperty('--read-progress',height>0?String(scrollY/height):'0');
  if(Math.abs(targetX-x)>.002||Math.abs(targetY-y)>.002)requestUpdate();
}
function requestUpdate(){if(!frame&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(update)}
addEventListener('pointermove',event=>{if(!fine.matches)return;targetX=(event.clientX/innerWidth-.5)*2;targetY=(event.clientY/innerHeight-.5)*2;requestUpdate()},{passive:true});
document.addEventListener('pointerleave',()=>{targetX=targetY=0;requestUpdate()});
addEventListener('scroll',requestUpdate,{passive:true});
addEventListener('resize',requestUpdate,{passive:true});
function sync(){
  document.body.classList.toggle('motion-paused',document.hidden);
  if(reduced.matches){cancelAnimationFrame(frame);frame=0;x=y=targetX=targetY=0;for(const p of ['--look-x','--look-y','--drift','--scroll-turn'])root.style.removeProperty(p)}else requestUpdate();
}
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);

const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}},{threshold:.08});
export function refreshAtmosphere({enter=false}={}){
  observer.disconnect();
  document.querySelectorAll('.post-row,.secondary-card,.editor-note,.film-interlude,.section-heading').forEach((el,i)=>{
    el.classList.add('reveal-scene');el.style.setProperty('--stagger',`${Math.min(i%4,2)*75}ms`);observer.observe(el);
  });
  const isHome=document.body.dataset.page==='home'&&!location.hash.startsWith('#study')&&!location.hash.startsWith('#private/');
  document.body.classList.toggle('inner-page',!isHome);
  if(enter&&!reduced.matches)document.querySelector('main').animate([{opacity:.3,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.2,.75,.2,1)'});
  requestUpdate();
}
sync();
