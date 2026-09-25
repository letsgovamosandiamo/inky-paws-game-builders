(function () {
  'use strict';
  const IP=window.InkyPaws;
  IP.QuestionCards = function QuestionCards(container,getProject,changed) {
    function field(label,value,onInput,{multiline=false,correct=false,maxLength=2000}={}) {
      const wrap=document.createElement('label');wrap.className='field'+(correct?' correct-field':'');const text=document.createElement('span');text.textContent=label;
      const input=document.createElement(multiline?'textarea':'input');if(!multiline)input.type='text';input.value=value;input.maxLength=maxLength;input.addEventListener('input',()=>onInput(input.value));wrap.append(text,input);return wrap;
    }
    function action(label,title,fn,disabled=false) {const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;b.setAttribute('aria-label',title);b.disabled=disabled;b.addEventListener('click',fn);return b;}
    function rerender(focusId){render();if(focusId){const card=document.getElementById('card-'+focusId);if(card){card.querySelector('select').focus({preventScroll:true});card.scrollIntoView({block:'nearest',behavior:'instant'});}}}
    function render(){
      const p=getProject();container.replaceChildren();document.getElementById('question-count').textContent=p.questions.length;
      p.questions.forEach((q,index)=>{
        const card=document.createElement('article');card.className='question-card';card.id='card-'+q.id;card.setAttribute('aria-label','Question '+(index+1));
        const top=document.createElement('div');top.className='card-top';const title=document.createElement('span');title.className='card-number';const number=document.createElement('span');number.className='number-badge';number.textContent=index+1;title.append(number,document.createTextNode('Question'));const actions=document.createElement('div');actions.className='card-actions';
        actions.append(action('↑','Move question '+(index+1)+' up',()=>{[p.questions[index-1],p.questions[index]]=[p.questions[index],p.questions[index-1]];changed();rerender(q.id);},index===0),action('↓','Move question '+(index+1)+' down',()=>{[p.questions[index+1],p.questions[index]]=[p.questions[index],p.questions[index+1]];changed();rerender(q.id);},index===p.questions.length-1),action('Duplicate','Duplicate question '+(index+1),()=>{if(p.questions.length>=300)return IP.notify('Maximum 300 questions.',true);const copy={...q,id:IP.Project.id(),wrongs:[...q.wrongs]};p.questions.splice(index+1,0,copy);changed();rerender(copy.id);}),action('Delete','Delete question '+(index+1),()=>{p.questions.splice(index,1);changed();rerender(p.questions[Math.min(index,p.questions.length-1)]?.id);if(!p.questions.length)document.getElementById('add-question').focus();}));top.append(title,actions);card.append(top);
        const typeLabel=document.createElement('label');typeLabel.className='field';typeLabel.append(document.createTextNode('Question type'));const select=document.createElement('select');for(const [v,t] of [['choice','Multiple Choice'],['input','Type the Answer'],['order','Put Words in Order']]){const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o);}select.value=q.type;select.addEventListener('change',()=>{q.type=select.value;if(q.type==='choice'&&!q.wrongs.length)q.wrongs=['',''];changed();rerender(q.id);});typeLabel.append(select);card.append(typeLabel);
        card.append(field('Question text',q.text,v=>{q.text=v;changed();},{multiline:true,maxLength:4000}));
        card.append(field(q.type==='order'?'Sentence in the correct order':'Correct answer',q.correct,v=>{q.correct=v;changed();},{correct:true}));
        if(q.type==='choice'){
          const label=document.createElement('span');label.className='answer-label';label.textContent='Incorrect answers';card.append(label);
          q.wrongs.forEach((w,i)=>{const row=document.createElement('div');row.className='wrong-row';const input=document.createElement('input');input.type='text';input.value=w;input.maxLength=2000;input.setAttribute('aria-label','Incorrect answer '+(i+1)+' for question '+(index+1));input.addEventListener('input',()=>{q.wrongs[i]=input.value;changed();});row.append(input,action('×','Remove incorrect answer '+(i+1),()=>{q.wrongs.splice(i,1);changed();rerender(q.id);}));card.append(row);});
          const add=action('+ Incorrect answer','Add incorrect answer',()=>{q.wrongs.push('');changed();rerender(q.id);},q.wrongs.length>=8);add.className='small-button';card.append(add);
        }else{const hint=document.createElement('p');hint.className='muted';hint.textContent=q.type==='input'?'Answers ignore capitalization and extra spaces. Punctuation must match.':'Words are shuffled. Learners select words in order, then choose “Check order”. Repeated words are supported.';card.append(hint);}
        const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Optional question image'+(q.image?' · added':'');details.append(summary);details.append(IP.Assets.control({label:'Question image',value:q.image,maxMB:5,onChange:v=>{q.image=v;summary.textContent='Optional question image'+(v?' · added':'');changed();}}));card.append(details);container.append(card);
      });
    }
    return {render,add(){const p=getProject();if(p.questions.length>=300)return IP.notify('Maximum 300 questions.',true);const q=IP.Project.newQuestion();p.questions.push(q);changed();rerender(q.id);}};
  };
})();
