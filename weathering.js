/* v475 · Instant, complete fracture events with a front-loaded age clock.
   No growing strokes, no morphing chips: each fracture appears fully formed.
   ~82% of individual traces and 7/8 structural milestones arrive by 60s. */
(() => {
    'use strict';

    // New key intentionally starts a new clock after the old 12-minute timeline.
    const STORAGE_KEY = 'ruin-archive-visible-weathering-v475';
    const marks = [3000, 8000, 14000, 22000, 31000, 43000, 58000, 145000];
    const terminal = marks[marks.length - 1];
    let elapsed = 0;
    try {
        elapsed = Math.max(0, Math.min(terminal, Number(sessionStorage.getItem(STORAGE_KEY)) || 0));
    } catch (_) {}
    let stage = marks.filter(t => elapsed >= t).length;
    let lastTime = performance.now();
    let lastSave = elapsed;
    const crackEvents = new Map();
    const drawerOutlines = new WeakMap();

    const hash = str => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    };
    const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
    const xy = p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`;
    const pathD = points => points.map((p,i) =>
        `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const polygon = points => `polygon(${points.map(xy).join(', ')})`;

    function ownerIdentity(path) {
        const doc = path.closest('.archive-doc');
        if (!doc) return '';
        const stack = doc.closest('#stack-record, #stack-garden');
        const index = Array.prototype.indexOf.call(doc.parentNode?.children || [],doc);
        return `${stack?.id || 'archive'}:${index}:`;
    }
    function identity(path) {
        const svg = path.closest('svg');
        const owner = svg?.getAttribute('class') || '';
        const pair = path.dataset.ruinAgePair;
        return ownerIdentity(path) + owner + ':' + (pair ||
            (path.getAttribute('class') || '') + ':' + (path.getAttribute('d') || ''));
    }
    function bornAt(key, paired) {
        if (crackEvents.has(key)) return crackEvents.get(key);
        let birth;
        if (paired) {
            // Structural/paired crack is born with the new physical pit,
            // not several seconds after its associated missing material.
            birth = stage ? marks[stage - 1] : 0;
        } else {
            const roll = hash(key) / 4294967295;
            const variation = hash(key + ':when') / 4294967295;
            // 82% of independent fissures appear fully formed in minute one.
            birth = roll < .82
                ? 2000 + variation * 55000
                : 62000 + variation * (terminal - 62000);
        }
        crackEvents.set(key,birth);
        return birth;
    }

    function revealCracks() {
        // Only the fissure itself is scheduled. Outline/border paths remain
        // intact: hiding an edge contour would remove the frame's backbone.
        // Generator stage gates create complete pits, archive chips and slabs.
        const paths = document.querySelectorAll(
            '.ruin-fracture-overlay path.ruin-fracture-crack:not(.ruin-fracture-border), ' +
            '#mobile-outer-rim path.mobile-outer-rim-crack, ' +
            '#mobile-fracture-shell path.mobile-side-inner-crack'
        );
        paths.forEach(path => {
            if (!path.isConnected) return;
            const id = path.dataset.ruinAgeIdentity ||
                (path.dataset.ruinAgeIdentity = identity(path));
            const when = bornAt(id, Boolean(path.dataset.ruinAgePair));
            const visible = elapsed >= when;
            // Retire the v473/v474 path-drawing technique completely.
            if (path.style.strokeDasharray) path.style.removeProperty('stroke-dasharray');
            if (path.style.strokeDashoffset) path.style.removeProperty('stroke-dashoffset');
            path.classList.remove('ruin-age-revealing');
            const state = visible ? 'visible' : 'hidden';
            if (path.style.visibility !== state) path.style.visibility = state;
        });
    }

    function registerArchiveChip(doc, finalPoints) {
        if (!doc || !finalPoints?.length) return false;
        // A fully formed fracture and its paper cut arrive in the SAME pass.
        const clip = polygon(finalPoints);
        if (doc.style.clipPath !== clip) {
            doc.style.clipPath = clip;
            doc.style.webkitClipPath = clip;
            doc.style.setProperty('--archive-doc-shape-clip',clip);
        }
        return true;
    }

    function registerDrawerShell(drawer,data) {
        if (!drawer || !data) return false;
        const full = [
            ...data.leftEdge,
            ...data.topEdge.slice(1),
            ...data.rightEdge.slice(1)
        ];
        drawerOutlines.set(drawer,full);
        const clip = `polygon(${full.map(xy).join(', ')}, 100% 100%, 0 100%)`;
        if (drawer.style.getPropertyValue('--index-drawer-shell-clip') !== clip)
            drawer.style.setProperty('--index-drawer-shell-clip',clip);
        const outline = drawer.querySelector(':scope > svg.index-drawer-aligned-outline > path');
        if (outline) attachDrawerOutline(drawer,outline);
        return true;
    }
    function attachDrawerOutline(drawer,path) {
        const points = drawerOutlines.get(drawer);
        if (!points?.length || !path) return;
        const d = pathD(points);
        if (path.getAttribute('d') !== d) path.setAttribute('d',d);
    }

    function updateCompassWear() {
        const outer = document.querySelector('.compass-pentagon-outer.fracture-active');
        const svg = outer?.querySelector('svg.ruin-fracture-compass');
        if (!svg) return;
        const w = svg.viewBox?.baseVal?.width || outer.offsetWidth;
        const h = svg.viewBox?.baseVal?.height || outer.offsetHeight;
        const dims = {tlw:0,tlh:0,trw:0,trh:0,brw:0,brh:0};
        svg.querySelectorAll('path.ruin-fracture-compass-chip').forEach(path => {
            const values = [...(path.getAttribute('d') || '').matchAll(
                /[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g
            )];
            if (values.length < 4) return;
            const a = {x:Number(values[0][1]),y:Number(values[0][2])};
            const last = values[values.length-1];
            const b = {x:Number(last[1]),y:Number(last[2])};
            if (a.y < h*.30 && a.x < w*.50) {
                dims.tlw = Math.max(dims.tlw,a.x);
                dims.tlh = Math.max(dims.tlh,b.y);
            } else if (a.y < h*.30) {
                dims.trw = Math.max(dims.trw,w-a.x);
                dims.trh = Math.max(dims.trh,b.y);
            } else if (a.x > w*.50) {
                dims.brh = Math.max(dims.brh,h-a.y);
                dims.brw = Math.max(dims.brw,w-b.x);
            }
        });
        for (const [name,value] of Object.entries(dims)) {
            const property = '--compass-wear-' + name;
            const px = value.toFixed(2) + 'px';
            if (outer.style.getPropertyValue(property) !== px)
                outer.style.setProperty(property,px);
        }
    }

    function updateArchiveJitter() {
        // Offset magnitudes now change only at milestones, never every frame.
        document.querySelectorAll('#stack-record .archive-doc, #stack-garden .archive-doc')
            .forEach((doc,index) => {
                const bx = Number(doc.dataset.ruinAgeBaseX || 0);
                const by = Number(doc.dataset.ruinAgeBaseY || 0);
                const factor = .12 + .88 * stage / marks.length;
                const garden = Boolean(doc.closest('#stack-garden'));
                const extra = stage >= 4 &&
                    ((index * 7 + (garden ? 3 : 1)) % 13) < Math.min(6,stage-3);
                const sx = bx ? Math.sign(bx) : (index % 2 ? 1 : -1);
                const sy = by ? Math.sign(by) : (index % 3 === 0 ? -1 : 1);
                const ex = extra ? sx * (.65 + (stage-3)*.42) : 0;
                const ey = extra ? sy * Math.min(1.7,(stage-3)*.3) : 0;
                doc.style.setProperty('--archive-paper-x-jitter',
                    `${(bx*factor+ex).toFixed(2)}px`);
                doc.style.setProperty('--archive-paper-y-jitter',
                    `${(by*factor+ey).toFixed(2)}px`);
            });
    }

    function save() {
        try { sessionStorage.setItem(STORAGE_KEY,String(Math.round(elapsed))); }
        catch (_) {}
        lastSave = elapsed;
    }
    function advance() {
        const now = performance.now();
        if (!document.hidden && document.body?.classList.contains('startup-complete'))
            elapsed = Math.min(terminal,elapsed + clamp(now-lastTime,0,60000));
        lastTime = now;
        const next = marks.filter(t => elapsed >= t).length;
        if (next !== stage) {
            stage = next;
            document.documentElement.dataset.ruinWeatheringStage = String(stage);
            // Existing seeded procedural renderers add entire cracks/pits here.
            window.dispatchEvent(new CustomEvent('ruin-weathering-stage-change',{detail:{stage}}));
            updateArchiveJitter();
        }
        if (elapsed-lastSave > 5000) save();
        revealCracks();
        updateCompassWear();
    }

    document.documentElement.dataset.ruinWeatheringStage = String(stage);
    document.addEventListener('visibilitychange',() => {
        advance(); save(); lastTime = performance.now();
    });
    window.addEventListener('pagehide',save);
    window.addEventListener('pageshow',() => {
        lastTime=performance.now();
        revealCracks();
        updateCompassWear();
    });
    // Synchronous first paint and milestone updates prevent brief, full-length
    // flashes of not-yet-born fissures during SVG/Index recomposition.
    window.addEventListener('ruin-fracture-static-ready',() => {
        revealCracks();
        updateCompassWear();
    });
    document.addEventListener('DOMContentLoaded',() => {
        revealCracks();
        updateCompassWear();
        // The compass redraws its small SVG as the wheel changes width.
        // Classify each new complete crack before Safari's next paint.
        const compass = document.querySelector('.compass-pentagon-outer');
        if (compass && typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(records => {
                if (records.some(record => [...record.addedNodes].some(node =>
                    node.nodeType === 1 && node.matches?.('svg.ruin-fracture-compass')))) {
                    revealCracks();
                    updateCompassWear();
                }
            });
            observer.observe(compass,{childList:true});
        }
    },{once:true});
    window.setInterval(advance,1000);
    window.RuinWeathering = Object.freeze({
        get stage(){return stage;},
        get elapsed(){return elapsed;},
        revealCracks,updateArchiveJitter,updateCompassWear,
        registerArchiveChip,registerDrawerShell,attachDrawerOutline
    });
})();
