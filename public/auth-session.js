// One sign-out decision across public/admin tabs, while keeping tab-scoped login.
const logoutKey='tmf:last-sign-out', loginKey='tmf:session-generation';
let pending;
export function getSession(){
 if(!pending)pending=Promise.all([import('./cloud.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')]).then(async([cloud,a])=>{
  const {app}=await cloud.getCloud(),auth=a.getAuth(app);
  await a.setPersistence(auth,a.browserSessionPersistence);
  await auth.authStateReady();
  const generation=()=>localStorage.getItem(logoutKey)||'';
  const stale=()=>generation()!==(sessionStorage.getItem(loginKey)||'');
  if(stale()){await a.signOut(auth);sessionStorage.setItem(loginKey,generation());}
  const reconcile=()=>{if(stale())a.signOut(auth).catch(()=>{});};
  window.addEventListener('storage',event=>{if(event.key===logoutKey)reconcile();});
  window.addEventListener('pageshow',reconcile);
  const sdk={...a,
   async signOut(target){
    // Record intent before awaiting Firebase so refresh cannot restore an older session.
    localStorage.setItem(logoutKey,crypto.randomUUID());
    await a.signOut(target);
    sessionStorage.setItem(loginKey,generation());
   },
   async signInWithPopup(target,provider){
    const started=generation();
    const result=await a.signInWithPopup(target,provider);
    if(started!==generation()){await a.signOut(target);throw Error('Sign-in canceled because you signed out. Please sign in again.');}
    sessionStorage.setItem(loginKey,started);
    return result;
   }
  };
  return {a:sdk,auth};
 }).catch(error=>{pending=null;throw error;});
 return pending;
}
