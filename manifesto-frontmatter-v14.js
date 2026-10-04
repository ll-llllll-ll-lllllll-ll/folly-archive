(() => {
  'use strict';

  const documentEl = document.getElementById('manifesto-document');
  const scroller = document.getElementById('manifesto-scroll');
  if (!documentEl || !scroller) return;

  const COPY = {
    zh: {
      introKicker: '00 / 简介',
      introTitle: '如何阅读这份宣言',
      intro: [
        '我把废墟理解为一种仍在发生的现实。建筑失去用途与维护以后，材料、重力、气候、植物与时间仍在继续改写它；废墟因此既保存着秩序留下的痕迹，也暴露出秩序无法继续维持自身的地方。本文以“破碎画框”作为这一理解的理论图像：当如画式观看建立的安全距离开始破裂，画框自身也进入废墟，视线便从完整的景象转向裂纹、受力、耗散与正在发生的变化。废墟由此成为一种尚未完成、仍在生成的现实。',
        '在这种理解之上，我也进入废墟中创作。我把建筑之后仍在继续的建造称为“墟构”：把位移、失效、风化、因果延迟与最终的崩解一并写进构造，使作品拥有继续走向废墟的时间。下面的“墟构师十则”来自一次次进入、建造、失败、修正、等待与退场的经验。它们更接近一组可反复查阅的工作坐标——面对具体遗构时，用来辨认、判断与介入，也允许被下一处废墟重新改写。'
      ],
      tenetKicker: '01—10 / 墟构学索引',
      tenetTitle: '墟构师十则',
      tenetLead: '十则既是正文中的章节，也是一组可以单独进入、反复查阅的工作坐标。选择任一则，可直接抵达对应正文。',
      start: '从序言开始阅读全文 ↓'
    },
    en: {
      introKicker: '00 / INTRODUCTION',
      introTitle: 'How to Read This Manifesto',
      intro: [
        'I understand the ruin as a reality still taking place. Once use and maintenance withdraw, material, gravity, weather, plants, and time continue to rewrite the building. A ruin therefore preserves the traces of order while exposing the points at which that order can no longer sustain itself. “The Broken Frame” is the theoretical image through which this text gives that understanding form: when the safe distance established by the picturesque begins to fracture, the frame itself enters ruin, and attention shifts from a complete scene toward cracks, forces, dissipation, and change in progress. The ruin becomes an unfinished reality that continues to form.',
        'From this understanding, I also enter ruins to make work. I call the construction that continues after architecture “Ruinwork”: displacement, failure, weathering, delayed causality, and eventual disintegration are written into the construction so that the work retains a future in which it can continue toward ruin. The Ten Tenets below grew out of repeated acts of entering, building, failing, revising, waiting, and withdrawing. They function as working coordinates that can be consulted independently—ways to recognize, judge, and intervene in a particular remnant, while remaining open to revision by the next ruin.'
      ],
      tenetKicker: '01—10 / RUINWORK INDEX',
      tenetTitle: 'Ten Tenets of the Ruinwright',
      tenetLead: 'The tenets are chapters in the long text, but they can also be entered independently and consulted like a field manual. Choose any tenet to go directly to its full text.',
      start: 'Begin with the preface ↓'
    },
    ja: {
      introKicker: '00 / はじめに',
      introTitle: 'この宣言の読み方',
      intro: [
        '私は廃墟を、なお進行中の現実として捉えている。用途と維持管理が退いたあとも、素材、重力、気候、植物、そして時間は建築を書き換え続ける。廃墟は秩序が残した痕跡を保存すると同時に、その秩序がもはや自らを維持できない場所を露わにする。本稿では「壊れた画枠」を、この理解を理論的に可視化する像として置いている。如画的な眺めがつくっていた安全な距離が破れ始めると、画枠そのものも廃墟となり、視線は完結した景色から、亀裂、力、散逸、そして進行中の変化へ移っていく。廃墟は、まだ終わっていない生成の現実として現れる。',
        'この理解の上で、私は実際に廃墟へ入り、制作を行う。建築のあとにも続く建造を「墟構」と呼び、変位、失効、風化、遅れて現れる因果、そして最終的な崩解までを構造の中へ書き込むことで、作品が廃墟へ向かい続ける時間を残す。以下の「墟構師の建造十則」は、現場へ入ること、建てること、失敗すること、修正すること、待つこと、そして退場することの経験から生まれた。十則は閉じた教義ではなく、具体的な遺構を前に、見分け、判断し、介入するために繰り返し参照できる作業上の座標であり、次の廃墟によって書き換えられる余地を持っている。'
      ],
      tenetKicker: '01—10 / 墟構学索引',
      tenetTitle: '墟構師の建造十則',
      tenetLead: '十則は長文の章であると同時に、それぞれを独立して開き、繰り返し参照できる作業上の座標でもある。任意の一則を選ぶと、対応する本文へ直接移動する。',
      start: '序章から全文を読む ↓'
    }
  };

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  let raf = 0;

  function lang() {
    return document.documentElement.dataset.lang || window.RuinLanguage?.read?.() || 'zh';
  }

  function tenetTargets() {
    return [...documentEl.querySelectorAll('.manifesto-subsection')]
      .filter(section => TENET_RE.test(section.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || ''))
      .slice(0, 10);
  }

  function scrollToTarget(target) {
    if (!target) return;
    scroller.scrollTo({
      top: Math.max(0, target.offsetTop - 24),
      behavior: 'smooth'
    });
    history.replaceState(null, '', `#${target.id}`);
  }

  function build() {
    raf = 0;
    if (documentEl.querySelector('.manifesto-reading-entry')) return;

    const titleBlock = documentEl.querySelector('.manifesto-title-block');
    const firstSection = documentEl.querySelector('.manifesto-section');
    const tenets = tenetTargets();
    if (!titleBlock || !firstSection || tenets.length < 10) return;

    const t = COPY[lang()] || COPY.zh;

    const intro = document.createElement('section');
    intro.className = 'manifesto-reading-entry';
    intro.innerHTML = `
      <div class="manifesto-front-kicker">${t.introKicker}</div>
      <h2>${t.introTitle}</h2>
      <div class="manifesto-front-copy"></div>
    `;
    const introCopy = intro.querySelector('.manifesto-front-copy');
    t.intro.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      introCopy.appendChild(p);
    });

    const directory = document.createElement('section');
    directory.className = 'manifesto-tenet-directory';

    const head = document.createElement('header');
    head.className = 'manifesto-tenet-directory-head';
    head.innerHTML = `
      <div class="manifesto-front-kicker">${t.tenetKicker}</div>
      <h2>${t.tenetTitle}</h2>
      <p>${t.tenetLead}</p>
    `;
    directory.appendChild(head);

    const nav = document.createElement('nav');
    nav.className = 'tenet-directory-grid';
    nav.setAttribute('aria-label', t.tenetTitle);

    tenets.forEach((target, index) => {
      const heading = target.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || '';
      const link = document.createElement('a');
      link.className = 'tenet-directory-card';
      link.href = `#${target.id}`;
      link.style.setProperty('--tenet-pos', `${index * (100 / 9)}%`);
      link.innerHTML = `
        <span class="tenet-directory-icon" aria-hidden="true"></span>
        <span class="tenet-directory-label">${heading}</span>
      `;
      link.addEventListener('click', event => {
        event.preventDefault();
        scrollToTarget(target);
      });
      nav.appendChild(link);
    });
    directory.appendChild(nav);

    const start = document.createElement('a');
    start.className = 'tenet-directory-start';
    start.href = `#${firstSection.id}`;
    start.textContent = t.start;
    start.addEventListener('click', event => {
      event.preventDefault();
      scrollToTarget(firstSection);
    });
    directory.appendChild(start);

    titleBlock.after(intro, directory);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(build);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(documentEl, {childList: true});
  window.addEventListener('ruinlanguagechange', schedule);
  schedule();
})();
