(function () {
  'use strict';
  const IP = window.InkyPaws;
  function safeJSON(value) { return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029'); }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  IP.generateGameHtml = function (project) {
    const p = IP.Project.import(project);
    const errors = IP.Project.validate(p);
    if (errors.length) throw new Error(errors.join('\n'));
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + escapeHTML(p.settings.title || 'Flying Quiz') + '</title><style>' + IP.gameStyles + '</style></head><body><div id="game"></div><script id="project-data" type="application/json">' + safeJSON(p) + '</script><script>(' + IP.runGame.toString() + ')(JSON.parse(document.getElementById("project-data").textContent));<\/script></body></html>';
  };
  IP.escapeHTML = escapeHTML;
})();
