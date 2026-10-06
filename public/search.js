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


export function filterDirectory(places,{query='',category='all',state='',tradition=''}={}) {
 const aliases={'သီတဂူ':'sitagu','မြန်မာ':'myanmar','burmese':'myanmar'};
 function terms(value){let s=normalize(value);for(const [a,b] of Object.entries(aliases))s=s.replaceAll(a,b);return s;}
 const tokens=terms(query).split(' ').filter(Boolean);
 const scored=places.filter(p=>(category==='all'||p.categories.includes(category))&&(!state||p.state===state)&&(!tradition||category==='organization'||p.traditions.includes(tradition))).map(p=>{
 const name=terms(p.name+' '+(p.aliases||[]).join(' '));const haystack=terms([p.name,...(p.aliases||[]),p.address,p.city,p.state,p.stateName,...p.traditions].join(' '));
 return {place:p,matched:tokens.every(t=>haystack.includes(t)),score:tokens.reduce((s,t)=>s+(name.includes(t)?2:0),0)};
 }).filter(p=>p.matched).sort((a,b)=>b.score-a.score||a.place.name.localeCompare(b.place.name));
 return scored.map(p=>p.place);
}
export function validPlace(p){return p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim()&&Array.isArray(p.categories)&&Array.isArray(p.traditions);}
