(function () {
  'use strict';
  const IP=window.InkyPaws;
  let project=IP.Project.create(), dirty=false, toastTimer;
  IP.notify=function(message,error=false){const status=document.getElementById('status');clearTimeout(toastTimer);status.textContent=message;status.classList.toggle('error',error);status.hidden=false;toastTimer=setTimeout(()=>status.hidden=true,error?9000:4500);};
  const preview=IP.Preview(()=>project);
  function changed(){dirty=true;document.getElementById('project-state').textContent='Unsaved changes';preview.schedule();}
  const cards=IP.QuestionCards(document.getElementById('question-cards'),()=>project,changed), editor=IP.Editor(()=>project,changed);
  cards.render();editor.render();preview.render();
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(t=>{const active=t===b;t.classList.toggle('active',active);t.setAttribute('aria-pressed',String(active));document.getElementById('panel-'+t.dataset.tab).hidden=!active;});}));
  document.getElementById('add-question').addEventListener('click',cards.add);
  document.getElementById('save-project').addEventListener('click',()=>{IP.ProjectIO.save(project);dirty=false;document.getElementById('project-state').textContent='Project JSON downloaded';IP.notify('Project saved as JSON, including uploaded media.');});
  document.getElementById('load-project').addEventListener('click',()=>document.getElementById('project-file').click());
  document.getElementById('project-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const loaded=await IP.ProjectIO.load(file);if(dirty&&!window.confirm('Loading this project replaces your unsaved edits. Load it now?'))return;project=loaded;dirty=false;cards.render();editor.render();preview.render();document.getElementById('project-state').textContent='Loaded '+file.name;IP.notify('Project loaded.');}catch(error){IP.notify(error.message,true);}finally{e.target.value='';}});
  async function perform(fn){try{await fn();}catch(e){IP.notify(e.message||'This action could not be completed.',true);}}
  document.getElementById('download-game').addEventListener('click',()=>perform(()=>{preview.html();IP.Export.download(project);IP.notify('Game HTML downloaded. Open it in a browser to play.');}));
  document.getElementById('copy-embed').addEventListener('click',()=>perform(async()=>{const code=IP.Export.iframeCode(preview.html());document.getElementById('embed-code').value=code;await IP.Export.copy(code);IP.notify('Iframe embed code copied.');}));
  document.getElementById('popout').addEventListener('click',()=>perform(()=>preview.popout()));
  document.getElementById('fullscreen').addEventListener('click',()=>perform(()=>preview.fullscreen()));
  document.getElementById('restart-preview').addEventListener('click',()=>preview.render());
  document.getElementById('preview-size').addEventListener('change',e=>document.getElementById('preview-shell').classList.toggle('phone',e.target.value==='phone'));
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
})();
