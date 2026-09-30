const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const rules=require('../device-catalogue.js');
const data=require('../data/device-catalogue.json');
const prices=require('./fixtures/catalogue-prices-before.json');

test('every selectable identity has exact-model display/colour provenance and no prices in the facts catalogue',()=>{
  assert.deepEqual(data.manufacturerOrder,['Apple','Samsung','Google Pixel']);
  assert.equal(new Set(data.models.map(m=>m.id)).size,data.models.length);
  for(const model of data.models){
    assert.equal(model.identityStatus,'verified',model.id);
    assert.ok(['LCD','OLED'].includes(model.originalDisplay.technology),model.id);
    assert.ok(model.officialColours.length,model.id);
    assert.equal(new Set(model.officialColours).size,model.officialColours.length,model.id);
    for(const field of ['identity','display','colours']){
      assert.ok(model.provenance[field]?.length,model.id+' '+field);
    }
    for(const refs of Object.values(model.provenance)){
      for(const id of refs) assert.ok(data.sources[id]?.url,model.id+' '+id);
    }
    for(const option of model.repairs.screen.soldOptions){
      assert.ok(option.sourceIds.length,model.id);
      for(const id of option.sourceIds) assert.ok(data.sources[id]);
      assert.equal(Object.hasOwn(option,'price'),false,model.id);
    }
    assert.ok(model.unknowns.length,model.id+' records unresolved part/variant details');
  }
});

test('all existing named iPhones are covered without a family default',()=>{
  const expected=Object.keys(prices).filter(id=>id.startsWith('iphone')).concat('iphoneduo').sort();
  assert.deepEqual(rules.brandModels('Apple').map(m=>m.id).sort(),expected);
});

test('iPhone 6s offers exactly LCD, regardless of injected OLED pricing',()=>{
  assert.equal(rules.find('iphone6s').originalDisplay.technology,'LCD');
  const options=rules.screenOptions('iphone6s',{screen:{LCD:49,OLED:1}});
  assert.deepEqual(options.map(o=>o.label),['Screen replacement — LCD']);
  assert.equal(options[0].price,49);
  assert.equal(options[0].note.includes('OLED'),false);
  assert.equal(rules.faultAllowed('iphone6s','rear'),false);
});

test('XR and Pro finishes remain exact rather than a generic shared palette',()=>{
  assert.deepEqual(new Set(rules.find('iphonexr').officialColours),new Set(['Black','White','Blue','Yellow','Coral','(PRODUCT)RED']));
  assert.deepEqual(new Set(rules.find('iphone15pro').officialColours),new Set(['Black Titanium','White Titanium','Blue Titanium','Natural Titanium']));
  assert.equal(rules.find('iphone15pro').officialColours.includes('Red'),false);
});

test('an originally OLED model only offers separately evidenced sold parts and retained amounts',()=>{
  const options=rules.screenOptions('iphone13',prices.iphone13);
  assert.deepEqual(options.map(o=>o.technology),['LCD','OLED']);
  assert.deepEqual(options.map(o=>o.price),[99,149]);
  assert.equal(rules.screenOptions('iphoneduo',{screen:{LCD:99,OLED:199}})[0].assessment,true);
  for(const model of data.models){
    assert.equal(rules.screenOptions(model.id).some(o=>o.partType==='apple-original'),false);
  }
});

test('ProMotion is an original-device fact, never a replacement-part feature promise',()=>{
  assert.equal(rules.find('iphone13pro').originalDisplay.proMotion,true);
  assert.equal(rules.find('iphone13pro').originalDisplay.refreshRateMaxHz,120);
  assert.ok(rules.screenOptions('iphone13pro',prices.iphone13pro).every(o=>!o.note.includes('120')));
});

test('rear repair method differs between the iPhone 14 and 14 Pro manuals',()=>{
  assert.equal(rules.find('iphone14').rear.separatelyRepairable,true);
  assert.equal(rules.find('iphone14pro').rear.separatelyRepairable,null);
  assert.equal(rules.find('iphone14pro').rear.method,'specialist-glass-or-housing-assessment');
});

test('Samsung LTE/5G LCD models and AMOLED models retain distinct identities and finishes',()=>{
  assert.equal(rules.find('samsunga13lte').originalDisplay.technology,'LCD');
  assert.equal(rules.find('samsunga13fiveg').originalDisplay.marketingName,'PLS LCD');
  assert.equal(rules.find('samsungs23ultra').originalDisplay.marketingName,'Dynamic AMOLED 2X');
  assert.equal(rules.find('samsungs22').officialColours.includes('Bora Purple'),true);
  assert.equal(rules.find('samsungs22plus').officialColours.includes('Bora Purple'),false);
  assert.equal(rules.find('samsungs23').officialColours.includes('Red'),false);
  assert.equal(rules.find('samsungs23ultra').officialColours.includes('Red'),true);
  assert.equal(rules.screenOptions('samsungs23ultra',{screen:{LCD:10,OLED:20}})[0].assessment,true);
});

test('Google generations, official finishes, composite rear and source conflicts are explicit',()=>{
  assert.equal(rules.find('googlepixel').releaseYear,2016);
  assert.deepEqual(rules.find('googlepixel4a').officialColours,['Just Black','Barely Blue']);
  assert.ok(rules.find('googlepixel7a').officialColours.includes('Coral'));
  assert.equal(rules.find('googlepixel9a').rear.hasGlass,false);
  assert.equal(rules.faultAllowed('googlepixel9a','rear'),false);
  assert.equal(rules.find('googlepixel4').identifiersStatus,'source-conflict');
});

test('unknown devices and unconfirmed sold parts never inherit a part or a price',()=>{
  assert.equal(rules.faultAllowed('unknown','screen'),false);
  assert.equal(rules.faultAllowed('unknown','other'),true);
  const option=rules.repairOptions('unknown','other',{screen:{LCD:1,OLED:2},battery:3,rear:4})[0];
  assert.equal(option.price,null);
  assert.equal(option.partType,null);
  assert.equal(option.technology,null);
});

test('booking validation rejects invalid technologies, finishes, model changes and fold panels',()=>{
  const device={model:'iphonexr'};
  const invalid={fault:'rear',option:'Rear glass replacement',price:null,diagnostic:{colour:'Silver'}};
  assert.ok(rules.validateRepair(device,invalid,prices.iphonexr));
  assert.equal(rules.validateRepair(device,{...invalid,diagnostic:{colour:'Coral'}},prices.iphonexr),null);
  assert.ok(rules.validateRepair({model:'iphone6s'},{fault:'screen',option:'Screen replacement — OLED',price:null}));
  assert.ok(rules.validateRepair({model:'iphone6s'},{fault:'screen',model:'iPhone XR',option:'Screen replacement — LCD',price:null}));
  const fold={model:'googlepixel9profold'},repair={fault:'screen',option:'Screen assessment',price:null,diagnostic:{}};
  assert.ok(rules.validateRepair(fold,repair));
  assert.equal(rules.validateRepair(fold,{...repair,diagnostic:{panel:'inner'}}),null);
  assert.equal(rules.canCallOut(fold.model,'screen'),false);
});

test('the generated browser bundle is byte-for-data equivalent to the auditable JSON',()=>{
  const context={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/device-catalogue.js'),'utf8'),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.IRepairDeviceCatalogueData)),data);
});
