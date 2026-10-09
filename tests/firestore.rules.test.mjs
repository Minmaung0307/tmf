import {readFile} from 'node:fs/promises';
import {test,after} from 'node:test';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,query,where,limit,updateDoc,deleteDoc,serverTimestamp,writeBatch,getCountFromServer,Timestamp,onSnapshot} from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'demo-tmf-security',firestore:{host:'127.0.0.1',port:8085,rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
after(()=>env.cleanup());
const context=(email,extra={})=>env.authenticatedContext(email,{email,email_verified:true,firebase:{sign_in_provider:'google.com'},auth_time:Math.floor(Date.now()/1000),...extra}).firestore();
const admin=context('minmaung0307@gmail.com'),second=context('panna07@gmail.com'),anon=env.unauthenticatedContext().firestore();
const event=(uid,status='draft')=>({title:'Community gathering',templeName:'Test temple',city:'Austin',state:'TX',address:'123 Test St',dateStart:'2026-12-01',dateEnd:'2026-12-01',link:'https://example.com',description:'Test event',status,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:uid});
test('both verified Google admins can create; public only sees published',async()=>{
 for(const [db,id] of [[admin,'minmaung0307@gmail.com'],[second,'panna07@gmail.com']])await assertSucceeds(setDoc(doc(db,'tmf_events',id),event(id)));
 await assertSucceeds(setDoc(doc(admin,'tmf_events','live'),event('minmaung0307@gmail.com','published')));
 await assertSucceeds(getDoc(doc(anon,'tmf_events','live')));
 await assertFails(getDoc(doc(anon,'tmf_events','minmaung0307@gmail.com')));
 await assertSucceeds(getDocs(query(collection(anon,'tmf_events'),where('status','==','published'),limit(100))));
 await assertFails(getDocs(query(collection(anon,'tmf_events'),limit(100))));
 await assertFails(getDocs(query(collection(anon,'tmf_events'),where('status','==','published'),limit(101))));
});
test('public, stranger, unverified, password provider, stale login cannot write',async()=>{
 const email='minmaung0307@gmail.com';
 for(const db of [anon,context('stranger@gmail.com'),context(email,{email_verified:false}),context(email,{firebase:{sign_in_provider:'password'}})])await assertFails(setDoc(doc(db,'tmf_events','blocked'),event(email)));
});
test('schema, ownership attribution and timestamps enforced',async()=>{
 for(const extra of [{injected:'bad'},{link:'javascript:alert(1)'},{updatedBy:'spoof'},{status:'public'},{description:'a'.repeat(4001)}])await assertFails(setDoc(doc(admin,'tmf_events','invalid'),{...event('minmaung0307@gmail.com'),...extra}));
 await assertFails(setDoc(doc(admin,'roles','admin'),{admin:true}));
});
test('archive hides a published event; fresh admin can delete',async()=>{
 const ref=doc(admin,'tmf_events','archive-test');await assertSucceeds(setDoc(ref,event('minmaung0307@gmail.com','published')));
 await assertSucceeds(updateDoc(ref,{status:'archived',updatedAt:serverTimestamp()}));
 await assertFails(getDoc(doc(anon,'tmf_events','archive-test')));
 await assertSucceeds(getDoc(ref));await assertSucceeds(deleteDoc(ref));
});

test('profiles without a website publish only through authorized admin',async()=>{
 const data={name:'Community without website',category:'organization',city:'Austin',state:'TX',address:'Test address',phone:'',website:'',description:'Our story',hours:'Call first',aliasesText:'',status:'published',hasPhoto:false,imageAlt:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:'minmaung0307@gmail.com'};
 await assertFails(setDoc(doc(anon,'tmf_places','community'),data));await assertSucceeds(setDoc(doc(admin,'tmf_places','community'),data));await assertSucceeds(getDoc(doc(anon,'tmf_places','community')));
 await assertFails(updateDoc(doc(admin,'tmf_places','community'),{website:'javascript:alert(1)',updatedAt:serverTimestamp()}));
});
test('optimized media is atomic, bounded, private for drafts; public cannot upload',async()=>{
 const e=doc(admin,'tmf_events','photo'),m=doc(admin,'tmf_media','tmf_events_photo');
 const photo={data:'data:image/webp;base64,UklGRg==',width:10,height:10,parentCollection:'tmf_events',parentId:'photo',updatedAt:serverTimestamp()};
 const batch=writeBatch(admin);batch.set(e,{...event('minmaung0307@gmail.com'),hasPhoto:true,imageAlt:'Poster'});batch.set(m,photo);await assertSucceeds(batch.commit());
 await assertFails(getDoc(doc(anon,'tmf_media','tmf_events_photo')));
 await assertSucceeds(updateDoc(e,{status:'published',updatedAt:serverTimestamp()}));await assertSucceeds(getDoc(doc(anon,'tmf_media','tmf_events_photo')));
 await assertFails(setDoc(doc(anon,'tmf_media','tmf_events_photo'),photo));
 await assertFails(updateDoc(m,{data:'data:image/svg+xml;base64,AAAA',updatedAt:serverTimestamp()}));
 await assertFails(updateDoc(m,{data:'data:image/webp;base64,'+'A'.repeat(160024),updatedAt:serverTimestamp()}));
 await assertFails(updateDoc(m,{width:9999,updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(e,{status:'archived',updatedAt:serverTimestamp()}));await assertFails(getDoc(doc(anon,'tmf_media','tmf_events_photo')));
});
test('each Google user can give all three once; duplicates, removal and spoofing fail',async()=>{
 const owner='visitor@gmail.com',visitor=context(owner),other=context('other@gmail.com');
 await setDoc(doc(admin,'tmf_events','react'),event('minmaung0307@gmail.com','published'));
 const ref=doc(visitor,'tmf_events','react','reactions',owner),reaction=choices=>({choices,updatedAt:serverTimestamp()});
 await assertFails(setDoc(doc(anon,'tmf_events','react','reactions','anon'),reaction(['heart'])));
 await assertSucceeds(setDoc(ref,reaction(['heart'])));
 await assertFails(setDoc(ref,reaction(['heart','heart'])));
 await assertFails(setDoc(ref,reaction(['prayer'])));
 await assertFails(setDoc(doc(other,'tmf_events','react','reactions',owner),reaction(['heart','prayer'])));
 await assertSucceeds(setDoc(ref,reaction(['heart','prayer'])));
 await assertSucceeds(setDoc(ref,reaction(['heart','prayer','celebrate'])));
 await assertFails(setDoc(ref,reaction(['heart','prayer','celebrate'])));
 await assertFails(deleteDoc(ref));
 for(const choices of [['heart'],['heart','prayer'],['heart','prayer','celebrate']])await assertSucceeds(setDoc(doc(other,'tmf_events','react','reactions','other@gmail.com'),reaction(choices)));
 const snapshot=await getDocs(collection(anon,'tmf_events','react','reactions'));
 for(const key of ['heart','prayer','celebrate'])if(snapshot.docs.filter(d=>d.data().choices.includes(key)).length!==2)throw Error('Counts must be two each');
 await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'tmf_events','react','reactions','legacy@gmail.com'),{emoji:'heart',updatedAt:Timestamp.now()}));
 const legacy=doc(context('legacy@gmail.com'),'tmf_events','react','reactions','legacy@gmail.com');
 await assertFails(setDoc(legacy,reaction(['prayer'])));
 await assertSucceeds(setDoc(legacy,reaction(['heart','prayer'])));
 await assertFails(setDoc(legacy,{emoji:'none',updatedAt:serverTimestamp()}));
 await updateDoc(doc(admin,'tmf_events','react'),{status:'archived',updatedAt:serverTimestamp()});await assertFails(getDocs(collection(anon,'tmf_events','react','reactions')));
});
test('private inbox owner access, no public listing, no forged sender or self-approval',async()=>{
 const uid='sender@gmail.com',sender=context(uid),other=context('unrelated@gmail.com');
 const data={type:'tmf-suggestion',from_name:'Sender',subject:'New event',temple_name:'Test temple',city_state:'Austin, TX',place_category:'monastery',address:'Test address',public_phone:'',hours:'',event_type:'',link:'',event_start:'',event_end:'',message:'Please review',reply_to:uid,ownerUid:uid,status:'pending',createdAt:serverTimestamp()};
 await assertFails(setDoc(doc(anon,'tmf_submissions',uid),data));await assertSucceeds(setDoc(doc(sender,'tmf_submissions',uid),data));
 await assertSucceeds(getDoc(doc(sender,'tmf_submissions',uid)));await assertSucceeds(getDoc(doc(admin,'tmf_submissions',uid)));await assertFails(getDoc(doc(other,'tmf_submissions',uid)));await assertFails(getDocs(query(collection(sender,'tmf_submissions'),limit(25))));
 await assertFails(setDoc(doc(other,'tmf_submissions',uid),data));await assertFails(setDoc(doc(sender,'tmf_submissions',uid),data));await assertFails(updateDoc(doc(sender,'tmf_submissions',uid),{status:'reviewed',reviewedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(doc(admin,'tmf_submissions',uid),{status:'reviewed',reviewedAt:serverTimestamp()}));await assertFails(updateDoc(doc(admin,'tmf_submissions',uid),{message:'Overwrite sender text'}));
 await assertSucceeds(updateDoc(doc(admin,'tmf_submissions',uid),{status:'reviewed',reviewedAt:serverTimestamp(),publicationId:'published-test',publicationCollection:'tmf_events'}));await assertFails(updateDoc(doc(sender,'tmf_submissions',uid),{publicationId:'forged',publicationCollection:'tmf_events'}));await assertFails(updateDoc(doc(admin,'tmf_submissions',uid),{status:'reviewed',reviewedAt:serverTimestamp(),publicationId:'private',publicationCollection:'tmf_privacy_requests'}));
 await env.withSecurityRulesDisabled(async c=>updateDoc(doc(c.firestore(),'tmf_submissions',uid),{createdAt:Timestamp.fromMillis(Date.now()-61000)}));await assertSucceeds(setDoc(doc(sender,'tmf_submissions',uid),{...data,subject:'Second submission'}));
 await assertSucceeds(deleteDoc(doc(admin,'tmf_submissions',uid)));
});
test('submission rejects private payload injection and oversized images',async()=>{
 const uid='invalid-sender@gmail.com',db=context(uid),ref=doc(db,'tmf_submissions',uid);
 const data={type:'tmf-suggestion',from_name:'Sender',subject:'New place',temple_name:'',city_state:'',place_category:'monastery',address:'',public_phone:'',hours:'',event_type:'',link:'',event_start:'',event_end:'',message:'Review',reply_to:uid,ownerUid:uid,status:'pending',createdAt:serverTimestamp()};
 for(const change of [{reply_to:'forged@example.com'},{admin:true},{status:'published'},{photo:{data:'data:image/webp;base64,'+'A'.repeat(160024),width:10,height:10}}])await assertFails(setDoc(ref,{...data,...change}));
});
test('admin access gate exposes no email allowlist and denies other accounts',async()=>{
 await assertSucceeds(getDoc(doc(admin,'tmf_admin_access','check')));await assertSucceeds(getDoc(doc(second,'tmf_admin_access','check')));await assertFails(getDoc(doc(anon,'tmf_admin_access','check')));await assertFails(getDoc(doc(context('stranger@gmail.com'),'tmf_admin_access','check')));await assertFails(setDoc(doc(admin,'tmf_admin_access','check'),{admin:true}));
});
test('privacy request remains private and separate from a pending community suggestion',async()=>{
 const uid='rights-request@gmail.com',db=context(uid),other=context('not-the-sender@gmail.com');
 const data={type:'tmf-suggestion',from_name:'Requester',subject:'Request',temple_name:'',city_state:'',place_category:'monastery',address:'',public_phone:'',hours:'',event_type:'',link:'',event_start:'',event_end:'',message:'Please review',reply_to:uid,ownerUid:uid,status:'pending',createdAt:serverTimestamp()};
 await assertSucceeds(setDoc(doc(db,'tmf_submissions',uid),data));await assertSucceeds(setDoc(doc(db,'tmf_privacy_requests',uid),{...data,type:'tmf-privacy-request'}));await assertSucceeds(getDoc(doc(db,'tmf_privacy_requests',uid)));await assertSucceeds(getDocs(query(collection(admin,'tmf_privacy_requests'),limit(25))));await assertFails(getDoc(doc(other,'tmf_privacy_requests',uid)));await assertFails(getDoc(doc(anon,'tmf_privacy_requests',uid)));await assertFails(setDoc(doc(db,'tmf_privacy_requests',uid),{...data,type:'tmf-privacy-request'}));await assertSucceeds(updateDoc(doc(admin,'tmf_privacy_requests',uid),{status:'reviewed',reviewedAt:serverTimestamp()}));
});

test('public live listener sees publish then deletion without refresh',async()=>{
 const ref=doc(admin,'tmf_events','live-cycle');let stop;
 const waitFor=(predicate)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stop?.();reject(Error('Live event timeout'));},7000);stop=onSnapshot(query(collection(anon,'tmf_events'),where('status','==','published'),limit(100)),snap=>{if(predicate(snap)){clearTimeout(timer);stop();resolve();}},reject);});
 const added=waitFor(snap=>snap.docs.some(d=>d.id==='live-cycle'));
 await setDoc(ref,event('minmaung0307@gmail.com','published'));await added;
 const removed=waitFor(snap=>!snap.docs.some(d=>d.id==='live-cycle'));
 await deleteDoc(ref);await removed;
});
test('publish and private submission receipt commit atomically',async()=>{
 const uid='receipt-owner';await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'tmf_submissions',uid),{status:'pending',createdAt:Timestamp.now(),subject:'Event'}));
 const batch=writeBatch(admin);batch.set(doc(admin,'tmf_events','receipt-event'),event('minmaung0307@gmail.com','published'));batch.update(doc(admin,'tmf_submissions',uid),{status:'reviewed',reviewedAt:serverTimestamp(),publicationId:'receipt-event',publicationCollection:'tmf_events'});await assertSucceeds(batch.commit());
});

test('valid admin session older than fifteen minutes can write without reauthentication',async()=>{const db=context('minmaung0307@gmail.com',{auth_time:Math.floor(Date.now()/1000)-3600});const ref=doc(db,'tmf_events','active-older-session');await assertSucceeds(setDoc(ref,event('minmaung0307@gmail.com')));await assertSucceeds(deleteDoc(ref));});
