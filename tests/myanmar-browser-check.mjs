import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
try{
 const page=await browser.newPage({serviceWorkers:'block'});await page.route('https://**',r=>r.abort());
 await page.goto('http://127.0.0.1:8780');await page.waitForSelector('.place-card');
 for(const [query,expected] of [['အ','Abhayagiri'],['အဘ','Abhayagiri'],['အဘယ','Abhayagiri'],['သီ','Sitagu'],['သီတဂူ','Sitagu'],['အဘယဂိရိ','Abhayagiri'],['မြန်မာဘုန်းကြီးကျောင်း','Sitagu']]){
  await page.locator('#search').fill(query);await page.waitForTimeout(350);
  assert.match(await page.locator('#templeList').innerText(),new RegExp(expected));
 }
 await page.locator('#search').fill('အသင်းအဖွဲ့');await page.waitForTimeout(350);
 assert.ok(await page.locator('.place-card').count()>0);assert.equal(await page.locator('.place-card:not(.tone-organization)').count(),0);
 console.log('PASS Myanmar typing updates results without submitting; names and compound categories.');
}finally{await browser.close();}
