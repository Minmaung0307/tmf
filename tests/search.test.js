import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {filterDirectory,normalize,safeUrl,mapsUrl,matchesEvent,validPlace} from '../public/search.js';
const places=[{id:'s',name:'Sitagu Buddhist Vihara',aliases:['သီတဂူ','Sitagu Austin'],categories:['monastery','temple'],traditions:['Myanmar'],address:'Austin TX',state:'TX',stateName:'Texas'},{id:'b',name:'Burmese American Community Institute',aliases:['BACI'],categories:['organization'],traditions:['Myanmar'],city:'Indianapolis',state:'IN',stateName:'Indiana'}];
test('Sitagu English and Burmese aliases match locally',()=>{for(const query of ['Sitagu','သီတဂူ','austin sitagu','Texas'])assert.equal(filterDirectory(places,{query})[0].id,'s');});
test('organization category does not include monasteries',()=>assert.deepEqual(filterDirectory(places,{category:'organization'}).map(p=>p.id),['b']));
test('state and category filters compose',()=>{assert.equal(filterDirectory(places,{state:'IN',category:'monastery'}).length,0);assert.equal(filterDirectory(places,{state:'TX',category:'temple'}).length,1);});
test('Burmese and Myanmar search aliases are equivalent',()=>assert.equal(filterDirectory(places,{query:'Myanmar American'}).length,1));
test('unknown terms return honest empty result',()=>assert.equal(filterDirectory(places,{query:'missing-place-xyz'}).length,0));
test('tradition also applies to organization filter',()=>{assert.equal(filterDirectory(places,{tradition:'Thailand'}).length,0);assert.equal(filterDirectory(places,{tradition:'Thailand',category:'organization'}).length,0);});
test('Unicode text is normalized',()=>assert.equal(normalize('  သီတဂူ\u200b '),'သီတဂူ'));
test('unsafe provider links are rejected',()=>{assert.equal(safeUrl('javascript:alert(1)'),'');assert.equal(safeUrl('data:text/html,hi'),'');assert.equal(safeUrl('https://example.org'),'https://example.org/');});
test('directions use a normal website URL, no API key',()=>{const u=new URL(mapsUrl('Sitagu Austin'));assert.equal(u.searchParams.get('query'),'Sitagu Austin');assert.ok(!u.searchParams.has('key'));});
test('event month filter spans year boundary',()=>assert.ok(matchesEvent({title:'Retreat',dateStart:'2025-12-25',dateEnd:'2026-02-02'},{month:'1'})));
test('invalid records rejected',()=>{assert.ok(validPlace(places[0]));assert.ok(!validPlace({id:'a',name:'X'}));});
test('bundled data contains real Sitagu and organization entries with sources',()=>{const d=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url)));assert.ok(d.places.length>10);assert.ok(d.places.every(validPlace));assert.ok(d.places.every(p=>safeUrl(p.source)));assert.ok(filterDirectory(d.places,{query:'Sitagu',state:'TX'}).length);assert.ok(filterDirectory(d.places,{category:'organization'}).length);assert.equal(new Set(d.places.map(p=>p.id)).size,d.places.length);});
test('local search code contains no paid Places or EmailJS integration',()=>{for(const file of ['app.js','config.js','index.html']){const s=readFileSync(new URL('../public/'+file,import.meta.url),'utf8');assert.doesNotMatch(s,/maps\.googleapis\.com|places\.Place|emailjs\.send|emailjs\/browser/);}});
test('Myanmar category phrases match metadata, including unspaced compounds',()=>{
 assert.deepEqual(filterDirectory(places,{query:'အသင်းအဖွဲ့'}).map(p=>p.id),['b']);
 assert.deepEqual(filterDirectory(places,{query:'မြန်မာဘုန်းကြီးကျောင်း'}).map(p=>p.id),['s']);
 assert.deepEqual(filterDirectory(places,{query:'မြန်မာ ဘုန်းကြီးကျောင်း',state:'IN'}),[]);
});
test('Myanmar named-place aliases match English records without inventing records',()=>{
 const named=['Shwe Zigon Pagoda','Chan Myay Meditation Center','Abhayagiri Buddhist Monastery'].map((name,i)=>({...places[0],id:String(i),name,aliases:[]}));
 for(const [query,id] of [['ရွှေစည်းခုံ','0'],['ချမ်းမြေ့','1'],['အဘယဂိရိ','2']])assert.deepEqual(filterDirectory(named,{query}).map(p=>p.id),[id]);
 assert.deepEqual(filterDirectory(places,{query:'ရွှေစည်းခုံ'}),[]);
});
test('incremental Myanmar name input matches at every prefix and keeps filters',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 for(const query of ['အ','အဘ','အဘယ','အဘယဂိ','အဘယဂိရိ'])assert.ok(filterDirectory(data,{query}).some(p=>p.name.includes('Abhayagiri')),query);
 for(const query of ['သ','သီ','သီတ','သီတဂူ'])assert.ok(filterDirectory(data,{query}).some(p=>p.name.includes('Sitagu')),query);
 assert.equal(filterDirectory(data,{query:'အဘယ',state:'TX'}).length,0);
 assert.ok(filterDirectory(places,{query:'အသ'}).some(p=>p.id==='b'));
 assert.equal(filterDirectory(data,{query:'အဘယမရှိသောနာမည်'}).length,0);
});
test('every populated state and tradition composes without leaking other states',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 for(const state of new Set(data.map(p=>p.state))){
  assert.equal(filterDirectory(data,{state}).length,data.filter(p=>!state||p.state===state).length);
  for(const tradition of ['Myanmar','Thailand','Laos','Cambodia','Sri Lanka']){
   assert.equal(filterDirectory(data,{state,tradition}).length,data.filter(p=>(!state||p.state===state)&&p.traditions.includes(tradition)).length);
  }
 }
 for(const tradition of ['Myanmar','Thailand','Laos','Cambodia','Sri Lanka'])assert.ok(filterDirectory(data,{tradition}).length>0,tradition);
});

