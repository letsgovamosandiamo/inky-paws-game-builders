(function () {
  'use strict';
  const IP=window.InkyPaws;
  function iframeCode(html) {return '<iframe title="Flying quiz game" style="width:100%;height:720px;border:0;background:transparent;" srcdoc="'+IP.escapeHTML(html)+'" sandbox="allow-scripts" allow="autoplay; fullscreen" allowfullscreen></iframe>';}
  async function copy(text) {
    if(navigator.clipboard && window.isSecureContext){try{await navigator.clipboard.writeText(text);return;}catch(_){}}
    const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy');}finally{field.remove();}if(!copied)throw new Error('Copy is unavailable here. Select the code in “View iframe embed code” and copy it manually.');
  }
  IP.Export={iframeCode,copy,download(p){const html=IP.generateGameHtml(p);IP.ProjectIO.download(html,'text/html;charset=utf-8',IP.ProjectIO.filename(p.settings.title)+'.html');}};
})();
