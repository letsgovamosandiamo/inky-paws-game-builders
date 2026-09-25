(function () {
  'use strict';
  const IP=window.InkyPaws;
  const groups=[
    ['Words & screens', [['title','Game title','text'],['startText','Start button text','text'],['winText','Victory text','text'],['loseText','Game-over text','text']]],
    ['Gameplay', [['lives','Number of lives','number'],['useTimer','Use a timer for each attempt','checkbox'],['timerSeconds','Seconds per attempt','number']]],
    ['Character & collectible', [['characterSize','Character width (%)','range'],['characterX','Character horizontal offset (vw)','range'],['characterY','Character vertical offset (vh)','range'],['collectibleSize','Collectible size (px)','range']]],
    ['Colors & fonts', [['font','Font','select'],['titleColor','Title color','color'],['buttonColor','Button color','color'],['buttonTextColor','Button text','color'],['backgroundColor','Background color','color'],['questionColor','Question text color','color'],['answerColor','Answer text color','color'],['questionFontSize','Question font size (px)','number'],['answerFontSize','Answer font size (px)','number']]],
    ['Panels & borders', [['questionBackground','Question panel','color'],['answerBackground','Answer panel','color'],['accentColor','Accent / border','color'],['borderWidth','Border width (px)','range'],['panelRadius','Panel corner radius (px)','range']]],
    ['Motion & effects', [['animations','Enable animations','checkbox'],['movingBackground','Moving / parallax background','checkbox'],['characterBob','Character floats while answering','checkbox'],['characterGlow','Character glow','checkbox'],['glowColor','Glow color','color'],['dayNight','Cycle between day and night','checkbox'],['transparentBackground','Transparent background for embedding','checkbox']]],
    ['Audio', [['soundEffects','Play sound effects','checkbox'],['musicVolume','Music volume (%)','range'],['effectsVolume','Effects volume (%)','range']]]
  ];
  IP.Editor = function Editor(getProject,changed) {
    function renderSettings(){const root=document.getElementById('settings-fields');root.replaceChildren();const s=getProject().settings;
      for(const [name,fields] of groups){const group=document.createElement('section');group.className='settings-group';const h=document.createElement('h3');h.textContent=name;group.append(h);const grid=document.createElement('div');grid.className='field-grid';
        for(const [key,label,type] of fields){const wrap=document.createElement('label');wrap.className='field'+(type==='checkbox'?' check':'');if(type==='checkbox'||type==='text')wrap.style.gridColumn='1 / -1';const caption=document.createElement('span');caption.textContent=label;const input=document.createElement(type==='select'?'select':'input');input.id='setting-'+key;
          if(type==='select'){for(const [v,t] of [['system','System sans serif'],['rounded','Trebuchet / rounded'],['serif','Georgia / serif'],['mono','Courier / monospace']]){const option=document.createElement('option');option.value=v;option.textContent=t;input.append(option);}}
          else input.type=type;
          if(type==='checkbox')input.checked=s[key];else input.value=s[key];
          if(type==='text')input.maxLength=1000;
          if(IP.Project.ranges[key]){const [min,max]=IP.Project.ranges[key];input.min=min;input.max=max;input.step=1;}
          if(type==='range')caption.textContent=label+': '+s[key];
          input.addEventListener('input',()=>{if(type==='number'&&!input.validity.valid)return;if(type==='number'&&input.value==='')return;s[key]=type==='checkbox'?input.checked:['range','number'].includes(type)?Number(input.value):input.value;if(type==='range')caption.textContent=label+': '+s[key];changed();});
          input.addEventListener('change',()=>{if(type==='number'&&(!input.validity.valid||input.value==='')){input.value=s[key];IP.notify('Use a number from '+input.min+' to '+input.max+'.',true);}});
          if(type==='checkbox')wrap.append(input,caption);else wrap.append(caption,input);grid.append(wrap);
        }group.append(grid);if(name==='Motion & effects'){const note=document.createElement('p');note.className='muted';note.textContent='Reduced-motion preferences are respected. Transparent backgrounds disable scenery movement.';group.append(note);}root.append(group);
      }
    }
    function renderAssets(){const root=document.getElementById('asset-fields');root.replaceChildren();const p=getProject();
      const labels={background:'Game background',character:'Flying character',collectible:'Collectible',life:'Life icon',avatar:'Question avatar (all questions)',overlay:'Overlay / effect image',victory:'Victory image',gameOver:'Game-over image',music:'Background music',correct:'Collectible / correct sound',wrong:'Wrong-answer sound',win:'Victory sound'};
      for(const key of [...IP.Project.imageKeys,...IP.Project.audioKeys])root.append(IP.Assets.control({label:labels[key],kind:IP.Project.audioKeys.includes(key)?'audio':'image',value:p.assets[key],maxMB:IP.Project.audioKeys.includes(key)?10:5,onChange:v=>{p.assets[key]=v;changed();}}));
      const note=document.createElement('p');note.className='muted';note.textContent='Without custom audio, effects use built-in tones. Background music is optional. An overlay is always visible unless day/night mode is enabled, when it appears at night.';root.append(note);
    }
    return {render(){renderSettings();renderAssets();}};
  };
})();
