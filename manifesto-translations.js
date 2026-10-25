(() => {
  'use strict';

  /* v20261026: the three complete manuscript editions now live directly in
     manifesto.txt, manifesto.en.txt, and manifesto.ja.txt. Do not intercept
     fetch to assemble obsolete manifesto-text/v7 fragment files. */

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  const EMPHASIS = new Set([
    '然而，废墟出现了。',
    '建筑终结之处，墟构才刚刚开始。',
    'And yet, the ruin appears.',
    'Where architecture ends, ruinwork has only just begun.',
    'しかし、廃墟が現れる。',
    '建築が終わる場所で、墟構はようやく始まる。'
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
