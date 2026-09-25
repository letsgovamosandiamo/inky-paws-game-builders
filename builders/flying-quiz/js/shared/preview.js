(function () {
  'use strict';
  const IP=window.InkyPaws;
  IP.Preview=function Preview(getProject) {
    const frame=document.getElementById('preview-frame'), validation=document.getElementById('validation'), status=document.getElementById('preview-state'), embed=document.getElementById('embed-code');
    let timer=null, lastHTML='', pending=false;
    function render(){clearTimeout(timer);pending=false;const errors=IP.Project.validate(getProject());validation.replaceChildren();validation.hidden=!errors.length;
      if(errors.length){const strong=document.createElement('strong');strong.textContent='Finish these details to update the game:';const list=document.createElement('ul');errors.forEach(error=>{const li=document.createElement('li');li.textContent=error;list.append(li);});validation.append(strong,list);status.textContent='Showing the last playable version';embed.value='';for(const id of ['download-game','copy-embed','popout'])document.getElementById(id).disabled=true;return false;}
      for(const id of ['download-game','copy-embed','popout'])document.getElementById(id).disabled=false;
      lastHTML=IP.generateGameHtml(getProject());frame.srcdoc=lastHTML;embed.value=IP.Export.iframeCode(lastHTML);status.textContent='Up to date · edits restart the game';return true;
    }
    return {render,schedule(){pending=true;status.textContent='Updating…';clearTimeout(timer);timer=setTimeout(render,450);},html(){if(pending||!lastHTML){if(!render())throw new Error('Complete the question details before exporting.');}if(IP.Project.validate(getProject()).length)throw new Error('Complete the question details before exporting.');return lastHTML;},popout(){const html=this.html();const popup=window.open('','_blank','popup,width=1100,height=760,resizable=yes,scrollbars=yes');if(!popup)throw new Error('Allow pop-ups for this page to open the preview.');popup.opener=null;popup.document.open();popup.document.write(html);popup.document.close();popup.focus();},async fullscreen(){const shell=document.getElementById('preview-shell');if(!shell.requestFullscreen)throw new Error('Fullscreen is unavailable in this browser. Use Pop out instead.');await shell.requestFullscreen();}};
  };
})();
