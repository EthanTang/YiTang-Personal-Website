import fs from 'node:fs';
import vm from 'node:vm';
import pathLib from 'node:path';
import assert from 'node:assert/strict';
// Exercise the real vendored getAsset action, not a duplicate implementation.
const bundle=fs.readFileSync(new URL('./static/admin/decap-cms.js',import.meta.url),'utf8');
const start=bundle.indexOf('function Wc({collection:e,entry:t,path:n,field:r})');
const end=bundle.indexOf('Hc.cache=new WeakMap',start);
assert.ok(start>0&&end>start,'Pinned Decap getAsset action must be identifiable');
const wrap=object=>({get:key=>object[key]});
const entry=files=>wrap({mediaFiles:{find:predicate=>files.map(wrap).find(predicate)}});
const context={Rc:state=>state.activeDraftFiles||[],aa:{join:pathLib.posix.join},oh:(_config,_collection,_entry,p)=>/^(?:[a-z]+:)?\/\/|^\//i.test(p)?p:pathLib.posix.join('site/static/assets/uploads',pathLib.posix.basename(p)),Ba:asset=>asset,$o:p=>/^(?:[a-z]+:)?\/\/|^\//i.test(p),zc:asset=>({asset}),qc:{url:'empty.svg'}};
vm.runInNewContext(bundle.slice(start,end),context);
const path='site/static/assets/uploads/jsr.png';
const state={config:{public_folder:'/assets/uploads',media_folder:'site/static/assets/uploads'},medias:{[path]:{asset:{url:'/assets/uploads/jsr.png'},error:Error('production 404')}}};
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
// Real editor binding must notify image controls when asynchronous assets arrive.
const bindingStart=bundle.indexOf('getBoundedAsset:Tu()');
const bindingEnd=bundle.indexOf('},tT=K',bindingStart);
assert.ok(bindingStart>0&&bindingEnd>bindingStart);
context.Tu=()=>fn=>{const memo=(key,...args)=>{if(!memo.cache.has(key))memo.cache.set(key,fn(key,...args));return memo.cache.get(key);};memo.cache=new Map();return memo;};
context.Rg={getState:()=>({...state,entryDraft:{get:()=>entry([])}}),dispatch:action=>action(()=>{},()=>state)};
const bind=vm.runInNewContext('('+bundle.slice(bindingStart+'getBoundedAsset:'.length,bindingEnd)+')',context);
const collection={};
state.activeDraftFiles=[];
state.medias={[path]:{isLoading:true}};
const pendingGetter=bind(collection)(state.medias);
assert.equal(pendingGetter('/assets/uploads/jsr.png').url,'empty.svg');
assert.equal(bind(collection)(state.medias),pendingGetter,'Unrelated renders keep getter stable');
state.medias={[path]:{asset:{url:'blob:actual-photo'}}};
const loadedGetter=bind(collection)(state.medias);
assert.notEqual(loadedGetter,pendingGetter,'Loaded assets must refresh the control effect');
assert.equal(loadedGetter('/assets/uploads/jsr.png').url,'blob:actual-photo');
const secondPath='site/static/assets/uploads/second.webp';
state.medias={...state.medias,[secondPath]:{asset:{url:'blob:second-photo'}}};
const galleryGetter=bind(collection)(state.medias);
assert.notEqual(galleryGetter,loadedGetter);
assert.equal(galleryGetter('/assets/uploads/jsr.png').url,'blob:actual-photo');
assert.equal(galleryGetter('/assets/uploads/second.webp').url,'blob:second-photo');
assert.notEqual(bind({})(state.medias),galleryGetter,'Collection bindings remain isolated');
assert.ok(bundle.includes('assetRevision:e.medias'));
assert.ok(bundle.includes('boundGetAsset:t.boundGetAsset(e.collection)(e.assetRevision)'));
console.log('Passed editor assets: fresh upload, reopened draft, failed/loading cache, replacement, entry switch, renamed address, spaced filename, and published assets.');
console.log('Passed control refresh: loading placeholder becomes the real photo, each gallery asset differs, and getter identity changes only with asset/collection state.');
