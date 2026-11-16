(() => {
  'use strict';

  const documentEl = document.getElementById('manifesto-document');
  const scroller = document.getElementById('manifesto-scroll');
  const reader = document.querySelector('.manifesto-reader');
  const measureGuide = document.getElementById('manifesto-measure-guide');
  if (!documentEl || !scroller || !reader) return;

  const COPY = {
    zh: {
      name: '《墟构师宣言》',
      intro: [
        "面对那些过早遭到遗弃的现代建筑，我逐渐走出了建筑学、工程学与历史研究的既定道路。我仍借用这些学科有关结构、材料与历史考据的知识，却开始追索那些难以被功能判断、技术处置或线性的历史叙述完整收纳的事物：一座建筑如何失效，又如何在遭到遗弃之后继续崩解。那些在常规专业尺度下近乎不入流的尝试，最终使我得以在废墟中为自己设立一个原本并不存在的职位——“墟构师”（Ruinwright）。它不由任何机构授予，也没有既定的职业规范，只是我作为一名自由研究者，在现代废墟的漫游、勘察与建造中逐渐承担起的一种身份。",
        "我将这门仍在摸索的技艺称为“墟构”（ruinwork）：沿着遗构中残留的故事与物质痕迹，借取那些尚未耗尽寿命的材料、结构与余力，将现场正在发生的松动、失衡与崩解接入造物，使它从落成之时便开始走向自己的废墟。《废墟园林》（Folly）是墟构首先取得的具体形态。在这片无人委托、也未必有成果可以交付的土地上，那些曾经无处安放的狂想，终于能够借由真实的材料与劳动获得形体，并将后续的演变交还给时间。",
        "《墟构师宣言》便是我为这一自行确立的身份与技艺写下的个人法典。我选择以自由的探索性随笔（ensaio）记录这些实践工法、现场札记与跨学科思考，让建造中的经验、对现代废墟的认识，以及那些关于欲望、徒劳和自身的追问逐渐汇集于此，尝试为这门尚在形成的技艺建立自己的认识与实践准则。十则与陈述仍需接受现场的检验；我愿暂时将它们写下，如同将一具尚未定型的造物留在废墟之中，等待未知的变化继续发生，而那些尚未得到解答的问题，也将成为我下一次重新踏入现场的理由。"
      ],
      labels: ['第一则','第二则','第三则','第四则','第五则','第六则','第七则','第八则','第九则','第十则'],
      back: '返回简介'
    },
    en: {
      name: 'Manifesto of the Ruinwright',
      intro: [
        "Confronted with modern buildings abandoned before their time, I gradually departed from the established paths of architecture, engineering, and historical research. I still draw on their knowledge of structures, materials, and historical inquiry, but have begun to pursue what assessments of function, technical interventions, and linear historical narratives cannot fully contain: how a building fails, and how it continues to disintegrate after being abandoned. These pursuits, barely admissible by conventional professional standards, eventually led me to establish a position for myself that had never existed: the “Ruinwright.” No institution confers this title, and no established professional code governs it. It is a role I have gradually assumed as an independent researcher through wandering, surveying, and building amid modern ruins.",
        "I call this still-emerging craft “ruinwork”: following the stories and material traces left in a ruin, I draw on materials, structures, and residual forces whose lives are not yet exhausted, bringing the site's ongoing loosening, imbalance, and disintegration into what I build, so that from the moment it takes shape, the work is already moving toward its own ruin. Folly is the first concrete form ruinwork has taken. On ground where no one has commissioned me, and where there may be no result to deliver, imaginings that once had nowhere to go can at last acquire form through actual materials and labor, while everything that follows is relinquished to time.",
        "The Manifesto of the Ruinwright is the personal code I have written for this self-appointed role and the craft it names. I have chosen the freedom of the exploratory essay (ensaio) to record its working methods, field notes, and cross-disciplinary reflections, bringing together experiences of building, ways of understanding modern ruins, and questions of desire, futility, and the self, in an attempt to establish principles of understanding and practice for a craft still taking shape. The ten tenets and the statements remain subject to the test of the site. For now, I set them down as I would leave an unfinished construction in a ruin, to undergo changes I cannot yet foresee; the questions still unanswered will give me reason to return to the site once more."
      ],
      labels: ['First Tenet','Second Tenet','Third Tenet','Fourth Tenet','Fifth Tenet','Sixth Tenet','Seventh Tenet','Eighth Tenet','Ninth Tenet','Tenth Tenet'],
      back: 'Return to introduction'
    },
    ja: {
      name: '『墟構師宣言』',
      intro: [
        "早すぎる時期に見捨てられた現代の建築物を前に、私は建築学、工学、歴史研究の既成の道筋から少しずつ外れていった。構造や材料、史料の考証に関する知識は今も借りている。しかし、機能の評価、技術的な処置、直線的な歴史叙述には収まりきらないものを追うようになった。建築はいかに機能を失い、放棄された後もいかに崩れ続けるのか。従来の専門的な尺度ではほとんどまともな研究と見なされないような試みを重ねるうちに、私は廃墟の中で、自分のためにそれまで存在しなかった職を設けることになった――「墟構師」（Ruinwright）である。どの機関から授けられた資格でもなく、定められた職業規範もない。現代の廃墟を歩き、調べ、建てることを繰り返すなかで、一人の独立した研究者として少しずつ引き受けてきた役割である。",
        "私は、なお手探りで育てているこの技法を「墟構」（ruinwork）と呼ぶ。遺構に残る物語と物質の痕跡をたどり、まだ寿命を使い果たしていない材料や構造、そこに残る力を借り、現場で進む緩み、均衡の崩れ、崩壊を新たな造形へとつなぐ。こうしてつくられたものは、完成したその時から、自らの廃墟へと向かい始める。『フォリー』（Folly）は、墟構が最初に得た具体的な形である。誰からも依頼されず、差し出すべき成果があるとも限らないこの場所で、かつて行き場のなかった空想は、実際の材料と労働を通してようやく形を得る。その先の変化は時間に委ねられる。",
        "『墟構師宣言』は、こうして自ら定めた役割と技法のために、私自身が書き記す法典である。私は自由な探索的随筆（ensaio）という形式を選び、実践の工法、現場の覚書、分野を越えて生まれた思考を記録する。建造の経験、現代の廃墟についての認識、そして欲望、徒労、自分自身への問いをここに集め、なお形を成しつつある技法のために、認識と実践の指針を築こうとしている。十則と陳述は、これからも現場で試されなければならない。いまはひとまず、まだ定まらぬ造形物を廃墟に残すように、それらを書き留めておく。予測できない変化がその先も起こるのを待ちながら、なお答えの出ない問いを、次にまた現場へ踏み入る理由とする。"
      ],
      labels: ['第一則','第二則','第三則','第四則','第五則','第六則','第七則','第八則','第九則','第十則'],
      back: '紹介へ戻る'
    }
  };

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  const TENET_ICON_DIR = 'manifesto-assets/tenets/chapters';
  let buildRaf = 0;
  let scrollRaf = 0;
  let builtTitleBlock = null;

  function lang() {
    return document.documentElement.dataset.lang || window.RuinLanguage?.read?.() || 'zh';
  }

  function tenetImage(index) {
    return `${TENET_ICON_DIR}/${String(index + 1).padStart(2, '0')}.png`;
  }

  function tenetTargets() {
    return [...documentEl.querySelectorAll('.manifesto-subsection')]
      .filter(section => TENET_RE.test(section.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || ''))
      .slice(0, 10);
  }

  function tenetSubtitle(heading) {
    const text = String(heading || '').trim();
    const split = text.match(/^[^：:]+[：:]\s*(.+)$/);
    return split ? split[1].trim() : text;
  }

  function scrollerTopFor(target, offset = 24) {
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return Math.max(0, scroller.scrollTop + targetRect.top - scrollerRect.top - offset);
  }

  // Long atlas-to-tenet jumps should not keep iOS Safari's scroll animator
  // running while a reader is trying to swipe. Allow native inertial scroll
  // immediately after the landing instead.
  function goToReadingPosition(top) {
    if (window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) {
      scroller.scrollTop = top;
    } else {
      scroller.scrollTo({top, behavior: 'smooth'});
    }
  }

  function scrollToTarget(target) {
    if (!target) return;
    goToReadingPosition(scrollerTopFor(target, 24));
    history.replaceState(null, '', `#${target.id}`);
  }

  function frontPanel() {
    return scroller.querySelector(':scope > .manifesto-front-panel');
  }

  function scrollToIntro() {
    const panel = frontPanel();
    if (!panel) return;
    goToReadingPosition(0);
    history.replaceState(null, '', location.pathname + location.search);
    documentEl.querySelectorAll('.tenet-return-row').forEach(row => row.remove());
  }

  function bevelMarkup() {
    return '<span class="ceramic-bevel ceramic-bevel-top"></span><span class="ceramic-bevel ceramic-bevel-right"></span><span class="ceramic-bevel ceramic-bevel-bottom"></span><span class="ceramic-bevel ceramic-bevel-left"></span>';
  }

  function showReturnButton(target) {
    documentEl.querySelectorAll('.tenet-return-row').forEach(row => row.remove());

    const t = COPY[lang()] || COPY.zh;
    const row = document.createElement('div');
    row.className = 'tenet-return-row';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tenet-return-button';
    button.setAttribute('aria-label', t.back);
    button.innerHTML = `
      <span class="ceramic-tile tenet-return-tile">
        ${bevelMarkup()}
        <span class="tenet-return-face">${t.back}</span>
      </span>
    `;
    button.addEventListener('click', scrollToIntro);
    row.appendChild(button);
    target.appendChild(row);
  }

  function decorateTenets(tenets) {
    tenets.forEach((target, index) => {
      const header = target.querySelector(':scope > .manifesto-subsection-header');
      const h3 = header?.querySelector(':scope > h3');
      if (!header || !h3 || header.querySelector('.tenet-heading-icon')) return;

      header.classList.add('has-tenet-icon');
      const icon = document.createElement('span');
      icon.className = 'tenet-heading-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.setProperty('--tenet-image', `url("${tenetImage(index)}")`);
      header.insertBefore(icon, h3);
    });
  }

  function syncFrontPosition() {
    scrollRaf = 0;
    const panel = frontPanel();
    if (!panel) {
      reader.style.setProperty('--manifesto-front-index-top', '0px');
      reader.classList.add('manifesto-longform-active');
      reader.classList.remove('manifesto-front-active');
      return;
    }

    const panelHeight = Math.max(1, panel.offsetHeight);
    const remaining = Math.max(0, panel.offsetTop + panelHeight - scroller.scrollTop);
    const visibleRatio = Math.max(0, Math.min(1, remaining / panelHeight));
    panel.style.setProperty('--manifesto-front-shadow-alpha', (0.14 * visibleRatio).toFixed(3));

    reader.style.setProperty('--manifesto-front-index-top', `${remaining}px`);
    reader.classList.toggle('manifesto-longform-active', remaining <= 1);
    reader.classList.toggle('manifesto-front-active', remaining > 1);
  }

  function scheduleFrontPosition() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(syncFrontPosition);
  }

  function makePanel(t, tenets) {
    const panel = document.createElement('section');
    panel.className = 'manifesto-front-panel';
    panel.dataset.lang = lang();
    panel.setAttribute('aria-label', t.name);

    const intro = document.createElement('div');
    intro.className = 'manifesto-front-intro-grid';

    t.intro.forEach((text, index) => {
      const p = document.createElement('p');
      if (index === 0) {
        const strong = document.createElement('strong');
        strong.className = 'manifesto-front-name';
        strong.textContent = t.name;
        p.append(strong, document.createTextNode(text));
      } else {
        p.textContent = text;
      }
      intro.appendChild(p);
    });
    panel.appendChild(intro);

    const nav = document.createElement('nav');
    nav.className = 'tenet-directory-grid';
    nav.setAttribute('aria-label', lang() === 'en' ? 'Ten Tenets of the Ruinwright' : lang() === 'ja' ? '墟構師の建造十則' : '墟构师十则');

    tenets.forEach((target, index) => {
      const heading = target.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || '';
      const link = document.createElement('a');
      link.className = 'tenet-directory-card';
      link.href = `#${target.id}`;
      link.title = heading;
      link.setAttribute('aria-label', heading);
      link.style.setProperty('--tenet-image', `url("${tenetImage(index)}")`);

      const ordinal = document.createElement('span');
      ordinal.className = 'tenet-directory-ordinal';
      ordinal.textContent = t.labels[index];

      const tile = document.createElement('span');
      tile.className = 'ceramic-tile tenet-directory-tile';
      tile.setAttribute('aria-hidden', 'true');
      tile.innerHTML = `${bevelMarkup()}<span class="tenet-directory-icon"></span>`;

      const subtitle = document.createElement('span');
      subtitle.className = 'tenet-directory-subtitle';
      subtitle.textContent = tenetSubtitle(heading);

      link.append(ordinal, tile, subtitle);
      link.addEventListener('click', event => {
        event.preventDefault();
        showReturnButton(target);
        scrollToTarget(target);
      });
      nav.appendChild(link);
    });
    panel.appendChild(nav);
    return panel;
  }

  function build() {
    buildRaf = 0;
    const currentLang = lang();
    const titleBlock = documentEl.querySelector('.manifesto-title-block');
    const tenets = tenetTargets();
    if (!titleBlock || tenets.length < 10) return;

    const existing = frontPanel();
    if (existing && existing.dataset.lang === currentLang && builtTitleBlock === titleBlock) {
      decorateTenets(tenets);
      scheduleFrontPosition();
      return;
    }
    if (existing) existing.remove();

    const t = COPY[currentLang] || COPY.zh;
    decorateTenets(tenets);
    const panel = makePanel(t, tenets);

    /* Keep the introduction independent from long-form typography/margins by
       placing it directly in the scrolling reader, before the document. */
    scroller.insertBefore(panel, measureGuide || documentEl);
    builtTitleBlock = titleBlock;
    scheduleFrontPosition();
  }

  function scheduleBuild() {
    if (buildRaf) return;
    buildRaf = requestAnimationFrame(build);
  }

  const observer = new MutationObserver(scheduleBuild);
  observer.observe(documentEl, {childList: true});
  scroller.addEventListener('scroll', scheduleFrontPosition, {passive: true});
  window.addEventListener('resize', scheduleFrontPosition, {passive: true});
  window.addEventListener('ruinlanguagechange', () => {
    frontPanel()?.remove();
    builtTitleBlock = null;
    documentEl.querySelectorAll('.tenet-return-row').forEach(row => row.remove());
    scheduleBuild();
  });
  scheduleBuild();
})();