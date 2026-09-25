(function () {
  'use strict';
  const S=window.InkySlot;
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  function button(text,fn,title){const b=make('button','',text);b.type='button';b.onclick=fn;if(title)b.setAttribute('aria-label',title);return b;}
  function field(label,value,fn,{type='text',min,max,step=1,options,maxLength=4000}={}){
    const wrap=make('label','field'),caption=make('span','',label),input=make(type==='textarea'?'textarea':type==='select'?'select':'input');
    if(type==='select'){for(const [v,t] of options){const option=make('option','',t);option.value=v;input.append(option);}}
    else if(type!=='textarea')input.type=type;
    if(type==='checkbox'){wrap.classList.add('check');input.checked=value;wrap.append(input,caption);}else{input.value=value??'';wrap.append(caption,input);}
    if(min!==undefined)input.min=min;if(max!==undefined)input.max=max;if(['number','range'].includes(type))input.step=step;input.maxLength=maxLength;
    if(type==='range')caption.textContent=label+': '+value;
    input.addEventListener('input',()=>{if(['range','number'].includes(type)&&!input.validity.valid)return;const v=type==='checkbox'?input.checked:['range','number'].includes(type)?(input.value===''?null:Number(input.value)):input.value;if(type==='range')caption.textContent=label+': '+v;fn(v);});
    return wrap;
  }
  S.Editor=function(getProject,changed,previewQuestion){
    let selectedToy=0;
    const questionRoot=document.getElementById('question-cards');
    function renderQuestions(openId){
      const p=getProject(),openIds=new Set([...questionRoot.querySelectorAll('.question-card[open]')].map(e=>e.dataset.id));
      questionRoot.replaceChildren();document.getElementById('question-count').textContent=p.questions.length+' / 9';document.getElementById('add-question').disabled=p.questions.length>=9;document.getElementById('import-questions').disabled=p.questions.length>=9;
      p.questions.forEach((q,i)=>{
        const card=make('details','question-card');card.dataset.id=q.id;card.open=q.id===openId||openIds.has(q.id)||(!openIds.size&&i===0);const summary=make('summary'),num=make('span','number-badge',String(i+1)),title=make('span','',q.prompt.trim().slice(0,52)||'New question');summary.append(num,title);card.append(summary);
        const body=make('div','card-body'),actions=make('div','card-actions');
        const up=button('↑',()=>{[p.questions[i-1],p.questions[i]]=[p.questions[i],p.questions[i-1]];changed();renderQuestions(q.id);},'Move question '+(i+1)+' up');up.disabled=i===0;
        const down=button('↓',()=>{[p.questions[i+1],p.questions[i]]=[p.questions[i],p.questions[i+1]];changed();renderQuestions(q.id);},'Move question '+(i+1)+' down');down.disabled=i===p.questions.length-1;
        const duplicate=button('Duplicate',()=>{if(p.questions.length>=9)return;const copy=JSON.parse(JSON.stringify(q));copy.id=S.Project.uid();p.questions.splice(i+1,0,copy);changed();renderQuestions(copy.id);});duplicate.disabled=p.questions.length>=9;
        actions.append(up,down,duplicate,button('Delete',()=>{p.questions.splice(i,1);changed();renderQuestions();}),button('Test question',()=>previewQuestion(i)));
        body.append(actions,field('Question type',q.type,v=>{q.type=v;changed();renderQuestions(q.id);},{type:'select',options:[['choice','Multiple Choice'],['text','Type the Answer']]}));
        body.append(field('Question text',q.prompt,v=>{q.prompt=v;title.textContent=v.trim().slice(0,52)||'New question';changed();},{type:'textarea'}));
        const label=make('p','answer-label',q.type==='choice'?'Answer options · check each acceptable answer':'Accepted answers · any one is correct');body.append(label);
        const list=q.type==='choice'?q.options:q.accepts;
        list.forEach((value,j)=>{
          const row=make('div','option-row');
          if(q.type==='choice'){const correct=make('input');correct.type='checkbox';correct.checked=q.correctIndices.includes(j);correct.setAttribute('aria-label','Option '+(j+1)+' is correct');correct.onchange=()=>{q.correctIndices=correct.checked?[...new Set([...q.correctIndices,j])]:q.correctIndices.filter(n=>n!==j);changed();};row.append(correct);}
          const input=make('input');input.type='text';input.value=value;input.maxLength=2000;input.setAttribute('aria-label',(q.type==='choice'?'Option ':'Accepted answer ')+(j+1)+' for question '+(i+1));input.oninput=()=>{list[j]=input.value;changed();};
          const remove=button('×',()=>{list.splice(j,1);if(q.type==='choice')q.correctIndices=q.correctIndices.filter(n=>n!==j).map(n=>n>j?n-1:n);changed();renderQuestions(q.id);},'Remove answer '+(j+1));remove.disabled=list.length<=(q.type==='choice'?2:1);row.append(input,remove);body.append(row);
        });
        const add=button('+ Answer',()=>{list.push('');changed();renderQuestions(q.id);});add.disabled=list.length>=12;body.append(add);
        if(q.type==='text')body.append(make('p','muted','Capitalization and leading/trailing spaces are ignored. Other spacing and punctuation must match.'));
        const extras=make('details','question-extras');extras.append(make('summary','','Images, audio, timer & text style'));
        const grid=make('div','field-grid');grid.append(field('Time limit (seconds, blank = off)',q.seconds,v=>{q.seconds=v;changed();},{type:'number',min:3,max:600}),field('Text size (px)',q.fontSize,v=>{if(v!==null){q.fontSize=v;changed();}},{type:'number',min:12,max:60}),field('Font',q.font,v=>{q.font=v;changed();},{type:'select',options:Object.entries(S.Project.fonts).map(([k])=>[k,k[0].toUpperCase()+k.slice(1)])}));extras.append(grid);
        extras.append(button('Apply this font, size & timer to all',()=>{p.questions.forEach(other=>{other.font=q.font;other.fontSize=q.fontSize;other.seconds=q.seconds;});changed();renderQuestions(q.id);S.notify('Text style and timer applied to all questions.');}));
        let mathTarget=null;body.addEventListener('focusin',e=>{if(e.target.matches('textarea,input[type=text]'))mathTarget=e.target;});
        const math=make('div','math-tools');for(const [name,code] of [['Fraction','$\\frac{a}{b}$'],['Square','$x^2$'],['Root','$\\sqrt{x}$'],['×','×'],['÷','÷'],['±','±'],['≤','≤'],['≥','≥'],['π','π']]){const b=button(name,()=>{const target=mathTarget||body.querySelector('textarea');const a=target.selectionStart??target.value.length,z=target.selectionEnd??a;target.setRangeText(code,a,z,'end');target.dispatchEvent(new Event('input',{bubbles:true}));target.focus();});b.onmousedown=e=>e.preventDefault();math.append(b);}extras.append(make('p','muted','Math helpers: enable “Render math formulas” in Game settings for $…$ expressions.'),math);
        extras.append(S.Media.control({label:'Question image',value:q.image,onChange:v=>{q.image=v;changed();}}),S.Media.control({label:'Question audio',kind:'audio',value:q.audio,onChange:v=>{q.audio=v;changed();}}));
        body.append(extras);card.append(body);questionRoot.append(card);
      });
    }
    function renderSettings(){const p=getProject(),s=p.settings,root=document.getElementById('settings-fields');root.replaceChildren();
      const entries=[['title','Game title','text'],['startText','Start button text','text'],['instruction','Instructions','textarea'],['finishText','Final message','textarea'],['language','Game language','select',[['en','English'],['ru','Русский'],['de','Deutsch'],['zh','中文']]],['theme','Machine style','select',Object.entries(S.Project.themes).map(([k,v])=>[k,v[0]])],['transparent','Transparent game background','checkbox'],['animations','Animations & confetti','checkbox'],['sounds','Built-in sound effects','checkbox'],['scratchpad','Scratch paper during questions','checkbox'],['useMath','Render math formulas ($…$)','checkbox']];
      for(const [key,label,type,options] of entries){const control=field(label,s[key],v=>{s[key]=v;changed();},{type,options,maxLength:6000});control.querySelector('input,textarea,select').id='setting-'+key;root.append(control);}
      root.append(make('p','muted','Math rendering is included locally and embedded in downloads when enabled. All machine styles use original Inky Paws artwork.'),S.Media.control({label:'Game background',value:s.background,onChange:v=>{s.background=v;changed();}}));
    }
    function updateToyCell(id){const p=getProject(),t=p.toys[id],cell=document.querySelector('.toy-cell[data-id="'+id+'"]');if(!cell)return;const image=cell.querySelector('img');image.src=t.src||S.toyArt[id];image.style.width=(62*t.scale)+'%';image.style.height=(62*t.scale)+'%';image.style.left=(50+t.offsetX)+'%';image.style.top=(50+t.offsetY)+'%';}
    function renderToyEditor(){const p=getProject(),id=selectedToy,t=p.toys[id],root=document.getElementById('toy-editor');root.replaceChildren();root.append(make('h3','','Toy '+(id+1)+' · '+S.toyNames[id]));
      const refresh=()=>{updateToyCell(id);changed();};
      root.append(S.Media.control({label:'Toy image',value:t.src,onChange:v=>{t.src=v;refresh();}}),field('Size (%)',Math.round(t.scale*100),v=>{t.scale=v/100;refresh();},{type:'range',min:45,max:155}),field('Horizontal position',t.offsetX,v=>{t.offsetX=v;refresh();},{type:'range',min:-20,max:20}),field('Vertical position',t.offsetY,v=>{t.offsetY=v;refresh();},{type:'range',min:-20,max:20}));
      const actions=make('div','toy-actions');const remove=button('Remove plain background',async()=>{const src=t.src;if(!src)return S.notify('Upload a custom toy image first.',true);remove.disabled=true;S.pendingMedia=(S.pendingMedia||0)+1;try{const result=await S.Media.removeBackground(src);if(getProject()===p&&p.toys[id]===t&&t.src===src){t.src=result;refresh();renderToyEditor();S.notify('Plain background removed.');}}catch(e){S.notify(e.message,true);}finally{remove.disabled=false;S.pendingMedia--;}});
      actions.append(button('Center',()=>{t.offsetX=t.offsetY=0;refresh();renderToyEditor();}),button('Reset this toy',()=>{p.toys[id]=S.Project.newToy();refresh();renderToyEditor();}),remove);root.append(actions,make('p','muted','Background removal works best with a single plain color touching the corners. PNG uploads preserve transparency.'));
    }
    function renderToys(){const p=getProject(),root=document.getElementById('toy-grid');root.replaceChildren();
      for(const id of [0,3,5,4,2,1,8,7,6]){const cell=button('',()=>selectToy(id));cell.className='toy-cell';cell.dataset.id=id;cell.setAttribute('aria-label','Customize toy '+(id+1)+' '+S.toyNames[id]);cell.classList.toggle('selected',id===selectedToy);const image=make('img');image.draggable=false;image.alt=S.toyNames[id];image.onerror=()=>{if(image.getAttribute('src')!==S.toyArt[id])image.src=S.toyArt[id];};cell.append(make('span','','#'+(id+1)),image);root.append(cell);updateToyCell(id);
        image.addEventListener('pointerdown',e=>{e.preventDefault();selectToy(id);const t=p.toys[id],rect=cell.getBoundingClientRect(),x=e.clientX,y=e.clientY,ox=t.offsetX,oy=t.offsetY;let moved=false;image.setPointerCapture(e.pointerId);
          const move=event=>{if(Math.hypot(event.clientX-x,event.clientY-y)<3&&!moved)return;moved=true;t.offsetX=Math.round(Math.max(-20,Math.min(20,ox+(event.clientX-x)/rect.width*100)));t.offsetY=Math.round(Math.max(-20,Math.min(20,oy+(event.clientY-y)/rect.height*100)));updateToyCell(id);};
          const stop=()=>{image.removeEventListener('pointermove',move);image.removeEventListener('pointerup',stop);image.removeEventListener('pointercancel',stop);if(moved){changed();renderToyEditor();}};image.addEventListener('pointermove',move);image.addEventListener('pointerup',stop);image.addEventListener('pointercancel',stop);
        });
      }renderToyEditor();
    }
    function selectToy(id){selectedToy=id;document.querySelectorAll('.toy-cell').forEach(c=>c.classList.toggle('selected',Number(c.dataset.id)===id));renderToyEditor();}
    return {render(){renderQuestions();renderSettings();renderToys();},renderQuestions,renderToys,add(){const p=getProject();if(p.questions.length>=9)return;const q=S.Project.newQuestion();p.questions.push(q);changed();renderQuestions(q.id);const card=[...questionRoot.children].find(e=>e.dataset.id===q.id);card?.querySelector('textarea')?.focus();}};
  };
})();
