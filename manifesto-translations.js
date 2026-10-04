(() => {
  'use strict';

  const nativeFetch = window.fetch.bind(window);
  const TRANSLATION_DATA = {
    'manifesto.en.txt': 'manifesto.en.dat',
    'manifesto.ja.txt': 'manifesto.ja.dat'
  };

  function translatedTarget(url) {
    const clean = String(url || '').split('#')[0].split('?')[0];
    return Object.entries(TRANSLATION_DATA).find(([source]) => clean.endsWith(source)) || null;
  }

  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const match = translatedTarget(url);
    if (!match || typeof DecompressionStream === 'undefined') {
      return nativeFetch(input, init);
    }

    const [source, target] = match;
    const translatedUrl = String(url).replace(source, target);
    const response = await nativeFetch(translatedUrl, init);
    if (!response.ok || !response.body) return response;

    const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: {'Content-Type': 'text/plain; charset=utf-8'}
    });
  };

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  const EMPHASIS = new Set([
    'And yet, the ruin appears.',
    'Ruinwork, too, begins after architecture.',
    'As long as modern ruins continue to be born, the Ruinwright will move on toward the next remnant.',
    'それでも、廃墟は現れる。',
    '墟構もまた、建築のあとから始まる。',
    '現代の廃墟が生まれ続けるかぎり、墟構師は次の遺構へ向かう。'
  ]);
  const LEADS = new Set([
    'No two ruins disintegrate in the same way.',
    '同じ仕方で崩解する廃墟は二つとない。'
  ]);

  function syncTranslatedClasses() {
    document.querySelectorAll('.manifesto-subsection').forEach(section => {
      const title = section.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || '';
      if (TENET_RE.test(title)) section.classList.add('tenet');
    });

    document.querySelectorAll('.manifesto-index-link.is-sub').forEach(link => {
      const spans = link.querySelectorAll('span');
      const title = spans.length > 1 ? spans[1].textContent.trim() : '';
      if (TENET_RE.test(title)) link.classList.add('is-tenet');
    });

    document.querySelectorAll('.manifesto-document p').forEach(p => {
      const text = p.textContent.trim();
      if (EMPHASIS.has(text)) p.classList.add('manifesto-emphasis');
      if (LEADS.has(text)) p.classList.add('manifesto-lead');
    });
  }

  const observer = new MutationObserver(syncTranslatedClasses);
  observer.observe(document.documentElement, {childList: true, subtree: true});
})();
