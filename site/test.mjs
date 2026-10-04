import {build} from './build.mjs';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'yi-tang-site-')),content=path.join(tmp,'content'),output=path.join(tmp,'public');
fs.cpSync(path.join(root,'content'),content,{recursive:true});
const save=(name,value)=>fs.writeFileSync(path.join(content,name+'.json'),JSON.stringify(value));
const read=name=>fs.readFileSync(path.join(output,name),'utf8');
try{
 build({contentRoot:content,output});
 assert.equal((read('index.html').match(/note-entry/g)||[]).length,4);
 assert.ok(read('index.html').includes('Usually a clarinet or a cat nearby.'));
 assert.ok(!read('index.html').includes('Local prototype'));
 assert.ok(read('research.html').indexOf('De-Sludging')<read('research.html').indexOf('Wastewater'));
 assert.ok(read('research.html').includes('(PhD student, UMN)'));
 const post={title:'Editing test',slug:'editing-test',date:'2099-01-01',category:'Personal',summary:'A new note',body:'A [hyperlink](https://www.odu.edu/).\n\n![Inline photo](/assets/headshot.jpg)',photos:[],thumbnail_mode:'auto',published:true};
 save('posts/editing-test',post);build({contentRoot:content,output});
 assert.ok(read('index.html').includes('editing-test.html'));assert.ok(read('posts/editing-test.html').includes('href="https://www.odu.edu/"'));assert.ok(read('index.html').includes('alt="Inline photo"'));
 post.title='Edited title';post.thumbnail_mode='custom';post.thumbnail='/assets/music-3.webp';post.thumbnail_alt='Custom thumbnail';save('posts/editing-test',post);build({contentRoot:content,output});assert.ok(read('index.html').includes('Edited title'));assert.ok(read('index.html').includes('alt="Custom thumbnail"'));
 post.thumbnail_mode='none';save('posts/editing-test',post);build({contentRoot:content,output});assert.ok(!read('index.html').includes('alt="Custom thumbnail"'));
 post.published=false;save('posts/editing-test',post);build({contentRoot:content,output});assert.ok(!read('index.html').includes('Edited title'));assert.ok(!fs.existsSync(path.join(output,'posts/editing-test.html')));
 fs.unlinkSync(path.join(content,'posts/editing-test.json'));build({contentRoot:content,output});assert.ok(!fs.existsSync(path.join(output,'posts/editing-test.html')));
 const profile=JSON.parse(fs.readFileSync(path.join(content,'profile.json')));profile.headshot='/assets/music-3.webp';profile.font='libertinus';save('profile',profile);build({contentRoot:content,output});assert.ok(read('index.html').includes('data-font="libertinus"'));assert.ok(read('index.html').includes('src="/assets/music-3.webp"'));
 // Every local generated link and image must resolve, including nested post routes.
 function check(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())check(file);else if(e.name.endsWith('.html')){for(const m of fs.readFileSync(file,'utf8').matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1].split('#')[0];if(/^(https?:|mailto:)/.test(ref))continue;const target=ref.startsWith('/')?path.join(output,ref):path.resolve(path.dirname(file),ref);assert.ok(fs.existsSync(target),'Missing local target '+ref+' in '+e.name);}}}}check(output);
 const config=JSON.parse(read('admin/config.yml'));assert.equal(config.backend.branch,'main');assert.ok(!config.local_backend);
 build({contentRoot:content,output,branch:'website-redesign',local:true});assert.ok(JSON.parse(read('admin/config.yml')).local_backend);assert.equal(JSON.parse(read('admin/config.yml')).backend.branch,'website-redesign');
 console.log('Passed: create, edit, delete, unpublish, inline links/photos, thumbnail modes, profile/font changes, paper order, local references, and production/local editor configuration.');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
