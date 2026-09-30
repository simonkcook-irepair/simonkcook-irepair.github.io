const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole,ResourceLoader}=require('jsdom');
const root=path.resolve(__dirname,'..');

test('technician page renders Core jobs, navigates, and opens the preserved workflow controls',async()=>{
  const errors=[],requests=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const job={id:'IR-TEST-TECH',customerName:'Catalogue test',device:'iPhone 6s',
    repair:'Screen replacement — LCD',price:59,status:'booked',service:'Mobile call-out',
    address:'Test address',postcode:'TEST',slot:'Morning',partState:'in_stock',
    paymentState:'unpaid',contacts:[],observations:[],messages:[],timeline:[]};
  class LocalScripts extends ResourceLoader{
    fetch(url){return url.includes('/prototype-db.js')?
      Promise.resolve(fs.readFileSync(path.join(root,'prototype-db.js'))):null;}
  }
  const dom=new JSDOM(fs.readFileSync(path.join(root,'tech.html'),'utf8'),{
    url:'https://simonkcook-irepair.github.io/tech.html',runScripts:'dangerously',
    resources:new LocalScripts(),pretendToBeVisual:true,virtualConsole,
    beforeParse(window){
      window.fetch=async(url,options={})=>{
        requests.push({url:String(url),method:options.method||'GET'});
        return {ok:true,status:200,text:async()=>JSON.stringify({jobs:[job]})};
      };
    }
  });
  try{
    await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));
    await new Promise(resolve=>setTimeout(resolve,20));
    const document=dom.window.document;
    assert.deepEqual(errors,[]);
    assert.match(document.querySelector('#main').textContent,/Repair operations/);
    assert.match(document.querySelector('#main').textContent,/iPhone 6s/);
    assert.equal(document.querySelector('#coreChip').textContent,'CORE ONLINE');
    assert.ok(requests.some(r=>r.url.endsWith('/jobs')));
    document.querySelector('[data-nav="route"]').click();
    assert.match(document.querySelector('#main').textContent,/Today’s mobile route/);
    document.querySelector('[data-nav="customers"]').click();
    assert.match(document.querySelector('#main').textContent,/Catalogue test/);
    document.querySelector('[data-nav="jobs"]').click();
    document.querySelector('[data-open="IR-TEST-TECH"]').click();
    for(const selector of ['[data-status="repairing"]','[data-part="ordered"]',
      '[data-pay="paid"]','[data-observation]','[data-sendchat]','[data-contact]']){
      assert.ok(document.querySelector(selector),selector+' remains available');
    }
    assert.match(document.querySelector('#main').textContent,/Workflow at a glance/);
    assert.deepEqual(errors,[]);
    assert.ok(requests.every(r=>r.method==='GET'),'read-only verification must not write Core records');
  }finally{dom.window.close()}
});
