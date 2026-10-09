export const eventFields=['title','templeName','city','state','address','dateStart','dateEnd','link','description','status'];
const limits={title:180,templeName:180,city:100,state:2,address:300,dateStart:10,dateEnd:10,link:600,description:4000,status:9};
export function eventFromForm(values){const e={};for(const field of eventFields)e[field]=String(values[field]||'').trim();if(!e.dateEnd)e.dateEnd=e.dateStart;return e;}
export function validateEvent(e){
 for(const field of eventFields)if(typeof e[field]!=='string'||e[field].length>limits[field])throw Error('Please shorten or correct '+field+'.');
 if(!e.title||!e.templeName||!e.city||!e.address)throw Error('Enter the title, organizer/place, city and address.');
 for(const field of ['dateStart','dateEnd']){if(!/^\d{4}-\d{2}-\d{2}$/.test(e[field])||Number.isNaN(Date.parse(e[field]+'T12:00:00Z'))||new Date(e[field]+'T12:00:00Z').toISOString().slice(0,10)!==e[field])throw Error('Enter valid event dates.');}
 if(e.dateEnd<e.dateStart)throw Error('The end date must be on or after the start date.');
 if(!/^[A-Z]{2}$/.test(e.state))throw Error('Use a two-letter state code, for example TX.');
 if(e.link){let u;try{u=new URL(e.link);}catch{throw Error('Use a valid HTTPS event link.');}if(u.protocol!=='https:')throw Error('Use an HTTPS event link.');}
 if(!['draft','published','archived'].includes(e.status))throw Error('Choose a valid publication status.');
 return e;
}
export function suggestionToEvent(s){if(!s||s.type!=='tmf-suggestion')throw Error('Choose a TMF suggestion file.');return eventFromForm({title:s.subject,templeName:s.temple_name,city:String(s.city_state||'').replace(/,?\s+[A-Z]{2}$/, ''),address:s.address||'',state:(String(s.city_state||'').match(/(?:,|\s)\s*([A-Z]{2})$/)||[])[1]||'',dateStart:s.event_start,dateEnd:s.event_end,link:s.link,description:s.message,status:'draft'});}
