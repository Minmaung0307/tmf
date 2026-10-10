# TDSA 6.0 — အသုံးပြုခြင်းနှင့် တင်ခြင်း

## အရေးကြီး — ဒီ release ကို တင်ရန်

လက်ရှိ project ကို backup ယူပြီး ZIP ထဲက `tmf` folder ကို အသုံးပြုပါ။ `public` တစ်ခုတည်းတင်ရုံမလုံလောက်ပါ။ **Firestore rules အသစ်ပါ တင်ရပါမည်။**

```bash
cd tmf
firebase deploy --only firestore:rules,hosting --project tmf-mm
```

ဒီ release သည် TMF ကို TDSA အဖြစ် ပြောင်းထားသော်လည်း Firebase project `tmf-mm` နှင့် ရှိပြီးသား `tmf_*` collection အမည်များကို ဆက်အသုံးပြုသည်။ Data migration လုပ်ရန်၊ database အဟောင်း ဖျက်ရန် မလိုပါ။ Live project ကို ဒီ ZIP ပြင်ဆင်စဉ် deploy မလုပ်ထားပါ။

တင်ပြီးနောက် browser ကို Cmd+Shift+R ဖြင့် reload လုပ်ပါ။ အဟောင်းပဲပြလျှင် website ရဲ့ `refresh.html` ကိုဖွင့်ပြီး update ခလုတ်နှိပ်ပါ။

## ပြောင်းလဲထားသောအရာများ

- Logo/အမည် TDSA၊ “A little closer to Home” နှင့် “Reconnect with your community.”
- Sage green၊ cream နှင့် နူးညံ့သော category အရောင်များ၊ mobile/desktop layout။
- အုပ်စု ၄ ခု: Monasteries၊ Pagodas & temples၊ Myanmar organizations၊ Retreat centers။
- Icon ၄ မျိုး: ကျောင်းအဆောက်အဦ၊ စေတီ၊ လူအုပ်စု၊ တရားထိုင်/ကြာပန်း။
- Event card ၏ ပုံ၊ ခေါင်းစဉ်၊ ကဒ်နေရာကို နှိပ်ခြင်း သို့မဟုတ် keyboard Enter/Space ဖြင့် details modal ဖွင့်နိုင်သည်။ Modal တွင် event အကြောင်းအရာ၊ address၊ dates၊ organizer website၊ copy link/details နှင့် QR code ပါသည်။ Escape/Close/background ဖြင့်ပိတ်နိုင်သည်။ Event ဖျက်/unpublish လုပ်ပါက modal ပိတ်သွားသည်။

## My space — user/admin တစ်ဦးချင်းစီအတွက်

Website ပေါ်က **My space** သို့သွားပြီး Google account ဖြင့်ဝင်ပါ။ Admin page မှလည်း **My profile & task board** သို့သွားနိုင်သည်။

### Edit profile

- Display name၊ phone၊ city/location နှင့် about/bio ကို ပြင်နိုင်သည်။
- Profile photo ရွေးပြီး **Save profile** နှိပ်ပါ။ ဓာတ်ပုံကို browser ထဲမှာ resize/compress လုပ်ပြီး WebP အဖြစ် သိမ်းသည်။ Firebase Storage setup မလိုပါ။
- ဓာတ်ပုံဖြုတ်လိုပါက **Remove photo → Save profile** လုပ်ပါ။
- Google account email သည် authentication မှရခြင်းဖြစ်သည်။ ဒီစာမျက်နှာက Google email သို့မဟုတ် admin role ကို ပြောင်းမပေးပါ။
- Admin role ကို server rules အရအတည်ပြုပြီးမှ Administrator နှင့် Manage directory & events ကို ပြသည်။

### Task board

