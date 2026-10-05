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
 const fallback=draftImageFallback(image.getAttribute('src'),this.props.entry.getIn(['data','slug']));
 if(fallback)image.src=fallback;
}
const PostPreview=createClass({recoverDraftImage,render(){const data=this.props.entry.get('data');const photos=data.get('photos')?.toJS()||[];const mode=data.get('thumbnail_mode');const inline=String(data.get('body')||'').match(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/);const thumb=mode==='none'?null:mode==='custom'&&data.get('thumbnail')?{image:data.get('thumbnail'),alt:data.get('thumbnail_alt')}:photos[0]||(inline?{image:inline[2],alt:inline[1]}:null);return h('main',{className:'cms-preview','data-font':'fontin',onError:this.recoverDraftImage},h('p',{className:'preview-section-label'},'Homepage preview'),h('article',{className:'note-entry'+(thumb?' has-photo':'')},h('div',{className:'entry-meta'},data.get('date_label')||data.get('date'),h('span',{className:'tag'},data.get('category'))),h('div',{className:'entry-content'},h('h3',{},data.get('title')),h('p',{},data.get('summary'))),thumb?h('div',{className:'entry-thumbnail'},h('img',{src:this.props.getAsset(thumb.image),alt:thumb.alt||''})):null),h('p',{className:'preview-section-label'},'Full post'),h('article',{className:'post-page'},h('h1',{},data.get('title')),h('div',{className:'post-body'},this.props.widgetFor('body'),...photos.map(p=>h('figure',{className:'post-photo'},h('img',{src:this.props.getAsset(p.image),alt:p.alt||''}),h('figcaption',{},p.caption))))));}});
CMS.registerPreviewTemplate('posts',PostPreview);
