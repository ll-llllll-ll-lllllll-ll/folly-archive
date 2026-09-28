window.MANIFESTO_NOTES = {
  zh: [
    {
      id:'second-nature',
      match:'第二自然',
      text:'Piet Strydom, First and Second Nature, 2021。这里作为“第二自然”概念的参考入口。'
    },
    {
      id:'freedom',
      match:'失去了自由',
      text:'Murray Bookchin，《自由的生态学》（The Ecology of Freedom, 1982）。'
    },
    {
      id:'technical-despair',
      match:'绝望',
      text:'“技术绝望”在此指技术系统取得支配性以后，个体面对自身造物时产生的失控感、无力感与意义危机。相关讨论可参见 Günther Anders《人的过时性》。'
    },
    {
      id:'history-angel',
      match:'历史天使',
      text:'“历史天使”意象来自 Walter Benjamin《历史哲学论纲／论历史概念》：天使面向过去，看见不断堆积的残骸，却被所谓“进步”的风暴推向未来。'
    }
  ],
  en: [
    {id:'second-nature',match:'second nature',text:'Piet Strydom, First and Second Nature, 2021.'},
    {id:'technical-despair',match:'despair',text:'A provisional note on technological despair; see Günther Anders, The Obsolescence of Human Beings.'},
    {id:'history-angel',match:'Angel of History',text:'Walter Benjamin’s “Angel of History” looks toward accumulated wreckage while the storm called progress drives it into the future.'}
  ],
  ja: [
    {id:'second-nature',match:'第二の自然',text:'Piet Strydom, First and Second Nature, 2021。'},
    {id:'technical-despair',match:'絶望',text:'技術システムの支配性と、それに直面する個人の無力感についての仮注。Günther Anders『人間の時代遅れ』を参照。'},
    {id:'history-angel',match:'歴史の天使',text:'Walter Benjamin の「歴史の天使」のイメージ。過去の瓦礫を見つめながら、「進歩」と呼ばれる嵐によって未来へ押し流される。'}
  ]
};

