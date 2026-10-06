import {lazyCover,reactions} from './community-ui.js';
import {config} from './config.js';
import {filterDirectory, validPlace, safeUrl, mapsUrl, matchesEvent, withTimeout} from './search.js';
const $ = id => document.getElementById(id);
const states = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'};
for (const [code,name] of Object.entries(states)) for (const id of ['state','eventState']) $(id).add(new Option(`${name} (${code})`,code));
for (let i=1;i<=12;i++) $('eventMonth').add(new Option(new Date(2000,i-1,1).toLocaleString('en-US',{month:'long'}),String(i)));
function element(tag, className, text) { const el=document.createElement(tag); if(className) el.className=className; if(text!=null) el.textContent=text; return el; }
function link(text,url,className='') { const a=element('a',className,text); a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
function empty(title,message,actions=[]) { const el=element('div','empty'); el.append(element('div','place-icon','⌕'),element('h3','',title),element('p','',message)); const row=element('div','empty-actions'); row.append(...actions); el.append(row); return el; }
function button(text,action,className='secondary') { const b=element('button',className,text); b.type='button'; b.addEventListener('click',action); return b; }
function route(){ const hash=location.hash.slice(1); const target=['events','submit'].includes(hash)?hash:'discover'; document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==target); document.querySelectorAll('nav a').forEach(a=>{const active=a.hash==='#'+target;a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}); if(target==='events'&&!eventsLoaded)loadEvents(); }
let directoryPromise, directoryMeta, directory=[];
async function loadDirectory(){
 if(directoryPromise)return directoryPromise;
 directoryPromise=withTimeout(fetch('./directory.json').then(async response=>{if(!response.ok)throw Error('Directory unavailable');const data=await response.json();if(!data||!Array.isArray(data.places)||!data.places.every(validPlace))throw Error('Invalid directory data');directoryMeta=data;directory=data.places;renderBrowse();return directory;}),15000).catch(error=>{directoryPromise=null;throw error;});
 return directoryPromise;
}
// Browsing is independent of the search form and its filters.
let browseReady=false;
function renderBrowse(){
 if(browseReady)return;
 browseReady=true;
 $('browseStatus').textContent=`${directory.length} places · Choose a name to see its details`;
 const previousGroups=[...$('browseGroups').querySelectorAll('.browse-group')].map(g=>({open:g.open,letter:g.querySelector('select')?.value||''}));
 $('browseGroups').replaceChildren();
 const groups=[['monastery','Monasteries','ဘုန်းကြီးကျောင်းများ'],['temple','Pagodas & temples','ဘုရား / စေတီများ'],['organization','Myanmar organizations','မြန်မာအသင်းအဖွဲ့များ']];
 const collator=new Intl.Collator('en',{sensitivity:'base',numeric:true});
 for(const [key,title,myanmar] of groups){
  const places=directory.filter(p=>p.categories.includes(key)).sort((a,b)=>collator.compare(a.name,b.name)||collator.compare(a.stateName||'',b.stateName||''));
  const group=element('details','browse-group tone-'+key);group.open=true;
  const summary=element('summary','browse-summary');const heading=element('span','browse-heading',title);const subtitle=element('span','browse-subtitle',myanmar);subtitle.lang='my';heading.append(subtitle);summary.append(heading,element('span','browse-count',String(places.length)));group.append(summary);
  const control=element('label','browse-letter-label','Jump to a name');const select=element('select');select.setAttribute('aria-label',title+' starting letter');select.add(new Option('All names · A–Z',''));
  const letterFor=p=>{const first=p.name.trim().charAt(0).toUpperCase();return /^[A-Z]$/.test(first)?first:'Other';};
  const letters=[...new Set(places.map(letterFor))].sort((a,b)=>a==='Other'?1:b==='Other'?-1:a.localeCompare(b));letters.forEach(letter=>select.add(new Option(letter==='Other'?'Other / မြန်မာ':letter,letter)));control.append(select);group.append(control);
  const list=element('ul','browse-names');list.id='browse-'+key;list.setAttribute('aria-label',title+' names');
  const rows=places.map(p=>{const item=element('li');const nameButton=button('',()=>openPlace(p),'browse-name');nameButton.setAttribute('aria-haspopup','dialog');const text=element('span','browse-name-copy');text.append(element('strong','',p.name),element('span','subtle',[p.city,p.stateName||p.state].filter(Boolean).join(', ')||'United States'));const arrow=element('span','browse-arrow','↗');arrow.setAttribute('aria-hidden','true');nameButton.append(text,arrow);item.append(nameButton);list.append(item);return {item,letter:letterFor(p)};});
  if(!places.length)list.append(element('li','directory-note','No places listed in this category yet.'));
  select.addEventListener('change',()=>{for(const row of rows)row.item.hidden=!!select.value&&row.letter!==select.value;list.scrollTop=0;});
  group.append(list);const prior=previousGroups[groups.findIndex(g=>g[0]===key)];if(prior){group.open=prior.open;select.value=prior.letter;select.dispatchEvent(new Event('change'));}$('browseGroups').append(group);
 }
}
function openPlace(place){
 const card=placeCard(place);const heading=card.querySelector('h3');heading.id='placeDialogTitle';
 card.querySelector('.profile-link')?.remove();$('placeDialogContent').replaceChildren(card);
 if(place.community){if(place.description)$('placeDialogContent').append(element('p','profile-story',place.description));if(place.hours){$('placeDialogContent').append(element('h3','','Visiting & opening hours'),element('p','profile-story',place.hours));}$('placeDialogContent').append(element('p','subtle','Community-submitted profile · reviewed by the site administrator. Confirm visiting arrangements directly.'));}
 const share=button('Copy profile link',async()=>{const url=new URL('./',location.href);url.searchParams.set('place',place.id);url.hash='discover';try{await navigator.clipboard.writeText(url.href);share.textContent='Link copied ✓';}catch{const input=element('input','share-url');input.readOnly=true;input.value=url.href;$('placeDialogContent').append(input);input.select();share.textContent='Copy the link below';}});$('placeDialogContent').append(share);
 if(place.aliases?.length)$('placeDialogContent').append(element('p','dialog-aliases',place.aliases.join(' · ')));
 $('placeDialog').showModal();document.body.classList.add('place-dialog-open');
}
$('closePlaceDialog').addEventListener('click',()=>$('placeDialog').close());
$('placeDialog').addEventListener('close',()=>{document.body.classList.remove('place-dialog-open');$('placeDialogContent').replaceChildren();});
$('placeDialog').addEventListener('click',event=>{if(event.target===$('placeDialog')){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();}});

