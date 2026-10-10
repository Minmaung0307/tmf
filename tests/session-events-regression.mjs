import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const base=process.env.TMF_URL||'http://127.0.0.1:8780';
const auth=`
const user={uid:'test',email:'test@example.com',getIdTokenResult:async()=>({claims:{email_verified:true},signInProvider:'google.com'})};
const auth={currentUser:sessionStorage.getItem('fixture-login')?user:null,authStateReady:async()=>{}};
const listeners=new Set();const notify=()=>listeners.forEach(cb=>cb(auth.currentUser));
export const browserSessionPersistence={};export const getAuth=()=>auth;export const setPersistence=async()=>{};
export const onAuthStateChanged=(a,cb)=>{listeners.add(cb);queueMicrotask(()=>cb(a.currentUser));return ()=>listeners.delete(cb);};
export class GoogleAuthProvider{setCustomParameters(){}}
export const signInWithPopup=async()=>{auth.currentUser=user;sessionStorage.setItem('fixture-login','yes');notify();return {user};};
export const signOut=async()=>{auth.currentUser=null;sessionStorage.removeItem('fixture-login');notify();};`;
const cloud=`
export const cloudEventsEnabled=true;
const sdk={doc:(...args)=>({id:args.at(-1)}),getDocFromServer:async()=>({exists:()=>false}),onSnapshot:(ref,next)=>{next({exists:()=>false});return ()=>{};}};
export const getCloud=async()=>({app:{},db:{},sdk});export const publishedPlaces=async()=>[];
export const watchPublishedEvents=async(next,error)=>{window.live=next;window.liveError=error;next([]);return ()=>{};};
export const watchPublicEvent=async(id,next)=>{window.detail=next;return ()=>{window.detailStopped=true;};};
export const publicEvent=async()=>{throw Error('unavailable')};`;
try{
 const c=await browser.newContext({serviceWorkers:'block'});const errors=[];
 c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/cloud.js'))return r.fulfill({contentType:'text/javascript',body:cloud});if(u.pathname.endsWith('/firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:auth});if(!['localhost','127.0.0.1'].includes(u.hostname))return r.abort();return r.continue();});
 const p=await c.newPage();await p.goto(base+'/#submit');await p.getByRole('button',{name:'Sign in with Google',exact:true}).click();await p.locator('#submissionSignOut').waitFor({state:'visible'});
 await p.reload();await p.locator('#submissionSignOut').waitFor({state:'visible'});
 const second=await c.newPage();await second.goto(base+'/#submit');await second.getByRole('button',{name:'Sign in with Google',exact:true}).click();await second.locator('#submissionSignOut').waitFor({state:'visible'});
 await p.locator('#submissionSignOut').click();await p.locator('#submissionSignOut').waitFor({state:'hidden'});await second.locator('#submissionSignOut').waitFor({state:'hidden'});
 for(const page of [p,second]){await page.reload();await page.getByRole('button',{name:'Sign in with Google',exact:true}).waitFor();assert.doesNotMatch(await page.locator('#submissionAccount').innerText(),/Signed in/);}
 // A stale tab's persisted Firebase session must not survive an earlier sign-out.
 await p.evaluate(()=>sessionStorage.setItem('fixture-login','yes'));await p.evaluate(()=>sessionStorage.setItem('tmf:session-generation','old'));await p.reload();await p.getByRole('button',{name:'Sign in with Google',exact:true}).waitFor();assert.equal(await p.evaluate(()=>sessionStorage.getItem('fixture-login')),null);
 await p.getByRole('button',{name:'Sign in with Google',exact:true}).click();await p.locator('#submissionSignOut').waitFor({state:'visible'});
 await p.goto(base+'/#events');await p.waitForFunction(()=>window.live);
 const event={id:'one',cloud:true,title:'Live event',templeName:'Temple',city:'City',state:'NC',dateStart:'2026-10-23',address:'Public address'};
 await p.evaluate(e=>window.live([e],{fromCache:false}),event);await p.locator('.event-card').waitFor();assert.doesNotMatch(await p.locator('.event-card').innerText(),/undefined/);
 await p.getByRole('button',{name:'Event details',exact:true}).click();await p.waitForFunction(()=>window.detail);await p.evaluate(()=>{window.live([],{fromCache:false});window.detail(null);});await p.locator('.event-details-dialog').waitFor({state:'detached'});assert.equal(await p.locator('.event-card').count(),0);assert.equal(await p.evaluate(()=>window.detailStopped),true);
 await p.evaluate(()=>window.live([],{fromCache:true}));assert.match(await p.locator('#eventCloudStatus').innerText(),/Waiting for the server/);
 for(const width of [390,1440]){await p.setViewportSize({width,height:900});const gap=await p.locator('.event-create-action').evaluate(el=>el.nextElementSibling.getBoundingClientRect().top-el.getBoundingClientRect().bottom);assert.equal(gap,7);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.getByRole('link',{name:'＋ Create an event'}).click();await p.waitForFunction(()=>document.querySelector('[name=event_start]').required);await p.evaluate(()=>location.hash='submit');await p.waitForFunction(()=>!document.querySelector('[name=event_start]').required);assert.equal(await p.locator('[name=subject]').getAttribute('placeholder'),'New place, correction, or event');
 assert.deepEqual(errors,[]);console.log('PASS: sign-out + reload, cross-tab sign-out, stale session rejection, explicit sign-in recovery, live event deletion + dialog cleanup, cached state, date text, mobile/desktop 7px gap, event form navigation.');
}finally{await browser.close();}
