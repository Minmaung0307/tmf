import {cloudConfig} from './cloud-config.js';
let promise;
export async function getCloud(){
 if(!promise)promise=Promise.all([
  import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js'),
 ]).then(([app,db])=>{const instance=app.getApps().length?app.getApp():app.initializeApp(cloudConfig.firebase);return {app:instance,db:db.getFirestore(instance),sdk:db};}).catch(error=>{promise=null;throw error;});
 return promise;
}
export async function publishedEvents(){
 if(!cloudConfig.enabled)return [];
 const {db,sdk}=await getCloud();
 const result=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'tmf_events'),sdk.where('status','==','published'),sdk.orderBy('dateStart','desc'),sdk.limit(100)));
 return result.docs.map(d=>({id:d.id,...d.data(),sample:false,cloud:true,image:'images/event-placeholder.jpg'}));
}
export const cloudEventsEnabled=cloudConfig.enabled;
let lastProfileDoc;
export async function publishedPlaces(reset=true){
 if(!cloudConfig.enabled)return [];
 const {db,sdk:s}=await getCloud();if(reset)lastProfileDoc=null;const constraints=[s.where('status','==','published'),s.orderBy('name'),s.limit(100)];if(lastProfileDoc)constraints.push(s.startAfter(lastProfileDoc));const docs=await s.getDocsFromServer(s.query(s.collection(db,'tmf_places'),...constraints));lastProfileDoc=docs.docs.at(-1)||lastProfileDoc;
 const {directoryPlace}=await import('./place-model.js');return docs.docs.map(d=>directoryPlace(d.id,d.data()));
}
export async function publicPlace(id){const {db,sdk:s}=await getCloud();const d=await s.getDocFromServer(s.doc(db,'tmf_places',id));if(!d.exists())throw Error('Profile unavailable');const {directoryPlace}=await import('./place-model.js');return directoryPlace(d.id,d.data());}
export async function coverImage(collection,id){const {db,sdk:s}=await getCloud();const d=await s.getDocFromServer(s.doc(db,'tmf_media',collection+'_'+id));return d.exists()?d.data():null;}

export async function watchPublishedEvents(next,error){
 const {db,sdk:s}=await getCloud();
 return s.onSnapshot(s.query(s.collection(db,'tmf_events'),s.where('status','==','published'),s.orderBy('dateStart','desc'),s.limit(100)),{includeMetadataChanges:true},snap=>{if(snap.metadata.fromCache){next([], {fromCache:true});return;}next(snap.docs.map(d=>({...d.data(),id:d.id,sample:false,cloud:true,image:'images/event-placeholder.jpg'})),{fromCache:false});},error);
}
export async function publicEvent(id){const {db,sdk:s}=await getCloud();const d=await s.getDocFromServer(s.doc(db,'tmf_events',id));if(!d.exists()||d.data().status!=='published')throw Error('Event unavailable');return {id:d.id,...d.data(),cloud:true};}

export async function watchPublicEvent(id,next,error){
 const {db,sdk:s}=await getCloud();
 return s.onSnapshot(s.doc(db,'tmf_events',id),{includeMetadataChanges:true},snap=>{
  if(snap.metadata.fromCache)return;
  next(snap.exists()&&snap.data().status==='published'?{...snap.data(),id:snap.id,cloud:true}:null);
 },error);
}

export async function watchDirectoryVisibility(next,error){const {db,sdk:s}=await getCloud();return s.onSnapshot(s.query(s.collection(db,'tmf_directory_visibility'),s.limit(1000)),snap=>next(new Set(snap.docs.filter(d=>d.data().hidden).map(d=>d.id))),error);}

export async function placePhoto(id,index=0){if(!Number.isInteger(index)||index<0||index>4)throw Error('Invalid photo');const {db,sdk:s}=await getCloud();const parent=await s.getDocFromServer(s.doc(db,'tmf_places',id));if(!parent.exists()||parent.data().status!=='published'||index>=(parent.data().photoCount??(parent.data().hasPhoto?1:0)))throw Error('Photo unavailable');const ref=index===0?s.doc(db,'tmf_media','tmf_places_'+id):s.doc(db,'tmf_places',id,'photos',String(index));const d=await s.getDocFromServer(ref);return d.exists()?d.data():null;}
