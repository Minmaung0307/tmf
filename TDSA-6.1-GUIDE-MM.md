# TDSA 6.1 — ပြင်ဆင်ချက်များ

## တင်ရန်

ZIP ထဲက `tmf` folder တွင်—

```bash
firebase deploy --only firestore:rules,hosting --project tmf-mm
```

Custom event type ကို event ထဲသိမ်းရန် rules အသစ်လိုသောကြောင့် **Hosting နှင့် Firestore rules နှစ်ခုလုံး** တင်ပါ။ ပြီးရင် Cmd+Shift+R ဖြင့် reload လုပ်ပါ။ အဟောင်းပဲပြလျှင် site ရဲ့ `refresh.html` မှ update လုပ်ပါ။

## 1. ချက်ချင်းရွှေ့နိုင်သော Tasks

- Drag & drop / Move to ရွေးလိုက်တာနဲ့ card ကို ချက်ချင်းရွှေ့ပြသည်။ Database သိမ်းခြင်းကို နောက်ကွယ်မှာလုပ်သည်။
- Server snapshot ရတိုင်း board တစ်ခုလုံးကို ဖျက်ပြီးပြန်မဆွဲတော့ပါ။ ရှိပြီးသား card/select DOM ကို ဆက်သုံးသည်။
- Board height နှင့် status message နေရာကို တည်ငြိမ်အောင်ထားပြီး လှုပ်ခါခြင်း၊ focus ပျောက်ခြင်းကို လျှော့ထားသည်။
- တစ်ကဒ်တည်းကို ဆက်တိုက်ရွှေ့ပါက နောက်ဆုံးရွေးထားသောနေရာကို ဦးစားပေးသိမ်းသည်။
- Move တစ်ခုက task title/details ကို overwrite မလုပ်ပါ။ Status နှင့် position ကိုသာ update လုပ်သည်။
- Save မအောင်မြင်ပါက server မှ လက်ရှိသိမ်းထားသောနေရာသို့ ပြန်ထားပြီး error ပြသည်။ မသိမ်းရသေးစဉ် ထိုကဒ်၏ Edit/Delete ကို ခဏပိတ်ထားသည်။ Move to ကို ဆက်သုံးနိုင်သည်။
- Offline ဖြစ်နေပါက error ပြပြီး မသိမ်းရသေးသော ပြောင်းလဲမှုကို အောင်မြင်ပြီဟု မပြပါ။

## 2. ရိုးရိုး Notes

ယခင် Personal records သည် ကိုယ်ပိုင်မှတ်စုသိမ်းရန်ဖြစ်သည်။ ယခု **Notes** ဟုပြောင်းပြီး:

- **+ New note** → စာရေး → **Save note**။
- Title ကို မထည့်လည်းရသည်။ ပထမစာကြောင်းကို title အဖြစ်ယူမည်။
- ရက်စွဲ/record-type ဖြည့်ရန်မလိုပါ။
- ခဲတံ icon မှပြင်၊ အမှိုက်ပုံး icon မှဖျက်နိုင်သည်။
- မှတ်စုအဟောင်းများကို မဖျက်ပါ။ ရှိပြီးသား backend records collection ကို ဆက်အသုံးပြုထားသည်။

## 3. Save profile ပြီးပါက

Save အောင်မြင်ပြီးနောက် edit form ကိုပိတ်ပြီး Task board သို့ပြန်သည်။ Profile summary တွင်သိမ်းထားသော name/photo/location ကို ဆက်ပြသည်။ **Edit profile** နှိပ်လျှင် သိမ်းထားသောအချက်အလက်များနှင့် ပြန်ဖွင့်နိုင်သည်။ Save မအောင်မြင်ပါက form ကိုမပိတ်ဘဲ ဖြည့်ထားသောအချက်အလက်ကို ဆက်ထားသည်။

## 4. Menu နေရာမရွေ့တော့ခြင်း

Discover နှင့် My space နှစ်ခုလုံးတွင် **Discover → My space → Events → Contribute** အစီအစဉ်၊ header/logo အရွယ်နှင့် menu တစ်ခုချင်းစီ၏နေရာကို တူညီအောင်ထားသည်။ Scrollbar ပေါ်/ပျောက်ချိန် width မလှုပ်စေရန် နေရာချန်ထားသည်။

## 5. Event type အသစ်ထည့်ရန်

Contribute သို့မဟုတ် Admin Events editor တွင်:

1. **Event type** ကိုဖွင့်ပါ။
2. **+ Create a new event type…** ကိုရွေးပါ။
3. အမည်ရေးပြီး **Create type** နှိပ်ပါ။
4. Type အသစ်ကို အလိုအလျောက်ရွေးပေးမည်။

အမည်တူရှိပြီးသားဖြစ်ပါက ရှိပြီးသား option ကိုသုံးသည်။ အများဆုံး စာလုံး 80 လက်ခံသည်။ ဖန်တီးထားသောရွေးချယ်စရာများကို ဒီ browser ထဲမှာပြန်သုံးနိုင်ရန် သိမ်းထားသည်။ Browser data ရှင်းခြင်း သို့မဟုတ် အခြား device သုံးခြင်းတွင် ထို custom option စာရင်း မလိုက်ပါ။ **ပို့ပြီးသား submission / publish လုပ်ထားသော event ထဲက type ကတော့ database မှာ သိမ်းထားသည်။**

Admin က suggestion ကို Review/Publish လုပ်ရာတွင် type မပျောက်ဘဲ ဆက်ပါမည်။ Published event ရဲ့ details modal မှာလည်း Event type ကိုပြသည်။ Custom type အသစ်ထည့်ခြင်းတစ်ခုတည်းက event ကို မပို့/မထုတ်ပြန်ပါ။ Send for review သို့မဟုတ် Publish ကို ဆက်နှိပ်ရပါမည်။

## စမ်းသပ်မှု

- Unit tests 37 ခု PASS။
- Firestore emulator rules tests 18 ခု PASS။
- Browser: server response ကို 2 စက္ကန့်နောက်ကျစေထားစဉ် task ကို synchronous ပြောင်းနိုင်ခြင်း (စမ်းသပ်ရာတွင် 100ms အောက်)၊ ဆက်တိုက်ရွှေ့ခြင်း၊ save rejection rollback၊ select/card DOM identity မပြောင်းခြင်း၊ profile save ပြီး form ပိတ်ခြင်း၊ title မလိုသော Notes၊ custom event type create/persist/cancel။
- Desktop/mobile တွင် Discover/My space menu coordinates တူညီခြင်းကို တိုက်ရိုက်နှိုင်းယှဉ်ထားသည်။
- Admin custom type create/edit/import နှင့် ယခင် event/session regression flows ကို စမ်းထားသည်။
- Browser tests တွင် simulated Firebase သုံးထားပြီး rules ကို local Firestore emulator ဖြင့်စမ်းထားသည်။ Live site ကို ဒီ ZIP ပြင်ဆင်စဉ် deploy မလုပ်ထားပါ။

ယခင် 6.0 guide သည် အခြား feature များအတွက် ဆက်အသုံးဝင်သည်။ Notes၊ Tasks၊ menu နှင့် event type အတွက် ယခု 6.1 guide ကို ဦးစားပေးပါ။
