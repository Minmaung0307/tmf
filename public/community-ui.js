import {safeImage} from './media.js';
import {withTimeout} from './search.js';
const jobs=new WeakMap();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);jobs.get(e.target)?.();}},{rootMargin:'100px'});
export function lazyCover(img,collection,id){jobs.set(img,async()=>{try{const {coverImage}=await import('./cloud.js');const photo=await withTimeout(coverImage(collection,id),10000);if(photo&&safeImage(photo.data)){img.src=photo.data;img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','View full photo: '+(img.alt||'Community photo'));img.classList.add('expandable-photo');const open=()=>showPhoto(img);img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});}}catch{img.alt=img.alt||'Photo temporarily unavailable';}});observer.observe(img);}
const options=[['heart','❤️','Love this'],['prayer','🙏','With gratitude'],['celebrate','🎉','Celebrate']];
let authPromise;
export async function google(){if(!authPromise)authPromise=withTimeout(Promise.all([import('./cloud.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')]).then(async([c,a])=>{const {app}=await c.getCloud();const auth=a.getAuth(app);await a.setPersistence(auth,a.browserSessionPersistence);await auth.authStateReady();return {a,auth};}),15000).catch(e=>{authPromise=null;throw e;});return authPromise;}
const reactionChoices=data=>[...new Set(Array.isArray(data?.choices)?data.choices:options.some(([key])=>key===data?.emoji)?[data.emoji]:[])].filter(key=>options.some(([value])=>value===key));
const activeReactions=new Map();
new MutationObserver(()=>{for(const [box,stop] of activeReactions)if(!box.isConnected){stop();activeReactions.delete(box);}}).observe(document.documentElement,{childList:true,subtree:true});
export function reactions(eventId){
 const box=document.createElement('div');box.className='reactions';
 const label=document.createElement('p');label.className='reaction-label';label.textContent='A little appreciation';
 const row=document.createElement('div');row.className='reaction-buttons';
 const note=document.createElement('p');note.className='reaction-note';note.setAttribute('role','status');note.textContent='Give each reaction once · Updates live';
 const controls=[],pending=new Set();let records=new Map(),uid=null,ready=false,signingIn=false;
 const paint=()=>{const own=records.get(uid)||[];controls.forEach((button,i)=>{const key=options[i][0];let count=0;for(const choices of records.values())if(choices.includes(key))count++;if(pending.has(key)&&!own.includes(key))count++;button.textContent=options[i][1]+' '+(ready||pending.has(key)?count:'—');button.setAttribute('aria-label',options[i][2]+': '+count);button.setAttribute('aria-pressed',String(own.includes(key)||pending.has(key)));button.disabled=own.includes(key)||pending.has(key)||signingIn;});};
 for(const [key,icon,title] of options){const button=document.createElement('button');button.type='button';button.className='reaction-button';button.setAttribute('aria-label',title);button.textContent=icon+' —';
 button.addEventListener('click',async()=>{if(pending.has(key)||(records.get(uid)||[]).includes(key))return;pending.add(key);paint();note.textContent='Saving your appreciation…';
 try{const {a,auth}=await google();if(!auth.currentUser){signingIn=true;paint();try{await a.signInWithPopup(auth,new a.GoogleAuthProvider());}finally{signingIn=false;paint();}}uid=auth.currentUser.uid;
 const {getCloud}=await import('./cloud.js'),{db,sdk:s}=await getCloud();const ref=s.doc(db,'tmf_events',eventId,'reactions',uid);
 const saved=await s.runTransaction(db,async tx=>{const snap=await tx.get(ref),choices=reactionChoices(snap.exists()?snap.data():null);if(!choices.includes(key)){choices.push(key);tx.set(ref,{choices,updatedAt:s.serverTimestamp()});}return choices;});
 records.set(uid,[...new Set([...(records.get(uid)||[]),...saved])]);pending.delete(key);paint();note.textContent='Thank you! You can give each of the three reactions once.';
 }catch(error){pending.delete(key);paint();note.textContent=error.code?.includes('popup-closed')?'Sign-in canceled.': 'Reaction not saved. Check your connection and try again.';}});controls.push(button);row.append(button);}
 box.append(label,row,note);
 jobs.set(box,async()=>{try{const {getCloud}=await import('./cloud.js');const [{db,sdk:s},{a,auth}]=await Promise.all([getCloud(),google()]);if(!box.isConnected)return;
 const stopAuth=a.onAuthStateChanged(auth,user=>{uid=user?.uid||null;paint();});
 const stop=s.onSnapshot(s.collection(db,'tmf_events',eventId,'reactions'),snap=>{records=new Map(snap.docs.map(doc=>[doc.id,reactionChoices(doc.data())]));ready=true;paint();},()=>{note.textContent='Live updates disconnected. Please check your connection.';});
 activeReactions.set(box,()=>{stop();stopAuth();});
 }catch{note.textContent='Unable to connect. Please reload when online.';}});observer.observe(box);return box;
}

function showPhoto(img){const dialog=document.createElement('dialog');dialog.className='photo-dialog';dialog.setAttribute('aria-label',img.alt||'Community photo');const close=document.createElement('button');close.type='button';close.className='secondary';close.textContent='Close photo ×';close.onclick=()=>dialog.close();const picture=document.createElement('img');picture.src=img.src;picture.alt=img.alt;dialog.append(close,picture);dialog.addEventListener('close',()=>{dialog.remove();img.focus();});document.body.append(dialog);dialog.showModal();}
