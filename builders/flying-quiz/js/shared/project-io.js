(function () {
  'use strict';
  const IP = window.InkyPaws;
  function download(content, type, name) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 30000);
  }
  function filename(title) { return (title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'flying-quiz'); }
  IP.ProjectIO = {
    download, filename,
    save(p) { download(JSON.stringify(p,null,2),'application/json',filename(p.settings.title)+'.inky.json'); },
    async load(file) { if (file.size > 80*1024*1024) throw new Error('This project is too large (maximum 80 MB).'); let raw; try { raw = JSON.parse(await file.text()); } catch (_) { throw new Error('This file is not valid JSON.'); } return IP.Project.import(raw); }
  };
})();
