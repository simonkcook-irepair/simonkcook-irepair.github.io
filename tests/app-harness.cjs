const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');

function loadApp(){
  const errors=[],requests=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,'core.html'),'utf8'),{
    url:'https://simonkcook-irepair.github.io/core.html',runScripts:'dangerously',
    pretendToBeVisual:true,virtualConsole,
    beforeParse(window){
      window.scrollTo=()=>{};
      window.HTMLElement.prototype.scrollIntoView=()=>{};
      window.confirm=()=>true;
      window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
      window.URL.createObjectURL=()=> 'blob:test-artwork';
      window.URL.revokeObjectURL=()=>{};
      window.fetch=async(url,options={})=>{
        requests.push({url:String(url),method:options.method||'GET',body:options.body});
        return {ok:true,status:200,json:async()=>({jobs:[]}),text:async()=>'{"jobs":[]}'};
      };
      window.navigator.clipboard={writeText:async()=>{}};
    }
  });
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const block=index.match(/const files=\[([\s\S]*?)\];/)[1];
  const modules=[...block.matchAll(/'([^']+\.js)[^']*'/g)].map(match=>match[1]);
  for(const name of modules){
    const script=dom.window.document.createElement('script');
    script.textContent=fs.readFileSync(path.join(root,name),'utf8')+'\n//# sourceURL='+name;
    dom.window.document.body.appendChild(script);
  }
  dom.window.eval('render()');
  const click=selector=>{
    const element=dom.window.document.querySelector(selector);
    if(!element) throw new Error('Missing control: '+selector);
    element.click();
  };
  const change=(selector,value)=>{
    const element=dom.window.document.querySelector(selector);
    if(!element) throw new Error('Missing field: '+selector);
    element.value=value;
    element.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  };
  const input=(selector,value)=>{
    const element=dom.window.document.querySelector(selector);
    if(!element) throw new Error('Missing input: '+selector);
    element.value=value;
    element.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  };
  const state=()=>JSON.parse(dom.window.eval('JSON.stringify({devices,basket,fault,variant,diagnostic,mode,stage,active})'));
  const flush=()=>new Promise(resolve=>setTimeout(resolve,20));
  return {dom,window:dom.window,document:dom.window.document,errors,requests,click,change,input,state,flush,close:()=>dom.window.close()};
}
module.exports={loadApp,root};
