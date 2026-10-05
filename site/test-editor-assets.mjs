import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
// Exercise the real vendored getAsset action, not a duplicate implementation.
const bundle=fs.readFileSync(new URL('./static/admin/decap-cms.js',import.meta.url),'utf8');
const start=bundle.indexOf('function Wc({collection:e,entry:t,path:n,field:r})');
const end=bundle.indexOf('Hc.cache=new WeakMap',start);
assert.ok(start>0&&end>start,'Pinned Decap getAsset action must be identifiable');
const wrap=object=>({get:key=>object[key]});
const entry=files=>wrap({mediaFiles:{find:predicate=>files.map(wrap).find(predicate)}});
const context={Rc:state=>state.activeDraftFiles||[],oh:(_config,_collection,_entry,p)=>p.replace('/assets/uploads/','site/static/assets/uploads/'),Ba:asset=>asset,$o:p=>/^https?:/.test(p),zc:asset=>({asset}),qc:{url:'empty.svg'}};
vm.runInNewContext(bundle.slice(start,end),context);
const path='site/static/assets/uploads/jsr.png';
const state={config:{},medias:{[path]:{asset:{url:'/assets/uploads/jsr.png'},error:Error('production 404')}}};
const resolve=(files,source='/assets/uploads/jsr.png')=>{state.activeDraftFiles=files;return context.Wc({entry:entry([]),path:source})(()=>{},()=>state);};
// Even when the bound entry snapshot has no media, the active draft wins over an earlier cached production failure.
assert.equal(resolve([{path,draft:true,displayURL:'blob:saved-draft',file:{name:'jsr.png'}}]).url,'blob:saved-draft');
// Fresh uploads still use the local object URL before any save/deployment.
assert.equal(resolve([{path,draft:true,url:'blob:new-upload'}]).url,'blob:new-upload');
// A concurrent production request cannot replace the draft's authoritative file.
state.medias[path]={isLoading:true};
assert.equal(resolve([{path,draft:true,displayURL:'blob:saved-draft'}]).url,'blob:saved-draft');
// Same filename in another entry/replacement must not reuse the previous cache.
assert.equal(resolve([{path,draft:true,displayURL:'blob:replacement'}]).url,'blob:replacement');
// Renaming the public post address does not participate in asset resolution.
assert.equal(resolve([{path,draft:true,displayURL:'blob:renamed-entry'}]).url,'blob:renamed-entry');
const spaced='site/static/assets/uploads/concert photo.webp';
assert.equal(resolve([{path:spaced,draft:true,url:'blob:space'}],'/assets/uploads/concert photo.webp').url,'blob:space');
// Published/shared assets retain the stock cache/backend behavior.
state.medias[path]={asset:{url:'blob:published'}};
assert.equal(resolve([]).url,'blob:published');
assert.equal(resolve([{path,draft:false,url:'blob:other'}]).url,'blob:published');
state.medias[path]={isLoading:true};
assert.equal(resolve([]).url,'empty.svg');
assert.equal(resolve([{path:'another/file',draft:true,url:'blob:other'}]).url,'empty.svg');
assert.equal(resolve([],null).url,'empty.svg');
console.log('Passed editor assets: fresh upload, reopened draft, failed/loading cache, replacement, entry switch, renamed address, spaced filename, and published assets.');
