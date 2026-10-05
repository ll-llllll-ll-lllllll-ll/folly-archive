(() => {
  'use strict';

  /* The reviewed seventh-edition English and Japanese manuscripts are kept in
     small plain-text source parts. manifesto.js continues to request the same
     public filenames; this loader assembles the corresponding parts before the
     existing parser sees them. */
  const SOURCE_PARTS = {
    'manifesto.en.txt': Array.from({length:11}, (_,i) => `manifesto-text/v7/en/${String(i + 1).padStart(2,'0')}.txt`),
    'manifesto.ja.txt': Array.from({length:6}, (_,i) => `manifesto-text/v7/ja/${String(i + 1).padStart(2,'0')}.txt`)
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    let filename = '';
    try {
      const href = typeof input === 'string' ? input : input?.url;
      if (href) filename = new URL(href, location.href).pathname.split('/').pop() || '';
    } catch (_) {}

    const parts = SOURCE_PARTS[filename];
    if (!parts) return nativeFetch(input, init);

    try {
      const responses = await Promise.all(parts.map(path => nativeFetch(path, {cache:'no-store'})));
      const failed = responses.find(response => !response.ok);
      if (failed) {
        return new Response('', {
          status:failed.status || 500,
          statusText:failed.statusText || 'Manifesto source part failed to load'
        });
      }
      const texts = await Promise.all(responses.map(response => response.text()));
      /* Each part ends at a paragraph boundary. Restore one separating blank
         line so paragraph blocks remain distinct; an extra blank line between
         footnote-definition parts is harmless to the manifesto parser. */
      return new Response(texts.join('\n'), {
        status:200,
        headers:{'Content-Type':'text/plain; charset=utf-8'}
      });
    } catch (_) {
      return new Response('', {status:500,statusText:'Manifesto source assembly failed'});
    }
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
  observer.observe(document.documentElement, {childList:true,subtree:true});
  syncTranslatedClasses();
})();
