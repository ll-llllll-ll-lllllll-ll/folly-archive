(() => {
  'use strict';

  // v119 · Mechanics dark-tone trial.
  // Start this page at the night end of the existing reader palette without
  // persisting the choice to Manifesto or other pages. The existing slider
  // remains live, so the page can still be pulled back toward paper/warm tones.
  const apply = () => {
    if (!window.RuinReaderTone?.apply) return false;
    window.RuinReaderTone.apply(100, { persist:false });
    document.documentElement.style.colorScheme = 'dark';
    document.body?.classList.add('mechanics-dark-trial');
    return true;
  };

  if (!apply()) {
    const retry = () => {
      if (apply()) return;
      requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
  }
})();