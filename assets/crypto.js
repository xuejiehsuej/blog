const enc=new TextEncoder(),dec=new TextDecoder();
const b64=b=>{let s='';for(const n of new Uint8Array(b))s+=String.fromCharCode(n);return btoa(s)};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(password,salt){const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
export async function seal(data,password){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt),enc.encode(JSON.stringify(data)));return {v:1,salt:b64(salt),iv:b64(iv),cipher:b64(cipher)}}
export async function unseal(data,password){if(data.v!==1)throw Error('Unknown archive');return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},await key(password,bytes(data.salt)),bytes(data.cipher))))}