- **+ New task** ဖြင့် title၊ details၊ status၊ priority နှင့် optional due date ကို ထည့်ပါ။
- Columns: **To do / In progress / Completed**။
- ကဒ်ရဲ့ လွတ်နေသောနေရာ သို့မဟုတ် ခေါင်းစဉ်အနီးမှ ဆွဲပြီး column အသစ်ထဲချပါ။ ကဒ်တစ်ခုအပေါ်ချပါက ထိုကဒ်ရှေ့သို့ အစီအစဉ်ရွှေ့သည်။
- Mobile/touch/keyboard သုံးသူများသည် **Move to** menu ဖြင့် status ပြောင်းနိုင်သည်။
- ခဲတံ icon = Edit၊ အမှိုက်ပုံး icon = Delete။ Delete တွင် confirmation ပါသည်။
- Completed task အရေအတွက်ကို profile summary မှာ ပြသည်။

### Personal records

- **+ Add a record** ဖြင့် title၊ notes နှင့် optional date ကို ထည့်ပါ။
- ကိုယ်ရေးမှတ်တမ်း၊ ကျောင်း/ရိပ်သာသွားခဲ့သောမှတ်စု၊ အရေးကြီးအကြောင်းအရာများကို သိမ်းနိုင်သည်။
- Edit/Delete icons ပါသည်။ နောက်ဆုံးသိမ်းသည့်ရက်ကို ပြသည်။

Profile၊ records နှင့် tasks သည် account ပိုင်ရှင်အတွက်သီးသန့်ဖြစ်သည်။ အခြား directory admin များလည်း app မှတစ်ဆင့် မဖတ်နိုင်ပါ။ Firebase infrastructure owner ၏ console/server access ကိုတော့ app rules က မကန့်သတ်နိုင်ပါ။ Profile မှာတင်ထားသောဓာတ်ပုံကို public directory မှာ မပြပါ။

တူညီသော account ဖြင့် အခြား device မှ ပြန်ဝင်ပါက သိမ်းထားသမျှ ပြန်ရသည်။ Browser tab နှစ်ခုက တစ်ချိန်တည်းပြင်မိလျှင် နောက်ဆုံး data ကိုမတော်တဆ overwrite မလုပ်ရန် conflict message ပြသည်။ တစ်မျိုးလျှင် နောက်ဆုံး update ဖြစ်ထားသော tasks/records 300 ကို ပြသည်။ Offline ဖြစ်ချိန် save မလုပ်ဘဲ reconnect ပြီးမှ save လုပ်ပါ။

## Admin — အုပ်စု ၄ ခုနှင့် Events

- `admin.html` — events publish/edit/archive/delete နှင့် private submission inbox။
- `admin-places.html` — category ၄ မျိုးစလုံးအတွက် place profiles၊ photos၊ public contact details နှင့် publish/edit/archive/delete။
- **Category** menu မှ Retreat center / ရိပ်သာ ကို ရွေးနိုင်သည်။ Managed list ကို category အလိုက် filter လုပ်နိုင်သည်။
- Place profiles စာမျက်နှာမှာလည်း Submission inbox ကို ပြထားသည်။ Place/retreat suggestion ကို အဲဒီ editor မှ review/publish လုပ်ပါ။ Event suggestion ကို Events editor မှ review/publish လုပ်ပါ။
- မူလ directory ထဲကနေရာကို **Edit directory place** ဖြင့်ရှာပြီး ပြင်ပါ။ **Publish** လုပ်ပါက ပြင်ထားသောအချက်အလက်ကို အသုံးပြုမည်။
- မူလ bundled place ကို **Delete** လုပ်လျှင် public directory မှ ဖျောက်ထားပြီး override/photo ရှိလျှင် ဖျက်မည်။ ပြန်ပြလိုလျှင် Edit directory place မှပြန်ရွေးပြီး Publish လုပ်ပါ။ Archive လုပ်လျှင်လည်း public မှဖျောက်သည်။ Draft ပြင်ခြင်းတစ်ခုတည်းက မူလ public listing ကို မဖျောက်ပါ။
- Cloud place profile အသစ်၏ edit/publish ကို ကြည့်ရန် public Browse names → Refresh community profiles ကို အသုံးပြုပါ။ Events နှင့် bundled-place hide status သည် live update လုပ်သည်။