test('every record is reachable through a tradition or unrecorded filter',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 const ids=new Set(['Myanmar','Sri Lanka','Thailand','Laos','Cambodia','other','unrecorded'].flatMap(tradition=>filterDirectory(data,{tradition}).map(p=>p.id)));
 assert.equal(ids.size,data.length);
 assert.ok(filterDirectory(data,{tradition:'unrecorded'}).every(p=>p.traditions.length===0));
 assert.ok(filterDirectory(data,{tradition:'Myanmar',category:'organization'}).length>0);
});
test('NC Myanmar monasteries and Nashville address are discoverable',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 const nc=filterDirectory(data,{state:'NC',tradition:'Myanmar',category:'monastery'});
 assert.equal(nc.length,10);assert.ok(nc.some(p=>p.name.includes('Dhamma Viman')));
 for(const query of ['99 Lyle','Nashville','The Buddhist Temple','သီတဂူ'])assert.ok(filterDirectory(data,{state:'TN',tradition:'Myanmar',category:'monastery',query}).some(p=>p.id==='sitagu-nashville'));
 assert.ok(filterDirectory(data,{state:'MI',tradition:'Myanmar',query:'Asokarama'}).length);
});
test('reviewed Wikipedia entries remain reachable without fabricated addresses',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 const audit=JSON.parse(readFileSync(new URL('../scripts/wikipedia-review.json',import.meta.url)));
 assert.equal(audit.length,170);
 for(const row of audit.filter(x=>x.action!=='skipped-person-not-place'))assert.ok(data.some(p=>p.id===row.id),row.name);
 for(const p of data.filter(x=>x.sourceType==='wikipedia')){assert.equal(p.lat,null);assert.equal(p.lon,null);assert.equal(p.address,'');assert.ok(filterDirectory(data,{state:p.state,query:p.name}).some(x=>x.id===p.id));}
 assert.ok(filterDirectory(data,{query:'မြောက်ဦး',tradition:'Myanmar'}).length);
 assert.ok(filterDirectory(data,{query:'Light of Dhamma',state:'MO',tradition:'Myanmar'}).length);
});
test('requested Minnesota, Illinois and Fresno monasteries match name variants',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 for(const [state,query,id] of [['MN','Sitagu Dhammavihara','sitagu-minnesota'],['MN','Sitagu Dhamma Vihara','sitagu-minnesota'],['MN','သီတဂူ','sitagu-minnesota'],['IL','ချမ်းမြေ့','chanmyay-springfield'],['IL','Chanmyay Satipatthana','chanmyay-springfield']])assert.ok(filterDirectory(data,{state,query,tradition:'Myanmar',category:'monastery'}).some(p=>p.id===id));
 assert.equal(filterDirectory(data,{state:'CA',query:'Mrauk Oo Dhamma'}).length,1);
});
test('Sitagu 2024 reconciliation accounts for all entries without fabricated institutions',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/directory.json',import.meta.url))).places;
 const review=JSON.parse(readFileSync(new URL('../scripts/sitagu-2024-review.json',import.meta.url)));
 assert.equal(review.entries.length,153);
 assert.equal(new Set(review.entries.map(p=>p.entry)).size,153);
 assert.equal(new Set(data.map(p=>p.id)).size,data.length);
 assert.deepEqual(review.entries.filter(p=>p.status==='pending').map(p=>p.entry),[78,127]);
 for(const row of review.entries.filter(p=>p.status!=='pending')){
  const p=data.find(p=>p.id===row.id);assert.ok(p,`Missing entry ${row.entry}`);
  assert.ok(filterDirectory(data,{state:row.state,tradition:'Myanmar',category:'monastery',query:p.name}).some(x=>x.id===p.id),p.name);
  if(row.status==='added'){assert.equal(p.lat,null);assert.equal(p.lon,null);assert.match(p.verificationNote,/2024/);}
 }
 for(const id of review.removedDuplicateIds)assert.ok(!data.some(p=>p.id===id));
 for(const query of ['အဇူဇာ','ဗြဟ္မဝိဟာရ','Azusa','Progressive Buddhist Association']){
  const found=filterDirectory(data,{state:'CA',tradition:'Myanmar',query});assert.equal(found.length,1,query);assert.match(found[0].address,/Ranch Road/);
 }
});
