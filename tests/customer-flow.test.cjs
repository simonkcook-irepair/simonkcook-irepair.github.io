const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp}=require('./app-harness.cjs');
const beforePrices=require('./fixtures/catalogue-prices-before.json');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');

function start(app,brand,model){
  app.click('[data-build25-route="known"]');
  app.click('[data-catalogue-brand="'+brand+'"]');
  app.change('#model',model);
}
function selectRepairs(app,faults){
  for(const fault of faults) app.click('[data-multi-fault="'+fault+'"]');
  app.click('[data-build24="start-selected"]');
}
function finishService(app){
  app.click('[data-action="next-service"]');
  app.click('[data-service="dropin"]');
  app.change('#preferredDate','2026-10-01');
  app.change('#daypart','Morning');
}

test('manufacturer-first selection and queued LCD Screen + Battery work in the real module chain',async()=>{
  const app=loadApp();
  try{
    app.click('[data-build25-route="known"]');
    assert.equal(app.document.querySelector('#model'),null);
    assert.equal(app.document.querySelector('[data-multi-fault]'),null);
    assert.deepEqual([...app.document.querySelectorAll('[data-catalogue-brand]')].map(b=>b.textContent),['Apple','Samsung','Google Pixel']);
    app.click('[data-catalogue-brand="Apple"]');app.change('#model','iphone6s');
    assert.equal(app.document.querySelector('[data-multi-fault="rear"]'),null);
    selectRepairs(app,['screen','battery']);
    assert.equal(app.state().variant,'Screen replacement — LCD');
    assert.equal(app.document.querySelector('#faultDetail').textContent.includes('OLED'),false);
    assert.equal(app.document.querySelector('#faultDetail [data-option]'),null);
    app.click('[data-action="save-repair"]');await app.flush();
    assert.equal(app.state().fault,'battery');
    app.click('[data-action="save-repair"]');await app.flush();
    assert.deepEqual(app.state().basket.map(r=>r.fault),['screen','battery']);
    assert.equal(app.state().fault,'');
    assert.deepEqual(app.errors,[]);
  }finally{app.close()}
});

test('Book navigation and restart never silently select the default iPhone',()=>{
  const app=loadApp();
  try{
    app.click('#navBook');
    assert.equal(app.state().devices[0].model,'');
    assert.equal(app.document.querySelector('[data-multi-fault]'),null);
    // The existing Book tab opens the two-route home screen.
    app.click('[data-build25-route="known"]');
    assert.equal(app.document.querySelectorAll('[data-catalogue-brand]').length,3);
    app.window.eval('restart()');app.click('#navBook');
    assert.equal(app.state().devices[0].model,'');
  }finally{app.close()}
});

test('a failed module load replaces the customer controls instead of exposing generic options',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').replace('src="core.html?v=31"','src="about:blank"');
  const dom=new JSDOM(html,{
    url:'https://simonkcook-irepair.github.io/',runScripts:'dangerously',virtualConsole:new VirtualConsole()
  });
  try{
    const frame=dom.window.document.querySelector('#irepair-app');
    frame.dispatchEvent(new dom.window.Event('load'));
    const doc=frame.contentDocument,script=doc.querySelector('script[src]');
    assert.ok(script);
    script.onerror();
    assert.ok(doc.body.textContent.includes('Device options are unavailable'));
    assert.equal(doc.querySelectorAll('button,select,input').length,0);
    assert.equal(frame.style.visibility,'visible');
  }finally{dom.window.close()}
});

test('XR rear dropdown contains exactly XR finishes and blocks a forged colour',async()=>{
  const app=loadApp();
  try{
    start(app,'Apple','iphonexr');selectRepairs(app,['rear']);
    assert.deepEqual(new Set([...app.document.querySelectorAll('#glassColour option')].map(o=>o.value)),new Set(['','White','Black','Blue','Yellow','Coral','(PRODUCT)RED','Not sure']));
    app.window.eval('diagnostic.colour="Silver";addRepair()');
    assert.equal(app.state().basket.length,0);
    app.change('#glassColour','Coral');app.click('[data-action="save-repair"]');await app.flush();
    assert.equal(app.state().basket[0].diagnostic.colour,'Coral');
    assert.deepEqual(app.errors,[]);
  }finally{app.close()}
});

test('all existing model prices and review/office flags remain exactly unchanged',()=>{
  const app=loadApp();
  try{
    const actual=JSON.parse(app.window.eval('JSON.stringify(CATALOGUE)'));
    for(const [id,expected] of Object.entries(beforePrices)) assert.deepEqual(actual[id],expected,id);
  }finally{app.close()}
});

test('changing model or active device clears pending repairs and diagnostic state',async()=>{
  const app=loadApp();
  try{
    start(app,'Apple','iphonexr');
    app.click('[data-multi-fault="rear"]');
    app.click('[data-build25-change-device]');
    app.click('[data-catalogue-brand="Apple"]');app.change('#model','iphone6s');
    assert.deepEqual(Array.from(app.window.IRepairMultiRepair.pending()),[]);
    app.click('[data-multi-fault="screen"]');app.click('[data-build24="start-selected"]');
    app.window.eval('addDevice()');await app.flush();
    assert.equal(app.state().devices[1].model,'');
    assert.equal(app.document.querySelector('[data-multi-fault]'),null);
    assert.deepEqual(Array.from(app.window.IRepairMultiRepair.queued()),[]);
    app.window.eval('setDevice(1)');assert.equal(app.state().fault,'');
    assert.equal(app.state().diagnostic.colour,'');
  }finally{app.close()}
});

