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
        '是我对废墟长期观察、研究与实践的一次整理。它记录了我理解废墟的方式，也建立起一套与之相应的理论框架，其中包括我对废墟观看、现代废墟及其审美关系的讨论。',
        '随着研究逐渐进入实践，“墟构师”也从一种称谓变成了我在废墟中工作的角色。我以这一身份进入废墟进行创作，并将“墟构”发展为属于自身实践的方法，用于《废墟园林》系列作品的建造。',
        '最终，我将对废墟的理解、由此形成的理论，以及在实践中逐渐建立的墟构方法整理在一起，构成《墟构师宣言》。它既是一份个人陈述，也是一套仍在持续修订的工作体系，并作为我面对这个时代“现代废墟”的一部个人法典。'
      ],
      labels: ['第一则','第二则','第三则','第四则','第五则','第六则','第七则','第八则','第九则','第十则'],
      back: '返回简介'
    },
    en: {
      name: 'Manifesto of the Ruinwright',
      intro: [
        'is a consolidation of my long-term observation, study, and practice around ruins. It records the way I understand ruins and gathers the theoretical framework that has grown alongside that understanding, including my reflections on ways of seeing ruins, modern ruins, and their aesthetic relations.',
        'As research gradually entered practice, “Ruinwright” also shifted from a name into the role through which I work inside ruins. In that role I enter ruins to make work, and have developed “Ruinwork” as a method belonging to my own practice, used in the construction of the Folly Series and related works.',
        'I eventually brought these understandings of ruins, the theories that emerged from them, and the methods of Ruinwork developed through practice together as the Manifesto of the Ruinwright. It is both a personal statement and a working system that remains open to revision: a personal code for confronting the “modern ruins” of this era.'
      ],
      labels: ['First Tenet','Second Tenet','Third Tenet','Fourth Tenet','Fifth Tenet','Sixth Tenet','Seventh Tenet','Eighth Tenet','Ninth Tenet','Tenth Tenet'],
      back: 'Return to introduction'
    },
    ja: {
      name: '『墟構師宣言』',
      intro: [
        'は、廃墟について長期にわたり行ってきた観察・研究・実践を整理したものである。そこには、私が廃墟をどのように理解してきたか、その理解とともに形づくられた理論的な枠組み、そして廃墟を見ること、現代の廃墟、その美学的関係についての考察が記されている。',
        '研究が次第に実践へ入っていくにつれ、「墟構師」は一つの呼称から、私が廃墟の中で仕事をするための役割へと変わった。私はこの立場で廃墟へ入り制作を行い、「墟構」を自らの実践に属する方法として育て、『フォリー』シリーズなどの制作に用いている。',
        '最終的に、廃墟についての理解、そこから生まれた理論、そして実践の中で築いてきた墟構の方法を一つに編み直し、『墟構師宣言』とした。それは個人的なステートメントであると同時に、なお更新され続ける作業体系であり、この時代の「現代の廃墟」に向き合うための私自身の法典でもある。'
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

  function scrollerTopFor(target, offset = 24) {
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return Math.max(0, scroller.scrollTop + targetRect.top - scrollerRect.top - offset);
  }

  function scrollToTarget(target) {
    if (!target) return;
    scroller.scrollTo({top: scrollerTopFor(target, 24), behavior: 'smooth'});
    history.replaceState(null, '', `#${target.id}`);
  }

  function frontPanel() {
    return scroller.querySelector(':scope > .manifesto-front-panel');
  }

  function scrollToIntro() {
    const panel = frontPanel();
    if (!panel) return;
    scroller.scrollTo({top: Math.max(0, panel.offsetTop), behavior: 'smooth'});
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

    const remaining = Math.max(0, panel.offsetTop + panel.offsetHeight - scroller.scrollTop);
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
      link.innerHTML = `
        <span class="ceramic-tile tenet-directory-tile" aria-hidden="true">
          ${bevelMarkup()}
          <span class="tenet-directory-icon"></span>
        </span>
        <span class="tenet-directory-label">${t.labels[index]}</span>
      `;
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