/* v473 · Ruin Archive visible-time weathering.
   Small, deterministic, gradual; never touches map, media or viewer state. */
(() => {
    'use strict';
    const STORAGE_KEY = 'ruin-archive-visible-weathering-v473';
    const marks = [55000, 115000, 185000, 265000, 360000, 465000, 585000, 735000];
    let elapsed = 0;
    try {
        elapsed = Math.max(0, Math.min(marks[marks.length - 1],
            Number(sessionStorage.getItem(STORAGE_KEY)) || 0));
    } catch (_) {}
    let stage = marks.filter(t => elapsed >= t).length;
    let lastTime = performance.now();

    const hash = value => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < value.length; i++) {
            h ^= value.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    };

    function revealCracks() {
        const fraction = Math.min(1, elapsed / marks[marks.length - 1]);
        document.querySelectorAll(
            '.ruin-fracture-overlay path.ruin-fracture-crack:not(.ruin-fracture-border), ' +
            '#mobile-outer-rim path.mobile-outer-rim-crack, ' +
            '#mobile-fracture-shell path.mobile-side-inner-crack'
        ).forEach(path => {
            if (!path.isConnected || typeof path.getTotalLength !== 'function') return;
            let length = Number(path.dataset.ruinAgeLength);
            if (!(length > 0)) {
                try { length = path.getTotalLength(); } catch (_) { return; }
                if (!Number.isFinite(length) || length <= 0) return;
                path.dataset.ruinAgeLength = String(length);
                path.style.strokeDasharray = `${length.toFixed(2)} ${length.toFixed(2)}`;
                path.classList.add('ruin-age-revealing');
            }
            let birth = Number(path.dataset.ruinAgeBirth);
            if (!path.hasAttribute('data-ruin-age-birth')) {
                birth = 0.015 + hash(
                    (path.getAttribute('d') || '') + (path.getAttribute('class') || '')
                ) / 4294967295 * 0.63;
                path.dataset.ruinAgeBirth = String(birth);
            }
            const visible = Math.max(0, Math.min(1, (fraction - birth) / 0.34));
            path.style.strokeDashoffset = (length * (1 - visible)).toFixed(2);
        });
    }

    function updateArchiveJitter() {
        document.querySelectorAll('#stack-record .archive-doc, #stack-garden .archive-doc').forEach((doc, index) => {
            // The original sparse offsets are saved on each physical sheet;
            // new drift is additive, so no sheet jumps back between stages.
            const bx = Number(doc.dataset.ruinAgeBaseX || 0);
            const by = Number(doc.dataset.ruinAgeBaseY || 0);
            const factor = 0.12 + 0.88 * stage / marks.length;
            const garden = Boolean(doc.closest('#stack-garden'));
            const extra = stage >= 4 &&
                ((index * 7 + (garden ? 3 : 1)) % 13) < Math.min(6, stage - 3);
            const ex = extra ? (index % 2 ? 1 : -1) * (0.65 + (stage - 3) * 0.42) : 0;
            const ey = extra ? (index % 3 === 0 ? -1 : 1) *
                Math.min(1.7, (stage - 3) * 0.3) : 0;
            doc.style.setProperty('--archive-paper-x-jitter', `${(bx * factor + ex).toFixed(2)}px`);
            doc.style.setProperty('--archive-paper-y-jitter', `${(by * factor + ey).toFixed(2)}px`);
        });
    }

    function advance() {
        const now = performance.now();
        if (!document.hidden && document.body?.classList.contains('startup-complete')) {
            elapsed = Math.min(marks[marks.length - 1], elapsed + Math.max(0, now - lastTime));
        }
        lastTime = now;
        try { sessionStorage.setItem(STORAGE_KEY, String(Math.round(elapsed))); } catch (_) {}
        const next = marks.filter(t => elapsed >= t).length;
        if (next !== stage) {
            stage = next;
            document.documentElement.dataset.ruinWeatheringStage = String(stage);
            window.dispatchEvent(new CustomEvent('ruin-weathering-stage-change', {
                detail: { stage }
            }));
            updateArchiveJitter();
        }
        revealCracks();
    }

    document.documentElement.dataset.ruinWeatheringStage = String(stage);
    document.addEventListener('visibilitychange', () => {
        lastTime = performance.now(); // hidden time is not counted
        advance();
    });
    window.addEventListener('pageshow', () => {
        lastTime = performance.now();
        advance();
    });
    window.addEventListener('ruin-fracture-static-ready', () =>
        requestAnimationFrame(revealCracks));
    window.setInterval(advance, 15000);

    window.RuinWeathering = Object.freeze({
        get stage() { return stage; },
        get elapsed() { return elapsed; },
        revealCracks,
        updateArchiveJitter
    });
})();
