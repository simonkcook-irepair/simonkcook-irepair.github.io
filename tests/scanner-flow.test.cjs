const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp}=require('./app-harness.cjs');

test('home scanner is the first repair route and confirmed identity opens exact-model repairs',()=>{
  const a=loadApp();try{
    assert.equal(a.document.querySelector('.route-choice button').dataset.action,'device-scanner');
    a.click('[data-action="device-scanner"]');a.click('[data-scan13-target="this"]');
    assert.ok(a.document.querySelector('[data-scanner-repairs]').disabled);
    a.change('#scannerBrand','Apple');a.change('#scannerModel','iphone6s');a.click('[data-scanner-repairs]');
    assert.equal(a.state().mode,'book');assert.equal(a.state().devices[0].model,'iphone6s');
    a.click('[data-multi-fault="screen"]');a.click('[data-build24="start-selected"]');
    assert.equal(a.state().variant,'Screen replacement — LCD');assert.deepEqual(a.errors,[]);
  }finally{a.close()}
});

test('captured scan needs exact confirmation, supports Samsung and Pixel, and never uploads pictures',()=>{
  const a=loadApp();try{
    a.click('[data-action="device-scanner"]');
    a.window.eval("scan13.screen='complete';scan13.shots.front='data:image/png;base64,AA==';render()");
    assert.match(a.document.querySelector('#main').textContent,/Automatic recognition is not available yet/);
    assert.ok(a.document.querySelector('[data-scanner-repairs]').disabled);
    a.change('#scannerBrand','Samsung');
    const samsung=a.document.querySelector('#scannerModel option[value]:not([value=""])').value;
    a.change('#scannerModel',samsung);a.change('#scannerBrand','Google Pixel');
    assert.ok(a.document.querySelector('[data-scanner-repairs]').disabled);
    const pixel=a.document.querySelector('#scannerModel option[value]:not([value=""])').value;
    a.change('#scannerModel',pixel);a.click('[data-scanner-repairs]');
    assert.equal(a.state().devices[0].model,pixel);assert.equal(a.state().mode,'book');
    assert.equal(a.requests.some(r=>r.body?.includes('data:image')),false);assert.deepEqual(a.errors,[]);
  }finally{a.close()}
});

test('identifying a different phone preserves existing basket repairs as a separate device',()=>{
  const a=loadApp();try{
    a.click('[data-build25-route="known"]');a.click('[data-catalogue-brand="Apple"]');a.change('#model','iphone6s');
    a.click('[data-multi-fault="battery"]');a.click('[data-build24="start-selected"]');a.click('[data-action="save-repair"]');
    const original=a.state().basket;a.click('.brand-icon');a.click('[data-action="device-scanner"]');a.click('[data-scan13-target="this"]');
    a.change('#scannerBrand','Apple');a.change('#scannerModel','iphonexr');a.click('[data-scanner-repairs]');
    assert.deepEqual(a.state().basket,original);assert.equal(a.state().devices.length,2);
    assert.equal(a.state().devices.find(d=>d.id===a.state().active).model,'iphonexr');assert.deepEqual(a.errors,[]);
  }finally{a.close()}
});
