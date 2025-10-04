import { db } from './firebase.js';
import {
  collection, getDocs, query, where, addDoc, deleteDoc, doc
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

(function(){
  emailjs.init({ publicKey: 'WT0GOYrL9HnDKvLUf' });
})();

const traditions = ['Myanmar','Sri Lanka','Thailand','Laos','Cambodia','USA'];
const usStates = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'
];

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tabpanel');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b=>b.classList.remove('active'));
  panels.forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

const stateSel = document.getElementById('state');
usStates.forEach(s=>{ const o=document.createElement('option'); o.value=o.textContent=s; stateSel.appendChild(o); });
const eventStateSel = document.getElementById('eventState');
usStates.forEach(s=>{ const o=document.createElement('option'); o.value=o.textContent=s; eventStateSel.appendChild(o); });

const eventMonthSel = document.getElementById('eventMonth');
const monthNames = Array.from({length:12}, (_,i)=> new Date(2000, i, 1).toLocaleString('en-US', {month:'long'}));
const monthOpt0 = document.createElement('option'); monthOpt0.value=''; monthOpt0.textContent='All Months'; eventMonthSel.appendChild(monthOpt0);
monthNames.forEach((m,i)=>{ const o=document.createElement('option'); o.value = String(i+1).padStart(2,'0'); o.textContent = m; eventMonthSel.appendChild(o); });

let map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OpenStreetMap'
}).addTo(map);
map.setView([39.5,-98.35], 4);
let markerLayer = L.layerGroup().addTo(map);

function norm(x){ return (x||'').toString().toLowerCase(); }
function matchesTemple(t, text, trad, st){
  const q = norm(text);
  const okText = !q || [t.name, t.city, t.state, t.address].some(v=>norm(v).includes(q));
  const okTrad = !trad || (t.tradition === trad);
  const okState = !st || (t.state === st);
  return okText && okTrad && okState;
}

const templeList = document.getElementById('templeList');
const search = document.getElementById('search');
const traditionSel = document.getElementById('tradition');
const resetFilters = document.getElementById('resetFilters');

let temples = [];

async function loadTemples(){
  const snap = await getDocs(collection(db, 'temples'));
  temples = snap.docs.map(d=> ({ id:d.id, ...d.data() }));
  renderTemples();
}

