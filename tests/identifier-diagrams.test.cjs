const test=require('node:test');
const assert=require('node:assert/strict');
const {loadApp}=require('./app-harness.cjs');

test('camera choice diagrams visibly distinguish diagonal, vertical, horizontal and triangular lenses',()=>{
 const a=loadApp();try{
  const card=v=>{const node=a.document.createElement('div');node.innerHTML=a.window.eval('id12Card("layout",'+JSON.stringify(v)+')');return node};
  const lenses=v=>[...card(v).querySelectorAll('.id12-lens')].map(n=>[Number(n.getAttribute('cx')),Number(n.getAttribute('cy'))]);
  const diagonal=lenses('dd');assert.equal(diagonal.length,2);assert.ok(diagonal[0][0]<diagonal[1][0]);assert.ok(diagonal[0][1]<diagonal[1][1]);
  for(const v of ['ds','dv','dn']){const points=lenses(v);assert.equal(points.length,2);assert.equal(points[0][0],points[1][0]);assert.notEqual(points[0][1],points[1][1])}
  const horizontal=lenses('dh');assert.equal(horizontal.length,2);assert.equal(horizontal[0][1],horizontal[1][1]);assert.notEqual(horizontal[0][0],horizontal[1][0]);
  for(const v of ['ts','tp']){const points=lenses(v);assert.equal(points.length,3);const [p,q,r]=points;assert.notEqual((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]),0)}
  for(const v of ['s','sp'])assert.equal(lenses(v).length,1);
  assert.match(card('dd').textContent,/One top-left, one bottom-right/);
  assert.ok(Number(card('dv').querySelector('rect').getAttribute('width'))>Number(card('dn').querySelector('rect').getAttribute('width')));
  assert.deepEqual(a.errors,[]);
 }finally{a.close()}
});

test('diagonal and vertical picture buttons keep their corresponding model-family routes',()=>{
 const a=loadApp();try{
  a.window.eval("mode='help';helpBrand='Apple iPhone';id12.screen='visual';id12.answers={port:'U',cameras:'2',foldable:'N'};render()");
  a.click('[data-id12-criterion="layout"][data-id12-value="dd"]');
  const diagonal=a.window.eval('id12Candidates()');assert.ok(diagonal.includes('iphone15'));assert.ok(diagonal.includes('iphone15plus'));assert.equal(diagonal.includes('iphone16'),false);
  a.window.eval("id12.answers={port:'U',cameras:'2',foldable:'N'};id12.order=[];id12.screen='visual';render()");
  a.click('[data-id12-criterion="layout"][data-id12-value="dn"]');
  const vertical=a.window.eval('id12Candidates()');assert.ok(vertical.includes('iphone16'));assert.equal(vertical.includes('iphone15'),false);
  assert.deepEqual(a.errors,[]);
 }finally{a.close()}
});
