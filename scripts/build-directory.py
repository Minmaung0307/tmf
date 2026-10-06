#!/usr/bin/env python3
"""Convert a small, manually downloaded OSM extract and Census states into a local directory.
Usage: python3 scripts/build-directory.py osm.json states.geojson
No network requests are made. Inspect results before publishing; see DATA-SOURCES.md.
"""
import json,re,sys,datetime,pathlib,math
root=pathlib.Path(__file__).resolve().parents[1]
osm=json.load(open(sys.argv[1]));geo=json.load(open(sys.argv[2]));assert 'remark' not in osm,osm.get('remark')
polygons=[]
for f in geo['features']:
 g=f['geometry'];props=f['properties'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 for rings in polys:
  xs=[p[0] for p in rings[0]];ys=[p[1] for p in rings[0]]
  polygons.append((min(xs),min(ys),max(xs),max(ys),rings,props['STUSAB'],props['NAME']))
def in_ring(x,y,ring):
 inside=False;j=len(ring)-1
 for i,(xi,yi) in enumerate(ring):
  xj,yj=ring[j]
  if (yi>y)!=(yj>y) and x < (xj-xi)*(y-yi)/(yj-yi)+xi:inside=not inside
  j=i
 return inside
def locate(lat,lon):
 for xmin,ymin,xmax,ymax,rings,code,name in polygons:
  if xmin<=lon<=xmax and ymin<=lat<=ymax and in_ring(lon,lat,rings[0]) and not any(in_ring(lon,lat,r) for r in rings[1:]):return code,name
 return '',''
def normalize(x):return re.sub(r'\W+','',x.lower())
places=[]
for el in osm['elements']:
 t=el.get('tags',{});name=t.get('name:en') or t.get('name');loc=el.get('center',el);lat=loc.get('lat');lon=loc.get('lon')
 if not name or lat is None or lon is None:continue
 if t.get('disused')=='yes' or t.get('abandoned')=='yes':continue
 code,state=locate(lat,lon)
 if not code or code in ['PR','GU','VI','AS','MP']:continue
 buddhist=t.get('religion')=='buddhist'
 if t.get('amenity') in ['restaurant','cafe','fast_food','grave_yard'] or t.get('shop') or t.get('landuse')=='cemetery' or t.get('tourism')=='artwork':continue
 monastery=bool(re.search(r'monastery|vihara|kyaung|ကျောင်း',name,re.I)) or t.get('amenity')=='monastery'
 temple=buddhist and (t.get('amenity') in ['place_of_worship','monastery'] or t.get('building') in ['temple','religious','monastery'] or bool(re.search(r'temple|pagoda|meditation|buddh|dharma|dhamma|zen|wat |vihara|monastery',name,re.I)))
 organization=bool(re.search(r'Burmese|Myanmar',name,re.I)) and (t.get('amenity') in ['community_centre','social_facility'] or t.get('office') in ['ngo','association','charity'] or bool(re.search(r'association|organization|community|foundation|institute|society',name,re.I)))
 if not (monastery or temple or organization):continue
 cats=(['monastery'] if monastery else [])+(['temple'] if temple else [])+(['organization'] if organization else [])
 traditions=[];hay=' '.join([name,t.get('denomination',''),t.get('name:my','')])
 for tradition,pattern in [('Myanmar',r'burmese|myanmar|sitagu|\bshwe\b|kyaung|မြန်မာ|သီတဂူ'),('Sri Lanka',r'sri lanka|sri lankan|sinhala'),('Thailand',r'\bthai\b|thailand'),('Laos',r'\blao\b|\blaos\b|laotian'),('Cambodia',r'cambodia|khmer')]:
  if re.search(pattern,hay,re.I):traditions.append(tradition)
 street=' '.join(filter(None,[t.get('addr:housenumber'),t.get('addr:street')]))
 city=t.get('addr:city') or t.get('addr:town') or t.get('addr:village') or ''
 address=', '.join(filter(None,[street,city,code+' '+t.get('addr:postcode','')])).strip()
 aliases=list(dict.fromkeys(v for k,v in t.items() if k in ['name','name:en','name:my','alt_name','short_name','official_name'] and v!=name))
 places.append(dict(id=f"osm-{el['type']}-{el['id']}",name=name,aliases=aliases,categories=cats,traditions=traditions,address=address,city=city,state=code,stateName=state,lat=lat,lon=lon,website=t.get('website',t.get('contact:website','')),phone=t.get('phone',t.get('contact:phone','')),source=f"https://www.openstreetmap.org/{el['type']}/{el['id']}",sourceType='osm'))
# Deduplicate only matching names at almost identical locations (node/building duplicates).
unique=[]
for p in places:
 duplicate=next((q for q in unique if normalize(q['name'])==normalize(p['name']) and abs(q['lat']-p['lat'])<.001 and abs(q['lon']-p['lon'])<.001),None)
 if duplicate:
  for key in ['website','phone','city']:
   if not duplicate[key]:duplicate[key]=p[key]
 else:unique.append(p)
# Small independently sourced additions/overrides; never use Google Places data.
for p in json.load(open(root/'scripts/official-places.json')):
 match=next((q for q in unique if p['match'].lower() in q['name'].lower() and q['state']==p['state']),None)
 p={k:v for k,v in p.items() if k!='match'}
 if match:
  for k in ['lat','lon']:
   if k not in p:p[k]=match[k]
  unique.remove(match)
 p.setdefault('lat',None);p.setdefault('lon',None);unique.append(p)
unique.sort(key=lambda p:p['name'].casefold())
result={'version':3,'updated':'2026-10-06','osmTimestamp':osm.get('osm3s',{}).get('timestamp_osm_base',''),'license':'ODbL-1.0','attribution':'© OpenStreetMap contributors; official-source additions linked per record','places':unique}
(root/'public/directory.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print('Places:',len(unique),'States:',len(set(p['state'] for p in unique)),'Categories:',{c:sum(c in p['categories'] for p in unique) for c in ['monastery','temple','organization']})
