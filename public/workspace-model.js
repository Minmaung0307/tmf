export const columns=[['todo','To do'],['doing','In progress'],['done','Completed']];
export const priorities=['normal','high','low'];
const clean=(v,max,label)=>{const s=String(v??'').trim();if(s.length>max)throw Error(`${label} is too long (maximum ${max}).`);return s;};
export function validDate(v){return v===''||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v);}
export function profileValues(v){const data={};for(const [key,max] of Object.entries({displayName:100,phone:60,location:120,bio:2000}))data[key]=clean(v[key],max,key);if(!data.displayName)throw Error('Please enter your display name.');return data;}
export function taskValues(v){const title=clean(v.title,180,'Title'),details=clean(v.details,4000,'Details'),dueDate=String(v.dueDate||'');if(!title)throw Error('Enter a task title.');if(!columns.some(([id])=>id===v.status)||!priorities.includes(v.priority))throw Error('Choose a valid status and priority.');if(!validDate(dueDate))throw Error('Choose a valid due date.');return {title,details,status:v.status,priority:v.priority,dueDate};}
export function noteValues(v){const title=clean(v.title,180,'Title'),body=clean(v.body,8000,'Notes'),date=String(v.date||'');if(!title||!body)throw Error('Enter a title and some notes.');if(!validDate(date))throw Error('Choose a valid record date.');return {title,body,date};}
export const sameRevision=(a,b)=>a?.seconds===b?.seconds&&a?.nanoseconds===b?.nanoseconds;
