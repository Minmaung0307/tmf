(function(){ emailjs.init({ publicKey: 'WT0GOYrL9HnDKvLUf' }); })();

const usStates = ['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tabpanel');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b=>b.classList.remove('active'));
  panels.forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

// ---------- Temples (Google Places live search) ----------
const stateSel = document.getElementById('state');
usStates.forEach(s=>{ const o=document.createElement('option'); o.value=o.textContent=s; stateSel.appendChild(o); });

const templeList = document.getElementById('templeList');
const search = document.getElementById('search');
const traditionSel = document.getElementById('tradition');
const resetFilters = document.getElementById('resetFilters');

let map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
map.setView([39.5,-98.35], 4);
let markerLayer = L.layerGroup().addTo(map);

function norm(x){ return (x||'').toString().toLowerCase().normalize('NFC').trim(); }

let googleMapForPlaces, placesService;
function ensurePlacesService(){
  if (!placesService){
    const div = document.createElement('div');
    div.style.width='0'; div.style.height='0'; div.style.position='absolute'; div.style.left='-9999px';
    document.body.appendChild(div);
    googleMapForPlaces = new google.maps.Map(div, {center:{lat:39.5,lng:-98.35}, zoom:4});
    placesService = new google.maps.places.PlacesService(googleMapForPlaces);
  }
  return placesService;
}

function buildQuery(){
  const q = search.value.trim();
  const trad = traditionSel.value;
  const st = stateSel.value;
  const parts = [];
  if (q) parts.push(q);
  if (trad) parts.push(trad);
  if (st) parts.push(st);
  parts.push('Buddhist temple United States');
  return parts.join(' ');
}

function textSearchOnce(request){
  const svc = ensurePlacesService();
  return new Promise((resolve, reject)=>{
    svc.textSearch(request, (res, status)=>{
      if (status === google.maps.places.PlacesServiceStatus.OK && res){
        resolve(res);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
        resolve([]);
      } else {
        reject(new Error('Places textSearch failed: ' + status));
      }
    });
  });
}

function getPlaceDetails(placeId){
  const svc = ensurePlacesService();
  return new Promise((resolve)=>{
    svc.getDetails({placeId, fields:['name','formatted_address','geometry','international_phone_number','website','url']}, (res, status)=>{
      if (status === google.maps.places.PlacesServiceStatus.OK && res){ resolve(res); } else { resolve(null); }
    });
  });
}

