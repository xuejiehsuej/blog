import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
export const {chromium}=require('C:/Users/86137/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
export async function staticHost(){
 const root=path.resolve('dist'),prefix='/sovue-blog';
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml'};
 const server=createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);
  if(pathname===prefix){res.writeHead(301,{Location:prefix+'/'}).end();return}
  if(pathname.startsWith(prefix+'/'))pathname=pathname.slice(prefix.length);
  let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  if((await stat(file)).isDirectory()){if(!pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return}file=path.join(file,'index.html')}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));
 }catch{res.writeHead(404).end('Not found')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {base:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve)})};
}
export async function revealPage(page){
 await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,50))}scrollTo({top:0,behavior:'instant'})});
 await page.waitForTimeout(800);
}
