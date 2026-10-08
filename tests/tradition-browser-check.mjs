import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
try{
 const p=await b.newPage({serviceWorkers:'block'});await p.route('https://**',r=>r.abort());
 await p.goto('http://127.0.0.1:8780/?tradition=Myanmar%20(2)%20(0)%20(0)');await p.waitForSelector('.place-card');
 assert.equal(await p.locator('#tradition').inputValue(),'Myanmar');
 for(let i=0;i<3;i++)for(const value of ['Myanmar','Sri Lanka','Thailand','Laos','Cambodia','']){
  await p.selectOption('#tradition',value);await p.waitForTimeout(150);
  assert.equal(await p.locator('#tradition').inputValue(),value);
  assert.ok(await p.locator('.place-card').count()>0,value);
  for(const text of await p.locator('#tradition option').allTextContents())assert.equal((text.match(/\(\d+\)/g)||[]).length,1,text);
 }
 await p.selectOption('#state','TX');await p.selectOption('#tradition','Sri Lanka');await p.waitForTimeout(150);
 assert.match(await p.locator('#templeList').innerText(),/Houston Buddhist Vihara/);
 await p.selectOption('#state','');await p.selectOption('#tradition','unrecorded');await p.waitForTimeout(150);
 assert.ok(await p.locator('.place-card').count()>0);
 await p.locator('[data-category="organization"]').click();assert.ok(await p.locator('#tradition').isEnabled());
 await p.selectOption('#tradition','Myanmar');await p.waitForTimeout(150);assert.ok(await p.locator('.place-card').count()>0);
 await p.locator('[data-category="monastery"]').click();await p.selectOption('#state','NC');await p.waitForTimeout(150);
 assert.equal(await p.locator('.place-card').count(),10);
 await p.selectOption('#state','TN');await p.locator('#search').fill('99 Lyle');await p.waitForTimeout(350);
 assert.match(await p.locator('#templeList').innerText(),/The Buddhist Temple/);
 await p.selectOption('#state','MN');await p.locator('#search').fill('Sitagu Dhammavihara');await p.waitForTimeout(350);assert.match(await p.locator('#templeList').innerText(),/32500 Lofton/);
 await p.selectOption('#state','IL');await p.locator('#search').fill('ချမ်းမြေ့');await p.waitForTimeout(350);assert.match(await p.locator('#templeList').innerText(),/525 N Bruns/);
 await p.selectOption('#state','CA');await p.locator('#search').fill('Mrauk Oo Dhamma');await p.waitForTimeout(350);assert.equal(await p.locator('.place-card').count(),1);
 await p.locator('#search').fill('အဇူဇာ');await p.waitForTimeout(350);assert.equal(await p.locator('.place-card').count(),1);assert.match(await p.locator('#templeList').innerText(),/Ranch Road/);
 console.log('PASS repeated tradition selections, stable values/counts, corrupted URL recovery and state combination.');
}finally{await b.close();}
