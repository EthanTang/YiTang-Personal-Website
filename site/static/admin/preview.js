/* Decap supplies createClass and h for preview templates. */
CMS.registerPreviewStyle('/style.css');
CMS.registerPreviewStyle('/admin/preview.css');
// Saved draft uploads are on the editorial branch until the post is published.
// Decap sometimes looks for these files on the production branch instead.
function draftImageFallback(source,slug){
 if(!source?.startsWith('/assets/uploads/')||!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return null;
 const file=('site/static'+source).split('/').map(encodeURIComponent).join('/');
 return 'https://raw.githubusercontent.com/EthanTang/YiTang-Personal-Website/'+encodeURIComponent('cms/posts/'+slug)+'/'+file;
}
function recoverDraftImage(event){
 const image=event.target;if(image.tagName!=='IMG')return;
 const current=image.getAttribute('src'),slug=this.props.entry.getIn(['data','slug']);
 if(current?.startsWith('/assets/uploads/')&&image.dataset.draftSource!==current){
  image.dataset.draftSource=current;image.dataset.draftAttempts='0';
 }
 const fallback=draftImageFallback(image.dataset.draftSource,slug);
 if(!fallback||!(current===image.dataset.draftSource||current?.startsWith(fallback+'?')))return;
 const attempt=Number(image.dataset.draftAttempts||0);if(attempt>=3)return;
 image.dataset.draftAttempts=String(attempt+1);
 const refresh=()=>{if(image.isConnected)image.src=fallback+'?draft='+Date.now()+'-'+attempt;};
 // A newly committed upload may briefly return a cached 404 from the raw CDN.
 if(attempt===0)refresh();else setTimeout(refresh,attempt*1000);
}
function editorDraftSlug(hash){
 const match=String(hash||'').match(/^#\/collections\/posts\/entries\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:$|[/?])/);
 return match?match[1]:null;
}
function recoverEditorImage(event){
 const slug=editorDraftSlug(window.location.hash);if(!slug)return;
 recoverDraftImage.call({props:{entry:{getIn:()=>slug}}},event);
}
function refreshEditorImages(){
 document.querySelectorAll('img[src^="/assets/uploads/"]').forEach(image=>{
  if(image.complete&&!image.naturalWidth)recoverEditorImage({target:image});
 });
}
// Built-in image controls live outside the preview iframe. Cover cached failures
// as well as controls inserted when a collapsed gallery entry is expanded.
if(typeof document!=='undefined'){
 document.addEventListener('error',recoverEditorImage,true);
 new MutationObserver(refreshEditorImages).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 window.addEventListener('hashchange',refreshEditorImages);
 refreshEditorImages();
}
const PostPreview=createClass({recoverDraftImage,render(){const data=this.props.entry.get('data');const photos=data.get('photos')?.toJS()||[];const mode=data.get('thumbnail_mode');const inline=String(data.get('body')||'').match(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/);const thumb=mode==='none'?null:mode==='custom'&&data.get('thumbnail')?{image:data.get('thumbnail'),alt:data.get('thumbnail_alt')}:photos[0]||(inline?{image:inline[2],alt:inline[1]}:null);return h('main',{className:'cms-preview','data-font':'fontin',onError:this.recoverDraftImage},h('p',{className:'preview-section-label'},'Homepage preview'),h('article',{className:'note-entry'+(thumb?' has-photo':'')},h('div',{className:'entry-meta'},data.get('date_label')||data.get('date'),h('span',{className:'tag'},data.get('category'))),h('div',{className:'entry-content'},h('h3',{},data.get('title')),h('p',{},data.get('summary'))),thumb?h('div',{className:'entry-thumbnail'},h('img',{src:this.props.getAsset(thumb.image),alt:thumb.alt||''})):null),h('p',{className:'preview-section-label'},'Full post'),h('article',{className:'post-page'},h('h1',{},data.get('title')),h('div',{className:'post-body'},this.props.widgetFor('body'),photos.length?h('div',{className:'gallery post-gallery'+(photos.length===1?' single-photo':'')},...photos.map(p=>h('figure',{className:'post-photo',key:p.image},h('div',{className:'photo'},h('img',{src:this.props.getAsset(p.image),alt:p.alt||''})),p.caption?h('figcaption',{},p.caption):null))):null)));}});
CMS.registerPreviewTemplate('posts',PostPreview);