## Retreat/meditation စာရင်းနှင့် sources

ရှိပြီးသားစာရင်းထဲက အမည်တွင် Retreat သို့မဟုတ် Meditation Center/Centre/Society ကို ထင်ရှားစွာဖော်ပြထားသော records များကို retreat category ထပ်တပ်ထားသည်။ မူလ category၊ source နှင့် data များကို ဆက်ထားသည်။ ဒီ category ထဲပါခြင်းက residential stay၊ walk-in access သို့မဟုတ် course availability ကို အာမမခံပါ။ ရှိပြီးသား duplicate source records များကို မဖျက်ထားပါ။

2026-10-09 တွင် official sources နှင့်စစ်ပြီး အသစ်ထည့်ထားသောနေရာများ:

| Center | Official source |
| --- | --- |
| Dhamma Dharā, Shelburne, Massachusetts | https://dhara.dhamma.org/contact/ |
| Dhamma Patāpa, Jesup, Georgia | https://www.patapa.dhamma.org/directions/ |
| Dhamma Mahāvana, North Fork, California | https://mahavana.dhamma.org/getting-here/ |

သင်တန်းတက်ခြင်း/လည်ပတ်ခြင်းမပြုမီ official website မှတစ်ဆင့် စာရင်းသွင်းမှုနှင့် လာရောက်နိုင်မှုကို အတည်ပြုပါ။ Source link ကို listing modal မှလည်း ဖွင့်နိုင်သည်။

## စမ်းသပ်ထားသောအရာများ

- Unit tests **33 ခု PASS**: search၊ categories၊ event/place validation၊ private form validation။
- Firestore emulator rules tests **17 ခု PASS**: public/private access၊ user နှစ်ဦးခွဲခြားခြင်း၊ admin ကအခြားသူ private profile မဖတ်နိုင်ခြင်း၊ photo format/size constraints၊ role injection တားဆီးခြင်း၊ retreat publishing၊ live event publish/delete။
- Browser tests: profile/photo save+reload၊ task create/edit/delete+drag/drop၊ records create/edit/delete၊ sign-out privacy၊ event card click/keyboard+QR၊ retreat search၊ admin retreat publish/category filter၊ admin event management၊ desktop/mobile overflow နှင့် ယခင် sign-out/event regression tests။
- Browser flows မှာ Firebase fixtures အသုံးပြုသည်။ Rules ကို actual local Firestore emulator ဖြင့် သီးခြားစမ်းထားသည်။ Live Google sign-in/production Firebase deployment ကို မစမ်းထားပါ။

စမ်းသပ်ရန်:

```bash
npm install
npm test
npm run test:rules
```

Browser tests အတွက် Playwright/Chromium install လုပ်ထားရန်နှင့် `public` ကို port 8780 တွင် serve လုပ်ထားရန် လိုသည်။ Tests ထဲက `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `TMF_URL` environment variables ကို လိုအပ်သလိုသတ်မှတ်နိုင်သည်။

## Deployment ပြီးပါက လုပ်ကြည့်ရန်

1. Google login → My space → profile photo/name save → refresh။
2. Task တစ်ခု create → In progress သို့ drag → edit → delete။
3. Personal record သိမ်းပြီး account အခြားတစ်ခုနှင့်ဝင်ကြည့်ပါ။ မူလ record မပေါ်ရပါ။
4. Admin မှ Retreat center profile တစ်ခု publish လုပ်ပြီး public directory မှကြည့်ပါ။
5. Event card ပုံ/ခေါင်းစဉ်ကိုနှိပ်ပြီး modal+QR ကိုစစ်ပါ။ Admin မှ event delete လုပ်လျှင် public card/dialog ပျောက်ရပါမည်။

ZIP ထဲတွင် node_modules၊ Git history၊ emulator cache နှင့် debug logs မပါပါ။
