# TDSA 6.2

## ပြောင်းလဲထားသည့်အချက်များ

- Profile summary တွင် Phone၊ City၊ About ကို ပြပြီး save/reload ပြီးနောက်လည်း ဆက်ပြသည်။ မဖြည့်ထားသော field ကို ဖျောက်ထားသည်။
- Top menu: Discover → Events → Contribute → My space။ Menu တစ်ခုစီတွင် SVG icon ပါသည်။
- ပင်မစာမျက်နှာမှ My space သို့ document reload မလုပ်ဘဲ ပြောင်းပြသည်။ Menu ပြောင်းရုံဖြင့် task board၊ notes၊ မသိမ်းရသေးသော profile form မပျောက်ပါ။ Sign out လုပ်လျှင် private data ကို ရှင်းသည်။ Refresh လုပ်လျှင် မသိမ်းရသေးသော edits ပျောက်နိုင်သည်။
- Menu နှိပ်ရာတွင် hash scrolling animation မဖြစ်တော့ပါ။ Directory refresh တွင် ရှိပြီးသား results ကို loading skeleton ဖြင့် ထပ်ခါတလဲလဲ အစားမထိုးတော့ပါ။ ပထမဆုံး online data ဖတ်ခြင်းမှာ connection အမြန်နှုန်းအပေါ် မူတည်သည်။
- Admin inbox ၏ Link existing event ကို action buttons အောက်တွင် သီးခြား expandable panel ဖြင့် ပြသည်။ Mobile တွင် select နှင့် button ကို တစ်ခုအောက်တစ်ခု ပြသည်။

## Link an existing event ဆိုတာ

Admin က event ကို သီးခြားတင်ထားပြီးသား ဖြစ်သည့်အခါ၊ ထို event နှင့် သက်ဆိုင်သော submission ကို ချိတ်ရန် ဖြစ်သည်။ တင်သူ၏ submission status တွင် Published / Removed or unpublished ကို ပြနိုင်သည်။ Event ကို ဖျက်ခြင်း၊ အစားထိုးခြင်း၊ duplicate ဖန်တီးခြင်း မလုပ်ပါ။ တင်သူ၏ event ၂ ခု၊ ၃ ခုကို group ဖွဲ့ခြင်းလည်း မဟုတ်ပါ။ လက်ရှိ submission တစ်ခုကို publication တစ်ခုနှင့်သာ ချိတ်သည်။ ထပ်ချိတ်လျှင် submission ပေါ်က link ကိုသာ ပြောင်းသည်။

## တင်ရန်

ZIP ဖြည်ပြီး `tmf` folder မှ အောက်ပါ command ကို အသုံးပြုပါ။

```bash
firebase deploy --only firestore:rules,hosting --project tmf-mm
```

6.1 rules တင်ပြီးသားဖြစ်ပါက `--only hosting` ဖြင့် ရသည်။ ယခု update တွင် rules မပြောင်းထားပါ။ Browser တွင် အဟောင်းဆက်ပြနေပါက `refresh.html` ကို ဖွင့်ပါ။ ဤ ZIP ကို live site သို့ အလိုအလျောက် မတင်ထားပါ။

## Maintenance

`profile.html` direct link ကိုလည်း ဆက်သုံးနိုင်သည်။ Workspace markup ကို `index.html` ရှိ `#my-space` နှင့် `profile.html` နှစ်နေရာတွင် ညီညီညွတ်ညွတ် ပြင်ပါ။ Profile logic ကို `profile.js` တစ်ဖိုင်တည်းမှ သုံးသည်။ Existing Firebase project နှင့် collections မပြောင်းထားပါ။
