(function () {
  'use strict';
  const S=window.InkySlot;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeJSON=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  function gameHTML(project) {
    const p=S.Project.read(project),errors=S.Project.validate(p);if(errors.length)throw new Error(errors.join('\n'));
    let math='';
    if(p.settings.useMath){
      if(!S.mathSource)throw new Error('The local math renderer has not loaded. Reload the builder and try again.');
      const config={loader:{load:[]},tex:{inlineMath:[['$','$'],['\\(','\\)']],displayMath:[['$$','$$'],['\\[','\\]']],packages:['base','ams','newcommand','configmacros','noundefined','color','bbox','boldsymbol','verb']},options:{enableMenu:false},svg:{fontCache:'local'},startup:{typeset:false}};
      math='<script>window.MathJax='+safeJSON(config)+';<\/script><script>'+S.mathSource.replace(/<\/script/gi,'<\\/script')+'<\/script>';
    }
    return '<!doctype html>\n<html lang="'+p.settings.language+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHTML(p.settings.title)+'</title><style>'+S.gameStyles+'</style></head><body><div id="slot-game"></div>'+math+'<script type="application/json" id="game-data">'+safeJSON({project:p,art:S.toyArt,names:S.toyNames,fonts:S.Project.fonts,themes:S.Project.themes})+'</script><script>const data=JSON.parse(document.getElementById("game-data").textContent);('+S.runGame.toString()+')(data.project,data.art,data.names,data.fonts,data.themes);<\/script></body></html>';
  }
  function hostedURL(input) {
    let url;try{url=new URL(input.trim());}catch(_){throw new Error('Enter the public HTTPS URL of your uploaded game HTML.');}
    if(url.protocol!=='https:'||url.username||url.password||url.hostname==='localhost'||url.hostname==='127.0.0.1'||url.hostname==='[::1]')throw new Error('Use a public HTTPS game URL, not a local file or localhost address.');
    if(!/\.html$/i.test(url.pathname))throw new Error('Use the URL ending in .html for your uploaded playable game.');
    if(/\/builders\/(?:slot-machine|flying-quiz)\/index\.html$/i.test(url.pathname))throw new Error('That is a builder URL. Upload the downloaded game HTML and use its URL instead.');
    url.hash='';return url.href;
  }
  function iframeCode(url,title='Slot Machine') {return '<iframe title="'+escapeHTML(title)+'" src="'+escapeHTML(hostedURL(url))+'" style="display:block;width:100%;height:800px;border:0;background:transparent;" allow="autoplay; fullscreen" allowfullscreen></iframe>';}
  async function copy(text) {if(navigator.clipboard&&isSecureContext){try{await navigator.clipboard.writeText(text);return;}catch(_){}}
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px';document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy');}finally{area.remove();}if(!ok)throw new Error('Select the generated iframe code below and copy it manually.');
  }
  function download(text,type,name) {const blob=new Blob([text],{type});if(blob.size>256*1024*1024)throw new Error('This file exceeds 256 MB. Use smaller uploaded media.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function filename(title) {return title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'slot-machine';}
  async function load(file) {if(file.size>256*1024*1024)throw new Error('Project exceeds 256 MB.');let value;try{value=JSON.parse(await file.text());}catch(_){throw new Error('Choose a valid Slot Machine project JSON file.');}return S.Project.read(value);}
  S.Export={gameHTML,hostedURL,iframeCode,copy,download,filename,load};
})();