test('Samsung and Pixel selections use sourced identities and quote-only assessment',async()=>{
  const app=loadApp();
  try{
    start(app,'Samsung','samsungs23ultra');selectRepairs(app,['screen']);
    assert.equal(app.state().variant,'Screen assessment');
    assert.equal(app.document.querySelector('#faultDetail').textContent.includes('LCD'),false);
    app.click('[data-action="save-repair"]');await app.flush();
    assert.equal(app.state().basket[0].price,null);
    app.window.eval('addDevice()');
    app.click('[data-catalogue-brand="Google Pixel"]');app.change('#model','googlepixel9a');
    assert.equal(app.document.querySelector('[data-multi-fault="rear"]'),null);
    selectRepairs(app,['screen']);app.click('[data-action="save-repair"]');await app.flush();
    assert.equal(app.state().basket[1].model,'Pixel 9a');
    assert.equal(app.window.eval('route()'),'dropin');
  }finally{app.close()}
});

test('unlisted models can request assessment without generic parts or colours',()=>{
  const app=loadApp();
  try{
    start(app,'Samsung','otherphone');
    assert.equal(app.document.querySelector('[data-multi-fault]'),null);
    assert.equal(app.document.querySelector('[data-catalogue-assessment]').disabled,true);
    app.input('#customModel','Galaxy model requiring identification');
    app.click('[data-catalogue-assessment]');
    assert.equal(app.state().basket[0].option,'Device assessment');
    assert.equal(app.state().basket[0].price,null);
    assert.equal(app.state().basket[0].model,'Galaxy model requiring identification');
  }finally{app.close()}
});

test('guided diagnosis and sourced Apple A-number identification remain available',()=>{
  const app=loadApp();
  try{
    app.click('[data-build25-route="help"]');app.click('[data-catalogue-brand="Apple"]');
    app.change('#helpModel','iphone6s');app.click('[data-action="help-device-next"]');
    assert.equal(app.document.querySelector('[data-help-issue="rear"]'),null);
    app.click('[data-help-issue="screen"]');app.click('[data-action="help-show-options"]');
    assert.equal(app.state().variant,'Screen replacement — LCD');
    app.window.eval('restart()');
    app.click('[data-build25-route="help"]');app.click('[data-catalogue-brand="Apple"]');
    app.click('[data-help-brand="Apple iPhone"]');
    assert.ok(app.document.querySelector('[data-id12-action], [data-id15]'));
    assert.equal(app.window.eval('ID10_A.A1633'),'iphone6s');
    assert.equal(app.window.eval('ID10_A.A3720'),undefined);
    assert.deepEqual(app.errors,[]);
  }finally{app.close()}
});

test('multi-device booking retains manufacturer, finish, panel, secondary contacts and Relay',async()=>{
  const app=loadApp();
  try{
    start(app,'Apple','iphonexr');selectRepairs(app,['rear']);
    app.change('#glassColour','Coral');app.click('[data-action="save-repair"]');await app.flush();
    app.window.eval('addDevice()');app.click('[data-catalogue-brand="Google Pixel"]');app.change('#model','googlepixel9profold');
    selectRepairs(app,['screen']);
    app.click('[data-action="save-repair"]');assert.equal(app.state().basket.length,1);
    app.change('#screenPanel','inner');app.click('[data-action="save-repair"]');await app.flush();
    finishService(app);
    app.document.querySelector('#bookingContactEnabled').click();
    app.input('#bookingContactName','Catalogue test helper');app.input('#bookingContactPhone','TEST ONLY');
    app.input('#bookingContactRelationship','Test');
    app.click('[data-action="next-review"]');app.click('[data-action="finish"]');await app.flush();
    const creates=app.requests.filter(r=>r.method==='POST'&&r.url.endsWith('/core-api/jobs')).map(r=>JSON.parse(r.body));
    assert.equal(creates.length,2);
    assert.equal(creates[0].manufacturer,'Apple');
    assert.ok(creates[0].repair.includes('Coral'));
    assert.equal(creates[1].manufacturer,'Google Pixel');
    assert.ok(creates[1].repair.includes('Folding screen'));
    assert.ok(creates.every(j=>j.price===null&&j.compatibility==='unknown'&&j.partState==='not_checked'));
    assert.equal(app.requests.filter(r=>r.method==='POST'&&r.url.endsWith('/contacts')).length,2);
    assert.ok(app.document.querySelector('[data-build24-relay]'));
    assert.deepEqual(app.errors,[]);
  }finally{app.close()}
});

test('forged basket options are rejected before any Core create request',async()=>{
  const app=loadApp();
  try{
    start(app,'Apple','iphone6s');selectRepairs(app,['screen']);
    app.click('[data-action="save-repair"]');await app.flush();finishService(app);
    app.click('[data-action="next-review"]');
    app.window.eval('basket[0].option="Screen replacement — OLED"');
    app.click('[data-action="finish"]');await app.flush();
    assert.equal(app.requests.some(r=>r.method==='POST'&&r.url.endsWith('/jobs')),false);
    assert.equal(app.state().mode,'book');
  }finally{app.close()}
});

test('home referrals, Relay entry, artwork and current visual modules remain in the runtime',()=>{
  const app=loadApp();
  try{
    assert.ok(app.document.querySelector('[data-build25-share]'));
    assert.ok(app.document.querySelector('[data-build25-relay]'));
    assert.ok(app.document.documentElement.style.getPropertyValue('--irepair-bg'));
    assert.equal(app.window.IRepairCatalogueReady,true);
    app.click('[data-build25-relay]');
    assert.ok(app.document.querySelector('#b25RelayInput'));
    assert.deepEqual(app.errors,[]);
  }finally{app.close()}
});
