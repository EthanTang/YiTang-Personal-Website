import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./static/analytics.js',import.meta.url),'utf8');
function run(hostname,pathname,code='test-account'){
 const appended=[];
 const context={location:{hostname,pathname},window:{},document:{currentScript:{dataset:{siteHost:'yitang.info',goatcounterCode:code}},createElement:()=>({dataset:{}}),head:{appendChild:element=>appended.push(element)}}};
 vm.runInNewContext(source,context);
 return {context,appended};
}
for(const host of ['localhost','127.0.0.1','deploy-preview-6--yitang.netlify.app','yitang.netlify.app'])assert.equal(run(host,'/').appended.length,0);
for(const route of ['/admin','/admin/','/admin/index.html'])assert.equal(run('yitang.info',route).appended.length,0);
assert.equal(run('yitang.info','/','bad/account').appended.length,0);
for(const [route,expected] of [['/','/'],['/index.html','/'],['/research.html','/research'],['/research','/research'],['/posts/concert.html','/posts/concert']]){
 const {context,appended}=run('yitang.info',route);
 assert.equal(appended.length,1);
 assert.equal(appended[0].src,'https://gc.zgo.at/count.js');
 assert.equal(appended[0].dataset.goatcounter,'https://test-account.goatcounter.com/count');
 assert.equal(context.window.goatcounter.path(),expected);
}
console.log('Passed analytics: live host only, editor/preview exclusion, endpoint validation, and consistent page paths.');
