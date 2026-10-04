(() => {
  'use strict';

  // English and Japanese are now stored as complete plain-text manifesto files.
  // Keep this companion script focused on language-specific presentation only;
  // manifesto.js fetches manifesto.en.txt / manifesto.ja.txt directly.
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
  syncTranslatedClasses();
})();
