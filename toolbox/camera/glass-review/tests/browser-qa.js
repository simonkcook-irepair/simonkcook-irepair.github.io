/* iRepair Camera Diagnostics mobile browser regression.
 * Requirements: npm install playwright-core @sparticuz/chromium
 * Run: node tests/browser-qa.js
 * Optionally set CAMERA_TEST_URL to the deployed Safari review URL.
 * Runs with a FAKE browser camera, never a real iPhone hardware claim.
 */
const {chromium}=require("playwright-core");
const chrome=require("@sparticuz/chromium");
const assert=require("node:assert/strict");
const base=process.env.CAMERA_TEST_URL ||
 "file://"+require("node:path").resolve(__dirname,"..","index.html");
(async()=>{
 const browser=await chromium.launch({executablePath:await chrome.executablePath(),
  args:[...chrome.args,"--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream"],
  headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,permissions:["camera"]});
 page.setDefaultTimeout(11000);
 const errors=[],posts=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("request",req=>{if(req.method()==="POST")posts.push(req.url())});
 await page.goto(base);
 assert.equal(await page.locator("#home.active").count(),1);
 assert.equal(await page.locator("#home .phoneArt .dynamicIsland").count(),1);
 await page.locator("#begin").click();
 const years=await page.locator("#phoneModel optgroup").evaluateAll(a=>a.map(x=>+x.label));
 assert.equal(years[0],2026);assert.equal(years.at(-1),2017);
 await page.locator("#phoneModel").selectOption("iphone-17-pro-max");
 assert.match(await page.locator("#planTitle").innerText(),/^8 guided/);
 await page.locator("#start").click();
 const steps=[
 ["Rear camera","FAIL"],["Focus response","FAIL"],["Image stability","FAIL"],
 ["Rear flash","FAIL"],["Ultra-wide camera","UNABLE"],["Telephoto camera","UNABLE"],
 ["Front camera","PASS"],["Face ID","FAIL"]
 ];
 for(const [name,value] of steps){
  assert.equal(await page.locator("#stepTitle").innerText(),name);
  if(["Rear camera","Focus response","Image stability","Rear flash","Front camera"].includes(name)){
   await page.waitForFunction(()=>document.querySelector("#cameraVideo").classList.contains("visible"));
  }else{
   assert(await page.locator("#modelDiagram").isVisible());
   assert(await page.locator("#cameraVideo").isHidden());
  }
  if(name==="Rear flash")
   assert.match(await page.locator("#testFoot").innerText(),/shared-system clue/);
  if(name==="Face ID")
   assert.match(await page.locator("#streamStatus").innerText(),/Safari cannot read Face ID/);
  await page.locator('[data-answer="'+value+'"]').click();
  if(value==="FAIL"&&["Rear camera","Focus response","Image stability","Rear flash"].includes(name)){
   assert(await page.locator("#symptomPanel").isVisible(),"Missing optional failure follow-up");
   const checkboxes=page.locator("#symptomOptions input");
   assert((await checkboxes.count())>=2,"Technical symptom options not supplied");
   await checkboxes.first().check();
   if(name==="Image stability")await checkboxes.nth(1).check();
   await page.locator("#symptomContinue").click();
  }
 }
 assert.equal(await page.locator("#passCount").innerText(),"1");
 assert.equal(await page.locator("#failCount").innerText(),"5");
 assert.equal(await page.locator("#unableCount").innerText(),"2");
 const insights=await page.locator("#triageRows").innerText();
 assert.match(insights,/Rear camera \+ flash/);
 assert.match(insights,/autofocus \/ image-stabilisation/);
 assert.match(insights,/Selfie camera works but Face ID/);
 await page.evaluate(()=>{navigator.clipboard.writeText=async text=>{window.__copied=text}});
 await page.locator("#copyReport").click();
 const report=await page.evaluate(()=>window.__copied||"");
 assert.match(report,/TECHNICIAN TRIAGE CLUES/);
 assert.match(report,/does not prove a common power rail/);
 assert.match(report,/Face ID recognition: FAIL/);
 assert.match(report,/Customer-described Rear picture stability & noise symptoms:/);
 assert.match(report,/High-pitched buzzing or whining/);
 assert(!report.includes("data:image"));
 await page.emulateMedia({media:"print"});
 assert.notEqual(await page.locator("#triageHints").evaluate(el=>getComputedStyle(el).display),"none");
 await page.emulateMedia({media:"screen"});
 await page.locator("#startOver").click();
 await page.locator("#phoneModel").selectOption("iphone-se-2022");
 assert.match(await page.locator("#planTitle").innerText(),/^5 guided/);
 assert(!/Face ID/.test(await page.locator("#planText").innerText()));
 assert.deepEqual(errors,[]);assert.deepEqual(posts,[]);
 await browser.close();
 console.log("CAMERA_FACEID_FLASH_STABILITY_BROWSER_E2E_PASS");
})().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