function renderTemples(){
  const text = search.value.trim();
  const trad = traditionSel.value;
  const st = stateSel.value;
  const filtered = temples.filter(t=> matchesTemple(t, text, trad, st));

  templeList.innerHTML = '';
  filtered.forEach(t=> {
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <h3>${t.name} <span class="badge">${t.tradition||''}</span></h3>
      <div class="meta">${t.city||''}, ${t.state||''}</div>
      <div>${t.address||''}</div>
      <div class="actions">
        ${t.phone?`<a href="tel:${t.phone}">📞 ${t.phone}</a>`:''}
        ${t.email?`<a href="mailto:${t.email}"><span>✉️ ${t.email}</span></a>`:''}
        ${t.website?`<a href="${t.website}" target="_blank" rel="noopener">🌐 Website</a>`:''}
        ${t.facebook?`<a href="${t.facebook}" target="_blank" rel="noopener">📘 Facebook</a>`:''}
      </div>
    `;
    templeList.appendChild(el);
  });

  markerLayer.clearLayers();
  filtered.forEach(t=>{
    if (t.lat && t.lng){
      const m = L.marker([t.lat, t.lng]);
      m.bindPopup(`<strong>${t.name}</strong><br>${t.city||''}, ${t.state||''}`);
      markerLayer.addLayer(m);
    }
  });
  const pts = filtered.filter(t=>t.lat&&t.lng).map(t=>[t.lat,t.lng]);
  if (pts.length){
    const bounds = L.latLngBounds(pts);
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
  } else {
    map.setView([39.5,-98.35], 4);
  }
}

search.addEventListener('input', renderTemples);
traditionSel.addEventListener('change', renderTemples);
stateSel.addEventListener('change', renderTemples);
resetFilters.addEventListener('click', ()=>{
  search.value=''; traditionSel.value=''; stateSel.value=''; renderTemples();
});

const eventList = document.getElementById('eventList');
const eventSearch = document.getElementById('eventSearch');
const resetEvents = document.getElementById('resetEvents');
let events = [];

function matchesEvent(e, text, month, st){
  const q = norm(text);
  const okText = !q || [e.title, e.templeName, e.city, e.state].some(v=>norm(v).includes(q));
  const okMonth = !month || (String((e.dateStart||'').slice(5,7)) === month || String((e.dateEnd||'').slice(5,7)) === month);
  const okState = !st || (e.state === st);
  return okText && okMonth && okState;
}

async function loadEvents(){
  const snap = await getDocs(collection(db, 'events'));
  events = snap.docs.map(d=> ({ id:d.id, ...d.data() }));
  renderEvents();
}

function renderEvents(){
  const qtext = eventSearch.value.trim();
  const m = eventMonthSel.value;
  const st = eventStateSel.value;
  const filtered = events.filter(e=> matchesEvent(e, qtext, m, st))
                         .sort((a,b)=> (a.dateStart||'').localeCompare(b.dateStart||''));
  eventList.innerHTML = '';
  filtered.forEach(e=>{
    const wrap = document.createElement('div'); wrap.className='card';
    const dateRange = e.dateEnd && e.dateEnd!==e.dateStart ? `${e.dateStart} → ${e.dateEnd}` : (e.dateStart||'');
    wrap.innerHTML = `
      <div class="event-title">${e.title}</div>
      <div class="meta">${dateRange}</div>
      <div>${e.templeName||''}</div>
      <div>${e.city||''}, ${e.state||''}</div>
      <div>${e.address||''}</div>
    `;
    eventList.appendChild(wrap);
  });
}

eventSearch.addEventListener('input', renderEvents);
eventMonthSel.addEventListener('change', renderEvents);
eventStateSel.addEventListener('change', renderEvents);
resetEvents.addEventListener('click', ()=>{
  eventSearch.value=''; eventMonthSel.value=''; eventStateSel.value=''; renderEvents();
});

const submitForm = document.getElementById('submitForm');
const submitStatus = document.getElementById('submitStatus');
submitForm.addEventListener('submit', async (e)=>{
  e.preventDefault(); submitStatus.textContent='Sending…';
  try{
    const res = await emailjs.send('service_z9tkmvr','template_q5q471f', Object.fromEntries(new FormData(submitForm)));
    submitStatus.textContent='✅ Thanks! We received your submission.';
    submitForm.reset();
  }catch(err){
    console.error(err);
    submitStatus.textContent='❌ Failed to send. Please try again later.';
  }
});

const seedBtn = document.getElementById('seedBtn');
const wipeBtn = document.getElementById('wipeBtn');
const seedStatus = document.getElementById('seedStatus');

const sampleTemples = [
  { name:'Sitagu Dhamma Vihara', tradition:'Myanmar', city:'Austin', state:'TX', address:'123 Dhamma Way, Austin, TX', phone:'(512) 555‑0101', email:'info@sitagu.example', website:'https://example.org', lat:30.307, lng:-97.742 },
  { name:'Miami Buddhist Vihara', tradition:'Sri Lanka', city:'Miami', state:'FL', address:'456 Vihara Rd, Miami, FL', phone:'(305) 555‑0130', email:'hello@miamivihara.example', website:'https://example.org', lat:25.7617, lng:-80.1918 },
  { name:'Wat Thai of Los Angeles', tradition:'Thailand', city:'North Hollywood', state:'CA', address:'8225 Coldwater Canyon Ave, CA', phone:'(818) 555‑0168', website:'https://example.org', lat:34.2169, lng:-118.4138 },
  { name:'Wat Lao Xayaram', tradition:'Laos', city:'Fort Worth', state:'TX', address:'789 Lao Way, Fort Worth, TX', phone:'(817) 555‑0123', lat:32.7555, lng:-97.3308 },
  { name:'Wat Khmer Samaki', tradition:'Cambodia', city:'Lowell', state:'MA', address:'101 Khmer St, Lowell, MA', phone:'(978) 555‑0177', lat:42.6334, lng:-71.3162 },
  { name:'Abhayagiri Buddhist Monastery (example)', tradition:'USA', city:'Redwood Valley', state:'CA', address:'16201 Tomki Rd, Redwood Valley, CA', phone:'(707) 555‑0188', website:'https://example.org', lat:39.2817, lng:-123.2011 }
];

const sampleEvents = [
  { title:'Thingyan / New Year Dana', templeName:'Sitagu Dhamma Vihara', city:'Austin', state:'TX', address:'On‑site', dateStart:'2025-04-13', dateEnd:'2025-04-16' },
  { title:'Vesak Day', templeName:'Miami Buddhist Vihara', city:'Miami', state:'FL', address:'Temple Grounds', dateStart:'2025-05-12' },
  { title:'Kathina Ceremony', templeName:'Wat Thai of Los Angeles', city:'North Hollywood', state:'CA', address:'Main Hall', dateStart:'2025-11-02' }
];

seedBtn?.addEventListener('click', async ()=>{
  try{
    seedStatus.textContent='Seeding…';
    for (const t of sampleTemples){ await addDoc(collection(db,'temples'), t); }
    for (const ev of sampleEvents){ await addDoc(collection(db,'events'), ev); }
    seedStatus.textContent='✅ Sample data added.';
    await loadTemples(); await loadEvents();
  }catch(err){ console.error(err); seedStatus.textContent='❌ Error seeding sample data.'; }
});

wipeBtn?.addEventListener('click', async ()=>{
  try{
    seedStatus.textContent='Deleting…';
    const tSnap = await getDocs(collection(db,'temples'));
    const eSnap = await getDocs(collection(db,'events'));
    await Promise.all(tSnap.docs.map(d=> deleteDoc(doc(db,'temples', d.id))));
    await Promise.all(eSnap.docs.map(d=> deleteDoc(doc(db,'events', d.id))));
    seedStatus.textContent='✅ All documents deleted.';
    await loadTemples(); await loadEvents();
  }catch(err){ console.error(err); seedStatus.textContent='❌ Error deleting documents.'; }
});

await loadTemples();
await loadEvents();
