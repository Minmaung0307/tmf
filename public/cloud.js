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
