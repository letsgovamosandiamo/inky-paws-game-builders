(function () {
  'use strict';
  const IP = window.InkyPaws = window.InkyPaws || {};
  const fonts = { system: 'system-ui, sans-serif', rounded: '"Trebuchet MS", sans-serif', serif: 'Georgia, serif', mono: '"Courier New", monospace' };
  const defaults = {
    title: 'A sky full of questions', startText: 'Let’s fly!', winText: 'You made it! Brilliant flying.', loseText: 'A little practice, another adventure.',
    lives: 3, useTimer: false, timerSeconds: 30, characterSize: 29, characterX: 0, characterY: 0, collectibleSize: 46,
    font: 'system', questionFontSize: 23, answerFontSize: 18, questionColor: '#233a3b', answerColor: '#233a3b',
    titleColor: '#234d47', buttonColor: '#296a5e', buttonTextColor: '#ffffff', backgroundColor: '#ddecdf',
    questionBackground: '#fffdf4', answerBackground: '#ffffff', accentColor: '#d39745', borderWidth: 2, panelRadius: 18,
    animations: true, movingBackground: true, characterBob: true, characterGlow: true, glowColor: '#fff0ad', dayNight: false,
    transparentBackground: false, soundEffects: true, musicVolume: 30, effectsVolume: 65
  };
  const ranges = { lives:[1,10], timerSeconds:[5,600], characterSize:[15,45], characterX:[-10,15], characterY:[-20,20], collectibleSize:[20,100], questionFontSize:[14,42], answerFontSize:[12,32], borderWidth:[0,6], panelRadius:[0,32], musicVolume:[0,100], effectsVolume:[0,100] };
  const imageKeys = ['background','character','collectible','life','avatar','overlay','victory','gameOver'];
  const audioKeys = ['music','correct','wrong','win'];
  let counter = 0;
  function id() { return 'q-' + Date.now().toString(36) + '-' + (++counter).toString(36) + '-' + Math.random().toString(36).slice(2,8); }
  function newQuestion(type = 'choice') { return { id:id(), type, text:'', correct:'', wrongs:type === 'choice' ? ['',''] : [], image:'' }; }
  function createProject() {
    return { schemaVersion:1, builderType:'flying-quiz', settings:{...defaults}, assets:Object.fromEntries([...imageKeys,...audioKeys].map(k=>[k,''])), questions:[
      {...newQuestion(),text:'Which word means the opposite of “tiny”?',correct:'Huge',wrongs:['Quiet','Slow','Soft']},
      {...newQuestion('input'),text:'Complete the sentence: Birds can ___.',correct:'fly'},
      {...newQuestion('order'),text:'Put these words in order.',correct:'The cat is in the sky'}
    ] };
  }
  function normalizeAnswer(value) { return String(value).normalize('NFKC').trim().replace(/\s+/gu,' ').toLocaleLowerCase('en'); }
  function mediaSource(value, kind) {
    if (typeof value !== 'string') throw new Error('Media sources must be text.');
    const v = value.trim();
    if (!v) return '';
    const imageData = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon);base64,[A-Za-z0-9+/=\s]+$/i;
    const audioData = /^data:audio\/(?:mpeg|mp3|wav|x-wav|wave|ogg|webm|mp4|aac|flac|x-m4a);base64,[A-Za-z0-9+/=\s]+$/i;
    if ((kind === 'audio' ? audioData : imageData).test(v)) return v;
    try { const url = new URL(v); if (['https:','http:'].includes(url.protocol) && !url.username && !url.password) return url.href; } catch (_) {}
    throw new Error('Use an http(s) URL or an uploaded ' + kind + '.');
  }
  function importProject(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schemaVersion !== 1 || raw.builderType !== 'flying-quiz') throw new Error('Choose an Inky Paws Flying Quiz project (version 1).');
    if (!raw.settings || !raw.assets || !Array.isArray(raw.questions)) throw new Error('This project is missing settings, assets, or questions.');
    if (raw.questions.length > 300) throw new Error('This version supports up to 300 questions.');
    const p = createProject();
    for (const [key, base] of Object.entries(defaults)) {
      const value = raw.settings[key] === undefined ? base : raw.settings[key];
      if (typeof value !== typeof base) throw new Error('Invalid setting: ' + key);
      if (typeof base === 'number' && (!Number.isFinite(value) || !Number.isInteger(value) || value < ranges[key][0] || value > ranges[key][1])) throw new Error('Out-of-range setting: ' + key);
      if (typeof base === 'string' && value.length > 1000) throw new Error('Setting text is too long: ' + key);
      if (/Color$|Background$/.test(key) && typeof base === 'string' && !/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Invalid color: ' + key);
      if (key === 'font' && !Object.hasOwn(fonts,value)) throw new Error('Unknown font.');
      p.settings[key] = value;
    }
    for (const key of [...imageKeys,...audioKeys]) p.assets[key] = mediaSource(raw.assets[key] ?? '', audioKeys.includes(key) ? 'audio' : 'image');
    const used = new Set();
    p.questions = raw.questions.map((q,i) => {
      if (!q || !['choice','input','order'].includes(q.type) || typeof q.text !== 'string' || typeof q.correct !== 'string' || !Array.isArray(q.wrongs)) throw new Error('Invalid question ' + (i+1) + '.');
      if (q.text.length > 4000 || q.correct.length > 2000 || q.wrongs.length > 8 || q.wrongs.some(w=>typeof w !== 'string' || w.length > 2000)) throw new Error('Question ' + (i+1) + ' exceeds the text or answer limits.');
      let qid = typeof q.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(q.id) && !used.has(q.id) ? q.id : id();
      used.add(qid);
      return {id:qid,type:q.type,text:q.text,correct:q.correct,wrongs:[...q.wrongs],image:mediaSource(q.image ?? '', 'image')};
    });
    return p;
  }
  function validate(p) {
    const errors = [];
    try { importProject(p); } catch(e) { errors.push(e.message); }
    if (!p.questions.length) errors.push('Add at least one question.');
    p.questions.forEach((q,i) => {
      const prefix = 'Question ' + (i+1) + ': ';
      if (!q.text.trim()) errors.push(prefix + 'add question text.');
      if (!q.correct.trim()) errors.push(prefix + 'add a correct answer.');
      if (q.type === 'choice') {
        if (!q.wrongs.length || q.wrongs.some(w=>!w.trim())) errors.push(prefix + 'fill in each incorrect answer (at least one).');
        const answers = [q.correct,...q.wrongs].map(normalizeAnswer);
        if (new Set(answers).size !== answers.length) errors.push(prefix + 'answer choices must be different.');
      }
      if (q.type === 'order' && q.correct.trim().split(/\s+/u).length < 2) errors.push(prefix + 'enter at least two words in the correct order.');
    });
    return errors;
  }
  IP.Project = {defaults,ranges,fonts,imageKeys,audioKeys,id,newQuestion,create:createProject,import:importProject,validate,mediaSource,normalizeAnswer};
})();
