/* v506 · Balanced Chinese/Japanese index lexicon.
   Render the existing semantic categories as two centered horizontal lines,
   preserving every original .index-tag node and its click handlers.
   Rebalance automatically on new tags, language changes and resizes.
   Avoid splitting a category unless the improved count balance is worth it. */
(() => {
  'use strict';

  function install() {
    const system = document.querySelector('#index-stable-zone .archive-index-system');
    if (!system || system.dataset.ruinBalancedInstalled === '1') return;
    const rows = Array.from(system.children).filter(el => el.classList.contains('index-row'));
    if (rows.length < 2) return;
    system.dataset.ruinBalancedInstalled = '1';

    let groups = rows.map(row => ({
      row,
      category: row.querySelector('.index-category'),
      separator: row.querySelector('.index-separator'),
      container: row.querySelector('.index-tags-container'),
      tags: Array.from(row.querySelectorAll('.index-tags-container > .index-tag')),
      fragment: null
    })).filter(g => g.category && g.separator && g.container);

    const lineA = document.createElement('div');
    const lineB = document.createElement('div');
    lineA.className = 'index-balanced-line index-balanced-line-a';
    lineB.className = 'index-balanced-line index-balanced-line-b';

    let raf = 0;
    let observer = null;
    let lastCut = null;

    function active() {
      const lang = String(document.documentElement.lang || '').toLowerCase();
      return (lang.startsWith('zh') || lang.startsWith('ja')) &&
        window.matchMedia('(min-width:769px) and (min-height:521px)').matches;
    }

    function captureTags() {
      // Categories added to the index later participate automatically too.
      // Never clone or discard authored rows: the DOM elements carry the
      // site's actual tag-filter listeners and translation attributes.
      const present = new Set(
        Array.from(system.querySelectorAll('.index-row:not(.index-row-continuation)'))
      );
      groups = groups.filter(g => present.has(g.row));
      present.forEach(row => {
        if (groups.some(g => g.row === row)) return;
        const category = row.querySelector('.index-category');
        const separator = row.querySelector('.index-separator');
        const container = row.querySelector('.index-tags-container');
        if (!category || !separator || !container) return;
        groups.push({
          row,category,separator,container,
          tags:Array.from(container.querySelectorAll(':scope > .index-tag')),
          fragment:null
        });
      });
      groups.forEach(g => {
        const holders = [g.container, g.fragment?.querySelector('.index-tags-container')].filter(Boolean);
        const present = holders.flatMap(el =>
          Array.from(el.children).filter(child => child.classList.contains('index-tag'))
        );
        // Existing order is authoritative. An appended tag joins the end of
        // its semantic category, even if that category currently spans lines.
        const seen = new Set(present);
        const retained = g.tags.filter(t => seen.has(t));
        const known = new Set(retained);
        const added = present.filter(t => !known.has(t));
        g.tags = [...retained, ...added];
      });
    }

    function restore() {
      groups.forEach(g => {
        g.container.replaceChildren(...g.tags);
        if (g.fragment) {
          g.fragment.remove();
          g.fragment = null;
        }
      });
      system.replaceChildren(...groups.map(g => g.row));
      system.classList.remove('is-two-line-balanced');
      system.style.removeProperty('--index-balanced-cell-size');
      lastCut = null;
    }

    function chooseCut() {
      const sizes = groups.map(g => g.tags.length);
      const total = sizes.reduce((a,b) => a+b, 0);
      if (total < 2) return Math.max(1,total);

      const boundaries = new Set();
      let cumulative = 0;
      sizes.forEach((count,i) => {
        cumulative += count;
        if (i < sizes.length-1) boundaries.add(cumulative);
      });

      let bestCut = 1;
      let bestCost = Infinity;
      for (let cut=1; cut<total; cut++) {
        const imbalance = Math.abs(total-2*cut);
        // Protect semantic continuity. Two extra tags of imbalance are
        // preferable to splitting '建筑' for its final one-character entry.
        const categoryPenalty = boundaries.has(cut) ? 0 : 6;
        const cost = imbalance + categoryPenalty;
        if (cost < bestCost) { bestCost=cost; bestCut=cut; }
      }
      return bestCut;
    }

    function continuationFor(g) {
      const row = document.createElement('div');
      row.className = g.row.className + ' index-row-continuation';
      row.dataset.continuation = 'true';
      const category = g.category.cloneNode(true);
      // Display-only repeated category; it must not join archive filters.
      category.classList.remove('active','disabled');
      category.removeAttribute('data-tag');
      category.setAttribute('aria-hidden','true');
      row.appendChild(category);
      row.appendChild(g.separator.cloneNode(true));
      const box = g.container.cloneNode(false);
      row.appendChild(box);
      g.fragment = row;
      return row;
    }

    function render() {
      raf=0;
      if (!system.isConnected) return;
      observer?.disconnect();
      captureTags();
      restore();

      if (active()) {
        const cut = chooseCut();
        let used = 0;
        for (const g of groups) {
          const first = Math.max(0,Math.min(g.tags.length,cut-used));
          if (first >= g.tags.length) {
            lineA.appendChild(g.row);
          } else if (first === 0) {
            lineB.appendChild(g.row);
          } else {
            g.container.replaceChildren(...g.tags.slice(0,first));
            lineA.appendChild(g.row);
            const part = continuationFor(g);
            part.querySelector('.index-tags-container').replaceChildren(...g.tags.slice(first));
            lineB.appendChild(part);
          }
          used += g.tags.length;
        }
        system.replaceChildren(lineA,lineB);
        system.classList.add('is-two-line-balanced');
        lastCut = cut;

        // Each CJK key is now 20px (~110% of the earlier 18px design).
        // Measure the sum of actual semantic group widths rather than
        // scrollWidth: centered flex overflow may extend beyond the *left*
        // edge, which scrollWidth does not reliably count in Safari.
        const available = Math.max(0,system.clientWidth) - 8;
        const baseCell = 20;
        let fittedCell = baseCell;
        for (const line of [lineA,lineB]) {
          const groupsOnLine = Array.from(line.children);
          const gap = Number.parseFloat(getComputedStyle(line).columnGap) || 0;
          // offsetWidth and clientWidth are both logical CSS pixels.
          // getBoundingClientRect() would include the site's 4:2.3 stage
          // scale and incorrectly shrink these 110% keys on desktop.
          const needed = groupsOnLine.reduce(
            (width,row) => width + row.offsetWidth,0
          ) + Math.max(0,groupsOnLine.length-1)*gap;
          const count = line.querySelectorAll('.index-tag').length;
          if (count > 0 && needed > available && available > 0) {
            const nonCellWidth = needed - count*baseCell;
            fittedCell = Math.min(fittedCell,(available-nonCellWidth)/count);
          }
        }
        if (fittedCell < baseCell) {
          const cell = Math.max(13,Math.floor(fittedCell*10)/10);
          system.style.setProperty('--index-balanced-cell-size',cell+'px');
        }
      }
      observer?.observe(system,{subtree:true,childList:true});
    }

    function schedule() {
      if (raf) return;
      raf=requestAnimationFrame(render);
    }

    observer = new MutationObserver(mutations => {
      // Rebalance only on actual term/row changes; translations affect
      // text nodes and should not provoke an expensive DOM reconstruction.
      if (mutations.some(m => m.addedNodes.length || m.removedNodes.length)) schedule();
    });

    window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('languagechange-complete',schedule);
    const langObserver=new MutationObserver(schedule);
    langObserver.observe(document.documentElement,{
      attributes:true,attributeFilter:['lang']
    });
    if(document.fonts?.ready)document.fonts.ready.then(schedule);
    observer.observe(system,{subtree:true,childList:true});
    schedule();
    window.rebalanceRuinIndexLexicon=schedule;
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded',install,{once:true});
  } else install();
})();
