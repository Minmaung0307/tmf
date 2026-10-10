// Custom type names are reusable in this browser and travel with each submission/event.
const storageKey='tdsa:custom-event-types',createValue='__create_event_type__';
const valid=value=>typeof value==='string'&&value.trim().length>0&&value.trim().length<=80&&value!==createValue;
function saved(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(value)?value.filter(valid).slice(-40):[];}catch{return [];}}
export function initEventTypePicker(select){
 if(!select||select.dataset.customTypesReady)return;select.dataset.customTypesReady='true';
 const add=value=>{const name=value.trim(),existing=[...select.options].find(o=>o.value!==createValue&&o.value.toLocaleLowerCase()===name.toLocaleLowerCase());if(existing)return existing.value;select.add(new Option(name,name),select.querySelector('[data-create-type]'));return name;};
 for(const value of saved())add(value);const create=new Option('+ Create a new event type…',createValue);create.dataset.createType='true';select.add(create);let previous=select.value;
 for(const event of ['focus','pointerdown'])select.addEventListener(event,()=>{if(select.value!==createValue)previous=select.value;});
 select.form?.addEventListener('reset',()=>queueMicrotask(()=>{previous=select.value;}));
 select.addEventListener('change',()=>{if(select.value!==createValue){previous=select.value;return;}select.value=previous;
 const dialog=document.createElement('dialog');dialog.className='workspace-dialog event-type-dialog';dialog.setAttribute('aria-labelledby','newEventTypeTitle');const title=document.createElement('h2');title.id='newEventTypeTitle';title.textContent='Create an event type';const form=document.createElement('form');form.className='workspace-editor';const label=document.createElement('label');label.textContent='Event type name';const input=document.createElement('input');input.required=true;input.maxLength=80;input.placeholder='For example: Dhamma talk';input.setAttribute('aria-label','Event type name');label.append(input);const message=document.createElement('p');message.setAttribute('role','status');const actions=document.createElement('div');actions.className='custom-type-actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Cancel';cancel.onclick=()=>dialog.close();const save=document.createElement('button');save.className='primary';save.textContent='Create type';actions.append(cancel,save);form.append(label,actions,message);dialog.append(title,form);document.body.append(dialog);
 form.onsubmit=e=>{e.preventDefault();const name=input.value.trim();if(!valid(name)){message.textContent='Enter a name between 1 and 80 characters.';return;}const value=add(name);try{localStorage.setItem(storageKey,JSON.stringify([...new Set([...saved(),value])].slice(-40)));}catch{/* The selected type can still be submitted if browser storage is unavailable. */}select.value=value;previous=value;select.dispatchEvent(new Event('change',{bubbles:true}));dialog.close();};dialog.addEventListener('close',()=>{dialog.remove();select.focus({preventScroll:true});},{once:true});dialog.showModal();input.focus();
 });
 // Admin edit/import can assign a type not previously saved in this browser.
 return value=>{if(valid(value))add(value);select.value=value||'';previous=select.value;};
}
