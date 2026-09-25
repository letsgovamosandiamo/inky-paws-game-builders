(function () {
  'use strict';
  const IP = window.InkyPaws;
  function read(file, kind, maxMB) {
    return new Promise((resolve,reject)=>{
      if (file.size > maxMB * 1024 * 1024) return reject(new Error('Choose a file smaller than ' + maxMB + ' MB.'));
      if (!file.type.startsWith(kind + '/') || file.type === 'image/svg+xml') return reject(new Error(kind === 'image' ? 'Use PNG, JPEG, GIF, WebP, AVIF, or BMP images.' : 'Choose an audio file, such as MP3, WAV, or OGG.'));
      const reader = new FileReader();
      reader.onerror = ()=>reject(new Error('The file could not be read.'));
      reader.onload = ()=>{ try { resolve(IP.Project.mediaSource(reader.result,kind)); } catch(e) { reject(e); } };
      reader.readAsDataURL(file);
    });
  }
  function control({label,kind='image',value='',maxMB=5,onChange}) {
    const root = document.createElement('div'); root.className = 'asset-control';
    const heading = document.createElement('h3'); heading.textContent = label; root.append(heading);
    const row = document.createElement('div'); row.className = 'asset-source';
    const url = document.createElement('input'); url.type = 'url'; url.className = 'media-url'; url.placeholder = 'https://…'; url.setAttribute('aria-label',label + ' URL');
    const clear = document.createElement('button'); clear.textContent = 'Clear'; clear.className = 'small-button'; clear.type = 'button'; row.append(url,clear); root.append(row);
    const upload = document.createElement('input'); upload.type = 'file'; upload.accept = kind === 'image' ? 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/bmp' : 'audio/*'; upload.setAttribute('aria-label','Upload ' + label.toLowerCase()); root.append(upload);
    const preview = document.createElement('div'); preview.className = 'asset-preview'; root.append(preview);
    const help = document.createElement('p'); help.className = 'asset-help'; help.textContent = 'Upload up to ' + maxMB + ' MB. ' + (kind === 'image' ? 'PNG, JPEG, GIF, WebP, AVIF, BMP.' : 'MP3, WAV, OGG, and common browser audio formats.'); root.append(help);
    let source = value, generation = 0;
    function render() {
      url.value = source.startsWith('data:') ? '' : source;
      url.placeholder = source.startsWith('data:') ? 'Uploaded file included · paste a URL to replace' : 'https://…';
      preview.replaceChildren();
      const text = document.createElement('span'); text.textContent = source ? (source.startsWith('data:') ? 'Embedded in project & game' : 'Linked image or audio · internet required') : 'Using the game’s default / no custom media';
      if (source && kind === 'image') { const img = document.createElement('img'); img.src = source; img.alt = ''; img.onerror = ()=>{ img.remove(); text.textContent = 'Image could not load. Check the URL or upload a file.'; }; preview.append(img); }
      if (source && kind === 'audio') { const audio = document.createElement('audio'); audio.src = source; audio.controls = true; audio.preload = 'none'; preview.append(audio); }
      preview.append(text);
    }
    url.addEventListener('change',()=>{
      try { source = IP.Project.mediaSource(url.value,kind); generation++; upload.value=''; url.setCustomValidity(''); onChange(source); render(); } catch(e) { url.setCustomValidity(e.message); url.reportValidity(); }
    });
    url.addEventListener('input',()=>url.setCustomValidity(''));
    clear.addEventListener('click',()=>{generation++; source=''; upload.value=''; url.setCustomValidity(''); onChange(''); render();});
    upload.addEventListener('change',async()=>{
      const file = upload.files[0]; if (!file) return;
      const ticket = ++generation;
      try { const result = await read(file,kind,maxMB); if (ticket !== generation || !root.isConnected) return; source=result; url.setCustomValidity(''); onChange(source); render(); } catch(e) { IP.notify(e.message,true); } finally { upload.value=''; }
    });
    render(); return root;
  }
  IP.Assets = {read,control};
})();
