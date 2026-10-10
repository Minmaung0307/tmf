export const normalize = value => String(value ?? '').normalize('NFC').toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
export function safeUrl(value) { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
export function mapsUrl(query, id) { const url = new URL('https://www.google.com/maps/search/'); url.searchParams.set('api', '1'); url.searchParams.set('query', query); if (id) url.searchParams.set('query_place_id', id); return url.href; }
export function matchesEvent(e, {query='', month='', state='', period='all'}, today = new Date().toLocaleDateString('en-CA')) {
  const text = normalize([e.title,e.templeName,e.city,e.state,e.address].join(' '));
  const matchesText = normalize(query).split(' ').every(t => text.includes(t));
  let matchesMonth = !month;
  if (month && e.dateStart) {
    const start = new Date(e.dateStart+'T12:00:00'); const end = new Date((e.dateEnd || e.dateStart)+'T12:00:00');
    for (let d = new Date(start.getFullYear(),start.getMonth(),1); d <= end; d.setMonth(d.getMonth()+1)) { if (d.getMonth()+1 === Number(month)) { matchesMonth = true; break; } }
  }
  const past = (e.dateEnd || e.dateStart || '') < today;
  return matchesText && matchesMonth && (!state || state === e.state) && (period === 'all' || (period === 'past' ? past : !past));
}
export function withTimeout(promise, ms=18000) { let timer; return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Connection timed out')),ms);})]).finally(()=>clearTimeout(timer)); }


// Canonical search concepts connect Myanmar names with common English spellings.
// They do not add records or infer a place's nationality from its name.
const searchAliases = [
 ['retreat', ['ရိပ်သာများ','ရိပ်သာ','တရားထိုင်','retreat centers','retreat center','retreats','retreat','meditation']],
 ['organization', ['အသင်းအဖွဲ့','အဖွဲ့အစည်း','အသင်း','အဖွဲ့','organizations','organisation','organization']],
 ['monastery', ['ဘုန်းကြီးကျောင်း','ဘုန်းတော်ကြီးကျောင်း','ကျောင်းတိုက်','monasteries','monastery']],
 ['temple', ['စေတီပုထိုး','စေတီ','ဘုရားကျောင်း','ဘုရား','pagodas','pagoda','temples','temple']],
 ['myanmar', ['မြန်မာ','burmese','myanmar']],
 ['sitagu', ['သီတဂူ','sitagu']],
 ['shwezigon', ['ရွှေစည်းခုံ','ရွှေစည်ခုံ','shwe zigon','shwezigon','shwe si gon']],
 ['chanmyay', ['ချမ်းမြေ့','ချမ်းမြေ့ရိပ်သာ','chan myay','chanmyay','chan mye','chanmye']],
 ['abhayagiri', ['အဘယဂိရိ','အဘယဂီရိ','abhayagiri']],
];
function searchText(value) {
 let text=normalize(value);
 // Longest phrases first keep compound names intact. English aliases need word boundaries.
 const entries=searchAliases.flatMap(([key,values])=>values.map(v=>[v,key])).sort((a,b)=>b[0].length-a[0].length);
 const pattern=entries.map(([v])=>/[a-z]/.test(v)?`\\b${v}\\b`:v).join('|');
 text=text.replace(new RegExp(pattern,'gu'),match=>' '+entries.find(([v])=>v===match)[1]+' ');
 return normalize(text);
}
// Keep native aliases in the record index so incomplete Myanmar input can match.
function indexedText(value) {
 const canonical=searchText(value);
 const words=new Set(canonical.split(' '));
 const aliases=searchAliases.filter(([key])=>words.has(key)).flatMap(([,values])=>values);
 return normalize([value,canonical,...aliases].join(' '));
}
export function filterDirectory(places,{query='',category='all',state='',tradition=''}={}) {
 const tokens=searchText(query).split(' ').filter(Boolean);
 return places.filter(p=>(category==='all'||p.categories.includes(category))&&(!state||p.state===state)&&(!tradition||(tradition==='unrecorded'?p.traditions.length===0:tradition==='other'?p.traditions.some(t=>!['Myanmar','Sri Lanka','Thailand','Laos','Cambodia'].includes(t)):p.traditions.includes(tradition)))).map(p=>{
 const name=indexedText([p.name,...(p.aliases||[])].join(' '));
 const compactName=name.replace(/\s+/g,'');
 const haystack=indexedText([p.name,...(p.aliases||[]),p.address,p.city,p.state,p.stateName,...p.traditions,...p.categories].join(' '));
 return {place:p,matched:tokens.every(t=>haystack.includes(t)||compactName.includes(t)),score:tokens.reduce((s,t)=>s+(name.includes(t)?2:0),0)};
 }).filter(p=>p.matched).sort((a,b)=>b.score-a.score||a.place.name.localeCompare(b.place.name)).map(p=>p.place);
}
export function validPlace(p){return p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim()&&Array.isArray(p.categories)&&Array.isArray(p.traditions);}
