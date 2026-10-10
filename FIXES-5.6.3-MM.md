# TMF 5.6.3 — ပြင်ဆင်ချက်နှင့် တင်ရန်လမ်းညွှန်

## ပြင်ဆင်ထားသောအချက်များ

- Events ခလုတ်ကို `Create an event` အဖြစ်ထားပြီး အောက်ကရှင်းလင်းစာနှင့် 7px ခွာထားသည်။ မူရင်း ZIP ထဲတွင် ခလုတ်စာသား ပြင်ထားပြီးသားဖြစ်သည်။
- Public/Contribute နှင့် Admin နှစ်ဘက်လုံးတွင် sign-out ဆုံးဖြတ်ချက်ကို တူညီစွာ အသုံးပြုထားသည်။ တူညီသော domain မှ tab တစ်ခုမှာ sign out လုပ်ပါက အခြား tab များလည်း sign out ဖြစ်မည်။ Tab ပိတ်ချိန် session ဆုံးခြင်းကို ဆက်ထားသည်။
- Sign-out လုပ်ပြီး refresh လုပ်သည့်အခါ၊ နောက်ကျပြီးမှပြီးဆုံးသော login popup မှတစ်ဆင့် session ပြန်ဝင်လာခြင်းကို ကာကွယ်ထားသည်။ Session အဟောင်းသိမ်းထားသော tab ကို ပြန်ဖွင့်သည့်အခါလည်း စစ်ဆေးသည်။
- Admin session အပြောင်းအလဲကို နားထောင်ပြီး sign-out ဖြစ်သွားပါက workspace ကို ပိတ်ထားသည်။
- Event list တွင် server အတည်ပြုထားသော snapshot ကိုသာ အသုံးပြုသည်။ Connection မရှိချိန် cached event အဟောင်းကို လက်ရှိ event အဖြစ် မပြတော့ပါ။ ပြန်ချိတ်သည့်အခါ live list ပြန်လာမည်။
- ဖွင့်ထားသော event အသေးစိတ်ကို သီးခြား live listener ဖြင့် စောင့်ကြည့်သည်။ ဖျက်ထားခြင်း၊ unpublished ပြောင်းထားခြင်း၊ ခွင့်ပြုချက်ဆုံးရှုံးခြင်းဖြစ်ပါက dialog ပိတ်ပြီး unavailable စာပြသည်။
- Listener ချိတ်ဆက်မှုမအောင်မြင်ပါက retry ပြန်လုပ်သည်။ Browser back/forward cache မှ ပြန်လာချိန် events ကို ပြန်စစ်သည်။
- Event shared link ဖြင့် draft/archived event ကို admin account သုံးပြီး public page မှ ကြည့်မိခြင်းကို ပိတ်ထားသည်။
- End date မပါသော event တွင် `undefined` မပြတော့ပါ။ Create-event form မှ ပုံမှန် Contribute ပြန်သွားချိန် placeholder/date requirement ပြန်မှန်သည်။
- Privacy form ပို့ပြီးချိန် purpose မမှားသွားစေရန် ထိန်းထားသည်။ Service-worker cache version အသစ်နှင့် လိုအပ်သော module များ ထည့်ထားသည်။

## တင်နည်း

လက်ရှိ project ကို backup ယူပြီး ZIP ထဲက `tmf` folder ကို အသုံးပြုပါ။ `public` folder ထဲက ဖိုင်အသစ် `auth-session.js` အပါအဝင် ဖိုင်အားလုံးကို တင်ရန်လိုသည်။

```bash
cd tmf
firebase deploy --only hosting --project tmf-mm
```

ဒီပြင်ဆင်မှုမှာ Firestore rules/indexes ကို မပြောင်းထားပါ။ လက်ရှိ backend ကို ဖျက်ခြင်း၊ account/event များကို ပြောင်းခြင်း မလုပ်ထားပါ။ `node_modules`, Git history နှင့် debug logs များ ZIP ထဲမပါပါ။ လက်ရှိ Firebase CLI အသုံးပြုနိုင်လျှင် hosting deploy အတွက် npm install မလိုပါ။

တင်ပြီးနောက် browser tab အဟောင်းများကို ပိတ်ပြီး site ကို ပြန်ဖွင့်ပါ။ Mac တွင် Cmd+Shift+R ဖြင့် တစ်ကြိမ် reload လုပ်ပါ။ www domain နှင့် non-www domain သည် browser storage သီးခြားဖြစ်သောကြောင့် ဒီ cross-tab sign-out သည် တူညီသော origin အတွင်းသာ သက်ရောက်သည်။

## စမ်းသပ်ထားမှု

- `npm test` — ရှိပြီးသား unit tests 30 ခု PASS။
- `tests/session-events-regression.mjs` — browser တွင် sign-out/refresh၊ tab နှစ်ခု sign-out၊ session အဟောင်း၊ explicit login ပြန်ဝင်ခြင်း၊ event delete/list/dialog၊ cache status၊ mobile/desktop 7px gap၊ form navigation စမ်းသပ်ထားသည်။
- `tests/admin-check.mjs` — browser တွင် admin sign-in၊ publish/edit/archive/delete၊ import၊ session navigation၊ sign-out နှင့် screen width 320/390/768/1440 စမ်းသပ်ထားသည်။
- Browser tests တွင် Firebase fixture များသုံးထားသည်။ Live project ဖြင့် sign-in/publish/delete သို့မဟုတ် rules emulator ကို ဒီပြင်ဆင်မှုတွင် မစမ်းထားပါ။

## တင်ပြီးနောက် အမှန်တကယ် Firebase နှင့်စစ်ရန်

1. Contribute တွင် Google login → Sign out → refresh။ Signed in မပြန်ပေါ်ရပါ။
2. တူညီသော domain ကို tab နှစ်ခုဖွင့်ပြီး sign out တစ်ခုလုပ်ပါ။ နှစ်ခုလုံး signed out ဖြစ်ရပါ။
3. Admin မှ test event တစ်ခု publish လုပ်ပါ။ အခြား user browser မှ Events နှင့် event details ကို ဖွင့်ထားပါ။
4. Admin မှ ထို event ကို delete လုပ်ပါ။ Online user list မှ event ပျောက်ပြီး ဖွင့်ထားသော dialog ပိတ်ရပါမည်။ Shared link ပြန်ဖွင့်ပါက unavailable ဟုပြရပါမည်။
5. မပြောင်းလဲသေးလျှင် URL/domain သည် deploy လုပ်ထားသော hosting site နှင့် ကိုက်ညီကြောင်း၊ browser console တွင် permission/index/network error ရှိမရှိ စစ်ပါ။

ဤ release သည် ဖော်ပြထားသောပြဿနာများနှင့် ဆက်စပ် session/event/form ပြဿနာများကို ပြင်ထားခြင်းဖြစ်ပြီး app တစ်ခုလုံး၏ production integration အားလုံးကို အတည်ပြုပြီးဖြစ်သည်ဟု မဆိုလိုပါ။
