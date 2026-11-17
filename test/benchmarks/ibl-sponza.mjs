/* global process, fetch, Buffer, URL, console, window */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const after = path.resolve(process.env.IBL_AFTER || path.join(root, '../after'));
const artifacts = process.env.SWARM_ARTIFACTS || path.join(root, '../results');
fs.mkdirSync(artifacts, {recursive:true});
const asset = path.join(artifacts,'Sponza.gltf');
const assetURL='https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Sponza/glTF/Sponza.gltf';
if(!fs.existsSync(asset)){
 const response=await fetch(assetURL);
 if(!response.ok)throw new Error(`Asset HTTP ${response.status}`);
 fs.writeFileSync(asset,Buffer.from(await response.arrayBuffer()));
}
const model=JSON.parse(fs.readFileSync(asset,'utf8'));
for(const item of [...(model.buffers||[]),...(model.images||[])]){
 const target=path.join(artifacts,item.uri);
 if(fs.existsSync(target))continue;
 const response=await fetch(new URL(item.uri,assetURL));
 if(!response.ok)throw new Error(`Asset dependency HTTP ${response.status}`);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,Buffer.from(await response.arrayBuffer()));
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 let file;
 if(url.pathname==='/')file=path.join(root,'test/benchmarks/ibl-sponza.html');
 else if(url.pathname.startsWith('/asset/'))file=path.join(artifacts,decodeURIComponent(url.pathname.slice(7)));
 else {const match=url.pathname.match(/^\/(before|after)\/(.*)$/);if(match)file=path.resolve(match[1]==='before'?root:after,match[2]);}
 if(!file || !fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
const results=[];
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--disable-frame-rate-limit','--disable-gpu-vsync','--disable-background-timer-throttling']});
 const page=await browser.newPage();
 page.on('pageerror',e=>console.error(e));
 await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
 for(const [width,height] of [[1920,1080],[3840,2160]]){
  for(let trial=0;trial<4;trial++){
   for(const variant of trial%2===0?['before','after']:['after','before']){
    await page.goto(`http://127.0.0.1:${server.address().port}/?variant=${variant}`);
    await page.waitForFunction('window.ready===true',{timeout:180000});
    const data=await page.evaluate((w,h)=>window.benchmark(w,h),width,height);
    results.push({variant,trial,...data});
    console.log(JSON.stringify(results.at(-1)));
    fs.writeFileSync(path.join(artifacts,'ibl-results.json'),JSON.stringify({assetURL,results},null,2));
    if(trial===0 && width===1920)await page.screenshot({path:path.join(artifacts,`sponza-${variant}.png`)});
   }
  }
 }
}finally{
 if(browser)await browser.close();
 await new Promise(r=>server.close(r));
}
