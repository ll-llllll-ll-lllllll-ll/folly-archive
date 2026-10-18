/* v474 · Ruin Archive continuous erosion controller.
   One visible-session clock; deterministic fractures, connected chips/seams.
   Updates only small SVG paths and archive paper contours — never map tiles. */
(() => {
    'use strict';
    const STORAGE_KEY = 'ruin-archive-visible-weathering-v473';
    const marks = [55000, 115000, 185000, 265000, 360000, 465000, 585000, 735000];
    const terminal = marks[marks.length - 1];
    let elapsed = 0;
    try { elapsed = Math.max(0, Math.min(terminal, Number(sessionStorage.getItem(STORAGE_KEY)) || 0)); }
    catch (_) {}
    let stage = marks.filter(t => elapsed >= t).length;
    let lastTime = performance.now();
    let lastSave = 0;
    const chipRegistry = new Map();
    const archives = new WeakMap();
    const trackedArchiveDocs = new Set();
    const drawerStates = new WeakMap();
    const trackedDrawers = new Set();

    const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
    const mix = (a, b, t) => a + (b - a) * t;
    const hash = str => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    };
    const xy = p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`;
    const pathD = pts => pts.map((p, i) =>
        `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const polygon = pts => `polygon(${pts.map(xy).join(', ')})`;
    const project = (p, a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y;
        const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / Math.max(1, dx * dx + dy * dy));
        return { x: a.x + dx * t, y: a.y + dy * t };
    };
    const morph = (a, b, p) => a.map((v, i) => ({
        x: mix(v.x, b[i].x, p), y: mix(v.y, b[i].y, p)
    }));

    function archiveLabel(path) {
        const doc = path.closest('.archive-doc');
        if (doc) {
            const stack = doc.closest('#stack-record, #stack-garden');
            return `${stack?.id || 'archive'}:${Array.prototype.indexOf.call(doc.parentNode?.children || [], doc)}`;
        }
        return '';
    }
    function identity(path) {
        const pair = path.dataset.ruinAgePair;
        const svg = path.closest('svg');
        const owner = svg?.getAttribute('class') || '';
        if (pair) return `${owner}:${archiveLabel(path)}:${pair}`;
        return `${owner}:${archiveLabel(path)}:${path.getAttribute('class')}:${path.getAttribute('d')}`;
    }
    function entryFor(key, paired = false) {
        if (chipRegistry.has(key)) return chipRegistry.get(key);
        let birth, duration;
        if (paired) {
            birth = stage ? marks[stage - 1] : 0;
            duration = 36000;
        } else {
            birth = terminal * (0.008 + (hash(key) / 4294967295) * 0.66);
            duration = terminal * 0.25;
        }
        const entry = { birth, duration };
        chipRegistry.set(key, entry);
        return entry;
    }

    function revealCracks() {
        const active = document.querySelectorAll(
            '.ruin-fracture-overlay path.ruin-fracture-crack:not(.ruin-fracture-border), ' +
            '#mobile-outer-rim path.mobile-outer-rim-crack, ' +
            '#mobile-fracture-shell path.mobile-side-inner-crack, ' +
            '.ruin-fracture-compass-chip, .ruin-age-chip-contour, ' +
            '#index-stone-fragment-layer path.index-stone-fragment-face'
        );
        active.forEach(path => {
            if (!path.isConnected) return;
            const outline = path.classList.contains('ruin-age-chip-contour');
            const corner = path.classList.contains('ruin-fracture-compass-chip');
            const stone = path.classList.contains('index-stone-fragment-face');
            const key = identity(path);
            const age = entryFor(key, Boolean(path.dataset.ruinAgePair) || stone);
            const prog = clamp((elapsed - age.birth) / age.duration);
            if ((outline || corner) && !path.dataset.ruinFullContour) {
                const vals = [...(path.getAttribute('d') || '').matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)];
                const pts = vals.map(m => ({x: Number(m[1]), y: Number(m[2])}));
                // Preserve closed outlines and tiny structural bones intact.
                if (pts.length >= 4) {
                    const a = pts[0], b = pts[pts.length - 1];
                    const len = Math.hypot(b.x - a.x, b.y - a.y);
                    if (len > 12) {
                        const line = pts.map(p => project(p, a, b));
                        path.__ruinContour = {full: pts, line};
                        path.dataset.ruinFullContour = 'yes';
                    }
                }
            }
            if (path.__ruinContour) {
                // The notch MOVES into the stone while its paired crack draws.
                path.setAttribute('d', pathD(morph(
                    path.__ruinContour.line, path.__ruinContour.full, prog
                )));
                return;
            }
            if (typeof path.getTotalLength !== 'function') return;
            let length = Number(path.dataset.ruinAgeLength);
            if (!(length > 0)) {
                try { length = path.getTotalLength(); } catch (_) { return; }
                if (!(length > 0) || !Number.isFinite(length)) return;
                path.dataset.ruinAgeLength = String(length);
                path.style.strokeDasharray = `${length.toFixed(2)} ${length.toFixed(2)}`;
                // Allow the original source SVG to lay out, then keep the
                // full-length stroke suppressed before its first visible paint.
                requestAnimationFrame(() => {
                    if (path.isConnected) path.classList.add('ruin-age-revealing');
                });
            }
            path.style.strokeDashoffset = (length * (1 - prog)).toFixed(2);
        });
        updateArchiveClips();
        updateDrawerClips();
    }

    function registerArchiveChip(doc, finalPoints, side) {
        if (!doc || !finalPoints?.length) return false;
        const whole = finalPoints.map(p => ({x:p.x,y:p.y}));
        const n = whole.length;
        // addNaturalChipSegment supplies edgePoints; the remaining four
        // points close the original sheet.  Only chip-edge points withdraw.
        const first = side === 'top' ? 0 : side === 'right' ? 2 : 4;
        const last = Math.max(first, n - 4 + first);
        const w = doc.offsetWidth || 240;
        const old = archives.get(doc);
        const stageChanged = !old || old.stage !== stage || old.side !== side;
        const base = whole.map((p, i) => {
            if (i < first || i >= last) return {...p};
            if (side === 'top') return {...p, y: .5};
            if (side === 'right') return {...p, x: w - .5};
            return {...p, x: .5};
        });
        const birth = stageChanged ? (stage ? marks[stage - 1] : 0) : old.birth;
        const existing = {stage, side, birth, duration: 34000, base, full: whole};
        archives.set(doc, existing);
        trackedArchiveDocs.add(doc);
        doc.classList.add('ruin-age-archive-chip');
        const now = clamp((elapsed - birth) / existing.duration);
        applyArchiveClip(doc, morph(base, whole, now));
        return true;
    }

    function applyArchiveClip(doc, pts) {
        const clip = polygon(pts);
        if (doc.style.clipPath !== clip) {
            doc.style.clipPath = clip;
            doc.style.webkitClipPath = clip;
            doc.style.setProperty('--archive-doc-shape-clip', clip);
        }
    }
    function updateArchiveClips() {
        for (const doc of trackedArchiveDocs) {
            if (!doc.isConnected) { trackedArchiveDocs.delete(doc); continue; }
            const e = archives.get(doc);
            if (!e) continue;
            const t = clamp((elapsed - e.birth) / e.duration);
            if (t > 0 && t < 1 || doc.dataset.ruinAgeClipDone !== String(e.stage)) {
                applyArchiveClip(doc, morph(e.base, e.full, t));
                if (t >= 1) doc.dataset.ruinAgeClipDone = String(e.stage);
            }
        }
    }

    // Index Drawer: three existing shell edges plus their original endpoints.
    // A new pit is initially projected onto its INTACT segment, while an old
    // pit stays at full depth when the next damage stage starts.
    function registerDrawerShell(drawer, data) {
        if (!drawer || !data) return false;
        const names = ['leftEdge','topEdge','rightEdge'];
        const pairs = [
            [data.leftStart,data.leftTop],
            [data.leftTop,data.rightTop],
            [data.rightTop,data.rightEnd]
        ];
        const previous = drawerStates.get(drawer);
        const full = [], base = [];
        for (let side = 0; side < names.length; side++) {
            const pts = data[names[side]].slice(side ? 1 : 0);
            const oldPts = previous?.sections?.[side];
            const stable = oldPts && oldPts.length === data[names[side]].length &&
                oldPts.every((p,i) => {
                    const q = data[names[side]][i];
                    return Math.abs(p.x-q.x)+Math.abs(p.y-q.y) < .05;
                });
            pts.forEach(pt => {
                full.push({...pt});
                base.push(stable ? {...pt} : project(pt, ...pairs[side]));
            });
        }
        const birth = previous?.stage === stage ? previous.birth : stage ? marks[stage-1] : 0;
        drawerStates.set(drawer, {
            stage, birth, duration:32000, full, base,
            sections:names.map(n=>data[n].map(p=>({...p}))),
            outline:previous?.outline || null
        });
        trackedDrawers.add(drawer);
        updateDrawerClip(drawer);
        return true;
    }
    function attachDrawerOutline(drawer, path) {
        const state = drawerStates.get(drawer);
        if (state) { state.outline = path; updateDrawerClip(drawer); }
    }
    function updateDrawerClip(drawer) {
        const d = drawerStates.get(drawer);
        if (!d) return;
        const t = clamp((elapsed - d.birth) / d.duration);
        const pts = morph(d.base, d.full, t);
        const value = `polygon(${pts.map(xy).join(', ')}, 100% 100%, 0 100%)`;
        if (drawer.style.getPropertyValue('--index-drawer-shell-clip') !== value)
            drawer.style.setProperty('--index-drawer-shell-clip', value);
        if (d.outline?.isConnected) {
            const line = pathD(pts);
            if (d.outline.getAttribute('d') !== line) d.outline.setAttribute('d', line);
        }
    }
    function updateDrawerClips() {
        for (const drawer of trackedDrawers) {
            if (!drawer.isConnected) { trackedDrawers.delete(drawer); continue; }
            updateDrawerClip(drawer);
        }
    }

    function updateArchiveJitter() {
        document.querySelectorAll('#stack-record .archive-doc, #stack-garden .archive-doc').forEach((doc,index) => {
            const bx = Number(doc.dataset.ruinAgeBaseX || 0), by = Number(doc.dataset.ruinAgeBaseY || 0);
            const factor = .12 + .88 * stage / marks.length;
            const garden = Boolean(doc.closest('#stack-garden'));
            const extra = stage >= 4 && ((index * 7 + (garden ? 3 : 1)) % 13) < Math.min(6,stage - 3);
            const sx = bx ? Math.sign(bx) : (index % 2 ? 1 : -1);
            const sy = by ? Math.sign(by) : (index % 3 === 0 ? -1 : 1);
            const ex = extra ? sx * (.65 + (stage - 3) * .42) : 0;
            const ey = extra ? sy * Math.min(1.7, (stage - 3) * .3) : 0;
            doc.style.setProperty('--archive-paper-x-jitter', `${(bx*factor+ex).toFixed(2)}px`);
            doc.style.setProperty('--archive-paper-y-jitter', `${(by*factor+ey).toFixed(2)}px`);
        });
    }

    function save() {
        try { sessionStorage.setItem(STORAGE_KEY, String(Math.round(elapsed))); } catch (_) {}
        lastSave = elapsed;
    }
    function advance() {
        const now = performance.now();
        if (!document.hidden && document.body?.classList.contains('startup-complete')) {
            elapsed = Math.min(terminal, elapsed + Math.max(0,now-lastTime));
        }
        lastTime = now;
        const next = marks.filter(t=>elapsed>=t).length;
        if (next !== stage) {
            stage = next;
            document.documentElement.dataset.ruinWeatheringStage = String(stage);
            window.dispatchEvent(new CustomEvent('ruin-weathering-stage-change',{detail:{stage}}));
            updateArchiveJitter();
        }
        if (Math.abs(elapsed - lastSave) > 10000) save();
        revealCracks();
    }

    document.documentElement.dataset.ruinWeatheringStage = String(stage);
    document.addEventListener('visibilitychange', () => { advance(); save(); lastTime = performance.now(); });
    window.addEventListener('pagehide', save);
    window.addEventListener('pageshow', () => { lastTime=performance.now(); revealCracks(); });
    window.addEventListener('ruin-fracture-static-ready', () => requestAnimationFrame(revealCracks));
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(revealCracks),{once:true});
    window.setInterval(advance, 650);

    window.RuinWeathering = Object.freeze({
        get stage(){return stage;},
        get elapsed(){return elapsed;},
        revealCracks, updateArchiveJitter, registerArchiveChip,
        registerDrawerShell, attachDrawerOutline
    });
})();
