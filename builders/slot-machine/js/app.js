(function () {
  'use strict';
  const S=window.InkySlot,$=id=>document.getElementById(id);
  let project=S.Project.create(),dirty=false,previewTimer=null,toastTimer=null,lastHTML='';
  S.notify=function(text,error=false){clearTimeout(toastTimer);$('status').textContent=text;$('status').classList.toggle('error',error);$('status').hidden=false;toastTimer=setTimeout(()=>$('status').hidden=true,error?9000:4500);};
  function mediaReady(){if(S.pendingMedia)throw new Error('Wait for the media upload to finish, then try again.');}
  function changed(){dirty=true;$('project-state').textContent='Unsaved changes';$('preview-state').textContent='Updating…';clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,450);}
  function renderPreview(){clearTimeout(previewTimer);const errors=S.Project.validate(project);$('validation').replaceChildren();$('validation').hidden=!errors.length;
    for(const id of ['download-game','popout'])$(id).disabled=!!errors.length;
    if(errors.length){const title=document.createElement('strong');title.textContent='Finish these details to update the game:';const list=document.createElement('ul');for(const error of errors){const item=document.createElement('li');item.textContent=error;list.append(item);}$('validation').append(title,list);$('preview-state').textContent='Showing the last playable version';return false;}
    lastHTML=S.Export.gameHTML(project);$('preview-frame').srcdoc=lastHTML;$('preview-state').textContent='Up to date · edits restart the game';return true;
  }
  function testQuestion(index){try{mediaReady();const p=JSON.parse(JSON.stringify(project));p.questions[0]=JSON.parse(JSON.stringify(p.questions[index]));const errors=S.Project.validate(p);if(errors.length)throw new Error('Complete all nine question cards before testing.');$('preview-frame').srcdoc=S.Export.gameHTML(p);$('preview-state').textContent='Testing question '+(index+1)+' first · reset for normal order';S.notify('Start the preview and grab a toy to test question '+(index+1)+'.');}catch(e){S.notify(e.message,true);}}
  const editor=S.Editor(()=>project,changed,testQuestion);editor.render();renderPreview();
  async function perform(fn){try{await fn();}catch(e){S.notify(e.message||'Could not complete that action.',true);}}
  function validHTML(){mediaReady();const errors=S.Project.validate(project);if(errors.length)throw new Error(errors.join('\n'));return S.Export.gameHTML(project);}
  document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(tab=>{const active=tab===button;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active));$('panel-'+tab.dataset.tab).hidden=!active;});});
  $('add-question').onclick=editor.add;
  $('clear-questions').onclick=()=>{if(!confirm('Remove all questions? Save your project first if you want to keep them.'))return;project.questions=[];changed();editor.renderQuestions();};
  $('reset-project').onclick=()=>{if(!confirm('Replace the current project with the example questions and default settings?'))return;project=S.Project.create();changed();editor.render();renderPreview();};
  $('reset-toys').onclick=()=>{if(!confirm('Reset all nine toy images, sizes, and positions?'))return;project.toys=Array.from({length:9},S.Project.newToy);changed();editor.renderToys();};
  $('import-questions').onclick=()=>{$('import-dialog').showModal();$('import-text').focus();};
  $('confirm-import').onclick=()=>perform(()=>{const incoming=S.Project.parseImport($('import-text').value);if(!incoming.length)throw new Error('Enter at least one question.');if(project.questions.length+incoming.length>9)throw new Error('There is room for '+(9-project.questions.length)+' more questions. Remove extra import lines or clear existing cards.');project.questions.push(...incoming);$('import-text').value='';$('import-dialog').close();changed();editor.renderQuestions();});
  $('save-project').onclick=()=>perform(()=>{mediaReady();S.Export.download(JSON.stringify(project,null,2),'application/json',S.Export.filename(project.settings.title)+'.slot.json');dirty=false;$('project-state').textContent='Project JSON downloaded';S.notify('Project saved with uploaded images and audio.');});
  $('load-project').onclick=()=>$('project-file').click();
  $('project-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;await perform(async()=>{mediaReady();const loaded=await S.Export.load(file);if(dirty&&!confirm('Loading this project replaces your unsaved changes. Continue?'))return;project=loaded;dirty=false;editor.render();renderPreview();$('project-state').textContent='Loaded '+file.name;S.notify('Slot Machine project loaded.');});e.target.value='';};
  $('download-game').onclick=()=>perform(()=>{const html=validHTML();S.Export.download(html,'text/html;charset=utf-8',S.Export.filename(project.settings.title)+'.game.html');S.notify('Standalone game downloaded, including uploaded media.');});
  $('copy-iframe').onclick=()=>perform(async()=>{const code=S.Export.iframeCode($('hosted-url').value,project.settings.title);$('embed-code').value=code;$('embed-details').open=true;await S.Export.copy(code);S.notify('Iframe copied. Its URL must point to your published game HTML.');});
  $('hosted-url').oninput=()=>{$('embed-code').value='';};
  $('restart-preview').onclick=renderPreview;
  $('preview-size').onchange=e=>$('preview-shell').classList.toggle('phone',e.target.value==='phone');
  $('popout').onclick=()=>perform(()=>{const html=validHTML(),popup=window.open('','_blank','popup,width=1050,height=850,resizable=yes,scrollbars=yes');if(!popup)throw new Error('Allow pop-ups to open the test game.');popup.opener=null;popup.document.open();popup.document.write(html);popup.document.close();});
  $('fullscreen').onclick=()=>perform(async()=>{if(!$('preview-shell').requestFullscreen)throw new Error('Use Pop out if your browser does not support fullscreen.');await $('preview-shell').requestFullscreen();});
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
})();
