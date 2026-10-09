import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
const pages=[],rows={},base=process.env.TMF_URL||'http://127.0.0.1:8780';let writes=0,chain=Promise.resolve();
const emit=async()=>Promise.all(pages.map(p=>p.evaluate(rows=>window.receive?.(rows),rows)));
for(const uid of ['one','two']){
 const context=await browser.newContext({serviceWorkers:'block'}),p=await context.newPage();pages.push(p);
 await p.exposeFunction('readRows',()=>rows);
 await p.exposeFunction('saveChoice',async choices=>{writes++;await new Promise(r=>setTimeout(r,350));rows[uid]={choices};await emit();});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());
 if(u.pathname==='/reaction-test')return route.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/style.css"><main id="test"></main><script type="module">import {reactions} from "/community-ui.js";document.querySelector("main").append(reactions("test"));</script>'});
 if(u.pathname.endsWith('firebase-auth.js'))return route.fulfill({contentType:'text/javascript',body:`const auth={currentUser:{uid:'${uid}'},authStateReady:async()=>{}};export const getAuth=()=>auth;export const browserSessionPersistence={};export const setPersistence=async()=>{};export const onAuthStateChanged=(a,cb)=>{cb(a.currentUser);return ()=>{}};`});
 if(u.pathname==='/cloud.js')return route.fulfill({contentType:'text/javascript',body:`let chain=Promise.resolve();const sdk={collection:()=>({}),doc:()=>({}),serverTimestamp:()=>0,onSnapshot:(ref,cb)=>{window.receive=rows=>cb({docs:Object.entries(rows).map(([id,data])=>({id,data:()=>data}))});window.readRows().then(window.receive);return ()=>{window.receive=null}},runTransaction:(db,fn)=>{const task=chain.then(async()=>{const rows=await window.readRows();let save;const result=await fn({get:async()=>({exists:()=>!!rows['${uid}'],data:()=>rows['${uid}']}),set:(ref,data)=>save=data});if(save)await window.saveChoice(save.choices);return result;});chain=task.catch(()=>{});return task;}};export const getCloud=async()=>({db:{},app:{},sdk});`});
 if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();return route.continue();});
 await p.goto(base+'/reaction-test');await p.waitForFunction(()=>document.querySelector('.reaction-button')?.textContent==='❤️ 0');
}
const [one,two]=pages;await one.locator('.reaction-button').nth(0).click();assert.equal(await one.locator('.reaction-button').nth(0).textContent(),'❤️ 1');assert.equal(await one.locator('.reaction-button').nth(0).isDisabled(),true);
await two.waitForFunction(()=>document.querySelector('.reaction-button').textContent==='❤️ 1');
for(const p of pages)for(let i=0;i<3;i++)if(await p.locator('.reaction-button').nth(i).isEnabled())await p.locator('.reaction-button').nth(i).click();
for(const p of pages)await p.waitForFunction(()=>[...document.querySelectorAll('.reaction-button')].every(b=>b.textContent.endsWith(' 2')&&b.disabled));
assert.equal(writes,6);await one.reload();await one.waitForFunction(()=>[...document.querySelectorAll('.reaction-button')].every(b=>b.textContent.endsWith(' 2')&&b.disabled));
const guide=await browser.newPage();await guide.goto(base+'/admin-guide.html');for(const width of [320,768,1440]){await guide.setViewportSize({width,height:900});assert.ok(await guide.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}await guide.screenshot({path:'/tmp/tmf-guide.png',fullPage:true});
console.log('PASS: immediate feedback, two users, all three independent reactions, six writes only, live counts, reload persistence, responsive guide.');await browser.close();