(() => {
  const RL = window.RuinLanguage;
  const AUTO_NOTES = window.MANIFESTO_NOTES || {};
  if (!RL) return;

  const UI = {
    title:{zh:'墟构师宣言',en:'Manifesto of the Ruinwright',ja:'墟構師宣言'},
    mechanics:{zh:'墟构机械数据库 ↗',en:'Mechanism Archive ↗',ja:'墟構機械データベース ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    contents:{zh:'章节',en:'Contents',ja:'目次'},
    loading:{zh:'正在读取文本…',en:'Loading text…',ja:'テキストを読み込み中…'},
    notes:{zh:'注释',en:'Notes',ja:'注釈'},
    enterMechanics:{zh:'［进入墟构机械数据库 ↗］',en:'[Enter the Mechanism Archive ↗]',ja:'［墟構機械データベースへ ↗］'},
    loadError:{
      zh:'未能读取 manifesto.txt。请确认它与 manifesto.html 位于同一目录。',
      zhLocal:'当前页面以本地文件方式打开，浏览器会阻止读取 manifesto.txt。请通过 GitHub Pages 或本地服务器预览。',
      en:'The English manuscript has not been added yet. Add manifesto.en.txt beside this page.',
      ja:'日本語原稿はまだ追加されていません。manifesto.ja.txt を同じフォルダに置いてください。'
    }
  };

  const FILES = {
    zh:'manifesto.txt',
    en:'manifesto.en.txt',
    ja:'manifesto.ja.txt'
  };

  // Small same-language fallback previews keep the interface monolingual
  // when EN/JA manuscript files have not been supplied yet.
  const PREVIEW = {
    en:`Manifesto of the Ruinwright

Prelude: After Architecture

The English manuscript is still being revised. The reader itself is ready: place manifesto.en.txt beside this page and the full text will replace this preview automatically.

Ruinwright Tenets

The database and manifesto now share the same language state and the same transition system.

After Ruinwrighting

The page deliberately keeps only one visible language at a time.`,
    ja:`墟構師宣言

序：建築のあとで

日本語原稿は現在編集中です。閲覧システムはすでに対応しています。同じフォルダに manifesto.ja.txt を置けば、この仮テキストから自動的に切り替わります。

墟構師の建造十則

機械データベースと宣言は、同じ言語状態と切り替え効果を共有します。

墟構のあとで

画面上には常に一つの言語だけを表示します。`
  };

  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  const indexNav = document.getElementById('manifesto-index-nav');
  const popover = document.getElementById('footnote-popover');
  const popoverNumber = document.getElementById('footnote-popover-number');
  const popoverText = document.getElementById('footnote-popover-text');

  let lang = RL.read();
  let sections = [];
  let links = [];
  let usedNotes = [];
  let loadToken = 0;
  let hideTimer = 0;
  let raf = 0;

  function slug(index) {
    return `section-${String(index).padStart(2,'0')}`;
  }

  function isSectionHeading(text) {
    if (lang === 'zh') {
      return /^(序言[:：]|墟构师建造十则|第一条[:：]|第二条[:：]|第三条[:：]|第四条[:：]|墟构之后)/.test(text);
    }
    if (lang === 'en') {
      return /^(Prelude|Ruinwright Tenets|Article|After Ruinwrighting)/i.test(text);
    }
    return /^(序[:：]|墟構師の建造十則|第一条[:：]|第二条[:：]|第三条[:：]|第四条[:：]|墟構のあとで)/.test(text);
  }

  function isSubheading(text) {
    if (lang === 'zh') return /^[一二三四五六七八九十]+、/.test(text);
    if (lang === 'ja') return /^[一二三四五六七八九十]+、/.test(text);
    return /^(I|II|III|IV|V)\.\s/.test(text);
  }

  function parseDefinitions(blocks) {
    const definitions = new Map();
    const clean = [];
    for (const block of blocks) {
      const m = block.match(/^\[\^([^\]]+)\]:\s*([\s\S]+)$/);
      if (m) definitions.set(m[1], m[2].trim());
      else clean.push(block);
    }
    return {definitions, blocks:clean};
  }

  function createFootnoteAnchor(labelText, note, number) {
    const anchor = document.createElement('span');
    anchor.className = 'footnote-anchor';
    anchor.tabIndex = 0;
    anchor.dataset.noteId = note.id;
    anchor.dataset.noteNumber = String(number);
    anchor.dataset.noteText = note.text;
    anchor.append(document.createTextNode(labelText));
    const sup = document.createElement('sup');
    sup.textContent = String(number);
    anchor.appendChild(sup);
    return anchor;
  }

  function renderInline(text, definitions, autoNotes) {
    const frag = document.createDocumentFragment();
    let cursor = 0;
    const markers = [...text.matchAll(/\[\^([^\]]+)\]/g)];

    if (markers.length) {
      for (const m of markers) {
        const before = text.slice(cursor, m.index);
        if (before) frag.append(document.createTextNode(before));
        const id = m[1];
        const noteText = definitions.get(id);
        if (noteText) {
          let note = usedNotes.find(n => n.id === id);
          if (!note) {
            note = {id,text:noteText};
            usedNotes.push(note);
          }
          const supAnchor = createFootnoteAnchor('', note, usedNotes.indexOf(note)+1);
          frag.append(supAnchor);
        } else {
          frag.append(document.createTextNode(m[0]));
        }
        cursor = m.index + m[0].length;
      }
      if (cursor < text.length) frag.append(document.createTextNode(text.slice(cursor)));
      return frag;
    }

    // v67 demo: without changing the current manifesto.txt, make the first
    // matching phrase behave like a Wikipedia-style footnote preview.
    for (const candidate of autoNotes) {
      if (candidate.__used) continue;
      const idx = text.indexOf(candidate.match);
      if (idx < 0) continue;
      if (idx > 0) frag.append(document.createTextNode(text.slice(0,idx)));
      candidate.__used = true;
      usedNotes.push(candidate);
      frag.append(createFootnoteAnchor(candidate.match, candidate, usedNotes.length));
      if (idx + candidate.match.length < text.length) {
        frag.append(document.createTextNode(text.slice(idx + candidate.match.length)));
      }
      return frag;
    }

    frag.append(document.createTextNode(text));
    return frag;
  }

  function parseText(raw) {
    const normalized = String(raw || '').replace(/\r\n?/g,'\n').trim();
    let blocks = normalized.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
    const parsed = parseDefinitions(blocks);
    blocks = parsed.blocks;

    const titleNames = ['墟构师宣言','Manifesto of the Ruinwright','墟構師宣言'];
    blocks = blocks.filter((b,i) => {
      if (i === 0 && titleNames.includes(b)) return false;
      if (/^(公开文本|OPEN DOCUMENT|公開テキスト)/i.test(b)) return false;
      return true;
    });

    const result = [];
    let current = null;
    let preface = [];

    for (const block of blocks) {
      // Old current manifesto.txt ends with three plain reference lines.
      if (/^(Piet Strydom|Murray Bookchin|技术绝望[:：])/.test(block)) continue;

      if (isSectionHeading(block)) {
        if (current) result.push(current);
        current = {heading:block, blocks:[]};
      } else if (current) {
        current.blocks.push(block);
      } else {
        preface.push(block);
      }
    }

    if (current) result.push(current);
    if (preface.length) {
      result.unshift({
        heading: lang === 'zh' ? '序言：在建筑之后' : lang === 'ja' ? '序：建築のあとで' : 'Prelude: After Architecture',
        blocks:preface
      });
    }
    return {sections:result, definitions:parsed.definitions};
  }

  function renderDocument(raw) {
    usedNotes = [];
    const autoNotes = (AUTO_NOTES[lang] || []).map(x => ({...x,__used:false}));
    const parsed = parseText(raw);

    documentEl.replaceChildren();
    const titleBlock = document.createElement('header');
    titleBlock.className = 'manifesto-title-block';
    const h1 = document.createElement('h1');
    h1.textContent = UI.title[lang];
    titleBlock.appendChild(h1);
    documentEl.appendChild(titleBlock);

    parsed.sections.forEach((section,index) => {
      const sec = document.createElement('section');
      sec.className = 'manifesto-section';
      sec.id = slug(index);
      sec.dataset.manifestoSection = '';

      const num = document.createElement('div');
      num.className = 'manifesto-section-number';
      num.textContent = String(index).padStart(2,'0');

      const h2 = document.createElement('h2');
      h2.textContent = section.heading;
      sec.append(num,h2);

      section.blocks.forEach(block => {
        if (isSubheading(block)) {
          const h3 = document.createElement('h3');
          h3.textContent = block;
          sec.appendChild(h3);
          return;
        }

        const p = document.createElement('p');
        if (/^——/.test(block)) p.className = 'dedication';
        if (/^(然而，废墟出现了。|这便是“观看的孤独”。|故事已经结束，余震仍在继续。)/.test(block)) {
          p.classList.add('manifesto-emphasis');
        }
        p.appendChild(renderInline(block, parsed.definitions, autoNotes));
        sec.appendChild(p);
      });

      documentEl.appendChild(sec);
    });

    const cross = document.createElement('div');
    cross.className = 'manifesto-crossref';
    const a = document.createElement('a');
    a.href = 'mechanics.html';
    a.textContent = UI.enterMechanics[lang];
    cross.appendChild(a);
    documentEl.appendChild(cross);

    if (usedNotes.length) {
      const notes = document.createElement('section');
      notes.className = 'manifesto-footnotes';
      const h2 = document.createElement('h2');
      h2.textContent = UI.notes[lang];
      const ol = document.createElement('ol');
      usedNotes.forEach((note,index) => {
        const li = document.createElement('li');
        li.id = `fn-${note.id}`;
        li.textContent = note.text;
        ol.appendChild(li);
      });
      notes.append(h2,ol);
      documentEl.appendChild(notes);
    }

    buildIndex();
    bindFootnotes();
    sections = [...documentEl.querySelectorAll('[data-manifesto-section]')];
    links = [...indexNav.querySelectorAll('[data-section-link]')];
    update();
  }

  function buildIndex() {
    indexNav.replaceChildren();
    [...documentEl.querySelectorAll('[data-manifesto-section]')].forEach((sec,index) => {
      const a = document.createElement('a');
      a.href = `#${sec.id}`;
      a.dataset.sectionLink = sec.id;
      const n = document.createElement('span');
      n.textContent = String(index).padStart(2,'0');
      const label = document.createTextNode(sec.querySelector('h2')?.textContent || '');
      a.append(n,label);
      a.addEventListener('click', event => {
        event.preventDefault();
        scroller.scrollTo({top:sec.offsetTop-18,behavior:'smooth'});
        history.replaceState(null,'',`#${sec.id}`);
      });
      indexNav.appendChild(a);
    });
  }

  function showPopover(anchor) {
    clearTimeout(hideTimer);
    const rect = anchor.getBoundingClientRect();
    popoverNumber.textContent = anchor.dataset.noteNumber.padStart(2,'0');
    popoverText.textContent = anchor.dataset.noteText;
    popover.hidden = false;

    const width = Math.min(360, innerWidth - 28);
    const left = Math.min(
      Math.max(14, rect.left + rect.width/2 - width/2),
      innerWidth - width - 14
    );
    let top = rect.bottom + 10;
    const estimatedHeight = Math.min(220, popover.offsetHeight || 160);
    if (top + estimatedHeight > innerHeight - 14) top = rect.top - estimatedHeight - 10;
    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(14,top)}px`;
  }

  function hidePopoverSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { popover.hidden = true; }, 90);
  }

  function bindFootnotes() {
    documentEl.querySelectorAll('.footnote-anchor').forEach(anchor => {
      anchor.addEventListener('mouseenter', () => showPopover(anchor));
      anchor.addEventListener('mouseleave', hidePopoverSoon);
      anchor.addEventListener('focus', () => showPopover(anchor));
      anchor.addEventListener('blur', hidePopoverSoon);
      anchor.addEventListener('click', event => {
        event.preventDefault();
        if (!popover.hidden && popover.dataset.anchor === anchor.dataset.noteId) {
          popover.hidden = true;
        } else {
          popover.dataset.anchor = anchor.dataset.noteId;
          showPopover(anchor);
        }
      });
    });
    popover.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popover.addEventListener('mouseleave', hidePopoverSoon);
  }

  async function loadText(nextLang) {
    const token = ++loadToken;
    documentEl.innerHTML = `<div class="manifesto-loading">${UI.loading[nextLang]}</div>`;

    if (nextLang !== 'zh') {
      try {
        const response = await fetch(FILES[nextLang], {cache:'no-store'});
        if (!response.ok) throw new Error(String(response.status));
        const raw = await response.text();
        if (token === loadToken) renderDocument(raw);
        return;
      } catch (_) {
        if (token === loadToken) renderDocument(PREVIEW[nextLang]);
        return;
      }
    }

    try {
      const response = await fetch(FILES.zh, {cache:'no-store'});
      if (!response.ok) throw new Error(String(response.status));
      const raw = await response.text();
      if (token === loadToken) renderDocument(raw);
    } catch (_) {
      if (token !== loadToken) return;
      const fallback = `墟构师宣言

序言：在建筑之后

${location.protocol === 'file:' ? UI.loadError.zhLocal : UI.loadError.zh}

墟构师建造十则

读取器会直接解析 manifesto.txt；正文更新后无需重写 HTML。

墟构之后

脚注示例与正式脚注语法已经启用。`;
      renderDocument(fallback);
    }
  }

  function update() {
    raf = 0;
    const probe = scroller.scrollTop + scroller.clientHeight*.28;
    let active = sections[0]?.id || '';
    for (const section of sections) {
      if (section.offsetTop <= probe) active = section.id;
      else break;
    }
    links.forEach(link => link.classList.toggle('active', link.dataset.sectionLink === active));
  }

  function scheduleUpdate() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  scroller.addEventListener('scroll', scheduleUpdate, {passive:true});
  window.addEventListener('resize', () => {
    popover.hidden = true;
    scheduleUpdate();
  }, {passive:true});

  window.addEventListener('ruinlanguagechange', event => {
    lang = event.detail.lang;
    RL.applyMap(UI, lang, document, event.detail.animated);
    document.title = UI.title[lang];
    popover.hidden = true;
    scroller.scrollTop = 0;
    loadText(lang);
  });

  RL.bind();
})();