async function searchTemples(){
  const query = buildQuery();
  templeList.innerHTML = '<div class="card">Searching…</div>';
  markerLayer.clearLayers();
  try{
    const results = await textSearchOnce({ query });
    if (!results.length){ templeList.innerHTML = '<div class="card">No results found. Try other keywords (Wat, Vihara, ရွှေ, etc.).</div>'; return; }
    const top = results.slice(0, 20);
    const details = await Promise.all(top.map(p => getPlaceDetails(p.place_id)));

    templeList.innerHTML='';
    const boundsPts = [];
    details.forEach(d=>{
      const name = d?.name || 'Unknown';
      const addr = d?.formatted_address || '';
      const phone = d?.international_phone_number || '';
      const url = d?.website || d?.url || '';
      const loc = d?.geometry?.location;
      const lat = loc ? loc.lat() : null;
      const lng = loc ? loc.lng() : null;

      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<h3>${name}</h3><div class="meta">${addr}</div>
        <div class="actions">${phone?`<a href="tel:${phone}">📞 ${phone}</a>`:''}${url?`<a href="${url}" target="_blank" rel="noopener">🌐 Website</a>`:''}</div>`;
      templeList.appendChild(el);

      if (lat && lng){ const m = L.marker([lat, lng]).bindPopup(`<strong>${name}</strong><br>${addr}`); markerLayer.addLayer(m); boundsPts.push([lat, lng]); }
    });
    if (boundsPts.length){ const b = L.latLngBounds(boundsPts); if (b.isValid()) map.fitBounds(b.pad(0.2)); } else { map.setView([39.5,-98.35], 4); }
  }catch(err){ console.error(err); templeList.innerHTML = '<div class="card">❌ Search failed. Check Google Maps API key & billing.</div>'; }
}

search.addEventListener('input', debounce(searchTemples, 400));
traditionSel.addEventListener('change', searchTemples);
stateSel.addEventListener('change', searchTemples);
resetFilters.addEventListener('click', ()=>{ search.value=''; traditionSel.value=''; stateSel.value=''; searchTemples(); });

window.tmfInit = () => searchTemples();
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

// ---------- Events (image cards) ----------
const eventGrid = document.getElementById('eventGrid');
const eventSearch = document.getElementById('eventSearch');
const eventMonthSel = document.getElementById('eventMonth');
const eventStateSel = document.getElementById('eventState');
const resetEvents = document.getElementById('resetEvents');

const monthNames = Array.from({length:12}, (_,i)=> new Date(2000, i, 1).toLocaleString('en-US', {month:'long'}));
const o0 = document.createElement('option'); o0.value=''; o0.textContent='All Months'; eventMonthSel.appendChild(o0);
monthNames.forEach((m,i)=>{ const o=document.createElement('option'); o.value=String(i+1).padStart(2,'0'); o.textContent=m; eventMonthSel.appendChild(o); });
usStates.forEach(s=>{ const o=document.createElement('option'); o.value=o.textContent=s; eventStateSel.appendChild(o); });

let eventsData = [];
async function loadEvents(){
  try{
    const res = await fetch('events.json', {cache:'no-store'});
    if (!res.ok) throw new Error('events.json not found ('+res.status+')');
    const data = await res.json();
    eventsData = Array.isArray(data)? data: [];
  }catch(e){
    console.error(e);
    eventGrid.innerHTML = '<div class="card">❌ Failed to load <code>events.json</code>. Put it next to <code>index.html</code> and redeploy. Then hard-reload.</div>';
    return;
  }
  renderEvents();
}
function hostFromUrl(u){ try{ return new URL(u).host.replace(/^www\./,''); } catch(_){ return 'link'; } }
function matchesEvent(e, text, month, st){
  const q = norm(text);
  const okText = !q || [e.title, e.templeName, e.city, e.state].some(v=> norm(v).includes(q));
  const okMonth = !month || (String((e.dateStart||'').slice(5,7)) === month || String((e.dateEnd||'').slice(5,7)) === month);
  const okState = !st || (e.state === st);
  return okText && okMonth && okState;
}
function renderEvents(){
  const q = eventSearch.value.trim();
  const m = eventMonthSel.value;
  const st = eventStateSel.value;
  const filtered = eventsData.filter(e=> matchesEvent(e, q, m, st)).sort((a,b)=> (a.dateStart||'').localeCompare(b.dateStart||''));

  eventGrid.innerHTML = '';
  if (!filtered.length){ eventGrid.innerHTML = '<div class="card">No events yet. Add some via <code>events.json</code> or submit using the form.</div>'; return; }

  filtered.forEach(e=>{
    const dateRange = e.dateEnd && e.dateEnd!==e.dateStart ? `${e.dateStart} → ${e.dateEnd}` : (e.dateStart||'');
    const img = e.image || 'images/event-placeholder.jpg';
    const host = e.link ? hostFromUrl(e.link) : null;

    const card = document.createElement('article');
    card.className = 'event-card';
    card.innerHTML = `
      <img class="event-thumb" src="${img}" alt="${e.title||'Event'}">
      <div class="event-body">
        <div class="event-title">${e.title||''}</div>
        <div class="event-meta">${dateRange}</div>
        <div>${e.templeName||''}</div>
        <div>${e.city||''}, ${e.state||''}</div>
        <div class="event-meta">${e.address||''}</div>
        <div class="btn-row">
          ${e.link ? `<a class="btn-link" href="${e.link}" target="_blank" rel="noopener">🔗 ${host}</a>` : ''}
        </div>
      </div>
    `;
    eventGrid.appendChild(card);
  });
}
eventSearch.addEventListener('input', renderEvents);
eventMonthSel.addEventListener('change', renderEvents);
eventStateSel.addEventListener('change', renderEvents);
resetEvents.addEventListener('click', ()=>{ eventSearch.value=''; eventMonthSel.value=''; eventStateSel.value=''; renderEvents(); });
loadEvents();

// ---------- Submit (EmailJS) ----------
const submitForm = document.getElementById('submitForm');
const submitStatus = document.getElementById('submitStatus');
submitForm.addEventListener('submit', async (e)=>{
  e.preventDefault(); submitStatus.textContent='Sending…';
  try{
    await emailjs.send('service_z9tkmvr','template_q5q471f', Object.fromEntries(new FormData(submitForm)));
    submitStatus.textContent='✅ Thanks! Your message has been sent.';
    submitForm.reset();
  }catch(err){
    console.error(err);
    submitStatus.textContent='❌ Failed to send. Please try again later.';
  }
});