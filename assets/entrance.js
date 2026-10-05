// A quiet interaction: no visible counter, no persisted unlock progress.
export function createKnock(gap=1200){
  let count=0,last=-Infinity;
  const knock=(now)=>{
    count=now-last>gap?1:count+1;
    last=now;
    if(count===5){count=0;last=-Infinity;return true}
    return false;
  };
  knock.reset=()=>{count=0;last=-Infinity};
  return knock;
}

export function bindEntrance(element,open){
  const knock=createKnock();
  element.addEventListener('click',event=>{
    event.preventDefault();
    if(knock(performance.now()))open();
  });
  // Ignore key auto-repeat: a held Enter key is not five intentional knocks.
  element.addEventListener('keydown',event=>{if(event.repeat)event.preventDefault()});
  document.addEventListener('pointerdown',event=>{if(!element.contains(event.target))knock.reset()});
  document.addEventListener('visibilitychange',()=>knock.reset());
}
