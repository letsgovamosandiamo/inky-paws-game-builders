(async function () {
  'use strict';
  const frame = document.getElementById('site');
  const list = document.getElementById('results');
  const galleryURL = new URL('../index.html', location.href).href;
  const builderURL = new URL('../builders/flying-quiz/index.html', location.href).href;
  let passed = 0, failed = 0;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }
  async function test(name, fn) {
    const item = document.createElement('li');
    try {
      await fn();
      item.className = 'pass'; item.textContent = 'PASS · ' + name; passed++;
    } catch (error) {
      item.className = 'fail'; item.textContent = 'FAIL · ' + name + ': ' + error.message; failed++;
    }
    list.append(item);
  }
  function navigate(action) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Navigation timed out')), 8000);
      frame.addEventListener('load', () => { clearTimeout(timeout); resolve(); }, { once: true });
      action();
    });
  }

  await test('Gallery loads relative CSS and its thumbnail', async () => {
    await navigate(() => { frame.src = galleryURL; });
    const doc = frame.contentDocument;
    assert(doc.title === 'Inky Paws Game Builders');
    assert(doc.querySelector('link[rel="stylesheet"]').sheet.cssRules.length > 0, 'Gallery stylesheet missing');
    const thumbnail = doc.querySelector('.available img');
    assert(thumbnail.complete && thumbnail.naturalWidth > 0, 'Thumbnail missing');
  });
  await test('Two active builders; all future cards are disabled', () => {
    const doc = frame.contentDocument;
    assert(doc.querySelectorAll('.open-builder').length === 2);
    const placeholders = [...doc.querySelectorAll('.coming-soon')];
    assert(placeholders.length === 2);
    assert(placeholders.every(card => !card.querySelector('a') && card.querySelector('button').disabled), 'Placeholder has an active destination');
  });
  await test('Open Builder reaches the nested builder and its resources load', async () => {
    await navigate(() => frame.contentDocument.querySelector('.open-builder').click());
    assert(frame.contentWindow.location.href === builderURL, 'Incorrect builder URL');
    const doc = frame.contentDocument;
    assert(doc.querySelector('link[rel="stylesheet"]').sheet.cssRules.length > 0, 'Builder stylesheet missing');
    assert(frame.contentWindow.InkyPaws.Project && frame.contentWindow.InkyPaws.Export, 'Builder scripts missing');
    assert(doc.querySelectorAll('.question-card').length === 3);
    await wait(650);
    assert(doc.getElementById('preview-frame').srcdoc.includes('A sky full of questions'), 'Live preview missing');
  });
  await test('All Game Builders returns to the gallery and allows reopening', async () => {
    const back = frame.contentDocument.querySelector('.gallery-link');
    assert(back.textContent.includes('All Game Builders'), 'Back link is not clearly labeled');
    await navigate(() => back.click());
    assert(frame.contentWindow.location.href === galleryURL, 'Incorrect gallery URL');
    await navigate(() => frame.contentDocument.querySelector('.open-builder').click());
    assert(frame.contentWindow.location.href === builderURL);
    assert(frame.contentDocument.querySelectorAll('.question-card').length === 3);
  });
  await test('Brand also returns to the gallery', async () => {
    await navigate(() => frame.contentDocument.querySelector('.brand').click());
    assert(frame.contentWindow.location.href === galleryURL);
  });
  await test('Slot Machine opens independently and returns to the gallery', async () => {
    await navigate(() => frame.contentDocument.querySelector('[href="builders/slot-machine/index.html"]').click());
    const doc=frame.contentDocument;
    assert(frame.contentWindow.InkySlot.Export, 'Slot scripts missing');
    assert(doc.querySelector('link[rel="stylesheet"]').sheet.cssRules.length > 0);
    assert(doc.querySelectorAll('.question-card').length === 9);
    assert(doc.getElementById('preview-frame').srcdoc.includes('slot-game'));
    await navigate(() => doc.querySelector('.gallery-link').click());
    assert(frame.contentWindow.location.href === galleryURL);
  });
  await test('Gallery fits a phone viewport', async () => {
    frame.style.width = '390px';
    await wait(150);
    assert(frame.contentDocument.documentElement.scrollWidth <= frame.clientWidth + 1, 'Gallery overflows horizontally');
  });
  document.getElementById('summary').textContent = passed + ' passed, ' + failed + ' failed';
  document.body.dataset.result = failed ? 'fail' : 'pass';
})();
