(function () {
  'use strict';
  const S = window.InkySlot = {};
  const fonts = {system:'system-ui, sans-serif', rounded:'"Trebuchet MS", sans-serif', arial:'Arial, sans-serif', verdana:'Verdana, sans-serif', tahoma:'Tahoma, sans-serif', serif:'Georgia, serif', times:'"Times New Roman", serif', mono:'"Courier New", monospace', handwritten:'cursive'};
  const themes = {
    garden:['Garden','#507d6c','#e3edcf','#dfa74e'], neon:['Neon','#514773','#ebe2f3','#d476b1'], vintage:['Vintage','#85674d','#f5e6c7','#b77943'], retro:['Retro','#477a85','#dff1e5','#de9571'], magic:['Magic academy','#655783','#f0e7fb','#cba35c'], spooky:['Spooky school','#56596e','#eee5d8','#ca8356'], lab:['Science lab','#3e7f77','#e4f2dc','#b4a447'], space:['Space','#4c6084','#e1eafa','#bd9e55'], pirate:['Pirate treasure','#85644a','#f2e5cc','#ca9c46'], candy:['Candy shop','#ae7487','#fdebf0','#d6ab68'], carnival:['Carnival','#a3675b','#fff0d2','#dca848'], detective:['Detective','#576b68','#e7ece2','#b99258'], winter:['Winter','#63839a','#ebf5ff','#aea0c9'], school:['School','#6b8462','#f5f1d9','#d1a05d'], wood:['Woodland','#856c51','#ede8d7','#b49458']
  };
  const defaults = {title:'Slot Machine',instruction:'Insert a coin and move the claw. Grab a toy, then answer a question.\nA correct answer wins the toy—click it in the tray to collect it.\nA wrong answer drops it back. You have exactly 9 attempts!',finishText:'Thanks for playing. Try again to collect more toys!',startText:'Let’s play!',language:'en',theme:'garden',background:'',transparent:false,useMath:false,animations:true,sounds:true,scratchpad:true};
  const uid = () => 'q-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  const newQuestion = () => ({id:uid(),type:'choice',prompt:'',options:['',''],correctIndices:[0],accepts:[''],seconds:null,image:'',audio:'',font:'system',fontSize:26});
  const newToy = () => ({src:'',scale:1,offsetX:0,offsetY:0});
  function create() {
    const prompts = [
      ['Which animal says “meow”?',['Cat','Dog','Duck'],[0]],
      ['Type the missing word: The sun is in the ___.',['sky']],
      ['Which of these is a fruit?',['Apple','Carrot','Potato'],[0]],
      ['What is 3 + 4?',['7','seven']],
      ['Choose a word that means “happy”.',['Glad','Joyful','Sleepy'],[0,1]],
      ['What color do blue and yellow make?',['green']],
      ['Which shape has three sides?',['Triangle','Square','Circle'],[0]],
      ['Complete: One foot, two ___.',['feet']],
      ['Which season follows winter?',['Spring','Autumn','Summer'],[0]]
    ];
    return {schemaVersion:1,builderType:'slot-machine',settings:{...defaults},toys:Array.from({length:9},newToy),questions:prompts.map(([prompt,answers,correctIndices])=>({...newQuestion(),prompt,type:correctIndices?'choice':'text',...(correctIndices?{options:answers,correctIndices}:{accepts:answers})}))};
  }
  function media(value,kind) {
    if(typeof value!=='string') throw new Error('Media must be an uploaded file or web URL.');
    const v=value.trim(); if(!v) return '';
    const pattern=kind==='audio'?/^data:audio\/(?:mpeg|mp3|wav|x-wav|wave|ogg|webm|mp4|aac|flac|x-m4a);base64,[A-Za-z0-9+/=\s]+$/i:/^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon);base64,[A-Za-z0-9+/=\s]+$/i;
    if(pattern.test(v)) return v;
    try {const url=new URL(v); if(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password)return url.href;} catch(_) {}
    throw new Error('Use an http(s) URL or a supported uploaded '+kind+'.');
  }
  function text(v,label,max=4000) {if(typeof v!=='string'||v.length>max)throw new Error('Invalid '+label+'.');return v;}
  function number(v,min,max,label) {if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Invalid '+label+'.');return v;}
  function read(raw) {
    if(!raw||raw.builderType!=='slot-machine'||raw.schemaVersion!==1)throw new Error('Choose an Inky Paws Slot Machine project (version 1).');
    if(!raw.settings||!Array.isArray(raw.toys)||raw.toys.length!==9||!Array.isArray(raw.questions)||raw.questions.length>9)throw new Error('The project needs nine toy positions and at most nine questions.');
    const p={schemaVersion:1,builderType:'slot-machine',settings:{},toys:[],questions:[]};
    for(const [key,base] of Object.entries(defaults)) {
      const value=raw.settings[key]??base;
      if(typeof value!==typeof base)throw new Error('Invalid setting: '+key);
      p.settings[key]=typeof base==='string'?text(value,key,key==='background'?15*1024*1024:6000):value;
    }
    p.settings.background=media(p.settings.background,'image');
    if(!Object.hasOwn(themes,p.settings.theme)||!['en','ru','de','zh'].includes(p.settings.language))throw new Error('Unknown theme or language.');
    p.toys=raw.toys.map(t=>({src:media(t.src,'image'),scale:number(t.scale,.45,1.55,'toy size'),offsetX:number(t.offsetX,-20,20,'toy position'),offsetY:number(t.offsetY,-20,20,'toy position')}));
    const ids=new Set();
    p.questions=raw.questions.map((q,i)=>{
      if(!q||!['choice','text'].includes(q.type))throw new Error('Unknown question type at '+(i+1));
      const list=(v,label)=>{if(!Array.isArray(v)||v.length>12)throw new Error('Invalid '+label);return v.map(x=>text(x,label,2000));};
      const id=typeof q.id==='string'&&/^[\w-]{1,100}$/.test(q.id)&&!ids.has(q.id)?q.id:uid();ids.add(id);
      const out={id,type:q.type,prompt:text(q.prompt,'question'),options:list(q.options,'options'),correctIndices:[],accepts:list(q.accepts,'accepted answers'),seconds:q.seconds===null?null:number(q.seconds,3,600,'timer'),image:media(q.image,'image'),audio:media(q.audio,'audio'),font:q.font,fontSize:number(q.fontSize,12,60,'font size')};
      if(!Object.hasOwn(fonts,out.font)||!Array.isArray(q.correctIndices)||q.correctIndices.some(n=>!Number.isInteger(n)||n<0||n>=q.options.length))throw new Error('Invalid answer index or font in question '+(i+1));
      out.correctIndices=[...new Set(q.correctIndices)];return out;
    });
    return p;
  }
  const normalize = value => String(value).trim().toLowerCase();
  function validate(p) {
    const errors=[];try{read(p);}catch(e){errors.push(e.message);return errors;}
    if(p.questions.length!==9)errors.push('Add exactly 9 questions for the 9 attempts ('+p.questions.length+' of 9 ready).');
    p.questions.forEach((q,i)=>{
      const prefix='Question '+(i+1)+': ';
      if(!q.prompt.trim())errors.push(prefix+'enter a question.');
      if(q.type==='choice'){
        if(q.options.length<2||q.options.some(x=>!x.trim()))errors.push(prefix+'fill in at least two answer options.');
        if(!q.correctIndices.length)errors.push(prefix+'mark at least one correct option.');
        if(new Set(q.options.map(normalize)).size!==q.options.length)errors.push(prefix+'use distinct answer options.');
      }else if(!q.accepts.length||q.accepts.some(x=>!x.trim()))errors.push(prefix+'fill in each accepted answer.');
    });return errors;
  }
  function parseImport(source) {
    const lines=source.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    return lines.map((line,i)=>{
      const [prompt,...parts]=line.split('|').map(x=>x.trim());
      if(!prompt||!parts.length||parts.some(x=>!x))throw new Error('Import line '+(i+1)+': use Question | answer, or Question | *correct | other.');
      const q={...newQuestion(),prompt:prompt.replace(/^\s*\d+[.)]\s*/,'')};
      if(parts.length===1){q.type='text';q.accepts=parts[0].split('/').map(x=>x.trim()).filter(Boolean);}
      else{q.options=parts.map(x=>x.replace(/^(?:\*|[✅✔✓])\s*|\s*\*$/g,'').trim());q.correctIndices=parts.flatMap((x,j)=>/^\*|^[✅✔✓]|\*$/.test(x)?[j]:[]);if(!q.correctIndices.length)q.correctIndices=[0];}
      return q;
    });
  }
  S.Project={fonts,themes,defaults,create,read,validate,media,newQuestion,newToy,normalize,parseImport,uid};
})();