let category='all',generation=0,lastPlaces=[],map,markerLayer,pageNumber=0;const PAGE_SIZE=24;
const params=new URLSearchParams(location.search);
$('search').value=params.get('q')||'';$('state').value=params.get('state')||'';$('tradition').value=params.get('tradition')||'';
if(['all','monastery','temple','organization'].includes(params.get('category')))category=params.get('category');
function syncCategory(){document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));$('tradition').disabled=category==='organization';}
syncCategory();
function filters(){return {query:$('search').value,category,tradition:$('tradition').value,state:$('state').value};}
function externalSearch(){const terms={all:'Buddhist monastery Myanmar community',monastery:'Buddhist monastery',temple:'Buddhist pagoda temple',organization:'Myanmar community organization'};return 'https://www.google.com/search?'+new URLSearchParams({q:[$('search').value,terms[category],states[$('state').value]||'', 'United States'].join(' ')});}
function clearMap(){if(markerLayer)markerLayer.clearLayers();$('map').hidden=true;$('mapToggle').setAttribute('aria-expanded','false');$('mapToggle').textContent='Show map';}
async function runSearch(){
 const request=++generation;clearMap();lastPlaces=[];pageNumber=0;$('mapToggle').disabled=true;$('notice').replaceChildren();$('pagination').replaceChildren();$('attribution').hidden=true;
 const f=filters();const url=new URL(location.href);const placeParam=url.searchParams.get('place');url.search='';if(placeParam)url.searchParams.set('place',placeParam);for(const [key,value] of Object.entries({q:f.query,category,state:f.state,tradition:f.tradition}))if(value)url.searchParams.set(key,value);history.replaceState(null,'',url);
 $('resultTitle').textContent='Loading the community directory…';$('resultNote').textContent='Find a place to reflect, celebrate, and belong.';$('templeList').setAttribute('aria-busy','true');$('templeList').replaceChildren(...Array.from({length:3},()=>{const s=element('div','skeleton');s.setAttribute('aria-hidden','true');return s;}));
 try {
   await loadDirectory();if(request!==generation)return;
   lastPlaces=filterDirectory(directory,f);renderResults();
   $('resultTitle').textContent=`${lastPlaces.length} ${lastPlaces.length===1?"place":"places"} to explore`;
   $('resultNote').textContent=`${directory.length} listed places · Updated ${directoryMeta.updated} · Free community directory`;
   $('notice').append(element('p','directory-note','This community-sourced directory is not complete. Confirm details before visiting. Missing a place? Suggest an update.'));
   $('attribution').replaceChildren(document.createTextNode('Directory: '),link('© OpenStreetMap contributors','https://www.openstreetmap.org/copyright'),document.createTextNode(' · '),link('ODbL 1.0','https://opendatacommons.org/licenses/odbl/1-0/'),document.createTextNode(' · '),link('Download directory data','directory.json'));
   $('attribution').hidden=false;$('mapToggle').disabled=!lastPlaces.some(hasLocation);
 }catch(error){if(request!==generation)return;if(!browseReady){$('browseStatus').textContent='Names could not load. Please retry.';$('browseGroups').replaceChildren(button('Retry name list',runSearch));}$('resultTitle').textContent='The directory could not load';$('resultNote').textContent='Check your connection or that the full public folder was uploaded.';$('templeList').replaceChildren(empty('Please try again.','စာရင်းဖိုင်ကို ဖွင့်လို့မရသေးပါ။ Check your internet connection. The directory has no Google billing requirement.',[button('Try again',runSearch,'primary'),link('Search the web ↗',externalSearch(),'secondary')]));
 }finally{if(request===generation)$('templeList').removeAttribute('aria-busy');}
}
function hasLocation(p){return Number.isFinite(p.lat)&&Number.isFinite(p.lon);}
function renderResults(){
 $('templeList').replaceChildren();$('pagination').replaceChildren();
 if(!lastPlaces.length){$('templeList').append(empty('Not in this directory yet.','စာရင်းထဲမှာ မတွေ့သေးပါ။ Try an English name, fewer words, or another state. Missing results do not mean the place does not exist.',[button('Clear filters',reset),link('Search the web ↗',externalSearch(),'secondary')]));return;}
 const start=pageNumber*PAGE_SIZE;lastPlaces.slice(start,start+PAGE_SIZE).forEach(p=>$('templeList').append(placeCard(p)));
 const row=element('div','pagination');const prev=button('← Previous',()=>{pageNumber--;renderResults();$('resultTitle').scrollIntoView({block:'start'});});prev.disabled=pageNumber===0;const next=button('Next →',()=>{pageNumber++;renderResults();$('resultTitle').scrollIntoView({block:'start'});});next.disabled=start+PAGE_SIZE>=lastPlaces.length;
 row.append(prev,element('span','subtle',`${start+1}–${Math.min(start+PAGE_SIZE,lastPlaces.length)} of ${lastPlaces.length}`),next);$('pagination').append(row);
}
function placeCard(p){
 const card=element('article','place-card tone-'+(p.categories.includes('organization')?'organization':p.categories.includes('monastery')?'monastery':'temple'));if(p.hasPhoto&&p.cloudId){const photo=element('img','profile-cover');photo.src='images/event-placeholder.jpg';photo.alt=p.imageAlt||p.name;photo.loading='lazy';card.append(photo);lazyCover(photo,'tmf_places',p.cloudId);}card.append(element('div','place-icon',p.categories.includes('organization')?'◇':'⌂'),element('h3','',p.name),element('p','address',p.address||[p.city,p.stateName||p.state].filter(Boolean).join(', ')||'Street address not recorded'));
 card.append(element('span','subtle',p.categories.map(c=>({monastery:'Monastery',temple:'Temple / pagoda',organization:'Myanmar organization'}[c])).join(' · ')));
 const actions=element('div','card-actions');
 actions.append(link('Directions ↗',mapsUrl(p.name+' '+(p.address||[p.city,p.stateName,'USA'].filter(Boolean).join(' ')))));
 if(safeUrl(p.website))actions.append(link('Website ↗',safeUrl(p.website)));
 if(p.phone){const phone=element('a','','Call');phone.href='tel:'+p.phone.replace(/[^+\d]/g,'');if(/[0-9]/.test(phone.href))actions.append(phone);}
 if(p.community)actions.append(button('View profile',()=>openPlace(p),'profile-link'));card.append(actions);
 if(safeUrl(p.source))card.append(link(p.sourceType==='official'?'Official source ↗':'OpenStreetMap record ↗',safeUrl(p.source),'subtle'));
 return card;
}
function showMap(){
 if(!$('map').hidden){clearMap();return;}
 if(!window.L){$('notice').append(element('p','notice','The map library could not load. Search and Directions links still work.'));return;}
 $('map').hidden=false;
 if(!map){map=L.map('map');L.tileLayer(config.tileUrl,{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>{if(!$('tileError')){const n=element('p','notice','Map tiles are unavailable. Search results and Directions links still work.');n.id='tileError';$('notice').append(n);}}).addTo(map);markerLayer=L.layerGroup().addTo(map);}
 map.invalidateSize();markerLayer.clearLayers();const locations=lastPlaces.filter(hasLocation);if(locations.length<lastPlaces.length)$('notice').append(element('p','directory-note',`${locations.length} of ${lastPlaces.length} places have map coordinates. All places are available in the list.`));for(const p of locations){const content=element('div');content.append(element('strong','',p.name),element('p','',p.address||p.stateName),link('Directions ↗',mapsUrl(p.name+' '+(p.address||p.stateName))));L.circleMarker([p.lat,p.lon],{radius:7,color:'#fff',weight:2,fillColor:'#173f35',fillOpacity:.9}).bindPopup(content).addTo(markerLayer);}
 if(locations.length===1)map.setView([locations[0].lat,locations[0].lon],13);else map.fitBounds(locations.map(p=>[p.lat,p.lon]),{padding:[25,25],maxZoom:14});
 $('mapToggle').textContent='Hide map';$('mapToggle').setAttribute('aria-expanded','true');
}
function reset(){category='all';$('searchForm').reset();$('tradition').value='';syncCategory();runSearch();}
$('searchForm').addEventListener('submit',e=>{e.preventDefault();runSearch();});
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;syncCategory();runSearch();}));
$('state').addEventListener('change',runSearch);$('tradition').addEventListener('change',runSearch);$('resetFilters').addEventListener('click',reset);$('mapToggle').addEventListener('click',showMap);
let eventsData=[],eventsLoaded=false,eventLoadVersion=0;
async function loadEvents(){
 const version=++eventLoadVersion;eventsLoaded=true;$('eventGrid').replaceChildren(element('p','','Loading community events…'));$('eventCloudStatus').textContent='';
 try{const r=await withTimeout(fetch('./events.json',{cache:'no-store'}));if(!r.ok)throw Error('Events unavailable');const data=await r.json();if(!Array.isArray(data))throw Error('Invalid events');if(version!==eventLoadVersion)return;eventsData=data;renderEvents();}
 catch{if(version!==eventLoadVersion)return;eventsData=[];renderEvents();$('eventCloudStatus').textContent='The saved event archive could not load. ';}
 try{const cloud=await import('./cloud.js');if(!cloud.cloudEventsEnabled)return;const live=await withTimeout(cloud.publishedEvents(),10000);if(version!==eventLoadVersion)return;eventsData=[...live,...eventsData];renderEvents();$('eventCloudStatus').textContent=`${live.length} published events loaded (up to the latest 100). Past events remain until an admin archives them.`;}
 catch{if(version===eventLoadVersion)$('eventCloudStatus').textContent='Live events are unavailable. Showing the saved archive if available. Use Refresh events to retry.';}
}
$('refreshEvents').addEventListener('click',loadEvents);
function renderEvents(){const filtered=eventsData.filter(e=>matchesEvent(e,{query:$('eventSearch').value,month:$('eventMonth').value,state:$('eventState').value,period:$('eventPeriod').value})).sort((a,b)=>String(b.dateStart).localeCompare(String(a.dateStart)));$('eventCount').textContent=`${filtered.length} event${filtered.length===1?'':'s'}`;$('eventGrid').replaceChildren();if(!filtered.length){$('eventGrid').append(empty('No matching events','Try another month, state, or date range.',[button('Clear event filters',resetEvents)]));return;}for(const e of filtered){const card=element('article','event-card');const img=element('img');img.src=e.image?.startsWith('images/')?e.image:'images/event-placeholder.jpg';img.alt='';img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src='images/event-placeholder.jpg';};if(e.cloud&&e.hasPhoto){img.alt=e.imageAlt||e.title;lazyCover(img,'tmf_events',e.id);}const body=element('div','event-body');body.append(element('span','tag',e.sample?'Sample · archive':(e.dateEnd||e.dateStart)<new Date().toLocaleDateString('en-CA')?'Past event':'Community event'),element('h3','',e.title),element('p','',e.dateStart+(e.dateEnd!==e.dateStart?' — '+e.dateEnd:'')),element('p','',e.templeName),element('p','',[e.city,e.state].filter(Boolean).join(', ')),element('p','',e.address));if(e.description)body.append(element('p','event-description',e.description));const u=safeUrl(e.link);if(u&&!new URL(u).hostname.match(/(^|\.)example\.(org|com|net)$/))body.append(link('Event details ↗',u,'secondary'));if(e.cloud)body.append(reactions(e.id));card.append(img,body);$('eventGrid').append(card);}}
function resetEvents(){for(const id of ['eventSearch','eventMonth','eventState'])$(id).value='';$('eventPeriod').value='all';renderEvents();}
for(const id of ['eventSearch','eventMonth','eventState','eventPeriod'])$(id).addEventListener(id==='eventSearch'?'input':'change',renderEvents);$('resetEvents').addEventListener('click',resetEvents);
// Payment destinations are supplied by the site owner; never invent a recipient or payment URL.
function renderSupport(){
 let available=0;
 document.querySelectorAll('[data-support]').forEach(item=>{
  const destination=safeUrl(config.support?.[item.dataset.support]);
  if(!destination)return;
  const a=element('a',item.className);a.dataset.support=item.dataset.support;
  a.href=destination;a.target='_blank';a.rel='noopener noreferrer';
  a.setAttribute('aria-label',item.textContent.replace('↗','').trim()+' — open payment page');
  while(item.firstChild)a.append(item.firstChild);
  item.replaceWith(a);available++;
 });
 $('supportStatus').textContent=available===4?'Opens a payment page. Please confirm the amount and recipient before paying.':available?'More giving options will be available soon. Confirm the amount and recipient on the payment page.':'Support links will be available soon.';
}
renderSupport();

