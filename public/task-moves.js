// Optimistic moves overlay the live snapshot until the latest intent is confirmed.
// Each task has one serial writer; fast follow-up moves replace the queued intent.
export function createTaskMoves({commit,changed,failed}) {
 let serverRows=[],generation=0;
 const pending=new Map();
 const matches=(row,desired)=>row&&row.status===desired.status&&row.position===desired.position;
 function reconcile(){for(const [id,item]of pending)if(item.saved&&matches(serverRows.find(row=>row.id===id),item.desired))pending.delete(id);}
 function rows(){const result=new Map(serverRows.map(row=>[row.id,row]));for(const [id,item]of pending)result.set(id,{...(result.get(id)||item.base),...item.desired,_moving:true});return [...result.values()];}
 async function drain(id,item,started){item.busy=true;try{while(started===generation&&pending.get(id)===item){const desired={...item.desired},revision=item.revision;await commit(id,desired);if(started!==generation)return;if(item.revision!==revision)continue;item.saved=true;item.busy=false;reconcile();changed(rows());return;}}catch(error){if(started!==generation)return;pending.delete(id);changed(rows());failed(error);} }
 return {
  rows,
  reset(){generation++;serverRows=[];pending.clear();},
  receive(next){serverRows=next;reconcile();changed(rows());},
  move(row,status,position){let item=pending.get(row.id);if(!item){item={base:row,revision:0,busy:false};pending.set(row.id,item);}item.desired={status,position};item.revision++;item.saved=false;changed(rows());if(!item.busy)void drain(row.id,item,generation);},
 };
}
