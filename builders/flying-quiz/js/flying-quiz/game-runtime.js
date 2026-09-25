(function () {
  'use strict';
  // This function is serialized into exports. Keep it independent of builder code.
  window.InkyPaws.runGame = function runGame(project) {
    'use strict';
    const s = project.settings, assets = project.assets, tasks = project.questions;
    const game = document.getElementById('game');
    const fonts = {system:'system-ui, sans-serif',rounded:'"Trebuchet MS", sans-serif',serif:'Georgia, serif',mono:'"Courier New", monospace'};
    const variables = {'font':fonts[s.font],'background':s.backgroundColor,'question-color':s.questionColor,'answer-color':s.answerColor,'title-color':s.titleColor,'button-bg':s.buttonColor,'button-text':s.buttonTextColor,'question-bg':s.questionBackground,'answer-bg':s.answerBackground,'accent':s.accentColor,'border-width':s.borderWidth+'px','radius':s.panelRadius+'px','question-font':s.questionFontSize+'px','answer-font':s.answerFontSize+'px','character-size':s.characterSize+'%','character-x':s.characterX+'vw','character-y':s.characterY+'vh','coin-size':s.collectibleSize+'px','glow':s.glowColor};
    for (const [key,value] of Object.entries(variables)) game.style.setProperty('--'+key,value);
    const reduced = !s.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    game.classList.toggle('reduced-motion',reduced); game.classList.toggle('transparent',s.transparentBackground);
    let state = 'start', index = 0, lives = s.lives, coins = 0, muted = false, timeLeft = s.timerSeconds, deadline = 0, timer = null;
    const scheduled = new Set();
    const cat = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 190"><ellipse cx="132" cy="156" rx="100" ry="14" fill="#315f57" opacity=".12"/><path d="M30 135 Q128 165 235 124 L214 149 Q126 184 42 153Z" fill="#d99748"/><path d="M39 135 Q130 155 229 125" fill="none" stroke="#fff1bd" stroke-width="7"/><path d="M182 118 Q229 102 210 71" fill="none" stroke="#536e69" stroke-width="14" stroke-linecap="round"/><ellipse cx="132" cy="113" rx="55" ry="34" fill="#536e69"/><path d="M72 63 L68 19 L101 43 Q121 36 140 45 L170 22 L166 70 Q185 125 122 128 Q58 126 72 63" fill="#536e69"/><path d="M77 32 L81 59 L96 47Z M158 36 L144 49 L159 60Z" fill="#e5b99f"/><ellipse cx="105" cy="81" rx="7" ry="10" fill="#fff7d7"/><ellipse cx="146" cy="81" rx="7" ry="10" fill="#fff7d7"/><circle cx="107" cy="82" r="4" fill="#263f3a"/><circle cx="144" cy="82" r="4" fill="#263f3a"/><path d="M119 96 L131 96 L125 102Z" fill="#f0beaf"/><path d="M125 102 Q117 114 110 105 M125 102 Q132 114 140 105" stroke="#263f3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M71 91 L48 85 M71 101 L47 104 M175 91 L197 85 M175 101 L198 105" stroke="#536e69" stroke-width="3" stroke-linecap="round"/><path d="M160 119 L182 129 L171 142 L149 127Z" fill="#edcf7a"/></svg>');
    function el(tag,cls,text) { const node=document.createElement(tag); if(cls) node.className=cls; if(text !== undefined) node.textContent=text; return node; }
    function button(text,cls,handler) { const b=el('button',cls,text); b.type='button'; if(handler) b.addEventListener('click',handler); return b; }
    function image(src,cls,alt,fallback) { const img=el('img',cls); img.alt=alt || ''; if(src) img.src=src; img.addEventListener('error',()=>{if(fallback && img.getAttribute('src')!==fallback) img.src=fallback; else img.hidden=true;}); return img; }
    function delay(fn,ms) { const id=setTimeout(()=>{scheduled.delete(id); fn();},ms); scheduled.add(id); return id; }
    function clearTimer() { clearInterval(timer); timer=null; }
    function cleanup() { clearTimer(); for(const id of scheduled) clearTimeout(id); scheduled.clear(); }
    function normalize(v) { return String(v).normalize('NFKC').trim().replace(/\s+/gu,' ').toLocaleLowerCase('en'); }
    function shuffle(array) { const result=[...array]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]];} return result; }

    const scenery=el('div','scenery'), landscape=el('div','landscape'), clouds=el('div','clouds'), night=el('div','night'), stars=el('div','night-stars');
    // JSON quoting produces a valid CSS string even when URLs contain quotes.
    if(assets.background) { const probe=new Image(); probe.onload=()=>{landscape.style.backgroundImage='url('+JSON.stringify(assets.background)+')';landscape.classList.add('custom');}; probe.src=assets.background; }
    else landscape.style.background='linear-gradient(180deg, '+s.backgroundColor+', #f5f0d8)';
    scenery.append(landscape,clouds,night,stars);
    let overlay=null; if(assets.overlay){overlay=image(assets.overlay,'effect','');scenery.append(overlay);}
    game.append(scenery);

    const hud=el('header','hud'), left=el('div','hud-left'), right=el('div','hud-right');
    const livesBox=el('div','lives'), coinBox=el('div','chip'), coinText=el('span','','0'), questionCounter=el('div','chip','Ready'), timerBox=el('div','chip');
    livesBox.setAttribute('aria-label',lives+' lives remaining');
    function collectibleIcon(cls) { if(assets.collectible){ const wrap=el('span',cls); const img=image(assets.collectible,'','',null);img.style.cssText='width:100%;height:100%;object-fit:contain';img.addEventListener('error',()=>{wrap.textContent='★';});wrap.append(img);return wrap;}return el('span',cls,'★'); }
    coinBox.id='coin-counter';coinBox.append(collectibleIcon('coin-small'),coinText);coinBox.setAttribute('aria-label','0 stars collected');
    timerBox.id='timer';timerBox.hidden=!s.useTimer;
    const mute=button('Sound on','',()=>{muted=!muted;mute.textContent=muted?'Sound off':'Sound on';mute.setAttribute('aria-pressed',String(muted));if(muted) stopAudio();else if(state==='question'||state==='flight'||state==='feedback') playMusic();}); mute.setAttribute('aria-label','Toggle sound');mute.setAttribute('aria-pressed','false');
    const restart=button('Restart','',start); restart.hidden=true;
    left.append(livesBox,coinBox);right.append(questionCounter,timerBox,mute,restart);hud.append(left,right);game.append(hud);
    const screen=el('section','screen');screen.id='screen';
    const playArea=el('main','play-area');playArea.hidden=true;
    const characterSpace=el('div','character-space'), characterPosition=el('div','character-position'), character=image(assets.character||cat,'character','Flying character',cat), collectible=collectibleIcon('collectible');
    characterSpace.classList.toggle('bob',s.characterBob);characterSpace.classList.toggle('glow',s.characterGlow);characterPosition.append(character,collectible);characterSpace.append(characterPosition);
    const quiz=el('section','quiz');quiz.id='quiz';
    const panel=el('div','question-panel'), questionText=el('h1');questionText.id='question-text';questionText.tabIndex=-1;
    if(assets.avatar) panel.append(image(assets.avatar,'avatar',''));
    const questionImage=image('','question-image','Question illustration');questionImage.hidden=true;panel.append(questionImage,questionText);
    const answers=el('div','answers');answers.id='answers';
    const feedback=el('div','feedback');feedback.id='feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    quiz.append(panel,answers,feedback);
    const flightMessage=el('p','flight-message','Off we go!');flightMessage.setAttribute('role','status');
    playArea.append(characterSpace,quiz,flightMessage);game.append(screen,playArea);

    let audioContext=null;
    const activeTones=new Set();
    const sounds={};
    for(const key of ['music','correct','wrong','win']) if(assets[key]) {const a=new Audio(assets[key]);a.preload='none';a.volume=(key==='music'?s.musicVolume:s.effectsVolume)/100;a.loop=key==='music';sounds[key]=a;}
    function unlockAudio(){try{if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});}catch(_){}}
    function tone(kind){
      if(!audioContext||muted||!s.soundEffects||s.effectsVolume===0)return;
      const notes=kind==='wrong'?[190,135]:kind==='win'?[523,659,784,1046]:[659,880];
      notes.forEach((frequency,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+i*.12;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12*s.effectsVolume/100,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.2);osc.connect(gain);gain.connect(audioContext.destination);activeTones.add(osc);osc.onended=()=>{activeTones.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.22);});
    }
    function sound(key){if(muted||!s.soundEffects)return;const a=sounds[key];if(a){a.currentTime=0;a.play().catch(()=>tone(key));}else tone(key);}
    function playMusic(){if(!muted&&sounds.music)sounds.music.play().catch(()=>{});}
    function stopAudio(){Object.values(sounds).forEach(a=>a.pause());activeTones.forEach(o=>{try{o.stop();}catch(_){}});activeTones.clear();}
    function updateLives(){livesBox.replaceChildren();for(let i=0;i<s.lives;i++){let icon;if(assets.life){icon=image(assets.life,'life','');icon.addEventListener('error',()=>{const fallback=el('span','life'+(i>=lives?' lost':''),'♥');icon.replaceWith(fallback);});}else icon=el('span','life','♥');icon.classList.toggle('lost',i>=lives);livesBox.append(icon);}livesBox.setAttribute('aria-label',lives+' lives remaining');}
    function updateCoins(){coinText.textContent=String(coins);coinBox.setAttribute('aria-label',coins+' stars collected');coinBox.classList.remove('coin-pop');void coinBox.offsetWidth;coinBox.classList.add('coin-pop');}
    function updateEnvironment(){const dark=s.dayNight&&index%4>=2;night.classList.toggle('on',dark);stars.classList.toggle('on',dark&&!assets.overlay);if(overlay)overlay.classList.toggle('on',s.dayNight?dark:true);}
    function timerDisplay(){timerBox.textContent=Math.floor(timeLeft/60).toString().padStart(2,'0')+':'+(timeLeft%60).toString().padStart(2,'0');timerBox.classList.toggle('urgent',timeLeft<=5);timerBox.setAttribute('aria-label',timeLeft+' seconds remaining');}
    function beginTimer(){clearTimer();timeLeft=s.timerSeconds;timerDisplay();if(!s.useTimer)return;deadline=Date.now()+s.timerSeconds*1000;timer=setInterval(()=>{if(state!=='question')return;timeLeft=Math.max(0,Math.ceil((deadline-Date.now())/1000));timerDisplay();if(timeLeft<=0)wrong(null,true);},150);}
    function expired(){if(s.useTimer&&Date.now()>=deadline){wrong(null,true);return true;}return false;}
    function lockAnswers(locked){answers.querySelectorAll('button,input').forEach(n=>n.disabled=locked);}
    function start(){cleanup();stopAudio();Object.values(sounds).forEach(a=>{a.currentTime=0;});unlockAudio();index=0;lives=s.lives;coins=0;state='flight';updateLives();updateCoins();timeLeft=s.timerSeconds;timerDisplay();updateEnvironment();characterSpace.classList.remove('falling','hurt','celebrate','collecting','flying');screen.hidden=true;playArea.hidden=false;restart.hidden=false;playMusic();fly(true);}
    function fly(first=false){state='flight';clearTimer();quiz.hidden=true;flightMessage.hidden=false;flightMessage.textContent=first?'Off we go!':index>=tasks.length?'One last star…':'On to the next question!';updateEnvironment();game.classList.remove('travelling');characterSpace.classList.remove('flying','collecting');void game.offsetWidth;if(s.movingBackground&&!s.transparentBackground&&!reduced)game.classList.add('travelling');characterSpace.classList.add('flying');if(!first){characterSpace.classList.add('collecting');delay(()=>{coins++;updateCoins();sound('correct');characterSpace.classList.add('celebrate');},reduced?60:1200);}delay(()=>{game.classList.remove('travelling');characterSpace.classList.remove('flying','collecting','celebrate');if(index>=tasks.length)finish(true);else showQuestion();},reduced?180:2000);}
    let resetAttempt=()=>{};
    function showQuestion(){
      state='question';flightMessage.hidden=true;quiz.hidden=false;answers.replaceChildren();feedback.textContent='';const task=tasks[index];questionText.textContent=task.text;questionCounter.textContent=(index+1)+' / '+tasks.length;
      questionImage.hidden=!task.image;if(task.image)questionImage.src=task.image;else questionImage.removeAttribute('src');
      resetAttempt=()=>{};
      if(task.type==='choice'){
        shuffle([{text:task.correct,correct:true},...task.wrongs.map(text=>({text,correct:false}))]).forEach(option=>{let b=button(option.text,'answer',()=>submit(b,option.correct));answers.append(b);});
      }else if(task.type==='input'){
        const form=el('form','typed'), input=el('input'), submitButton=button('Check answer','submit');input.type='text';input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label','Your answer');input.placeholder='Type your answer…';submitButton.type='submit';form.append(input,submitButton);answers.append(form);
        form.addEventListener('submit',e=>{e.preventDefault();if(state!=='question')return;if(expired())return;if(!input.value.trim()){feedback.textContent='Type an answer first.';input.focus();return;}submit(submitButton,normalize(input.value)===normalize(task.correct));});
        resetAttempt=()=>{input.value='';input.focus({preventScroll:true});};
      }else{
        const order=el('div','order'), hint=el('p','word-hint','Choose words to build the sentence. Select a chosen word to send it back.'), drop=el('div','word-zone'), pool=el('div','word-pool'), check=button('Check order','submit',()=>{if(state!=='question')return;if(expired())return;if(selected.length!==words.length){feedback.textContent='Choose all the words before checking.';return;}submit(check,normalize(selected.map(id=>words[id]).join(' '))===normalize(task.correct));});
        drop.setAttribute('aria-label','Your sentence');pool.setAttribute('aria-label','Available words');
        const words=task.correct.trim().split(/\s+/u), poolOrder=shuffle(words.map((_,i)=>i));let selected=[];
        function renderWords(){drop.replaceChildren();pool.replaceChildren();for(const id of selected){const b=button(words[id],'word',()=>{if(state!=='question')return;selected=selected.filter(x=>x!==id);renderWords();const next=pool.querySelector('[data-word-id="'+id+'"]');if(next)next.focus();});b.dataset.wordId=id;b.setAttribute('aria-label','Remove '+words[id]+' from sentence');drop.append(b);}for(const id of poolOrder.filter(id=>!selected.includes(id))){const b=button(words[id],'word',()=>{if(state!=='question')return;selected.push(id);renderWords();const next=pool.querySelector('button')||check;next.focus();});b.dataset.wordId=id;b.setAttribute('aria-label','Add '+words[id]+' to sentence');pool.append(b);}if(!selected.length)drop.append(el('span','word-hint','Your sentence goes here'));}
        resetAttempt=()=>{selected=[];renderWords();};renderWords();order.append(hint,drop,pool,check);answers.append(order);
      }
      questionText.focus({preventScroll:true});beginTimer();
    }
    function submit(ui,correct){if(state!=='question')return;if(expired())return;clearTimer();lockAnswers(true);if(correct){state='feedback';ui.classList.add('correct');feedback.textContent='Correct! Keep flying.';delay(()=>{index++;fly(false);},reduced?250:600);}else wrong(ui,false);}
    function wrong(ui,timeout){if(state!=='question')return;state='feedback';clearTimer();lockAnswers(true);if(ui)ui.classList.add('wrong');lives--;updateLives();sound('wrong');characterSpace.classList.add('hurt');feedback.textContent=timeout?'Time’s up. '+(lives?'Try this question again.':'No lives left.'):(lives?'Not quite. Have another try!':'No lives left. You can try again.');delay(()=>{characterSpace.classList.remove('hurt');if(!lives){characterSpace.classList.add('falling');delay(()=>finish(false),reduced?100:800);}else{if(ui)ui.classList.remove('wrong');state='question';lockAnswers(false);resetAttempt();beginTimer();}},reduced?600:1000);}
    function finish(won){cleanup();stopAudio();state=won?'won':'lost';playArea.hidden=true;screen.hidden=false;restart.hidden=true;screen.replaceChildren();if(won)sound('win');const src=won?assets.victory:assets.gameOver;if(src)screen.append(image(src,'end-image',won?'Victory illustration':'Game over illustration'));else screen.append(image(assets.character||cat,'start-character','',cat));const heading=el('h1','',won?s.winText:s.loseText);heading.tabIndex=-1;screen.append(heading,el('p','result-count',coins+' / '+tasks.length+' stars collected'),button(won?'Play again':'Try again','main-button',start));heading.focus({preventScroll:true});}
    updateLives();timerDisplay();updateEnvironment();
    screen.append(el('span','intro-label','A FLYING QUIZ'),image(assets.character||cat,'start-character','',cat));if(s.title)screen.append(el('h1','',s.title));screen.append(el('p','',tasks.length+' questions · '+s.lives+' lives'+(s.useTimer?' · '+s.timerSeconds+' seconds per attempt':'')+'\nAnswer correctly to collect stars and fly onward.'),button(s.startText||'Start','main-button',start));
    window.addEventListener('pagehide',()=>{cleanup();stopAudio();if(audioContext)audioContext.close().catch(()=>{});});
  };
})();