let profilesLoading=false;let baseDirectory;let communityProfiles=[];
async function refreshProfiles(more=false){if(profilesLoading)return;profilesLoading=true;$('refreshProfiles').disabled=true;try{await loadDirectory();baseDirectory||=[...directory];const cloud=await import('./cloud.js');if(!cloud.cloudEventsEnabled)return;const places=await withTimeout(cloud.publishedPlaces(!more),10000);communityProfiles=more?[...new Map([...communityProfiles,...places].map(p=>[p.id,p])).values()]:places;directory=[...baseDirectory,...communityProfiles];$('moreProfiles').hidden=places.length<100;browseReady=false;renderBrowse();await runSearch();$('profileCloudStatus').textContent=`${communityProfiles.length} community profiles loaded, alongside the original directory.`;}catch{$('profileCloudStatus').textContent='Community profiles are temporarily unavailable. The original directory still works.';}finally{profilesLoading=false;$('refreshProfiles').disabled=false;}}
$('refreshProfiles').addEventListener('click',()=>refreshProfiles());$('moreProfiles').addEventListener('click',()=>refreshProfiles(true));
window.addEventListener('hashchange',route);route();runSearch().then(async()=>{await refreshProfiles();const requested=params.get('place');if(!requested)return;let p=directory.find(p=>p.id===requested);try{if(!p&&requested.startsWith('community-')){const cloud=await import('./cloud.js');p=await withTimeout(cloud.publicPlace(requested.slice(10)),10000);}if(p)openPlace(p);else throw Error('Missing profile');}catch{$('profileCloudStatus').textContent='This profile is unavailable or no longer published.';}});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});

let suggestionPhoto=null,suggestionPhotoVersion=0;
$('suggestionPhoto').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;const version=++suggestionPhotoVersion;const submit=$('submitForm').querySelector('[type=submit]');submit.disabled=true;$('suggestionPhotoStatus').textContent='Preparing photo…';try{const {prepareImage}=await import('./media.js');const photo=await prepareImage(file);if(version!==suggestionPhotoVersion)return;suggestionPhoto=photo;$('clearSuggestionPhoto').hidden=false;$('suggestionPhotoStatus').textContent='Photo ready. It will be sent privately with your suggestion.';}catch(error){if(version===suggestionPhotoVersion)$('suggestionPhotoStatus').textContent=error.message;}finally{if(version===suggestionPhotoVersion)submit.disabled=false;}});
$('clearSuggestionPhoto').addEventListener('click',()=>{suggestionPhotoVersion++;suggestionPhoto=null;$('suggestionPhoto').value='';$('clearSuggestionPhoto').hidden=true;$('suggestionPhotoStatus').textContent='Photo removed.';$('submitForm').querySelector('[type=submit]').disabled=false;});

import {initContribution} from './contribution.js';
initContribution({getPhoto:()=>suggestionPhoto,purpose:params.get('request')});
