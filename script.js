/* ========================================================================== 
   opt09 · MacBook 13 reference viewport / perceptual-size lock
   --------------------------------------------------------------------------
   1660×900 CSS px is the desktop composition master. Typography, controls and
   stroke weights remain in authored CSS pixels. Smaller desktop windows give
   up expendable air/gutters first; larger windows reveal more atlas instead of
   enlarging the interface. Mobile/compact-landscape stay on their own system.
   ========================================================================== */
const RUIN_REFERENCE_VIEWPORT = Object.freeze({ width: 1660, height: 900 });

function clampReferenceScale(value) {
    return Math.max(0.72, Math.min(1, value));
}

function syncReferenceViewportMetrics() {
    const root = document.documentElement;
    const widthRatio = window.innerWidth / RUIN_REFERENCE_VIEWPORT.width;
    const heightRatio = window.innerHeight / RUIN_REFERENCE_VIEWPORT.height;
    const desktop = window.innerWidth > 768 && window.innerHeight > 520;
    const geometryScale = desktop
        ? clampReferenceScale(Math.min(widthRatio, heightRatio))
        : 1;

    root.style.setProperty('--reference-geometry-scale', geometryScale.toFixed(4));
    root.style.setProperty('--reference-viewport-width', `${RUIN_REFERENCE_VIEWPORT.width}px`);
    root.style.setProperty('--reference-viewport-height', `${RUIN_REFERENCE_VIEWPORT.height}px`);
    root.style.setProperty('--reference-attachment-gutter', `${Math.round(423 * geometryScale)}px`);
    root.style.setProperty('--reference-edge-air', `${Math.round(28 * geometryScale)}px`);
    root.dataset.referenceDesktop = desktop ? 'true' : 'false';
    root.dataset.referenceScale = geometryScale.toFixed(4);

    window.__ruinReferenceViewport = {
        width: RUIN_REFERENCE_VIEWPORT.width,
        height: RUIN_REFERENCE_VIEWPORT.height,
        geometryScale,
        widthRatio,
        heightRatio
    };
}

let referenceViewportResizeRaf = 0;
function scheduleReferenceViewportMetrics() {
    cancelAnimationFrame(referenceViewportResizeRaf);
    referenceViewportResizeRaf = requestAnimationFrame(() => {
        referenceViewportResizeRaf = 0;
        syncReferenceViewportMetrics();
    });
}

syncReferenceViewportMetrics();
window.addEventListener('resize', scheduleReferenceViewportMetrics, { passive: true });


// ============================================================================
// opt16 · critical drawers first
// ----------------------------------------------------------------------------
// script.js now executes only after both drawer shells have been parsed.
// Prime their closed/ready state synchronously BEFORE Leaflet/map construction,
// so neither drawer waits for DOMContentLoaded, idle time, or the map startup.
// ============================================================================
function primeCriticalDrawerShells() {
    const archiveDrawer = document.getElementById('archive-drawer');
    const drawerMask = document.getElementById('drawer-mask');
    const indexDrawer = document.getElementById('index-drawer');

    if (archiveDrawer) {
        archiveDrawer.classList.remove('open');
        archiveDrawer.dataset.criticalReady = 'true';
    }
    if (drawerMask) drawerMask.classList.remove('show');
    if (indexDrawer) {
        indexDrawer.classList.remove('open');
        indexDrawer.dataset.criticalReady = 'true';
    }

    document.documentElement.dataset.criticalDrawersReady =
        archiveDrawer && indexDrawer ? 'true' : 'partial';
}

primeCriticalDrawerShells();


// UI init
document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('archive-drawer');
    const mask = document.getElementById('drawer-mask');

    if (drawer) drawer.classList.remove('open');
    if (mask) mask.classList.remove('show');

    let globalTopZIndex = 10000;


    function bringDrawerToFront(element) {
        if (!element) return;
        globalTopZIndex += 1;
        element.style.zIndex = globalTopZIndex;
    }

        function toggleIndexDrawerWithAnim() {
            const indexDrawer = document.getElementById('index-drawer');
            const decor = document.getElementById('drawer-opened-bottom-decor');
            const stacks = document.querySelectorAll('.file-stack');
            if (!indexDrawer) return;

            const isOpen = indexDrawer.classList.contains('open');

            if (!isOpen) {

                // If the user opens the drawer before the browser reached its
                // startup idle slices, finish the two invisible preparations now.
                window.ensureIndexStoneFragmentsReady?.();
                RuinFractureSystem?.ensureOpenedBottomDecorWear?.();

                stacks.forEach(s => s.classList.add('sink-down'));


                indexDrawer.classList.add('open');
                if (decor) decor.classList.add('show');
                if (typeof bringDrawerToFront === 'function') bringDrawerToFront(indexDrawer);


                setTimeout(() => {
                    stacks.forEach(s => {
                        s.classList.add('elevated-z');
                        s.classList.remove('sink-down');
                    });
                }, 400);
            } else {

                closeIndexDrawerWithAnim();
            }

        }

    function closeIndexDrawerWithAnim(skipRestore = false) {
        const indexDrawer = document.getElementById('index-drawer');
        const decor = document.getElementById('drawer-opened-bottom-decor');
        const stacks = document.querySelectorAll('.file-stack');


        stacks.forEach(s => s.classList.add('sink-down'));


        if (indexDrawer) indexDrawer.classList.remove('open');
        if (decor) decor.classList.remove('show');


        if (!skipRestore) {
            setTimeout(() => {
                stacks.forEach(s => {
                    s.classList.remove('elevated-z');
                    s.classList.remove('sink-down');
                });
            }, 400);
        }
    }
    window.bringDrawerToFront = bringDrawerToFront;
    window.toggleIndexDrawerWithAnim = toggleIndexDrawerWithAnim;
    window.closeIndexDrawerWithAnim = closeIndexDrawerWithAnim;

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });


    document.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });


    document.addEventListener('keydown', function (e) {
        if (
            (e.ctrlKey || e.metaKey) &&
            (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')
        ) {
            e.preventDefault();
        }
    });

    const indexDrawer = document.getElementById('index-drawer');


    const triggers = document.querySelectorAll('[id^="bottom-trigger-"], .bottom-trigger');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');


    [indexDrawer, drawerLeft, drawerRight].forEach(drawer => {
        if (drawer) {
            drawer.addEventListener('pointerdown', () => {
                bringDrawerToFront(drawer);
            });
        }
    });
    if (indexDrawer && triggers.length > 0) {
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const trigId = trigger.id;
                const drawerIsOpen = indexDrawer.classList.contains('open');

                if (trigId === 'bottom-center-label') {
                    if (isCompactViewport()) {
                        drawerIsOpen ? closeIndexDrawerWithAnim() : toggleIndexDrawerWithAnim();
                        return;
                    }
                    if (!drawerIsOpen) {
                        toggleIndexDrawerWithAnim();
                        return;
                    }
                    const langOrder = ['zh', 'en', 'ja'];
                    const raw = String(window.currentLang || document.documentElement.lang || 'zh').toLowerCase();
                    const current = raw.startsWith('ja') ? 'ja' : raw.startsWith('en') ? 'en' : 'zh';
                    const next = langOrder[(langOrder.indexOf(current) + 1) % langOrder.length];
                    if (typeof switchLanguage === 'function') switchLanguage(next);
                    return;
                }

                if (isCompactViewport()) {
                    /* pass4: the two side frames are archive pages, not menus.
                       Record / Ruin Garden labels are now quiet family labels and
                       never open a drawer by themselves. */
                    if (trigId === 'bottom-trigger-record' || trigId === 'bottom-trigger-ruin' ||
                        trigId === 'opened-trigger-record' || trigId === 'opened-trigger-ruin') {
                        return;
                    }
                }

                toggleIndexDrawerWithAnim();
            });
        });
    }

    if (indexDrawer) {
        indexDrawer.addEventListener('click', (e) => {
            if (indexDrawer.classList.contains('open')) return;
            if (e.target.closest('.bottom-trigger, #archive-add-link, .bottom-stele-lang-option, a, button')) return;
            toggleIndexDrawerWithAnim();
        });
    }

    document.addEventListener('click', (e) => {

        if (indexDrawer && indexDrawer.classList.contains('open')) {
            const isClickInsideDrawer =
                indexDrawer.contains(e.target);

            const isClickOnTrigger =
                Array.from(triggers).some(trigger =>
                    trigger.contains(e.target)
                );


            const isClickOnLanguage =
                document
                    .getElementById('language-switcher')
                    ?.contains(e.target);


            if (
                !isClickInsideDrawer &&
                !isClickOnTrigger &&
                !isClickOnLanguage
            ) {
                closeIndexDrawerWithAnim();
            }
        }
    });
});
// Viewport
function updateVH() {
    document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`
    );
}

let viewportHeightRaf = 0;
function scheduleViewportHeightUpdate() {
    if (viewportHeightRaf) return;
    viewportHeightRaf = requestAnimationFrame(() => {
        viewportHeightRaf = 0;
        updateVH();
    });
}

updateVH();
window.addEventListener('resize', scheduleViewportHeightUpdate, { passive: true });

const MOBILE_ATLAS_QUERY = '(max-width: 900px) and (min-height: 560px), (max-width: 950px) and (max-height: 560px)';
function isCompactViewport() {
    if (window.matchMedia) return window.matchMedia(MOBILE_ATLAS_QUERY).matches;
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    return (w <= 900 && h >= 560) || (w <= 950 && h <= 560);
}
window.MOBILE_ATLAS_QUERY = MOBILE_ATLAS_QUERY;
window.isCompactViewport = isCompactViewport;

// ==============================================================================
// v291-opt37 · compact performance profile
// ------------------------------------------------------------------------------
// Only the mobile branch can enter lite mode. Save-Data / modest memory / modest
// CPU devices get cheaper transient map compositing and lower-cost audio drawing,
// while the authored resting appearance remains intact.
// ==============================================================================
function isMobileLiteMode() {
    if (!isCompactViewport()) return false;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData);
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    return saveData || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4);
}
window.isMobileLiteMode = isMobileLiteMode;

function syncMobilePerformanceProfile() {
    const lite = isMobileLiteMode();
    document.documentElement.classList.toggle('mobile-lite', lite);
    document.documentElement.dataset.mobilePerformance = lite ? 'lite' : 'full';
}
syncMobilePerformanceProfile();
window.addEventListener('resize', syncMobilePerformanceProfile, { passive: true });

// ==============================================================================
// v291-opt05 · StartupIdleQueue
// ------------------------------------------------------------------------------
// Spread decorative / non-critical startup work across genuine idle slices.
// One task runs per idle turn; language decoding and map zoom gestures always
// take priority.  This keeps the authored startup behavior intact while
// avoiding the old 300ms / 800ms / 1000ms CPU/GPU pile-up.
// ==============================================================================
const StartupIdleQueue = (() => {
    const tasks = new Map();
    let idleHandle = null;
    let timerHandle = null;

    const now = () => (window.performance?.now ? performance.now() : Date.now());
    const isBusy = () => Boolean(window.__cyberDecodeActive || window.__startupMapBusy);

    function clearPumpHandles() {
        if (idleHandle !== null && 'cancelIdleCallback' in window) {
            try { cancelIdleCallback(idleHandle); } catch (_) {}
        }
        if (timerHandle !== null) window.clearTimeout(timerHandle);
        idleHandle = null;
        timerHandle = null;
    }

    function requestPump(delay = 0) {
        if (!tasks.size || idleHandle !== null || timerHandle !== null) return;
        if (delay > 0) {
            timerHandle = window.setTimeout(() => {
                timerHandle = null;
                requestPump(0);
            }, delay);
            return;
        }

        if ('requestIdleCallback' in window) {
            idleHandle = requestIdleCallback(runOne, { timeout: 1200 });
        } else {
            timerHandle = window.setTimeout(() => {
                timerHandle = null;
                runOne({ didTimeout: true, timeRemaining: () => 12 });
            }, 48);
        }
    }

    function nextEligibleTask() {
        const t = now();
        const ready = [...tasks.entries()]
            .filter(([, task]) => task.earliestAt <= t)
            .sort((a, b) => (b[1].priority - a[1].priority) || (a[1].order - b[1].order));
        return ready[0] || null;
    }

    function nextDelay() {
        if (!tasks.size) return 0;
        const t = now();
        let earliest = Infinity;
        tasks.forEach(task => { earliest = Math.min(earliest, task.earliestAt); });
        return Math.max(0, Math.min(250, earliest - t));
    }

    let orderCounter = 0;
    function runOne(deadline) {
        idleHandle = null;
        timerHandle = null;
        if (!tasks.size) return;

        // Never force decorative startup work through a language decode or map
        // zoom merely because requestIdleCallback timed out. Wait for the next
        // calm slice instead.
        if (isBusy()) {
            requestPump(120);
            return;
        }

        const entry = nextEligibleTask();
        if (!entry) {
            requestPump(nextDelay());
            return;
        }

        const [key, task] = entry;
        const remaining = typeof deadline?.timeRemaining === 'function' ? deadline.timeRemaining() : 12;
        if (!deadline?.didTimeout && remaining < task.minRemaining) {
            requestPump(48);
            return;
        }

        tasks.delete(key);
        try {
            task.fn(deadline);
        } catch (error) {
            console.error('[StartupIdleQueue]', key, error);
        }

        // Intentionally yield between tasks even if the browser reports more
        // idle budget. This is the actual peak-splitting behavior.
        if (tasks.size) requestPump(36);
    }

    function schedule(key, fn, options = {}) {
        if (!key || typeof fn !== 'function') return;
        const delay = Math.max(0, Number(options.delay) || 0);
        tasks.set(key, {
            fn,
            earliestAt: now() + delay,
            priority: Number(options.priority) || 0,
            minRemaining: Math.max(1, Number(options.minRemaining) || 7),
            order: ++orderCounter
        });
        requestPump(delay > 0 ? Math.min(delay, 250) : 0);
    }

    function flush(key) {
        const task = tasks.get(key);
        if (!task) return false;
        tasks.delete(key);
        try { task.fn({ didTimeout: true, timeRemaining: () => 50 }); }
        catch (error) { console.error('[StartupIdleQueue]', key, error); }
        if (tasks.size) requestPump(0);
        return true;
    }

    function cancel(key) {
        tasks.delete(key);
        if (!tasks.size) clearPumpHandles();
    }

    function kick() {
        if (timerHandle !== null) {
            window.clearTimeout(timerHandle);
            timerHandle = null;
        }
        requestPump(0);
    }

    document.addEventListener('languagechange-complete', kick);
    window.addEventListener('pageshow', kick, { passive: true });

    return { schedule, flush, cancel, kick, get size() { return tasks.size; } };
})();
window.StartupIdleQueue = StartupIdleQueue;
window.__startupMapBusy = false;

// ==============================================================================
// v77 · Shared reading environment
// ----------------------------------------------------------------------------
// Main atlas now shares the same localStorage key used by Manifesto/Mechanics:
//     ruin-reader-tone
//
// 0   = original paper-white archive
// 45  = warm eye-care paper
// 100 = low-contrast charcoal night archive
//
// Only the UI + authored atlas membrane change tone. Real photos, video,
// PDFs and attachment media are not inverted.
// ============================================================================
const READER_TONE_KEY = 'ruin-reader-tone';
const READER_WARM_POINT = 45;
const READER_TONE_STEPS = Object.freeze([0, 22, 45, 60, 100]);

const READER_PALETTES = Object.freeze({
    paper: {
        bg: [255, 255, 251],
        paper: [255, 255, 251],
        text: [28, 28, 26],
        muted: [103, 103, 97],
        faint: [169, 169, 160],
        line: [205, 205, 197],
        lineStrong: [102, 102, 96],
        marker: [17, 17, 17],
        shadow: [0, 0, 0, 0.12],
        thumbBrightness: 1,
        thumbContrast: 1,
        mineFace: [224, 224, 219, 0.48],
        mineHover: [235, 235, 231, 0.68],
        mineActive: [211, 211, 206, 0.54],
        mineHi: [255, 255, 255, 0.98],
        mineLo: [82, 82, 78, 0.58],
        mineActiveHi: [0, 0, 0, 0.30],
        mineActiveLo: [255, 255, 255, 0.94]
    },
    warm: {
        bg: [235, 227, 209],
        paper: [243, 235, 218],
        text: [50, 47, 42],
        muted: [103, 96, 84],
        faint: [159, 150, 132],
        line: [193, 183, 161],
        lineStrong: [112, 105, 91],
        marker: [57, 52, 44],
        shadow: [58, 48, 35, 0.12],
        thumbBrightness: 0.93,
        thumbContrast: 0.98,
        mineFace: [207, 199, 181, 0.62],
        mineHover: [221, 212, 193, 0.76],
        mineActive: [190, 181, 163, 0.66],
        mineHi: [249, 242, 225, 0.92],
        mineLo: [105, 96, 82, 0.62],
        mineActiveHi: [86, 79, 68, 0.56],
        mineActiveLo: [244, 236, 217, 0.88]
    },
    night: {
        bg: [25, 26, 24],
        paper: [31, 32, 30],
        text: [204, 201, 191],
        muted: [143, 141, 133],
        faint: [86, 87, 81],
        line: [66, 67, 62],
        lineStrong: [121, 120, 112],
        marker: [202, 199, 188],
        shadow: [0, 0, 0, 0.28],
        thumbBrightness: 0.70,
        thumbContrast: 0.94,
        /* Night keeps the old minesweeper relation inverted:
           the key face is a medium gray visibly LIGHTER than the charcoal page. */
        mineFace: [72, 73, 68, 0.82],
        mineHover: [88, 89, 83, 0.90],
        mineActive: [60, 61, 57, 0.88],
        mineHi: [120, 121, 113, 0.84],
        mineLo: [38, 39, 36, 0.92],
        mineActiveHi: [38, 39, 36, 0.94],
        mineActiveLo: [112, 113, 105, 0.86]
    }
});

let readerToneValue = 0;
let readerToneMapRefresh = null;
let readerToneAnimationFrame = 0;

function clampReaderTone(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function readerToneMix(a, b, t) {
    return a + (b - a) * t;
}

function readerToneMixArray(a, b, t) {
    return a.map((value, index) => readerToneMix(value, b[index], t));
}

function readerToneInterpolate(value, key) {
    const tone = clampReaderTone(value);

    if (tone <= READER_WARM_POINT) {
        const t = tone / READER_WARM_POINT;
        const a = READER_PALETTES.paper[key];
        const b = READER_PALETTES.warm[key];
        return Array.isArray(a)
            ? readerToneMixArray(a, b, t)
            : readerToneMix(a, b, t);
    }

    const t = (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT);
    const a = READER_PALETTES.warm[key];
    const b = READER_PALETTES.night[key];

    return Array.isArray(a)
        ? readerToneMixArray(a, b, t)
        : readerToneMix(a, b, t);
}

function readerRgb(values) {
    return `rgb(${values.slice(0, 3).map(v => Math.round(v)).join(', ')})`;
}

function readerRgba(values, alphaOverride = null) {
    const alpha = alphaOverride == null
        ? (values.length > 3 ? values[3] : 1)
        : alphaOverride;

    return `rgba(${values.slice(0, 3).map(v => Math.round(v)).join(', ')}, ${Math.max(0, Math.min(1, alpha)).toFixed(4)})`;
}

function readReaderTone() {
    try {
        const saved = localStorage.getItem(READER_TONE_KEY);
        if (saved !== null && saved !== '') return clampReaderTone(saved);
    } catch (_) {}
    return 0;
}

function saveReaderTone(value) {
    try {
        localStorage.setItem(READER_TONE_KEY, String(Math.round(clampReaderTone(value))));
    } catch (_) {}
}

function getNearestReaderToneStep(value) {
    const tone = clampReaderTone(value);
    return READER_TONE_STEPS.reduce((closest, step) =>
        Math.abs(step - tone) < Math.abs(closest - tone) ? step : closest,
    READER_TONE_STEPS[0]);
}

function updateReaderToneButtons(value) {
    const group = document.getElementById('main-reader-tone-steps');
    if (!group) return;

    const nearest = getNearestReaderToneStep(value);
    const buttons = [...group.querySelectorAll('.tone-step-button[data-tone]')];
    buttons.forEach((button, index) => {
        const step = clampReaderTone(button.dataset.tone);
        const active = Math.abs(step - nearest) < 0.5;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-checked', active ? 'true' : 'false');
        button.tabIndex = active ? 0 : -1;
        button.dataset.active = active ? 'true' : 'false';
        if (!button.dataset.toneIndex) button.dataset.toneIndex = String(index);
    });
    group.dataset.activeTone = String(nearest);
    group.setAttribute('aria-valuetext', String(nearest));
}

function animateReaderToneTo(value, persist = true) {
    const target = clampReaderTone(value);
    if (readerToneAnimationFrame) cancelAnimationFrame(readerToneAnimationFrame);

    const start = readerToneValue;
    const delta = target - start;
    const duration = Math.abs(delta) < 1 ? 0 : 260;

    if (!duration) {
        applyReaderTone(target, persist);
        return;
    }

    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);

    const tick = now => {
        const raw = Math.min(1, (now - t0) / duration);
        const eased = ease(raw);
        applyReaderTone(start + delta * eased, raw >= 1 && persist);
        if (raw < 1) {
            readerToneAnimationFrame = requestAnimationFrame(tick);
        } else {
            readerToneAnimationFrame = 0;
            }
    };

    readerToneAnimationFrame = requestAnimationFrame(tick);
}

function applyReaderTone(value, persist = false) {
    const tone = clampReaderTone(value);
    readerToneValue = tone;

    const root = document.documentElement;
    const bg = readerToneInterpolate(tone, 'bg');
    const paper = readerToneInterpolate(tone, 'paper');
    const text = readerToneInterpolate(tone, 'text');
    const muted = readerToneInterpolate(tone, 'muted');
    const faint = readerToneInterpolate(tone, 'faint');
    const line = readerToneInterpolate(tone, 'line');
    const lineStrong = readerToneInterpolate(tone, 'lineStrong');
    const marker = readerToneInterpolate(tone, 'marker');
    const shadow = readerToneInterpolate(tone, 'shadow');

    root.style.setProperty('--reader-bg', readerRgb(bg));
    root.style.setProperty('--reader-paper', readerRgb(paper));
    root.style.setProperty('--reader-paper-95', readerRgba(paper, 0.95));
    root.style.setProperty('--reader-paper-90', readerRgba(paper, 0.90));
    root.style.setProperty('--reader-paper-85', readerRgba(paper, 0.85));
    root.style.setProperty('--reader-paper-80', readerRgba(paper, 0.80));
    root.style.setProperty('--reader-paper-55', readerRgba(paper, 0.55));
    root.style.setProperty('--reader-paper-30', readerRgba(paper, 0.30));

    root.style.setProperty('--reader-text', readerRgb(text));
    root.style.setProperty('--reader-text-85', readerRgba(text, 0.85));
    root.style.setProperty('--reader-text-67', readerRgba(text, 0.67));

    // opt25 · Popup typography keeps the original paper-mode request exactly:
    // 90% black. Through eye-care/night it follows the reader palette smoothly.
    const popupText = tone <= READER_WARM_POINT
        ? readerToneMixArray(
            [0, 0, 0],
            READER_PALETTES.warm.text,
            tone / READER_WARM_POINT
        )
        : readerToneMixArray(
            READER_PALETTES.warm.text,
            READER_PALETTES.night.text,
            (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT)
        );
    root.style.setProperty('--reader-popup-text', readerRgba(popupText, 0.90));
    root.style.setProperty('--reader-muted', readerRgb(muted));
    root.style.setProperty('--reader-muted-70', readerRgba(muted, 0.70));
    root.style.setProperty('--reader-faint', readerRgb(faint));
    root.style.setProperty('--reader-line', readerRgb(line));
    root.style.setProperty('--reader-line-strong', readerRgb(lineStrong));
    root.style.setProperty('--reader-marker', readerRgb(marker));
    root.style.setProperty('--reader-marker-soft', readerRgba(marker, 0.20));
    root.style.setProperty('--reader-shadow', readerRgba(shadow));

    // opt18 · ACTUAL navigation compass (large draggable ring), not the
    // top-right Compass Module. Preserve its original transparency while
    // letting its strokes/text follow the eye-care/night palette.
    root.style.setProperty('--reader-nav-compass-handle-bg', readerRgba(paper, 0.10));
    root.style.setProperty('--reader-nav-compass-line', readerRgba(text, 0.67));
    root.style.setProperty('--reader-nav-compass-faint', readerRgba(muted, 0.54));

    root.style.setProperty(
        '--reader-thumb-brightness',
        readerToneInterpolate(tone, 'thumbBrightness').toFixed(4)
    );
    root.style.setProperty(
        '--reader-thumb-contrast',
        readerToneInterpolate(tone, 'thumbContrast').toFixed(4)
    );

    root.style.setProperty('--reader-mine-face', readerRgba(readerToneInterpolate(tone, 'mineFace')));
    root.style.setProperty('--reader-mine-hover', readerRgba(readerToneInterpolate(tone, 'mineHover')));
    root.style.setProperty('--reader-mine-active', readerRgba(readerToneInterpolate(tone, 'mineActive')));
    root.style.setProperty('--reader-mine-hi', readerRgba(readerToneInterpolate(tone, 'mineHi')));
    root.style.setProperty('--reader-mine-lo', readerRgba(readerToneInterpolate(tone, 'mineLo')));
    root.style.setProperty('--reader-mine-active-hi', readerRgba(readerToneInterpolate(tone, 'mineActiveHi')));
    root.style.setProperty('--reader-mine-active-lo', readerRgba(readerToneInterpolate(tone, 'mineActiveLo')));

    const toneUnit = tone / 100;
    root.style.setProperty('--index-drawer-frost-bg', readerRgba(paper, readerToneMix(0.76, 0.82, toneUnit)));
    root.style.setProperty('--index-drawer-frost-brightness', readerToneMix(1.00, 0.90, toneUnit).toFixed(4));
    const indexDrawerFrameStroke = readerRgba(lineStrong, readerToneMix(0.42, 0.84, toneUnit));
    root.style.setProperty('--index-drawer-frame-stroke', indexDrawerFrameStroke);
    // v290 · "inner frame" means the actual map inner-frame line, which uses
    // --reader-line-strong at full opacity. Keep the drawer frame itself as-is,
    // but let every crack/seam use that exact full-strength colour.
    const indexDrawerCrackStroke = readerRgb(lineStrong);
    root.style.setProperty('--index-drawer-crack-stroke', indexDrawerCrackStroke);
    root.style.setProperty('--index-drawer-crack-detail-stroke', indexDrawerCrackStroke);

    // v269 · Generated stone fragments use the same continuous paper → warm →
    // night palette as the rest of the archive. The slab remains translucent so
    // the map is still perceptible through the frosted surface, while darker
    // reading modes increase density just enough to keep the text calm/readable.
    root.style.setProperty('--index-stone-frost-bg', readerRgba(paper, readerToneMix(0.68, 0.78, toneUnit)));
    root.style.setProperty('--index-stone-face-wash', readerRgba(paper, readerToneMix(0.16, 0.24, toneUnit)));
    // v290 · generated stone-fragment seams are the large diagonal lines that
    // are actually visible in the current drawer. Match them to the map inner
    // frame too, rather than the older translucent stone-outline palette.
    root.style.setProperty('--index-stone-outline', readerRgb(lineStrong));
    root.style.setProperty('--index-stone-immune-bg', readerRgba(paper, readerToneMix(0.84, 0.90, toneUnit)));
    root.style.setProperty('--index-stone-frost-brightness', readerToneMix(1.02, 0.92, toneUnit).toFixed(4));

    // External-SVG fallback cannot inherit CSS variables into the referenced
    // file. Give that path its own tone filter so file:// / failed-fetch tests
    // still invert the authored black linework in darker modes.
    const drawerNightT = tone <= READER_WARM_POINT
        ? 0
        : (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT);
    const drawerWarmT = Math.min(1, tone / READER_WARM_POINT);
    root.style.setProperty(
        '--index-drawer-fallback-filter',
        `sepia(${(0.18 * drawerWarmT * (1 - drawerNightT)).toFixed(3)}) ` +
        `invert(${(0.92 * drawerNightT).toFixed(3)}) ` +
        `brightness(${readerToneMix(1.00, 1.16, drawerNightT).toFixed(3)}) ` +
        `contrast(${readerToneMix(1.00, 0.92, drawerNightT).toFixed(3)})`
    );

    root.dataset.readerToneValue = String(Math.round(tone));
    root.style.setProperty('--reader-tone-pct', `${tone.toFixed(2)}%`);
    root.style.setProperty('--reader-tone-unit', toneUnit.toFixed(4));
    root.style.colorScheme = tone >= 67 ? 'dark' : 'light';

    updateReaderToneButtons(tone);

    if (persist) saveReaderTone(tone);
    if (readerToneMapRefresh) readerToneMapRefresh();

    window.dispatchEvent(new CustomEvent('ruinreaderchange', {
        detail: { value: tone }
    }));
}


function bindMainReaderTone() {
    const group = document.getElementById('main-reader-tone-steps');
    if (!group) return;

    const buttons = [...group.querySelectorAll('.tone-step-button[data-tone]')];
    updateReaderToneButtons(readerToneValue);

    buttons.forEach((button, index) => {
        button.dataset.toneIndex = String(index);

        button.addEventListener('click', () => {
            animateReaderToneTo(button.dataset.tone, true);
        });

        button.addEventListener('keydown', event => {
            const current = Number(button.dataset.toneIndex || index);
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                const next = buttons[Math.min(buttons.length - 1, current + 1)];
                next?.focus();
                animateReaderToneTo(next?.dataset.tone ?? button.dataset.tone, true);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                const prev = buttons[Math.max(0, current - 1)];
                prev?.focus();
                animateReaderToneTo(prev?.dataset.tone ?? button.dataset.tone, true);
            } else if (event.key === 'Home') {
                event.preventDefault();
                buttons[0]?.focus();
                animateReaderToneTo(buttons[0]?.dataset.tone ?? 0, true);
            } else if (event.key === 'End') {
                event.preventDefault();
                buttons[buttons.length - 1]?.focus();
                animateReaderToneTo(buttons[buttons.length - 1]?.dataset.tone ?? 100, true);
            } else if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                animateReaderToneTo(button.dataset.tone, true);
            }
        });
    });
}
// Apply the saved cross-page preference before Leaflet builds the atlas.
applyReaderTone(readReaderTone(), false);
bindMainReaderTone();


const width = 4000;
const height = 3000;
let focusLocked = false;
let isClosingViewer = false;
let currentVideo = null;
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let activePdfLoadingTask = null;
let pdfJsLoadPromise = null;

function ensurePdfJsLoaded() {
    if (window.pdfjsLib) {
        if (window.pdfjsLib.GlobalWorkerOptions) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
        return Promise.resolve(window.pdfjsLib);
    }
    if (pdfJsLoadPromise) return pdfJsLoadPromise;

    pdfJsLoadPromise = new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        tag.async = true;
        tag.onload = () => {
            if (!window.pdfjsLib) {
                pdfJsLoadPromise = null;
                reject(new Error('PDF.js did not initialize'));
                return;
            }
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        tag.onerror = () => {
            pdfJsLoadPromise = null;
            reject(new Error('PDF.js failed to load'));
        };
        document.head.appendChild(tag);
    });
    return pdfJsLoadPromise;
}

// PDF / TXT inline translation
const DOCUMENT_TRANSLATION_ENDPOINT = 'https://ruin-archive-translation.lliquidcat.workers.dev/translate';
const documentTranslationCache = new Map();
let activeAttachmentId = null;
let activeAttachmentItem = null;
let activeTextSource = '';
let activePdfTextBlocks = [];
let documentTranslationToken = 0;
let documentTranslationEnabled = false;
let documentTranslationUserChoice = null;
let currentImageGroup = [];
let currentImageIndex = -1;
let pdfFitMode = true;
let pdfFitRenderToken = 0;
const PDF_FIT_PADDING = 0.90;
const PDF_MAX_OUTPUT_SCALE = 2;
const defaultViewerState = {
  zoom: 1,
  x: 0,
  y: 0,
  rotX: -12,
  rotY: 18,
  rotZ: 0,
  flipped: false
};
document.addEventListener('DOMContentLoaded', () => {
const chapterToggle =
  document.querySelector("#chapter-toggle");

const videoChapters =
  document.querySelector(".video-chapters");

if (chapterToggle && videoChapters) {

  chapterToggle.addEventListener("click", () => {

    videoChapters.classList.toggle("open");

  });

    const closeBtns = document.querySelectorAll('.btn-close-drawer');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeIndexDrawerWithAnim();
        });
    });

}
    const scoreHUD = document.getElementById('score-hud');
    const scoreHUDShadow = document.getElementById('score-hud-shadow');

    if (scoreHUD) {
        const maxMovePx = 15;
        let hudMoveRaf = null;


        let lastMouseX = 0;
        let lastMouseY = 0;


        scoreHUD.addEventListener('mousemove', (e) => {
            if (focusLocked) return;

            const clientX = e.clientX;
            const clientY = e.clientY;


            if (Math.abs(clientX - lastMouseX) < 2 && Math.abs(clientY - lastMouseY) < 2) {
                return;
            }
            lastMouseX = clientX;
            lastMouseY = clientY;


            if (hudMoveRaf) return;
            hudMoveRaf = requestAnimationFrame(() => {
                const rect = scoreHUD.getBoundingClientRect();


                const localX = clientX - rect.left;
                const localY = clientY - rect.top;

                const triggerZoneX = rect.width * 0.125;
                const triggerZoneY = rect.height * 0.9;

                const mouseXPercent = localX / rect.width - 0.5;
                const mouseYPercent = localY / rect.height - 0.5;

                const moveX = mouseXPercent * maxMovePx;
                const moveY = mouseYPercent * maxMovePx;

                scoreHUD.style.setProperty('transition', 'opacity 1.2s ease-out, transform 0s linear', 'important');

                if (!focusLocked) {
                    scoreHUD.style.setProperty(
                        'transform',
                        `translate(${moveX}px, ${moveY}px)`
                    );
                }


                if (localX < triggerZoneX && localY > triggerZoneY && !focusLocked) {
                    focusLocked = true;

                    scoreHUD.style.setProperty('transition', 'transform .22s cubic-bezier(.17,.84,.44,1)', 'important');
                    scoreHUD.style.setProperty('transform', 'translate(-12px, 17px)', 'important');

                    scoreHUD.classList.add('magnetic-lock');
                    scoreHUDShadow.classList.add('locked');

                    triggerFocusConfirm();
                }

                hudMoveRaf = null;
            });
        });


        scoreHUD.addEventListener('mouseleave', () => {
            if (!focusLocked) {
                scoreHUD.style.setProperty(
                    'transition',
                    'opacity 1.2s ease-out, transform 0.8s cubic-bezier(0.25,1,0.5,1)',
                    'important'
                );
                scoreHUD.style.setProperty(
                    'transform',
                    'translate(0px,0px)',
                    'important'
                );
            }
        });
    }

  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
    }
    if (scoreHUDShadow) {
        scoreHUDShadow.style.display = 'none';
        scoreHUDShadow.classList.remove('locked');
    }
});
function triggerFocusConfirm() {

    const shadow =
        document.getElementById(
            'score-hud-shadow'
        );

    if (!shadow) return;

    shadow.classList.remove(
        'focus-confirm'
    );

    void shadow.offsetWidth;

    shadow.classList.add(
        'focus-confirm'
    );

}


const geoScale = 1.0;
const worldScale = 1.0;
const offsetX = 0;
const offsetY = 0;


// Map
const mapLiteModeAtBoot = Boolean(window.isMobileLiteMode?.());
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1.8,
    maxZoom: 8,
    zoomControl: false,
    attributionControl: false,
    // Low-power compact devices keep the same navigation semantics but avoid
    // Leaflet's extra zoom/fade animation layers and inertial repaint tail.
    inertia: !mapLiteModeAtBoot,
    zoomAnimation: !mapLiteModeAtBoot,
    fadeAnimation: !mapLiteModeAtBoot,
    markerZoomAnimation: !mapLiteModeAtBoot,
});

// v291-opt52 · Compass travel should read as a deliberate atlas movement,
// not a UI snap. Keep every Compass-owned fly at or above four seconds.
const COMPASS_FLY_DURATION = 4.4;

const bounds = [
    [0, 0],
    [height, width]
];

// Horizontal world wrap -------------------------------------------------
// The atlas is a cylindrical world: the right edge continues directly
// into the left edge. Three visual copies give Leaflet enough runway for
// drags and flyTo animations across the seam; the center is recentered only
// after it has travelled half a world beyond the canonical copy.
const WORLD_WIDTH = width;
const WORLD_COPY_OFFSETS = [-1, 0, 1];
const WORLD_WRAP_MIN = -WORLD_WIDTH * 0.5;
const WORLD_WRAP_MAX = WORLD_WIDTH * 1.5;
const WORLD_VERTICAL_MARGIN = width / 8;
let worldRecenterGuard = false;

map.createPane('ruinWorldPane');
const ruinWorldPane = map.getPane('ruinWorldPane');
if (ruinWorldPane) {
    ruinWorldPane.style.zIndex = '400';
    ruinWorldPane.style.pointerEvents = 'none';
}

const worldOverlays = WORLD_COPY_OFFSETS.map((copyOffset) => {
    const x0 = copyOffset * WORLD_WIDTH;
    const layerBounds = [
        [0, x0],
        [height, x0 + WORLD_WIDTH]
    ];

    return L.imageOverlay(
        'assets/ruin-map.svg',
        layerBounds,
        { pane: 'ruinWorldPane', interactive: false }
    ).addTo(map);
});

// Keep the old name for code that expects the central atlas overlay.
const overlay = worldOverlays[1];

function wrapWorldX(x) {
    return ((x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
}

function nearestWrappedX(baseX, referenceX = map.getCenter().lng) {
    const canonicalX = wrapWorldX(baseX);
    const worldShift = Math.round((referenceX - canonicalX) / WORLD_WIDTH);
    return canonicalX + worldShift * WORLD_WIDTH;
}

function getNearestWrappedLatLng(latlng, referenceX = map.getCenter().lng) {
    const point = L.latLng(latlng);
    return L.latLng(point.lat, nearestWrappedX(point.lng, referenceX));
}

function getWrappedWorldBounds(referenceX = map.getCenter().lng) {
    const copyIndex = Math.round((referenceX - WORLD_WIDTH / 2) / WORLD_WIDTH);
    const x0 = copyIndex * WORLD_WIDTH;
    return [
        [0, x0],
        [height, x0 + WORLD_WIDTH]
    ];
}

function normalizeWorldPosition() {
    if (worldRecenterGuard) return;

    const center = map.getCenter();
    let nextX = center.lng;
    let nextY = center.lat;

    while (nextX < WORLD_WRAP_MIN) nextX += WORLD_WIDTH;
    while (nextX > WORLD_WRAP_MAX) nextX -= WORLD_WIDTH;

    nextY = Math.max(
        -WORLD_VERTICAL_MARGIN,
        Math.min(height + WORLD_VERTICAL_MARGIN, nextY)
    );

    if (Math.abs(nextX - center.lng) < 0.001 && Math.abs(nextY - center.lat) < 0.001) {
        return;
    }

    worldRecenterGuard = true;
    map.setView([nextY, nextX], map.getZoom(), { animate: false });
    requestAnimationFrame(() => {
        worldRecenterGuard = false;
        if (currentCompassMarker) window.updateCompassDirection?.();
    });
}

let initialMembraneApplied = false;
worldOverlays.forEach((layer) => {
    layer.on('load', () => {
        // All three world copies share one filtered pane and normally resolve
        // from the same cached SVG. Applying the full membrane three times at
        // startup only repeats style/compositor work, so the first completed
        // copy owns the initial paint. Zoom/tone events continue to update it.
        if (initialMembraneApplied) return;
        initialMembraneApplied = true;
        applyMembraneFinalEffect();
    });
});

map.fitBounds(bounds);


let membraneEffectRaf = null;
// opt08 · During active zoom, never rewrite the expensive full-pane filter.
// Leaflet keeps its transform animation smooth; only cheap compositor opacity
// follows the zoom continuously. The authored blur/contrast/sepia/invert state
// is resolved exactly once at zoomend.
let lastMembraneOpacityZoom = Number.NaN;

function getMembraneState(currentZoom = map.getZoom()) {
    const triggerZoom = 1;
    const maxZoom = 8;

    const ratio = currentZoom <= triggerZoom
        ? 0
        : Math.min(Math.max((currentZoom - triggerZoom) / (maxZoom - triggerZoom), 0), 1);

    const tone = clampReaderTone(readerToneValue);
    const warmT = Math.min(1, tone / READER_WARM_POINT);
    const nightT = tone <= READER_WARM_POINT
        ? 0
        : Math.min(1, (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT));

    // Keep the authored zoom membrane, then gently bias it toward the selected
    // reading environment. Warm mode remains paper-like; night mode gradually
    // reverses the atlas itself without touching photos or other media.
    const dynamicBlur = 0.40 + (ratio * 2.3);

    const zoomContrast = 1.8 - (ratio * 0.8);
    const warmContrastScale = readerToneMix(1, 0.96, warmT);
    const nightContrastScale = readerToneMix(1, 0.91, nightT);
    const dynamicContrast = zoomContrast * warmContrastScale * nightContrastScale;

    const zoomBrightness = 1.02 + (ratio * 0.7);
    const warmBrightnessScale = readerToneMix(1, 0.92, warmT);
    const nightBrightnessScale = readerToneMix(1, 0.84, nightT);
    const dynamicBrightness = zoomBrightness * warmBrightnessScale * nightBrightnessScale;

    const warmSepia = readerToneMix(0.33, 0.50, warmT);
    const dynamicSepia = readerToneMix(warmSepia, 0.08, nightT);

    const nightInvert = readerToneMix(0, 0.88, nightT);
    const zoomInvert = ratio * 0.15;
    const dynamicInvert = nightInvert + ((1 - nightInvert) * zoomInvert);

    const zoomOpacity = 1 - (ratio * 0.45);
    const warmOpacityScale = readerToneMix(1, 0.94, warmT);
    const dynamicOpacity = zoomOpacity * warmOpacityScale;

    return {
        opacity: dynamicOpacity,
        filter:
            `blur(${dynamicBlur.toFixed(3)}px) ` +
            `contrast(${dynamicContrast.toFixed(3)}) ` +
            `brightness(${dynamicBrightness.toFixed(3)}) ` +
            `sepia(${dynamicSepia.toFixed(3)}) ` +
            `invert(${dynamicInvert.toFixed(3)})`,
        // multiply is part of the existing parchment membrane, but once the
        // atlas turns into a dark reversed drawing it must return to normal
        // compositing or the pale lines disappear into the charcoal ground.
        blend: nightT > 0.12
            ? 'normal'
            : ((ratio > 0 || tone > 3) ? 'multiply' : 'normal')
    };
}

function applyMembraneState(currentZoom = map.getZoom(), interactive = false) {
    const el = ruinWorldPane;
    if (!el) return;

    const state = getMembraneState(currentZoom);

    // opt45 · Never drop the atlas membrane while navigating.  The previous
    // mobile-lite shortcut used `filter: none` during zoom/flyTo, which also
    // removed the night-mode invert together with blur/contrast/sepia.  Keep
    // the complete authored filter frozen during the gesture and resolve the
    // new zoom-dependent values once movement finishes.
    const nextFilter = state.filter;
    if (el.style.filter !== nextFilter) {
        el.style.filter = nextFilter;
    }
    // mix-blend-mode on a full-viewport moving SVG is one of the most
    // expensive compositing operations. During the gesture use normal blend;
    // zoomend restores the exact authored state.
    const nextBlend = interactive ? 'normal' : state.blend;
    if (el.style.mixBlendMode !== nextBlend) {
        el.style.mixBlendMode = nextBlend;
    }

    const nextOpacity = String(state.opacity);
    if (el.style.opacity !== nextOpacity) {
        el.style.opacity = nextOpacity;
    }
}

function updateMembraneDuringZoom() {
    if (membraneEffectRaf !== null) return;

    membraneEffectRaf = requestAnimationFrame(() => {
        membraneEffectRaf = null;

        const el = ruinWorldPane;
        if (!el) return;

        const zoom = map.getZoom();
        if (
            Number.isFinite(lastMembraneOpacityZoom) &&
            Math.abs(zoom - lastMembraneOpacityZoom) < 0.012
        ) return;

        lastMembraneOpacityZoom = zoom;

        // IMPORTANT: do not touch filter here. Rewriting blur / contrast /
        // brightness / sepia / invert on the 4000×3000 world pane forces an
        // expensive repaint/re-filter even when throttled to 8fps.
        // Opacity remains compositor-only and preserves the authored zoom fade.
        const state = getMembraneState(zoom);
        const nextOpacity = String(state.opacity);
        if (el.style.opacity !== nextOpacity) {
            el.style.opacity = nextOpacity;
        }
    });
}

function beginMembraneZoomEffect() {
    const el = ruinWorldPane;
    if (!el) return;

    // Resolve the current authored appearance once, then freeze that expensive
    // filter texture for the entire gesture. mix-blend-mode is normalized while
    // moving because blending a full moving world is also costly.
    applyMembraneState(map.getZoom(), true);
    el.style.willChange = 'opacity';
    lastMembraneOpacityZoom = Number.NaN;
}

function applyMembraneFinalEffect() {
    if (membraneEffectRaf !== null) {
        cancelAnimationFrame(membraneEffectRaf);
        membraneEffectRaf = null;
    }

    lastMembraneOpacityZoom = Number.NaN;

    // Apply the exact authored filter only once after movement stops.
    applyMembraneState(map.getZoom(), false);

    const el = ruinWorldPane;
    if (el) {
        requestAnimationFrame(() => {
            el.style.willChange = '';
        });
    }
}

map.on('zoomstart', () => {
    window.__startupMapBusy = true;
    beginMembraneZoomEffect();
});
map.on('zoom', updateMembraneDuringZoom);
map.on('zoomend', () => {
    applyMembraneFinalEffect();
    window.__startupMapBusy = false;
    window.StartupIdleQueue?.kick?.();
});
map.on('moveend', () => {
    normalizeWorldPosition();
    // Safari/iOS can coalesce or interrupt zoom/flyTo events when the compass
    // immediately starts another map movement. Reassert the final membrane on
    // every completed movement so no interrupted gesture can strand a stale
    // compositor state.
    applyMembraneFinalEffect();
});
applyMembraneFinalEffect();

// Reader-tone changes update the huge 4000×3000 atlas at a controlled rate.
// UI paper/text variables remain 60fps; the expensive membrane stays ~20fps.
let readerToneMapTimer = null;
readerToneMapRefresh = () => {
    if (readerToneMapTimer !== null) return;

    readerToneMapTimer = window.setTimeout(() => {
        readerToneMapTimer = null;
        applyMembraneFinalEffect();
    }, 50);
};


// v52 · Dynamic UI should never retrigger a full-page language pass.
// Popup hover is a hot path; translate only the newly created subtree.
function syncLanguageSubtree(root, targetLang = window.currentLang) {
    if (!root || !targetLang) return;
    let vault;
    try {
        vault = languageVault[targetLang];
    } catch (_) {
        return;
    }
    if (!vault) return;

    const applyNode = (el) => {
        const key = el?.getAttribute?.('data-i18n');
        if (!key) return;
        const value = vault[key];
        if (value != null && el.textContent !== value) el.textContent = value;
    };

    if (root.matches?.('[data-i18n]')) applyNode(root);
    root.querySelectorAll?.('[data-i18n]').forEach(applyNode);
}
window.syncLanguageSubtree = syncLanguageSubtree;

// v291-opt55 · mobile popup archive-link bridge
// --------------------------------------------------------------------------
// Leaflet owns the popup DOM and may stop/bury the synthesized click that
// Safari emits after a touch.  Capture the archive-link activation before it
// reaches Leaflet, then route it through the current mobile-aware drawer API.
// This restores the explicit marker -> popup -> archive path without making a
// marker tap itself auto-open the archive.
let popupArchiveLinkLastTouchAt = 0;

function activatePopupArchiveLink(event) {
    const link = event?.target?.closest?.('.map-archive-popup .archive-drawer-link');
    if (!link) return;

    // Mouse activation remains a normal click. Touch / pen activation happens
    // on pointerup because that is more reliable than Safari's delayed click.
    if (event.type === 'pointerup' && event.pointerType === 'mouse') return;

    const now = performance.now();
    if (event.type === 'click' && now - popupArchiveLinkLastTouchAt < 520) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    const index = Number(link.dataset.siteIndex);
    if (!Number.isInteger(index) || !markers?.[index]) return;

    if (event.type === 'pointerup') popupArchiveLinkLastTouchAt = now;
    event.preventDefault();
    event.stopPropagation();

    activeSiteIndex = index;
    if (typeof window.openDrawerByIndex === 'function') {
        window.openDrawerByIndex(index);
    }
}

document.addEventListener('pointerup', activatePopupArchiveLink, true);
document.addEventListener('click', activatePopupArchiveLink, true);
document.addEventListener('keydown', event => {
    const link = event?.target?.closest?.('.map-archive-popup .archive-drawer-link');
    if (!link || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.stopPropagation();
    const index = Number(link.dataset.siteIndex);
    if (Number.isInteger(index) && typeof window.openDrawerByIndex === 'function') {
        window.openDrawerByIndex(index);
    }
}, true);

map.on('popupopen', function (event) {
    syncLanguageSubtree(event?.popup?.getElement?.());
});


setTimeout(() => {
    const center = map.getCenter();
    const startupZoomDelta = isCompactViewport() ? 0.35 : 0.65;
    map.flyTo(
        [
            center.lat + 377,
            center.lng - 410
        ],
        map.getZoom() + startupZoomDelta,
        {
            duration: 5
        }
    );
}, 1000);


let activeSiteIndex = null;


/* v290-mobile-index-pass2 · mobile side-rail context
   The lexicology drawer remains the primary mobile surface. Once a site is
   actually selected, the two archive families appear as framed handles on the
   existing left/right viewport edges. */
function syncMobileSideRailContext(siteOrSites) {
    if (!document?.body) return;
    const members = Array.isArray(siteOrSites)
        ? siteOrSites.filter(Boolean)
        : (siteOrSites ? [siteOrSites] : []);
    if (!members.length) return;

    const types = new Set(members.map(site => site?.type === 'garden' ? 'garden' : 'record'));
    const contextType = types.size > 1 ? 'mixed' : [...types][0];

    document.body.classList.add('mobile-site-selected');
    document.body.dataset.mobileSiteType = contextType;

    const leftHandle = document.getElementById('mobile-left-side-handle');
    const rightHandle = document.getElementById('mobile-right-side-handle');
    leftHandle?.classList.toggle('is-current', contextType === 'record' || contextType === 'mixed');
    rightHandle?.classList.toggle('is-current', contextType === 'garden' || contextType === 'mixed');
}
window.syncMobileSideRailContext = syncMobileSideRailContext;
const markers = [];


// Attachments
let attachmentRegistry = null;

function createAttachmentRegistry() {
    return {
    'radio-score': {
        title: 'title_radio_score',
        type: 'graphic score',
        mode: 'card',
        front: 'attachments/aether-scorched-earth/score-2.png',
        back: 'attachments/aether-scorched-earth/score-2b.png',
        desc: 'desc_radio_score'
    },
    'radio-instrument': {
        title: 'title_radio_instrument',
        type: 'instrument demonstration',
        mode: 'video',
        src: 'attachments/aether-scorched-earth/instrument-2.mp4',
        desc: 'desc_radio_instrument'
    },
    'radio-film': {
        title: 'title_radio_film',
        type: 'ruin garden footage',
        mode: 'video',
        src: 'attachments/aether-scorched-earth/folly-2.mp4',
        desc: 'desc_radio_film'
    },
    'radio-rec-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-1.jpg',
        desc: ''
    },
    'radio-rec-2': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-2.jpg',
        desc: ''
    },
    'radio-rec-3': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-3.jpg',
        desc: ''
    },
    'radio-rec-4': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-4.jpg',
        desc: ''
    },
    'radio-rec-5': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-5.jpg',
        desc: ''
    },
    'radio-rec-6': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-6.jpg',
        desc: ''
    },
    'radio-rec-7': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-7.jpg',
        desc: ''
    },
    'radio-rec-8': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-8.jpg',
        desc: ''
    },
    'radio-rec-9': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-9.jpg',
        desc: ''
    },
    'radio-rec-10': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-10.jpg',
        desc: ''
    },
    'radio-rec-11': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-11.jpg',
        desc: ''
    },
    'radio-rec-12': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-12.jpg',
        desc: ''
    },
    'radio-map-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/aether-scorched-earth/mapping.pdf',
        desc: ''
    },
    'radio-note-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/aether-scorched-earth/statement.txt',
        desc: ''
    },

    'plague-scan': {
        title: 'title_plague_score',
        type: 'graphic score',
        mode: 'card',
        front: 'attachments/effluent-sedimentation/score-1.png',
        back: 'attachments/effluent-sedimentation/score-1b.png',
        desc: 'desc_plague_score'
    },
    'plague-audio': {
        title: 'title_plague_instrument',
        type: 'instrument demonstration',
        mode: 'video',
        src: 'attachments/effluent-sedimentation/instrument-1.mp4',
        desc: 'desc_plague_instrument'
    },
    'plague-film': {
        title: 'title_plague_film',
        type: 'ruin garden footage',
        mode: 'video',
        src: 'attachments/effluent-sedimentation/folly-1.mp4',
        desc: 'desc_plague_film'
    },
    'plague-rec-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-1.jpg',
        desc: ''
    },
    'plague-rec-2': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-2.jpg',
        desc: ''
    },
    'plague-rec-3': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-3.jpg',
        desc: ''
    },
    'plague-rec-4': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-4.jpg',
        desc: ''
    },
    'plague-rec-5': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-5.jpg',
        desc: ''
    },
    'plague-rec-6': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-6.jpg',
        desc: ''
    },
    'plague-rec-7': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-7.jpg',
        desc: ''
    },
    'plague-rec-8': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-1.jpg',
        desc: ''
    },
    'plague-rec-9': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-2.jpg',
        desc: ''
    },
    'plague-rec-10': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-3.jpg',
        desc: ''
    },
    'plague-rec-11': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-4.jpg',
        desc: ''
    },
    'plague-rec-12': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-5.jpg',
        desc: ''
    },
    'plague-map-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/effluent-sedimentation/mapping.pdf',
        desc: ''
    },
    'plague-note-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/effluent-sedimentation/statement.txt',
        desc: ''
    },

    'silicon-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/silicon-vein-works/video-to-pic.jpg',
        desc: 'desc_recorded_2018_05'
    },
    'silicon-audio': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/silicon-vein-works/ambient.wav',
        desc: 'desc_recorded_2018_05'
    },

    'suspended-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-1.jpg',
        desc: 'desc_recorded_2024_01_27'
    },
    'suspended-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-2.jpg',
        desc: 'desc_recorded_2024_01_27'
    },
    'suspended-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-3.jpg',
        desc: 'desc_recorded_2024_01_27'
    },

    'foghut-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mist-eroded-hut/photo-1.jpg',
        desc: 'desc_recorded_2024_01_27'
    },

    'hiddenstair-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-1.jpg',
        desc: 'desc_recorded_2025_11_21'
    },
    'hiddenstair-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-2.jpg',
        desc: 'desc_recorded_2025_11_21'
    },
    'hiddenstair-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-3.jpg',
        desc: 'desc_recorded_2025_11_21'
    },

    'church-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-1.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-2.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-3.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-4.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-5.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-6.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-7.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-8.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-9.jpg',
        desc: 'desc_recorded_2022_11_30'
    },

    'garychurch-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-1.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-2.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-3.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-4.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-5.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-6.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-7.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-8.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-9.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-10.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'midco-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-1.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-2.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-3.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-4.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-5.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-6.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-7.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-8.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-9.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-10.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-11.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-12.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-object-strip-curtain': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-strip-curtain.jpg',
        desc: 'desc_midco_object_strip_curtain'
    },
    'midco-object-yacht': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-yacht.jpg',
        desc: 'desc_midco_object_yacht'
    },
    'midco-object-terminal': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-terminal.jpg',
        desc: 'desc_midco_object_terminal'
    },

    'north-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-1.jpg',
        desc: 'desc_recorded_2023_06_19'
    },
    'north-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-2.jpg',
        desc: 'desc_recorded_2023_04_06'
    },
    'north-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-3.jpg',
        desc: 'desc_recorded_2023_09_14'
    },
    'north-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-4.jpg',
        desc: 'desc_recorded_2023_03_24'
    },
    'north-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-5.jpg',
        desc: 'desc_recorded_2022_06_07'
    },
    'north-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-6.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-7.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-8.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-9.jpg',
        desc: 'desc_recorded_2023_07_29'
    },
    'north-hum': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/fallen-wing-field/wave.wav',
        desc: 'desc_north_hum'
    },
    'north-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite.jpg',
        desc: 'desc_north_ticket'
    },
    'north-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite-2.jpg',
        desc: 'desc_north_ticket_2'
    },

    'signal-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-1.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-2.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-3.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-4.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-corridor': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-1.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-corridor-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-2.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-1.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-2.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-3.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/mountain-signal/note.txt',
        desc: ''
    },

    'wave-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-1.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-2.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-3.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-4.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-1.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-2.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-3.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-4.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-5.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-6.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-7.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-8.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-9.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-10.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-11.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-16': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-12.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-audio': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/wave-eroded-structure/ambient.wav',
        desc: 'desc_wave_audio'
    },

    'brick-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-2.jpg',
        desc: 'desc_brick_pilgrimage_wang'
    },
    'brick-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-3.jpg',
        desc: 'desc_brick_pilgrimage_wang'
    },
    'brick-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/infrared-photo-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-2.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'brick-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_03'
    },

    'quarry-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-1.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-2.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-3.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-4.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/object-pebble-stack.jpg',
        desc: 'desc_quarry_ticket'
    },

    'bath-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-1.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-2.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-3.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-4.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-5.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-6.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-7.jpg',
        desc: 'desc_recorded_2023_08_09'
    },

    'yellow-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-1.jpg',
        desc: 'desc_recorded_2017_08'
    },
    'yellow-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-2.jpg',
        desc: 'desc_recorded_2024_03_03'
    },
    'yellow-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-3.jpg',
        desc: 'desc_recorded_2024_03_03'
    },
    'yellow-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-1.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-2.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-3.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-4.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-5.jpg',
        desc: 'desc_recorded_2025_01_28'
    },

    'fish-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-1.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-2.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-3.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-4.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-041': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-5.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-042': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-6.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-043': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-7.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-044': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-8.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-045': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-9.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-1.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-2.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-6.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-7.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fish-mouth/object-bamboo-weaved-cast.jpg',
        desc: 'desc_fish_ticket'
    },
    'fish-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/fish-mouth/note.txt',
        desc: ''
    },

    'gloss-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-1.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-2.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-3.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-4.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/gloss-veil/object-net.jpg',
        desc: ''
    },

    'pole-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-1.jpg',
        desc: 'desc_recorded_2022_10_03'
    },
    'pole-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-2.jpg',
        desc: 'desc_recorded_2022_10_03'
    },
    'pole-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-3.jpg',
        desc: 'desc_recorded_2022_06_17'
    },

    'aquarium-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-1.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-2.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-3.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-4.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-6.jpg',
        desc: ''
    },
    'aquarium-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-1.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-2.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-3.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-014': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-015': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-016': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-6.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-object-one-eyed-elf': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/aquarium-bunker/object-one-eyed-elf.jpg',
        desc: 'desc_aquarium_one_eyed_elf'
    },

    'roof-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-1.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-2.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-3.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-1.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-2.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-ticket-1': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-1.jpg',
        desc: 'desc_recorded_2025_02_06'
    },
    'roof-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-2.jpg',
        desc: 'desc_recorded_2025_03_16'
    },
    'roof-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-3.jpg',
        desc: 'desc_recorded_2025_03_17'
    },
    'roof-ticket-4': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-4.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/roof/note.txt',
        desc: ''
    },

    'phospho-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-1.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-2.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-3.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-4.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-5.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-6.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-7.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-1.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-2.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-3.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-4.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-5.jpg',
        desc: 'desc_recorded_2026_07_05'
    },

    'castle-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-1.jpg',
        desc: 'desc_recorded_2025_01_27'
    },
    'castle-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-2.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-3.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-4.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-5.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-6.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-7.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-8': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-8.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-9': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-9.jpg',
        desc: 'desc_recorded_2026_09_05'
    },

    'grassdwelling-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/grass-child-dwelling/photo-1.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'grassdwelling-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/grass-child-dwelling/photo-2.jpg',
        desc: 'desc_recorded_2026_09_05'
    },


    'earthwall-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-1.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-2.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-3.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-4.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-5.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-6.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-7.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-8.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-9.jpg',
        desc: 'desc_recorded_2026_08_15'
    },

    'cliffgranary-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-1.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-2.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-3.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-4.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-5.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-6.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-7.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-8.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-9.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-10.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-11.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-12.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-13.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-14.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-15': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-1.jpg',
        desc: 'desc_cliff_fence_1'
    },
    'cliffgranary-16': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-2.jpg',
        desc: ''
    },

    'afterglow-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-1.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-2.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-3.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/afterglow-palace/note.txt',
        desc: ''
    },

    'compressed-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-1.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-2.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-3.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-4.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-5.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-6.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-7.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-8.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-9.jpg',
        desc: 'desc_recorded_2026_08_18'
    },

    'dock-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-1.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-2.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-3.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-4.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-5.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-6.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-7.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-8': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-8.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-9': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-9.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-10.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-11.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-12.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-13.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-14.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-15.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-16': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-16.jpg',
        desc: 'desc_recorded_2026_06_30'
    },

    'walled-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-1.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-1.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-2.jpg',
        desc: 'desc_recorded_2019_05_27'
    },
    'walled-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-3.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-4.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-5.jpg',
        desc: 'desc_recorded_2019_12_02'
    },
    'walled-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/walled-gallery/object-wrecked-van.jpg',
        desc: 'desc_walled_van'
    },
    'walled-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/walled-gallery/note.txt',
        desc: ''
    },

    'membrane-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_10'
    },
    'membrane-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-2.jpg',
        desc: 'desc_recorded_2024_06_10'
    },
    'membrane-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-3.jpg',
        desc: 'desc_recorded_2024_06_10'
    },

    'mirror-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'mirror-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-2.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'mirror-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-6.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mirror/object-mirror-pattern.jpg',
        desc: ''
    },
    'mirror-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mirror/object-doll-unknown.jpg',
        desc: ''
    },
    'mirror-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/mirror/note.txt',
        desc: ''
    },

    'solar-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/solar/film-scan-1.jpg',
        desc: 'desc_recorded_2024_08_15'
    },
    'solar-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/solar/film-scan-2.jpg',
        desc: 'desc_recorded_2024_08_15'
    },

    'rail-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rail-side/photo-1.jpg',
        desc: 'desc_recorded_2022_06_08'
    },

};
}

function ensureAttachmentRegistry() {
    if (!attachmentRegistry) attachmentRegistry = createAttachmentRegistry();
    return attachmentRegistry;
}



function getRecordCounts(folderName) {

    const counts = {
        visual: 0,
        audio: 0,
        object: 0,
        note: 0
    };

    Object.values(ensureAttachmentRegistry()).forEach(item => {

        const path =
            item.src ||
            item.front ||
            '';

        if (!path.includes(folderName))
            return;


        if (item.title === 'specimen_visual')
            counts.visual++;

        else if (item.title === 'specimen_audio')
            counts.audio++;

        else if (item.title === 'specimen_object')
            counts.object++;

        else if (item.title === 'specimen_note')
            counts.note++;

    });

    return counts;
}


const attachmentViewer =
  document.getElementById('attachment-viewer');
let currentZoom = 1;
let currentX = 0;
let currentY = 0;


// ============================================================================
// v291-opt20 · waveform audio specimen player
// ----------------------------------------------------------------------------
// Audio stays native underneath for reliable playback. The browser chrome is
// hidden; one decoded peak cache feeds a lightweight canvas waveform.
// Playback progress itself is compositor-only: the "played" waveform is simply
// revealed by changing a clipping wrapper width.
// ============================================================================
const waveformPeakCache = new Map();
let activeWaveformPlayer = null;

function formatWaveformTime(value) {
    const seconds = Number.isFinite(value) && value > 0 ? value : 0;
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    const rest = whole % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

async function decodeWaveformPeaks(src, bucketCount = 1400) {
    if (waveformPeakCache.has(src)) {
        return waveformPeakCache.get(src);
    }

    const task = (async () => {
        const response = await fetch(src, { cache: 'force-cache' });
        if (!response.ok) {
            throw new Error(`Audio waveform fetch failed: ${response.status}`);
        }

        const encoded = await response.arrayBuffer();
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) {
            throw new Error('Web Audio API unavailable');
        }

        const context = new AudioContextCtor();
        let decoded = null;

        try {
            decoded = await context.decodeAudioData(encoded.slice(0));

            const length = decoded.length;
            const channels = decoded.numberOfChannels;
            const count = Math.max(320, Math.min(2200, bucketCount));
            const peaks = new Float32Array(count);
            let globalPeak = 0;

            // opt23 · Ambient-energy envelope.
            // The old renderer used only max(abs(sample)) in each window.
            // For ambient/noise recordings almost every window contains a
            // similarly high random sample, so the envelope becomes nearly
            // horizontal. RMS exposes changes in acoustic energy instead.
            for (let bucket = 0; bucket < count; bucket++) {
                const start = Math.floor(bucket * length / count);
                const end = Math.max(start + 1, Math.floor((bucket + 1) * length / count));
                const stride = Math.max(1, Math.floor((end - start) / 220));

                let localPeak = 0;
                let sumSquares = 0;
                let sampleCount = 0;

                for (let channel = 0; channel < channels; channel++) {
                    const data = decoded.getChannelData(channel);

                    for (let i = start; i < end; i += stride) {
                        const raw = data[i] || 0;
                        const absolute = Math.abs(raw);

                        if (absolute > localPeak) localPeak = absolute;
                        sumSquares += raw * raw;
                        sampleCount++;
                    }
                }

                const rms = sampleCount > 0
                    ? Math.sqrt(sumSquares / sampleCount)
                    : 0;

                // RMS carries almost all visual weight; a small peak component
                // keeps genuine knocks/clicks from disappearing completely.
                const envelope = (rms * 0.92) + (localPeak * 0.08);

                peaks[bucket] = envelope;
                if (envelope > globalPeak) globalPeak = envelope;
            }

            // opt21 · Ambient-noise contrast stretch.
            // Field recordings often sit on a continuous noise floor, so simple
            // peak normalization makes the entire waveform look almost flat.
            // Use robust percentiles to remove that floor, stretch the useful
            // envelope, then apply a >1 gamma so quiet passages become visibly
            // shorter while stronger events keep their full height.
            const sortedPeaks = Array.from(peaks).sort((a, b) => a - b);
            const percentile = (ratio) => {
                if (!sortedPeaks.length) return 0;
                const index = Math.max(
                    0,
                    Math.min(sortedPeaks.length - 1, Math.floor((sortedPeaks.length - 1) * ratio))
                );
                return sortedPeaks[index] || 0;
            };

            const floor = percentile(0.055);
            const ceiling = Math.max(percentile(0.92), floor + 0.000001);
            const span = Math.max(0.000001, ceiling - floor);

            // Return the percentile rank of a value without allocating per bin.
            const rankOf = (value) => {
                let low = 0;
                let high = sortedPeaks.length;

                while (low < high) {
                    const mid = (low + high) >> 1;
                    if (sortedPeaks[mid] <= value) low = mid + 1;
                    else high = mid;
                }

                return sortedPeaks.length > 1
                    ? Math.max(0, Math.min(1, (low - 1) / (sortedPeaks.length - 1)))
                    : 0;
            };

            // opt23 · Deliberately strong "specimen contrast".
            // 65% percentile-rank equalisation makes very small ambient-energy
            // differences visibly legible; 35% true amplitude keeps the drawing
            // tied to the recording rather than becoming a decorative pattern.
            const contrasted = new Float32Array(peaks.length);

            for (let i = 0; i < peaks.length; i++) {
                const linear = Math.max(0, Math.min(1, (peaks[i] - floor) / span));
                const rank = rankOf(peaks[i]);

                let value = (linear * 0.35) + (rank * 0.65);

                // Gamma below 1 expands the upper visual range aggressively.
                value = Math.pow(Math.max(0, value), 0.66);

                // Deliberately let upper events hit the full scale.
                contrasted[i] = Math.min(1, value * 1.18);
            }

            // A very small three-bin smoothing turns statistical noise into
            // readable acoustic masses while retaining sharp local events.
            for (let i = 0; i < peaks.length; i++) {
                const prev = contrasted[Math.max(0, i - 1)];
                const curr = contrasted[i];
                const next = contrasted[Math.min(contrasted.length - 1, i + 1)];

                peaks[i] = Math.min(
                    1,
                    (prev * 0.16) + (curr * 0.68) + (next * 0.16)
                );
            }

            return {
                peaks,
                duration: decoded.duration || 0
            };
        } finally {
            try {
                const closing = context.close();
                if (closing && typeof closing.catch === 'function') closing.catch(() => {});
            } catch (_) {}
            decoded = null;
        }
    })();

    waveformPeakCache.set(src, task);

    try {
        return await task;
    } catch (error) {
        waveformPeakCache.delete(src);
        throw error;
    }
}

function initWaveformAudioPlayer(root, audio, src) {
    if (!root || !audio) return null;

    const track = root.querySelector('.waveform-track');
    const baseCanvas = root.querySelector('.waveform-canvas-base');
    const playedCanvas = root.querySelector('.waveform-canvas-played');
    const playedClip = root.querySelector('.waveform-played-clip');
    const playhead = root.querySelector('.waveform-playhead');
    const hoverLine = root.querySelector('.waveform-hover-line');
    const toggle = root.querySelector('.waveform-toggle');
    const currentTimeEl = root.querySelector('.waveform-time-current');
    const durationEl = root.querySelector('.waveform-time-duration');
    const edgeEndEl = root.querySelector('.waveform-edge-end');

    let destroyed = false;
    let peaks = null;
    let duration = 0;
    let progressRaf = 0;
    let resizeRaf = 0;
    let waveformDecodeStarted = false;

    function ensureWaveformDecoded() {
        if (waveformDecodeStarted || destroyed) return;
        waveformDecodeStarted = true;
        decodeWaveformPeaks(src, window.isMobileLiteMode?.() ? 720 : 1400)
            .then(result => {
                if (destroyed) return;
                peaks = result.peaks;
                duration = result.duration || duration;
                root.classList.remove('is-loading', 'is-unavailable');
                root.classList.add('is-ready');
                syncDuration();
                drawWaveform();
            })
            .catch(error => {
                if (destroyed) return;
                console.warn('Waveform decode unavailable:', error);
                root.classList.remove('is-loading');
                root.classList.add('is-unavailable');
                drawWaveform();
            });
    }

    function cssColour(variable, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
        return value || fallback;
    }

    function drawCanvas(canvas, colour, alpha = 1) {
        if (!canvas || !track) return;

        const rect = track.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        const dprCap = window.isMobileLiteMode?.() ? 1 : 2;
        const dpr = Math.min(dprCap, window.devicePixelRatio || 1);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const center = height / 2;
        // opt22 · Full-scale peaks can now reach close to the top/bottom edge.
        // This increases perceived depth without making quiet sections thicker.
        const topInset = Math.max(3, height * 0.02);
        const maxHalfHeight = Math.max(8, center - topInset);
        const desiredGap = width < 520 ? 3.0 : 3.7;
        const barWidth = width < 520 ? 1 : 1.15;
        const bars = Math.max(64, Math.floor(width / desiredGap));
        const step = width / bars;

        ctx.strokeStyle = colour;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'square';

        for (let i = 0; i < bars; i++) {
            let amp = 0.018;

            if (peaks && peaks.length) {
                const from = Math.floor(i * peaks.length / bars);
                const to = Math.max(from + 1, Math.floor((i + 1) * peaks.length / bars));

                let localMax = 0;
                let localSum = 0;
                let localCount = 0;

                for (let j = from; j < to; j++) {
                    const value = peaks[j] || 0;
                    localSum += value;
                    localCount++;
                    if (value > localMax) localMax = value;
                }

                const localMean = localCount > 0 ? localSum / localCount : 0;

                // Mean preserves the energy contour; max only accents transients.
                amp = Math.max(amp, (localMean * 0.78) + (localMax * 0.22));
            } else {
                // Quiet deterministic placeholder while the actual PCM envelope
                // is being decoded. No fake moving visualizer.
                amp = 0.018 + ((i * 17) % 7) * 0.003;
            }

            const half = Math.max(1.3, amp * maxHalfHeight);
            const x = Math.round((i + 0.5) * step) + 0.5;

            ctx.beginPath();
            ctx.moveTo(x, center - half);
            ctx.lineTo(x, center + half);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    function drawWaveform() {
        if (destroyed) return;
        const baseColour = cssColour('--reader-muted', '#77776f');
        const playedColour = cssColour('--reader-text', '#1c1c1a');
        drawCanvas(baseCanvas, baseColour, 0.58);
        drawCanvas(playedCanvas, playedColour, 0.96);
    }

    function syncDuration() {
        const nextDuration =
            Number.isFinite(audio.duration) && audio.duration > 0
                ? audio.duration
                : duration;

        if (nextDuration > 0) duration = nextDuration;

        const text = duration > 0 ? formatWaveformTime(duration) : '--:--';
        if (durationEl) durationEl.textContent = text;
        if (edgeEndEl) edgeEndEl.textContent = text;
        if (track) {
            track.setAttribute('aria-valuemax', String(Math.max(0, duration)));
        }
    }

    function syncToggle() {
        if (!toggle) return;
        const playing = !audio.paused && !audio.ended;
        root.classList.toggle('is-playing', playing);
        toggle.setAttribute('aria-label', playing ? 'Pause audio' : 'Play audio');
    }

    function syncProgress() {
        const total =
            Number.isFinite(audio.duration) && audio.duration > 0
                ? audio.duration
                : duration;
        const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
        const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
        const pct = `${(ratio * 100).toFixed(4)}%`;

        if (playedClip) playedClip.style.width = pct;
        if (playhead) playhead.style.left = pct;
        if (currentTimeEl) currentTimeEl.textContent = formatWaveformTime(current);

        if (track) {
            track.setAttribute('aria-valuenow', String(current));
            track.setAttribute('aria-valuetext', `${formatWaveformTime(current)} of ${formatWaveformTime(total)}`);
        }
    }

    function stopProgressLoop() {
        if (progressRaf) {
            cancelAnimationFrame(progressRaf);
            progressRaf = 0;
        }
    }

    function tickProgress() {
        progressRaf = 0;
        if (destroyed) return;
        syncProgress();
        if (!audio.paused && !audio.ended) {
            progressRaf = requestAnimationFrame(tickProgress);
        }
    }

    function startProgressLoop() {
        stopProgressLoop();
        progressRaf = requestAnimationFrame(tickProgress);
    }

    function togglePlayback() {
        ensureWaveformDecoded();
        if (audio.paused || audio.ended) {
            if (audio.ended) audio.currentTime = 0;
            const promise = audio.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {});
            }
        } else {
            audio.pause();
        }
    }

    function seekFromPointer(event) {
        ensureWaveformDecoded();
        if (!track) return;
        const rect = track.getBoundingClientRect();
        if (!rect.width) return;

        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const ratio = x / rect.width;
        const total =
            Number.isFinite(audio.duration) && audio.duration > 0
                ? audio.duration
                : duration;

        if (total > 0) {
            audio.currentTime = ratio * total;
            syncProgress();
        }
    }

    function updateHover(event) {
        if (!track || !hoverLine) return;
        const rect = track.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        hoverLine.style.left = `${x}px`;
        hoverLine.style.opacity = '1';
    }

    function hideHover() {
        if (hoverLine) hoverLine.style.opacity = '0';
    }

    function onKeyDown(event) {
        const total =
            Number.isFinite(audio.duration) && audio.duration > 0
                ? audio.duration
                : duration;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            togglePlayback();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            audio.currentTime = Math.max(0, audio.currentTime - 5);
            syncProgress();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            audio.currentTime = Math.min(total || Infinity, audio.currentTime + 5);
            syncProgress();
        } else if (event.key === 'Home') {
            event.preventDefault();
            audio.currentTime = 0;
            syncProgress();
        } else if (event.key === 'End' && total > 0) {
            event.preventDefault();
            audio.currentTime = total;
            syncProgress();
        }
    }

    const onPlay = () => {
        syncToggle();
        startProgressLoop();
    };
    const onPause = () => {
        syncToggle();
        stopProgressLoop();
        syncProgress();
    };
    const onEnded = () => {
        syncToggle();
        stopProgressLoop();
        syncProgress();
    };
    const onMetadata = () => {
        syncDuration();
        syncProgress();
    };
    const onToneChange = () => drawWaveform();
    const onResize = () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            drawWaveform();
        });
    };

    toggle?.addEventListener('click', togglePlayback);
    track?.addEventListener('click', seekFromPointer);
    track?.addEventListener('pointermove', updateHover);
    track?.addEventListener('pointerleave', hideHover);
    track?.addEventListener('keydown', onKeyDown);

    const onTimeUpdate = () => {
        // While playing, the RAF loop is already the smooth source of truth.
        // Native timeupdate events would duplicate the same DOM writes.
        if (audio.paused || audio.ended) syncProgress();
    };

    audio.addEventListener('loadedmetadata', onMetadata);
    audio.addEventListener('durationchange', onMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    window.addEventListener('ruinreaderchange', onToneChange);
    window.addEventListener('resize', onResize, { passive: true });

    syncDuration();
    syncToggle();
    syncProgress();
    drawWaveform();

    // opt42 · Deliberately do not fetch/decode the whole audio file just because
    // its viewer was opened. Native <audio preload=metadata> provides duration;
    // the real waveform is decoded on first play/seek while the placeholder stays
    // visually stable. This removes one of the largest avoidable attachment costs.

    return {
        destroy() {
            if (destroyed) return;
            destroyed = true;
            stopProgressLoop();
            if (resizeRaf) cancelAnimationFrame(resizeRaf);

            toggle?.removeEventListener('click', togglePlayback);
            track?.removeEventListener('click', seekFromPointer);
            track?.removeEventListener('pointermove', updateHover);
            track?.removeEventListener('pointerleave', hideHover);
            track?.removeEventListener('keydown', onKeyDown);

            audio.removeEventListener('loadedmetadata', onMetadata);
            audio.removeEventListener('durationchange', onMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);

            window.removeEventListener('ruinreaderchange', onToneChange);
            window.removeEventListener('resize', onResize);
        }
    };
}

// =============================================================================
// v291-opt37 · compact image gallery controller
// =============================================================================
let mobileGallerySwipeStart = null;

function ensureMobileImageGalleryControls() {
    const viewer = document.getElementById('attachment-viewer');
    const inner = viewer?.querySelector('.attachment-viewer-inner');
    if (!viewer || !inner) return null;

    let nav = viewer.querySelector('#mobile-image-gallery-nav');
    if (!nav) {
        nav = document.createElement('div');
        nav.id = 'mobile-image-gallery-nav';
        nav.className = 'mobile-image-gallery-nav';
        nav.setAttribute('aria-hidden', 'true');
        nav.innerHTML = `
            <button type="button" class="mobile-image-gallery-prev" aria-label="Previous image">←</button>
            <div class="mobile-image-gallery-counter">1 / 1</div>
            <button type="button" class="mobile-image-gallery-next" aria-label="Next image">→</button>
        `;
        inner.appendChild(nav);

        nav.addEventListener('click', event => {
            const prev = event.target.closest('.mobile-image-gallery-prev');
            const next = event.target.closest('.mobile-image-gallery-next');
            if (!prev && !next) return;
            event.preventDefault();
            event.stopPropagation();

            if (prev && currentImageIndex > 0) {
                openAttachmentViewer(currentImageGroup[currentImageIndex - 1]);
            } else if (next && currentImageIndex < currentImageGroup.length - 1) {
                openAttachmentViewer(currentImageGroup[currentImageIndex + 1]);
            }
        });
    }

    const stage = document.getElementById('attachment-stage');
    if (stage && stage.dataset.mobileGalleryBound !== '1') {
        stage.dataset.mobileGalleryBound = '1';

        stage.addEventListener('pointerdown', event => {
            if (!window.isCompactViewport?.()) return;
            const viewerNow = document.getElementById('attachment-viewer');
            if (!viewerNow?.classList.contains('view-image')) return;
            if (event.pointerType === 'mouse') return;
            mobileGallerySwipeStart = {
                x: event.clientX,
                y: event.clientY,
                time: performance.now()
            };
        }, { passive: true });

        stage.addEventListener('pointerup', event => {
            if (!mobileGallerySwipeStart || !window.isCompactViewport?.()) return;
            const viewerNow = document.getElementById('attachment-viewer');
            if (!viewerNow?.classList.contains('view-image')) {
                mobileGallerySwipeStart = null;
                return;
            }

            const dx = event.clientX - mobileGallerySwipeStart.x;
            const dy = event.clientY - mobileGallerySwipeStart.y;
            const elapsed = performance.now() - mobileGallerySwipeStart.time;
            mobileGallerySwipeStart = null;

            // Deliberately require a clear horizontal gesture so ordinary taps
            // and vertical page movement never change the photograph.
            if (elapsed > 650 || Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

            if (dx < 0 && currentImageIndex < currentImageGroup.length - 1) {
                openAttachmentViewer(currentImageGroup[currentImageIndex + 1]);
            } else if (dx > 0 && currentImageIndex > 0) {
                openAttachmentViewer(currentImageGroup[currentImageIndex - 1]);
            }
        }, { passive: true });

        stage.addEventListener('pointercancel', () => {
            mobileGallerySwipeStart = null;
        }, { passive: true });
    }

    return nav;
}

function syncMobileImageGalleryControls(mode = activeAttachmentItem?.mode) {
    const viewer = document.getElementById('attachment-viewer');
    const nav = ensureMobileImageGalleryControls();
    if (!viewer || !nav) return;

    const active = Boolean(
        window.isCompactViewport?.() &&
        mode === 'image' &&
        currentImageGroup.length
    );

    nav.classList.toggle('show', active);
    nav.setAttribute('aria-hidden', active ? 'false' : 'true');
    viewer.classList.toggle('mobile-image-browser', active);

    if (!active) return;

    const prev = nav.querySelector('.mobile-image-gallery-prev');
    const next = nav.querySelector('.mobile-image-gallery-next');
    const counter = nav.querySelector('.mobile-image-gallery-counter');

    if (counter) counter.textContent = `${currentImageIndex + 1} / ${currentImageGroup.length}`;
    if (prev) {
        prev.disabled = currentImageIndex <= 0;
        prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false');
    }
    if (next) {
        next.disabled = currentImageIndex >= currentImageGroup.length - 1;
        next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false');
    }
}

// v291-opt55 · classify compact gallery image orientation
// The class is mainly diagnostic / future-facing; the final compact CSS keeps
// every photograph inside one identical 4:3 viewing plate and uses contain so
// portrait sources are never vertically cropped.
function syncCompactGalleryImageOrientation(img) {
    if (!img) return;
    const viewer = document.getElementById('attachment-viewer');
    if (!viewer) return;

    const apply = () => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const portrait = img.naturalHeight > img.naturalWidth;
        img.dataset.imageOrientation = portrait ? 'portrait' : 'landscape';
        viewer.classList.toggle('mobile-image-portrait', portrait);
        viewer.classList.toggle('mobile-image-landscape', !portrait);
    };

    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
}

// Viewer
function openAttachmentViewer(id) {

  const registry = ensureAttachmentRegistry();
  const item = registry[id];
  if (!item) return;

  activeAttachmentId = id;
  activeAttachmentItem = item;
  activeTextSource = '';
  syncDocumentTranslationPreference({ onOpen: true });
  activePdfTextBlocks = [];
  documentTranslationToken++;
  clearInlineDocumentTranslation();

  const stage = document.getElementById('attachment-stage');


    const wrapper = document.getElementById('media-wrapper');

    const titleEl = document.getElementById('attachment-title');
    titleEl.setAttribute('data-i18n', item.title);

    titleEl.innerText = item.title;
    const descEl = document.getElementById('attachment-desc');
    descEl.setAttribute('data-i18n', item.desc);
    descEl.innerText = item.desc;
    if (window.currentLang) {
        const vault = languageVault[window.currentLang];
        if (vault) {
            titleEl.innerText = vault[item.title] || item.title;
            descEl.innerText = vault[item.desc] || item.desc;
        }
    }
    document.getElementById('attachment-filename').innerText = '';
  document.querySelector('.attachment-hud')?.classList.add('show');
const hud = document.querySelector('.attachment-hud');

if (hud && !hud.querySelector('#reset')) {
  const resetBtn = document.createElement('div');
  resetBtn.id = 'reset';
  resetBtn.className = 'hud-btn';
  resetBtn.innerText = 'reset';

  hud.appendChild(resetBtn);
}

  currentZoom = 1;
  currentX = 0;
  currentY = 0;

  wrapper.innerHTML = '';

if (item.mode === 'card') {

  wrapper.innerHTML = `

  <div class="score-card-space">

    <div class="score-card" id="score-card">

      <div class="score-face score-front">
        <img
          class="attachment-image"
          src="${item.front}"
          decoding="async"
          fetchpriority="high"
          draggable="false"
        />
      </div>

      <div class="score-face score-back">
        <img
          class="attachment-image score-card-back-image"
          src="${item.back}"
          decoding="async"
          fetchpriority="low"
          draggable="false"
          alt=""
        />
      </div>

    </div>

  </div>

  `;

  initScoreCard();

    }


    if (item.mode === 'text') {
        wrapper.innerHTML = `
            <div class="archive-text-document">
                <div class="archive-text-surface">
                    <pre id="archive-text-content" class="archive-note archive-text-content"></pre>
                    <div id="archive-text-translation-layer" class="archive-text-translation-layer" aria-hidden="true">
                        <pre id="archive-text-translation-content" class="archive-note archive-text-translation-content"></pre>
                    </div>
                </div>
                <div id="text-loading" class="document-loading">TEXT DATA LOADING…</div>
            </div>
        `;

        fetch(item.src)
            .then(response => {
                if (!response.ok) throw new Error(`TXT HTTP ${response.status}`);
                return response.text();
            })
            .then(text => {
                if (activeAttachmentId !== id) return;
                activeTextSource = text;
                const content = document.getElementById('archive-text-content');
                const loading = document.getElementById('text-loading');
                if (content) content.textContent = text;
                if (loading) loading.remove();
                refreshInlineDocumentTranslation();
            })
            .catch(error => {
                console.error('TXT load failed:', error);
                const loading = document.getElementById('text-loading');
                if (loading) loading.textContent = 'TEXT DATA UNAVAILABLE';
            });
    }


    const pdfHud = document.getElementById('pdf-page-hud');
    if (pdfHud) pdfHud.style.display = 'none';

    const imageHud = document.getElementById('image-page-hud');
    if (imageHud) imageHud.style.display = 'none';


    if (item.mode === 'image') {
        attachmentViewer.classList.remove('mobile-image-portrait', 'mobile-image-landscape');
        wrapper.innerHTML = `<img class="attachment-image" src="${item.src}" alt="" decoding="async" fetchpriority="high" />`;
        syncCompactGalleryImageOrientation(wrapper.querySelector('.attachment-image'));

        const dir = item.src.substring(0, item.src.lastIndexOf('/') + 1);
        const currentType = classifyAttachment(item.src);

        currentImageGroup = Object.keys(registry).filter(key => {
            const regItem = registry[key];
            return regItem.mode === 'image' &&
                regItem.src &&
                regItem.src.startsWith(dir) &&
                classifyAttachment(regItem.src) === currentType;
        });

        currentImageIndex = currentImageGroup.indexOf(id);


        if (imageHud) {
            imageHud.style.display = 'flex';
            document.getElementById('image-page-num').innerText = `${currentImageIndex + 1}/${currentImageGroup.length}`;

            const prevBtn = document.getElementById('image-prev');
            const nextBtn = document.getElementById('image-next');


            if (prevBtn) {
                prevBtn.style.opacity = currentImageIndex === 0 ? '0.2' : '1';
                prevBtn.style.pointerEvents = currentImageIndex === 0 ? 'none' : 'auto';
            }
            if (nextBtn) {
                nextBtn.style.opacity = currentImageIndex === currentImageGroup.length - 1 ? '0.2' : '1';
                nextBtn.style.pointerEvents = currentImageIndex === currentImageGroup.length - 1 ? 'none' : 'auto';
            }
        }
    }


    if (item.mode === 'pdf') {
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            wrapper.innerHTML = `
              <iframe src="${item.src}" class="attachment-image" style="border:none; width:100%; height:100%;"></iframe>
              <div style="position:absolute; bottom:10px; color:#666; font-size:10px;" data-i18n="ui_local_preview_hint">
                  提示：本地预览模式 (file:///)，不支持翻页 HUD。请使用 Live Server 以获得完整体验。
              </div>
          `;
            if (pdfHud) pdfHud.style.display = 'none';
        } else {
            wrapper.innerHTML = `
              <div id="pdf-loading" style="position: absolute;" data-i18n="ui_pdf_loading">读取图纸中...</div>
              <div id="pdf-page-stack" class="pdf-page-stack">
                  <canvas id="pdf-canvas" class="attachment-image"></canvas>
                  <canvas id="pdf-translation-canvas" class="pdf-translation-canvas" aria-hidden="true"></canvas>
              </div>
          `;
            if (pdfHud) pdfHud.style.display = 'flex';

            pageNum = 1;
            pageNumPending = null;
            pageRendering = false;
            pdfFitMode = true;
            currentZoom = 1;
            currentX = 0;
            currentY = 0;
            applyTransform();
            updatePdfHudState();

            if (activePdfLoadingTask) {
                try { activePdfLoadingTask.destroy(); } catch (_) {}
                activePdfLoadingTask = null;
            }

            ensurePdfJsLoaded().then(pdfjsLib => {
                if (activeAttachmentId !== id) return null;
                activePdfLoadingTask = pdfjsLib.getDocument(item.src);
                return activePdfLoadingTask.promise;
            }).then(function (pdf) {
                if (!pdf) return;
                if (activeAttachmentId !== id) {
                    try { pdf.destroy(); } catch (_) {}
                    return;
                }
                pdfDoc = pdf;
                activePdfLoadingTask = null;
                pageNum = 1;
                pageNumPending = null;
                updatePdfHudState();
                renderPage(1);
            }).catch(error => {
                activePdfLoadingTask = null;
                console.error('PDF load failed:', error);
                pageRendering = false;
                const loadingText = document.getElementById('pdf-loading');
                if (loadingText) loadingText.textContent = 'PDF DATA UNAVAILABLE';
                updatePdfHudState();
            });
        }
    }


    if (item.mode === 'audio') {
        activeWaveformPlayer?.destroy?.();
        activeWaveformPlayer = null;

        wrapper.innerHTML = `
            <div class="waveform-audio-player is-loading">
                <audio class="attachment-audio waveform-audio-engine" preload="metadata" src="${item.src}"></audio>

                <div class="waveform-control-row">
                    <button class="waveform-toggle" type="button" aria-label="Play audio">
                        <span class="waveform-toggle-icon" aria-hidden="true"></span>
                    </button>

                    <div class="waveform-state-mark" aria-hidden="true">
                        <span class="waveform-state-dot"></span>
                        <span class="waveform-state-line"></span>
                    </div>
                </div>

                <div
                    class="waveform-track"
                    tabindex="0"
                    role="slider"
                    aria-label="Audio waveform timeline"
                    aria-valuemin="0"
                    aria-valuemax="0"
                    aria-valuenow="0"
                >
                    <canvas class="waveform-canvas waveform-canvas-base" aria-hidden="true"></canvas>

                    <div class="waveform-played-clip" aria-hidden="true">
                        <canvas class="waveform-canvas waveform-canvas-played"></canvas>
                    </div>

                    <div class="waveform-centerline" aria-hidden="true"></div>
                    <div class="waveform-hover-line" aria-hidden="true"></div>
                    <div class="waveform-playhead" aria-hidden="true"></div>
                </div>

            </div>
        `;

        const audio = wrapper.querySelector('.waveform-audio-engine');
        const player = wrapper.querySelector('.waveform-audio-player');
        activeWaveformPlayer = initWaveformAudioPlayer(player, audio, item.src);
    }


    if (item.mode === 'video') {
  wrapper.innerHTML = `
    <video class="attachment-video" autoplay playsinline>
      <source src="${item.src}" />
    </video>
  `;

  setTimeout(() => {
    currentVideo = wrapper.querySelector('video');
    bindVideoUI();
  }, 50);
    }


    attachmentViewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt', 'view-audio', 'mode-instrument', 'mode-folly-video');


    if (id === 'plague-film' || id === 'radio-film') {
        attachmentViewer.classList.add('view-folly');
    } else if (id === 'plague-scan' || id === 'radio-score') {
        attachmentViewer.classList.add('view-score');
    } else if (item.mode === 'pdf') {
        attachmentViewer.classList.add('view-pdf');
    } else if (item.mode === 'image') {
        attachmentViewer.classList.add('view-image');
    } else if (item.mode === 'text') {
        attachmentViewer.classList.add('view-txt');
    } else if (item.mode === 'audio') {
        attachmentViewer.classList.add('view-audio');
    }


    if (item.src) {
        if (item.src.includes('instrument-1.mp4') || item.src.includes('instrument-2.mp4')) {
            attachmentViewer.classList.add('mode-instrument');
        } else if (item.src.includes('folly-1.mp4') || item.src.includes('folly.mp4') || item.src.includes('folly-2.mp4')) {

            attachmentViewer.classList.add('mode-folly-video');
        }
    }


    setViewerMode(item.mode, id);
    attachmentViewer.classList.add('open');
    updateDocumentTranslationControls();


    syncLanguageSubtree(attachmentViewer);
    syncMobileImageGalleryControls(item.mode);
    syncMobileFollyExitButton();

    if (item.mode === 'video' && window.isCompactViewport?.()) {
        requestAnimationFrame(() => {
            const video = wrapper.querySelector('video');
            if (video) ensureMobileFollyVideoUI(video);
        });
    }
}

function formatMobileVideoTime(value) {
    const total = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function ensureMobileFollyVideoUI(video) {
    if (!video || !window.isCompactViewport?.()) return null;
    const viewer = document.getElementById('attachment-viewer');
    if (!viewer?.classList.contains('mobile-folly-rebuilt')) return null;

    const wrapper = video.closest('.media-wrapper');
    if (!wrapper) return null;

    const stage = wrapper.parentElement;
    let ui = stage?.querySelector(':scope > .mobile-folly-player-ui') || null;
    if (!ui) {
        ui = document.createElement('div');
        ui.className = 'mobile-folly-player-ui';
        ui.innerHTML = `
            <button type="button" class="mobile-folly-player-toggle" aria-label="Play">
                <span class="mobile-folly-play-icon" aria-hidden="true"></span>
            </button>
            <input
                class="mobile-folly-player-progress"
                type="range"
                min="0"
                max="1000"
                step="1"
                value="0"
                aria-label="Video progress"
            />
            <span class="mobile-folly-player-time" aria-hidden="true">0:00</span>
            <button type="button" class="mobile-folly-player-fullscreen" aria-label="Fullscreen">
                <span class="mobile-folly-fullscreen-icon" aria-hidden="true"></span>
            </button>
        `;
        wrapper.insertAdjacentElement('afterend', ui);
    } else if (ui.previousElementSibling !== wrapper) {
        wrapper.insertAdjacentElement('afterend', ui);
    }

    if (ui.dataset.bound !== '1') {
        ui.dataset.bound = '1';

        const toggle = ui.querySelector('.mobile-folly-player-toggle');
        const progress = ui.querySelector('.mobile-folly-player-progress');
        const fullscreen = ui.querySelector('.mobile-folly-player-fullscreen');

        toggle?.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            if (video.paused || video.ended) {
                if (video.ended) video.currentTime = 0;
                video.play().catch?.(() => {});
            } else {
                video.pause();
            }
        });

        progress?.addEventListener('input', event => {
            const duration = Number(video.duration);
            if (!(duration > 0)) return;
            const ratio = Math.max(0, Math.min(1, Number(event.currentTarget.value) / 1000));
            video.currentTime = ratio * duration;
        });

        fullscreen?.addEventListener('click', async event => {
            event.preventDefault();
            event.stopPropagation();

            const frame = wrapper;
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen?.();
                    return;
                }
                if (frame.requestFullscreen) {
                    await frame.requestFullscreen();
                    return;
                }
                if (frame.webkitRequestFullscreen) {
                    frame.webkitRequestFullscreen();
                    return;
                }
                if (video.webkitEnterFullscreen) {
                    video.webkitEnterFullscreen();
                }
            } catch (_) {
                try { video.webkitEnterFullscreen?.(); } catch (_) {}
            }
        });
    }

    const sync = () => {
        const toggle = ui.querySelector('.mobile-folly-player-toggle');
        const progress = ui.querySelector('.mobile-folly-player-progress');
        const time = ui.querySelector('.mobile-folly-player-time');
        const duration = Number(video.duration) || 0;
        const current = Number(video.currentTime) || 0;
        const ratio = duration > 0 ? current / duration : 0;

        ui.classList.toggle('is-playing', !video.paused && !video.ended);
        toggle?.setAttribute('aria-label', (!video.paused && !video.ended) ? 'Pause' : 'Play');
        if (progress) progress.value = String(Math.round(Math.max(0, Math.min(1, ratio)) * 1000));
        if (time) time.textContent = `${formatMobileVideoTime(current)} / ${formatMobileVideoTime(duration)}`;
    };

    if (ui.dataset.videoSyncBound !== '1') {
        ui.dataset.videoSyncBound = '1';
        ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended']
            .forEach(type => video.addEventListener(type, sync));
    }

    sync();
    return ui;
}

function ensureMobileFollyChapterStrip() {
    const viewer = document.getElementById('attachment-viewer');
    const stage = document.getElementById('attachment-stage');
    if (!viewer || !stage || !window.isCompactViewport?.() || !viewer.classList.contains('mobile-folly-rebuilt')) {
        return null;
    }

    let strip = stage.querySelector(':scope > .mobile-folly-chapter-strip');
    if (!strip) {
        strip = document.createElement('div');
        strip.className = 'mobile-folly-chapter-strip';
        strip.setAttribute('aria-label', 'Video chapters');
        stage.appendChild(strip);
    }
    return strip;
}

function bindVideoUI() {

    const video = currentVideo;
    if (!video) return;

    const mobileFollyUI = ensureMobileFollyVideoUI(video);
    const isMobileFolly = Boolean(mobileFollyUI);

    const playBtn = document.getElementById('video-play');
    const pauseBtn = document.getElementById('video-pause');
    const bar = document.getElementById('video-progress-bar');


    if (!isMobileFolly) {
        if (playBtn) playBtn.onclick = () => video.play();
        if (pauseBtn) pauseBtn.onclick = () => video.pause();
    }


    const legacyProgress = document.querySelector('.video-progress');
    if (legacyProgress && !isMobileFolly) legacyProgress.onclick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const ratio = (e.clientY - rect.top) / rect.height;
        video.currentTime = ratio * video.duration;
    };

    const playhead = document.getElementById('score-playhead');
    const playhead2 = document.getElementById('score-playhead-2');
    // opt38 · Always measure the visible score HUD, never the earlier shadow HUD.
    // The old generic query selected #score-hud-shadow .score-body first, which
    // is hidden on mobile and was the main cause of playhead/score misalignment.
    const scoreBody = document.querySelector('#score-hud .score-body');


    let cachedScoreBodyWidth = 0;
    let cachedScoreBodyHeight = 0;

    video.ontimeupdate = () => {

        const progress = video.currentTime / video.duration;


        if (bar) {
            bar.style.height = (progress * 100) + '%';
        }


        const arcsContainer = document.getElementById('arcs-container');

        if (arcsContainer) {
            const minScale = 1;
            const maxScale = 4.5;
            const currentScale = minScale + (maxScale - minScale) * progress;
            arcsContainer.style.transform = `scale(${currentScale})`;
        }


        if (!playhead || !scoreBody) return;

        const viewer = document.querySelector('.attachment-viewer');


        if (viewer.classList.contains('score-linear')) {


            const compactFolly = Boolean(
                window.isCompactViewport?.() &&
                viewer.classList.contains('view-folly')
            );

            if (compactFolly || !cachedScoreBodyWidth || !cachedScoreBodyHeight) {
                cachedScoreBodyWidth = scoreBody.clientWidth || scoreBody.offsetWidth;
                cachedScoreBodyHeight = scoreBody.clientHeight || scoreBody.offsetHeight;
            }


            const w = cachedScoreBodyWidth;


            const startX = w * 0.12;

            const endX = w * 0.88;

            const x = startX + (endX - startX) * progress;
            const scanProgress = (x - startX) / (endX - startX);

            playhead.style.transform = `translateX(${x}px)`;

            const pulse = document.getElementById('score-pulse');

            if (pulse) {

                if (video.currentTime >= 113) {
                    pulse.style.opacity = 0;
                    return;
                }


                const pulseX = x - 3;

                const lineTop = cachedScoreBodyHeight * 0.72;
                const lineHeight = cachedScoreBodyHeight * 0.22;
                const pulseY = lineTop + lineHeight - (lineHeight * scanProgress);


                const minFreq = 0.8;
                const maxFreq = 3.0;
                const freq = minFreq + (maxFreq - minFreq) * scanProgress;


                const sineVal = Math.sin(performance.now() * 0.001 * freq * Math.PI);
                const isBeating = sineVal > 0;


                pulse.style.opacity = isBeating ? 1 : 0.12;


                const scale = isBeating ? (1 - Math.pow(sineVal, 2) * 0.4) : 1.0;


                pulse.style.transform = `translate(${pulseX}px, ${pulseY}px) scale(${scale})`;
            }
        }


else if (viewer.classList.contains('score-radial')) {


  const start1 = -65;
  const end1 = 30;

  const target1 =
    start1 + (end1 - start1) * progress;

  if (!playhead.currentAngle) {
    playhead.currentAngle = start1;
  }


  playhead.currentAngle +=
    (target1 - playhead.currentAngle) * 1;

  playhead.style.transform =
    `rotate(${playhead.currentAngle}deg)`;


  if (playhead2) {


    const progress2 =
      Math.min(1, progress * 1.2);


    const start2 = -55;
    const end2 = 74;


    const target2 =
      start2 + (end2 - start2) * progress2;

    if (!playhead2.currentAngle) {
      playhead2.currentAngle = start2;
    }


    playhead2.currentAngle +=
      (target2 - playhead2.currentAngle) * 1;

    playhead2.style.transform =
      `rotate(${playhead2.currentAngle}deg)`;
  }
}
};

}


let cardRotX = -12;
let cardRotY = 18;
let cardRotZ = 0;
let cardFlipped = false;

// v291-opt51 · Score manual now documents both direct dragging and joystick control.
(() => {
    const copy = {
        zh: {
            manual_joystick: '——拖拽卡片 / 摇杆',
            manual_card_intro: '拖拽卡片本体，或沿目标空间方向拉动摇杆，卡片围绕中心原点旋转；松开拖拽即停止。'
        },
        en: {
            manual_joystick: '——Drag card / joystick',
            manual_card_intro: 'Drag the card itself, or pull the joystick toward the desired spatial direction. The card rotates around its center; release the drag to stop.'
        },
        ja: {
            manual_joystick: '——カードをドラッグ / ジョイスティック',
            manual_card_intro: 'カード本体をドラッグするか、目的の空間方向へジョイスティックを動かすと、カードが中心を軸に回転します。ドラッグを離すと停止します。'
        }
    };

    // language-vault.js is loaded before script.js, so patch the authored keys
    // themselves. Language switching / cyber-decode therefore uses the new copy
    // instead of briefly restoring the old joystick-only text.
    if (typeof languageVault !== 'undefined') {
        for (const [lang, values] of Object.entries(copy)) {
            if (languageVault[lang]) Object.assign(languageVault[lang], values);
        }
    }
})();

function initScoreCard() {

  const card =
    document.getElementById('score-card');

  if (!card) return;


  updateCardTransform(card);
  installScoreCardDirectDrag(card);

}

// v291-opt51 · Direct 3D score-card drag
// Keep the joystick as an alternate controller, but let the score itself act
// like a physical card: grab it, drag in X/Y to rotate, release to stop.
function installScoreCardDirectDrag(card) {
    if (!card || card.dataset.directDragBound === '1') return;
    card.dataset.directDragBound = '1';

    let activePointerId = null;
    let lastX = 0;
    let lastY = 0;
    let pendingDX = 0;
    let pendingDY = 0;
    let dragRaf = 0;

    const flushRotation = () => {
        dragRaf = 0;
        if (!pendingDX && !pendingDY) return;

        // Match the existing joystick orientation: right = +Y rotation,
        // downward drag = -X rotation. No inertia is applied on release.
        cardRotY += pendingDX * 0.42;
        cardRotX -= pendingDY * 0.42;
        pendingDX = 0;
        pendingDY = 0;
        updateCardTransform(card);
    };

    const queueRotation = () => {
        if (dragRaf) return;
        dragRaf = requestAnimationFrame(flushRotation);
    };

    const finishDrag = (event) => {
        if (activePointerId === null) return;
        if (event?.pointerId != null && event.pointerId !== activePointerId) return;

        if (dragRaf) {
            cancelAnimationFrame(dragRaf);
            dragRaf = 0;
        }
        flushRotation();

        const pointerId = activePointerId;
        activePointerId = null;

        try {
            if (card.hasPointerCapture?.(pointerId)) {
                card.releasePointerCapture(pointerId);
            }
        } catch (_) {}

        card.classList.remove('is-direct-dragging');
        card.setAttribute('aria-grabbed', 'false');
    };

    card.setAttribute('aria-grabbed', 'false');
    card.addEventListener('dragstart', event => event.preventDefault());

    card.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        activePointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        pendingDX = 0;
        pendingDY = 0;

        card.classList.add('is-direct-dragging');
        card.setAttribute('aria-grabbed', 'true');

        try { card.setPointerCapture?.(event.pointerId); } catch (_) {}
        event.preventDefault();
        event.stopPropagation();
    });

    card.addEventListener('pointermove', event => {
        if (activePointerId === null || event.pointerId !== activePointerId) return;

        pendingDX += event.clientX - lastX;
        pendingDY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        queueRotation();
        event.preventDefault();
        event.stopPropagation();
    });

    card.addEventListener('pointerup', finishDrag);
    card.addEventListener('pointercancel', finishDrag);
    card.addEventListener('lostpointercapture', finishDrag);
}

function hydrateScoreCardBack(card) {
    if (!card) return;
    const back = card.querySelector('.score-card-back-image');
    if (!back) return;

    // opt50 · Back sides are normally assigned a real src when the score card
    // is opened, so joystick/manual rotation can reveal them immediately.
    // Keep support for older lazy DOM fragments that still use data-score-back-src.
    if (back.getAttribute('src')) return;
    const src = back.dataset.scoreBackSrc;
    if (!src) return;
    back.src = src;
    back.removeAttribute('data-score-back-src');
}

function updateCardTransform(card) {

  if (!card) return;
  if (cardFlipped) hydrateScoreCardBack(card);

  const flipY =
    cardFlipped ? 180 : 0;

  card.style.transform = `
    rotateX(${cardRotX}deg)
    rotateY(${cardRotY + flipY}deg)
    rotateZ(${cardRotZ}deg)
  `;

}
function closeAttachmentViewer() {

  isClosingViewer = true;
  currentVideo = null;

  // opt37 · Closing the attachment is a return-to-archive action, not an
  // outside tap. Keep the side archive alive through pointer/click follow-ups.
  window.__mobileAttachmentDismissImmuneUntil = performance.now() + 650;
  syncMobileImageGalleryControls(null);
  document.querySelector('.mobile-folly-exit')?.classList.remove('show');

  activeWaveformPlayer?.destroy?.();
  activeWaveformPlayer = null;

    resetViewerState();

  const viewer = document.getElementById('attachment-viewer');
  const stage = document.getElementById('attachment-stage');

  document.querySelector('.attachment-hud')
    ?.classList.remove('show');

  const videos = stage.querySelectorAll('video, audio');

  videos.forEach(v => {

      v.pause();
      focusLocked = false;

      const scoreHUD =
          document.getElementById('score-hud');

      const scoreHUDShadow =
          document.getElementById('score-hud-shadow');

      if (scoreHUD) {

          scoreHUD.classList.remove(
              'magnetic-lock'
          );

          scoreHUD.style.removeProperty(
              'transform'
          );

          scoreHUD.style.removeProperty(
              'transition'
          );

      }

      if (scoreHUDShadow) {

          scoreHUDShadow.classList.remove(
              'locked'
          );

          scoreHUDShadow.classList.remove(
              'focus-confirm'
          );

      }
  v.ontimeupdate = null;

  v.src = '';
  v.load();
});

// PDF cleanup must not live inside videos.forEach(): PDF viewers contain no <video>.
if (activePdfLoadingTask) {
    try { activePdfLoadingTask.destroy(); } catch (_) {}
    activePdfLoadingTask = null;
}
if (pdfDoc) {
    const docToDestroy = pdfDoc;
    pdfDoc = null;
    try {
        const result = docToDestroy.destroy();
        if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (_) {}
}
pageNum = 1;
pageNumPending = null;
pageRendering = false;
activeAttachmentId = null;
activeAttachmentItem = null;
activeTextSource = '';
activePdfTextBlocks = [];
documentTranslationToken++;
clearInlineDocumentTranslation();
updateDocumentTranslationControls();

const playhead =
  document.getElementById('score-playhead');

const playhead2 =
  document.getElementById('score-playhead-2');

const pulse =
  document.getElementById('score-pulse');

if (playhead) {

  playhead.style.transform =
    '';

  playhead.currentAngle = null;
}

if (playhead2) {

  playhead2.style.transform =
    '';

  playhead2.currentAngle = null;


  playhead2.style.opacity = 0;
}

if (pulse) {

  pulse.style.transform = '';
  pulse.style.opacity = 0;
}
document.getElementById('media-wrapper').style.transform = '';
viewer.classList.add('closing');

setTimeout(() => {

  viewer.classList.remove('open');
  viewer.classList.remove('closing');

    viewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt', 'view-audio', 'mode-audio');
    isClosingViewer = false;
}, 220);
}
document.addEventListener('click', (e) => {

    if (e.target.closest('#pdf-prev')) {
        e.stopPropagation();
        if (pdfDoc && pageNum > 1) queueRenderPage(pageNum - 1);
        return;
    }

    if (e.target.closest('#pdf-next')) {
        e.stopPropagation();
        if (pdfDoc && pageNum < pdfDoc.numPages) queueRenderPage(pageNum + 1);
        return;
    }


    if (e.target.id === 'image-prev') {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            openAttachmentViewer(currentImageGroup[currentImageIndex - 1]);
        }
        return;
    }

    if (e.target.id === 'image-next') {
        e.stopPropagation();
        if (currentImageIndex < currentImageGroup.length - 1) {
            openAttachmentViewer(currentImageGroup[currentImageIndex + 1]);
        }
        return;
    }
});


attachmentViewer.addEventListener('click', (e) => {

  const inner = document.querySelector('.attachment-viewer-inner');
  if (!inner) return;

  if (!inner.contains(e.target)) {
    closeAttachmentViewer();
  }

});


document.addEventListener('click', (e) => {

  if (e.target.closest('.attachment-close')) {
    closeAttachmentViewer();
  }

});


function classifyAttachment(filePath, item = null) {

    // Prefer the explicit specimen metadata. File names are intentionally
    // free-form (for example video-to-pic.jpg), so they should not decide
    // whether a file belongs to the visual/audio/object/note archive.
    if (item?.title === 'specimen_visual') return 'visualFiles';
    if (item?.title === 'specimen_audio') return 'audioFiles';
    if (item?.title === 'specimen_object') return 'objectFiles';
    if (item?.title === 'specimen_note') return 'noteFiles';

    const file =
        filePath.split('/').pop().toLowerCase();


    if (
        file.includes('photo') ||
        file.includes('film') ||
        file.includes('film-scan')
    ) {
        return 'visualFiles';
    }


    if (
        file.includes('object')
    ) {
        return 'objectFiles';
    }


    if (
        file.endsWith('.wav') ||
        file.endsWith('.mp3')
    ) {
        return 'audioFiles';
    }


    if (
        file.endsWith('.txt')
    ) {
        return 'noteFiles';
    }

    return 'otherFiles';
}
function buildArchiveGroups(prefix) {

    const groups = {

        visualFiles: [],
        objectFiles: [],
        audioFiles: [],
        noteFiles: []

    };

    Object.entries(
        ensureAttachmentRegistry()
    ).forEach(([id, item]) => {

        if (!item.src) return;

        if (!id.startsWith(prefix))
            return;

        const type =
            classifyAttachment(item.src, item);

        if (groups[type]) {

            groups[type].push({
                id,
                item
            });

        }

    });

    return groups;
}
function makeTreeFiles(list) {

    return list.map((file, index) => {

        const isLast =
            index === list.length - 1;

        const branch =
            isLast
                ? '└──'
                : '├──';

        const name =
            file.item.src
                .split('/')
                .pop();

        return `

      <div
        class="tree-file"
        onclick="openAttachmentViewer('${file.id}')">

        ${branch} ${name}

      </div>

    `;

    }).join('');

}
// Archive tree
function buildArchiveTree(prefix, titleKey) {
    const groups = buildArchiveGroups(prefix);


    const i18nKey = titleKey === '遗构录' ? 'ui_record' : titleKey;


    const titleFallback = titleKey === '遗构录' ? '遗构录' : titleKey;

    return `
<div class="wander-tree">
  <div class="wander-root tree-folder" onclick="toggleArchiveTree(this)">
    <span class="tree-toggle">[+]</span>

    <span data-i18n="${i18nKey}">${titleFallback}</span>
  </div>
  <div class="tree-collapse">
    ${makeFolder(prefix + '-visual', 'visual', 'specimen_visual', groups.visualFiles)}
    ${makeFolder(prefix + '-audio', 'audio', 'specimen_audio', groups.audioFiles)}
    ${makeFolder(prefix + '-object', 'object', 'specimen_object', groups.objectFiles)}
    ${makeFolder(prefix + '-note', 'note', 'specimen_note', groups.noteFiles, true)}
  </div>
</div>
`;
}

function makeFolder(folderId, icon, labelKey, files = [], isLastFolder = false) {
    const count = files.length;
    const branch = isLastFolder ? '└──' : '├──';


    const fallbackText = {
        'specimen_visual': '视觉标本',
        'specimen_audio': '声音标本',
        'specimen_object': '物件标本',
        'specimen_note': '注释卡'
    }[labelKey] || labelKey;

    return `
<div class="tree-branch tree-folder" onclick="toggleFolder(this)">
  <span class="tree-line">${branch}</span>
  <span class="tree-folder-toggle">[+]</span>

  <span data-i18n="${labelKey}">${fallbackText}</span> (${count})
</div>
<div class="tree-children" data-folder-id="${folderId}">
  ${makeTreeFiles(files)}
</div>
`;
}


const drawer =
  document.getElementById('archive-drawer');

const mask =
  document.getElementById('drawer-mask');
  mask?.addEventListener('click', () => {
    if (window.__multiSiteDrawerLock) return;
    closeDrawer();
  });


function toggleArchiveTree(el) {

    const collapse =
        el.nextElementSibling;

    const toggle =
        el.querySelector('.tree-toggle');

    if (
        !collapse ||
        !collapse.classList.contains('tree-collapse')
    ) return;

    const isOpen =
        getComputedStyle(collapse).display !== 'none';

    collapse.style.display =
        isOpen ? 'none' : 'block';

    toggle.innerText =
        isOpen ? '[+]' : '[-]';
}
function toggleFolder(trigger) {
    if (!trigger) return;
    const folder = trigger.nextElementSibling;
    const icon = trigger.querySelector('.tree-folder-toggle');
    if (!folder || !folder.classList.contains('tree-children') || !icon) return;

    const isOpen = folder.classList.contains('open');
    folder.classList.toggle('open', !isOpen);
    folder.style.display = isOpen ? 'none' : 'block';
    icon.innerText = isOpen ? '[+]' : '[-]';
}


function getSecondaryRecords(site) {
    return Array.isArray(site?.secondaryRecords) ? site.secondaryRecords : [];
}

function buildDrawerSecondaryRecords(site) {
    const records = getSecondaryRecords(site);
    if (!records.length) return '';

    return `<div class="drawer-secondary-records">${records.map(record => `
        <div class="drawer-secondary-record">
            <span class="secondary-record-mode">[<span data-i18n="ui_pilgrimage">循景</span>]</span>
            <span data-i18n="ui_recorder_label">记录者: </span><span class="secondary-record-name">${record.recorder}</span>
            <span class="secondary-record-separator"> · </span>
            <span data-i18n="ui_record_date">记录时间: </span><span class="secondary-record-date">${record.recordDate}</span>
        </div>`).join('')}</div>`;
}

function buildArchiveDocSecondaryRecords(entrySites) {
    const records = [];
    const seen = new Set();

    entrySites.forEach(site => {
        getSecondaryRecords(site).forEach(record => {
            const key = `${record.recorder}|${record.mode || 'pilgrimage'}`;
            if (seen.has(key)) return;
            seen.add(key);
            records.push(record);
        });
    });

    return records.map(record => `
        <span class="doc-secondary-inline">
            <span data-i18n="ui_secondary_recorder_sep">，</span><span class="doc-secondary-recorder-name">${record.recorder}</span><span data-i18n="ui_secondary_mode_open">（</span><span data-i18n="ui_pilgrimage">循景</span><span data-i18n="ui_secondary_mode_close">）</span>
        </span>`).join('');
}

function openDrawer(site, marker) {
    if (!window.__openingMultiSiteDrawers) removeMultiSiteDrawers();
const drawer = document.getElementById('archive-drawer');

    if (marker) {

        const point =
            map.latLngToContainerPoint(
                marker.getLatLng()
            );

        const drawerWidth = 420;
        const drawerHeight = 600;

        let left =
            point.x + 40;

        let top =
            point.y - 60;


        if (
            left + drawerWidth >
            window.innerWidth
        ) {
            left =
                point.x - drawerWidth - 40;
        }


        if (
            top + drawerHeight >
            window.innerHeight
        ) {
            top =
                window.innerHeight -
                drawerHeight -
                20;
        }


        if (top < 20) {
            top = 20;
        }

        drawer.style.left =
            `${left}px`;

        drawer.style.top =
            `${top}px`;
    }
  const el =
    document.getElementById('drawer-content');

    const isGarden =
        site.type === "garden";

    const isRecord =
        site.type === "record";

    const isPlague =
        site.name === "瘟猪坝沉墟";
    const isRadio =
        site.name === "电台路焦土";
    const isYellow =
        site.name === "山葬灰脉";
    const isSiliconVein =
        site.name === "硅脉遗厂";
    const isSuspendedHomeland =
        site.name === "隐染悬里";
    const isFogHut =
        site.name === "雾蚀空庐";
    const isRustPrayerSanctuary =
        site.name === "锈祷圣堂";
    const isHiddenStairVilla =
        site.name === "隐阶空墅";
    const isWalled =
        site.name === "琉棘庭";
    const isNorth =
        site.name === "裂翼坪";
    const isRail =
        site.name === "轨畔孤构";
    const isPole =
        site.name === "残柱林";
    const isBellSilentChurch =
        site.name === "钟寂残堂";
    const isToxicTirePyre =
        site.name === "毒烬轮冢";
    const isBath =
        site.name === "池骸湾";
    const isQuarry =
        site.name === "褶层湾";
    const isMembrane =
        site.name === "釉骸拓壁";
    const isFish =
        site.name === "叠骸构阵";
    const isGloss =
        site.name === "苔网塬";
    const isBrick =
        site.name === "陆坞舰骸";
    const isMirror =
        site.name === "墟响厅";
    const isWave =
        site.name === "波蚀脊堤";
    const isSolar =
        site.name === "曜原驿";
    const isAquarium =
        site.name === "溶境遗廊";
    const isSignal =
        site.name === "荒娱敖包";
    const isRoof =
        site.name === "削岩残居";
    const isCastle =
        site.name === "彩壳堡";
    const isDock =
        site.name === "迁痕空埠";
    const isPhospho =
        site.name === "山骸窟殿";
    const isEarthwall =
        site.name === "山融灶垣";
    const isCliffGranary =
        site.name === "崖隐蚀垣";
    const isAfterglow =
        site.name === "暮辉骸殿";

    const isCompressedCourtyard =
        site.name === "褶脊胚庭";

    const isGrassChildDwelling =
        site.name === "草间稚居";


    const currentSiteName = site.name;
    const siteTags = siteTagsMapping[currentSiteName] || "";

    let treeHTML = '';

    if (isRadio) {
        treeHTML = `
  <div class="archive-tree">
  <div class="fault-node fault-root tree-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_garden_archive">废墟园林档案</span>
</div>
<div class="tree-collapse">
 <div class="fault-line line-1">
    ╲
  </div>
  <div class="fault-line line-2">
    ╲
  </div>
<div class="tree-folder sub-folder archive-record-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_record">遗构录</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">图像档案</span> (12)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-1')">
     ├── photo-1.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-2')">
   ├── photo-2.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-3')">
 ├── photo-3.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-4')">
   ├── photo-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-5')">
   ├── photo-5.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-6')">
   ├── photo-6.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-7')">
   ├── photo-7.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-8')">
   ├── photo-8.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-9')">
   ├── photo-9.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-10')">
   ├── photo-10.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-11')">
   ├── photo-11.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-12')">
 └── photo-12.jpg
    </div>
  </div>


  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_map_files">测绘档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-note-1')">
      └── statement.txt
    </div>
  </div>
</div>
<div class="fault-line-b">
  ╲
</div>
<div class="tree-file crack-a" onclick="openAttachmentViewer('radio-score')">
[<span data-i18n="ui_graphic_score">图形记谱</span>]
</div>
  <div class="fault-line-c">
    ╲
  </div>
  <div class="tree-file crack-b" onclick="openAttachmentViewer('radio-instrument')">
[<span data-i18n="ui_instrument_demo">乐器演示</span>]
  </div>
  <div class="fault-line-d">
    ╱
  </div>
  <div class="tree-file crack-c" onclick="openAttachmentViewer('radio-film')">
[<span data-i18n="ui_ruin_theater">废墟剧场</span>]
  </div>
</div>
</div>
`;
    }
    else if (isPlague) {
        treeHTML = `
<div class="archive-tree">
  <div class="fault-node fault-root tree-folder" onclick="toggleArchiveTree(this)">
    <span class="tree-toggle">[+]</span>
    <span data-i18n="ui_garden_archive">废墟园林档案</span>
</div>
<div class="tree-collapse">
 <div class="fault-line line-1">
    ╲
  </div>
  <div class="fault-line line-2">
    ╲
  </div>
<div class="tree-folder sub-folder archive-record-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_record">遗构录</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">图像档案</span> (12)
</div>

  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-1')">
   ├── film-scan-1.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-2')">
  ├── film-scan-2.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-3')">
    ├── film-scan-3.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-4')">
 ├── film-scan-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-5')">
      ├── film-scan-5.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-6')">
      ├── film-scan-6.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-7')">
      ├── film-scan-7.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-8')">
      ├── photo-1.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-9')">
      ├── photo-2.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-10')">
      ├── photo-3.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-11')">
      ├── photo-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-12')">
      └── photo-5.jpg
    </div>
  </div>

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_map_files">测绘档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-note-1')">
       └── statement.txt
    </div>
  </div>
</div>    <div class="fault-line-b">
      ╲
    </div>
    <div class="tree-file crack-a" onclick="openAttachmentViewer('plague-scan')">
      [<span data-i18n="ui_graphic_score">图形记谱</span>]
    </div>
    <div class="fault-line-c">
      ╲
    </div>
    <div class="tree-file crack-b" onclick="openAttachmentViewer('plague-audio')">
      [<span data-i18n="ui_instrument_demo">乐器演示</span>]
    </div>
    <div class="fault-line-d">
      ╱
    </div>
    <div class="tree-file crack-c" onclick="openAttachmentViewer('plague-film')">
      [<span data-i18n="ui_ruin_theater">废墟剧场</span>]
    </div>
  </div>
</div>
`;


    }
else if (isNorth) {

        treeHTML =
            buildArchiveTree(
                'north',
                '遗构录'
            );

    }
else if (isSignal) {

    treeHTML =
        buildArchiveTree(
            'signal',
            '遗构录'
        );

}
else if (isWave) {

    treeHTML =
        buildArchiveTree(
            'wave',
            '遗构录'
        );

} else if (isBrick) {

    treeHTML =
        buildArchiveTree(
            'brick',
            '遗构录'
        );

}
else if (isQuarry) {

    treeHTML =
        buildArchiveTree(
            'quarry',
            '遗构录'
        );

}
else if (isBellSilentChurch) {

    treeHTML =
        buildArchiveTree(
            'church',
            '遗构录'
        );

}
else if (isToxicTirePyre) {

    treeHTML =
        buildArchiveTree(
            'midco',
            '遗构录'
        );

}
else if (isBath) {

    treeHTML =
        buildArchiveTree(
            'bath',
            '遗构录'
        );

}

else if (isYellow) {

    treeHTML =
        buildArchiveTree(
            'yellow',
            '遗构录'
        );

}
else if (isSiliconVein) {

    treeHTML =
        buildArchiveTree(
            'silicon',
            '遗构录'
        );

}
else if (isSuspendedHomeland) {

    treeHTML =
        buildArchiveTree(
            'suspended',
            '遗构录'
        );

}
else if (isFogHut) {

    treeHTML =
        buildArchiveTree(
            'foghut',
            '遗构录'
        );

}
else if (isRustPrayerSanctuary) {

    treeHTML =
        buildArchiveTree(
            'garychurch',
            '遗构录'
        );

}
else if (isHiddenStairVilla) {

    treeHTML =
        buildArchiveTree(
            'hiddenstair',
            '遗构录'
        );

}
else if (isFish) {

    treeHTML =
        buildArchiveTree(
            'fish',
            '遗构录'
        );

}
else if (isGloss) {

    treeHTML =
        buildArchiveTree(
            'gloss',
            '遗构录'
        );

}
else if (isPole) {

    treeHTML =
        buildArchiveTree(
            'pole',
            '遗构录'
        );

}
else if (isAquarium) {

    treeHTML =
        buildArchiveTree(
            'aquarium',
            '遗构录'
        );

    }
    else if (isRoof) {

        treeHTML =
            buildArchiveTree(
                'roof',
                '遗构录'
            );

    }
    else if (isPhospho) {

        treeHTML =
            buildArchiveTree(
                'phospho',
                '遗构录'
            );

    }
    else if (isEarthwall) {

        treeHTML =
            buildArchiveTree(
                'earthwall',
                '遗构录'
            );

    }
    else if (isCliffGranary) {

        treeHTML =
            buildArchiveTree(
                'cliffgranary',
                '遗构录'
            );

    }
    else if (isAfterglow) {

        treeHTML =
            buildArchiveTree(
                'afterglow',
                '遗构录'
            );

    }
    else if (isCompressedCourtyard) {

        treeHTML =
            buildArchiveTree(
                'compressed',
                '遗构录'
            );

    }
    else if (isGrassChildDwelling) {

        treeHTML =
            buildArchiveTree(
                'grassdwelling',
                '遗构录'
            );

    }
    else if (isCastle) {

        treeHTML =
            buildArchiveTree(
                'castle',
                '遗构录'
            );

    }
    else if (isDock) {

        treeHTML =
            buildArchiveTree(
                'dock',
                '遗构录'
            );

    }
    else if (isWalled) {

        treeHTML =
            buildArchiveTree(
                'walled',
                '遗构录'
            );

    }
    else if (isMembrane) {

        treeHTML =
            buildArchiveTree(
                'membrane',
                '遗构录'
            );

    }
    else if (isMirror) {

        treeHTML =
            buildArchiveTree(
                'mirror',
                '遗构录'
            );

    }
    else if (isSolar) {

        treeHTML =
            buildArchiveTree(
                'solar',
                '遗构录'
            );

    }
    else if (isRail) {

        treeHTML =
            buildArchiveTree(
                'rail',
                '遗构录'
            );

    }
else {

  treeHTML = `
  ...
  `;
}


    if (el) {
        el.setAttribute('data-tags', siteTags);
        el.innerHTML = `
  <div class="-section title">
    <div class="drawer-site-title" data-i18n="site_name_${site.name}">
      ${site.name}
    </div>
  </div>

  <div class="drawer-section desc">
    <div class="drawer-description">
      <div class="desc-text" data-i18n="site_desc_${site.name}" style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; overflow: hidden;">
        ${site.desc}
      </div>

      <div class="desc-toggle-btn" style="display: none; cursor: pointer; color: #888; margin-top: 6px; font-family: monospace; font-size: 12px; user-select: none;">[...]</div>
    </div>
  </div>

  <div class="drawer-section tree">
    ${treeHTML}
  </div>
`;


        setTimeout(() => {
            const descText = el.querySelector('.desc-text');
            const toggleBtn = el.querySelector('.desc-toggle-btn');

            if (descText && toggleBtn) {

                const checkOverflow = () => {

                    if (descText.style.webkitLineClamp !== 'unset') {
                        if (descText.scrollHeight > descText.clientHeight) {
                            toggleBtn.style.display = 'inline-block';
                        } else {
                            toggleBtn.style.display = 'none';
                        }
                    }
                };


                toggleBtn.addEventListener('click', () => {
                    const isExpanded = descText.style.webkitLineClamp === 'unset';
                    if (isExpanded) {

                        descText.style.webkitLineClamp = '6';
                        toggleBtn.innerText = '[...]';
                        checkOverflow();
                    } else {

                        descText.style.webkitLineClamp = 'unset';
                        toggleBtn.innerText = '[ ^ ]';
                    }
                });


                checkOverflow();


                const observer = new MutationObserver(() => {
                    checkOverflow();
                });


                observer.observe(descText, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }, 50);
    }

    drawer.classList.add('open');
    mask.classList.add('show');
    syncLanguageSubtree(drawer);
}


function closeDrawer(force = false) {
  const drawer = document.getElementById('archive-drawer');
  const mask = document.getElementById('drawer-mask');

  // During a combined-record session, outside clicks and the mask are inert.
  // Programmatic navigation may pass force=true to clear the whole session.
  if (window.__multiSiteDrawerLock && !force) return;

  removeMultiSiteDrawers();
  if (!drawer) return;

  drawer.classList.remove('open');
  if (mask) mask.classList.remove('show');
}


document.addEventListener('mousedown', (e) => {
  const step = 40;

  if (e.target.id === 'zoom-in') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => currentZoom += 0.02);
  }

  else if (e.target.id === 'zoom-out') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (e.target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (e.target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (e.target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (e.target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }


else if (e.target.id === 'rot-x-plus') {
  startHold(() => {
    cardRotX += 1.2;

    const card =
      document.getElementById('score-card');

    CardTransform(card);
  });
}

else if (e.target.id === 'rot-x-minus') {
  startHold(() => {
    cardRotX -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-y-plus') {
  startHold(() => {
    cardRotY += 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-y-minus') {
  startHold(() => {
    cardRotY -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-z-plus') {
  startHold(() => {
    cardRotZ += 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-z-minus') {
  startHold(() => {
    cardRotZ -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}
});
document.addEventListener('click', (e) => {
  if (e.target.id === 'reset') {
    resetViewer();
  }
  if (e.target.id === 'card-flip') {

  cardFlipped = !cardFlipped;

  const card =
    document.getElementById('score-card');

  updateCardTransform(card);
}
});
document.addEventListener('mouseup', stopHold);
document.addEventListener('mouseleave', stopHold);
document.addEventListener('touchend', stopHold);
document.addEventListener('touchcancel', stopHold);
function resetViewer() {
  const wrapper = document.getElementById('media-wrapper');
  if (!wrapper) return;

  const resettingPdf = Boolean(pdfDoc && document.getElementById('pdf-canvas'));
  if (resettingPdf) pdfFitMode = true;

  const startX = currentX;
  const startY = currentY;
  const startZ = currentZoom;

  const duration = 600;
  const startTime = performance.now();

  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const k = ease(t);

    currentX = startX * (1 - k);
    currentY = startY * (1 - k);
    currentZoom = startZ + (1 - startZ) * k;

    applyTransform();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else if (resettingPdf && pdfDoc) {
      // Recalculate fit against the current viewer size.
      queueRenderPage(pageNum);
    }
  }

  requestAnimationFrame(animate);
}
document.addEventListener('touchstart', (e) => {
  const step = 40;

  const target = e.target;

  if (target.id === 'zoom-in') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => currentZoom += 0.02);
  }

  else if (target.id === 'zoom-out') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }
});

function ensureMobileFollyExitButton() {
    const viewer = document.getElementById('attachment-viewer');
    if (!viewer) return null;

    let button = viewer.querySelector(':scope > .mobile-folly-exit');
    if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'mobile-folly-exit';
        button.setAttribute('aria-label', 'Close');
        button.textContent = '×';

        button.addEventListener('pointerdown', event => {
            // Consume the pointer before the compact outside-dismiss owner sees
            // a follow-up event. closeAttachmentViewer already applies the
            // side-drawer immunity window.
            event.stopPropagation();
        });

        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            closeAttachmentViewer();
        });

        viewer.appendChild(button);
    }

    return button;
}

function syncMobileFollyExitButton() {
    const viewer = document.getElementById('attachment-viewer');
    const button = ensureMobileFollyExitButton();
    if (!viewer || !button) return;

    const show = Boolean(
        window.isCompactViewport?.() &&
        viewer.classList.contains('mobile-folly-rebuilt') &&
        viewer.classList.contains('open')
    );

    button.classList.toggle('show', show);
    button.setAttribute('aria-hidden', show ? 'false' : 'true');
    button.tabIndex = show ? 0 : -1;
}

function setViewerMode(type, id) {
    const joystickHUD =
        document.getElementById('score-rotation-hud');
const chapterToggle =
  document.getElementById('chapter-toggle');

if (chapterToggle) {
  chapterToggle.style.display = 'none';
}
  const viewer =
    document.querySelector('.attachment-viewer');

  const scoreImage =
    document.getElementById('score-image');

    const scoreShadowImage =
        document.getElementById(
            "score-shadow-image"
        );
  const scoreHUD =
        document.getElementById('score-hud');

    const scoreHUDShadow =
        document.getElementById('score-hud-shadow');

  const imageHUD =
    document.querySelector('.attachment-hud');

  const videoUI =
        document.getElementById('video-ui');

    const scoreRotationHUD =
        document.getElementById('score-rotation-hud');

    // opt41 · Player/chapter elements are stage siblings on compact theater.
    // Clear stale siblings before the next attachment mode is composed.
    viewer.querySelectorAll('.mobile-folly-player-ui, .mobile-folly-chapter-strip')
        .forEach(node => node.remove());


  viewer.classList.remove(
    'mode-image',
    'mode-audio',
    'mode-video',
    'video-has-chapters',
    'folly-1',
    'folly-2',
    'score-linear',
    'score-radial',
    'mobile-folly-rebuilt'
    );

    if (joystickWrap) {
        joystickWrap.style.display = 'none';
    }


  if (imageHUD) {
    imageHUD.style.display = 'none';
  }

  if (videoUI) {
    videoUI.style.display = 'none';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
    }
 if (scoreHUDShadow) {
    scoreHUDShadow.style.display = 'none';
    scoreHUDShadow.classList.remove('locked');
}

    if (scoreRotationHUD) {
        scoreRotationHUD.style.display = 'none';
    }


    if (type === 'audio') {
        viewer.classList.add('mode-audio');
        if (imageHUD) imageHUD.style.display = 'none';
        if (videoUI) videoUI.style.display = 'none';
        return;
    }

    if (
        type === 'image' ||
        type === 'card' ||
        type === 'text' ||
        type === 'pdf'
    ) {

        viewer.classList.add('mode-image');

        if (imageHUD) {
            imageHUD.style.display = 'flex';
        }

        if (
            type === 'card' &&
            joystickWrap
        ) {
            joystickWrap.style.display = 'flex';
        }

        return;
    }


  viewer.classList.add('mode-video');


  if (videoUI) {
    videoUI.style.display = 'flex';
  }


  if (id === 'plague-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-1',
    'score-linear'
  );
  if (window.isCompactViewport?.()) viewer.classList.add('mobile-folly-rebuilt');


  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }
      if (scoreHUDShadow) {
          scoreHUDShadow.style.display = 'flex';
      }
  scoreImage.src =
          'attachments/effluent-sedimentation/score-1.png';
      scoreShadowImage.src =
          'attachments/effluent-sedimentation/score-1.png';

  renderChapters('folly-1');

  const playhead2 =
   document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 0;
  }

  if (pulse) {
    pulse.style.opacity = 1;
  }
}


  else if (id === 'radio-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-2',
    'score-radial'
  );
  if (window.isCompactViewport?.()) viewer.classList.add('mobile-folly-rebuilt');


  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }

      if (scoreHUDShadow) {
          scoreHUDShadow.style.display = 'flex';
      }
  scoreImage.src =
          'attachments/aether-scorched-earth/score-2.png';
      scoreShadowImage.src =
          'attachments/aether-scorched-earth/score-2.png';

  renderChapters('folly-2');

  const playhead2 =
    document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 1;
  }

  if (pulse) {
    pulse.style.opacity = 0;
  }
}
}
const chapterData = {
    'folly-1': [
        { time: 0, label: '引序：滞岸之壳', key: 'ch1_0' },
        { time: 20, label: '阶段一：余存维持', key: 'ch1_1' },
        { time: 42, label: '阶段二：枯蚀应力', key: 'ch1_2' },
        { time: 56, label: '阶段三：磨损挣扎', key: 'ch1_3' },
        { time: 84, label: '阶段四：徒劳空撑', key: 'ch1_4' },
        { time: 124, label: '尾声：崩塌余响', key: 'ch1_5' }
    ],
    'folly-2': [
        { time: 0, label: '引序：并和狭间', key: 'ch2_0' },
        { time: 28, label: '阶段一：非谐构合', key: 'ch2_1' },
        { time: 67, label: '阶段二：磨盘震颤', key: 'ch2_2' },
        { time: 105, label: '阶段三：风蚀噪层', key: 'ch2_3' },
        { time: 142, label: '阶段四：嗡鸣共振', key: 'ch2_4' },
        { time: 198, label: '阶段五：以太余鸣', key: 'ch2_5' },
        { time: 231, label: '尾声：无实之基', key: 'ch2_6' }
    ]
};

function renderChapters(key) {
    const viewer = document.getElementById('attachment-viewer');
    const mobileContainer = (
        window.isCompactViewport?.() &&
        viewer?.classList.contains('mobile-folly-rebuilt')
    ) ? ensureMobileFollyChapterStrip() : null;

    const container = mobileContainer || document.querySelector('#video-ui .video-chapters');
    if (!container) return;

    container.classList.add('open');
    container.innerHTML = '';
    container.style.setProperty('--mobile-chapter-count', String(chapterData[key]?.length || 1));

    chapterData[key].forEach(ch => {
        const div = document.createElement('div');
        div.classList.add('chapter-button');
        div.dataset.time = ch.time;


        div.setAttribute('data-i18n', ch.key);
        div.textContent = ch.label;

        div.onclick = () => {
            const video = document.querySelector('video');
            if (video) {
                video.currentTime = ch.time;
                video.play();
            }
        };

        container.appendChild(div);
    });

    const video = document.querySelector('video');
    if (video) {
        video.removeEventListener('timeupdate', updateActiveChapter);
        video.addEventListener('timeupdate', updateActiveChapter);
        updateActiveChapter();
    }


    syncLanguageSubtree(container);
}
function updateActiveChapter() {

    const video =
        document.querySelector('video');

    if (!video) return;

    const buttons =
        document.querySelectorAll(
            '.chapter-button'
        );

    let activeIndex = 0;

    buttons.forEach((btn, i) => {

        const t =
            Number(btn.dataset.time);

        if (
            video.currentTime >= t
        ) {

            activeIndex = i;

        }

    });

    buttons.forEach((btn, i) => {

        btn.classList.toggle(
            'active',
            i === activeIndex
        );

    });

}


function geoToSVG(lat, lng) {

    let shiftedLng = lng + 180;

    if (shiftedLng > 180) {
        shiftedLng -= 360;
    }

    let x =
        ((shiftedLng + 180) / 360 - 0.5)
        * geoScale + 0.5;

let y =
  ((lat + 90) / 180 - 0.5)
  * geoScale + 0.5;

  x =
    (x - 0.5) * worldScale + 0.5;

  y =
    (y - 0.5) * worldScale + 0.5;

  x += offsetX;
  y += offsetY;

  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));

  return [y * height, x * width];
}

function svgToGeo(y, x) {

  // Horizontal copies share one geographic longitude cycle. Always fold
  // the visual x coordinate back into the canonical 0..WORLD_WIDTH world.
  x = wrapWorldX(x) / width;
  y = y / height;

  x -= offsetX;
  y -= offsetY;

  x =
    (x - 0.5) / worldScale + 0.5;

  y =
    (y - 0.5) / worldScale + 0.5;

  x =
    (x - 0.5) / geoScale + 0.5;

  y =
    (y - 0.5) / geoScale + 0.5;

    let lng =
        ((x + 0.5) % 1) * 360 - 180;

    return {
        lat: 90 - y * 180,
        lng: lng
    };
}


function toDMS(v) {

  const a = Math.abs(v);

  const d = Math.floor(a);

  const mF =
    (a - d) * 60;

  const m =
    Math.floor(mF);

  const s =
    Math.floor((mF - m) * 60);

  return { d, m, s };
}

function formatDMS(v, type) {

  const d = toDMS(v);

  const axis =
    type === 'lat'
      ? ''
      : '';

  const dir =
    type === 'lat'
      ? (v >= 0 ? '◒' : '◓')
      : (v >= 0 ? '◑' : '◐');

  return `  ${axis}${d.d}°${d.m}′${d.s}″${dir} `;
}

function formatLat(lat) {
  return formatDMS(lat, 'lat');
}

function formatLng(lng) {
  return formatDMS(lng, 'lng');
}


// Tags
const siteTagsMapping = window.siteTagsMapping || {};;

function createSiteMarker(site) {

    const tags = siteTagsMapping[site.name] || "";

    const customIcon = L.divIcon({
        className: 'custom-map-marker',

        html: `<div class="site-character" data-tag="${tags}">${site.character || ''}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

}


// Sites
const sites = window.sites || [];;

// ============================================================================
// opt54 · Bell-Silent Church copy normalization
// ----------------------------------------------------------------------------
// The original field note used a racial shorthand for the neighborhood.
// It is not necessary to the ruin description, so keep the geographic context
// while removing the demographic label consistently in zh / en / ja.
// ============================================================================
(() => {
    const siteName = '钟寂残堂';
    const descKey = `site_desc_${siteName}`;
    const copy = {
        zh: '芝加哥郊外的一座废弃教堂，坐落在市中心以南的一处社区，被人为破坏的铁栅栏成为了唯一的入口。破旧的院子里杂草丛生，还有些许流浪汉生活过的痕迹。\n\n教堂已成废墟，失去了钟声和彩绘玻璃，也失去了信徒相互握手祷告。没有了生机的教堂依旧耸立在郊外，残缺的建筑又在等待什么奇迹呢？',
        en: 'An abandoned church on the outskirts of Chicago, located in a neighborhood south of downtown. A deliberately broken iron fence has become its only entrance. Weeds overgrow the neglected yard, where traces of homeless people having lived there still remain.\n\nThe church has become a ruin. It has lost its bells and stained glass, and also the believers who once clasped hands and prayed together. Lifeless, the church still stands on the outskirts. What miracle is this broken building still waiting for?',
        ja: 'シカゴ郊外、市中心部の南側の一角に建つ廃教会。人為的に壊された鉄柵が唯一の入口となっている。荒れた庭には雑草が生い茂り、ホームレスが暮らしていたわずかな痕跡も残る。\n\n教会はすでに廃墟となり、鐘の音もステンドグラスも、信徒たちが互いに手を取り祈った時間も失った。生気を失った教会はそれでも郊外に立ち続けている。この欠けた建物は、いまもどんな奇跡を待っているのだろう。'
    };

    const site = sites.find(item => item?.name === siteName);
    if (site) site.desc = copy.zh;

    const vault = window.languageVault ||
        (typeof languageVault !== 'undefined' ? languageVault : null);
    if (vault) {
        if (vault.zh) vault.zh[descKey] = copy.zh;
        if (vault.en) vault.en[descKey] = copy.en;
        if (vault.ja) vault.ja[descKey] = copy.ja;
    }
})();


if (typeof sites !== 'undefined' && sites.length > 0) {
    sites.forEach(site => {
        createSiteMarker(site);
    });
}


const recordSites = sites.filter(
    site => site.type === 'record'
);

let currentRecordIndex = 0;


function openDrawerByIndex(i) {
    const item = markers[i];
    if (!item) return;

    syncMobileSideRailContext(item.site);


    if (typeof window.hideCompass === 'function') {
        window.hideCompass();


        document.querySelectorAll('.compass-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    openDrawer(
        item.site,
        item.marker
    );
}


function createIcon(type = "garden") {

    const size =
        type === "record"
            ? 6
            : 10;

    return L.divIcon({

        className:
            type === "record"
                ? "ruin-marker ruin-marker-record"
                : "ruin-marker",

        html: `
<div class="${
            type === "record"
                ? "record-dot"
                : "garden-dot"
            }">
</div>
`,

        iconSize: [size, size],

        iconAnchor: [size / 2, size / 2]

    });

}
let lockedMarker = null;
let currentHoverMarker = null;
let compassTargetInside = false;


function flashMarkerCrosshair(marker) {
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;

    const crosshair = document.createElement('div');
    crosshair.className = 'record-crosshair';
    el.appendChild(crosshair);

    setTimeout(() => {
        crosshair.remove();
    }, 500);
}


let currentCompassMarker = null;
let currentCompassMarkerData = null;

function getNearestMarkerCopy(markerData, referenceX = map.getCenter().lng) {
    if (!markerData?.copies?.length) return markerData?.markerFallback || null;

    let nearest = markerData.copies[0];
    let nearestDistance = Math.abs(nearest.getLatLng().lng - referenceX);

    for (let i = 1; i < markerData.copies.length; i++) {
        const candidate = markerData.copies[i];
        const distance = Math.abs(candidate.getLatLng().lng - referenceX);
        if (distance < nearestDistance) {
            nearest = candidate;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function closeMarkerDataPopups(markerData) {
    markerData?.copies?.forEach(marker => marker.closePopup());
}

function closeAllSitePopups() {
    markers.forEach(closeMarkerDataPopups);
}

function resolveCurrentCompassMarker() {
    if (currentCompassMarkerData) {
        const nearest = getNearestMarkerCopy(currentCompassMarkerData);
        if (nearest) currentCompassMarker = nearest;
    }
    return currentCompassMarker;
}

sites.forEach((site, index) => {

    const basePos = geoToSVG(site.lat, site.lng);
    const markerData = {
        site,
        index,
        basePos,
        copies: []
    };

    // Existing code can continue to use markerData.marker, but it now resolves
    // to whichever visual copy is closest to the current wrapped world.
    Object.defineProperty(markerData, 'marker', {
        enumerable: true,
        get() {
            return getNearestMarkerCopy(markerData);
        }
    });

    const popupHtml = `
    <div class="archive-popup">
      <div class="archive-content">
        <div class="archive-name" data-i18n="site_name_${site.name}">${site.name}</div>
        <div class="archive-coords">
          ${site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat))}
          &nbsp;&nbsp;
          ${formatLng(site.lng)}
        </div>
        <div class="archive-date"><span data-i18n="ui_archive_date">归档: </span>${site.archiveDate}</div>
        <div class="archive-drawer-link"
             role="button"
             tabindex="0"
             data-site-index="${index}"
             onclick="window.openDrawerByIndex(${index}, this)">
          <span class="label" data-i18n="${site.type === "garden" ? "ui_garden" : "ui_record"}">${site.type === "garden" ? "废墟园林" : "遗构录"}</span>
        </div>
      </div>
    </div>
  `;

    WORLD_COPY_OFFSETS.forEach((copyOffset) => {
        const pos = [basePos[0], basePos[1] + copyOffset * WORLD_WIDTH];
        const marker = L.marker(pos, {
            icon: createIcon(site.type)
        }).addTo(map);

        marker._ruinMarkerData = markerData;
        marker._ruinWorldCopyOffset = copyOffset;

        marker.bindPopup(popupHtml, {
            closeButton: false,
            autoClose: false,
            className: 'map-archive-popup',
            offset: [26, -26]
        });

        marker.on('mouseover', () => {
            if (currentHoverMarker && currentHoverMarker !== marker && !window.__multiSitePinnedMarkers?.has(currentHoverMarker)) {
                currentHoverMarker.closePopup();
            }
            marker.openPopup();
            currentHoverMarker = marker;
        });

        marker.on('mouseout', () => {
            setTimeout(() => {
                if (window.__multiSitePinnedMarkers?.has(marker)) return;
                if (lockedMarker === marker) return;
                if (currentHoverMarker === marker) {
                    marker.closePopup();
                    currentHoverMarker = null;
                }
            }, 120);
        });

        marker.on('click', (e) => {
            syncMobileSideRailContext(site);
            if (lockedMarker && lockedMarker !== marker && !window.__multiSitePinnedMarkers?.has(lockedMarker)) {
                lockedMarker.closePopup();
            }
            lockedMarker = marker;
            marker.openPopup();
            currentHoverMarker = marker;

            L.DomEvent.stopPropagation(e);
        });

        markerData.copies.push(marker);
    });

    markers.push(markerData);
});

function updateRecordNav() {
    const site = recordSites[currentRecordIndex];
    const recordLinkEl = document.getElementById('record-link');
    if (!recordLinkEl) return;


    const compassOverlay = document.getElementById('compass-overlay');
    const isOpen = compassOverlay && compassOverlay.classList.contains('show');

    if (isOpen) {

        recordLinkEl.classList.add('compass-active');
        recordLinkEl.innerHTML = `<span style="font-weight: 300; margin-right: 12px; display: inline-block;">➢</span>[ <span data-i18n="ui_record">遗构录</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    } else {

        recordLinkEl.classList.remove('compass-active');
        recordLinkEl.innerHTML = `[ <span data-i18n="ui_record">遗构录</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    }


    syncLanguageSubtree(recordLinkEl);
}


function getRecordMarker(siteName) {
    const item = markers.find(
        m => m.site.name === siteName
    );
    return item || null;
}


// Compass
let targetArrowAngle = 0;
let currentRingAngle = 45;
let currentRingScale = 1;
let currentRingMorph = 0;


let cachedRingWidth = 0;
let cachedRingHeight = 0;


function updateCompassRingCache() {
    const ring = document.querySelector('.compass-ring');
    if (ring) {
        cachedRingWidth = ring.offsetWidth;
        cachedRingHeight = ring.offsetHeight;
    }
}


window.addEventListener('resize', updateCompassRingCache);

document.addEventListener('DOMContentLoaded', updateCompassRingCache);


const DAMPING_FRICTION = 0.035;
let compassPhysicsRaf = null;


const compassPhysicsEls = {
    overlay: document.getElementById('compass-overlay'),
    ring: document.querySelector('.compass-ring'),
    asterisk: document.querySelector('.compass-asterisk'),
    pointer: document.querySelector('.compass-pointer')
};
let lastCompassPhysicsPaint = 0;
const COMPASS_PHYSICS_INTERVAL = 1000 / 30;

function ensureCompassPhysicsRunning() {
    if (compassPhysicsRaf === null && compassPhysicsEls.overlay?.classList.contains('show')) {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
    }
}

function animateCompassPhysics(now = performance.now()) {

    const overlayElement = compassPhysicsEls.overlay;
    if (!overlayElement || !overlayElement.classList.contains('show')) {
        compassPhysicsRaf = null;
        return;
    }

    if (now - lastCompassPhysicsPaint < COMPASS_PHYSICS_INTERVAL) {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
        return;
    }
    lastCompassPhysicsPaint = now;

    let targetRing = targetArrowAngle + 90;


    let diff = targetRing - currentRingAngle;
    diff = ((diff + 540) % 360) - 180;
    currentRingAngle += diff * DAMPING_FRICTION;


    const ring = compassPhysicsEls.ring;
    let scale = 1;
    const captureRadius = 140;
    const minScale = 0.23;

    if (
        window.compassDistance !== undefined &&
        window.compassDistance < captureRadius
    ) {
        const t = window.compassDistance / captureRadius;
        const targetScale = minScale + (1 - minScale) * t;
        currentRingScale += (targetScale - currentRingScale) * 0.06;


        const targetMorph = 1 - t;
        currentRingMorph += (targetMorph - currentRingMorph) * 0.06;
    }
    else {
        currentRingScale += (1 - currentRingScale) * 0.05;
        currentRingMorph += (0 - currentRingMorph) * 0.05;
    }

    if (ring) {
        const morphWidth = 1 - currentRingMorph * 0.65;
        const morphHeight = 1;


        const safeWidth = cachedRingWidth || 300;
        const safeHeight = cachedRingHeight || 150;

        const scaledA = safeWidth * currentRingScale * morphWidth / 2;
        const scaledB = safeHeight * currentRingScale * morphHeight / 2;

        const theta = targetArrowAngle * (Math.PI / 180);
        const alpha = currentRingAngle * (Math.PI / 180);
        const phi = theta - alpha;

        let radius = (scaledA * scaledB) / Math.sqrt(
            Math.pow(scaledB * Math.cos(phi), 2) +
            Math.pow(scaledA * Math.sin(phi), 2)
        );

        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);


        const pointer = compassPhysicsEls.pointer;
        if (pointer) {
            const arrowRotation = compassTargetInside ? targetArrowAngle + 270 : targetArrowAngle + 90;
            pointer.style.transform = `translate(${x}px, ${y}px) rotate(${arrowRotation}deg)`;

            if (ring) {
                const ringMorphWidth = 1 - currentRingMorph * 0.5;
                const ringMorphHeight = 1;
                const lineWeight = 1 + currentRingMorph * 7;

                ring.style.transform = `
                    rotate(${currentRingAngle}deg)
                    scaleX(${currentRingScale * ringMorphWidth})
                    scaleY(${currentRingScale * ringMorphHeight})
                `;
                ring.style.borderWidth = `${lineWeight}px`;
            }
        }
    }


    if (overlayElement && overlayElement.classList.contains('show') && typeof currentCompassMarker !== 'undefined' && resolveCurrentCompassMarker()) {

        const compassMarker = resolveCurrentCompassMarker();
        if (compassMarker && !compassMarker.isPopupOpen() && !(isCompactViewport() && window.__mobileCompassArrivalFlightActive)) {
            const dist = window.compassDistance;
            const radius = window.compassRingRadius || 140;
            /* opt42 · desktop now uses almost the same forgiving capture field
               as touch, while remaining slightly stricter. With the authored
               ring size this is roughly 20px desktop vs 24px compact, instead
               of the old desktop ~3px precision trap. */
            const triggerThreshold = isCompactViewport()
                ? Math.max(radius * 0.22, 24)
                : Math.max(radius * 0.18, 20);

            if (dist !== undefined && dist < triggerThreshold) {
                if (!window.compassLockTimer) {
                    window.compassLockTimer = setTimeout(() => {
                        const targetMarker = resolveCurrentCompassMarker();
                        if (targetMarker && !targetMarker.isPopupOpen()) {
                            lockedMarker = targetMarker;

                            const mobileArrivalIndex = targetMarker?._ruinMarkerData?.index;
                            const useMobileArrivalSequence =
                                isCompactViewport() && Number.isFinite(mobileArrivalIndex);

                            if (useMobileArrivalSequence) {
                                // opt53 · do not reveal either popup or archive while the
                                // Compass fly-to is still moving. A stale moveend can be
                                // emitted when flyTo cancels an in-progress drag/zoom, so
                                // elapsed time is part of the completion gate.
                                window.__mobileCompassArrivalFlightActive = true;
                                const mobileFlightStartedAt = performance.now();
                                const mobileMinimumArrivalMs = Math.max(0, COMPASS_FLY_DURATION * 1000 - 120);
                                let mobileArrivalDone = false;
                                let mobileArrivalListener = null;

                                const finishMobileArrival = (force = false) => {
                                    if (mobileArrivalDone) return;
                                    if (!force && performance.now() - mobileFlightStartedAt < mobileMinimumArrivalMs) return;

                                    mobileArrivalDone = true;
                                    if (mobileArrivalListener) {
                                        try { map.off('moveend', mobileArrivalListener); } catch (_) {}
                                        mobileArrivalListener = null;
                                    }

                                    // Strict sequence: fly-to complete -> popup for 1 s -> archive.
                                    try { targetMarker.openPopup(); } catch (_) {}
                                    window.setTimeout(() => {
                                        try {
                                            if (typeof window.openDrawerByIndex === 'function') {
                                                window.openDrawerByIndex(mobileArrivalIndex);
                                            }
                                        } finally {
                                            window.__mobileCompassArrivalFlightActive = false;
                                        }
                                    }, 1000);
                                };

                                mobileArrivalListener = () => finishMobileArrival(false);
                                try { map.on('moveend', mobileArrivalListener); } catch (_) {}

                                try {
                                    map.flyTo(targetMarker.getLatLng(), 5.5, {
                                        animate: true,
                                        duration: COMPASS_FLY_DURATION,
                                        easeLinearity: 0.1
                                    });
                                } catch (_) {
                                    finishMobileArrival(true);
                                }

                                window.setTimeout(
                                    () => finishMobileArrival(true),
                                    Math.round(COMPASS_FLY_DURATION * 1000 + 520)
                                );
                            } else {
                                // Keep the authored desktop behavior unchanged.
                                targetMarker.openPopup();
                                map.flyTo(targetMarker.getLatLng(), 5.5, {
                                    animate: true,
                                    duration: COMPASS_FLY_DURATION,
                                    easeLinearity: 0.1
                                });
                            }
                        }
                        window.compassLockTimer = null;
                    }, 500);
                }
            } else {
                if (window.compassLockTimer) {
                    clearTimeout(window.compassLockTimer);
                    window.compassLockTimer = null;
                }
            }
        }
    } else {
        if (window.compassLockTimer) {
            clearTimeout(window.compassLockTimer);
            window.compassLockTimer = null;
        }
    }


    // Once the physical easing has converged there is no reason to burn an
    // animation frame forever. Map movement / target changes restart it.
    const angleSettled = Math.abs(diff) < 0.08;
    const scaleTarget = (window.compassDistance !== undefined && window.compassDistance < captureRadius)
        ? minScale + (1 - minScale) * (window.compassDistance / captureRadius)
        : 1;
    const morphTarget = (window.compassDistance !== undefined && window.compassDistance < captureRadius)
        ? 1 - (window.compassDistance / captureRadius)
        : 0;
    const settled = angleSettled &&
        Math.abs(currentRingScale - scaleTarget) < 0.002 &&
        Math.abs(currentRingMorph - morphTarget) < 0.002;

    if (settled) {
        compassPhysicsRaf = null;
    } else {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
    }
}


function getCompassElements() {
    return {
        overlay: document.getElementById('compass-overlay'),
        pointer: document.getElementById('compass-pointer'),
        arrow: document.querySelector('.compass-arrow')
    };
}


function getSafeMap() {
    if (typeof map !== 'undefined') return map;
    if (typeof window.map !== 'undefined') return window.map;
    return null;
}

let compassDirectionRaf = null;
function scheduleCompassDirectionUpdate() {
    if (compassDirectionRaf !== null) return;
    compassDirectionRaf = requestAnimationFrame(() => {
        compassDirectionRaf = null;
        window.updateCompassDirection?.();
    });
}

window.showCompass = function ({ resetMap = true } = {}) {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    if (resetMap && typeof bounds !== 'undefined') {
        map.flyToBounds(getWrappedWorldBounds(), {
            animate: true,
            duration: COMPASS_FLY_DURATION,
            easeLinearity: 0.1
        });
    }

    const mainFrame = document.getElementById('main-viewport-frame');
    const compassContainer = document.querySelector('.compass-container');
    if (mainFrame && compassContainer) {
        const frameRect = mainFrame.getBoundingClientRect();
        /* pass7 · mobile compass positioning follows the supplied reference build:
           compact portrait / compact landscape / small tablet all open the native
           compass at the physical centre of the viewport. Desktop keeps its authored
           offset composition. */
        const vw = window.innerWidth || document.documentElement.clientWidth || 0;
        const vh = window.innerHeight || document.documentElement.clientHeight || 0;
        const useMobileCompassCenter = typeof window.isCompactViewport === 'function'
            ? window.isCompactViewport()
            : ((vw <= 900 && vh >= 560) || (vw <= 950 && vh <= 560));

        if (useMobileCompassCenter) {
            compassX = vw / 2;
            compassY = vh / 2;
        } else {
            compassX = (frameRect.left + frameRect.width / 2) + 150;
            compassY = (frameRect.top + frameRect.height / 2) + 40;
        }

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;
    }

    overlay.classList.remove('hidden');
    overlay.offsetWidth;
    overlay.classList.add('show');

    lastCompassPhysicsPaint = 0;
    ensureCompassPhysicsRunning();

    updateRecordNav();


    updateCompassRingCache();

    window.updateCompassDirection();

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.on('move viewreset zoomanim', scheduleCompassDirectionUpdate);
    }
};


/* ==========================================================================
   v291-opt46 · compass handle yields while the map itself is dragged
   --------------------------------------------------------------------------
   Keep the directional ring and pointer visible while the visitor pans the
   atlas, but let the frosted centre handle fade away until the map drag ends.
   Leaflet's dragstart/dragend only describe direct map dragging, so moving the
   compass handle itself keeps the handle visible and usable.
   ========================================================================== */
function setCompassMapDragVisual(active) {
    const overlay = document.getElementById('compass-overlay');
    if (!overlay) return;
    if (!overlay.classList.contains('show')) {
        overlay.classList.remove('map-dragging');
        return;
    }
    overlay.classList.toggle('map-dragging', Boolean(active));
}

(() => {
    const safeMap = getSafeMap();
    if (!safeMap || safeMap.__ruinCompassMapDragVisualInstalled) return;
    safeMap.__ruinCompassMapDragVisualInstalled = true;
    safeMap.on('dragstart', () => setCompassMapDragVisual(true));
    safeMap.on('dragend', () => setCompassMapDragVisual(false));
})();


function recenterOpenCompassForMobile() {
    const overlay = document.getElementById('compass-overlay');
    const compassContainer = document.querySelector('.compass-container');
    if (!overlay?.classList.contains('show') || !compassContainer) return;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const compact = typeof window.isCompactViewport === 'function'
        ? window.isCompactViewport()
        : ((vw <= 900 && vh >= 560) || (vw <= 950 && vh <= 560));
    if (!compact) return;

    compassX = vw / 2;
    compassY = vh / 2;
    compassContainer.style.left = `${compassX}px`;
    compassContainer.style.top = `${compassY}px`;
    compassContainer.style.transform = 'translate(-50%, -50%)';
    window.updateCompassDirection?.();
}

let mobileCompassRecenterRaf = 0;
function scheduleMobileCompassRecenter() {
    cancelAnimationFrame(mobileCompassRecenterRaf);
    mobileCompassRecenterRaf = requestAnimationFrame(recenterOpenCompassForMobile);
}
window.addEventListener('resize', scheduleMobileCompassRecenter, { passive: true });
window.addEventListener('orientationchange', scheduleMobileCompassRecenter, { passive: true });

window.hideCompass = function () {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    overlay.classList.remove('show', 'map-dragging');
    updateRecordNav();

    if (compassPhysicsRaf !== null) {
        cancelAnimationFrame(compassPhysicsRaf);
        compassPhysicsRaf = null;
    }

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.off('move viewreset zoomanim', scheduleCompassDirectionUpdate);
    }

    setTimeout(() => {
        if (!overlay.classList.contains('show')) {
            overlay.classList.add('hidden');
        }
    }, 400);
};

window.setCompassTarget = function (marker) {
    if (!marker) return;
    currentCompassMarkerData = marker._ruinMarkerData || null;
    currentCompassMarker = currentCompassMarkerData
        ? getNearestMarkerCopy(currentCompassMarkerData)
        : marker;

    const { overlay } = getCompassElements();
    if (overlay && overlay.classList.contains('show')) {
        window.updateCompassDirection();
    }
};

window.updateCompassDirection = function () {
    const { overlay, arrow } = getCompassElements();
    const compassRing = document.querySelector('.compass-ring');
    const safeMap = getSafeMap();
    const targetMarker = resolveCurrentCompassMarker();

    if (!targetMarker || !overlay || !overlay.classList.contains('show') || !safeMap || !compassRing || !arrow) {
        return;
    }


    const compassCenterX = compassX;
    const compassCenterY = compassY;

    const markerLatLng = targetMarker.getLatLng();
    const markerContainerPoint = safeMap.latLngToContainerPoint(markerLatLng);

    const deltaX = markerContainerPoint.x - compassCenterX;
    const deltaY = markerContainerPoint.y - compassCenterY;
    const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    window.compassDistance = distanceToTarget;


    const ringRadius = Math.min(cachedRingWidth || 300, cachedRingHeight || 150) * 0.5;

    window.compassRingRadius = ringRadius;
    compassTargetInside = distanceToTarget < ringRadius;

    const globalAngleRad = Math.atan2(deltaY, deltaX);
    targetArrowAngle = globalAngleRad * 180 / Math.PI;

    ensureCompassPhysicsRunning();
};


function handleRecordSwitch() {
    updateRecordNav();
    const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
    if (markerData && markerData.marker) {
        flashMarkerCrosshair(markerData.marker);

        if (window.setCompassTarget) {
            window.setCompassTarget(markerData.marker);
        }
    }
}

document.getElementById('record-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    currentRecordIndex--;
    if (currentRecordIndex < 0) {
        currentRecordIndex = recordSites.length - 1;
    }
    handleRecordSwitch();
});

document.getElementById('record-next').addEventListener('click', (e) => {
    e.stopPropagation();
    currentRecordIndex++;
    if (currentRecordIndex >= recordSites.length) {
        currentRecordIndex = 0;
    }
    handleRecordSwitch();
});


const recordLink = document.getElementById('record-link');
if (recordLink) {
    recordLink.addEventListener('click', (e) => {
        e.stopPropagation();
        const compassOverlay = document.getElementById('compass-overlay');
        if (!compassOverlay) return;

        if (compassOverlay.classList.contains('show')) {
            window.hideCompass();
        } else {

            const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
            if (markerData && markerData.marker && window.setCompassTarget) {
                window.setCompassTarget(markerData.marker);
            }
            window.showCompass();
        }
    });


    recordLink.addEventListener('mouseenter', () => {
        const target = getRecordMarker(recordSites[currentRecordIndex].name);
        if (target && target.marker) showMarkerCrosshair(target.marker);
    });
    recordLink.addEventListener('mouseleave', () => {
        const target = getRecordMarker(recordSites[currentRecordIndex].name);
        if (target && target.marker) hideMarkerCrosshair(target.marker);
    });
}

function showMarkerCrosshair(marker) {
    const el = marker.getElement();
    if (!el) return;
    let crosshair = el.querySelector('.record-crosshair');
    if (crosshair) return;
    crosshair = document.createElement('div');
    crosshair.className = 'record-crosshair';
    el.appendChild(crosshair);
}

function hideMarkerCrosshair(marker) {
    const el = marker.getElement();
    if (!el) return;
    const crosshair = el.querySelector('.record-crosshair');
    if (crosshair) {
        crosshair.classList.add('fade-out');
        setTimeout(() => { crosshair.remove(); }, 500);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const compassOverlay = document.getElementById('compass-overlay');
    if (compassOverlay) {

    }
});

function showNavHint(siteName) {
    const navHint = document.getElementById('map-nav-hint');
    const targetNameSpan = document.getElementById('nav-target-name');


    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) dirHint.style.opacity = '0';

    if (navHint && targetNameSpan) {
        const currentLang = window.currentLang || 'zh';
        const vault = languageVault[currentLang] || languageVault['zh'];
        const translatedName = vault[`site_name_${siteName}`] || siteName;

        targetNameSpan.innerText = translatedName;
        targetNameSpan.setAttribute('data-i18n', `site_name_${siteName}`);
        navHint.classList.add('show');
    }
}


function hideNavHint() {
    const navHint = document.getElementById('map-nav-hint');
    if (navHint) {
        navHint.classList.remove('show');
    }


    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) {
        dirHint.style.opacity = '0';
    }
}


function translateSiteName(site) {
    const lang = window.currentLang || 'zh';
    const vault = languageVault[lang] || languageVault.zh || {};
    return vault[`site_name_${site.name}`] || site.name;
}

function showNavHintForSites(groupSites) {
    const navHint = document.getElementById('map-nav-hint');
    const targetNameSpan = document.getElementById('nav-target-name');
    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) dirHint.style.opacity = '0';
    if (!navHint || !targetNameSpan) return;

    targetNameSpan.removeAttribute('data-i18n');
    targetNameSpan.innerText = groupSites.map(translateSiteName).join('  /  ');
    navHint.classList.add('show');
}

function autoExpandDrawerTreeIn(root) {
    if (!root) return;
    const content = root.matches?.('#drawer-content, .multi-drawer-content')
        ? root
        : root.querySelector?.('#drawer-content, .multi-drawer-content');
    if (!content) return;

    const wanderRoot = content.querySelector('.wander-root');
    if (wanderRoot && wanderRoot.nextElementSibling && getComputedStyle(wanderRoot.nextElementSibling).display === 'none') {
        toggleArchiveTree(wanderRoot);
        return;
    }

    const faultRoot = content.querySelector('.fault-root');
    if (faultRoot && faultRoot.nextElementSibling && getComputedStyle(faultRoot.nextElementSibling).display === 'none') {
        toggleArchiveTree(faultRoot);
        setTimeout(() => {
            const recordFolder = content.querySelector('.archive-record-folder');
            if (recordFolder && recordFolder.nextElementSibling && getComputedStyle(recordFolder.nextElementSibling).display === 'none') {
                toggleArchiveTree(recordFolder);
            }
        }, 1500);
    }
}

function setupGroupDrawerDescription(root) {
    const descText = root?.querySelector?.('.desc-text');
    const toggleBtn = root?.querySelector?.('.desc-toggle-btn');
    if (!descText || !toggleBtn || toggleBtn.dataset.groupBound === '1') return;
    toggleBtn.dataset.groupBound = '1';

    // Combined drawers are deliberately more compact than normal single-site
    // drawers. Keep four lines visible until the visitor explicitly expands it.
    descText.style.webkitLineClamp = '4';

    const checkOverflow = () => {
        if (descText.style.webkitLineClamp !== 'unset') {
            toggleBtn.style.display = descText.scrollHeight > descText.clientHeight ? 'inline-block' : 'none';
        }
    };
    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const expanded = descText.style.webkitLineClamp === 'unset';
        descText.style.webkitLineClamp = expanded ? '4' : 'unset';
        toggleBtn.innerText = expanded ? '[...]' : '[ ^ ]';
        if (expanded) checkOverflow();
    });
    requestAnimationFrame(checkOverflow);
}

// A combined-record navigation session pins several popups + drawers at once.
// Only the drawer's own × may dismiss that pair. Normal single-site drawers keep
// their original outside-click behavior.
window.__multiSiteDrawerLock = false;
window.__multiSitePinnedMarkers = new Set();
const multiSiteDrawerMarkerMap = new Map();

function setMultiSitePopupPinned(marker, pinned) {
    if (!marker) return;
    const popup = marker.getPopup?.();
    if (pinned) {
        window.__multiSitePinnedMarkers.add(marker);
        if (popup) {
            popup.options.autoClose = false;
            popup.options.closeOnClick = false;
            popup.options.autoPan = false;
        }
        marker.openPopup();
    } else {
        window.__multiSitePinnedMarkers.delete(marker);
        if (popup) {
            delete popup.options.closeOnClick;
            popup.options.autoPan = true;
            const popupEl = popup.getElement?.();
            if (popupEl) {
                popupEl.style.marginLeft = '';
                popupEl.style.marginTop = '';
                popupEl.style.translate = '';
                popupEl.classList.remove('multi-site-popup-shifted');
            }
        }
    }
}

function rectOverlapArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
}

function rectFromPopupShift(baseRect, dx, dy) {
    return {
        left: baseRect.left + dx,
        top: baseRect.top + dy,
        right: baseRect.right + dx,
        bottom: baseRect.bottom + dy,
        width: baseRect.width,
        height: baseRect.height
    };
}

function expandCollisionRect(rect, padding = 0) {
    return {
        left: rect.left - padding,
        top: rect.top - padding,
        right: rect.right + padding,
        bottom: rect.bottom + padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
    };
}

function getVisiblePopupRect(popupEl) {
    if (!popupEl) return null;
    // The Leaflet popup container can be wider/taller than the actual visible
    // archive label. Collision should use the pixels the visitor actually sees.
    const visible = popupEl.querySelector('.archive-popup, .archive-content, .leaflet-popup-content-wrapper');
    const rect = (visible || popupEl).getBoundingClientRect();
    if (!rect || !Number.isFinite(rect.left)) return null;
    return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    };
}

function clampPopupShift(baseRect, dx, dy) {
    const margin = 24;
    let nextDx = dx;
    let nextDy = dy;
    let rect = rectFromPopupShift(baseRect, nextDx, nextDy);

    if (rect.left < margin) nextDx += margin - rect.left;
    if (rect.right > window.innerWidth - margin) nextDx -= rect.right - (window.innerWidth - margin);
    if (rect.top < margin) nextDy += margin - rect.top;
    if (rect.bottom > window.innerHeight - margin) nextDy -= rect.bottom - (window.innerHeight - margin);

    return { dx: nextDx, dy: nextDy };
}

// Robust combined-popup layout ------------------------------------------------
// Leaflet owns `transform` on .leaflet-popup and may rewrite it whenever the map
// settles. v28 used margins, which meant the collision solver could measure one
// rectangle and Leaflet could subsequently place a slightly different one.
// The CSS `translate` longhand composes independently with Leaflet's transform,
// so our displacement survives Leaflet's own position updates.
function layoutCombinedSitePopups(markersToLayout) {
    const markerList = markersToLayout.filter(Boolean);
    const placed = [];
    const visualGap = 46; // real breathing room, not merely zero-overlap

    // Always derive candidates from the unshifted Leaflet position.
    markerList.forEach(marker => {
        const popupEl = marker.getPopup?.()?.getElement?.();
        if (!popupEl) return;
        popupEl.style.marginLeft = '';
        popupEl.style.marginTop = '';
        popupEl.style.translate = '0px 0px';
        popupEl.classList.add('multi-site-popup-shifted');
    });

    // Flush the reset once before measuring. Reading the rect forces layout and
    // gives us Leaflet's current canonical popup position.
    markerList.forEach(marker => marker.getPopup?.()?.getElement?.()?.getBoundingClientRect?.());

    markerList.forEach((marker, index) => {
        const popupEl = marker.getPopup?.()?.getElement?.();
        if (!popupEl) return;

        const baseRect = getVisiblePopupRect(popupEl);
        if (!baseRect) return;
        const w = Math.max(baseRect.width, 105);
        const h = Math.max(baseRect.height, 62);
        const sx = w + visualGap;
        const sy = h + visualGap;

        // Search in expanding rings. The alternating order deliberately sends
        // adjacent popups into opposite quadrants, so two nearby markers do not
        // read as one combined label even when their rectangles technically fit.
        const side = index % 2 === 0 ? -1 : 1;
        const vertical = Math.floor(index / 2) % 2 === 0 ? -1 : 1;
        const candidates = [];

        if (index === 0) candidates.push({ dx: 0, dy: 0 });

        [1, 1.35, 1.75, 2.2, 2.75].forEach(ring => {
            candidates.push(
                { dx: side * sx * ring, dy: vertical * sy * .35 * ring },
                { dx: side * sx * .72 * ring, dy: vertical * sy * ring },
                { dx: side * sx * ring, dy: 0 },
                { dx: 0, dy: vertical * sy * ring },
                { dx: -side * sx * ring, dy: -vertical * sy * .35 * ring },
                { dx: -side * sx * .72 * ring, dy: -vertical * sy * ring }
            );
        });

        let best = null;
        let bestScore = Infinity;
        for (const raw of candidates) {
            const shift = clampPopupShift(baseRect, raw.dx, raw.dy);
            const rect = rectFromPopupShift(baseRect, shift.dx, shift.dy);
            const padded = expandCollisionRect(rect, visualGap / 2);

            let overlap = 0;
            placed.forEach(other => {
                overlap += rectOverlapArea(padded, other.padded);
            });

            // Screen-edge pressure keeps popups from feeling crammed against the
            // frame even when no literal overlap occurs.
            const edgeClearance = Math.min(
                rect.left,
                window.innerWidth - rect.right,
                rect.top,
                window.innerHeight - rect.bottom
            );
            const edgePenalty = edgeClearance < 42 ? (42 - edgeClearance) * 800 : 0;
            const distance = Math.hypot(shift.dx, shift.dy);
            const score = overlap * 1000000 + edgePenalty + distance;

            if (score < bestScore) {
                bestScore = score;
                best = { shift, rect, padded };
            }
            if (overlap === 0 && edgePenalty === 0 && distance <= Math.hypot(sx * 1.4, sy * 1.4)) {
                // A clean nearby slot is already good enough; no need to search
                // the entire outer ring and risk choosing a visually remote spot.
                best = { shift, rect, padded };
                break;
            }
        }

        if (best) {
            popupEl.style.translate = `${best.shift.dx}px ${best.shift.dy}px`;
            // Measure the *actual* rendered result rather than trusting the model
            // rectangle. This catches font/layout differences across browsers.
            const actual = getVisiblePopupRect(popupEl) || best.rect;
            placed.push({
                rect: actual,
                padded: expandCollisionRect(actual, visualGap / 2)
            });
        }
    });

    return placed.map(item => item.rect);
}

function clampDrawerPosition(left, top, width, height) {
    const margin = 18;
    return {
        left: Math.max(margin, Math.min(window.innerWidth - width - margin, left)),
        top: Math.max(margin, Math.min(window.innerHeight - height - margin, top))
    };
}

function layoutCombinedSiteDrawers(entries) {
    if (!entries.length) return;
    const gap = 28;
    const popupRects = entries
        .map(entry => entry.marker?.getPopup?.()?.getElement?.()?.getBoundingClientRect?.())
        .filter(Boolean);
    const placed = [];

    entries.forEach((entry, index) => {
        const drawer = entry.drawer;
        const popupEl = entry.marker?.getPopup?.()?.getElement?.();
        const popupRect = popupEl?.getBoundingClientRect?.() || popupRects[index] || {
            left: window.innerWidth * .5 - 80,
            right: window.innerWidth * .5 + 80,
            top: window.innerHeight * .45 - 60,
            bottom: window.innerHeight * .45 + 60,
            width: 160,
            height: 120
        };
        const drawerRect = drawer.getBoundingClientRect();
        const dw = drawerRect.width || 300;
        const dh = drawerRect.height || 360;

        const candidates = [
            { left: popupRect.right + gap, top: popupRect.top - 8 },
            { left: popupRect.left - dw - gap, top: popupRect.top - 8 },
            { left: popupRect.right + gap, top: popupRect.bottom - dh + 8 },
            { left: popupRect.left - dw - gap, top: popupRect.bottom - dh + 8 },
            { left: popupRect.left, top: popupRect.bottom + gap },
            { left: popupRect.left, top: popupRect.top - dh - gap },
            { left: 22, top: 90 + index * (dh + 22) },
            { left: window.innerWidth - dw - 22, top: 90 + index * (dh + 22) }
        ];

        let best = null;
        let bestScore = Infinity;
        for (const raw of candidates) {
            const pos = clampDrawerPosition(raw.left, raw.top, dw, dh);
            const rect = {
                left: pos.left,
                top: pos.top,
                right: pos.left + dw,
                bottom: pos.top + dh
            };
            let overlap = 0;
            popupRects.forEach(r => { overlap += rectOverlapArea(rect, r); });
            placed.forEach(r => { overlap += rectOverlapArea(rect, r); });
            const dx = (rect.left + dw / 2) - (popupRect.left + popupRect.width / 2);
            const dy = (rect.top + dh / 2) - (popupRect.top + popupRect.height / 2);
            const distance = Math.hypot(dx, dy);
            const score = overlap * 10000 + distance;
            if (score < bestScore) {
                bestScore = score;
                best = { pos, rect };
            }
        }

        if (best) {
            drawer.style.left = `${best.pos.left}px`;
            drawer.style.top = `${best.pos.top}px`;
            placed.push(best.rect);
        }
    });
}


let combinedRelayoutRaf = 0;

function relayoutActiveCombinedUI() {
    const entries = (window.__activeCombinedDrawerEntries || []).filter(entry =>
        entry?.drawer?.isConnected && entry?.marker
    );
    if (entries.length < 2 || !window.__multiSiteDrawerLock) return;

    const popupMarkers = entries.map(entry => entry.marker).filter(Boolean);
    layoutCombinedSitePopups(popupMarkers);
    requestAnimationFrame(() => layoutCombinedSiteDrawers(entries));
}

function scheduleCombinedRelayout() {
    if (!window.__multiSiteDrawerLock || combinedRelayoutRaf) return;
    combinedRelayoutRaf = requestAnimationFrame(() => {
        combinedRelayoutRaf = 0;
        relayoutActiveCombinedUI();
    });
}

// If the visitor pans/zooms the map while a combined record is pinned, Leaflet
// moves the anchor points. Re-solve after the motion settles instead of letting
// the two popup labels drift back together.
map.on('moveend zoomend', scheduleCombinedRelayout);
window.addEventListener('resize', scheduleCombinedRelayout);

function updateMultiSiteMask() {
    const anyOpen = document.querySelector('#archive-drawer.multi-site-base.open, .multi-site-drawer.open');
    window.__multiSiteDrawerLock = Boolean(anyOpen);
    document.getElementById('drawer-mask')?.classList.toggle('show', Boolean(anyOpen));
}

function restoreBaseDrawerCloseButton() {
    const baseDrawer = document.getElementById('archive-drawer');
    const closeBtn = baseDrawer?.querySelector('.drawer-close');
    if (!closeBtn) return;
    closeBtn.onclick = (event) => {
        event?.stopPropagation?.();
        closeDrawer();
    };
}

function closeCombinedSiteDrawer(drawerEl) {
    if (!drawerEl) return;
    const marker = multiSiteDrawerMarkerMap.get(drawerEl);
    if (marker) {
        marker.closePopup();
        setMultiSitePopupPinned(marker, false);
    }
    multiSiteDrawerMarkerMap.delete(drawerEl);

    if (drawerEl.id === 'archive-drawer') {
        drawerEl.classList.remove('open', 'multi-site-base');
    } else {
        drawerEl.remove();
    }

    updateMultiSiteMask();
    if (!window.__multiSiteDrawerLock) {
        window.__activeCombinedDrawerEntries = [];
        restoreBaseDrawerCloseButton();
    }
}

function removeMultiSiteDrawers({ closePopups = true } = {}) {
    const base = document.getElementById('archive-drawer');
    const all = [base, ...document.querySelectorAll('.multi-site-drawer')].filter(Boolean);
    all.forEach(drawerEl => {
        const marker = multiSiteDrawerMarkerMap.get(drawerEl);
        if (closePopups && marker) marker.closePopup();
        if (marker) setMultiSitePopupPinned(marker, false);
        multiSiteDrawerMarkerMap.delete(drawerEl);
        if (drawerEl.id !== 'archive-drawer') drawerEl.remove();
    });
    base?.classList.remove('multi-site-base');
    window.__multiSitePinnedMarkers.clear();
    window.__multiSiteDrawerLock = false;
    window.__activeCombinedDrawerEntries = [];
    restoreBaseDrawerCloseButton();
}

function openMultiSiteDrawers(groupSites) {
    removeMultiSiteDrawers();
    const baseDrawer = document.getElementById('archive-drawer');
    const baseContent = document.getElementById('drawer-content');
    if (!baseDrawer || !baseContent || !groupSites.length) return;

    const snapshots = [];
    window.__openingMultiSiteDrawers = true;
    try {
        groupSites.forEach(site => {
            const siteIndex = sites.indexOf(site);
            const markerData = markers[siteIndex];
            const marker = getNearestMarkerCopy(markerData);
            openDrawer(site, marker);
            snapshots.push({
                site,
                siteIndex,
                marker,
                html: baseContent.innerHTML
            });
        });

        const first = snapshots[0];
        openDrawer(first.site, first.marker);
        baseDrawer.classList.add('multi-site-base', 'open');
        baseDrawer.dataset.multiSiteIndex = String(first.siteIndex);
        setupGroupDrawerDescription(baseDrawer);
        autoExpandDrawerTreeIn(baseDrawer);

        const drawerEntries = [{ drawer: baseDrawer, marker: first.marker, site: first.site }];
        setMultiSitePopupPinned(first.marker, true);
        multiSiteDrawerMarkerMap.set(baseDrawer, first.marker);

        const baseClose = baseDrawer.querySelector('.drawer-close');
        if (baseClose) {
            baseClose.removeAttribute('onclick');
            baseClose.onclick = event => {
                event.stopPropagation();
                closeCombinedSiteDrawer(baseDrawer);
            };
        }

        snapshots.slice(1).forEach((snap, offsetIndex) => {
            const clone = baseDrawer.cloneNode(true);
            clone.id = `archive-drawer-multi-${offsetIndex + 1}`;
            clone.classList.remove('multi-site-base');
            clone.classList.add('multi-site-drawer', 'open');
            clone.dataset.multiSiteIndex = String(snap.siteIndex);

            const content = clone.querySelector('#drawer-content');
            if (content) {
                content.removeAttribute('id');
                content.classList.add('multi-drawer-content');
                content.innerHTML = snap.html;
            }

            const closeBtn = clone.querySelector('.drawer-close');
            if (closeBtn) {
                closeBtn.removeAttribute('onclick');
                closeBtn.onclick = event => {
                    event.stopPropagation();
                    closeCombinedSiteDrawer(clone);
                };
            }

            clone.style.zIndex = String(10020 + offsetIndex);
            document.body.appendChild(clone);
            setupGroupDrawerDescription(clone);
            autoExpandDrawerTreeIn(clone);
            setMultiSitePopupPinned(snap.marker, true);
            multiSiteDrawerMarkerMap.set(clone, snap.marker);
            drawerEntries.push({ drawer: clone, marker: snap.marker, site: snap.site });
            if (window.bringDrawerToFront) window.bringDrawerToFront(clone);
        });

        window.__multiSiteDrawerLock = true;
        document.getElementById('drawer-mask')?.classList.add('show');

        window.__activeCombinedDrawerEntries = drawerEntries;

        const relayoutCombined = () => relayoutActiveCombinedUI();

        // Leaflet, the cyberpunk language transition and the auto-expanded tree
        // can all change measured sizes shortly after opening. Reflow during that
        // settling window, then keep a later safety pass for slower font/layout
        // changes on Safari/Chrome.
        requestAnimationFrame(() => requestAnimationFrame(relayoutCombined));
        setTimeout(relayoutCombined, 260);
        setTimeout(relayoutCombined, 760);
        setTimeout(relayoutCombined, 1500);
    } finally {
        window.__openingMultiSiteDrawers = false;
    }

    syncLanguageSubtree(document.getElementById('archive-drawer'));
    document.querySelectorAll('.multi-site-drawer').forEach(syncLanguageSubtree);
}

function getWrappedGroupPositions(groupSites) {
    const referenceX = map.getCenter().lng;
    return groupSites.map(site => {
        const base = geoToSVG(site.lat, site.lng);
        return L.latLng(base[0], nearestWrappedX(base[1], referenceX));
    });
}

function flyToSiteGroup(groupSites, fromIndexDrawer = false) {
    const members = groupSites.filter(Boolean);
    if (!members.length) return;
    if (members.length === 1) {
        const singleIndex = sites.indexOf(members[0]);
        flyToSite(members[0], singleIndex, fromIndexDrawer);
        return;
    }

    closeDrawer(true);
    closeAllSitePopups();
    activeSiteIndex = sites.indexOf(members[0]);
    syncMobileSideRailContext(members);
    showNavHintForSites(members);

    const stacks = document.querySelectorAll('.file-stack');
    const positions = getWrappedGroupPositions(members);
    const bounds = L.latLngBounds(positions);
    const center = bounds.getCenter();

    const finishFlyTo = () => {
        if (fromIndexDrawer) {
            stacks.forEach(stack => {
                stack.classList.remove('sink-down');
                stack.classList.remove('elevated-z');
            });
        }
        hideNavHint();
    };

    map.flyTo(center, 3, { duration: 4, easeLinearity: 0.2 });

    setTimeout(() => {
        map.flyToBounds(bounds.pad(0.55), {
            duration: 4,
            easeLinearity: 0.2,
            maxZoom: 5,
            padding: [70, 70]
        });

        map.once('moveend', () => {
            const openedMarkers = members.map(site => {
                const markerData = markers[sites.indexOf(site)];
                return getNearestMarkerCopy(markerData);
            }).filter(Boolean);

            openedMarkers.forEach((marker, i) => {
                setMultiSitePopupPinned(marker, true);
                setTimeout(() => flashMarkerCrosshair(marker), i * 110);
            });

            const dirHint = document.getElementById('map-dir-hint');
            if (dirHint) dirHint.style.opacity = '1';

            setTimeout(() => {
                openMultiSiteDrawers(members);
                finishFlyTo();
            }, 1200);
        });
    }, 3500);

    updateMarkerState();
}

function flyToSite(site, index, fromIndexDrawer = false) {
    if (typeof closeDrawer === 'function') {
        closeDrawer(true);
    }
    activeSiteIndex = index;
    syncMobileSideRailContext(site);

    const canonicalPos = geoToSVG(site.lat, site.lng);
    const pos = getNearestWrappedLatLng(canonicalPos);
    closeAllSitePopups();


    showNavHint(site.name);

    const stacks = document.querySelectorAll('.file-stack');


    const finishFlyTo = () => {

        if (fromIndexDrawer) {
            stacks.forEach(s => {
                s.classList.remove('sink-down');
                s.classList.remove('elevated-z');
            });
        }

        hideNavHint();
    };

    map.flyTo(pos, 3, {
        duration: 4,
        easeLinearity: 0.2
    });


    setTimeout(() => {
        map.flyTo(pos, 5, {
            duration: 4,
            easeLinearity: 0.2
        });

        map.once('moveend', () => {
            markers[index].marker.openPopup();


            const dirHint = document.getElementById('map-dir-hint');
            if (dirHint) dirHint.style.opacity = '1';

            setTimeout(() => {
                if (typeof window.openDrawerByIndex === 'function') {
                    window.openDrawerByIndex(index);
                } else if (typeof openDrawerByIndex === 'function') {
                    openDrawerByIndex(index);
                }

                setTimeout(() => {
                    const drawerContent = document.getElementById('drawer-content');
                    if (!drawerContent) {
                        finishFlyTo();
                        return;
                    }

                    let flowFinished = false;
                    const wanderRoot = drawerContent.querySelector('.wander-root');
                    if (wanderRoot && wanderRoot.nextElementSibling && wanderRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(wanderRoot);
                        flowFinished = true;
                        finishFlyTo();
                    }

                    const faultRoot = drawerContent.querySelector('.fault-root');
                    if (faultRoot && faultRoot.nextElementSibling && faultRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(faultRoot);

                        setTimeout(() => {
                            const recordFolder = drawerContent.querySelector('.archive-record-folder');
                            if (recordFolder && recordFolder.nextElementSibling && recordFolder.nextElementSibling.style.display !== 'block') {
                                toggleArchiveTree(recordFolder);
                            }
                            finishFlyTo();
                        }, 1500);
                        flowFinished = true;
                    }

                    if (!flowFinished) {
                        finishFlyTo();
                    }

                }, 1500);

            }, 3500);
        });
    }, 3500);

    updateMarkerState();
}


let markerOpacityRaf = null;

function updateMarkerOpacity() {
    if (markerOpacityRaf) return;

    markerOpacityRaf = requestAnimationFrame(() => {
        const currentZoom = map.getZoom();
        const triggerZoom = 0;
        const maxZoom = 3;

        let targetOpacity = 1.0;

        if (currentZoom > triggerZoom) {
            const ratio = (currentZoom - triggerZoom) / (maxZoom - triggerZoom);
            targetOpacity = 1.0 - (ratio * 0.7);
        }

        targetOpacity = Math.max(0.3, targetOpacity);


        const markerPane = map.getPane('markerPane');
        if (markerPane) {
            const nextOpacity = String(targetOpacity);
            if (markerPane.style.opacity !== nextOpacity) {
                markerPane.style.opacity = nextOpacity;
            }
        }

        markerOpacityRaf = null;
    });
}

map.on('zoom', updateMarkerOpacity);


updateMarkerOpacity();


function updateMarkerState() {
    markers.forEach(m => {
        const isActive = m.index === activeSiteIndex;

        m.copies.forEach(marker => {
            const el = marker.getElement();
            marker.setZIndexOffset(isActive ? 1000 : 0);
            if (el) {
                el.classList.toggle('active-marker', isActive);
            }
        });
    });
}


let coordsRaf = null;
let lastCoordsPaint = 0;
let pendingCoordsLatLng = null;
const coordsElement = document.getElementById('coords');

map.on('mousemove', e => {
    pendingCoordsLatLng = e.latlng;
    if (coordsRaf) return;

    coordsRaf = requestAnimationFrame((now) => {
        coordsRaf = null;
        if (!pendingCoordsLatLng || !coordsElement || now - lastCoordsPaint < 45) return;
        lastCoordsPaint = now;
        const geo = svgToGeo(pendingCoordsLatLng.lat, pendingCoordsLatLng.lng);
        const nextText = `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;
        if (coordsElement.textContent !== nextText) coordsElement.textContent = nextText;
    });
});


document.addEventListener('click', (e) => {
    if (typeof isClosingViewer !== 'undefined' && isClosingViewer) return;

    const archiveDrawer = document.getElementById('archive-drawer');
    const viewer = document.querySelector('.attachment-viewer');


    if (viewer && viewer.classList.contains('open')) return;


    if (archiveDrawer && archiveDrawer.classList.contains('open')) {
        if (window.__multiSiteDrawerLock) return;
        const clickedInsideArchiveDrawer = e.target.closest('#archive-drawer');
        const clickedArchiveTrigger = e.target.closest('.archive-drawer-link');
        if (clickedInsideArchiveDrawer) return;
        if (clickedArchiveTrigger) return;
        if (typeof closeDrawer === 'function') closeDrawer();
    }

});
let holdInterval = null;

function startHold(action) {
    stopHold();
    holdInterval = setInterval(() => {
        action();
        applyTransform();
    }, 50);
}

function stopHold() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
}

function resetViewerState() {
    currentZoom = defaultViewerState.zoom;
    currentX = defaultViewerState.x;
    currentY = defaultViewerState.y;
    cardRotX = defaultViewerState.rotX;
    cardRotY = defaultViewerState.rotY;
    cardRotZ = defaultViewerState.rotZ;
    cardFlipped = defaultViewerState.flipped;

    applyTransform();


    const video = currentVideo;
    if (video) {
        video.pause();
        video.currentTime = 0;
    }


    const playhead = document.getElementById('score-playhead');
    const playhead2 = document.getElementById('score-playhead-2');
    const pulse = document.getElementById('score-pulse');

    if (playhead) playhead.style.transform = '';
    if (playhead2) playhead2.style.transform = '';
    if (pulse) pulse.style.opacity = 0;
}

function applyTransform() {
    const wrapper = document.getElementById('media-wrapper');
    if (!wrapper) return;

    const cardSpace = wrapper.querySelector('.score-card-space');
    const media = wrapper.querySelector('img, video');


    const transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    wrapper.style.transform = transform;


    if (cardSpace) {
        const card = document.getElementById('score-card');
        if (card) {
            card.style.transform = `
        rotateX(${cardRotX}deg)
        rotateY(${cardRotY + (cardFlipped ? 180 : 0)}deg)
        rotateZ(${cardRotZ}deg)
      `;
        }
        return;
    }


    if (media) {
        media.style.transform = 'none';
    }
}


const joystickWrap = document.getElementById('joystick-wrap');
const knob = document.getElementById('joystick-knob');
let joyActive = false;
const joystick = document.getElementById('joystick');
const joyLight = document.getElementById('joystick-light');


let joyCenterX = 0;
let joyCenterY = 0;
let joyRaf = null;

if (joystick && knob) {

    joystick.addEventListener('pointerdown', () => {
        joyActive = true;


        const rect = joystick.getBoundingClientRect();
        joyCenterX = rect.left + rect.width / 2;
        joyCenterY = rect.top + rect.height / 2;

        if (joyLight) {
            joyLight.style.transition = 'opacity 0.2s ease, transform 0s linear';
        }
    });


    document.addEventListener('pointerup', () => {
        joyActive = false;
        if (joyRaf) {
            cancelAnimationFrame(joyRaf);
            joyRaf = null;
        }

        knob.style.transform = `translate(-50%, -50%)`;

        if (joyLight) {
            joyLight.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            joyLight.style.transform = `translate(0px, 0px)`;
            joyLight.style.opacity = 0;
        }
    });


    document.addEventListener('pointermove', (e) => {
        if (!joyActive) return;


        if (joyRaf) return;

        joyRaf = requestAnimationFrame(() => {

            let dx = e.clientX - joyCenterX;
            let dy = e.clientY - joyCenterY;
            const max = 32;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > max) {
                dx = (dx / dist) * max;
                dy = (dy / dist) * max;
            }

            knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            if (joyLight) {
                const intensity = dist / max;
                const lightDx = dx * 1.3;
                const lightDy = dy * 1.3;

                joyLight.style.transform = `translate(${lightDx}px, ${lightDy}px)`;
                joyLight.style.opacity = Math.min(intensity * 1.6, 1);
            }

            cardRotY += dx * 0.18;
            cardRotX -= dy * 0.18;
            const card = document.getElementById('score-card');
            if (typeof updateCardTransform === 'function') updateCardTransform(card);

            joyRaf = null;
        });
    });
}


document.addEventListener('click', (e) => {
    const card = document.getElementById('score-card');
    if (!card) return;

    if (e.target.id === 'score-flip') {
        cardFlipped = !cardFlipped;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-left') {
        cardRotY -= 12;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-right') {
        cardRotY += 12;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-up') {
        cardRotX += 8;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-down') {
        cardRotX -= 8;
        updateCardTransform(card);
    }
});


function updatePdfHudState() {
    const display = document.getElementById('pdf-page-num');
    const prev = document.getElementById('pdf-prev');
    const next = document.getElementById('pdf-next');
    const total = pdfDoc ? pdfDoc.numPages : 0;

    if (display) display.textContent = total ? `${pageNum} / ${total}` : '— / —';

    if (prev) {
        const enabled = Boolean(pdfDoc && pageNum > 1);
        prev.style.opacity = enabled ? '1' : '0.22';
        prev.style.pointerEvents = enabled ? 'auto' : 'none';
        prev.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    }
    if (next) {
        const enabled = Boolean(pdfDoc && pageNum < total);
        next.style.opacity = enabled ? '1' : '0.22';
        next.style.pointerEvents = enabled ? 'auto' : 'none';
        next.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    }
}

function queueRenderPage(num) {
    if (!pdfDoc) return;

    const clamped = Math.max(1, Math.min(pdfDoc.numPages, Number(num) || 1));
    pageNum = clamped;
    updatePdfHudState();

    if (pageRendering) {
        pageNumPending = clamped;
    } else {
        renderPage(clamped);
    }
}

function getPdfFitMetrics(page) {
    const stage = document.getElementById('attachment-stage');
    const wrapper = document.getElementById('media-wrapper');
    const baseViewport = page.getViewport({ scale: 1 });

    // The stage is the real visible document area. Fall back to wrapper/window
    // dimensions only if layout has not completed yet.
    const stageRect = stage?.getBoundingClientRect();
    const wrapperRect = wrapper?.getBoundingClientRect();
    const availableWidth = Math.max(
        160,
        stageRect?.width || wrapperRect?.width || window.innerWidth * 0.55
    );
    const availableHeight = Math.max(
        160,
        stageRect?.height || wrapperRect?.height || window.innerHeight * 0.62
    );

    const cssScale = Math.min(
        availableWidth / baseViewport.width,
        availableHeight / baseViewport.height
    ) * PDF_FIT_PADDING;

    // Render a denser backing canvas for sharp text, while keeping its CSS box
    // fitted to the viewer. Translation coordinates use this same viewport.
    const outputScale = Math.min(
        PDF_MAX_OUTPUT_SCALE,
        Math.max(1, window.devicePixelRatio || 1)
    );

    return {
        cssScale: Math.max(0.05, cssScale),
        outputScale,
        renderScale: Math.max(0.05, cssScale * outputScale)
    };
}

function applyPdfCanvasDisplaySize(canvas, translationCanvas, viewport, outputScale) {
    const cssWidth = viewport.width / outputScale;
    const cssHeight = viewport.height / outputScale;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    if (translationCanvas) {
        translationCanvas.style.width = `${cssWidth}px`;
        translationCanvas.style.height = `${cssHeight}px`;
    }

    const stack = document.getElementById('pdf-page-stack');
    if (stack) {
        stack.style.width = `${cssWidth}px`;
        stack.style.height = `${cssHeight}px`;
    }
}

function renderPage(num) {
    if (!pdfDoc) return;

    const renderingDoc = pdfDoc;
    const renderToken = ++documentTranslationToken;
    activePdfTextBlocks = [];
    clearPdfTranslationCanvas();
    pageRendering = true;

    renderingDoc.getPage(num).then(function (page) {
        if (renderingDoc !== pdfDoc) return null;

        const canvas = document.getElementById('pdf-canvas');
        const translationCanvas = document.getElementById('pdf-translation-canvas');
        if (!canvas) {
            pageRendering = false;
            return null;
        }

        const fitMetrics = getPdfFitMetrics(page);
        let outputScale = fitMetrics.outputScale;
        let viewport = page.getViewport({ scale: fitMetrics.renderScale });

        // Guard against unusually large pages / high-DPI displays.
        if (viewport.width * viewport.height > 15000000) {
            const reduction = Math.sqrt(15000000 / (viewport.width * viewport.height));
            outputScale = Math.max(1, outputScale * reduction);
            viewport = page.getViewport({ scale: fitMetrics.cssScale * outputScale });
        }

        const ctx = canvas.getContext('2d');
        canvas.height = Math.max(1, Math.floor(viewport.height));
        canvas.width = Math.max(1, Math.floor(viewport.width));
        applyPdfCanvasDisplaySize(canvas, translationCanvas, viewport, outputScale);
        canvas.style.opacity = '0.72';

        if (translationCanvas) {
            translationCanvas.width = canvas.width;
            translationCanvas.height = canvas.height;
            translationCanvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        }

        const renderTask = page.render({ canvasContext: ctx, viewport });
        const textPromise = typeof page.getTextContent === 'function'
            ? page.getTextContent().catch(() => null)
            : Promise.resolve(null);

        return Promise.all([renderTask.promise, textPromise]).then(([, textContent]) => {
            if (renderingDoc !== pdfDoc) return;

            pageRendering = false;
            canvas.style.opacity = '1';

            const loadingText = document.getElementById('pdf-loading');
            if (loadingText) loadingText.style.display = 'none';

            const pending = pageNumPending;
            pageNumPending = null;

            // Only prepare/translate the page that remains visible after rapid paging.
            if ((pending === null || pending === num) && renderToken === documentTranslationToken) {
                if (textContent && Array.isArray(textContent.items)) {
                    activePdfTextBlocks = buildPdfTranslationBlocks(textContent.items, viewport);
                    refreshInlineDocumentTranslation();
                } else {
                    activePdfTextBlocks = [];
                    clearPdfTranslationCanvas();
                }
            }

            updatePdfHudState();

            if (pending !== null && pending !== num) {
                renderPage(pending);
            }
        });
    }).catch(error => {
        if (renderingDoc !== pdfDoc) return;
        console.error('PDF render failed:', error);
        pageRendering = false;
        pageNumPending = null;
        activePdfTextBlocks = [];
        clearPdfTranslationCanvas();
        updatePdfHudState();
    });
}

let pdfFitResizeTimer = null;
window.addEventListener('resize', () => {
    if (!pdfDoc || !pdfFitMode || !document.getElementById('pdf-canvas')) return;
    clearTimeout(pdfFitResizeTimer);
    pdfFitResizeTimer = setTimeout(() => {
        if (!pdfDoc || !pdfFitMode) return;
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        applyTransform();
        queueRenderPage(pageNum);
    }, 140);
});

const ARCHIVE_COMBINED_RECORD_GROUPS = [
    {
        id: 'monastic-retreat-pair',
        memberNames: ['山融灶垣', '崖隐蚀垣']
    },
    {
        // Reserved for the second Fukushima record. Once its site name is
        // appended here, this card automatically becomes a combined record.
        id: 'fukushima-solastalgia-pair',
        memberNames: ['隐染悬里', '雾蚀空庐']
    }
];

function buildRecordStackEntries(recordSiteList) {
    const byName = new Map(recordSiteList.map(site => [site.name, site]));
    const groupedNames = new Set();
    const groupByName = new Map();

    ARCHIVE_COMBINED_RECORD_GROUPS.forEach(group => {
        group.memberNames.forEach(name => groupByName.set(name, group));
    });

    const entries = [];
    recordSiteList.forEach(site => {
        if (groupedNames.has(site.name)) return;
        const group = groupByName.get(site.name);
        if (group) {
            const members = group.memberNames.map(name => byName.get(name)).filter(Boolean);
            if (members.length > 1) {
                entries.push({ isGroup: true, group, sites: members });
                members.forEach(member => groupedNames.add(member.name));
                return;
            }
        }
        entries.push({ isGroup: false, group: null, sites: [site] });
        groupedNames.add(site.name);
    });
    return entries;
}

function unionSiteTags(groupSites) {
    const tags = new Set();
    groupSites.forEach(site => {
        (siteTagsMapping[site.name] || '')
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .forEach(tag => tags.add(tag));
    });
    return [...tags].join(', ');
}


// ---------------------------------------------------------------------------
// v50 · Sliding archive-document stack
// Keep a fixed fan of 23 diagonal record cards. Records outside the fan are
// flattened against the fan's top/bottom edge instead of continuing the
// horizontal drift. Hovering near either end moves the fan through the archive.
// ---------------------------------------------------------------------------
const RECORD_STACK_FAN_COUNT = 23;
const RECORD_STACK_FAN_GAP_Y = 18;
const RECORD_STACK_FAN_GAP_X = 3;
const RECORD_STACK_FLAT_MAX_GAP = 18;
const RECORD_STACK_FLAT_MIN_GAP = 5;
const RECORD_STACK_SHIFT_Y = 5;
const RECORD_STACK_HOVER_X_LIMIT = 285;
const RECORD_STACK_HOVER_EDGE = 92;
const RECORD_STACK_STEP_MS = 160;

const recordStackSlider = {
    container: null,
    docs: [],
    total: 0,
    windowStart: 0,
    windowEnd: -1,
    initialWindowEnd: -1,
    activeTop: 0,
    activeBottom: 0,
    topExtent: 0,
    bottomExtent: 0,
    hoverDirection: 0,
    hoverTimer: null,
    hoverTickToken: 0,
    pointerRaf: null,
    pointerX: 0,
    pointerY: 0,
    extractedDoc: null,
    listenersBound: false
};

function getRecordStackFlatGap(available, count) {
    if (count <= 0) return RECORD_STACK_FLAT_MAX_GAP;
    if (!Number.isFinite(available) || available <= 0) return RECORD_STACK_FLAT_MIN_GAP;
    return Math.max(
        RECORD_STACK_FLAT_MIN_GAP,
        Math.min(RECORD_STACK_FLAT_MAX_GAP, available / count)
    );
}

function layoutRecordStackSlider() {
    const state = recordStackSlider;
    if (!state.container || !state.docs.length) return;

    const total = state.total;
    const start = state.windowStart;
    const end = state.windowEnd;
    const activeCount = Math.max(0, end - start + 1);
    const activeHeight = Math.max(0, activeCount - 1) * RECORD_STACK_FAN_GAP_Y;
    const viewportHeight = Math.max(560, window.innerHeight || 0);

    const travelled = Math.max(0, state.initialWindowEnd - end);
    const baseTop = Math.max(205, Math.min(300, viewportHeight * 0.285));
    const bottomReserve = 72;
    const maxActiveTop = Math.max(150, viewportHeight - bottomReserve - activeHeight - 72);
    const activeTop = Math.min(maxActiveTop, baseTop + travelled * RECORD_STACK_SHIFT_Y);
    const activeBottom = activeTop + activeHeight;

    const topCount = Math.max(0, total - 1 - end);
    const bottomCount = Math.max(0, start);
    const topMargin = 18;
    const bottomLimit = viewportHeight - bottomReserve;
    const topGap = getRecordStackFlatGap(activeTop - topMargin, topCount);
    const bottomGap = getRecordStackFlatGap(bottomLimit - activeBottom, bottomCount);
    const bottomFanX = -Math.max(0, activeCount - 1) * RECORD_STACK_FAN_GAP_X;

    state.activeTop = activeTop;
    state.activeBottom = activeBottom;
    state.topExtent = topCount ? activeTop - topCount * topGap : activeTop;
    state.bottomExtent = bottomCount ? activeBottom + bottomCount * bottomGap : activeBottom;

    state.docs.forEach((doc, index) => {
        doc.dataset.stackOrderIndex = String(index);

        let y = activeTop;
        let x = 0;
        let z = 1000;
        let mode = 'stack-fan';

        if (index > end) {
            const distance = index - end;
            y = activeTop - distance * topGap;
            x = 0;
            z = 900 + Math.max(0, topCount - distance);
            mode = 'stack-flat-top';
        } else if (index < start) {
            const distance = start - index;
            y = activeBottom + distance * bottomGap;
            x = bottomFanX;
            z = 1000 + activeCount + distance;
            mode = 'stack-flat-bottom';
        } else {
            const rank = end - index;
            y = activeTop + rank * RECORD_STACK_FAN_GAP_Y;
            x = -rank * RECORD_STACK_FAN_GAP_X;
            z = 1000 + rank;
            mode = 'stack-fan';
        }

        // top/left cause layout for every card. CSS variables feed one compositor
        // transform instead, keeping the 23-card fan GPU-cheap.
        const xValue = `${x}px`;
        const yValue = `${y}px`;
        if (doc.style.getPropertyValue('--stack-x') !== xValue) doc.style.setProperty('--stack-x', xValue);
        if (doc.style.getPropertyValue('--stack-y') !== yValue) doc.style.setProperty('--stack-y', yValue);

        const previousMode = doc.dataset.stackMode;
        if (previousMode !== mode) {
            if (previousMode) doc.classList.remove(previousMode);
            doc.classList.add(mode);
            doc.dataset.stackMode = mode;
        }

        const zValue = String(z);
        if (doc.dataset.zIndex !== zValue) doc.dataset.zIndex = zValue;
        if (state.extractedDoc !== doc && doc.style.zIndex !== zValue) doc.style.zIndex = zValue;
    });
}

function stopRecordStackHover() {
    const state = recordStackSlider;
    state.hoverDirection = 0;
    state.hoverTickToken += 1;
    if (state.hoverTimer) {
        clearTimeout(state.hoverTimer);
        state.hoverTimer = null;
    }
}

function shiftRecordStackWindow(direction) {
    const state = recordStackSlider;
    if (!state.docs.length) return false;
    if (state.extractedDoc) return false;

    if (direction < 0) {
        // Move down into older records.
        if (state.windowStart <= 0) return false;
        state.windowStart -= 1;
        state.windowEnd -= 1;
    } else if (direction > 0) {
        // Move up into newer records.
        if (state.windowEnd >= state.total - 1) return false;
        state.windowStart += 1;
        state.windowEnd += 1;
    } else {
        return false;
    }

    layoutRecordStackSlider();
    return true;
}

function setRecordStackHoverDirection(direction) {
    const state = recordStackSlider;
    if (state.hoverDirection === direction) return;
    stopRecordStackHover();
    state.hoverDirection = direction;
    if (!direction) return;

    // One immediate step, then a non-overlapping timer. The CSS transition is
    // shorter than the interval, so animations no longer pile up indefinitely.
    const token = ++state.hoverTickToken;
    shiftRecordStackWindow(direction);
    const tick = () => {
        if (token !== state.hoverTickToken || state.hoverDirection !== direction) return;
        if (!shiftRecordStackWindow(direction)) {
            stopRecordStackHover();
            return;
        }
        state.hoverTimer = setTimeout(tick, RECORD_STACK_STEP_MS);
    };
    state.hoverTimer = setTimeout(tick, RECORD_STACK_STEP_MS);
}

function processRecordStackPointerMove() {
    const state = recordStackSlider;
    state.pointerRaf = null;
    if (!state.container || !state.docs.length || isCompactViewport() || state.extractedDoc) {
        stopRecordStackHover();
        return;
    }

    const x = state.pointerX;
    const y = state.pointerY;
    const inHorizontalRail = x >= 0 && x <= RECORD_STACK_HOVER_X_LIMIT;
    const verticalMin = Math.max(0, state.topExtent - 38);
    const verticalMax = Math.min(window.innerHeight, state.bottomExtent + 38);

    if (!inHorizontalRail || y < verticalMin || y > verticalMax) {
        stopRecordStackHover();
        return;
    }

    if (state.windowEnd < state.total - 1 && y <= state.activeTop + RECORD_STACK_HOVER_EDGE) {
        setRecordStackHoverDirection(1);
        return;
    }

    if (state.windowStart > 0 && y >= state.activeBottom - RECORD_STACK_HOVER_EDGE) {
        setRecordStackHoverDirection(-1);
        return;
    }

    stopRecordStackHover();
}

function handleRecordStackPointerMove(event) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const state = recordStackSlider;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    if (state.pointerRaf !== null) return;
    state.pointerRaf = requestAnimationFrame(processRecordStackPointerMove);
}

function setupRecordStackSlider(container) {
    const state = recordStackSlider;
    stopRecordStackHover();

    state.container = container;
    state.docs = Array.from(container.querySelectorAll('.archive-doc'));
    state.total = state.docs.length;
    state.extractedDoc = null;
    state.docs.forEach(doc => {
        // Clear the legacy top/left fan positions once; subsequent movement is
        // compositor-only through --stack-x / --stack-y.
        doc.style.top = '0px';
        doc.style.left = '0px';
    });
    state.windowEnd = Math.max(-1, state.total - 1);
    state.windowStart = Math.max(0, state.windowEnd - RECORD_STACK_FAN_COUNT + 1);
    state.initialWindowEnd = state.windowEnd;

    container.classList.toggle('sliding-record-stack', state.total > RECORD_STACK_FAN_COUNT);
    layoutRecordStackSlider();

    if (!state.listenersBound) {
        document.addEventListener('pointermove', handleRecordStackPointerMove, { passive: true });
        window.addEventListener('blur', stopRecordStackHover);
        window.addEventListener('resize', () => {
            stopRecordStackHover();
            requestAnimationFrame(layoutRecordStackSlider);
        });
        state.listenersBound = true;
    }
}

// v55 · Smooth archive-doc retraction
// Keep the sheet in its extracted coordinate system while it animates back to
// the stack transform. Only remove the extracted state after the transition
// finishes, avoiding the one-frame jump to top: 0.
function retractArchiveDocSmooth(docEl) {
    if (!docEl || !docEl.classList.contains('extracted')) return;
    if (docEl.classList.contains('retracting')) return;

    const isRecordDoc = !!docEl.closest('#stack-record');

    // The right garden stack already has a stable CSS return path. Keep its
    // existing behavior; the extra retracting state is needed for the sliding
    // left record stack because its resting position lives in --stack-x/y.
    if (!isRecordDoc) {
        docEl.classList.remove('extracted');
        docEl.style.zIndex = docEl.dataset.zIndex;
        return;
    }

    docEl.classList.add('retracting');

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        docEl.classList.remove('retracting', 'extracted');
        docEl.style.zIndex = docEl.dataset.zIndex;
        if (recordStackSlider.extractedDoc === docEl) {
            recordStackSlider.extractedDoc = null;
        }
    };

    const onEnd = (event) => {
        if (event.target !== docEl) return;
        if (event.propertyName !== 'transform' && event.propertyName !== 'top') return;
        docEl.removeEventListener('transitionend', onEnd);
        finish();
    };

    docEl.addEventListener('transitionend', onEnd);
    // Safety fallback for interrupted transitions / background tabs.
    window.setTimeout(() => {
        docEl.removeEventListener('transitionend', onEnd);
        finish();
    }, 620);
}


// ============================================================================
// v72 · Static 128×128 thumbnail display
// ----------------------------------------------------------------------------
// These files are authored offline and placed directly in /thumbnails/.
// There is NO browser-side generator, JSON config, Python integration,
// source-photo fallback, or automatic thumbnail creation.
// Images are requested only when an archive sheet is actually extracted or
// when the expanded compass settles on a site.
// ============================================================================
const GARDEN_ARCHIVE_THUMBNAILS = Object.freeze({
    "瘟猪坝沉墟": "thumbnails/garden-128/effluent-sedimentation.webp",
    "电台路焦土": "thumbnails/garden-128/aether-scorched-earth.webp"
});

const SITE_THUMBNAILS = Object.freeze({
    "瘟猪坝沉墟": "thumbnails/effluent-sedimentation.webp",
    "电台路焦土": "thumbnails/aether-scorched-earth.webp",
    "山葬灰脉": "thumbnails/yellow-mountain.webp",
    "硅脉遗厂": "thumbnails/silicon-vein-works.webp",
    "琉棘庭": "thumbnails/walled-gallery.webp",
    "裂翼坪": "thumbnails/fallen-wing-field.webp",
    "轨畔孤构": "thumbnails/rail-side.webp",
    "残柱林": "thumbnails/concrete-pole.webp",
    "钟寂残堂": "thumbnails/bell-silent-church.webp",
    "池骸湾": "thumbnails/bath-crack.webp",
    "毒烬轮冢": "thumbnails/toxic-tire-pyre.webp",
    "褶层湾": "thumbnails/quarry-bay-stairway.webp",
    "隐染悬里": "thumbnails/suspended-homeland.webp",
    "雾蚀空庐": "thumbnails/mist-eroded-hut.webp",
    "锈祷圣堂": "thumbnails/rust-prayer-sanctuary.webp",
    "釉骸拓壁": "thumbnails/membrane.webp",
    "叠骸构阵": "thumbnails/fish-mouth.webp",
    "苔网塬": "thumbnails/gloss-veil.webp",
    "陆坞舰骸": "thumbnails/brick-battleship.webp",
    "墟响厅": "thumbnails/mirror.webp",
    "波蚀脊堤": "thumbnails/wave-eroded-structure.webp",
    "曜原驿": "thumbnails/solar.webp",
    "溶境遗廊": "thumbnails/aquarium-bunker.webp",
    "荒娱敖包": "thumbnails/mountain-signal.webp",
    "彩壳堡": "thumbnails/castle.webp",
    "削岩残居": "thumbnails/roof.webp",
    "隐阶空墅": "thumbnails/hidden-stair-villa.webp",
    "暮辉骸殿": "thumbnails/afterglow-palace.webp",
    "迁痕空埠": "thumbnails/dock.webp",
    "山骸窟殿": "thumbnails/phospho.webp",
    "山融灶垣": "thumbnails/earthwall.webp",
    "崖隐蚀垣": "thumbnails/cliff-granary.webp",
    "褶脊胚庭": "thumbnails/compressed-courtyard.webp",
    "草间稚居": "thumbnails/grass-child-dwelling.webp"
});

function getThumbnailSite(siteOrSites, sourceMap = SITE_THUMBNAILS) {
    const list = Array.isArray(siteOrSites) ? siteOrSites : [siteOrSites];
    return list.find(site => site?.name && sourceMap[site.name]) || null;
}

function mountStaticThumbnail(
    frame,
    site,
    sourceMap = SITE_THUMBNAILS,
    authoredSize = 128
) {
    if (!frame) return;

    const thumbnailSite = getThumbnailSite(site, sourceMap);
    const src = thumbnailSite ? sourceMap[thumbnailSite.name] : '';

    if (!src) {
        frame.replaceChildren();
        frame.classList.remove('has-image');
        frame.removeAttribute('data-thumbnail-src');
        return;
    }

    if (
        frame.dataset.thumbnailSrc === src &&
        frame.querySelector('img')
    ) {
        return;
    }

    frame.classList.remove('has-image');
    frame.dataset.thumbnailSrc = src;
    frame.replaceChildren();

    const img = new Image();
    img.className = 'site-preview-thumbnail';
    img.alt = '';
    img.width = authoredSize;
    img.height = authoredSize;
    img.decoding = 'async';
    img.loading = 'eager';
    img.fetchPriority = 'low';
    img.draggable = false;

    img.addEventListener('load', () => {
        if (frame.dataset.thumbnailSrc !== src) return;
        frame.classList.add('has-image');
    }, { once: true });

    img.addEventListener('error', () => {
        if (frame.dataset.thumbnailSrc !== src) return;
        frame.replaceChildren();
        frame.classList.remove('has-image');
        frame.removeAttribute('data-thumbnail-src');
    }, { once: true });

    frame.appendChild(img);
    img.src = src;
}




// ============================================================================
// v94 · Ruin Fracture System
// ----------------------------------------------------------------------------
// Revised logic:
// - remove accidental orthogonal "kinks"
// - simplify compass to one controlled crack motif
// - move lower damage emphasis from the hidden frame edge to the index drawer
// - keep archive-doc damage restrained and hairline-free
// - top perspective lines and drawer diagonals get localized chips instead of
//   noisy branching
// ============================================================================
const RuinFractureSystem = (() => {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    const sessionSeed = (() => {
        try {
            return crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
        } catch (_) {
            return ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
        }
    })();

    function hashString(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function rngFor(label) {
        return mulberry32((sessionSeed ^ hashString(label)) >>> 0);
    }

    const lerp = (a, b, t) => a + (b - a) * t;
    const CONNECTING_RETURN_OPACITY = 0.70;
    function pointAt(a, b, t) {
        return {
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t)
        };
    }

    function vec(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        return { dx, dy, len, ux: dx / len, uy: dy / len };
    }

    function extendPast(point, fromPoint, distance = 1.2) {
        const v = vec(fromPoint, point);
        return {
            x: point.x + v.ux * distance,
            y: point.y + v.uy * distance
        };
    }

    function leftNormal(a, b) {
        const v = vec(a, b);
        return { x: -v.uy, y: v.ux };
    }

    function getCssNumber(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const num = parseFloat(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function makeSvg(className) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.classList.add('ruin-fracture-overlay', className);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('preserveAspectRatio', 'none');
        return svg;
    }

    function makePath(d, className, opacity = null) {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        if (opacity != null) path.style.opacity = String(opacity);
        return path;
    }

    function polylineD(points) {
        return points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
        ).join(' ');
    }

    function addPolyline(svg, points, className, opacity = null) {
        svg.appendChild(makePath(polylineD(points), className, opacity));
    }

    function ensureGlobalLayer() {
        let layer = document.getElementById('ruin-fracture-global-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'ruin-fracture-global-layer';
            document.body.appendChild(layer);
        }
        return layer;
    }

    function setViewBox(svg, width, height) {
        svg.setAttribute('viewBox', `0 0 ${Math.max(1, width)} ${Math.max(1, height)}`);
    }

    function clearTargetOverlays(target) {
        if (!target) return;
        target.querySelectorAll(':scope > .ruin-fracture-overlay').forEach(node => node.remove());
    }

    function organicPoints(start, end, rng, amplitude = 12, segments = 5) {
        const v = vec(start, end);
        const normal = { x: -v.uy, y: v.ux };
        const pts = [start];
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const base = pointAt(start, end, t);
            const weight = Math.sin(Math.PI * t);
            const offset = (rng() - 0.5) * 2 * amplitude * weight;
            pts.push({
                x: base.x + normal.x * offset,
                y: base.y + normal.y * offset
            });
        }
        pts.push(end);
        return pts;
    }

    function addSmoothCrack(svg, start, end, rng, opts = {}) {
        const points = organicPoints(
            start,
            end,
            rng,
            opts.amplitude ?? 10,
            opts.segments ?? 5
        );
        addPolyline(svg, points, opts.className || 'ruin-fracture-crack', opts.opacity ?? 0.58);
        return points;
    }

    function ceramicCrackPoints(start, end, rng, opts = {}) {
        const v = vec(start, end);
        if (v.len < 2) return [start, end];

        const normal = { x: -v.uy, y: v.ux };
        const tangent = { x: v.ux, y: v.uy };
        const segments = Math.max(4, opts.segments ?? 5);
        const amplitude = opts.amplitude ?? 8;
        const curveDir = opts.curveDir ?? (rng() < 0.5 ? -1 : 1);

        // v126 · ceramic / glaze crack:
        // a soft continuous bow is the dominant gesture, with occasional
        // short mineral-like deviations so it does not become a perfect spline.
        const curveAmount =
            (opts.curveAmount ?? (amplitude * (0.42 + rng() * 0.30))) * curveDir;
        const detailScale = opts.detailScale ?? 0.11;
        const stoneBias = opts.stoneBias ?? 0.22;
        const tangentScale = opts.tangentScale ?? 0.055;

        const pts = [start];
        let mineralDrift = 0;

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const base = pointAt(start, end, t);
            const weight = Math.sin(Math.PI * t);

            // Soft ceramic bow: widest around the middle, gently easing into edges.
            const eased = Math.pow(weight, 0.92);
            const bow = curveAmount * eased;

            // Fine glaze irregularity: low-amplitude, mostly following one side.
            const glazeNoise =
                curveDir *
                amplitude *
                (0.018 + rng() * detailScale) *
                eased;

            // Stone/mineral texture: rare small plane-shift that persists for
            // one or two points, producing a blunt natural kink instead of a spike.
            if (rng() < stoneBias) {
                mineralDrift +=
                    (rng() - 0.48) *
                    amplitude *
                    (0.10 + rng() * 0.10);
            } else {
                mineralDrift *= 0.52;
            }
            mineralDrift = Math.max(
                -amplitude * 0.26,
                Math.min(amplitude * 0.26, mineralDrift)
            );

            const tangentJitter =
                (rng() - 0.5) *
                amplitude *
                tangentScale *
                eased;

            pts.push({
                x:
                    base.x +
                    normal.x * (bow + glazeNoise + mineralDrift) +
                    tangent.x * tangentJitter,
                y:
                    base.y +
                    normal.y * (bow + glazeNoise + mineralDrift) +
                    tangent.y * tangentJitter
            });
        }

        pts.push(end);
        return pts;
    }

    function addCeramicCrack(svg, start, end, rng, opts = {}) {
        const points = ceramicCrackPoints(start, end, rng, opts);
        addPolyline(svg, points, opts.className || 'ruin-fracture-crack', opts.opacity ?? 0.58);
        return points;
    }

    function stoneEdgeCrackPoints(start, end, rng, opts = {}) {
        const v = vec(start, end);
        if (v.len < 2) return [start, end];

        const normal = { x: -v.uy, y: v.ux };
        const tangent = { x: v.ux, y: v.uy };
        const segments = Math.max(3, opts.segments ?? 4);
        const amplitude = opts.amplitude ?? 3.1;
        const curveDir = opts.curveDir ?? (rng() < 0.5 ? -1 : 1);
        const quant = opts.quant ?? 4.2;
        const pts = [start];
        let stoneDrift = (rng() - 0.5) * amplitude * 0.30;

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const base = pointAt(start, end, t);
            const edgeWeight = Math.pow(1 - t, 0.48);
            const bow = curveDir * amplitude * 0.18 * Math.sin(Math.PI * Math.min(1, t * 0.92));

            if (rng() < 0.74) {
                stoneDrift += (rng() - 0.46) * amplitude * (0.36 + edgeWeight * 0.22);
            } else {
                stoneDrift *= 0.58;
            }
            stoneDrift = Math.max(-amplitude * 0.95, Math.min(amplitude * 0.95, stoneDrift));

            const facetedOffset = Math.round((bow + stoneDrift) * quant) / quant;
            const tangentJitter = (rng() - 0.5) * amplitude * 0.14 * edgeWeight;

            pts.push({
                x: base.x + normal.x * facetedOffset + tangent.x * tangentJitter,
                y: base.y + normal.y * facetedOffset + tangent.y * tangentJitter
            });
        }

        pts.push(end);
        return pts;
    }

    function addStoneEdgeCrack(svg, start, end, rng, opts = {}) {
        const points = stoneEdgeCrackPoints(start, end, rng, opts);
        addPolyline(svg, points, opts.className || 'ruin-fracture-crack ruin-fracture-edge-stone', opts.opacity ?? 0.44);
        return points;
    }

    function addStoneCeramicCrack(svg, start, end, rng, opts = {}) {
        const amplitude = opts.amplitude ?? 8;
        const points = ceramicCrackPoints(start, end, rng, {
            ...opts,
            segments: Math.max(4, opts.segments ?? 5),
            curveAmount: opts.curveAmount ?? (amplitude * (0.20 + rng() * 0.10)),
            detailScale: opts.detailScale ?? 0.15,
            stoneBias: opts.stoneBias ?? 0.34,
            tangentScale: opts.tangentScale ?? 0.048
        });
        addPolyline(
            svg,
            points,
            opts.className || 'ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-ceramic-stone',
            opts.opacity ?? 0.42
        );
        return points;
    }

    function addBranch(svg, root, end, rng, opts = {}) {
        const pts = organicPoints(
            root,
            end,
            rng,
            opts.amplitude ?? 8,
            opts.segments ?? 3
        );
        addPolyline(svg, pts, opts.className || 'ruin-fracture-crack ruin-fracture-branch', opts.opacity ?? 0.42);
    }

    function addBrokenSegment(svg, a, b, rng, opts = {}) {
        const v = vec(a, b);
        if (v.len < 8) {
            addPolyline(svg, [a, b], opts.className || 'ruin-fracture-border', opts.opacity ?? 0.86);
            return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        }

        const n = leftNormal(a, b);
        const sign = opts.normalSign ?? 1;
        const width = Math.min(opts.width ?? 12, v.len * 0.22);
        const halfT = (width * 0.5) / v.len;
        const t = Math.max(0.16, Math.min(0.84, opts.t ?? (0.35 + rng() * 0.30)));
        const depth = opts.depth ?? 8;
        const p1 = pointAt(a, b, t - halfT);
        const p2 = pointAt(a, b, t + halfT);
        const mid = pointAt(a, b, t);

        const tangentJitter = (rng() - 0.5) * width * 0.28;
        const tangent = { x: v.ux, y: v.uy };

        const q1 = {
            x: p1.x + tangent.x * tangentJitter * 0.35 + n.x * sign * depth * 0.42,
            y: p1.y + tangent.y * tangentJitter * 0.35 + n.y * sign * depth * 0.42
        };
        const qm = {
            x: mid.x + tangent.x * tangentJitter * 0.08 + n.x * sign * depth,
            y: mid.y + tangent.y * tangentJitter * 0.08 + n.y * sign * depth
        };
        const q2 = {
            x: p2.x - tangent.x * tangentJitter * 0.28 + n.x * sign * depth * 0.50,
            y: p2.y - tangent.y * tangentJitter * 0.28 + n.y * sign * depth * 0.50
        };

        const points = [a, p1, q1, qm, q2, p2, b];
        addPolyline(svg, points, opts.className || 'ruin-fracture-border', opts.opacity ?? 0.86);
        return qm;
    }

    function addNaturalChipSegment(svg, a, b, rng, opts = {}) {
        const v = vec(a, b);
        if (v.len < 12) {
            addPolyline(svg, [a, b], opts.className || 'ruin-fracture-border', opts.opacity ?? 0.86);
            return null;
        }

        const n = leftNormal(a, b);
        const sign = opts.normalSign ?? 1;
        const width = Math.min(opts.width ?? 46, v.len * 0.42);
        const halfT = (width * 0.5) / v.len;
        const t = Math.max(0.18, Math.min(0.82, opts.t ?? (0.30 + rng() * 0.40)));
        const depth = opts.depth ?? 4.8;
        const lip = opts.lip ?? 0.12;

        const p1 = pointAt(a, b, t - halfT);
        const p2 = pointAt(a, b, t + halfT);
        const tangent = { x: v.ux, y: v.uy };
        const lead1 = pointAt(a, p1, Math.max(0, 1 - lip));
        const lead2 = pointAt(p2, b, Math.min(1, lip));

        // Edge bite logic: the missing piece can start with a tiny vertical-ish
        // drop on either side, or on both sides.  The drop is deliberately
        // shallow so it reads as a chipped edge rather than a deep notch.
        const modeRoll = rng();
        const biteStart = modeRoll < 0.72;   // most variants include the start bite
        const biteEnd = modeRoll > 0.28;     // overlap produces a sizeable "both" zone
        const startBiteDepth = biteStart ? depth * (0.34 + rng() * 0.20) : 0;
        const endBiteDepth = biteEnd ? depth * (0.30 + rng() * 0.20) : 0;

        const entry1 = biteStart ? {
            x: p1.x + tangent.x * width * (0.018 + rng() * 0.016) + n.x * sign * startBiteDepth,
            y: p1.y + tangent.y * width * (0.018 + rng() * 0.016) + n.y * sign * startBiteDepth
        } : p1;

        const entry2 = biteEnd ? {
            x: p2.x - tangent.x * width * (0.018 + rng() * 0.016) + n.x * sign * endBiteDepth,
            y: p2.y - tangent.y * width * (0.018 + rng() * 0.016) + n.y * sign * endBiteDepth
        } : p2;

        // Many very small facets across a mostly flat-bottomed loss.  The
        // centre stays shallow and irregular, while the edge bites make the
        // subtraction legible at a glance.
        const facetCount = 7 + Math.floor(rng() * 3); // 7–9 tiny facets
        const facets = [];

        for (let i = 1; i < facetCount; i++) {
            const u = i / facetCount;
            const base = pointAt(p1, p2, u);

            // Broad plateau rather than a smooth bowl: most of the missing
            // strip sits at a similar shallow depth with tiny chipped variation.
            const plateau = 0.62 + 0.14 * Math.sin(Math.PI * u);
            const asymmetry = 0.90 + (rng() - 0.5) * 0.20;
            const micro = (rng() - 0.5) * depth * 0.14;
            const localDepth = Math.max(
                depth * 0.34,
                depth * plateau * asymmetry + micro
            );

            const tangentJitter = (rng() - 0.5) * width * 0.012;
            facets.push({
                x: base.x + tangent.x * tangentJitter + n.x * sign * localDepth,
                y: base.y + tangent.y * tangentJitter + n.y * sign * localDepth
            });
        }

        const edgePoints = [a, lead1, p1, entry1, ...facets, entry2, p2, lead2, b];

        addPolyline(
            svg,
            edgePoints,
            opts.className || 'ruin-fracture-border',
            opts.opacity ?? 0.86
        );

        if (opts.addReturnLine) {
            const returnInset = opts.returnInset ?? Math.max(1.0, depth * 0.22);
            const c1 = {
                x: p1.x + tangent.x * width * 0.26 + n.x * sign * returnInset,
                y: p1.y + tangent.y * width * 0.26 + n.y * sign * returnInset
            };
            const c2 = {
                x: p1.x + tangent.x * width * 0.74 + n.x * sign * returnInset,
                y: p1.y + tangent.y * width * 0.74 + n.y * sign * returnInset
            };
            const returnPath = [
                `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
                `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
            ].join(' ');
            svg.appendChild(makePath(
                returnPath,
                opts.returnClassName || 'ruin-fracture-crack ruin-fracture-chip-return',
                opts.returnOpacity ?? CONNECTING_RETURN_OPACITY
            ));
        }

        return {
            p1, p2, entry1, entry2, facets,
            tangent, normal: n, sign, width, depth,
            edgeStart: a, edgeEnd: b,
            edgePoints
        };
    }

    function addTreeCorner(svg, roots, joint, trunkEnd, rng, opts = {}) {
        addSmoothCrack(svg, roots[0], joint, rng, {
            amplitude: opts.rootAmplitude ?? 8,
            segments: opts.rootSegments ?? 4,
            opacity: opts.opacity ?? 0.55
        });
        addSmoothCrack(svg, roots[1], joint, rng, {
            amplitude: opts.rootAmplitude ?? 8,
            segments: opts.rootSegments ?? 4,
            opacity: opts.opacity ?? 0.55
        });

        const trunk = addSmoothCrack(svg, joint, trunkEnd, rng, {
            amplitude: opts.trunkAmplitude ?? 10,
            segments: opts.trunkSegments ?? 5,
            opacity: (opts.opacity ?? 0.55) + 0.03
        });

        const pA = trunk[Math.max(1, Math.floor(trunk.length * 0.35))];
        const pB = trunk[Math.max(1, Math.floor(trunk.length * 0.55))];

        if (opts.branch1) addBranch(svg, pA, opts.branch1, rng, { amplitude: 6, segments: 3, opacity: 0.40 });
        if (opts.branch2) addBranch(svg, pB, opts.branch2, rng, { amplitude: 5, segments: 3, opacity: 0.34 });
    }
    function addTopOuterChip(svg, a, b, rng, opts = {}) {
        const v = vec(a, b);
        if (v.len < 24) {
            addPolyline(svg, [a, b], opts.className || 'ruin-fracture-border', opts.opacity ?? 0.86);
            return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5, side: 'left', towardSide: -1 };
        }

        const side = opts.side || (rng() < 0.5 ? 'left' : 'right');
        const t = side === 'left'
            ? (opts.t ?? (0.18 + rng() * 0.14))
            : (opts.t ?? (0.68 + rng() * 0.14));

        const width = Math.min(opts.width ?? (22 + rng() * 10), v.len * 0.15);
        const depth = opts.depth ?? (6.6 + rng() * 2.2);
        const halfT = (width * 0.5) / v.len;
        const p1 = pointAt(a, b, Math.max(0.05, t - halfT));
        const p2 = pointAt(a, b, Math.min(0.95, t + halfT));
        const tangent = { x: v.ux, y: v.uy };
        const towardSide = side === 'left' ? -1 : 1;
        const jitter = () => (rng() - 0.5) * Math.min(0.55, width * 0.014);

        // A small chipped-tile profile: one missing corner-like bite, slightly
        // asymmetric shoulders, and a sharp root that launches the outward crack.
        const leftLeadT = 0.16 + rng() * 0.06;
        const leftShelfT = 0.29 + rng() * 0.07;
        const rootT = side === 'left'
            ? (0.39 + rng() * 0.06)
            : (0.58 + rng() * 0.06);
        const rightShelfT = rootT + (0.11 + rng() * 0.05);
        const rightExitT = rightShelfT + (0.10 + rng() * 0.05);

        const shallowA = 0.55 + rng() * 0.50;
        const shallowB = 0.95 + rng() * 0.70;
        const shoulderA = 2.10 + rng() * 0.85;
        const shoulderB = 1.55 + rng() * 0.70;
        const rootDepth = depth * (1.00 + rng() * 0.16);

        const pts = [a, p1];
        const pLead = {
            x: p1.x + tangent.x * (width * leftLeadT + jitter()),
            y: p1.y - shallowA
        };
        const pShelf = {
            x: p1.x + tangent.x * (width * leftShelfT + jitter()),
            y: p1.y - shoulderA
        };
        const pPreRoot = {
            x: p1.x + tangent.x * (width * Math.max(leftShelfT + 0.05, rootT - (0.06 + rng() * 0.02)) + jitter()),
            y: p1.y - (rootDepth * (0.68 + rng() * 0.08))
        };
        const crackRoot = {
            x: p1.x + tangent.x * (width * rootT + jitter()),
            y: p1.y - rootDepth
        };
        const pPostRoot = {
            x: p1.x + tangent.x * (width * Math.min(0.88, rightShelfT - (0.02 + rng() * 0.015)) + jitter()),
            y: p1.y - (rootDepth * (0.58 + rng() * 0.10))
        };
        const pRightShelf = {
            x: p1.x + tangent.x * (width * Math.min(0.90, rightShelfT) + jitter()),
            y: p1.y - shoulderB
        };
        const pRightExit = {
            x: p1.x + tangent.x * (width * Math.min(0.93, rightExitT) + jitter()),
            y: p1.y - shallowB
        };

        pts.push(pLead, pShelf, pPreRoot, crackRoot, pPostRoot, pRightShelf, pRightExit, p2, b);
        addPolyline(svg, pts, opts.className || 'ruin-fracture-border', opts.opacity ?? 0.88);

        if (opts.addReturnLine) {
            const returnLift = opts.returnLift ?? Math.max(1.1, depth * 0.20);
            const c1 = {
                x: p1.x + tangent.x * width * 0.28,
                y: p1.y - returnLift
            };
            const c2 = {
                x: p1.x + tangent.x * width * 0.72,
                y: p1.y - returnLift
            };
            const returnPath = [
                `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
                `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
            ].join(' ');
            svg.appendChild(makePath(
                returnPath,
                opts.returnClassName || 'ruin-fracture-crack ruin-fracture-chip-return',
                opts.returnOpacity ?? CONNECTING_RETURN_OPACITY
            ));
        }

        return { ...crackRoot, side, towardSide, p1, p2 };
    }

    function renderMainFrame() {



        const target = document.getElementById('main-viewport-frame');
        if (!target) return;

        clearTargetOverlays(target);
        const rect = target.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const rng = rngFor('main-frame-v132');

        const svg = makeSvg('ruin-fracture-main-frame');
        setViewBox(svg, w, h);

        const topLeft = { x: 0.5, y: 0.5 };
        const topRight = { x: w - 0.5, y: 0.5 };
        const bottomRight = { x: w - 0.5, y: h + 2.5 };
        const bottomLeft = { x: 0.5, y: h + 2.5 };

        // v244 · the title-area top notch can now appear on either side with
        // a clean 50/50 split. Keep the earlier directional logic: if it sits on
        // the left, the connected crack grows leftward; if on the right, it grows
        // rightward. Also darken the connecting return line so it reads more like
        // a墓碑拓印 / stone-spall seam.
        const titleSide = rng() < 0.50 ? 'left' : 'right';
        const topNotchT = titleSide === 'left'
            ? (0.10 + rng() * 0.24)
            : (0.66 + rng() * 0.20);
        const topNotchWidth = 22 + rng() * 18;
        const topNotchDepth = 7.2 + rng() * 5.6;
        const notchTip = addTopOuterChip(svg, topLeft, topRight, rngFor(`main-frame-top-notch-v124-${titleSide}`), {
            side: titleSide,
            t: topNotchT,
            width: topNotchWidth,
            depth: topNotchDepth,
            opacity: 0.90,
            addReturnLine: true,
            returnLift: 0.70 + rng() * 0.20,
            returnOpacity: 0.72,
            returnClassName: 'ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-title-notch-return'
        });

        // v148 · lower-right chipped notch + outward tree fracture.
        // Flip the mouth so it opens to the RIGHT/outside, and make the chip
        // slightly wider/larger so it reads like a stone spall rather than an
        // inward bite. The crack should launch from that outer mouth.
        const rightNotchRng = rngFor('main-frame-right-lower-notch-v174');
        // v174 · lower-right opening: rougher stone-spall logic.
        // Keep the broad shallow broken plane, but introduce uneven stone facets,
        // stronger upper/lower stress imbalance, and a small pointed outlet that
        // launches the tree crack.  The outline should feel fractured, not drawn.
        const rightNotchY = h * (0.65 + rightNotchRng() * 0.20);
        const notchWidthScale = 2.0 + rightNotchRng() * 2.2;
        const baseHalfH = 8.4 + rightNotchRng() * 3.6;
        const notchUpperH = baseHalfH * notchWidthScale * (0.54 + rightNotchRng() * 0.72);
        const notchLowerH = baseHalfH * notchWidthScale * (0.50 + rightNotchRng() * 0.78);
        const notchTotalH = notchUpperH + notchLowerH;

        const shallowDepth = 3.0 + rightNotchRng() * 3.0;
        const pointExtraDepth = 1.2 + rightNotchRng() * 3.4;
        const notchTipT = 0.16 + rightNotchRng() * 0.66;
        const notchTipY = (rightNotchY - notchUpperH) + notchTotalH * notchTipT;
        const tipHalfH = Math.max(1.7, Math.min(4.4, notchTotalH * (0.022 + rightNotchRng() * 0.030)));

        const stressMode = rightNotchRng();
        const upperStress = stressMode < 0.36
            ? (1.32 + rightNotchRng() * 0.48)
            : stressMode < 0.70
                ? (0.90 + rightNotchRng() * 0.24)
                : (1.22 + rightNotchRng() * 0.42);
        const lowerStress = stressMode < 0.36
            ? (0.92 + rightNotchRng() * 0.22)
            : stressMode < 0.70
                ? (1.36 + rightNotchRng() * 0.50)
                : (1.18 + rightNotchRng() * 0.44);

        const upperShelfA = shallowDepth * (0.30 + rightNotchRng() * 0.22);
        const upperShelfB = shallowDepth * (0.58 + rightNotchRng() * 0.20) * upperStress;
        const upperShelfC = shallowDepth * (0.82 + rightNotchRng() * 0.18) * upperStress;
        const lowerShelfA = shallowDepth * (0.28 + rightNotchRng() * 0.24);
        const lowerShelfB = shallowDepth * (0.56 + rightNotchRng() * 0.22) * lowerStress;
        const lowerShelfC = shallowDepth * (0.80 + rightNotchRng() * 0.20) * lowerStress;

        const tipDepth = shallowDepth + pointExtraDepth * (1.00 + Math.max(upperStress, lowerStress) * (0.28 + rightNotchRng() * 0.24));
        const upperPocketX = w + shallowDepth + pointExtraDepth * upperStress;
        const lowerPocketX = w + shallowDepth + pointExtraDepth * lowerStress;

        const rightNotchTop = {
            x: w - 0.5,
            y: rightNotchY - notchUpperH
        };

        // Upper side: multiple short stone facets with unequal lengths/depths.
        const rightNotchUpperFaceA = {
            x: w + Math.max(0.7, upperShelfA * (0.52 + rightNotchRng() * 0.22)),
            y: rightNotchTop.y + notchTotalH * (0.035 + rightNotchRng() * 0.050)
        };
        const rightNotchUpperFaceB = {
            x: w + upperShelfA,
            y: rightNotchTop.y + notchTotalH * (0.090 + rightNotchRng() * 0.075)
        };
        const rightNotchUpperFaceC = {
            x: w + upperShelfB,
            y: rightNotchTop.y + notchTotalH * (0.140 + rightNotchRng() * 0.095)
        };
        const rightNotchUpperShoulder = {
            x: w + upperShelfC + (-0.8 + rightNotchRng() * 1.4),
            y: Math.max(
                rightNotchUpperFaceC.y + 0.7,
                notchTipY - tipHalfH - notchTotalH * (0.045 + rightNotchRng() * 0.080)
            )
        };
        const rightNotchMidShoulder = {
            x: Math.max(w + upperShelfC, upperPocketX - (0.8 + rightNotchRng() * 1.9)),
            y: notchTipY - tipHalfH + (-0.8 + rightNotchRng() * 1.2)
        };

        const rightNotchRoot = {
            x: w + tipDepth,
            y: notchTipY + (-0.55 + rightNotchRng() * 1.10)
        };

        // Lower side is independently stressed so one side can feel heavier/deeper.
        const rightNotchLowerKnee = {
            x: Math.max(w + lowerShelfC, lowerPocketX - (0.7 + rightNotchRng() * 2.0)),
            y: notchTipY + tipHalfH + (-0.25 + rightNotchRng() * 1.00)
        };
        const rightNotchLowerShoulder = {
            x: w + lowerShelfC + (-1.0 + rightNotchRng() * 1.7),
            y: Math.min(
                rightNotchY + notchLowerH - 1.2,
                notchTipY + tipHalfH + notchTotalH * (0.045 + rightNotchRng() * 0.090)
            )
        };
        const rightNotchLowerFaceC = {
            x: w + lowerShelfB,
            y: rightNotchY + notchLowerH - notchTotalH * (0.135 + rightNotchRng() * 0.100)
        };
        const rightNotchLowerFaceB = {
            x: w + lowerShelfA,
            y: rightNotchY + notchLowerH - notchTotalH * (0.085 + rightNotchRng() * 0.080)
        };
        const rightNotchLowerFaceA = {
            x: w + Math.max(0.7, lowerShelfA * (0.50 + rightNotchRng() * 0.24)),
            y: rightNotchY + notchLowerH - notchTotalH * (0.032 + rightNotchRng() * 0.050)
        };
        const rightNotchBottom = {
            x: w - 0.5,
            y: rightNotchY + notchLowerH
        };

        // Keep the lower-right chip outline ordered so random values do not make
        // neighboring segments fold back into each other. The earlier issue where
        // lines looked crowded / curled came from independent random Y and X offsets
        // occasionally crossing over. These monotonic clamps preserve the roughness
        // but stop self-intersection.
        const rightNotchSeq = [
            rightNotchTop,
            rightNotchUpperFaceA,
            rightNotchUpperFaceB,
            rightNotchUpperFaceC,
            rightNotchUpperShoulder,
            rightNotchMidShoulder,
            rightNotchRoot,
            rightNotchLowerKnee,
            rightNotchLowerShoulder,
            rightNotchLowerFaceC,
            rightNotchLowerFaceB,
            rightNotchLowerFaceA,
            rightNotchBottom
        ];
        const rightNotchMinGap = Math.max(0.55, notchTotalH * 0.028);
        for (let i = 1; i < rightNotchSeq.length; i++) {
            rightNotchSeq[i].y = Math.max(rightNotchSeq[i].y, rightNotchSeq[i - 1].y + rightNotchMinGap);
        }
        for (let i = rightNotchSeq.length - 2; i >= 0; i--) {
            rightNotchSeq[i].y = Math.min(rightNotchSeq[i].y, rightNotchSeq[i + 1].y - rightNotchMinGap);
        }

        const outwardHalf = [
            rightNotchUpperFaceA,
            rightNotchUpperFaceB,
            rightNotchUpperFaceC,
            rightNotchUpperShoulder,
            rightNotchMidShoulder,
            rightNotchRoot
        ];
        for (let i = 1; i < outwardHalf.length; i++) {
            outwardHalf[i].x = Math.max(outwardHalf[i].x, outwardHalf[i - 1].x + 0.32);
        }

        const inwardHalf = [
            rightNotchRoot,
            rightNotchLowerKnee,
            rightNotchLowerShoulder,
            rightNotchLowerFaceC,
            rightNotchLowerFaceB,
            rightNotchLowerFaceA,
            rightNotchBottom
        ];
        for (let i = 1; i < inwardHalf.length; i++) {
            inwardHalf[i].x = Math.min(inwardHalf[i].x, inwardHalf[i - 1].x - 0.30);
        }
        rightNotchLowerFaceA.x = Math.max(rightNotchLowerFaceA.x, w + 0.65);
        rightNotchBottom.x = w - 0.5;

        // v167 · upper-right attached pit made larger and more stone-like:
        // sharper shoulders, a shallow-to-deep transition, and deliberately
        // unbalanced depth between the upper and lower halves.
        const upperPitRng = rngFor('main-frame-right-upper-attached-crack-v167');
        const upperPitY = 104 + upperPitRng() * Math.min(18, h * 0.026);
        const upperPitScale = 0.82;
        const upperPitHalfH = (24 + upperPitRng() * 6.6) * upperPitScale;
        const upperPitBulge = (19.5 + upperPitRng() * 6.4) * upperPitScale;

        const upperPitStart = {
            x: w - 0.5,
            y: upperPitY - upperPitHalfH
        };
        const upperPitEnd = {
            x: w - 0.5,
            y: upperPitY + upperPitHalfH
        };

        // Upper section stays relatively shallow, then the profile cuts deeper
        // through the middle/lower portion so the depth feels uneven.
        const pitOuterA = { x: w + upperPitBulge * 0.12, y: upperPitY - upperPitHalfH * 0.92 };
        const pitOuterB = { x: w + upperPitBulge * 0.34, y: upperPitY - upperPitHalfH * 0.62 };
        const pitOuterC = { x: w + upperPitBulge * 0.50, y: upperPitY - upperPitHalfH * 0.30 };
        const pitOuterD = { x: w + upperPitBulge * 0.88, y: upperPitY + upperPitHalfH * 0.02 };
        const pitOuterE = { x: w + upperPitBulge * 1.04, y: upperPitY + upperPitHalfH * 0.24 };
        const pitOuterF = { x: w + upperPitBulge * 0.90, y: upperPitY + upperPitHalfH * 0.52 };
        const pitOuterG = { x: w + upperPitBulge * 0.48, y: upperPitY + upperPitHalfH * 0.88 };

        const upperPitPath = [
            `M ${topRight.x.toFixed(2)} ${topRight.y.toFixed(2)}`,
            `L ${upperPitStart.x.toFixed(2)} ${upperPitStart.y.toFixed(2)}`,
            // Keep the entry hard and restrained, then sink deeper toward the lower half.
            `Q ${(w + 0.8).toFixed(2)} ${(upperPitY - upperPitHalfH * 0.98).toFixed(2)}, ${pitOuterA.x.toFixed(2)} ${pitOuterA.y.toFixed(2)}`,
            `L ${pitOuterB.x.toFixed(2)} ${pitOuterB.y.toFixed(2)}`,
            `L ${pitOuterC.x.toFixed(2)} ${pitOuterC.y.toFixed(2)}`,
            `L ${pitOuterD.x.toFixed(2)} ${pitOuterD.y.toFixed(2)}`,
            `L ${pitOuterE.x.toFixed(2)} ${pitOuterE.y.toFixed(2)}`,
            `L ${pitOuterF.x.toFixed(2)} ${pitOuterF.y.toFixed(2)}`,
            `Q ${(w + upperPitBulge * 0.24).toFixed(2)} ${(upperPitY + upperPitHalfH * 0.96).toFixed(2)}, ${pitOuterG.x.toFixed(2)} ${pitOuterG.y.toFixed(2)}`,
            `Q ${(w + 1.0).toFixed(2)} ${(upperPitY + upperPitHalfH * 1.02).toFixed(2)}, ${upperPitEnd.x.toFixed(2)} ${upperPitEnd.y.toFixed(2)}`,
            `L ${rightNotchTop.x.toFixed(2)} ${rightNotchTop.y.toFixed(2)}`
        ].join(' ');

        svg.appendChild(makePath(upperPitPath, 'ruin-fracture-border ruin-fracture-upper-attached-pit', 0.92));

        // Inner return line hugs the border closely, but also becomes slightly deeper
        // in the lower half so the two sides do not feel symmetrical.
        const returnBulgeTop = 0.9 + upperPitRng() * 0.45;
        const returnBulgeMid = 1.4 + upperPitRng() * 0.55;
        const returnBulgeLow = 1.15 + upperPitRng() * 0.40;
        const upperPitReturnPath = [
            `M ${upperPitStart.x.toFixed(2)} ${upperPitStart.y.toFixed(2)}`,
            `C ${(w + returnBulgeTop).toFixed(2)} ${(upperPitY - upperPitHalfH * 0.80).toFixed(2)}, ${(w + returnBulgeMid).toFixed(2)} ${(upperPitY - upperPitHalfH * 0.18).toFixed(2)}, ${(w + returnBulgeMid * 0.96).toFixed(2)} ${(upperPitY + upperPitHalfH * 0.22).toFixed(2)}`,
            `C ${(w + returnBulgeLow).toFixed(2)} ${(upperPitY + upperPitHalfH * 0.54).toFixed(2)}, ${(w + returnBulgeTop * 0.74).toFixed(2)} ${(upperPitY + upperPitHalfH * 0.90).toFixed(2)}, ${upperPitEnd.x.toFixed(2)} ${upperPitEnd.y.toFixed(2)}`
        ].join(' ');

        svg.appendChild(makePath(upperPitReturnPath, 'ruin-fracture-crack ruin-fracture-upper-attached-return', CONNECTING_RETURN_OPACITY));

        addPolyline(svg, [
            rightNotchTop,
            rightNotchUpperFaceA,
            rightNotchUpperFaceB,
            rightNotchUpperFaceC,
            rightNotchUpperShoulder,
            rightNotchMidShoulder,
            rightNotchRoot,
            rightNotchLowerKnee,
            rightNotchLowerShoulder,
            rightNotchLowerFaceC,
            rightNotchLowerFaceB,
            rightNotchLowerFaceA,
            rightNotchBottom
        ], 'ruin-fracture-border ruin-fracture-damaged', 0.92);

        // Return line stays extremely close to the original frame edge even though
        // the outer broken shelf is much wider.
        const lowerReturnBulge = 0.85 + rightNotchRng() * 0.48;
        const lowerReturnPath = [
            `M ${rightNotchTop.x.toFixed(2)} ${rightNotchTop.y.toFixed(2)}`,
            `C ${(w + lowerReturnBulge * 0.82).toFixed(2)} ${(rightNotchTop.y + notchUpperH * 0.46).toFixed(2)}, ${(w + lowerReturnBulge).toFixed(2)} ${(rightNotchY - notchUpperH * 0.08).toFixed(2)}, ${(w + lowerReturnBulge * 0.96).toFixed(2)} ${(rightNotchY + notchLowerH * 0.18).toFixed(2)}`,
            `C ${(w + lowerReturnBulge * 0.82).toFixed(2)} ${(rightNotchY + notchLowerH * 0.54).toFixed(2)}, ${(w + lowerReturnBulge * 0.46).toFixed(2)} ${(rightNotchBottom.y - notchLowerH * 0.10).toFixed(2)}, ${rightNotchBottom.x.toFixed(2)} ${rightNotchBottom.y.toFixed(2)}`
        ].join(' ');
        svg.appendChild(makePath(lowerReturnPath, 'ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-lower-right-return', CONNECTING_RETURN_OPACITY));
        addPolyline(svg, [rightNotchBottom, bottomRight], 'ruin-fracture-border', 0.86);
        addPolyline(svg, [bottomRight, bottomLeft], 'ruin-fracture-border', 0.70);

        // v211 · broad shallow pit retreats LEFT/outside from the inner frame; it must not bite into the map.
        // The pit stays restrained: it interrupts the otherwise architectural edge
        // without reading as another crack or a sharp triangular bite.
        const leftPitRng = rngFor('main-frame-left-stone-pit-v211');
        const leftPitCenterY = h * (0.34 + leftPitRng() * 0.42);
        const leftPitHeight = Math.min(78, Math.max(38, h * (0.060 + leftPitRng() * 0.045)));
        const leftPitTopY = Math.max(18, leftPitCenterY - leftPitHeight * 0.5);
        const leftPitBottomY = Math.min(h - 18, leftPitCenterY + leftPitHeight * 0.5);
        const leftPitDepth = 5.0 + leftPitRng() * 6.5;
        const leftPitTop = { x: 0.5, y: leftPitTopY };
        const leftPitBottom = { x: 0.5, y: leftPitBottomY };
        const leftPitPoints = [
            leftPitTop,
            { x: 0.1 - leftPitDepth * (0.18 + leftPitRng() * 0.10), y: leftPitTopY + leftPitHeight * (0.10 + leftPitRng() * 0.05) },
            { x: 0.1 - leftPitDepth * (0.54 + leftPitRng() * 0.10), y: leftPitTopY + leftPitHeight * (0.25 + leftPitRng() * 0.05) },
            { x: 0.1 - leftPitDepth * (0.88 + leftPitRng() * 0.12), y: leftPitTopY + leftPitHeight * (0.43 + leftPitRng() * 0.06) },
            { x: 0.1 - leftPitDepth * (0.64 + leftPitRng() * 0.12), y: leftPitTopY + leftPitHeight * (0.62 + leftPitRng() * 0.05) },
            { x: 0.1 - leftPitDepth * (0.28 + leftPitRng() * 0.10), y: leftPitTopY + leftPitHeight * (0.82 + leftPitRng() * 0.05) },
            leftPitBottom
        ];
        addPolyline(svg, [bottomLeft, leftPitBottom], 'ruin-fracture-border', 0.86);
        addPolyline(svg, [...leftPitPoints].reverse(), 'ruin-fracture-border ruin-fracture-damaged ruin-fracture-left-pit', 0.88);
        addPolyline(svg, [leftPitTop, topLeft], 'ruin-fracture-border', 0.86);

        // Merge several small stone-like runs so the fracture has a geological
        // rhythm but never turns into a lightning bolt.
        function addOutwardStoneRun(points, seedKey, options = {}) {
            if (!Array.isArray(points) || points.length < 2) return;
            const merged = [points[0]];
            for (let i = 0; i < points.length - 1; i++) {
                const local = rngFor(seedKey + '-' + i);
                const segment = stoneEdgeCrackPoints(points[i], points[i + 1], local, {
                    amplitude: options.amplitude ?? 1.35,
                    segments: options.segments ?? 4,
                    curveDir: options.curveDir ?? (i % 2 ? -1 : 1),
                    quant: options.quant ?? 4.6
                });
                merged.push(...segment.slice(1));
            }

            // Remove accidental near-duplicate points and keep the line moving
            // outward so it reads like a stress fracture instead of a scribble.
            const cleaned = [merged[0]];
            let last = merged[0];
            const dominantDx = (merged[merged.length - 1]?.x ?? last.x) - last.x;
            const xDirection = dominantDx >= 0 ? 1 : -1;
            for (let i = 1; i < merged.length; i++) {
                let p = { ...merged[i] };
                if (Math.hypot(p.x - last.x, p.y - last.y) < 1.1) continue;
                if (xDirection > 0) p.x = Math.max(p.x, last.x + 0.55);
                else p.x = Math.min(p.x, last.x - 0.55);
                if (Math.abs(p.y - last.y) > 44) {
                    p.y = last.y + Math.sign(p.y - last.y) * 44;
                }
                cleaned.push(p);
                last = p;
            }

            addPolyline(
                svg,
                cleaned,
                options.className || 'ruin-fracture-crack ruin-fracture-outward-stem',
                options.opacity ?? 0.52
            );
        }

        // Restore the title-notch crack and the lower-right outward tree
        // fracture, while keeping the extra inner-frame corner crack groups removed.
        const outwardRng = rngFor('main-frame-right-outward-tree-v148');
        const crackStart = {
            x: rightNotchRoot.x,
            y: rightNotchRoot.y
        };

        const stemA = {
            x: rightNotchRoot.x + (17 + outwardRng() * 11),
            y: rightNotchRoot.y + (0.9 + outwardRng() * 2.1)
        };
        const stemB = {
            x: rightNotchRoot.x + (45 + outwardRng() * 18),
            y: rightNotchRoot.y + (5.0 + outwardRng() * 4.2)
        };
        const junction = {
            x: rightNotchRoot.x + (82 + outwardRng() * 34),
            y: rightNotchRoot.y + (12 + outwardRng() * 10)
        };

        addOutwardStoneRun(
            [crackStart, stemA, stemB, junction],
            'main-frame-right-outward-stem-v147',
            {
                amplitude: 1.22,
                segments: 4,
                quant: 4.8,
                opacity: 0.52,
                className: 'ruin-fracture-crack ruin-fracture-outward-stem'
            }
        );

        const upperArmA = {
            x: junction.x + (22 + outwardRng() * 12),
            y: junction.y - (6 + outwardRng() * 5)
        };
        const upperArmB = {
            x: junction.x + (60 + outwardRng() * 22),
            y: junction.y - (5 + outwardRng() * 6)
        };
        const upperArmC = {
            x: junction.x + (118 + outwardRng() * 42),
            y: junction.y - (6 + outwardRng() * 7)
        };
        const upperArmEnd = {
            x: w + (224 + outwardRng() * 48),
            y: junction.y - (1 + outwardRng() * 6)
        };
        addOutwardStoneRun(
            [junction, upperArmA, upperArmB, upperArmC, upperArmEnd],
            'main-frame-right-outward-upper-v160',
            {
                amplitude: 1.12,
                segments: 4,
                quant: 4.9,
                opacity: 0.46,
                className: 'ruin-fracture-crack ruin-fracture-outward-branch'
            }
        );

        const downArmA = {
            x: junction.x + (14 + outwardRng() * 10),
            y: junction.y + (18 + outwardRng() * 9)
        };
        const downArmB = {
            x: junction.x + (38 + outwardRng() * 18),
            y: junction.y + (36 + outwardRng() * 14)
        };
        const downArmC = {
            x: junction.x + (86 + outwardRng() * 30),
            y: junction.y + (56 + outwardRng() * 18)
        };
        const downArmEnd = {
            x: w + (198 + outwardRng() * 44),
            y: junction.y + (84 + outwardRng() * 26)
        };
        addOutwardStoneRun(
            [junction, downArmA, downArmB, downArmC, downArmEnd],
            'main-frame-right-outward-down-v160',
            {
                amplitude: 1.42,
                segments: 4,
                quant: 4.5,
                opacity: 0.44,
                className: 'ruin-fracture-crack ruin-fracture-outward-branch'
            }
        );

        if (outwardRng() < 0.68) {
            const tinyRoot = pointAt(downArmA, downArmB, 0.42 + outwardRng() * 0.18);
            const tinyEnd = {
                x: tinyRoot.x + (20 + outwardRng() * 22),
                y: tinyRoot.y + (10 + outwardRng() * 19)
            };
            addOutwardStoneRun(
                [tinyRoot, tinyEnd],
                'main-frame-right-outward-minor-v147',
                {
                    amplitude: 0.92,
                    segments: 3,
                    quant: 5.0,
                    opacity: 0.30,
                    className: 'ruin-fracture-crack ruin-fracture-outward-branch-minor'
                }
            );
        }

        const crackRng = rngFor(`main-frame-top-notch-crack-v124-${titleSide}`);
        const crackDx = (notchTip.towardSide ?? -1) * (10 + crackRng() * 13);
        addStoneCeramicCrack(svg, notchTip, {
            x: notchTip.x + crackDx,
            y: Math.min(-16, notchTip.y - (28 + crackRng() * 26))
        }, crackRng, {
            amplitude: 3.0,
            segments: 4,
            curveDir: notchTip.towardSide ?? -1,
            curveAmount: 0.70 + crackRng() * 0.26,
            detailScale: 0.13,
            stoneBias: 0.56,
            tangentScale: 0.032,
            opacity: 0.60,
            className: 'ruin-fracture-crack ruin-fracture-title-notch-crack ruin-fracture-edge-stone'
        });

        target.appendChild(svg);
        target.classList.add('fracture-active');
    }

    function renderTopPerspectiveLines() {

        const layer = ensureGlobalLayer();
        layer.innerHTML = '';
        const svg = makeSvg('ruin-fracture-global');
        setViewBox(svg, window.innerWidth, window.innerHeight);

        const frameLeft = getCssNumber('--frame-left', 230);
        const frameRight = getCssNumber('--frame-right', 168);
        const frameTop = getCssNumber('--frame-top', 40);

        const leftStart = { x: 0.5, y: 0.5 };
        const leftEnd = { x: frameLeft, y: frameTop };
        const rightStart = { x: window.innerWidth - 0.5, y: 0.5 };
        const rightEnd = { x: window.innerWidth - frameRight, y: frameTop };

        const leftRng = rngFor('perspective-top-left-v194');
        const slantedChip = addNaturalChipSegment(svg, leftStart, leftEnd, leftRng, {
            width: 44 + leftRng() * 18,
            depth: 3.4 + leftRng() * 2.4,
            normalSign: 1,
            t: 0.50 + leftRng() * 0.18,
            opacity: 0.84,
            lip: 0.14,
            addReturnLine: true,
            returnInset: 1.0,
            returnOpacity: CONNECTING_RETURN_OPACITY
        });
        addPolyline(svg, [rightStart, rightEnd], 'ruin-fracture-border', 0.84);

        // v195 · transfer the old upper-left tree crack to the outer frame
        // zone, and make both branch endpoints land on the upper-left slanted
        // perspective line, matching the mockup more closely.
        const transferRng = rngFor('perspective-top-left-transfer-v198');

        // Branch A: choose a real segment from the generated notch floor, then
        // interpolate inside that segment. This makes the endpoint inherit the
        // actual random break geometry instead of approximating its depth.
        let slantedAttachA = pointAt(leftStart, leftEnd, 0.62);
        if (slantedChip && Array.isArray(slantedChip.facets) && slantedChip.facets.length) {
            const floorPoints = [slantedChip.entry1, ...slantedChip.facets, slantedChip.entry2]
                .filter(Boolean);
            if (floorPoints.length >= 2) {
                const safeFirst = Math.min(1, floorPoints.length - 2);
                const safeLast = Math.max(safeFirst, floorPoints.length - 3);
                const segmentIndex = safeFirst + Math.floor(transferRng() * (safeLast - safeFirst + 1));
                const floorT = 0.22 + transferRng() * 0.56;
                slantedAttachA = pointAt(
                    floorPoints[segmentIndex],
                    floorPoints[Math.min(segmentIndex + 1, floorPoints.length - 1)],
                    floorT
                );
            }
        }

        // Branch B: deliberately avoid the notch, but alternate sides. About
        // half the refreshes land on the intact diagonal BEFORE the break and
        // half land AFTER it, toward the inner frame. This prevents the Y from
        // always opening to the same side.
        const cleanBranchSide = transferRng() < 0.50 ? 'left' : 'right';
        let slantedAttachB;
        if (cleanBranchSide === 'right' && slantedChip?.p2) {
            const cleanRightT = 0.18 + transferRng() * 0.64;
            slantedAttachB = pointAt(slantedChip.p2, leftEnd, cleanRightT);
        } else {
            const cleanLeftEnd = slantedChip?.p1 || pointAt(leftStart, leftEnd, 0.48);
            const cleanLeftT = 0.30 + transferRng() * 0.52;
            slantedAttachB = pointAt(leftStart, cleanLeftEnd, cleanLeftT);
        }
        const cleanBranchCurveDir = cleanBranchSide === 'right' ? -1 : 1;

        const segmentT = (a, b, p) => {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const denom = dx * dx + dy * dy || 1;
            return Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / denom));
        };

        // v198 · the trunk now enters from a visibly lower point on the far-left
        // screen edge: 25–45% of viewport height. The fork is biased upward along
        // that journey, so the silhouette rises first and only splits near the
        // slanted break instead of forming a low, squat Y.
        const leftEdge = {
            x: 0.5,
            y: window.innerHeight * (0.28 + transferRng() * 0.17)
        };
        const attachMid = {
            x: (slantedAttachA.x + slantedAttachB.x) * 0.5,
            y: (slantedAttachA.y + slantedAttachB.y) * 0.5
        };
        // v243 · keep the harder stone-spall reading, but recover the older
        // ceramic crack feeling by using bowed mineral cracks rather than only
        // faceted straight runs.
        const forkProgress = 0.72 + transferRng() * 0.08;
        const forkBase = pointAt(leftEdge, attachMid, forkProgress);
        const junction = {
            x: forkBase.x - (2 + transferRng() * 5),
            y: Math.max(frameTop + 5, forkBase.y - (1 + transferRng() * 4))
        };

        const stemTransition = pointAt(leftEdge, junction, 0.34 + transferRng() * 0.08);
        const stemKink = pointAt(leftEdge, junction, 0.70 + transferRng() * 0.08);
        const slantedTransitionA = pointAt(junction, slantedAttachA, 0.82 + transferRng() * 0.05);
        const slantedTransitionB = pointAt(junction, slantedAttachB, 0.82 + transferRng() * 0.05);
        // v246 · snap the visible branch ends slightly past the attachment
        // point so they visually merge into the slanted edge instead of
        // appearing to stop just short because of anti-aliasing or layering.
        const slantedAttachAVisual = extendPast(slantedAttachA, slantedTransitionA, 1.35);
        const slantedAttachBVisual = extendPast(slantedAttachB, slantedTransitionB, 1.35);

        addStoneCeramicCrack(svg, leftEdge, stemTransition, transferRng, {
            amplitude: 6.8,
            segments: 5,
            curveDir: 1,
            curveAmount: 1.05 + transferRng() * 0.42,
            detailScale: 0.12,
            stoneBias: 0.56,
            tangentScale: 0.034,
            opacity: 0.42,
            className: 'ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-corner-stem'
        });
        addStoneCeramicCrack(svg, stemTransition, stemKink, transferRng, {
            amplitude: 5.8,
            segments: 4,
            curveDir: 1,
            curveAmount: 0.92 + transferRng() * 0.34,
            detailScale: 0.12,
            stoneBias: 0.54,
            tangentScale: 0.032,
            opacity: 0.46,
            className: 'ruin-fracture-crack ruin-fracture-corner-stem'
        });
        addStoneCeramicCrack(svg, stemKink, junction, transferRng, {
            amplitude: 6.5,
            segments: 5,
            curveDir: -1,
            curveAmount: 1.02 + transferRng() * 0.36,
            detailScale: 0.12,
            stoneBias: 0.58,
            tangentScale: 0.034,
            opacity: 0.50,
            className: 'ruin-fracture-crack ruin-fracture-corner-stem'
        });

        // Two short branch runs near the slanted edge: keep the older ceramic
        // wiggle, but let them read as mineral / stone cracks.
        addStoneCeramicCrack(svg, junction, slantedTransitionA, transferRng, {
            amplitude: 4.0,
            segments: 4,
            curveDir: -1,
            curveAmount: 0.70 + transferRng() * 0.22,
            detailScale: 0.11,
            stoneBias: 0.52,
            tangentScale: 0.030,
            opacity: 0.42,
            className: 'ruin-fracture-crack ruin-fracture-corner-branch'
        });
        addStoneCeramicCrack(svg, slantedAttachAVisual, slantedTransitionA, transferRng, {
            amplitude: 3.2,
            segments: 4,
            curveDir: 1,
            curveAmount: 0.52 + transferRng() * 0.18,
            detailScale: 0.11,
            stoneBias: 0.48,
            tangentScale: 0.028,
            opacity: 0.38,
            className: 'ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-corner-branch ruin-fracture-edge-connector'
        });

        addStoneCeramicCrack(svg, junction, slantedTransitionB, transferRng, {
            amplitude: 3.8,
            segments: 4,
            curveDir: cleanBranchCurveDir,
            curveAmount: 0.68 + transferRng() * 0.20,
            detailScale: 0.11,
            stoneBias: 0.52,
            tangentScale: 0.030,
            opacity: 0.38,
            className: 'ruin-fracture-crack ruin-fracture-corner-branch'
        });
        addStoneCeramicCrack(svg, slantedAttachBVisual, slantedTransitionB, transferRng, {
            amplitude: 3.0,
            segments: 4,
            curveDir: -cleanBranchCurveDir,
            curveAmount: 0.50 + transferRng() * 0.16,
            detailScale: 0.11,
            stoneBias: 0.48,
            tangentScale: 0.028,
            opacity: 0.36,
            className: 'ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-corner-branch ruin-fracture-edge-connector'
        });

        // v243 · explicit spall logic along the slanted edge. Choose the chip
        // slot after accounting for the existing top-edge loss and for the
        // attach zone, so the two visible pits do not stack on top of each other.
        const spallTowardInner = cleanBranchSide === 'right';
        const existingTopChipStartT = slantedChip?.p1 ? segmentT(leftStart, leftEnd, slantedChip.p1) : 0.58;
        const existingTopChipEndT = slantedChip?.p2 ? segmentT(leftStart, leftEnd, slantedChip.p2) : 0.70;
        const attachZoneT = [segmentT(leftStart, leftEnd, slantedAttachA), segmentT(leftStart, leftEnd, slantedAttachB)];
        const blocked = [
            [Math.max(0.18, existingTopChipStartT - 0.07), Math.min(0.92, existingTopChipEndT + 0.07)],
            [Math.max(0.18, Math.min(...attachZoneT) - 0.09), Math.min(0.92, Math.max(...attachZoneT) + 0.09)]
        ].sort((a, b) => a[0] - b[0]);
        const merged = [];
        blocked.forEach(([s, e]) => {
            if (!merged.length || s > merged[merged.length - 1][1]) merged.push([s, e]);
            else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
        });
        const openRanges = [];
        let cursor = 0.18;
        merged.forEach(([s, e]) => {
            if (s - cursor > 0.10) openRanges.push([cursor, s]);
            cursor = Math.max(cursor, e);
        });
        if (0.92 - cursor > 0.10) openRanges.push([cursor, 0.92]);
        const chosenTopRange = (openRanges.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0]) || [0.74, 0.88];
        const chipSpan = Math.max(0.13, Math.min(0.20, (chosenTopRange[1] - chosenTopRange[0]) * 0.68));
        const chipCenter = chosenTopRange[0] + (chosenTopRange[1] - chosenTopRange[0]) * (0.50 + (transferRng() - 0.5) * 0.12);
        const chipT1 = Math.max(chosenTopRange[0] + 0.01, chipCenter - chipSpan * 0.5);
        const chipT2 = Math.min(chosenTopRange[1] - 0.01, chipCenter + chipSpan * 0.5);
        const chipBaseA = pointAt(leftStart, leftEnd, chipT1);
        const chipBaseB = pointAt(leftStart, leftEnd, chipT2);

        const mainSpallChip = addNaturalChipSegment(svg, chipBaseA, chipBaseB, transferRng, {
            width: 24 + transferRng() * 12,
            depth: 2.4 + transferRng() * 2.1,
            normalSign: 1,
            t: 0.50 + (transferRng() - 0.5) * 0.08,
            opacity: 0.88,
            lip: 0.09,
            addReturnLine: true,
            returnInset: 1.12,
            returnOpacity: CONNECTING_RETURN_OPACITY * 1.06,
            returnClassName: 'ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-spall-seam',
            className: 'ruin-fracture-border ruin-fracture-damaged ruin-fracture-corner-spall-chip ruin-fracture-spall-major'
        });

        // v245 · add a neighbouring smaller flake so the edge reads less like
        // a single notch and more like a small stone fragment zone. Keep it
        // off the main chip span so the losses do not merge into one blunt cut.
        const preGap = chipT1 - chosenTopRange[0];
        const postGap = chosenTopRange[1] - chipT2;
        let flakeRange = null;
        if (postGap > 0.07 || preGap > 0.07) {
            if (postGap >= preGap) {
                flakeRange = [chipT2 + 0.018, Math.min(chosenTopRange[1] - 0.006, chipT2 + 0.09 + transferRng() * 0.04)];
            } else {
                flakeRange = [Math.max(chosenTopRange[0] + 0.006, chipT1 - 0.09 - transferRng() * 0.04), chipT1 - 0.018];
            }
        }
        if (flakeRange && flakeRange[1] - flakeRange[0] > 0.04 && transferRng() < 0.88) {
            const flakeA = pointAt(leftStart, leftEnd, flakeRange[0]);
            const flakeB = pointAt(leftStart, leftEnd, flakeRange[1]);
            addNaturalChipSegment(svg, flakeA, flakeB, transferRng, {
                width: 12 + transferRng() * 7,
                depth: 1.5 + transferRng() * 1.5,
                normalSign: 1,
                t: 0.50 + (transferRng() - 0.5) * 0.12,
                opacity: 0.84,
                lip: 0.08,
                addReturnLine: true,
                returnInset: 0.92,
                returnOpacity: CONNECTING_RETURN_OPACITY * 0.98,
                returnClassName: 'ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-spall-seam',
                className: 'ruin-fracture-border ruin-fracture-damaged ruin-fracture-corner-spall-chip ruin-fracture-spall-secondary'
            });
        }

        const spallEdgeNear = slantedAttachB;
        const spallEdgeFar = spallTowardInner
            ? pointAt(slantedAttachB, leftEnd, 0.16 + transferRng() * 0.12)
            : pointAt(leftStart, slantedAttachB, 0.16 + transferRng() * 0.12);
        const spallStemRoot = pointAt(junction, spallEdgeNear, 0.52 + transferRng() * 0.10);
        const spallStemTip = pointAt(spallStemRoot, spallEdgeFar, 0.84 + transferRng() * 0.06);
        const spallEdgeFarVisual = extendPast(spallEdgeFar, spallStemTip, 1.15);
        addStoneCeramicCrack(svg, spallStemRoot, spallStemTip, transferRng, {
            amplitude: 3.2,
            segments: 4,
            curveDir: spallTowardInner ? -1 : 1,
            curveAmount: 0.46 + transferRng() * 0.14,
            detailScale: 0.10,
            stoneBias: 0.56,
            tangentScale: 0.026,
            opacity: 0.42,
            className: 'ruin-fracture-crack ruin-fracture-corner-branch ruin-fracture-corner-spall ruin-fracture-spall-seam'
        });

        // Secondary tiny chip near the edge: like a smaller shard beginning to go.
        if (transferRng() < 0.92) {
            addNaturalChipSegment(svg, spallEdgeNear, spallEdgeFar, transferRng, {
                width: 15 + transferRng() * 10,
                depth: 1.6 + transferRng() * 1.4,
                normalSign: 1,
                t: 0.44 + (transferRng() - 0.5) * 0.10,
                opacity: 0.86,
                lip: 0.09,
                addReturnLine: true,
                returnInset: 0.94,
                returnOpacity: CONNECTING_RETURN_OPACITY * 0.98,
                returnClassName: 'ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-spall-seam',
                className: 'ruin-fracture-border ruin-fracture-damaged ruin-fracture-corner-spall-chip ruin-fracture-spall-secondary'
            });
        }

        // Short tree-like brittle twig, but kept tight to the edge so it reads
        // as a stone fragment trying to peel off rather than a spiderweb.
        if (transferRng() < 0.72) {
            const twigRoot = pointAt(spallStemRoot, spallStemTip, 0.44 + transferRng() * 0.14);
            const twigTip = spallTowardInner
                ? pointAt(spallEdgeNear, leftEnd, 0.05 + transferRng() * 0.05)
                : pointAt(leftStart, spallEdgeNear, 0.05 + transferRng() * 0.05);
            const twigTipVisual = extendPast(twigTip, twigRoot, 1.0);
            addStoneCeramicCrack(svg, twigRoot, twigTipVisual, transferRng, {
                amplitude: 2.5,
                segments: 4,
                curveDir: spallTowardInner ? 1 : -1,
                curveAmount: 0.36 + transferRng() * 0.12,
                detailScale: 0.09,
                stoneBias: 0.52,
                tangentScale: 0.024,
                opacity: 0.32,
                className: 'ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-corner-branch ruin-fracture-corner-twig ruin-fracture-spall-seam'
            });
        }


        layer.appendChild(svg);
        document.body.classList.add('ruin-fracture-active');
    }

    function renderCompass() {
        const target = document.querySelector('.compass-pentagon-outer');
        if (!target) return;

        clearTargetOverlays(target);
        const rect = target.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const svg = makeSvg('ruin-fracture-compass');
        setViewBox(svg, w, h);

        const rng = rngFor('compass-v177');

        // These ratios describe the ACTUAL remaining straight border lengths.
        // Left: 50–90% of the full left edge remains.
        // Bottom: 50–80% of the full bottom edge remains from the right side.
        const leftKeepRatio = 0.50 + rng() * 0.40;
        const bottomKeepRatio = 0.50 + rng() * 0.30;

        // opt19 · The fracture belongs to the original collapsed compass shell.
        // When the site-name wheel opens, only the straight border spans should
        // grow. Do NOT scale the broken lower-left masonry edge across the new
        // module width.
        const compassButton = target.querySelector('.global-compass-btn');
        const buttonWidth = compassButton?.getBoundingClientRect().width || 96;
        const fractureCoreWidth = Math.min(w, Math.max(72, buttonWidth));

        const leftFree = {
            x: 0.5,
            y: h * leftKeepRatio
        };
        const bottomFree = {
            x: fractureCoreWidth * (1 - bottomKeepRatio),
            y: h - 0.5
        };

        function normalizePoint(v) {
            const len = Math.hypot(v.x, v.y) || 1;
            return { x: v.x / len, y: v.y / len };
        }

        function buildMasonryEdgePoints(start, end, rand) {
            const v = vec(start, end);
            if (v.len < 8) return [start, end];

            const inward = { x: v.uy, y: -v.ux };
            const pts = [{ x: start.x, y: start.y }];

            const facetCount = 4 + Math.floor(rand() * 2);
            const weights = [];
            let weightSum = 0;
            for (let i = 0; i < facetCount; i++) {
                const wgt = 0.95 + rand() * 1.15;
                weights.push(wgt);
                weightSum += wgt;
            }

            const bayCenter = 0.34 + rand() * 0.32;
            const bayWidth = 0.16 + rand() * 0.10;
            const bayDepth = 2.1 + rand() * 1.9;

            let acc = 0;
            let prevT = 0;
            let prevInset = 0.75 + rand() * 0.55;

            for (let i = 0; i < facetCount; i++) {
                acc += weights[i];
                const rawT = acc / weightSum;
                const t = Math.min(0.93, Math.max(prevT + 0.10, rawT));
                const dt = Math.max(0.05, t - prevT);

                const leadT = Math.max(prevT + dt * 0.42, t - dt * 0.30);
                const turnT = t;
                const leadBase = pointAt(start, end, leadT);
                const turnBase = pointAt(start, end, turnT);

                const bayInfluence = Math.max(0, 1 - Math.abs(turnT - bayCenter) / bayWidth);

                let turnInset;
                if (rand() < 0.36) {
                    turnInset = prevInset + (rand() - 0.5) * 0.65;
                } else {
                    turnInset = 0.95 + rand() * 1.65 + bayInfluence * bayDepth;
                }
                turnInset = Math.max(0.55, Math.min(4.8, turnInset));

                let leadInset = turnInset * (0.68 + rand() * 0.12);
                leadInset = Math.max(0.45, Math.min(4.3, leadInset));

                const leadJitter = (rand() - 0.5) * Math.min(0.85, v.len * 0.008);
                const turnJitter = (rand() - 0.5) * Math.min(1.10, v.len * 0.011);

                pts.push({
                    x: leadBase.x + inward.x * leadInset + v.ux * leadJitter,
                    y: leadBase.y + inward.y * leadInset + v.uy * leadJitter
                });
                pts.push({
                    x: turnBase.x + inward.x * turnInset + v.ux * turnJitter,
                    y: turnBase.y + inward.y * turnInset + v.uy * turnJitter
                });

                prevInset = turnInset;
                prevT = turnT;
            }

            if (rand() < 0.58) {
                const nickT = Math.min(0.965, Math.max(prevT + 0.025, 0.88 + rand() * 0.05));
                const nickBase = pointAt(start, end, nickT);
                const nickInset = Math.max(0.55, Math.min(4.5, prevInset * (0.72 + rand() * 0.16)));
                pts.push({
                    x: nickBase.x + inward.x * nickInset,
                    y: nickBase.y + inward.y * nickInset
                });
            }

            pts.push({ x: end.x, y: end.y });
            return pts;
        }

        function addSmallCornerChip(edgeA, corner, edgeB, rand, opts = {}) {
            const dirA = normalizePoint({ x: edgeA.x - corner.x, y: edgeA.y - corner.y });
            const dirB = normalizePoint({ x: edgeB.x - corner.x, y: edgeB.y - corner.y });
            const inward = normalizePoint({ x: dirA.x + dirB.x, y: dirA.y + dirB.y });

            const depth = opts.depth ?? (2.4 + rand() * 2.2);
            const aLen = Math.max(1, Math.hypot(edgeA.x - corner.x, edgeA.y - corner.y));
            const bLen = Math.max(1, Math.hypot(edgeB.x - corner.x, edgeB.y - corner.y));

            // v177 · corner-chip safety:
            // Keep the generated facets strictly ordered from each edge toward the
            // corner and let the inward depth increase monotonically to one shallow
            // apex, then decrease again. This prevents local reflex/negative angles
            // and the little "hook" shapes seen in v176.
            const aOuterT = 0.18 + rand() * 0.08;
            const aInnerT = Math.min(0.62, aOuterT + 0.18 + rand() * 0.10);
            const bOuterT = 0.18 + rand() * 0.08;
            const bInnerT = Math.min(0.62, bOuterT + 0.18 + rand() * 0.10);

            const outerDepthA = depth * (0.12 + rand() * 0.08);
            const innerDepthA = Math.max(
                outerDepthA + 0.35,
                depth * (0.46 + rand() * 0.10)
            );

            const outerDepthB = depth * (0.12 + rand() * 0.08);
            const innerDepthB = Math.max(
                outerDepthB + 0.35,
                depth * (0.46 + rand() * 0.10)
            );

            const apexDepth = Math.max(
                innerDepthA,
                innerDepthB,
                depth * (0.78 + rand() * 0.10)
            );

            const pAOuter = {
                x: corner.x + dirA.x * (aLen * aOuterT) + inward.x * outerDepthA,
                y: corner.y + dirA.y * (aLen * aOuterT) + inward.y * outerDepthA
            };
            const pAInner = {
                x: corner.x + dirA.x * (aLen * aInnerT) + inward.x * innerDepthA,
                y: corner.y + dirA.y * (aLen * aInnerT) + inward.y * innerDepthA
            };

            // Keep apex near the geometric bisector. Only tiny jitter is allowed,
            // otherwise the polygon can fold back and create a negative angle.
            const apex = {
                x: corner.x + inward.x * apexDepth + (rand() - 0.5) * 0.16,
                y: corner.y + inward.y * apexDepth + (rand() - 0.5) * 0.16
            };

            const pBInner = {
                x: corner.x + dirB.x * (bLen * bInnerT) + inward.x * innerDepthB,
                y: corner.y + dirB.y * (bLen * bInnerT) + inward.y * innerDepthB
            };
            const pBOuter = {
                x: corner.x + dirB.x * (bLen * bOuterT) + inward.x * outerDepthB,
                y: corner.y + dirB.y * (bLen * bOuterT) + inward.y * outerDepthB
            };

            addPolyline(
                svg,
                [edgeA, pAOuter, pAInner, apex, pBInner, pBOuter, edgeB],
                'ruin-fracture-border ruin-fracture-damaged ruin-fracture-compass-chip',
                opts.opacity ?? 0.90
            );
        }

        const tl = { x: 0.5, y: 0.5 };
        const tr = { x: w - 0.5, y: 0.5 };
        const br = { x: w - 0.5, y: h - 0.5 };

        const tlChipActive = rng() < 0.55;
        const trChipActive = rng() < 0.52;
        const lbChipActive = rng() < 0.58;

        const tlTopInset = tlChipActive ? 6 + rng() * 6 : 0;
        const tlLeftInset = tlChipActive ? 5 + rng() * 7 : 0;
        const trTopInset = trChipActive ? 6 + rng() * 7 : 0;
        const trRightInset = trChipActive ? 5 + rng() * 7 : 0;
        const lbLeftInset = lbChipActive ? 6 + rng() * 8 : 0;
        const lbDiagInset = lbChipActive ? 8 + rng() * 10 : 0;

        const topStart = tlChipActive ? { x: tl.x + tlTopInset, y: tl.y } : tl;
        const topEnd = trChipActive ? { x: tr.x - trTopInset, y: tr.y } : tr;
        const rightStart = trChipActive ? { x: tr.x, y: tr.y + trRightInset } : tr;
        const leftStart = tlChipActive ? { x: tl.x, y: tl.y + tlLeftInset } : tl;
        const leftEnd = lbChipActive ? { x: leftFree.x, y: Math.max(1.5, leftFree.y - lbLeftInset) } : leftFree;

        const diagonalVector = vec(leftFree, bottomFree);
        const lbDiagT = diagonalVector.len > 0 ? Math.min(0.28, lbDiagInset / diagonalVector.len) : 0;
        const masonryStart = lbChipActive ? pointAt(leftFree, bottomFree, lbDiagT) : leftFree;

        addPolyline(svg, [topStart, topEnd], 'ruin-fracture-border', 0.84);
        addPolyline(svg, [rightStart, br], 'ruin-fracture-border', 0.84);
        addPolyline(svg, [leftStart, leftEnd], 'ruin-fracture-border', 0.84);
        addPolyline(svg, [bottomFree, br], 'ruin-fracture-border', 0.84);

        const masonryEdge = buildMasonryEdgePoints(masonryStart, bottomFree, rng);
        addPolyline(svg, masonryEdge, 'ruin-fracture-border ruin-fracture-damaged', 0.90);

        if (tlChipActive) {
            addSmallCornerChip(topStart, tl, leftStart, rng, { depth: 2.4 + rng() * 1.9, opacity: 0.90 });
        }
        if (trChipActive) {
            addSmallCornerChip(topEnd, tr, rightStart, rng, { depth: 2.2 + rng() * 2.0, opacity: 0.90 });
        }
        if (lbChipActive) {
            addSmallCornerChip(leftEnd, leftFree, masonryStart, rng, { depth: 2.6 + rng() * 2.2, opacity: 0.90 });
        }

        target.appendChild(svg);
        target.classList.add('fracture-active');
    }

    // v179 · Illustrator editing workflow:
    // - always request the freshest SVG while the site is actively being edited;
    // - allow ?drawer-svg=left / ?drawer-svg=right to force one authored variant
    //   without changing source code. Default remains random.
    const INDEX_DRAWER_SVG_URLS = Object.freeze({
        left: `assets/index-drawer-left.svg?edit=${Date.now()}`,
        right: `assets/index-drawer-right.svg?edit=${Date.now()}`
    });
    const drawerSvgDebugMode = new URLSearchParams(window.location.search).get('drawer-debug') === '1';

    function setIndexDrawerSvgDebug(message, ok = true) {
        if (!drawerSvgDebugMode) return;
        let panel = document.getElementById('index-drawer-svg-debug-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'index-drawer-svg-debug-panel';
            panel.style.cssText = [
                'position:fixed',
                'left:12px',
                'top:12px',
                'z-index:999999',
                'padding:8px 10px',
                'font:12px/1.45 monospace',
                'background:rgba(255,255,255,.96)',
                'border:1px solid #333',
                'color:#111',
                'pointer-events:none',
                'white-space:pre-wrap'
            ].join(';');
            document.body.appendChild(panel);
        }
        panel.style.borderColor = ok ? '#008b57' : '#d00040';
        panel.textContent = message;
    }

    const drawerSvgRequestedVariant = new URLSearchParams(window.location.search).get('drawer-svg');
    const INDEX_DRAWER_SVG_VARIANT = ['left', 'right'].includes(drawerSvgRequestedVariant)
        ? drawerSvgRequestedVariant
        : 'random'; // 'random' | 'left' | 'right'
    const indexDrawerSvgSourcePromises = new Map();
    let indexDrawerSvgVariant = null;

    // v187 · stable, non-stretching Index Drawer surface.
    // The authored SVG is taller than the currently visible drawer. Extra vertical
    // space is a reserve area for Illustrator work. The UI reveals/crops that reserve
    // instead of stretching the drawing when the drawer height changes.
    const INDEX_DRAWER_SVG_WIDTH = 1600;
    const INDEX_DRAWER_SVG_HANDLE_HEIGHT = 60;
    const INDEX_DRAWER_SVG_MASTER_HEIGHT = 1160;
    const INDEX_DRAWER_SVG_BODY_MAX = INDEX_DRAWER_SVG_MASTER_HEIGHT - INDEX_DRAWER_SVG_HANDLE_HEIGHT;


    // v192 · Illustrator-authored closed slab outlines.
    // Kept in JS as well as the SVG so file:// fallback can still apply the
    // correct 60/40 candidate and a real masked backdrop-filter.
    const INDEX_DRAWER_VARIANT_PATHS = Object.freeze({"left": "M0,60l174.5-40.5l2.9,3.3l4.1,1.4l8.2,0.5l10.4,2.8l1.9,3.1l5.8,5.6l0.5,1.1l2.2,1.5l1.5,0.9l0.2,3.2v9.7    l-1.6,10.6l-0.2,3.7l-3.3,4.8l-0.9,2.7l-1.8,2.2l-1.8,3.5L189,83.7l-8.9,6.9l-7,13.2l-0.8,6.1l-2.2,5.5l-3.1,7.2l-6,6.6l-2.4,6.7    l-1.4,3.9l-2.9,7.8l-3.1,4.4l-13.4,0.6h-9.1l-5.8,1.4h-5.5h-8l-18.6,6.5l-10.2,0.8L67.2,164l-8.2,2.7l-16.1,3.7l-13.3,3.8H3.2    l-2.1-0.4L0,171.9V183l3.5-3.5l4.2-0.7l6.5-2.1l4.2-0.9h3.9l5.3-0.4h6.9l9-1.7l6.8-1.4l10.2-3.4l11.5-3.8l7.6-1.5l9.6-0.9l5.3-2.4    l7.3-1.9l9.2-1.9h6.6l10.5-1.3l4.3-1.2l8.6,1l13.7-2.3l3-5.5l2.9-10.6l0.5-2.6l7.7-11.4l2.4-4.9l6.2-8.6l2.1-6.6l3.6-5l5.3-11    l10.8-3.2l9.8-5l4.4-4.9l4.9-3.5l4.2-1.8l4.5-0.7l0.9-3.3v-4.7l-1.7-5.4l-9.7-9.9l-0.8-1.3l-2.5-2l-1.7-2.1l-0.8-1.3l-1.5-1.4    l-0.6-1.3V32v-1.9l-1.9-1.9l-0.4-1.6v-2.2l0.4-5.8l1.1-1.2l1.7-1.4l1.2-2.5l3.5-3l42.1-9.7h242.8L722.3,0l3.2,3l-0.1,5.6l-1.4,6.5    l-1.2,7.3l0.2,6.9l1.5,18.9l4.3,9.8l3.1,7.1l4.5,5.4l8.4,4.5l8.7,2.3l4.3,1.1l10.2,2l10.4,4l8.1,3.2l5.1,2.9l5.1,2.4l5.4,4.8    l5.1,3.1l6,3.4l9.1,6.8l10,3.7l12.8,7.1l5.4,5.9l2.6,5.5l9.1,6.3l10.5,7.4l11.8,4.2l4.4,3.6l11.2,10.9l10.6,7l4.5,3.1l9.2,7.2    l3.5,5.1l-1.7,4.4l-2.7,4.1l-2.9,3.3l-1.3,4.1l-3.1,4.6l-3.7,2.5l-4.7,2.2l-4.7,4.1l-4.5,6.6l-2.3,7.6l-6.5,8.7l-4.3,10.8    l-5.8,15.9l-2,8.1l-0.5,12.2l-6.9,10.1l-12.6,17l-2,12.5l-5.3,8l-4.2,4.1l-5.3,5.7l-11,8.9L825,358l-7.9,4.8l-12.9,13.9l-5.8,12    l-12.7,14.1l-4.1,4.9l-2.6,6.8l-6.1,9.2l-5.6,7l-5.1,10.5l-3.8,6.9l-1.8,3.2l-9.2,16.5l-12.2,12l-4.6,6.4l-12.2,11.6l-9.2,12    l-6.7,11.4l-7.1,9.2l-4.7,12.6l-8.4,18.2l-6.7,7.7l-1.7,2l-15.4,12.5l-6.2,10.8l-5.3,9.1l-5.3,6.8l-7.7,18l-2.3,5.5L627,644    l-5,11.8l-5.7,10.6l-1.9,7.1l-1.9,7l-5.8,11.6l-9,13.7l-7,13.1l-6.1,11.2l-7.6,11.8l-10.2,22.9l-8.9,20.8l-9.4,20.8l-3,17.1    l1.1,12l-5,15.4l-2.6,16.4l-4,15.3l-5.5,22l-2.7,11.2l-6.6,15l-5.7,4.6l-12,6.9l-12.6,8.2l-8.3,0.9l133.5,1.6l25.7,0.3l-46-5.4    l-11.5-5.9l-21.9-6.3l-7.7-7.8l-5.2-2.1l-4.7-6.7l-3.6-4.2l-1.7-5.8l-2-6.7l-1.1-7.5l0-2.6l0.5-3.4l3.3-11.1l4.5-25.2l2.2-6    l1.6-5.6l1.7-13l0.9-14.3l4.8-12.7l0.6-5.8l2.5-4.9l7-13.3l1.3-4.2l9.9-22.9l3-6.4l6.3-10.7l4.2-10.1l7.1-12.1l6.4-9l3-6.5    l4.9-8.6l3.9-7.9l1.5-8.4l3.3-7.5l5.9-5.9l0.9-4.3l6.6-17.6l5.5-12.9l4.2-7.4l7.7-14.1l6.4-10.7l4.2-5l9.4-8.2l7.9-8.9l6.5-7.9    l5.6-12.6l4-11l4.8-7l11.3-10.2l7.3-11.4l12.2-14.8l4.9-7.4l1.9-5l5.2-5.5l11.4-11.5l6.6-10.1l4.7-11.1l0.9-6.3l13.6-16.2    l5.6-10.3l7.4-11.1l11.7-15.1l8.9-12.4l15.4-10.4l16.7-16l5.6-6.4l9.5-12.6l0.9-5.5l9.2-14.4l10.6-15.6l-0.1-4.1l0.3-4.3l9.1-25.5    l7-17.1l1.9-5.8l2-3.9l2-5.7l3.7-5.2l8.1-2.7l0.6-2.2l4-2.3l5.4-3.5l5.8-3.5l4.9,0.8l12.2,6.6l11.5,2.7l3.7,0.9l23,12.9l15,5.8    l18.6,8.1l9.1,9.1l4.5,3.5l8.9,7l4.4,3.2l10.5,8.1l5.5,4.2l12.5,6.1l12.1,12.8l6.2,7.4l4.5,7.4l8.5,8.4l11.8,7.2l13.6,12.3    l6.8,4.3l8.5,13.7l5.3,6.1l5.9,4.8l9.1,9l6.7,7.8l10,8.9l7.5,5.6l12.1,10.4l6.3,4.5l2.9,4.4l8.7,11.5l3.2,6.4l8.8,4.2l9.1,3.4    l6.2,5.2l7.3,7l7,3.5l3.3,4.2l1.7,6.6l7.2,3.3l3.6,11.4l9.1,12.7l10.3,16.2l5.9,8.8l4.2,7l6.4,6.2l7.6,8.5l4.5,5.2l4.3,6.5    l2.5,7.6l3.4,6.8l4.7,8.1l3.5,7.6c0,0,3.8,6.7,4,7.2c0.2,0.5,4.9,7.5,4.9,7.5l6.3,5.8l7.8,9.1l1.4,3.7l3.2,7.2l6.6,9.1    c0,0,3.7,6.4,4.2,6.7c0.5,0.3,6.1,10.1,6.1,10.1l6.7,10.7l2.8,3.6l9.5,8.3l7.2,13.5c0,0,3.4,5.5,3.8,6l1.8,8.6l3.4,7.4l6.7,7    l14.2,18.9l4.3,8.5l5.5,6.7l6.5,5.1l3.5,7l2.8,9.5l4,6.7l4.4,4.1l6.6,7.3l0.9,6.5c0.6,1.8,4.6,6.8,4.6,6.8l5.9,4.3l6,4.6l6.3,5.5    l3.9,5.5l3.1,6.7l1,9.5l4,7.7l5.9,9.8l12.3,7.4l3.1,5.9l8,9.8l-0.4,6.1l11.4,14l22.5,10.5l15.6,4.9l1.1-15.5l-15,1.9l-17.6-7.6    l-4-4.6l-2.6-3.9l-6.7-3.8l3.2-9.3l-2.2-5.2l-8.9-8.4l-12.8-9.2l-9.4-17.8l-2.7-5.9l-6.7-8.8l-12.7-16.5l-10-10.2l-1.6-6.3l-5-6    l-7.3-4.9l-8.3-10.2l-0.5-8l-5.6-5.6l-4.4-8l-26.6-34.3l-6-15.7l-4.9-10.8l-13.3-16.5l-7.8-7.4l-8.9-13.6l-4.9-6l-3.5-11l-8.5-6.7    l-2-6.3l-1.9-8.5l-4.9-16.6l-7.5-4.8l-8.5-7.9l-11-10.8l-0.4-6.6l-4-8.2l-9-7.9l-9.5-11.7l-3-6.6l-7-11l-2.6-3.4l-5.7-7.5    l-4.2-5.6l-4.1-6.2l-2.3-3.5l-5-8.8l-6.4-16.3l-16.6-12.4l-13.6-8.9l-15.1-5.2l-4.5-3.8l-2.5-5.7l-6.5-8.8l-4.5-7.9l-30.1-24.1    l-7-10.4l-4.5-5.4l-5-3.5l-3.5-5l-7-7.9l-3.9-10.4l-5.5-7.6l-11.6-8l-9.1-5.4l-7-5.4l-7-7.3l-8-10.7l-3.4-8.5l-16.1-13.3    l-16.6-11.8l-20.2-8.4l-18.1-13l-14.6-11.4L984,210.8l-32.3-16L930,181.7l-10-8.9l-0.4-6.6l0.1-4.7l3.1-11.3l10.2-12.5l15.4-9.6    l23.4-19.5l5.9-5.1c0,0,15.7-6.6,31.2-14.7c3.8-2,7.5-4,11.1-6.1c1.9-1.1,3.8-2.3,5.6-3.4c4.4-2.8,8-5.6,10.4-8.2    c12.3-13.2,21.9-23.1,21.9-23.1l8.6-14.8c0,0,0.6-1.1,1.6-2.7c1.1-1.7,2.6-4,4.3-5.7c1.1-1.1,3.7-3.8,6.6-6.7    c5.3-5.4,14-13.6,14-13.6l-13,0.5l5,2.7l-2.1,3l-3.4,5l-4.1,3.4l-4.9,5.8l-6.1,9.2l-2.9,5.4l-5.5,7.5l-7.3,6.1l-5.9,8.7l-7,7.6    l-4.7,5l-10,6.6l-13.7,7.8l-19.4,9.3l-8.2,3.8l-3.7,1.9l-20.3,17.6l-6,4.7l-2.5,1.6l-11.4,6.4l-3.5,2.5l-2.6,3.8l-4.4,5.8    l-3.3,3.8l-2.5,6.5l-1.7,3.2l-3.8,3l-3.2,1.6l-4.1-0.6l-2.9-2l-4.9-4.8l-7.6-5.9l-9.9-2.8l-14-8.3l-8.7-7l-4.6-6.6l-6.5-5.3    l-12.6-5.7l-9.7-4.3l-9.1-6.6l-6.6-4.3l-12.4-8.7L772,81l-5.7-2.3l-14.2-4l-9.4-2.2l-3.4-3.2l-3.8-5.7l-6.7-16.5l-1.9-5.4v-9.3    l-2-10.1l7.6-16.5l4.2-4.3l24-0.9L1060,0.8l1.9,1.4l1.9,0.8l4.8,0.1l6.2,1l4.9,0.8l8.6-0.6l1.5,0.1h2.9l2.5-1.6h3l1.4-0.7l4.2-1.3    h96l3.1,0.5l6.1,0.4l22.3-0.5l2.7-0.4h179L1600,60v1100H0V67.4", "right": "M0,60v1100h1600V60l-64.3-24.9l-1.4,1.8l-1.5,2.5l-2.2,1.4l-0.6,1.7l-2.9,1.9l-2.2,1.7l-1.3,0.2l-2.3,0.4    l-2,1.1l-4.9,0.6l-4.2-0.2l-5.9-0.1l-3.8,0.3l-4.8-0.3l-1.3-0.3h-1.1l-1.4,1.9l-3.7,4.2l-3.2,2.8l-3.3,1.7l-0.2,2.6l-0.2,5.9    l-0.9,4.6l-0.9,3.5l-0.6,3.9l0.3,3.6l1.1,1.7v6.3l-0.6,1.6l-1,2.6l-0.6,3.3l0.1,6l-0.2,3.2l-0.4,2.2l-0.6,8.6l-1.2,0.6l-2.9,4.2    l-3.6,4.6l-1.1,4.5l-1.8,4.1l-2.1,5.8l-2.6,8.1l-3,6.6l-0.3,2.6v3.5l-1.4,4.6v8.4l-1,1.9l-2.5,2.7l-2.1,6.2l-1,4.9l0.1,7.9    l-1.3,1.1l-1.5,2.1l-2.7,5.8l-1.8,2.1l-3.9,7.4l1.1,2.3l0.2,2.7l0.2,4.6l-1.8,13.8l-2.1,11.2l-0.9,3.9l-0.7,5.2l1.3,9.5l2.3,13.3    l1.3,16.1l3.5,32.6l0.9,16.6v5.5l0.1,8.2l0.4,8.4l0.1,7.9l1.2,14.7v7.4c0,0,1,12.2,1.8,16.4c0.9,4.3-0.1,27.9-0.1,27.9l-0.6,4.4    l-2,9l-1.7,9.1l-0.9,7.4l-0.5,7.4l-0.2,16.9l0.5,8.1l0.5,4.1l2,8.3c0,0,4.4,19.3,9.2,37.2c4.8,17.9,14.7,25.8,14.7,25.8H1445    l0.1-2.9l-0.3-11.5l0.1-14.2l-0.6-8.5l-0.9-10.7l-1.1-14.5l-1-6.8l-0.4-8.6v-7.4v-8.2l0.8-11.8l-0.8-2.7v-5.1l-1.3-6.8l0.4-5.7v-7    l-0.6-7.6l1-12.7l0.2-8.7l1.3-6.8l0.8-4.2l0.7-3.2l-0.2-40.9l-0.1-27.2l-1.3-15.7l-1.9-15.7l-2.7-26.7l-3-19.4l0.5-7.4l-0.9-2.9    l0.2-9.1l0.6-6.1l0.5-5.9l1.5-4.8l0.2-2.8l1.2-3.8l0.5-4l3.2-4.6l1.5-2.3l0.1-3.6l0.4-6.1l1.3-6l4.3-11.6l3.8-10.4l3.7-11.3    l1.2-5.9l1.3-4.9l3.3-9.1l1.6-2.5l1-1.6l0.9-1.4l1.8-5.3l0.6-4.2l0.8-3.9l1.4-5.2l0.7-8.3l0.6-2.6l1.8-4.7l1.2-4.1l2.8-15.1    l0.7-5.4l0.2-4.3l0.5-5.4l0.5-4.1l-1.1-0.5v-2.3V56l0.4-1.9l1.4-0.7l2.3-3l0.1-2.3l0.2-2.3l0.2-2.9l1.6-2.5l-0.6-2.6l-1.1-0.2    l-1.1-0.9l-1.6-1.5l-0.6-2.7l-0.7-1.1l-0.8-1.6l-1.3-1.6l-0.7-2.2L1413,0.9h-194.3h-3.6l-1.3,1l-1.7,1.1l-6,4.3l-4.9,4.5l-2.4,0.9    l-1.6,0.2l-2.4,1.6l-3.3,2l-5.6,2l-4,0.9l-7.1,1.4h-14.5h-3.8l-2.5-1.4l-4.5-1.3l-4.7-0.4l-11.2,0.5l-4.2,0.9l-7.4,0.4l-2.6-0.5    l-1-1.3l-1-1l-2.4-1.5l-3.9-1.8l-1.8-0.8l-4.6-0.9l-3.4-0.7l-4.2-1.4l-4.2-1.2L1091,8l-4.2-0.4l-1.2-0.5l-0.6-1l-1.4-0.6l-2-2.1    l-1.7-1.5l-0.4-1.1H256.4l-64.9,15L147.3,26L0,60z"});

    function ensureIndexDrawerScrollLayer() {
        const content = document.getElementById('index-drawer-content');
        const svgHost = document.getElementById('index-drawer-svg-body');
        if (!content || !svgHost) return null;

        let layer = document.getElementById('index-drawer-scroll-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'index-drawer-scroll-layer';
            layer.className = 'index-drawer-scroll-layer';

            const movable = [...content.children].filter(node => node !== svgHost);
            movable.forEach(node => layer.appendChild(node));
            content.appendChild(layer);
        }
        return layer;
    }


    // v189 · adaptive stone-slab height
    // Measure the real translated copy, then let the slab shrink around shorter
    // languages.  The space above Ruin Lexicology remains elastic: it survives as
    // a modest breathing gap when room exists, compresses toward zero before any
    // scrolling begins, and only after that does overflow-y:auto become active.
    function measureIndexDrawerNaturalContentHeight(layer) {
        if (!layer) return 0;
        const layerStyle = getComputedStyle(layer);
        const px = value => {
            const n = parseFloat(value);
            return Number.isFinite(n) ? n : 0;
        };

        let total = px(layerStyle.paddingTop) + px(layerStyle.paddingBottom);
        [...layer.children].forEach(child => {
            const style = getComputedStyle(child);
            if (style.display === 'none') return;
            const rect = child.getBoundingClientRect();
            const marginTop = child.classList.contains('index-items') ? 0 : px(style.marginTop);
            total += marginTop + rect.height + px(style.marginBottom);
        });
        return total;
    }

    function getIndexDrawerPreferredElasticGap() {
        const lang = document.documentElement.lang;
        if (lang === 'en') return 18;
        if (lang === 'ja') return 22;
        return 24;
    }

    // v235 · adaptive height without feeding the drawer back into its own
    // ResizeObserver / open-close animation.  v231 made this function perform
    // synchronous geometry reads every time the drawer class changed; because the
    // global ResizeObserver also watched #index-drawer, changing its height could
    // re-enter renderAllStatic() and rebuild the SVG while the archive stacks were
    // in their 400ms sink/return choreography.
    let indexDrawerAdaptiveDirty = true;
    let indexDrawerAdaptiveTimer = 0;
    let indexDrawerAdaptiveLastViewport = '';
    let indexDrawerAdaptiveLastBodyHeight = NaN;

    function markIndexDrawerAdaptiveDirty(delay = 120) {
        indexDrawerAdaptiveDirty = true;
        window.clearTimeout(indexDrawerAdaptiveTimer);
        indexDrawerAdaptiveTimer = window.setTimeout(() => {
            indexDrawerAdaptiveTimer = 0;
            syncIndexDrawerAdaptiveHeight();
        }, Math.max(0, delay));
    }

    function getIndexInscriptionLangKey(input) {
        const raw = String(input || window.currentLang || document.documentElement.lang || 'zh').toLowerCase();
        if (raw.startsWith('ja')) return 'ja';
        if (raw.startsWith('en')) return 'en';
        return 'zh';
    }

    function getIndexInscriptionMode(langKey) {
        return getIndexInscriptionLangKey(langKey) === 'en' ? 'horizontal' : 'vertical';
    }

    function syncIndexDrawerInscriptionMode() {
        const langKey = getIndexInscriptionLangKey();
        const mode = getIndexInscriptionMode(langKey);
        [
            document.getElementById('index-drawer'),
            document.getElementById('index-fracture-zone'),
            document.getElementById('index-fracture-source')
        ].forEach(el => {
            if (!el) return;
            el.dataset.inscriptionLang = langKey;
            el.dataset.inscriptionMode = mode;
        });
    }

    function ensureIndexDrawerMeasureSandbox() {
        let sandbox = document.getElementById('index-drawer-measure-sandbox');
        if (sandbox) return sandbox;
        sandbox = document.createElement('div');
        sandbox.id = 'index-drawer-measure-sandbox';
        sandbox.setAttribute('aria-hidden', 'true');
        Object.assign(sandbox.style, {
            position: 'fixed',
            left: '-20000px',
            top: '-20000px',
            width: '0px',
            height: '0px',
            overflow: 'visible',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: '-1'
        });
        document.body.appendChild(sandbox);
        return sandbox;
    }

    function applyVaultTextToClone(root, langKey) {
        const vault = languageVault[langKey] || languageVault.zh || {};
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key || !(key in vault)) return;
            const value = vault[key];
            if (value == null) return;
            el.textContent = value;
        });
    }

    function createMeasureClone(node, width, langKey, kind) {
        const clone = node.cloneNode(true);
        clone.removeAttribute('id');
        applyVaultTextToClone(clone, langKey);

        const normalizedLang = getIndexInscriptionLangKey(langKey);
        const inscriptionMode = getIndexInscriptionMode(normalizedLang);
        if (clone.classList?.contains('index-fracture-source')) {
            clone.dataset.inscriptionLang = normalizedLang;
            clone.dataset.inscriptionMode = inscriptionMode;
            clone.dataset.measureContext = 'true';
        }
        if (clone.classList?.contains('index-stable-zone')) {
            clone.dataset.inscriptionLang = normalizedLang;
        }

        Object.assign(clone.style, {
            position: 'relative',
            inset: 'auto',
            left: 'auto',
            right: 'auto',
            top: 'auto',
            bottom: 'auto',
            width: '100%',
            maxWidth: 'none',
            height: 'auto',
            minHeight: '0',
            maxHeight: 'none',
            margin: '0',
            overflow: 'visible',
            opacity: '1',
            visibility: 'visible',
            pointerEvents: 'none',
            display: kind === 'stable' ? 'block' : 'block',
            transform: 'none'
        });

        const wrapper = document.createElement('div');
        wrapper.className = `index-drawer-measure-wrap index-drawer-measure-${kind}`;
        wrapper.dataset.inscriptionLang = normalizedLang;
        wrapper.dataset.inscriptionMode = inscriptionMode;
        Object.assign(wrapper.style, {
            position: 'relative',
            display: 'block',
            width: `${Math.max(100, Math.round(width || 100))}px`,
            height: 'auto',
            minHeight: '0',
            margin: '0',
            padding: '0',
            overflow: 'visible',
            boxSizing: 'border-box'
        });
        wrapper.appendChild(clone);
        return wrapper;
    }

    function measureIndexDrawerLanguageHeights(langKey) {
        const source = document.getElementById('index-fracture-source');
        const stable = document.getElementById('index-stable-zone');
        if (!source || !stable) return null;

        const proseWidth = Math.max(source.getBoundingClientRect().width || 0, stable.getBoundingClientRect().width || 0, 640);
        const stableWidth = Math.max(stable.getBoundingClientRect().width || 0, proseWidth);
        const sandbox = ensureIndexDrawerMeasureSandbox();
        sandbox.innerHTML = '';

        const proseWrap = createMeasureClone(source, proseWidth, langKey, 'prose');
        const stableWrap = createMeasureClone(stable, stableWidth, langKey, 'stable');
        sandbox.appendChild(proseWrap);
        sandbox.appendChild(stableWrap);

        const proseHeight = proseWrap.getBoundingClientRect().height;
        const stableHeight = stableWrap.getBoundingClientRect().height;
        sandbox.innerHTML = '';

        if (proseHeight < 1 || stableHeight < 1) return null;
        return {
            proseHeight,
            stableHeight,
            totalHeight: proseHeight + stableHeight,
            lang: langKey
        };
    }

    function measureIndexDrawerLanguageEnvelope() {
        const langs = ['zh', 'ja', 'en'];
        let maxProseHeight = 0;
        let maxStableHeight = 0;
        let maxTotalHeight = 0;
        const details = [];

        langs.forEach(langKey => {
            const measured = measureIndexDrawerLanguageHeights(langKey);
            if (!measured) return;
            details.push(measured);
            maxProseHeight = Math.max(maxProseHeight, measured.proseHeight);
            maxStableHeight = Math.max(maxStableHeight, measured.stableHeight);
            maxTotalHeight = Math.max(maxTotalHeight, measured.totalHeight);
        });

        if (!details.length) return null;
        return {
            maxProseHeight,
            maxStableHeight,
            maxTotalHeight,
            details
        };
    }

    function getIndexDrawerStaticGap() {
        return window.innerHeight <= 720 ? 8 : 10;
    }


    function syncIndexDrawerAdaptiveHeight() {
        syncIndexDrawerInscriptionMode();
        const drawer = document.getElementById('index-drawer');
        const content = document.getElementById('index-drawer-content');
        if (!drawer || !content || isCompactViewport()) return false;

        const viewportKey = `${window.innerWidth}x${window.innerHeight}`;
        if (!indexDrawerAdaptiveDirty && viewportKey === indexDrawerAdaptiveLastViewport) {
            return false;
        }

        const rootStyle = getComputedStyle(document.documentElement);
        const cssNum = (name, fallback) => {
            const n = parseFloat(rootStyle.getPropertyValue(name));
            return Number.isFinite(n) ? n : fallback;
        };

        const handleHeight = cssNum('--index-v208-handle-height', 60);
        const rootLang = String(window.currentLang || document.documentElement.lang || 'zh').toLowerCase();
        const verticalLanguage = rootLang.startsWith('zh') || rootLang.startsWith('ja');
        const referenceGeometryScale = Number(window.__ruinReferenceViewport?.geometryScale)
            || cssNum('--reference-geometry-scale', 1)
            || 1;

        // Keep the authored type exactly as V291; only compress expendable air
        // around it when the desktop viewport is smaller than 1660×900.
        const upperTopReference = 42;
        const upperTopBase = upperTopReference * referenceGeometryScale;
        const upperTop = verticalLanguage
            ? Math.max(10, upperTopBase * 0.5)
            : Math.max(18, upperTopBase);
        const stableBottom = Math.max(16, 28 * referenceGeometryScale);
        const envelope = measureIndexDrawerLanguageEnvelope();

        if (!envelope || envelope.maxProseHeight < 1 || envelope.maxStableHeight < 1) {
            indexDrawerAdaptiveDirty = true;
            markIndexDrawerAdaptiveDirty(90);
            return false;
        }

        const viewportBodyMax = Math.max(
            340,
            Math.min(
                660,
                window.innerHeight - handleHeight - Math.max(28, 48 * referenceGeometryScale)
            )
        );
        let gapBase = getIndexDrawerStaticGap() * referenceGeometryScale;
        let gap = verticalLanguage ? Math.max(3, gapBase * 0.5) : Math.max(6, gapBase);
        let bodyHeight = upperTop + envelope.maxProseHeight + gap + envelope.maxStableHeight + stableBottom;

        if (bodyHeight > viewportBodyMax) {
            const excess = bodyHeight - viewportBodyMax;
            gap = Math.max(verticalLanguage ? 3 : 6, gap - excess);
            bodyHeight = upperTop + envelope.maxProseHeight + gap + envelope.maxStableHeight + stableBottom;
        }
        bodyHeight = Math.min(bodyHeight, viewportBodyMax);

        const stableReserve = stableBottom + envelope.maxStableHeight + gap;
        const changed = !Number.isFinite(indexDrawerAdaptiveLastBodyHeight)
            || Math.abs(bodyHeight - indexDrawerAdaptiveLastBodyHeight) > 0.5;

        const root = document.documentElement;
        if (changed) {
            root.style.setProperty('--index-v208-body-height', `${bodyHeight.toFixed(2)}px`);
            root.style.setProperty('--index-v208-stable-reserve', `${stableReserve.toFixed(2)}px`);
            root.style.setProperty('--index-v208-stable-bottom', `${stableBottom.toFixed(2)}px`);
            root.style.setProperty('--index-v231-stable-bottom', `${stableBottom.toFixed(2)}px`);
        }

        drawer.dataset.drawerHeight = bodyHeight.toFixed(2);
        drawer.dataset.drawerMaxProseHeight = envelope.maxProseHeight.toFixed(2);
        drawer.dataset.drawerMaxStableHeight = envelope.maxStableHeight.toFixed(2);
        drawer.dataset.drawerStaticGap = gap.toFixed(2);

        indexDrawerAdaptiveDirty = false;
        indexDrawerAdaptiveLastViewport = viewportKey;
        indexDrawerAdaptiveLastBodyHeight = bodyHeight;

        if (changed) {
            window.requestAnimationFrame(() => {
                syncIndexDrawerSvgBodyViewBox();
                syncIndexDrawerCrackOverpass();
            });
            window.setTimeout(() => {
                syncIndexDrawerSvgBodyViewBox();
                syncIndexDrawerCrackOverpass();
            }, 320);
        }
        return changed;
    }


    function syncIndexDrawerAdaptiveHeightThroughTransition() {
        // Compatibility hook used by language/SVG code. Opening/closing the
        // drawer no longer forces measurement when the content is unchanged.
        if (!indexDrawerAdaptiveDirty) return;
        markIndexDrawerAdaptiveDirty(40);
    }

    function installIndexDrawerAdaptiveContentObserver() {
        syncIndexDrawerInscriptionMode();
        if (!('MutationObserver' in window)) return;
        const source = document.getElementById('index-fracture-source');
        const stable = document.getElementById('index-stable-zone');
        const targets = [source, stable].filter(Boolean);
        if (!targets.length) return;

        let adaptiveDeferredByCyberDecode = false;
        const mo = new MutationObserver(() => {
            if (window.__cyberDecodeActive) {
                adaptiveDeferredByCyberDecode = true;
                return;
            }
            markIndexDrawerAdaptiveDirty(150);
        });
        targets.forEach(target => mo.observe(target, {
            subtree: true,
            childList: true,
            characterData: true
        }));

        const langObserver = new MutationObserver(() => {
            syncIndexDrawerInscriptionMode();
            const sourceNow = document.getElementById('index-fracture-source');
            const zoneNow = document.getElementById('index-fracture-zone');
            const langNow = getIndexInscriptionLangKey();
            const modeNow = getIndexInscriptionMode(langNow);
            if (sourceNow) {
                sourceNow.dataset.inscriptionLang = langNow;
                sourceNow.dataset.inscriptionMode = modeNow;
            }
            if (zoneNow) {
                zoneNow.dataset.inscriptionLang = langNow;
                zoneNow.dataset.inscriptionMode = modeNow;
                if (modeNow === 'vertical') zoneNow.classList.remove('stone-rubbing-text-ready');
            }
            if (window.__cyberDecodeActive) adaptiveDeferredByCyberDecode = true;
            else markIndexDrawerAdaptiveDirty(150);
        });
        langObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['lang']
        });
        document.addEventListener('languagechange-complete', () => {
            if (!adaptiveDeferredByCyberDecode) return;
            adaptiveDeferredByCyberDecode = false;
            markIndexDrawerAdaptiveDirty(0);
        });
    }

    function getIndexDrawerBodyViewBoxHeight() {
        const host = document.getElementById('index-drawer-svg-body');
        if (!host) return 700;
        const rect = host.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return 700;

        // Keep one SVG unit square on screen: vertical size is derived from the
        // horizontal 1600-unit master scale. This reveals more/less reserve instead
        // of squeezing cracks vertically.
        const units = rect.height * INDEX_DRAWER_SVG_WIDTH / rect.width;
        return Math.max(420, Math.min(INDEX_DRAWER_SVG_BODY_MAX, units));
    }

    function syncIndexDrawerSvgBodyViewBox() {
        const bodyUnits = getIndexDrawerBodyViewBoxHeight();
        const viewBox = `0 ${INDEX_DRAWER_SVG_HANDLE_HEIGHT} ${INDEX_DRAWER_SVG_WIDTH} ${bodyUnits.toFixed(2)}`;

        document.querySelectorAll('#index-drawer-svg-body > svg, #index-drawer-crack-overpass-body > svg')
            .forEach(svg => {
                svg.setAttribute('viewBox', viewBox);
                svg.setAttribute('preserveAspectRatio', 'none');
            });

        const drawer = document.getElementById('index-drawer');
        if (drawer) drawer.dataset.svgBodyUnits = bodyUnits.toFixed(2);
        syncIndexDrawerFrostMasks(bodyUnits);
    }

    function chooseIndexDrawerSvgVariant() {
        if (INDEX_DRAWER_SVG_VARIANT === 'left' || INDEX_DRAWER_SVG_VARIANT === 'right') {
            return INDEX_DRAWER_SVG_VARIANT;
        }
        if (!indexDrawerSvgVariant) {
            const variantRng = rngFor('index-drawer-svg-variant-v192');
            indexDrawerSvgVariant = variantRng() < 0.60 ? 'left' : 'right';
        }
        return indexDrawerSvgVariant;
    }

    function fetchIndexDrawerSvgSource(variant) {
        const key = variant === 'right' ? 'right' : 'left';
        if (!indexDrawerSvgSourcePromises.has(key)) {
            const url = INDEX_DRAWER_SVG_URLS[key];
            const promise = fetch(url, { cache: 'no-store' })
                .then(response => {
                    if (!response.ok) throw new Error(`Index Drawer SVG ${key} HTTP ${response.status}`);
                    return response.text();
                })
                .then(text => {
                    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
                    const root = parsed.documentElement;
                    if (!root || root.nodeName.toLowerCase() !== 'svg') {
                        throw new Error(`Invalid Index Drawer SVG: ${key}`);
                    }
                    const expectedFrame = key === 'right' ? '#FRAME_RIGHT' : '#FRAME_LEFT';
                    if (!root.querySelector(expectedFrame)) {
                        throw new Error(`Index Drawer ${key} SVG is missing ${expectedFrame}`);
                    }
                    setIndexDrawerSvgDebug(
                        `index-drawer-${key}.svg FETCH OK\nframe: ${expectedFrame}\nbytes: ${text.length}`,
                        true
                    );
                    return root;
                })
                .catch(error => {
                    indexDrawerSvgSourcePromises.delete(key);
                    setIndexDrawerSvgDebug(`index-drawer-${key}.svg FETCH ERROR\n${error.message || error}`, false);
                    throw error;
                });
            indexDrawerSvgSourcePromises.set(key, promise);
        }
        return indexDrawerSvgSourcePromises.get(key);
    }

    function prefixSvgIds(svg, prefix) {
        const idMap = new Map();
        svg.querySelectorAll('[id]').forEach(node => {
            const oldId = node.id;
            const newId = `${prefix}-${oldId}`;
            idMap.set(oldId, newId);
            node.id = newId;
        });

        if (!idMap.size) return;

        svg.querySelectorAll('*').forEach(node => {
            Array.from(node.attributes || []).forEach(attr => {
                let value = attr.value;
                idMap.forEach((newId, oldId) => {
                    value = value
                        .replaceAll(`url(#${oldId})`, `url(#${newId})`)
                        .replaceAll(`#${oldId}`, `#${newId}`);
                });
                if (value !== attr.value) node.setAttribute(attr.name, value);
            });
        });
    }

    function forceIndexDrawerVariantVisibility(svg, variant) {
        const left = svg.querySelector('#VARIANT_LEFT');
        const right = svg.querySelector('#VARIANT_RIGHT');
        if (left) left.style.setProperty('display', variant === 'left' ? 'inline' : 'none', 'important');
        if (right) right.style.setProperty('display', variant === 'right' ? 'inline' : 'none', 'important');
    }

    function getIndexDrawerVisibleFrameGroup(svg, variant) {
        const wantedId = variant === 'right' ? 'FRAME_RIGHT' : 'FRAME_LEFT';
        return svg.querySelector(`#${wantedId}`) || svg.querySelector(`[id$="-${wantedId}"]`);
    }

    function getIndexDrawerMainFramePaths(svg, variant) {
        const group = getIndexDrawerVisibleFrameGroup(svg, variant);
        if (!group) return [];
        return [...group.querySelectorAll('path')].filter(path => {
            const d = (path.getAttribute('d') || '').replace(/\s+/g, '');
            return d.length > 180;
        });
    }

    function prepareIndexDrawerFrame(svg, variant) {
        forceIndexDrawerVariantVisibility(svg, variant);

        const frameGroup = getIndexDrawerVisibleFrameGroup(svg, variant);
        if (frameGroup) {
            // The two Illustrator files use .st0 { opacity: .5 } and .st1/.st2
            // with hard-coded #000 strokes. Remove that inherited dimming here
            // and let reader-tone variables own both colour and alpha.
            frameGroup.style.setProperty('opacity', '1', 'important');
            frameGroup.style.setProperty('display', 'inline', 'important');
            frameGroup.querySelectorAll('path, line, polyline, polygon, circle, ellipse').forEach(shape => {
                shape.classList.add('drawer-frame-detail');
                shape.style.setProperty('fill', 'none', 'important');
                shape.style.setProperty('stroke', 'var(--index-drawer-frame-stroke)', 'important');
                shape.style.setProperty('stroke-opacity', '1', 'important');
                shape.setAttribute('vector-effect', 'non-scaling-stroke');
            });
        }

        getIndexDrawerMainFramePaths(svg, variant).forEach(path => {
            path.classList.add('drawer-frame');
            path.style.setProperty('fill', 'none', 'important');
            path.style.setProperty('stroke', 'var(--index-drawer-frame-stroke)', 'important');
            path.setAttribute('vector-effect', 'non-scaling-stroke');
        });

        const crackSelectors = variant === 'right'
            ? ['#CRACK_RIGHT', '.drawer-crack', '.drawer-crack-detail']
            : ['#CRACK_LEFT', '.drawer-crack', '.drawer-crack-detail'];
        const seenCracks = new Set();
        crackSelectors.forEach(selector => {
            svg.querySelectorAll(selector).forEach(group => {
                if (seenCracks.has(group)) return;
                seenCracks.add(group);
                const shapes = group.matches('path, line, polyline, polygon, circle, ellipse')
                    ? [group]
                    : [...group.querySelectorAll('path, line, polyline, polygon, circle, ellipse')];
                shapes.forEach(shape => {
                    const detail = shape.classList.contains('drawer-crack-detail') || !!shape.closest('.drawer-crack-detail');
                    shape.classList.add(detail ? 'drawer-crack-detail' : 'drawer-crack');
                    shape.style.setProperty(
                        'stroke',
                        detail ? 'var(--index-drawer-crack-detail-stroke)' : 'var(--index-drawer-crack-stroke)',
                        'important'
                    );
                    shape.setAttribute('vector-effect', 'non-scaling-stroke');
                });
            });
        });
    }

    // ========================================================================
    // v291-opt30 · visible Index Drawer shell pits
    // ------------------------------------------------------------------------
    // The current performance renderer intentionally hides both
    // #index-drawer-svg-handle and #index-drawer-svg-body. The visible outer
    // silhouette is actually #index-drawer::before / ::after, driven by one
    // CSS clip-path. Therefore pits must modify THAT shell geometry directly.
    // ========================================================================
    function buildIndexDrawerShellEdge(a, b, pit = null) {
        if (!pit) return [a, b];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len; // inward normal for all three top-shell segments

        const centerT = Math.max(0.10, Math.min(0.90, pit.centerT));
        const halfT = Math.max(0.025, Math.min(0.18, pit.halfT));
        const depth = Math.max(1.4, pit.depth);

        // Broad, slightly asymmetric stone bite: wider than the old frame pit,
        // but deliberately shallower. No crack is attached to any of these pts.
        const profile = [
            [-1.28, 0.00],
            [-0.92, 0.13],
            [-0.56, 0.48],
            [-0.22, 0.82],
            [ 0.00, 1.00],
            [ 0.28, 0.72],
            [ 0.62, 0.36],
            [ 0.96, 0.10],
            [ 1.28, 0.00]
        ];

        const pitPoints = profile.map(([offset, weight]) => {
            const t = Math.max(0, Math.min(1, centerT + offset * halfT));
            const bx = a.x + dx * t;
            const by = a.y + dy * t;
            return {
                x: bx + nx * depth * weight,
                y: by + ny * depth * weight
            };
        });

        // Keep the untouched straight spans before and after the pit. Without
        // these endpoints, the polygon connects one pit shoulder directly to
        // the next segment and appears as a huge stretched diagonal.
        return [a, ...pitPoints, b];
    }

    function getIndexDrawerShellPitPlan() {
        if (window.__indexDrawerShellPitPlanV30) return window.__indexDrawerShellPitPlanV30;

        const rng = rngFor('index-drawer-visible-shell-pits-v291-opt30');
        const plan = [];

        // Safe intervals intentionally stay away from the three junctions and
        // from the centre seam/crossing region where existing fracture openings
        // are most likely to meet the outer edge.
        const ranges = {
            left:  [[0.22, 0.43], [0.56, 0.74]],
            top:   [[0.10, 0.28], [0.33, 0.44], [0.58, 0.70], [0.76, 0.90]],
            right: [[0.24, 0.45], [0.57, 0.76]]
        };

        const makePit = (segment) => {
            const pool = ranges[segment];
            const range = pool[Math.floor(rng() * pool.length)] || pool[0];
            const centerT = range[0] + rng() * (range[1] - range[0]);
            const isTop = segment === 'top';
            return {
                segment,
                centerT,
                halfT: isTop
                    ? 0.042 + rng() * 0.032
                    : 0.078 + rng() * 0.038,
                depth: isTop
                    ? 3.0 + rng() * 2.0
                    : 3.2 + rng() * 2.1
            };
        };

        // Always one visible pit. A second one appears often enough to stop the
        // border from feeling like a single designed notch, but never mirrored.
        const primaryRoll = rng();
        const primary = primaryRoll < 0.56 ? 'top' : (primaryRoll < 0.78 ? 'left' : 'right');
        plan.push(makePit(primary));

        if (rng() < 0.48) {
            const candidates = ['left', 'top', 'right'].filter(name => name !== primary);
            plan.push(makePit(candidates[Math.floor(rng() * candidates.length)] || candidates[0]));
        }

        window.__indexDrawerShellPitPlanV30 = plan;
        return plan;
    }

    function renderIndexDrawerShellPits() {
        const drawer = document.getElementById('index-drawer');
        if (!drawer) return;

        const rect = drawer.getBoundingClientRect();
        const width = rect.width;
        if (width < 120) return;

        const handleHeight = Math.max(44, getCssNumber('--index-v208-handle-height', 60));
        const leftInset = Math.max(14, Math.min(width * 0.42, getCssNumber('--frame-left', 230)));
        const rightInset = Math.max(14, Math.min(width * 0.42, getCssNumber('--frame-right', 168)));

        const leftStart = { x: 0, y: handleHeight };
        const leftTop = { x: leftInset, y: 0 };
        const rightTop = { x: width - rightInset, y: 0 };
        const rightEnd = { x: width, y: handleHeight };

        const plan = getIndexDrawerShellPitPlan();
        const pitFor = (segment) => plan.find(pit => pit.segment === segment) || null;

        const leftEdge = buildIndexDrawerShellEdge(leftStart, leftTop, pitFor('left'));
        const topEdge = buildIndexDrawerShellEdge(leftTop, rightTop, pitFor('top'));
        const rightEdge = buildIndexDrawerShellEdge(rightTop, rightEnd, pitFor('right'));

        // Merge shared segment endpoints and finish the full drawer polygon.
        const topPoints = [
            ...leftEdge,
            ...topEdge.slice(1),
            ...rightEdge.slice(1)
        ];

        const pointText = topPoints
            .map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`)
            .join(', ');
        const clip = `polygon(${pointText}, 100% 100%, 0 100%)`;

        drawer.style.setProperty('--index-drawer-shell-clip', clip);
        drawer.dataset.shellPits = plan
            .map(p => `${p.segment}:${p.centerT.toFixed(3)}:${p.depth.toFixed(2)}`)
            .join('|');
    }

    function getIndexDrawerConcreteToneColors() {
        const tone = clampReaderTone(readerToneValue);
        if (tone <= READER_WARM_POINT) {
            const t = tone / READER_WARM_POINT;
            const frameRgb = readerToneMixArray(
                READER_PALETTES.paper.lineStrong,
                READER_PALETTES.warm.lineStrong,
                t
            );
            const detailRgb = readerToneMixArray(
                READER_PALETTES.paper.muted,
                READER_PALETTES.warm.muted,
                t
            );
            return {
                frame: readerRgba(frameRgb, readerToneMix(0.46, 0.58, t)),
                crack: readerRgba(frameRgb, readerToneMix(0.40, 0.54, t)),
                detail: readerRgba(detailRgb, readerToneMix(0.28, 0.42, t))
            };
        }

        const t = (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT);
        // Important: night linework targets the NIGHT TEXT colour, not
        // lineStrong. That produces an unmistakable light-on-dark inversion.
        const frameRgb = readerToneMixArray(
            READER_PALETTES.warm.lineStrong,
            READER_PALETTES.night.text,
            t
        );
        const detailRgb = readerToneMixArray(
            READER_PALETTES.warm.muted,
            READER_PALETTES.night.muted,
            t
        );
        return {
            frame: readerRgba(frameRgb, readerToneMix(0.58, 0.84, t)),
            crack: readerRgba(frameRgb, readerToneMix(0.54, 0.78, t)),
            detail: readerRgba(detailRgb, readerToneMix(0.42, 0.66, t))
        };
    }

    function syncIndexDrawerToneLinework() {
        const colors = getIndexDrawerConcreteToneColors();

        document.querySelectorAll(
            '#index-drawer-svg-handle > svg, #index-drawer-svg-body > svg'
        ).forEach(svg => {
            // Illustrator exports put opacity:.5 on VARIANT_* and #000 on
            // .st1/.st2. Neutralize both at the DOM level rather than relying
            // on CSS-variable resolution inside SVG presentation attributes.
            svg.querySelectorAll('[id*="VARIANT_LEFT"], [id*="VARIANT_RIGHT"]').forEach(group => {
                group.style.setProperty('opacity', '1', 'important');
            });

            const frameGroups = svg.querySelectorAll('[id*="FRAME_LEFT"], [id*="FRAME_RIGHT"]');
            frameGroups.forEach(group => {
                group.style.setProperty('opacity', '1', 'important');
                group.querySelectorAll('path, line, polyline, polygon, circle, ellipse').forEach(shape => {
                    shape.style.setProperty('fill', 'none', 'important');
                    shape.style.setProperty('stroke', colors.frame, 'important');
                    shape.style.setProperty('stroke-opacity', '1', 'important');
                    shape.setAttribute('stroke', colors.frame);
                    shape.setAttribute('vector-effect', 'non-scaling-stroke');
                });
            });

            svg.querySelectorAll('.drawer-crack').forEach(shape => {
                shape.style.setProperty('stroke', colors.crack, 'important');
                shape.setAttribute('stroke', colors.crack);
            });
            svg.querySelectorAll('.drawer-crack-detail').forEach(shape => {
                shape.style.setProperty('stroke', colors.detail, 'important');
                shape.setAttribute('stroke', colors.detail);
            });
        });

        document.querySelectorAll('.index-drawer-crack-overpass > svg').forEach(svg => {
            svg.querySelectorAll('.drawer-crack').forEach(shape => {
                shape.style.setProperty('stroke', colors.crack, 'important');
                shape.setAttribute('stroke', colors.crack);
            });
            svg.querySelectorAll('.drawer-crack-detail').forEach(shape => {
                shape.style.setProperty('stroke', colors.detail, 'important');
                shape.setAttribute('stroke', colors.detail);
            });
        });
    }

    function makeIndexDrawerMaskDataUri(pathD, viewBox) {
        if (!pathD) return '';
        const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none"><path d="${pathD.replaceAll('&','&amp;').replaceAll('"','&quot;')}" fill="white"/></svg>`;
        return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
    }

    function ensureIndexDrawerFrostLayer(host) {
        if (!host) return null;
        let layer = host.querySelector(':scope > .index-drawer-frost-mask');
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'index-drawer-frost-mask';
            layer.setAttribute('aria-hidden', 'true');
            host.prepend(layer);
        }
        return layer;
    }

    function applyIndexDrawerFrostMask(host, part, variant, bodyUnits = null) {
        if (!host) return;
        const pathD = INDEX_DRAWER_VARIANT_PATHS[variant];
        if (!pathD) return;
        const layer = ensureIndexDrawerFrostLayer(host);
        const viewBox = part === 'handle'
            ? `0 0 ${INDEX_DRAWER_SVG_WIDTH} ${INDEX_DRAWER_SVG_HANDLE_HEIGHT}`
            : `0 ${INDEX_DRAWER_SVG_HANDLE_HEIGHT} ${INDEX_DRAWER_SVG_WIDTH} ${(bodyUnits || getIndexDrawerBodyViewBoxHeight()).toFixed(2)}`;
        const mask = makeIndexDrawerMaskDataUri(pathD, viewBox);
        layer.style.maskImage = mask;
        layer.style.webkitMaskImage = mask;
        layer.style.maskSize = '100% 100%';
        layer.style.webkitMaskSize = '100% 100%';
        layer.style.maskRepeat = 'no-repeat';
        layer.style.webkitMaskRepeat = 'no-repeat';
        layer.style.maskPosition = '0 0';
        layer.style.webkitMaskPosition = '0 0';
    }

    function syncIndexDrawerFrostMasks(bodyUnits = null) {
        const variant = chooseIndexDrawerSvgVariant();
        applyIndexDrawerFrostMask(document.getElementById('index-drawer-svg-handle'), 'handle', variant, bodyUnits);
        applyIndexDrawerFrostMask(document.getElementById('index-drawer-svg-body'), 'body', variant, bodyUnits);
    }

    function prepareIndexDrawerSvgClone(sourceRoot, part, variant) {
        const svg = document.importNode(sourceRoot, true);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        // These are now two separate Illustrator SVG files. Their exported
        // .st0/.st1/.st2 rules hard-code opacity and black strokes, so remove
        // those style blocks from the inline clone before applying tone-aware
        // stroke variables. Geometry and IDs remain untouched.
        svg.querySelectorAll(':scope > style').forEach(style => style.remove());
        prepareIndexDrawerFrame(svg, variant);

        // v247 · the drawer now reads as a field of generated stone blocks.
        // Remove the authored inner crack groups from the imported SVG so the
        // procedural negative-space seams are the only crack language inside
        // the Index Drawer.
        svg.querySelectorAll('.drawer-crack, .drawer-crack-detail, [id*="CRACK_LEFT"], [id*="CRACK_RIGHT"]').forEach(node => {
            if (node.closest('defs')) return;
            node.remove();
        });

        if (part === 'handle') {
            svg.setAttribute('viewBox', '0 0 1600 60');
        } else {
            svg.setAttribute('viewBox', '0 60 1600 700');
        }

        prefixSvgIds(svg, `index-drawer-${part}`);
        return svg;
    }


    // v181 · crack-overpass layer
    // Archive stacks are intentionally raised above the opened Index Drawer
    // (.file-stack.elevated-z = 20001). That means cracks drawn only inside
    // #index-drawer are visually covered by the archive-doc papers.
    //
    // Keep the paper/fill SVG inside the drawer, but duplicate ONLY the crack
    // geometry into a global fixed layer above the raised archive stacks.
    function ensureIndexDrawerCrackOverpassHosts() {
        let handle = document.getElementById('index-drawer-crack-overpass-handle');
        let body = document.getElementById('index-drawer-crack-overpass-body');

        if (!handle) {
            handle = document.createElement('div');
            handle.id = 'index-drawer-crack-overpass-handle';
            handle.className = 'index-drawer-crack-overpass';
            handle.setAttribute('aria-hidden', 'true');
            document.body.appendChild(handle);
        }

        if (!body) {
            body = document.createElement('div');
            body.id = 'index-drawer-crack-overpass-body';
            body.className = 'index-drawer-crack-overpass';
            body.setAttribute('aria-hidden', 'true');
            document.body.appendChild(body);
        }

        return { handle, body };
    }

    function prepareIndexDrawerCrackOnlyClone(sourceRoot, part, variant) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        // Only duplicate deliberately separated crack geometry. v191 duplicated
        // FRAME_LEFT / FRAME_RIGHT themselves, which drew the same closed slab
        // outline twice and created the apparent "two candidates overlaid" look.
        const style = sourceRoot.querySelector(':scope > style');
        if (style) svg.appendChild(document.importNode(style, true));
        const defs = sourceRoot.querySelector(':scope > defs');
        if (defs) svg.appendChild(document.importNode(defs, true));

        const ids = variant === 'left' ? ['#CRACK_LEFT'] : ['#CRACK_RIGHT'];
        const selectors = [...ids, '.drawer-crack', '.drawer-crack-detail'];
        const seen = new Set();
        selectors.forEach(selector => {
            sourceRoot.querySelectorAll(selector).forEach(node => {
                if (seen.has(node)) return;
                seen.add(node);
                svg.appendChild(document.importNode(node, true));
            });
        });

        svg.querySelectorAll('path, line, polyline, polygon, circle, ellipse').forEach(shape => {
            if (shape.closest('defs')) return;
            const detail = shape.classList.contains('drawer-crack-detail') || !!shape.closest('.drawer-crack-detail');
            shape.classList.add(detail ? 'drawer-crack-detail' : 'drawer-crack');
            shape.style.setProperty(
                'stroke',
                detail ? 'var(--index-drawer-crack-detail-stroke)' : 'var(--index-drawer-crack-stroke)',
                'important'
            );
            shape.setAttribute('vector-effect', 'non-scaling-stroke');
        });

        if (part === 'handle') {
            svg.setAttribute('viewBox', '0 0 1600 60');
        } else {
            svg.setAttribute('viewBox', '0 60 1600 700');
        }

        prefixSvgIds(svg, `index-drawer-overpass-${part}`);
        return svg;
    }


    function positionIndexDrawerCrackOverpassHost(host, sourceHost) {
        if (!host || !sourceHost) return;
        const rect = sourceHost.getBoundingClientRect();

        host.style.left = `${rect.left}px`;
        host.style.top = `${rect.top}px`;
        host.style.width = `${Math.max(0, rect.width)}px`;
        host.style.height = `${Math.max(0, rect.height)}px`;
        host.style.display = rect.width > 0 && rect.height > 0 ? 'block' : 'none';
    }

    function syncIndexDrawerCrackOverpass() {
        syncIndexDrawerSvgBodyViewBox();
        const handleSource = document.getElementById('index-drawer-svg-handle');
        const bodySource = document.getElementById('index-drawer-svg-body');
        const handle = document.getElementById('index-drawer-crack-overpass-handle');
        const body = document.getElementById('index-drawer-crack-overpass-body');

        positionIndexDrawerCrackOverpassHost(handle, handleSource);
        positionIndexDrawerCrackOverpassHost(body, bodySource);
    }

    function syncIndexDrawerCrackOverpassThroughTransition() {
        [0, 16, 70, 140, 240, 360, 460].forEach(delay => {
            window.setTimeout(syncIndexDrawerCrackOverpass, delay);
        });
    }

    // v184 · file:// fallback loader
    // Browsers intentionally block fetch() from local file pages (opaque origin),
    // producing the exact "Failed to fetch" seen in drawer-debug mode. An external
    // SVG can still be displayed as an image resource, so local Illustrator testing
    // gets a visual fallback without requiring a web server.
    function makeIndexDrawerExternalImageWrapper(part, variant) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('class', 'index-drawer-external-svg-fallback');
        svg.setAttribute('viewBox', part === 'handle' ? '0 0 1600 60' : '0 60 1600 700');

        const image = document.createElementNS(SVG_NS, 'image');
        const href = `assets/index-drawer-${variant}.svg`;
        image.setAttribute('href', href);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '1600');
        image.setAttribute('height', String(INDEX_DRAWER_SVG_MASTER_HEIGHT));
        image.setAttribute('preserveAspectRatio', 'none');
        svg.appendChild(image);
        return { svg, image };
    }


    function loadIndexDrawerSvgImageFallback(drawer, handleHost, bodyHost, reason = '') {
        const variant = chooseIndexDrawerSvgVariant();
        const handleFallback = makeIndexDrawerExternalImageWrapper('handle', variant);
        const bodyFallback = makeIndexDrawerExternalImageWrapper('body', variant);

        handleHost.replaceChildren(handleFallback.svg);
        bodyHost.replaceChildren(bodyFallback.svg);
        syncIndexDrawerFrostMasks();
        drawer.dataset.svgVariant = variant;
        drawer.dataset.svgLoader = 'image';
        drawer.classList.add('index-drawer-svg-ready');
        syncIndexDrawerAdaptiveHeightThroughTransition();
        syncIndexDrawerSvgBodyViewBox();
        window.setTimeout(syncIndexDrawerSvgBodyViewBox, 0);
        window.setTimeout(syncIndexDrawerSvgBodyViewBox, 80);

        let loaded = 0;
        let failed = false;
        const reportLoaded = () => {
            loaded += 1;
            if (loaded >= 2 && !failed) {
                setIndexDrawerSvgDebug(
                    `index-drawer.svg IMAGE FALLBACK OK\nfetch blocked: ${reason || 'unknown'}\nprotocol: ${location.protocol}\nhandle image: YES\nbody image: YES\nNOTE: local fallback displays the authored SVG, but JS cannot edit its internal variant groups.`,
                    true
                );
            }
        };
        const reportError = () => {
            failed = true;
            setIndexDrawerSvgDebug(
                `index-drawer.svg IMAGE FALLBACK FAILED\nfetch blocked: ${reason || 'unknown'}\nprotocol: ${location.protocol}\nCheck that assets/index-drawer.svg exists next to the deployed index.html.`,
                false
            );
        };

        [handleFallback.image, bodyFallback.image].forEach(img => {
            img.addEventListener('load', reportLoaded, { once: true });
            img.addEventListener('error', reportError, { once: true });
        });
    }

    async function loadIndexDrawerSvg() {
        const drawer = document.getElementById('index-drawer');
        const handleHost = document.getElementById('index-drawer-svg-handle');
        const bodyHost = document.getElementById('index-drawer-svg-body');
        if (!drawer || !handleHost || !bodyHost) return;

        ensureIndexDrawerScrollLayer();

        // Opening index.html directly from Finder / Explorer gives a file:// URL.
        // fetch() is blocked there by browser security even when the SVG exists.
        if (location.protocol === 'file:') {
            loadIndexDrawerSvgImageFallback(drawer, handleHost, bodyHost, 'file:// blocks fetch()');
            return;
        }

        try {
            const variant = chooseIndexDrawerSvgVariant();
            const sourceRoot = await fetchIndexDrawerSvgSource(variant);

            handleHost.replaceChildren(prepareIndexDrawerSvgClone(sourceRoot, 'handle', variant));
            bodyHost.replaceChildren(prepareIndexDrawerSvgClone(sourceRoot, 'body', variant));
                syncIndexDrawerFrostMasks();

            const overpass = ensureIndexDrawerCrackOverpassHosts();
            overpass.handle.replaceChildren();
            overpass.body.replaceChildren();
            syncIndexDrawerToneLinework();
            syncIndexDrawerSvgBodyViewBox();

            drawer.dataset.svgVariant = variant;
            drawer.dataset.svgLoader = 'fetch';
            drawer.classList.add('index-drawer-svg-ready');
            syncIndexDrawerAdaptiveHeightThroughTransition();
            if (drawerSvgDebugMode) {
                const hasHandleTest = !!handleHost.querySelector('[id*="DRAWER_COMMON_TEST"]');
                const hasBodyTest = !!bodyHost.querySelector('[id*="DRAWER_COMMON_TEST"]');
                setIndexDrawerSvgDebug(
                    `index-drawer-${variant}.svg FETCH OK\nDRAWER_COMMON_TEST: ${hasHandleTest && hasBodyTest ? 'YES' : 'NO'}\nhandle clone: ${hasHandleTest ? 'YES' : 'NO'}\nbody clone: ${hasBodyTest ? 'YES' : 'NO'}\nvariant: ${variant}`,
                    hasHandleTest && hasBodyTest
                );
            }
        } catch (error) {
            console.warn('[Index Drawer SVG] fetch failed; trying image fallback:', error);
            loadIndexDrawerSvgImageFallback(drawer, handleHost, bodyHost, error.message || String(error));
        }
    }

    function renderIndexDrawer() {
        // opt30 · the currently visible single-frost shell is CSS geometry,
        // while authored SVG hosts remain hidden for performance.
        renderIndexDrawerShellPits();
        loadIndexDrawerSvg();
    }


    function computeArchiveDocCornerCuts(w, h, rng, severity = 'light') {
        const maxCut = Math.min(w * 0.14, h * 0.075, severity === 'medium' ? 14 : 11.5);
        const minCut = Math.min(maxCut, severity === 'medium' ? 6.5 : 4.2);
        const tl = Math.max(0, minCut + rng() * Math.max(1.2, maxCut - minCut));
        const tr = Math.max(0, minCut + rng() * Math.max(1.2, maxCut - minCut));
        return { tl, tr };
    }

    function setArchiveDocClipPath(doc, w, h, cuts) {
        if (!doc || w < 2 || h < 2 || !cuts) return;
        const tl = Math.max(0, Math.min(cuts.tl || 0, w * 0.22, h * 0.16));
        const tr = Math.max(0, Math.min(cuts.tr || 0, w * 0.22, h * 0.16));
        const polygon = [
            `${tl.toFixed(2)}px 0px`,
            `${(w - tr).toFixed(2)}px 0px`,
            `${w.toFixed(2)}px ${tr.toFixed(2)}px`,
            `${w.toFixed(2)}px ${h.toFixed(2)}px`,
            `0px ${h.toFixed(2)}px`,
            `0px ${tl.toFixed(2)}px`
        ].join(', ');
        const clip = `polygon(${polygon})`;
        doc.style.clipPath = clip;
        doc.style.webkitClipPath = clip;
        doc.style.setProperty('--archive-doc-shape-clip', clip);
        doc.style.setProperty('--archive-cut-tl', `${tl.toFixed(2)}px`);
        doc.style.setProperty('--archive-cut-tr', `${tr.toFixed(2)}px`);
        doc.dataset.archiveCutTl = tl.toFixed(2);
        doc.dataset.archiveCutTr = tr.toFixed(2);
    }

    function ensureArchiveDocCornerCuts(doc, label, severity = 'light', dims = null) {
        if (!doc) return { tl: 0, tr: 0 };
        const rect = dims || doc.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w < 10 || h < 10) return { tl: 0, tr: 0 };

        let tl = parseFloat(doc.dataset.archiveCutTl || '');
        let tr = parseFloat(doc.dataset.archiveCutTr || '');
        if (!Number.isFinite(tl) || !Number.isFinite(tr)) {
            const rng = rngFor(`${label}-cornercuts-v180`);
            const cuts = computeArchiveDocCornerCuts(w, h, rng, severity);
            tl = cuts.tl;
            tr = cuts.tr;
        }
        const cuts = { tl, tr };
        setArchiveDocClipPath(doc, w, h, cuts);
        return cuts;
    }

    function renderArchiveBaseCutOutline(doc, label, severity = 'light') {
        if (!doc) return;
        doc.querySelectorAll(':scope > .ruin-fracture-archive-base').forEach(node => node.remove());

        const rect = doc.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w < 10 || h < 10) return;

        const cuts = ensureArchiveDocCornerCuts(doc, label, severity, rect);
        const cutTL = cuts.tl || 0;
        const cutTR = cuts.tr || 0;

        const svg = makeSvg('ruin-fracture-archive-base');
        setViewBox(svg, w, h);

        const tlTop = { x: Math.max(0.5, cutTL), y: 0.5 };
        const tlLeft = { x: 0.5, y: Math.max(0.5, cutTL) };
        const trTop = { x: Math.min(w - 0.5, w - 0.5 - cutTR), y: 0.5 };
        const trRight = { x: w - 0.5, y: Math.max(0.5, cutTR) };
        const br = { x: w - 0.5, y: h - 0.5 };
        const bl = { x: 0.5, y: h - 0.5 };

        addPolyline(
            svg,
            [tlLeft, tlTop, trTop, trRight, br, bl, tlLeft],
            'ruin-fracture-border ruin-fracture-archive-base-line',
            0.86
        );

        doc.appendChild(svg);
        doc.classList.add('archive-cut-doc');
    }

    function applyArchiveCornerCuts() {
        const recordDocs = [...document.querySelectorAll('#stack-record .archive-doc')];
        const gardenDocs = [...document.querySelectorAll('#stack-garden .archive-doc')];

        recordDocs.forEach((doc, index) => {
            renderArchiveBaseCutOutline(doc, `record-doc-${index}-v181`, 'light');
        });
        gardenDocs.forEach((doc, index) => {
            renderArchiveBaseCutOutline(doc, `garden-doc-${index}-v181`, 'light');
        });
    }

    function getArchiveDocEdgePoints(w, h, cuts = {}) {
        const cutTL = cuts.tl || 0;
        const cutTR = cuts.tr || 0;
        const tl = { x: 0.5, y: 0.5 };
        const tr = { x: w - 0.5, y: 0.5 };
        const br = { x: w - 0.5, y: h - 0.5 };
        const bl = { x: 0.5, y: h - 0.5 };
        const tlTop = cutTL > 0.5 ? { x: cutTL, y: 0.5 } : tl;
        const tlLeft = cutTL > 0.5 ? { x: 0.5, y: cutTL } : tl;
        const trTop = cutTR > 0.5 ? { x: w - 0.5 - cutTR, y: 0.5 } : tr;
        const trRight = cutTR > 0.5 ? { x: w - 0.5, y: cutTR } : tr;
        return { tl, tr, br, bl, tlTop, tlLeft, trTop, trRight, cutTL, cutTR };
    }

    function applyArchiveDamageClip(doc, w, h, cuts, side, chip) {
        if (!doc || !chip?.edgePoints?.length) return;

        const pts = getArchiveDocEdgePoints(w, h, cuts);
        const { br, bl, tlTop, tlLeft, trTop, trRight } = pts;
        let polygon = null;

        if (side === 'top') {
            // chip edge already runs tlTop -> trTop
            polygon = [
                ...chip.edgePoints,
                trRight,
                br,
                bl,
                tlLeft
            ];
        } else if (side === 'right') {
            // chip edge runs trRight -> br
            polygon = [
                tlTop,
                trTop,
                ...chip.edgePoints,
                bl,
                tlLeft
            ];
        } else if (side === 'left') {
            // chip edge runs bl -> tlLeft
            polygon = [
                tlTop,
                trTop,
                trRight,
                br,
                ...chip.edgePoints
            ];
        }

        if (!polygon?.length) return;

        const cssPolygon = polygon
            .map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`)
            .join(', ');

        const clip = `polygon(${cssPolygon})`;
        doc.style.clipPath = clip;
        doc.style.webkitClipPath = clip;
        // Critical: the visible archive paper is ::before, not the element's
        // transparent background. Give it the SAME contour explicitly instead
        // of relying on ancestor clipping/compositor ordering.
        doc.style.setProperty('--archive-doc-shape-clip', clip);
        doc.dataset.archiveDamageClip = side;
    }

    function renderArchiveDamageProfile(doc, label, profile = {}) {
        if (!doc) return;

        clearTargetOverlays(doc);
        doc.querySelectorAll(':scope > .ruin-fracture-archive-base').forEach(node => node.remove());
        const rect = doc.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w < 10 || h < 10) return;

        const severity = profile.severity || 'light';
        const cuts = ensureArchiveDocCornerCuts(doc, label, severity, rect);
        const pts = getArchiveDocEdgePoints(w, h, cuts);
        const { br, bl, tlTop, tlLeft, trTop, trRight, cutTL, cutTR } = pts;

        const svg = makeSvg('ruin-fracture-archive-doc');
        setViewBox(svg, w, h);
        const rng = rngFor(label);
        const side = profile.side || ['top', 'right', 'left'][Math.floor(rng() * 3)];
        const opacity = profile.opacity ?? 0.86;
        const addReturnLine = profile.addReturnLine === true;

        function clean(a, b, alpha = opacity) {
            addPolyline(svg, [a, b], 'ruin-fracture-border', alpha);
        }

        if (cutTL > 0.5) clean(tlLeft, tlTop);
        if (cutTR > 0.5) clean(trTop, trRight);

        let chip = null;
        if (side === 'top') {
            const depth = profile.depth ?? (severity === 'medium' ? 5.6 + rng() * 2.8 : 2.8 + rng() * 2.4);
            const width = (profile.width ?? (severity === 'medium' ? 18 + rng() * 14 : 8 + rng() * 8)) * 0.60;
            chip = addNaturalChipSegment(svg, tlTop, trTop, rng, {
                width,
                depth,
                t: profile.t ?? (0.22 + rng() * 0.56),
                normalSign: 1,
                opacity,
                addReturnLine,
                returnInset: profile.returnInset ?? Math.max(0.65, depth * 0.16),
                returnOpacity: profile.returnOpacity ?? 0.54
            });
            clean(trRight, br); clean(br, bl); clean(bl, tlLeft);
        } else if (side === 'right') {
            const depth = profile.depth ?? (severity === 'medium' ? 5.0 + rng() * 2.4 : 2.3 + rng() * 1.8);
            const width = profile.width ?? (severity === 'medium' ? 18 + rng() * 10 : 10 + rng() * 10);
            chip = addNaturalChipSegment(svg, trRight, br, rng, {
                width,
                depth,
                t: profile.t ?? (0.22 + rng() * 0.58),
                normalSign: 1,
                opacity,
                addReturnLine,
                returnInset: profile.returnInset ?? Math.max(0.65, depth * 0.16),
                returnOpacity: profile.returnOpacity ?? 0.54
            });
            clean(br, bl); clean(bl, tlLeft); clean(tlLeft, tlTop); clean(tlTop, trTop);
        } else {
            const depth = profile.depth ?? (severity === 'medium' ? 5.0 + rng() * 2.4 : 2.3 + rng() * 1.8);
            const width = profile.width ?? (severity === 'medium' ? 18 + rng() * 10 : 10 + rng() * 10);
            chip = addNaturalChipSegment(svg, bl, tlLeft, rng, {
                width,
                depth,
                t: 1 - (profile.t ?? (0.22 + rng() * 0.58)),
                normalSign: 1,
                opacity,
                addReturnLine,
                returnInset: profile.returnInset ?? Math.max(0.65, depth * 0.16),
                returnOpacity: profile.returnOpacity ?? 0.54
            });
            clean(tlTop, trTop); clean(trTop, trRight); clean(trRight, br); clean(br, bl);
        }

        // opt29 · The chipped contour is now the REAL sheet boundary, not just
        // a line drawn over the old rectangle. This clips the paper/background
        // itself, so the original archive-doc face cannot show through the pit.
        if (chip?.edgePoints?.length) {
            applyArchiveDamageClip(doc, w, h, cuts, side, chip);
        }

        doc.appendChild(svg);
        doc.classList.add('fracture-doc');
        doc.dataset.fractureSeverity = severity;
        return chip;
    }

    function renderArchiveDoc(doc, label, severity = 'light') {
        return renderArchiveDamageProfile(doc, label, { severity });
    }


    function clearArchiveDamage() {
        document.querySelectorAll('.archive-doc').forEach(doc => {
            doc.classList.remove('fracture-doc', 'archive-misaligned');
            doc.removeAttribute('data-fracture-severity');
            doc.removeAttribute('data-archive-damage-clip');
            doc.style.removeProperty('--archive-misalign-x');
            doc.style.removeProperty('--archive-misalign-y');
            doc.style.removeProperty('--archive-misalign-rot');
            clearTargetOverlays(doc);
            doc.querySelectorAll(':scope > .ruin-fracture-archive-base').forEach(node => node.remove());
        });
    }

    function applyArchiveDamage() {
        clearArchiveDamage();
        applyArchiveCornerCuts();

        const recordDocs = [...document.querySelectorAll('#stack-record .archive-doc')];
        const gardenDocs = [...document.querySelectorAll('#stack-garden .archive-doc')];

        const recordRng = rngFor('archive-record-selection-v185');
        const gardenRng = rngFor('archive-garden-selection-v185');
        const recordShiftRng = rngFor('archive-record-misalignment-v185');
        const gardenShiftRng = rngFor('archive-garden-misalignment-v185');

        // v185 · archive-doc wear system
        // 1) at least one refresh-stable three-sheet damage cluster
        // 2) additional shallow / wide side chips on random sheets
        // 3) keep earlier occasional misregistration alive
        function applyMisalignment(doc, rng, probability) {
            if (!doc || rng() >= probability) return;
            const x = (rng() - 0.5) * 7.0;
            const y = (rng() - 0.5) * 5.0;
            const rot = 0;
            doc.classList.add('archive-misaligned');
            doc.style.setProperty('--archive-misalign-x', `${x.toFixed(2)}px`);
            doc.style.setProperty('--archive-misalign-y', `${y.toFixed(2)}px`);
            doc.style.setProperty('--archive-misalign-rot', `${rot.toFixed(3)}deg`);
        }

        function randomize(arr, rng) {
            const copy = arr.slice();
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        }

        function pickTripletIndices(count, rng) {
            if (count <= 0) return [];
            if (count === 1) return [0];
            if (count === 2) return [0, 1];
            const center = 1 + Math.floor(rng() * (count - 2));
            return [center - 1, center, center + 1];
        }

        function applyTripletCluster(docs, keyPrefix, rng) {
            if (!docs.length) return new Set();
            const chosen = new Set();
            const indices = pickTripletIndices(docs.length, rng);
            const sideRoll = rng();
            // v238 · make the LEFT archive stack feel a little less intact.
            // Keep the damage controlled, but let RIGHT-edge wear show up more often.
            // Record stack: top 20% / left 12% / right 68%.
            // Garden stack keeps the earlier balance unchanged.
            const isRecordStack = keyPrefix === 'record-doc';
            const side = isRecordStack
                ? (sideRoll < 0.20 ? 'top' : (sideRoll < 0.32 ? 'left' : 'right'))
                : (sideRoll < 0.36 ? 'top' : (sideRoll < 0.68 ? 'left' : 'right'));
            const sharedT = isRecordStack ? (0.18 + rng() * 0.30) : (0.24 + rng() * 0.52);
            const baseWidth = side === 'top' ? 20 + rng() * 14 : 18 + rng() * 16;
            const baseDepth = side === 'top' ? 4.8 + rng() * 2.6 : 3.6 + rng() * 2.2;
            const scales = indices.length === 3 ? [0.66, 1.0, 0.72] : indices.length === 2 ? [1.0, 0.72] : [1.0];

            indices.forEach((index, i) => {
                const doc = docs[index];
                if (!doc) return;
                const scale = scales[i] ?? 0.72;
                renderArchiveDamageProfile(doc, `${keyPrefix}-${index}-cluster-v185`, {
                    severity: scale > 0.9 ? 'medium' : 'light',
                    side,
                    // v239 · on the LEFT archive stack, most sheets only expose their upper half,
                    // so keep cluster damage concentrated in the upper-middle band.
                    t: isRecordStack
                        ? Math.max(0.14, Math.min(0.58, sharedT + (rng() - 0.5) * 0.045))
                        : Math.max(0.18, Math.min(0.82, sharedT + (rng() - 0.5) * 0.035)),
                    width: baseWidth * (0.88 + scale * 0.42),
                    depth: baseDepth * (0.74 + scale * 0.38),
                    opacity: 0.86,
                    addReturnLine: false,
                    returnInset: Math.max(0.6, baseDepth * 0.14 * scale),
                    returnOpacity: 0.48
                });
                chosen.add(index);
            });
            return chosen;
        }

        function applyRandomSideChips(docs, keyPrefix, rng, alreadyDamaged, probability, options = {}) {
            const rightBias = Math.max(0, Math.min(1, options.rightBias ?? 0.5));
            const maxCount = Number.isFinite(options.maxCount) ? Math.max(0, options.maxCount) : Infinity;
            let added = 0;
            docs.forEach((doc, index) => {
                if (added >= maxCount || !doc || alreadyDamaged.has(index) || rng() >= probability) return;
                const side = rng() < rightBias ? 'right' : 'left';
                renderArchiveDamageProfile(doc, `${keyPrefix}-${index}-sidechip-v185`, {
                    severity: 'light',
                    side,
                    // v239 · favor the upper-middle zone so shallow side wear remains visible
                    // in the stacked view, where lower portions are often hidden.
                    t: keyPrefix === 'record-doc' ? (0.16 + rng() * 0.34) : (0.20 + rng() * 0.60),
                    width: 14 + rng() * 20,
                    depth: 1.8 + rng() * 1.9,
                    opacity: 0.82,
                    addReturnLine: false,
                    returnInset: 0.65 + rng() * 0.35,
                    returnOpacity: 0.44
                });
                alreadyDamaged.add(index);
                added += 1;
            });
        }

        function ensureVisibleRecordSideChip(docs, keyPrefix, rng, alreadyDamaged) {
            if (!docs.length) return;
            // v240 · guarantee that the LEFT archive stack does not open in a perfectly intact state.
            // Prefer a sheet from the exposed upper-to-middle band, so one pit is visible on the first refresh.
            const preferred = [];
            const fallback = [];
            docs.forEach((doc, index) => {
                if (!doc || alreadyDamaged.has(index)) return;
                if (index >= 2 && index <= 14) preferred.push({ doc, index });
                fallback.push({ doc, index });
            });
            const pool = preferred.length ? preferred : fallback;
            if (!pool.length) return;
            const target = pool[Math.floor(rng() * pool.length)];
            renderArchiveDamageProfile(target.doc, `${keyPrefix}-${target.index}-ensured-sidechip-v240`, {
                severity: 'light',
                side: 'right',
                t: 0.18 + rng() * 0.28,
                width: 17 + rng() * 24,
                depth: 2.0 + rng() * 2.1,
                opacity: 0.84,
                addReturnLine: false,
                returnInset: 0.72 + rng() * 0.30,
                returnOpacity: 0.46
            });
            alreadyDamaged.add(target.index);
        }

        recordDocs.forEach(doc => applyMisalignment(doc, recordShiftRng, 0.10));
        gardenDocs.forEach(doc => applyMisalignment(doc, gardenShiftRng, 0.12));

        const damagedRecords = applyTripletCluster(recordDocs, 'record-doc', recordRng);
        // v240 · always show at least one visible right-edge pit on the record stack,
        // then keep later refreshes strongly biased toward showing several more.
        ensureVisibleRecordSideChip(recordDocs, 'record-doc', recordRng, damagedRecords);
        applyRandomSideChips(recordDocs, 'record-doc', recordRng, damagedRecords, 0.72, {
            rightBias: 0.95,
            maxCount: 7
        });

        // keep a small chance of one extra ordinary worn sheet so the stack does
        // not look too systematically authored.
        const recordCandidates = randomize(
            recordDocs.map((doc, index) => ({ doc, index })).filter(({ index }) => !damagedRecords.has(index)),
            recordRng
        );
        if (recordCandidates.length && recordRng() < 0.18) {
            const target = recordCandidates[0];
            renderArchiveDamageProfile(target.doc, `record-doc-${target.index}-extra-v185`, {
                severity: recordRng() < 0.30 ? 'medium' : 'light',
                // v238 · the optional single extra sheet also favors the right edge
                // a bit more, so refreshes are less likely to look perfectly clean.
                side: (() => {
                    const sideRoll = recordRng();
                    return sideRoll < 0.20 ? 'top' : (sideRoll < 0.30 ? 'left' : 'right');
                })(),
                // v239 · the extra worn sheet also keeps its damage in the upper-middle band.
                t: 0.16 + recordRng() * 0.34,
                addReturnLine: false,
                returnOpacity: 0.46
            });
            damagedRecords.add(target.index);
        }

        if (gardenDocs.length) {
            const damagedGarden = applyTripletCluster(gardenDocs, 'garden-doc', gardenRng);
            applyRandomSideChips(gardenDocs, 'garden-doc', gardenRng, damagedGarden, 0.16);
        }
    }

    function renderOpenedBottomDecorWear() {
        const decor = document.getElementById('drawer-opened-bottom-decor');
        if (!decor) return;

        // v209 · bottom decor is intentionally asymmetric. The two stone plates
        // share only the overall construction; wear, pits, diagonal breaks and
        // lower-edge collapse are decided independently (with a few global caps)
        // so the result never reads as a mirrored ornament.
        const rng = rngFor('drawer-opened-bottom-decor-wear-v209');
        const leftSvg = decor.querySelector('.drawer-perspective-line.bottom-left');
        const rightSvg = decor.querySelector('.drawer-perspective-line.bottom-right');
        const h = 55;

        function lerp(a, b, t) {
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
        function toPath(pts) {
            return pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        }
        function toCssPolygon(pts, tail) {
            return `polygon(${[...pts, ...tail].map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(', ')})`;
        }

        function addPath(svg, pts, className) {
            if (!svg || !pts || pts.length < 2) return;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', toPath(pts));
            path.setAttribute('class', className);
            svg.appendChild(path);
        }

        function organicCrack(root, localRng, opts = {}) {
            const length = opts.length ?? (7 + localRng() * 7);
            const angle = opts.angle ?? (Math.PI * (0.36 + localRng() * 0.28));
            const segments = opts.segments ?? 4;
            const pts = [root];
            let x = root.x;
            let y = root.y;
            for (let i = 1; i <= segments; i++) {
                const step = length / segments;
                const wobble = (localRng() - 0.5) * 0.34;
                x += Math.cos(angle + wobble) * step;
                y += Math.abs(Math.sin(angle + wobble)) * step;
                pts.push({ x, y });
            }
            return pts;
        }

        // Mostly-straight top edge. A pit is optional and deliberately shallow,
        // preserving the visual weight of the top rim that became too thin in v207.
        function makeTopEdge(x0, x1, localRng, damage = false) {
            if (!damage) return { points: [{x:x0,y:0}, {x:x1,y:0}], root: null };

            const span = x1 - x0;
            const center = x0 + span * (0.26 + localRng() * 0.48);
            const half = clamp(span * (0.035 + localRng() * 0.028), 5.5, 11.5);
            const depth = 1.15 + localRng() * 1.65;
            const root = { x: center + (localRng() - 0.5) * half * 0.28, y: depth };
            return {
                root,
                points: [
                    {x:x0,y:0},
                    {x:center-half*1.25,y:0},
                    {x:center-half*0.72,y:depth*0.24},
                    {x:center-half*0.22,y:depth*0.68},
                    root,
                    {x:center+half*0.38,y:depth*0.48},
                    {x:center+half*0.84,y:depth*0.16},
                    {x:center+half*1.22,y:0},
                    {x:x1,y:0}
                ]
            };
        }

        // Natural shallow bite in an oblique edge. Points are displaced toward
        // the plate interior rather than mirrored around the segment.
        function makeDiagonal(a, b, localRng, opts = {}) {
            const dx = b.x - a.x, dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            const nx = -uy, ny = ux; // inward normal for both traversal directions used here
            const pts = [a];
            const chip = !!opts.chip;
            const earlyBreak = !!opts.earlyBreak;
            const chipT = 0.30 + localRng() * 0.43;
            const chipHalf = 0.026 + localRng() * 0.022;
            const chipDepth = 1.8 + localRng() * 2.8;
            let chipRoot = null;

            // Base irregularity is intentionally tiny: worn stone, not a sawtooth.
            const count = 6;
            for (let i = 1; i < count; i++) {
                const t = i / count;
                if (earlyBreak) {
                    // On the left traversal, near-bottom is high t; on the right
                    // traversal it is low t. Stop before the collapsed tip zone.
                    if (opts.nearBottomAtEnd && t > 0.80) break;
                    if (!opts.nearBottomAtEnd && t < 0.20) continue;
                }
                const base = lerp(a, b, t);
                let off = (localRng() - 0.5) * 0.95 * Math.sin(Math.PI * t);
                if (chip) {
                    const d = Math.abs(t - chipT);
                    if (d < chipHalf * 1.7) {
                        const weight = Math.max(0, 1 - d / (chipHalf * 1.7));
                        off += chipDepth * Math.pow(weight, 1.25);
                        if (!chipRoot || weight > chipRoot.weight) {
                            chipRoot = { x: base.x + nx * off, y: base.y + ny * off, weight };
                        }
                    }
                }
                pts.push({ x: base.x + nx * off, y: base.y + ny * off });
            }

            if (earlyBreak) {
                if (opts.nearBottomAtEnd) {
                    const t = 0.79 + localRng() * 0.09;
                    const q = lerp(a, b, t);
                    pts.push({ x: q.x + nx * (0.5 + localRng() * 1.0), y: q.y + ny * (0.5 + localRng() * 1.0) });
                    // The diagonal gives up before the centre-bottom tip and falls
                    // almost vertically, leaving the final wedge tip missing.
                    pts.push({ x: q.x + (localRng() - 0.5) * 3.0, y: h });
                    pts.push({ x: b.x, y: h });
                } else {
                    // Right plate traverses from the bottom tip upward. Begin on
                    // the baseline a little inward, then climb into the diagonal.
                    const t = 0.11 + localRng() * 0.08;
                    const q = lerp(a, b, t);
                    const rebuilt = [
                        { x: a.x + (10 + localRng() * 18), y: h },
                        { x: q.x + (localRng() - 0.5) * 2.2, y: h - (1.2 + localRng() * 2.0) },
                        q
                    ];
                    // retain only later points from current list
                    const rest = pts.filter(p => p.y < q.y - 0.5 || p.x > q.x + 0.5);
                    pts.length = 0;
                    pts.push(...rebuilt, ...rest, b);
                }
            } else {
                pts.push(b);
            }
            return { points: pts, root: chipRoot ? {x:chipRoot.x,y:chipRoot.y} : null };
        }

        function renderPlate(svg, width, boundary, cracks = []) {
            if (!svg) return;
            svg.setAttribute('viewBox', `0 0 ${width} ${h}`);
            svg.innerHTML = '';
            addPath(svg, boundary, 'drawer-wear-line drawer-wear-main');
            cracks.forEach(cr => addPath(svg, cr, 'drawer-wear-line drawer-wear-crack'));
        }

        // Global asymmetry decisions. Top damage is usually on zero or one side;
        // only rarely do both sides get a pit, and even then their dimensions differ.
        const topRoll = rng();
        const leftTopDamage = topRoll > 0.34 && topRoll < 0.68;
        const rightTopDamage = topRoll >= 0.68 && topRoll < 0.93;
        const bothTopDamage = topRoll >= 0.93;
        const leftTopOn = leftTopDamage || bothTopDamage;
        const rightTopOn = rightTopDamage || bothTopDamage;

        const leftDiagChip = rng() < 0.44;
        const rightDiagChip = rng() < 0.36;

        // At most one plate loses its low tip on a given page load.
        const lowBreakRoll = rng();
        const leftEarlyBreak = lowBreakRoll > 0.66 && lowBreakRoll <= 0.84;
        const rightEarlyBreak = lowBreakRoll > 0.84;

        // LEFT PLATE
        const leftTopRng = rngFor('bottom-decor-left-top-v209');
        const leftDiagRng = rngFor('bottom-decor-left-diag-v209');
        const leftTop = makeTopEdge(0, 160, leftTopRng, leftTopOn);
        const leftDiag = makeDiagonal({x:160,y:0},{x:390,y:55},leftDiagRng, {
            chip: leftDiagChip,
            earlyBreak: leftEarlyBreak,
            nearBottomAtEnd: true
        });
        const leftBoundary = [...leftTop.points.slice(0,-1), ...leftDiag.points];
        const leftCracks = [];
        if (leftTop.root && leftTopRng() < 0.70) {
            leftCracks.push(organicCrack(leftTop.root, leftTopRng, {
                length: 7 + leftTopRng() * 7,
                angle: Math.PI * (0.34 + leftTopRng() * 0.18),
                segments: 4
            }));
        }
        if (leftDiag.root && leftDiagRng() < 0.46) {
            leftCracks.push(organicCrack(leftDiag.root, leftDiagRng, {
                length: 5 + leftDiagRng() * 7,
                angle: Math.PI * (0.44 + leftDiagRng() * 0.18),
                segments: 3
            }));
        }
        decor.style.setProperty('--bottom-decor-left-clip', toCssPolygon(leftBoundary,[{x:0,y:55}]));
        renderPlate(leftSvg, 390, leftBoundary, leftCracks);

        // RIGHT PLATE — independent seeds and different probabilities; it is not
        // a transformed copy of the left plate.
        const rightTopRng = rngFor('bottom-decor-right-top-v209');
        const rightDiagRng = rngFor('bottom-decor-right-diag-v209');
        const rightDiag = makeDiagonal({x:0,y:55},{x:158,y:0},rightDiagRng, {
            chip: rightDiagChip,
            earlyBreak: rightEarlyBreak,
            nearBottomAtEnd: false
        });
        const rightTop = makeTopEdge(158, 306, rightTopRng, rightTopOn);
        const rightBoundary = [...rightDiag.points, ...rightTop.points.slice(1)];
        const rightCracks = [];
        if (rightTop.root && rightTopRng() < 0.62) {
            rightCracks.push(organicCrack(rightTop.root, rightTopRng, {
                length: 6 + rightTopRng() * 8,
                angle: Math.PI * (0.58 + rightTopRng() * 0.16),
                segments: 4
            }));
        }
        if (rightDiag.root && rightDiagRng() < 0.38) {
            rightCracks.push(organicCrack(rightDiag.root, rightDiagRng, {
                length: 5 + rightDiagRng() * 6,
                angle: Math.PI * (0.60 + rightDiagRng() * 0.15),
                segments: 3
            }));
        }
        decor.style.setProperty('--bottom-decor-right-clip', toCssPolygon(rightBoundary,[{x:306,y:55}]));
        renderPlate(rightSvg, 306, rightBoundary, rightCracks);
    }

    let openedBottomDecorWearReady = false;
    function ensureOpenedBottomDecorWear() {
        if (openedBottomDecorWearReady) return;
        renderOpenedBottomDecorWear();
        openedBottomDecorWearReady = true;
    }

    function renderAllStatic() {
        renderTopPerspectiveLines();
        renderMainFrame();
        renderCompass();
        renderIndexDrawer();
        // v291-opt05: bottom-decor wear is invisible until the index drawer opens.
        // Build it in an idle slice instead of tying it to every static render.
        // opt03 · allow tiny consumers (currently only the tone selector mask)
        // to update once after the authored fracture geometry has settled.
        window.dispatchEvent(new CustomEvent('ruin-fracture-static-ready'));
    }

    function boot() {
        renderAllStatic();

        // opt42 · The opened lower decoration is completely invisible while the
        // index drawer is closed. Keep its random path/clip construction cold
        // until toggleIndexDrawerWithAnim() actually needs it.
        window.StartupIdleQueue?.cancel?.('index-bottom-decor-wear');

        const frame = document.getElementById('main-viewport-frame');
        const compass = document.querySelector('.compass-pentagon-outer');
        const drawer = document.getElementById('index-drawer');

        installIndexDrawerAdaptiveContentObserver();
        markIndexDrawerAdaptiveDirty(0);

        if ('ResizeObserver' in window) {
            let timer = 0;
            const ro = new ResizeObserver(() => {
                window.clearTimeout(timer);
                timer = window.setTimeout(() => {
                    // Viewport/frame geometry changed: one recalculation is valid.
                    // #index-drawer itself is deliberately NOT observed; its own
                    // adaptive height must never re-enter this callback.
                    indexDrawerAdaptiveDirty = true;
                    syncIndexDrawerAdaptiveHeight();
                    renderAllStatic();
                }, 100);
            });
            if (frame) ro.observe(frame);
            if (compass) ro.observe(compass);
        } else {
            let resizeTimer = 0;
            window.addEventListener('resize', () => {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(() => {
                    indexDrawerAdaptiveDirty = true;
                    syncIndexDrawerAdaptiveHeight();
                    renderAllStatic();
                }, 120);
            });
        }

        if (drawer && 'MutationObserver' in window) {
            const mo = new MutationObserver(() => {
                window.setTimeout(renderIndexDrawer, 120);
                // v235: opening/closing changes transform/z choreography only;
                // content height is unchanged, so do not force layout reads here.
                syncIndexDrawerCrackOverpassThroughTransition();
            });
            mo.observe(drawer, { attributes: true, attributeFilter: ['class', 'style'] });
        }

        window.addEventListener('ruinreaderchange', syncIndexDrawerToneLinework);
        syncIndexDrawerToneLinework();

        const compassModule = document.getElementById('global-compass-module');
        if (compassModule && 'MutationObserver' in window) {
            const mo = new MutationObserver(() => {
                window.setTimeout(renderCompass, 420);
            });
            mo.observe(compassModule, { attributes: true, attributeFilter: ['class'] });
        }

        // opt19 · During the 0.4 s wheel expansion/collapse, the old SVG used to
        // be resized with preserveAspectRatio="none", visibly pulling the crack
        // sideways. Rebuild only this tiny compass outline at ~30 fps instead.
        // The seeded fracture itself stays identical; only straight spans gain/
        // lose length as the shell width changes.
        if (compass && 'ResizeObserver' in window) {
            let compassResizeTimer = 0;
            let compassLastPaint = 0;
            let compassLastWidth = compass.getBoundingClientRect().width;

            const paintCompassResize = () => {
                compassResizeTimer = 0;
                const now = performance.now();
                const rect = compass.getBoundingClientRect();
                if (Math.abs(rect.width - compassLastWidth) < 0.75) return;

                const elapsed = now - compassLastPaint;
                if (elapsed < 32) {
                    compassResizeTimer = window.setTimeout(
                        paintCompassResize,
                        Math.max(1, 32 - elapsed)
                    );
                    return;
                }

                compassLastWidth = rect.width;
                compassLastPaint = now;
                renderCompass();
            };

            const compassShapeObserver = new ResizeObserver(() => {
                if (compassResizeTimer) return;
                compassResizeTimer = window.setTimeout(paintCompassResize, 0);
            });
            compassShapeObserver.observe(compass);
        }
    }

    // opt16 · Both drawer shells already exist before script.js executes.
    // Start authored index-drawer SVG fetch/layout immediately rather than waiting
    // for DOMContentLoaded (which also waits behind the map's startup work).
    if (document.getElementById('index-drawer')) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });

    return {
        seed: sessionSeed,
        renderTopPerspectiveLines,
        renderMainFrame,
        renderCompass,
        renderIndexDrawer,
        syncIndexDrawerAdaptiveHeight,
        syncIndexDrawerAdaptiveHeightThroughTransition,
        applyArchiveDamage,
        ensureOpenedBottomDecorWear
    };
})();


// ============================================================================
// v291-opt03 · TitleFractureMaskController
// ----------------------------------------------------------------------------
// The five-step reading-tone selector sits inside the same fractured title
// field as the atlas heading. If a generated crack crosses the selector, carve
// only that tiny overlap out of the controls, matching the inscription logic.
// This is intentionally lightweight: one target, one mask build after static
// fracture rendering, and no continuous observer/animation work.
// ============================================================================
const TitleFractureMaskController = (() => {
    const TARGET_ID = 'main-reader-tone-control';
    const CUT_SELECTOR = '.ruin-fracture-crack, .ruin-fracture-damaged';
    let raf = 0;

    function clear(target) {
        if (!target) return;
        target.style.removeProperty('mask-image');
        target.style.removeProperty('-webkit-mask-image');
        target.style.removeProperty('mask-size');
        target.style.removeProperty('-webkit-mask-size');
        target.style.removeProperty('mask-repeat');
        target.style.removeProperty('-webkit-mask-repeat');
    }

    function intersects(a, b, pad = 4) {
        return !(
            a.right < b.left - pad ||
            a.left > b.right + pad ||
            a.bottom < b.top - pad ||
            a.top > b.bottom + pad
        );
    }

    function escapedAttr(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function collectPaths(targetRect) {
        const sources = [
            ...document.querySelectorAll('#ruin-fracture-global-layer > svg.ruin-fracture-overlay'),
            ...document.querySelectorAll('#main-viewport-frame > svg.ruin-fracture-overlay')
        ];
        const parts = [];

        sources.forEach(svg => {
            const svgRect = svg.getBoundingClientRect();
            if (svgRect.width < 1 || svgRect.height < 1 || !intersects(svgRect, targetRect, 8)) return;

            const vb = svg.viewBox?.baseVal;
            const vbW = vb?.width || svgRect.width;
            const vbH = vb?.height || svgRect.height;
            const vbX = vb?.x || 0;
            const vbY = vb?.y || 0;
            const sx = svgRect.width / Math.max(1, vbW);
            const sy = svgRect.height / Math.max(1, vbH);
            const tx = svgRect.left - targetRect.left - vbX * sx;
            const ty = svgRect.top - targetRect.top - vbY * sy;

            const pathParts = [];
            svg.querySelectorAll(CUT_SELECTOR).forEach(path => {
                const d = path.getAttribute('d');
                if (!d) return;
                const pr = path.getBoundingClientRect();
                if (pr.width < .1 && pr.height < .1) return;
                if (!intersects(pr, targetRect, 5)) return;

                const cs = getComputedStyle(path);
                const sourceWidth = parseFloat(cs.strokeWidth) || 1;
                // A small extra guard makes the control genuinely disappear at
                // the fracture rather than leaving a one-pixel antialiased halo.
                const cutWidth = Math.max(2.15, sourceWidth + 1.25);
                pathParts.push(
                    `<path d="${escapedAttr(d)}" fill="none" stroke="black" ` +
                    `stroke-width="${cutWidth.toFixed(2)}" stroke-linecap="round" ` +
                    `stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`
                );
            });

            if (!pathParts.length) return;
            parts.push(
                `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${sx.toFixed(6)} ${sy.toFixed(6)})">` +
                pathParts.join('') +
                `</g>`
            );
        });

        return parts.join('');
    }

    function render() {
        const target = document.getElementById(TARGET_ID);
        if (!target) return;
        if (isCompactViewport()) {
            clear(target);
            return;
        }

        const rect = target.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) {
            clear(target);
            return;
        }

        const cracks = collectPaths(rect);
        if (!cracks) {
            clear(target);
            return;
        }

        const w = rect.width;
        const h = rect.height;
        const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" preserveAspectRatio="none">` +
                `<defs><mask id="m">` +
                    `<rect width="100%" height="100%" fill="white"/>` +
                    cracks +
                `</mask></defs>` +
                `<rect width="100%" height="100%" fill="white" mask="url(#m)"/>` +
            `</svg>`;
        const url = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;

        target.style.setProperty('-webkit-mask-image', url);
        target.style.setProperty('mask-image', url);
        target.style.setProperty('-webkit-mask-size', '100% 100%');
        target.style.setProperty('mask-size', '100% 100%');
        target.style.setProperty('-webkit-mask-repeat', 'no-repeat');
        target.style.setProperty('mask-repeat', 'no-repeat');
    }

    function schedule() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => requestAnimationFrame(render));
    }

    function install() {
        window.addEventListener('ruin-fracture-static-ready', schedule);
        schedule();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', install, { once: true });
    } else {
        install();
    }

    return { render, schedule };
})();


function buildFileStacks() {
    const stackGarden = document.getElementById('stack-garden');
    const stackRecord = document.getElementById('stack-record');
    if (!stackGarden || !stackRecord) return;

    // opt12 · The record fan is authored with transform transitions, but its
    // first --stack-x/--stack-y assignment is initialization, not animation.
    // Keep the stack unpainted and transitions disabled until that first layout
    // has been committed. Otherwise browsers can interpolate every sheet from
    // translate3d(0,0,0) to the fan and briefly expose full card bodies.
    const bootstrapToken = String((Number(stackRecord.dataset.stackBootstrapToken) || 0) + 1);
    stackRecord.dataset.stackBootstrapToken = bootstrapToken;
    stackRecord.classList.add('record-stack-bootstrapping');

    stackGarden.innerHTML = '';
    stackRecord.innerHTML = '';

    const gardenSites = sites.filter(site => site.type === 'garden');
    const recordSiteList = sites.filter(site => site.type !== 'garden');
    const recordEntries = buildRecordStackEntries(recordSiteList);

    function renderStack(entries, container, isGarden) {
        const total = entries.length;
        const cnNums = ['一','二','三','四','五','六','七','八','九','十'];

        entries.forEach((entry, index) => {
            const entrySites = isGarden ? [entry] : entry.sites;
            const initialSite = entrySites[0];
            const isCombinedRecord = !isGarden && entrySites.length > 1;
            const docEl = document.createElement('div');
            docEl.className = `archive-doc${isGarden ? ' garden-archive-doc' : ''}${isCombinedRecord ? ' combined-record-doc' : ''}`;
            if (isCombinedRecord) docEl.dataset.archiveGroup = entry.group.id;

            // opt56 · Desktop paper-stack vertical misregistration.
            // Give each physical sheet a small, deterministic Y offset so the
            // archive reads like a hand-stacked bundle instead of a perfectly
            // machined fan. The value stays attached to the sheet while the
            // sliding record window moves; compact/mobile layouts ignore it in CSS.
            const paperYJitterPattern = [0, 4, -2, 6, -3, 2, -5, 3, -1, 5, -4, 1, 3, -2, 4, -1, 2, -3, 5, -2, 1, -4, 3];
            const paperYJitter = paperYJitterPattern[index % paperYJitterPattern.length];
            docEl.style.setProperty('--archive-paper-y-jitter', `${paperYJitter}px`);

            const tags = isGarden ? (siteTagsMapping[initialSite.name] || '') : unionSiteTags(entrySites);
            docEl.setAttribute('data-tags', tags);
            docEl.setAttribute('data-tag', tags);

            const positionIndex = (total - 1) - index;
            const verticalGap = isGarden ? 32 : 18;
            if (isGarden) {
                docEl.style.top = `${positionIndex * verticalGap}px`;
                docEl.style.right = `-${positionIndex * 4}px`;
                docEl.style.zIndex = positionIndex;
                docEl.dataset.zIndex = positionIndex;
            } else {
                // v50: record-card coordinates are assigned by the sliding fan
                // after all cards exist in the DOM. This caps horizontal drift.
                docEl.style.top = '0px';
                docEl.style.left = '0px';
                docEl.style.zIndex = '1000';
                docEl.dataset.zIndex = '1000';
            }

            const seq = cnNums[index] || (index + 1);
            const typeKey = isGarden ? 'ui_garden' : 'ui_record';
            const typeText = isGarden ? '废墟园林' : '遗构录';
            const navKey = 'ui_auto_nav';
            const navText = '自动导航 ⌖';

            const uniqueDates = [...new Set(entrySites.map(site => site.archiveDate).filter(Boolean))];
            const archiveDateText = uniqueDates.join(' · ');
            const uniqueRecorders = [...new Set(entrySites.map(site => site.recorder || '罗清源'))];
            const recorderText = uniqueRecorders.join(' / ');
            const secondaryRecordHtml = isGarden ? '' : buildArchiveDocSecondaryRecords(entrySites);

            // v90: Ruin Garden archive-doc cards use a separate
            // thumbnail source set, displayed at 128×128. Compass and ordinary Record cards
            // continue using SITE_THUMBNAILS unchanged.
            const thumbnailSourceMap = isGarden
                ? GARDEN_ARCHIVE_THUMBNAILS
                : SITE_THUMBNAILS;
            const thumbnailAuthoredSize = 128;
            const thumbnailSite = getThumbnailSite(entrySites, thumbnailSourceMap);

            if (thumbnailSite) {
                docEl.classList.add('has-thumbnail');
                docEl.dataset.thumbnailSite = thumbnailSite.name;

                if (isGarden) {
                    docEl.classList.add('garden-large-thumbnail');
                }
            }

            const titleTextHtml = isGarden
                ? `<span data-i18n="ui_garden">废墟园林</span> · <span data-i18n="ui_seq_${index + 1}">其${seq}</span> | <span class="doc-site-name" data-i18n="site_name_${initialSite.name}">${initialSite.name}</span>`
                : isCombinedRecord
                    ? `<div class="combined-site-list">${entrySites.map((site, siteIndex) => `
                        <div class="combined-site-line">
                            <span class="combined-site-prefix" aria-hidden="true">-</span>
                            <span data-i18n="ui_record">遗构录</span>&nbsp;|&nbsp;<span data-i18n="site_name_${site.name}">${site.name}</span>
                        </div>`).join('')}</div>`
                    : `<span data-i18n="ui_record">遗构录</span> | <span class="doc-site-name" data-i18n="site_name_${initialSite.name}">${initialSite.name}</span>`;

            const coordinateHtml = isCombinedRecord
                ? entrySites.map((site, siteIndex) => {
                    const latStr = site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat));
                    return `<div class="combined-coordinate-line">${latStr.trim()} ${formatLng(site.lng).trim()}</div>`;
                }).join('')
                : (() => {
                    const latStr = initialSite.lat >= 0 ? formatLat(-initialSite.lat) : formatLat(Math.abs(initialSite.lat));
                    return `${latStr.trim()} ${formatLng(initialSite.lng).trim()}`;
                })();

            docEl.innerHTML = `
                <div class="doc-meta">[ <span data-i18n="${typeKey}">${typeText}</span> ] | <span data-i18n="ui_archive_date">归档: </span><span class="doc-archive-date">${archiveDateText}</span></div>
                <div class="doc-title">${titleTextHtml}</div>
                <div class="archive-doc-thumbnail" aria-hidden="true"></div>
                <div class="doc-meta doc-identity-meta">${isGarden
                    ? `<span data-i18n="ui_creator">墟构师: 罗清源</span>`
                    : `<span data-i18n="ui_recorder_label">记录者: </span><span class="doc-recorder-name">${recorderText}</span>${secondaryRecordHtml}`}
                </div>
                <div class="doc-meta doc-coordinate-meta${isCombinedRecord ? ' combined-coordinate-meta' : ''}" style="margin-bottom: 8px;">${coordinateHtml}</div>
                <div class="doc-coord-btn ${isGarden ? 'garden-nav-btn' : 'compass-btn'}" data-i18n="${navKey}">${navText}</div>
            `;

            // opt42 · The thumbnail is invisible until a sheet is extracted, so do
            // not spend network/decode memory on every archive card at startup.
            // A one-shot closure keeps the original authored thumbnail renderer.
            let thumbnailMounted = false;
            const ensureArchiveDocThumbnail = () => {
                if (!thumbnailSite || thumbnailMounted) return;
                thumbnailMounted = true;
                mountStaticThumbnail(
                    docEl.querySelector('.archive-doc-thumbnail'),
                    thumbnailSite,
                    thumbnailSourceMap,
                    thumbnailAuthoredSize
                );
            };

            docEl.addEventListener('click', (event) => {
                if (event.target.closest('.doc-coord-btn') || event.target.closest('.doc-title')) return;
                event.stopPropagation();

                document.querySelectorAll('.archive-doc.extracted').forEach(el => {
                    if (el !== docEl) retractArchiveDocSmooth(el);
                });

                // Clicking the already extracted sheet sends it back along the
                // same physical path instead of dropping the class immediately.
                if (docEl.classList.contains('extracted')) {
                    retractArchiveDocSmooth(docEl);
                    return;
                }

                const willExtract = true;
                if (willExtract && !isGarden) {
                    const stackRect = container.getBoundingClientRect();

                    // v54: use the right-side garden archive-doc as the vertical
                    // reference instead of anchoring the record sheet to the
                    // viewport bottom. The left sheet sits at 70% of the right
                    // sheet's extracted Y position — visually about 30% higher.
                    // Reading the right stack's real CSS bottom/custom offset
                    // keeps the relationship stable across viewport heights.
                    const gardenStack = document.getElementById('stack-garden');
                    let gardenViewportTop = window.innerHeight - 120 - 233;
                    if (gardenStack) {
                        const gardenStyle = getComputedStyle(gardenStack);
                        const gardenBottom = parseFloat(gardenStyle.bottom);
                        const recordReferenceTop = parseFloat(
                            gardenStyle.getPropertyValue('--record-reference-garden-extract-top')
                        );
                        const gardenExtractTop = parseFloat(
                            gardenStyle.getPropertyValue('--garden-extract-top')
                        );
                        gardenViewportTop = window.innerHeight
                            - (Number.isFinite(gardenBottom) ? gardenBottom : 120)
                            + (Number.isFinite(recordReferenceTop)
                                ? recordReferenceTop
                                : (Number.isFinite(gardenExtractTop) ? gardenExtractTop : -233));
                    }

                    const targetViewportTop = Math.max(18, gardenViewportTop * 0.70);
                    const targetRelativeTop = targetViewportTop - stackRect.top;
                    docEl.style.setProperty('--record-extract-top', `${targetRelativeTop}px`);
                }

                // Start the thumbnail request immediately before reveal. The card's
                // extraction transition masks decode latency without front-loading
                // dozens of hidden images on initial page load.
                ensureArchiveDocThumbnail();
                docEl.classList.remove('retracting');
                docEl.classList.add('extracted');

                if (!isGarden) {
                    recordStackSlider.extractedDoc = docEl;
                }

                // v51: pulling a document out must not promote it above the
                // entire archive stack. Keep the exact layer assigned by the
                // stack layout so the previous sheet still overlaps it while
                // the following sheet remains underneath — visually, the card
                // is being pulled from *between* its neighbours.
                docEl.style.zIndex = docEl.dataset.zIndex;

                if (docEl.classList.contains('extracted')) stopRecordStackHover();
            });

            const coordBtn = docEl.querySelector('.doc-coord-btn');
            const titleEl = docEl.querySelector('.doc-title');

            if (coordBtn) {
                coordBtn.addEventListener('click', event => {
                    event.stopPropagation();
                    const indexDrawer = document.getElementById('index-drawer');
                    const runNavigation = (fromIndexDrawer) => {
                        if (isCombinedRecord) {
                            flyToSiteGroup(entrySites, fromIndexDrawer);
                        } else {
                            flyToSite(initialSite, sites.indexOf(initialSite), fromIndexDrawer);
                        }
                    };

                    if (indexDrawer && indexDrawer.classList.contains('open')) {
                        window.closeIndexDrawerWithAnim(true);
                        setTimeout(() => runNavigation(true), 400);
                    } else {
                        runNavigation(false);
                    }
                });
            }

            if (titleEl && coordBtn) {
                titleEl.addEventListener('click', event => {
                    event.stopPropagation();
                    coordBtn.click();
                });
            }

            container.appendChild(docEl);
        });
    }

    renderStack(gardenSites, stackGarden, true);
    renderStack(recordEntries, stackRecord, false);
    setupRecordStackSlider(stackRecord);

    // Commit the final fan transform once while transition:none is active.
    // A single style read is intentional here: it prevents the first visible
    // frame from ever using the fallback --stack-x/--stack-y = 0 values.
    requestAnimationFrame(() => {
        if (stackRecord.dataset.stackBootstrapToken !== bootstrapToken) return;
        const probe = stackRecord.querySelector('.archive-doc');
        if (probe) void getComputedStyle(probe).transform;
        stackRecord.classList.remove('record-stack-bootstrapping');
    });

    syncLanguageSubtree(stackGarden);
    syncLanguageSubtree(stackRecord);

    // opt15 · Archive-doc is now an eager subsystem. Build its wear/cuts while
    // #stack-record is still hidden by record-stack-bootstrapping, so the first
    // visible archive frame is already the final damaged state. No idle mutation
    // is allowed to arrive later and reshuffle compositor layers.
    window.StartupIdleQueue?.cancel?.('archive-damage');
    RuinFractureSystem.applyArchiveDamage();
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.archive-doc') && !e.target.closest('#collapse-compass-btn')) {
        document.querySelectorAll('.archive-doc.extracted').forEach(el => {
            retractArchiveDocSmooth(el);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // opt15 · Build the complete archive stack immediately. The stack's own
    // bootstrap guard still keeps its incomplete first-layout frame unpainted.
    buildFileStacks();
});

document.addEventListener('DOMContentLoaded', () => {
    const bottomDrawer = document.getElementById('bottom-index-drawer');
    const drawerTrigger = document.getElementById('bottom-drawer-trigger');


    if (drawerTrigger && bottomDrawer) {
        drawerTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            bottomDrawer.classList.toggle('open');
        });
    }


    document.addEventListener('click', (e) => {
        if (bottomDrawer && bottomDrawer.classList.contains('open')) {

            if (!bottomDrawer.contains(e.target)) {
                bottomDrawer.classList.remove('open');
            }
        }
    });


    const indexTags = document.querySelectorAll('.index-tag');
    const archiveDocs = document.querySelectorAll('.archive-doc');

    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();

            const isActive = tag.classList.contains('active');
            const keyword = tag.getAttribute('data-tags');


        });
    });
});


document.addEventListener("DOMContentLoaded", () => {

    const indexTags = document.querySelectorAll('.index-tag, .index-category');


    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();


            if (tag.classList.contains('disabled')) {
                return;
            }


            tag.classList.toggle('active');


            updateArchiveDocs();
        });
    });


    function updateArchiveDocs() {

        const activeTags = Array.from(document.querySelectorAll('.index-tag.active, .index-category.active'))
            .map(tag => (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim())
            .filter(Boolean);


        const archiveDocs = document.querySelectorAll('.archive-doc, .site-character, .mobile-list-item, .compass-wheel-item');


        const availableTags = new Set();


        archiveDocs.forEach(doc => {
            const docTagsAttr = doc.getAttribute('data-tag') || doc.getAttribute('data-tags') || "";
            const docTags = docTagsAttr.split(',').map(t => t.trim()).filter(Boolean);

            const isArchiveDoc = doc.classList.contains('archive-doc');

            if (activeTags.length === 0) {

                doc.classList.remove('matched-tag');
                doc.classList.remove('active-dot');
                if (isArchiveDoc) doc.classList.remove('index-filter-muted');
                doc.style.display = 'block';

                docTags.forEach(t => availableTags.add(t));
            } else {

                const isMatch = activeTags.every(activeTag => docTags.includes(activeTag));

                if (isMatch) {
                    doc.classList.add('matched-tag');
                    doc.classList.add('active-dot');
                    if (isArchiveDoc) doc.classList.remove('index-filter-muted');
                    doc.style.display = 'block';


                    docTags.forEach(t => availableTags.add(t));
                } else {
                    doc.classList.remove('matched-tag');
                    doc.classList.remove('active-dot');
                    if (isArchiveDoc) doc.classList.add('index-filter-muted');

                }
            }
        });


        indexTags.forEach(tag => {
            const tagVal = (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim();

            if (activeTags.length === 0) {

                tag.classList.remove('disabled');
            } else {

                if (!availableTags.has(tagVal)) {
                    tag.classList.add('disabled');
                    tag.classList.remove('active');
                } else {
                    tag.classList.remove('disabled');
                }
            }
        });


        const layoutElements = document.querySelectorAll('.index-three-columns, .index-conclusion, .index-top-title');

        if (activeTags.length === 0) {

            layoutElements.forEach(el => el.classList.remove('disabled'));
        } else {

            layoutElements.forEach(el => el.classList.add('disabled'));
        }


        const ruinTriggers = document.querySelectorAll('#bottom-trigger-ruin, #opened-trigger-ruin');
        const recordTriggers = document.querySelectorAll('#bottom-trigger-record, #opened-trigger-record');


        if (activeTags.length === 0) {
            ruinTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = "";
            });
            recordTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = "";
            });
        } else {

            let gardenCount = 0;
            let recordCount = 0;


            sites.forEach(site => {
                const siteTags = (siteTagsMapping[site.name] || "").split(',').map(t => t.trim()).filter(Boolean);
                const isMatch = activeTags.every(activeTag => siteTags.includes(activeTag));

                if (isMatch) {
                    if (site.type === 'garden') gardenCount++;
                    if (site.type === 'record') recordCount++;
                }
            });


            ruinTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = gardenCount > 0 ? `[${gardenCount}] ` : "";
            });
            recordTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = recordCount > 0 ? ` [${recordCount}]` : "";
            });


        }

    }
});

document.addEventListener("DOMContentLoaded", () => {
    const frame = document.getElementById('main-viewport-frame');
    const handleShapes = document.querySelectorAll('#index-drawer-handle .frosted-shape, #drawer-opened-bottom-decor .frosted-shape');

    if (!frame || handleShapes.length === 0) return;


    const updateTrapezoidHandle = () => {
        const rect = frame.getBoundingClientRect();
        handleShapes.forEach(shape => {
            shape.style.setProperty('--frame-left', `${rect.left}px`);
            shape.style.setProperty('--frame-right', `${rect.right}px`);
        });
    };


    updateTrapezoidHandle();


    window.addEventListener('resize', updateTrapezoidHandle);


    const observer = new ResizeObserver(() => {
        updateTrapezoidHandle();
    });
    observer.observe(frame);
});



// =========================
// PDF / TXT inline translation
// =========================
function splitTranslationChunks(text, maxChars = 1800) {
    const clean = String(text || '').replace(/\r\n?/g, '\n').trim();
    if (!clean) return [];

    const paragraphs = clean.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    const chunks = [];
    let buffer = '';

    const pushBuffer = () => {
        if (buffer.trim()) chunks.push(buffer.trim());
        buffer = '';
    };

    for (const paragraph of paragraphs) {
        if (paragraph.length > maxChars) {
            pushBuffer();
            for (let i = 0; i < paragraph.length; i += maxChars) {
                chunks.push(paragraph.slice(i, i + maxChars));
            }
            continue;
        }

        const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
        if (candidate.length > maxChars) {
            pushBuffer();
            buffer = paragraph;
        } else {
            buffer = candidate;
        }
    }

    pushBuffer();
    return chunks;
}

async function translateDocumentText(text, sourceLang, targetLang) {
    const clean = String(text || '').trim();
    if (!clean || sourceLang === targetLang) return clean;

    const cacheKey = `${sourceLang}>${targetLang}:${clean}`;
    if (documentTranslationCache.has(cacheKey)) {
        return documentTranslationCache.get(cacheKey);
    }

    const chunks = splitTranslationChunks(clean);
    const translated = [];

    for (const chunk of chunks) {
        const response = await fetch(DOCUMENT_TRANSLATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: chunk,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });

        if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);

        const data = await response.json();
        const value = String(
            data.translated_text || data.translation || data.response || ''
        ).trim();

        if (!value) throw new Error('Empty translation response');
        translated.push(value);
    }

    const result = translated.join('\n\n');
    documentTranslationCache.set(cacheKey, result);
    return result;
}

function isChineseSourceText(text) {
    return /[\u3400-\u9fff]/.test(String(text || ''));
}

function joinPdfTokens(left, right) {
    const a = String(left || '');
    const b = String(right || '');
    if (!a) return b;
    if (!b) return a;

    const aLast = a[a.length - 1];
    const bFirst = b[0];
    const cjk = ch => /[\u3400-\u9fff\u3040-\u30ff]/.test(ch || '');
    const punctuation = ch => /[，。！？；：、,.!?;:）》】』」]/.test(ch || '');

    if (cjk(aLast) || cjk(bFirst) || punctuation(bFirst)) return a + b;
    return `${a} ${b}`;
}

function buildPdfTranslationBlocks(items, viewport) {
    if (!window.pdfjsLib?.Util || !viewport) return [];

    const glyphs = [];
    for (const item of items || []) {
        const text = String(item?.str || '').trim();
        if (!text) continue;

        const raw = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
        const tx = window.pdfjsLib.Util.transform(viewport.transform, raw);
        const fontSize = Math.max(6, Math.hypot(tx[2], tx[3]) || Math.hypot(tx[0], tx[1]) || 10);
        const width = Math.max(
            2,
            Math.abs(Number(item.width || 0) * viewport.scale) || fontSize * Math.max(1, text.length) * 0.52
        );
        const baseline = Number(tx[5] || 0);
        const top = baseline - fontSize * 0.88;

        glyphs.push({
            text,
            x: Number(tx[4] || 0),
            baseline,
            top,
            width,
            height: fontSize * 1.12,
            fontSize,
            hasEOL: Boolean(item.hasEOL)
        });
    }

    if (!glyphs.length) return [];
    glyphs.sort((a, b) => Math.abs(a.baseline - b.baseline) > Math.max(3, Math.min(a.fontSize, b.fontSize) * .36)
        ? a.baseline - b.baseline
        : a.x - b.x);

    // Build visual rows first. Items on the same baseline but separated by a large
    // horizontal gap become separate rows, preventing two-column PDFs from mixing.
    const baselineRows = [];
    for (const glyph of glyphs) {
        let row = baselineRows.find(candidate =>
            Math.abs(candidate.baseline - glyph.baseline) <= Math.max(3, Math.min(candidate.fontSize, glyph.fontSize) * .4)
        );
        if (!row) {
            row = { baseline: glyph.baseline, fontSize: glyph.fontSize, items: [] };
            baselineRows.push(row);
        }
        row.items.push(glyph);
        row.fontSize = (row.fontSize + glyph.fontSize) / 2;
    }

    const lines = [];
    for (const row of baselineRows) {
        const sorted = row.items.sort((a, b) => a.x - b.x);
        let segment = null;

        const flush = () => {
            if (!segment) return;
            segment.width = Math.max(2, segment.xMax - segment.x);
            segment.height = Math.max(segment.fontSize * 1.2, segment.bottom - segment.top);
            lines.push(segment);
            segment = null;
        };

        for (const glyph of sorted) {
            if (!segment) {
                segment = {
                    text: glyph.text,
                    x: glyph.x,
                    xMax: glyph.x + glyph.width,
                    top: glyph.top,
                    bottom: glyph.top + glyph.height,
                    baseline: glyph.baseline,
                    fontSize: glyph.fontSize,
                    hasEOL: glyph.hasEOL
                };
                continue;
            }

            const gap = glyph.x - segment.xMax;
            const splitGap = Math.max(34, ((segment.fontSize + glyph.fontSize) / 2) * 4.2);
            if (gap > splitGap) {
                flush();
                segment = {
                    text: glyph.text,
                    x: glyph.x,
                    xMax: glyph.x + glyph.width,
                    top: glyph.top,
                    bottom: glyph.top + glyph.height,
                    baseline: glyph.baseline,
                    fontSize: glyph.fontSize,
                    hasEOL: glyph.hasEOL
                };
            } else {
                segment.text = joinPdfTokens(segment.text, glyph.text);
                segment.xMax = Math.max(segment.xMax, glyph.x + glyph.width);
                segment.top = Math.min(segment.top, glyph.top);
                segment.bottom = Math.max(segment.bottom, glyph.top + glyph.height);
                segment.fontSize = (segment.fontSize + glyph.fontSize) / 2;
                segment.hasEOL = segment.hasEOL || glyph.hasEOL;
            }
        }
        flush();
    }

    lines.sort((a, b) => Math.abs(a.top - b.top) > 3 ? a.top - b.top : a.x - b.x);

    // Merge only geometrically compatible adjacent lines. This keeps captions,
    // side notes, titles and columns independent while giving body paragraphs context.
    const blocks = [];
    for (const line of lines) {
        let best = null;
        let bestScore = Infinity;

        for (const block of blocks) {
            const verticalGap = line.top - block.bottom;
            if (verticalGap < -2 || verticalGap > Math.max(20, line.fontSize * 1.8, block.fontSize * 1.8)) continue;

            const overlap = Math.max(0, Math.min(block.xMax, line.x + line.width) - Math.max(block.x, line.x));
            const overlapRatio = overlap / Math.max(1, Math.min(block.width, line.width));
            const xDelta = Math.abs(block.x - line.x);
            const fontRatio = Math.max(block.fontSize, line.fontSize) / Math.max(1, Math.min(block.fontSize, line.fontSize));

            if (fontRatio > 1.45) continue;
            if (overlapRatio < .38 && xDelta > Math.max(28, line.fontSize * 3.2)) continue;
            if (block.text.length + line.text.length > 900) continue;

            const score = verticalGap + xDelta * .12 - overlapRatio * 8;
            if (score < bestScore) {
                best = block;
                bestScore = score;
            }
        }

        if (!best) {
            blocks.push({
                text: line.text,
                x: line.x,
                xMax: line.x + line.width,
                top: line.top,
                bottom: line.top + line.height,
                width: line.width,
                height: line.height,
                fontSize: line.fontSize
            });
        } else {
            best.text = joinPdfTokens(best.text, line.text);
            best.x = Math.min(best.x, line.x);
            best.xMax = Math.max(best.xMax, line.x + line.width);
            best.top = Math.min(best.top, line.top);
            best.bottom = Math.max(best.bottom, line.top + line.height);
            best.width = best.xMax - best.x;
            best.height = best.bottom - best.top;
            best.fontSize = (best.fontSize + line.fontSize) / 2;
        }
    }

    return blocks
        .filter(block => block.text.trim())
        .sort((a, b) => Math.abs(a.top - b.top) > 3 ? a.top - b.top : a.x - b.x);
}

function clearPdfTranslationCanvas() {
    const canvas = document.getElementById('pdf-translation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('active');
}

function clearInlineDocumentTranslation() {
    clearPdfTranslationCanvas();
    const layer = document.getElementById('archive-text-translation-layer');
    const translatedContent = document.getElementById('archive-text-translation-content');
    if (layer) layer.classList.remove('active', 'is-translating');
    if (translatedContent) translatedContent.textContent = '';
    setDocumentTranslationLoading(false);
}

function wrapCanvasText(ctx, text, maxWidth, targetLang) {
    const source = String(text || '').trim();
    if (!source) return [];

    const units = targetLang === 'en'
        ? source.split(/\s+/).filter(Boolean)
        : Array.from(source);
    const joiner = targetLang === 'en' ? ' ' : '';
    const lines = [];
    let line = '';

    for (const unit of units) {
        const candidate = line ? line + joiner + unit : unit;
        if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = unit;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function fitCanvasTranslation(ctx, text, maxWidth, maxHeight, startFont, targetLang) {
    const minFont = 5.5;
    let fontSize = Math.max(minFont, Math.min(startFont, 18));

    while (fontSize >= minFont) {
        ctx.font = `400 ${fontSize}px "IBM Plex Sans JP", sans-serif`;
        const lines = wrapCanvasText(ctx, text, maxWidth, targetLang);
        const lineHeight = fontSize * 1.28;
        if (lines.length * lineHeight <= maxHeight) {
            return { fontSize, lineHeight, lines };
        }
        fontSize -= .5;
    }

    ctx.font = `400 ${minFont}px "IBM Plex Sans JP", sans-serif`;
    const lines = wrapCanvasText(ctx, text, maxWidth, targetLang);
    return { fontSize: minFont, lineHeight: minFont * 1.24, lines };
}

function getPdfBlockAvailableHeight(block, allBlocks, canvasHeight) {
    let nextTop = canvasHeight - 3;
    for (const candidate of allBlocks) {
        if (candidate === block || candidate.top <= block.top) continue;
        const overlap = Math.max(0, Math.min(block.xMax, candidate.xMax) - Math.max(block.x, candidate.x));
        const ratio = overlap / Math.max(1, Math.min(block.width, candidate.width));
        if (ratio >= .25) nextTop = Math.min(nextTop, candidate.top - 2);
    }

    const freeHeight = Math.max(block.height * 1.15, nextTop - block.top);
    return Math.max(block.height * 1.15, Math.min(freeHeight, block.height * 2.6 + block.fontSize));
}

function paintPdfTranslationBlock(ctx, block, translated, targetLang, allBlocks, canvasWidth, canvasHeight) {
    if (!translated) return;

    const padX = Math.max(2, block.fontSize * .18);
    const padY = Math.max(1.5, block.fontSize * .12);
    const x = Math.max(0, block.x - padX);
    const y = Math.max(0, block.top - padY);
    const maxWidth = Math.max(16, Math.min(canvasWidth - x - 2, block.width + padX * 2));
    const maxHeight = Math.max(12, Math.min(canvasHeight - y - 2, getPdfBlockAvailableHeight(block, allBlocks, canvasHeight)));

    const fitted = fitCanvasTranslation(
        ctx,
        translated,
        Math.max(12, maxWidth - padX * 2),
        Math.max(10, maxHeight - padY * 2),
        block.fontSize * (targetLang === 'en' ? .82 : .92),
        targetLang
    );

    const actualHeight = Math.min(maxHeight, fitted.lines.length * fitted.lineHeight + padY * 2);

    ctx.save();
    // Semi-transparent grey tape: the source remains faintly readable underneath
    // and can be fully restored with the translation toggle.
    ctx.shadowColor = 'rgba(0,0,0,.10)';
    ctx.shadowBlur = Math.max(1, block.fontSize * .10);
    ctx.fillStyle = 'rgba(166,166,160,.72)';
    ctx.fillRect(x, y, maxWidth, actualHeight);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.20)';
    ctx.lineWidth = .6;
    ctx.strokeRect(x + .3, y + .3, Math.max(0, maxWidth - .6), Math.max(0, actualHeight - .6));
    ctx.fillStyle = 'rgba(16,16,16,.96)';
    ctx.textBaseline = 'top';
    ctx.font = `400 ${fitted.fontSize}px "IBM Plex Sans JP", sans-serif`;

    let drawY = y + padY;
    const maxLines = Math.floor((actualHeight - padY * 2) / fitted.lineHeight);
    fitted.lines.slice(0, Math.max(1, maxLines)).forEach(line => {
        ctx.fillText(line, x + padX, drawY, maxWidth - padX * 2);
        drawY += fitted.lineHeight;
    });
    ctx.restore();
}

async function translatePdfBlocksInline(targetLang, requestToken) {
    const canvas = document.getElementById('pdf-translation-canvas');
    if (!canvas || !activePdfTextBlocks.length || targetLang === 'zh' || !documentTranslationEnabled) {
        clearPdfTranslationCanvas();
        setDocumentTranslationLoading(false);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.add('active');

    const blocks = activePdfTextBlocks.filter(block => isChineseSourceText(block.text));
    if (!blocks.length) {
        setDocumentTranslationLoading(false);
        return;
    }

    const concurrency = 3;
    let cursor = 0;
    let completed = 0;
    setDocumentTranslationLoading(true, completed, blocks.length);

    async function worker() {
        while (cursor < blocks.length) {
            const index = cursor++;
            const block = blocks[index];
            try {
                const translated = await translateDocumentText(block.text, 'zh', targetLang);
                if (requestToken !== documentTranslationToken || activeAttachmentItem?.mode !== 'pdf' || !documentTranslationEnabled) return;
                paintPdfTranslationBlock(ctx, block, translated, targetLang, activePdfTextBlocks, canvas.width, canvas.height);
            } catch (error) {
                console.warn('PDF inline translation block failed:', error);
            } finally {
                completed += 1;
                if (requestToken === documentTranslationToken && documentTranslationEnabled) {
                    setDocumentTranslationLoading(completed < blocks.length, completed, blocks.length);
                }
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, blocks.length) }, () => worker()));
    if (requestToken === documentTranslationToken && documentTranslationEnabled) {
        setDocumentTranslationLoading(false);
    }
}

async function translateTxtInline(targetLang, requestToken) {
    const layer = document.getElementById('archive-text-translation-layer');
    const translatedContent = document.getElementById('archive-text-translation-content');
    if (!layer || !translatedContent || !activeTextSource) return;

    if (targetLang === 'zh' || !documentTranslationEnabled) {
        layer.classList.remove('active', 'is-translating');
        translatedContent.textContent = '';
        setDocumentTranslationLoading(false);
        return;
    }

    layer.classList.add('is-translating');
    layer.classList.remove('active');
    setDocumentTranslationLoading(true);

    try {
        const translated = await translateDocumentText(activeTextSource, 'zh', targetLang);
        if (requestToken !== documentTranslationToken || activeAttachmentItem?.mode !== 'text' || !documentTranslationEnabled) return;
        translatedContent.textContent = translated;
        layer.classList.remove('is-translating');
        layer.classList.add('active');
        setDocumentTranslationLoading(false);
    } catch (error) {
        if (requestToken !== documentTranslationToken) return;
        console.warn('TXT inline translation unavailable:', error);
        layer.classList.remove('active', 'is-translating');
        translatedContent.textContent = '';
        setDocumentTranslationLoading(false);
    }
}

function getDocumentTranslationTargetLang() {
    return ['zh', 'en', 'ja'].includes(window.currentLang) ? window.currentLang : 'zh';
}

function getDocumentTranslationUiText(lang = getDocumentTranslationTargetLang()) {
    if (lang === 'ja') return { button: '訳', loading: '翻訳中' };
    if (lang === 'en') return { button: 'TR', loading: 'TRANSLATING' };
    return { button: '译', loading: '等待翻译' };
}

function setDocumentTranslationLoading(active, completed = 0, total = 0) {
    const status = document.getElementById('document-translation-loading');
    if (!status) return;

    if (!active) {
        status.classList.remove('active');
        status.textContent = '';
        return;
    }

    const { loading } = getDocumentTranslationUiText();
    status.textContent = total > 0 ? `${loading} ${Math.min(completed, total)}/${total}` : `${loading}…`;
    status.classList.add('active');
}

function updateDocumentTranslationControls() {
    const button = document.getElementById('document-translation-toggle');
    const label = document.getElementById('document-translation-toggle-label');
    if (!button || !label) return;

    const isDocument = Boolean(activeAttachmentItem && ['pdf', 'text'].includes(activeAttachmentItem.mode));
    const targetLang = getDocumentTranslationTargetLang();
    const isSourceLanguage = targetLang === 'zh';
    const { button: buttonText } = getDocumentTranslationUiText(targetLang);

    label.textContent = buttonText;
    button.classList.toggle('visible', isDocument);
    button.classList.toggle('active', isDocument && documentTranslationEnabled && !isSourceLanguage);
    button.classList.toggle('source-language', isDocument && isSourceLanguage);
    button.disabled = !isDocument || isSourceLanguage;
    button.setAttribute('aria-pressed', String(Boolean(documentTranslationEnabled && !isSourceLanguage)));
    button.setAttribute('aria-label', isSourceLanguage ? 'Source language · translation off' : 'Toggle document translation');

    if (!isDocument || isSourceLanguage || !documentTranslationEnabled) {
        setDocumentTranslationLoading(false);
    }
}

function syncDocumentTranslationPreference({ onOpen = false } = {}) {
    const targetLang = getDocumentTranslationTargetLang();

    // Simplified Chinese is the archival source. Chinese UI always opens in original mode.
    if (targetLang === 'zh') {
        documentTranslationEnabled = false;
    } else if (documentTranslationUserChoice === null) {
        // EN / JA may auto-open the translation layer until the visitor explicitly
        // chooses a preference with the top-right switch.
        documentTranslationEnabled = true;
    } else {
        documentTranslationEnabled = documentTranslationUserChoice;
    }

    updateDocumentTranslationControls();
}

function refreshInlineDocumentTranslation() {
    const item = activeAttachmentItem;
    if (!item || !['pdf', 'text'].includes(item.mode)) {
        updateDocumentTranslationControls();
        return;
    }

    const targetLang = getDocumentTranslationTargetLang();
    const requestToken = ++documentTranslationToken;
    updateDocumentTranslationControls();

    if (targetLang === 'zh' || !documentTranslationEnabled) {
        clearInlineDocumentTranslation();
        return;
    }

    if (item.mode === 'pdf') {
        translatePdfBlocksInline(targetLang, requestToken);
    } else if (item.mode === 'text') {
        translateTxtInline(targetLang, requestToken);
    }
}

window.handleDocumentLanguageChange = function handleDocumentLanguageChange() {
    if (!activeAttachmentItem || !['pdf', 'text'].includes(activeAttachmentItem.mode)) return;
    syncDocumentTranslationPreference();
    refreshInlineDocumentTranslation();
};

document.addEventListener('click', event => {
    const button = event.target.closest('#document-translation-toggle');
    if (!button || button.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    documentTranslationEnabled = !documentTranslationEnabled;
    documentTranslationUserChoice = documentTranslationEnabled;
    ++documentTranslationToken;
    updateDocumentTranslationControls();

    if (documentTranslationEnabled) {
        refreshInlineDocumentTranslation();
    } else {
        clearInlineDocumentTranslation();
    }
});

function switchLanguage(targetLang) {
    const vault = languageVault[targetLang];
    if (!vault) return;

    window.currentLang = targetLang;
    document.documentElement.lang = targetLang === 'ja' ? 'ja' : targetLang === 'en' ? 'en' : 'zh-Hans';
    // opt15 · The ENG / LAT·GR switch is an English-index control only.
    // Sync it immediately from <html lang>; do not let the 5 s text wave decide
    // whether the control itself is visible.
    window.syncIndexLexiconToggle?.();
    window.syncRuinRootMetadata?.();
    if (vault.document_title) document.title = vault.document_title;
    window.handleDocumentLanguageChange?.(targetLang);

    // V291 behavior: restart the drawer from the top before translated copy is
    // measured. Geometry/masks remain deferred until languagechange-complete.
    const drawerScrollLayer = document.getElementById('index-drawer-scroll-layer');
    if (drawerScrollLayer) drawerScrollLayer.scrollTop = 0;
    RuinFractureSystem?.syncIndexDrawerAdaptiveHeightThroughTransition?.();

    const waveMs = Number(window.CYBER_DECODE_WAVE_MS) || 5000;
    const durationMs = Number(window.CYBER_DECODE_DURATION_MS) || 1000;
    const latestStartMs = Math.max(0, waveMs - durationMs);
    const visibleEntries = [];
    const hiddenEntries = [];

    // One visibility read pass before the shared scheduler begins writing text.
    for (const el of document.querySelectorAll('[data-i18n]')) {
        const key = el.getAttribute('data-i18n');
        const targetText =
            targetLang === 'en' &&
            window.indexLexiconMode === 'roots' &&
            typeof RUIN_ROOT_LEXICON !== 'undefined' &&
            RUIN_ROOT_LEXICON?.[key]
                ? RUIN_ROOT_LEXICON[key].root
                : vault[key];
        if (!targetText || el.textContent === targetText) continue;

        const entry = {
            element: el,
            targetText,
            duration: durationMs,
            delay: 0,
            visible: isElementOnScreen(el)
        };
        (entry.visible ? visibleEntries : hiddenEntries).push(entry);
    }

    // Keep the old random character of the translation, but compress the whole
    // visible wave to five seconds: starts occupy 0–4 s, each decode lasts 1 s.
    for (let i = visibleEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [visibleEntries[i], visibleEntries[j]] = [visibleEntries[j], visibleEntries[i]];
    }
    const count = visibleEntries.length;
    visibleEntries.forEach((entry, index) => {
        const slot = count > 0 ? latestStartMs / count : 0;
        entry.delay = slot * index + Math.random() * Math.max(0, slot * 0.92);
    });

    hiddenEntries.forEach(entry => {
        entry.duration = 1;
        entry.delay = 0;
    });

    // Cancel/replace any earlier language batch and emit one completion event
    // only after the last visible label has finished.
    const generation = CyberDecodeScheduler.startLanguageBatch(
        [...hiddenEntries, ...visibleEntries],
        targetLang
    );

    if (typeof safariDecodeSafety !== 'undefined') {
        safariDecodeSafety.generation = generation;
        safariDecodeSafety.targetLang = targetLang;
    }
    if (typeof scheduleSafariDecodeSafety === 'function') {
        scheduleSafariDecodeSafety(generation);
    }

    window.syncIndexInscriptionLanguageButtons?.();
}


document.addEventListener('DOMContentLoaded', () => {
    const wheelContainer = document.getElementById('title-language-wheel');
    const wheelTrack = document.getElementById('wheel-track');

    if (!wheelContainer || !wheelTrack) return;

    const items = Array.from(wheelTrack.querySelectorAll('.wheel-item'));
    const dots = Array.from(wheelContainer.querySelectorAll('.indicator-row'));
    const totalLangs = items.length;
    const itemHeight = 30;
    let currentIndex = 0;

    function normalizeLang(value) {
        const raw = String(value || 'en').toLowerCase();
        if (raw.startsWith('zh')) return 'zh';
        if (raw.startsWith('ja')) return 'ja';
        return 'en';
    }

    function applyWheelState(targetLang, { animate = true } = {}) {
        const lang = normalizeLang(targetLang);
        const nextIndex = Math.max(0, items.findIndex(item => item.getAttribute('data-lang') === lang));
        currentIndex = nextIndex;
        wheelTrack.style.transition = animate ? '' : 'none';
        wheelTrack.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
        items.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
        if (!animate) {
            requestAnimationFrame(() => { wheelTrack.style.transition = ''; });
        }
    }

    function goToLang(targetLang, { animate = true, propagate = true } = {}) {
        applyWheelState(targetLang, { animate });
        if (propagate && typeof switchLanguage === 'function') switchLanguage(normalizeLang(targetLang));
    }

    wheelContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const indicator = e.target.closest('.indicator-row');
        if (indicator) {
            goToLang(indicator.getAttribute('data-lang'), { animate: true, propagate: true });
            return;
        }
        const nextIndex = (currentIndex + 1) % totalLangs;
        goToLang(items[nextIndex].getAttribute('data-lang'), { animate: true, propagate: true });
    });

    wheelContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (wheelContainer.isScrolling) return;
        wheelContainer.isScrolling = true;
        const nextIndex = e.deltaY > 0 ? (currentIndex + 1) % totalLangs : (currentIndex - 1 + totalLangs) % totalLangs;
        goToLang(items[nextIndex].getAttribute('data-lang'), { animate: true, propagate: true });
        setTimeout(() => { wheelContainer.isScrolling = false; }, 300);
    }, { passive: false });

    window.syncTitleLanguageWheel = function syncTitleLanguageWheel(lang, options = {}) {
        applyWheelState(lang || document.documentElement.lang || window.currentLang || 'en', options);
    };

    const htmlObserver = new MutationObserver(() => {
        window.syncTitleLanguageWheel?.(document.documentElement.lang || window.currentLang || 'en', { animate: false });
    });
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.syncTitleLanguageWheel(document.documentElement.lang || window.currentLang || items[currentIndex]?.getAttribute('data-lang') || 'en', { animate: false });
});

let isDraggingCompass = false;
let edgePanRAF = null;
let compassX = window.innerWidth / 2;
let compassY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', () => {
    const compassContainer = document.querySelector('.compass-container');
    const compassHandle = document.getElementById('compass-handle');

    if (!compassContainer || !compassHandle) return;


    compassHandle.addEventListener('pointerdown', (e) => {
        isDraggingCompass = true;
        L.DomEvent.stopPropagation(e);
    });


    window.addEventListener('pointermove', (e) => {
        if (!isDraggingCompass) return;

        const halfW = compassContainer.offsetWidth / 2;
        const halfH = compassContainer.offsetHeight / 2;


        compassX = Math.max(15 + halfW, Math.min(e.clientX, window.innerWidth - 15 - halfW));
        compassY = Math.max(15 + halfH, Math.min(e.clientY, window.innerHeight - 15 - halfH));

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;

        window.updateCompassDirection();


        handleEdgePanning(e.clientX, e.clientY);
    });


    window.addEventListener('pointerup', () => {
        if (isDraggingCompass) {
            isDraggingCompass = false;
            cancelAnimationFrame(edgePanRAF);
            edgePanRAF = null;
        }
    });


    function handleEdgePanning(pointerX, pointerY) {
        cancelAnimationFrame(edgePanRAF);
        const edgeThreshold = 140;
        const maxSpeed = 18;

        let panX = 0;
        let panY = 0;


        if (pointerX < edgeThreshold) {
            panX = -((edgeThreshold - pointerX) / edgeThreshold) * maxSpeed;
        } else if (window.innerWidth - pointerX < edgeThreshold) {
            panX = ((edgeThreshold - (window.innerWidth - pointerX)) / edgeThreshold) * maxSpeed;
        }

        if (pointerY < edgeThreshold) {
            panY = -((edgeThreshold - pointerY) / edgeThreshold) * maxSpeed;
        } else if (window.innerHeight - pointerY < edgeThreshold) {
            panY = ((edgeThreshold - (window.innerHeight - pointerY)) / edgeThreshold) * maxSpeed;
        }


        if (panX !== 0 || panY !== 0) {
            function panLoop() {
                if (!isDraggingCompass) return;
                map.panBy([panX, panY], { animate: false });
                window.updateCompassDirection();
                edgePanRAF = requestAnimationFrame(panLoop);
            }
            panLoop();
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
// Global compass · v56 lazy hydration
    const compassModule = document.getElementById('global-compass-module');
    const compassWheel = document.getElementById('compass-site-wheel');
    const compassBtn = document.getElementById('global-compass-btn');
    const compassThumbnailFrame = document.getElementById('compass-thumbnail-frame');

    if (!compassModule || !compassWheel || !compassBtn) return;

    let wheelBuilt = false;
    let scrollTimeout = null;
    let lastSelectedIndex = -1;

    function buildCompassWheelOnce() {
        if (wheelBuilt) return;
        wheelBuilt = true;
        compassWheel.innerHTML = '';

        // Keep the authored five-block looping behaviour, but allocate it only
        // after the visitor actually opens the compass.
        const loopCount = 5;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < loopCount; i++) {
            sites.forEach((site, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'compass-wheel-item';
                const tags = siteTagsMapping[site.name] || '';
                itemDiv.setAttribute('data-tags', tags);
                itemDiv.setAttribute('data-tag', tags);
                itemDiv.setAttribute('data-i18n', `site_name_${site.name}`);
                itemDiv.dataset.realIndex = index;
                itemDiv.dataset.siteType = site.type === 'garden' ? 'garden' : 'record';
                itemDiv.innerText = site.name;
                fragment.appendChild(itemDiv);
            });
        }
        compassWheel.appendChild(fragment);
        syncLanguageSubtree(compassWheel);
        window.refreshArchiveIndexFilter?.();

        // One delegated click listener replaces one listener per wheel item.
        compassWheel.addEventListener('click', (e) => {
            if (window.__mobileCompassWheelOwned?.()) return;
            const itemDiv = e.target.closest('.compass-wheel-item');
            if (!itemDiv) return;
            e.stopPropagation();
            const wheelCenter = compassWheel.clientHeight / 2;
            compassWheel.scrollTo({
                top: itemDiv.offsetTop - wheelCenter + itemDiv.offsetHeight / 2,
                behavior: 'smooth'
            });
        });

        compassWheel.addEventListener('scroll', () => {
            if (window.__mobileCompassWheelOwned?.()) return;
            const itemHeight = 18;
            const singleBlockHeight = itemHeight * sites.length;
            if (compassWheel.scrollTop < singleBlockHeight) {
                compassWheel.scrollTop += singleBlockHeight * 2;
            } else if (compassWheel.scrollTop >= singleBlockHeight * 3) {
                compassWheel.scrollTop -= singleBlockHeight * 2;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const wheelCenter = compassWheel.scrollTop + compassWheel.clientHeight / 2;
                const items = compassWheel.querySelectorAll('.compass-wheel-item');
                let closestItem = null;
                let minDiff = Infinity;

                items.forEach(item => {
                    const itemCenter = item.offsetTop + item.offsetHeight / 2;
                    const diff = Math.abs(wheelCenter - itemCenter);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestItem = item;
                    }
                });

                if (!closestItem) return;
                const realIndex = parseInt(closestItem.dataset.realIndex, 10);
                if (realIndex === lastSelectedIndex) return;
                lastSelectedIndex = realIndex;

                items.forEach(el => el.classList.toggle(
                    'active',
                    parseInt(el.dataset.realIndex, 10) === realIndex
                ));

                const selectedSite = sites[realIndex];
                if (compassThumbnailFrame) {
                    mountStaticThumbnail(compassThumbnailFrame, selectedSite);
                }

                const targetMarkerData = markers[realIndex];
                if (targetMarkerData?.marker && window.setCompassTarget) {
                    window.setCompassTarget(targetMarkerData.marker);
                }
            }, 150);
        }, { passive: true });

        requestAnimationFrame(() => {
            const itemHeight = 18;
            compassWheel.scrollTop = itemHeight * sites.length * 2;
            compassWheel.dispatchEvent(new Event('scroll'));
        });
    }

    compassBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = compassModule.classList.toggle('expanded');

        if (isExpanded) {
            buildCompassWheelOnce();

            /* opt41 · Re-opening Compass is a two-step action:
               1) return the atlas to its authored overview;
               2) only after that fly-to settles, reveal/refresh Compass.
               This keeps the original Compass interaction intact while avoiding
               a compass overlay floating over a map that is still flying back. */
            const safeMap = getSafeMap();
            const revealCompass = (() => {
                let done = false;
                return () => {
                    if (done) return;
                    done = true;
                    if (!compassModule.classList.contains('expanded')) return;
                    if (window.showCompass) window.showCompass({ resetMap: false });
                    requestAnimationFrame(() => compassWheel.dispatchEvent(new Event('scroll')));
                };
            })();

            if (safeMap && typeof getWrappedWorldBounds === 'function') {
                window.hideCompass?.();
                safeMap.once('moveend', revealCompass);
                safeMap.flyToBounds(getWrappedWorldBounds(), {
                    animate: true,
                    duration: COMPASS_FLY_DURATION,
                    easeLinearity: 0.1
                });
                // Leaflet may skip moveend when the map is already at the target.
                window.setTimeout(
                    revealCompass,
                    Math.round(COMPASS_FLY_DURATION * 1000 + 350)
                );
            } else {
                revealCompass();
            }
        } else if (window.hideCompass) {
            window.hideCompass();
        }
    });
});


/* pass4: mobile side drawers no longer host autonomous location lists.
   They are populated only after a site is selected. */



// Archive submission link
(() => {
    const link = document.getElementById('archive-add-link');
    if (!link) return;
    link.addEventListener('click', () => {
        const lang = window.currentLang || 'zh';
        link.href = `archive-system.html?lang=${encodeURIComponent(lang)}`;
    });
})();
(() => {
    const syncArchiveSystemLinks = () => {
        const lang = window.currentLang || 'zh';
        document.querySelectorAll('#archive-add-link, #archive-add-link-fracture, #archive-add-link-fracture-vertical').forEach(link => {
            if (!link) return;
            link.href = `archive-system.html?lang=${encodeURIComponent(lang)}`;
        });
    };
    document.addEventListener('click', event => {
        const btn = event.target.closest('.index-inscription-lang-toggle, .bottom-stele-lang-option');
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();

        const targetLang = btn.dataset.lang || 'zh';
        const drawer = document.getElementById('index-drawer');
        const openAndSwitch = () => {
            if (typeof switchLanguage === 'function') switchLanguage(targetLang);
            window.setTimeout(() => {
                RuinFractureSystem?.syncIndexDrawerAdaptiveHeightThroughTransition?.();
                window.syncIndexInscriptionLanguageButtons?.();
            }, 40);
        };

        if (btn.classList.contains('bottom-stele-lang-option') && drawer && !drawer.classList.contains('open')) {
            if (typeof window.toggleIndexDrawerWithAnim === 'function') window.toggleIndexDrawerWithAnim();
            window.setTimeout(openAndSwitch, 24);
            return;
        }

        openAndSwitch();
    });
    window.syncIndexInscriptionLanguageButtons = function syncIndexInscriptionLanguageButtons() {
        const raw = String(window.currentLang || document.documentElement.lang || 'zh').toLowerCase();
        const active = raw.startsWith('ja') ? 'ja' : raw.startsWith('en') ? 'en' : 'zh';
        document.querySelectorAll('.index-inscription-lang-toggle, .bottom-stele-lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === active);
            btn.setAttribute('aria-pressed', btn.dataset.lang === active ? 'true' : 'false');
        });
        syncArchiveSystemLinks();
        const lexiconToggle = document.getElementById('index-lexicon-toggle');
        if (lexiconToggle) {
            const englishVisible = active === 'en' && !lexiconToggle.hidden;
            lexiconToggle.classList.toggle('active-key', englishVisible);
        }
        window.syncTitleLanguageWheel?.(active, { animate: false });
    };
    document.addEventListener('DOMContentLoaded', () => {
        syncArchiveSystemLinks();
        window.syncIndexInscriptionLanguageButtons?.();
    });
})();



/* v273 · fracture-aware Ruin Lexicology heading */
(() => {
'use strict';
const HOST_ID = 'index-stable-heading-fragments';
const READY_CLASS = 'stable-heading-rubbing-ready';
const X_PAD = 14;
const Y_PAD_TOP = 2;
const Y_PAD_BOTTOM = 2;
const STONE_EDGE_TEXT_CLEARANCE = 1.8;
const MIN_SEGMENT_PX = 18;
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');
function px(value, fallback = 0) { const n = parseFloat(value); return Number.isFinite(n) ? n : fallback; }
function fontDescriptor(style) { return `${style.fontStyle || 'normal'} ${style.fontWeight || '400'} ${style.fontSize || '13px'} ${style.fontFamily || 'sans-serif'}`; }
function textWidth(text, style) { measureCtx.font = style.canvasFont; return measureCtx.measureText(text).width + Math.max(0, text.length - 1) * style.letterSpacing; }
function captureStyle(el, kind) {
    const cs = getComputedStyle(el);
    const fontSize = px(cs.fontSize, kind === 'title' ? 18 : 11);
    const rawLineHeight = px(cs.lineHeight, fontSize * 1.5);
    const letterSpacing = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing, 0);
    const style = {
        fontFamily: cs.fontFamily,
        fontStyle: cs.fontStyle,
        fontWeight: cs.fontWeight,
        fontSize,
        lineHeight: Math.max(fontSize * 1.2, rawLineHeight),
        letterSpacing,
        color: cs.color,
        textAlign: 'center',
        opacity: px(cs.opacity, 1),
        canvasFont: ''
    };
    style.canvasFont = fontDescriptor({ fontStyle: style.fontStyle, fontWeight: style.fontWeight, fontSize: `${style.fontSize}px`, fontFamily: style.fontFamily });
    return style;
}
function fitText(text, start, maxWidth, style, lang) {
    let i = start;
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) return { text: '', next: text.length, done: true };
    let lo = 1, hi = text.length - i, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(i, i + mid);
        if (textWidth(candidate, style) <= maxWidth) { best = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    if (!best) return null;
    let cut = best;
    if (/^en\b/i.test(lang) && i + best < text.length) {
        const chunk = text.slice(i, i + best + 1);
        const lastSpace = Math.max(chunk.lastIndexOf(' '), chunk.lastIndexOf('\n'));
        if (lastSpace >= Math.max(3, Math.floor(best * 0.32))) cut = lastSpace;
    }
    let out = text.slice(i, i + cut).trimEnd();
    if (!out) { cut = best; out = text.slice(i, i + cut).trimEnd(); }
    let next = i + Math.max(1, cut);
    while (next < text.length && text[next] === ' ') next++;
    return { text: out, next, done: next >= text.length };
}
function fitChunk(text, start, maxWidth, style) {
    if (start >= text.length) return { text: '', next: start, width: 0 };
    let lo = 1, hi = text.length - start, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(start, start + mid);
        if (textWidth(candidate, style) <= maxWidth) { best = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    if (!best) return null;
    const out = text.slice(start, start + best);
    return { text: out, next: start + best, width: textWidth(out, style) };
}
function unionIntervals(intervals) {
    if (!intervals.length) return [];
    const ordered = intervals.filter(iv => iv[1] - iv[0] > 0.001).sort((a, b) => a[0] - b[0]);
    if (!ordered.length) return [];
    const merged = [ordered[0].slice()];
    for (let i = 1; i < ordered.length; i++) {
        const cur = ordered[i], prev = merged[merged.length - 1];
        if (cur[0] <= prev[1] + 0.01) prev[1] = Math.max(prev[1], cur[1]);
        else merged.push(cur.slice());
    }
    return merged;
}
function polygonIntervalsAtY(poly, y) {
    const xs = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        if (Math.abs(a.y - b.y) < 1e-6) continue;
        const crosses = (a.y <= y && b.y > y) || (b.y <= y && a.y > y);
        if (!crosses) continue;
        const t = (y - a.y) / (b.y - a.y);
        xs.push(a.x + (b.x - a.x) * t);
    }
    xs.sort((m, n) => m - n);
    const spans = [];
    for (let i = 0; i + 1 < xs.length; i += 2) spans.push([xs[i], xs[i + 1]]);
    return spans;
}
function stoneSegmentsAtZoneY(geom, drawerRect, zoneRect, yLocal, xPad = X_PAD) {
    if (!geom?.cells?.length || geom.width < 1 || geom.height < 1) return [];
    const sx = drawerRect.width / geom.width;
    const sy = drawerRect.height / geom.height;
    const drawerY = (zoneRect.top - drawerRect.top + yLocal) / sy;
    const zoneLeftInDrawer = (zoneRect.left - drawerRect.left) / sx;
    const zoneRightInDrawer = (zoneRect.right - drawerRect.left) / sx;
    const covered = [];
    geom.cells.forEach(cell => {
        polygonIntervalsAtY(cell.points, drawerY).forEach(([a, b]) => {
            const left = Math.max(a, zoneLeftInDrawer);
            const right = Math.min(b, zoneRightInDrawer);
            if (right <= left) return;
            covered.push([(left - zoneLeftInDrawer) * sx, (right - zoneLeftInDrawer) * sx]);
        });
    });
    const merged = unionIntervals(covered);
    const leftBound = xPad;
    const rightBound = zoneRect.width - xPad;
    return merged.map(([a, b]) => {
        const left = Math.max(leftBound, a + STONE_EDGE_TEXT_CLEARANCE);
        const right = Math.min(rightBound, b - STONE_EDGE_TEXT_CLEARANCE);
        return { left, right, width: right - left };
    }).filter(seg => seg.width >= MIN_SEGMENT_PX);
}
function makeEl(tag, className) { const el = document.createElement(tag); if (className) el.className = className; return el; }
function createChunk(parent, block, text, x, y, width) {
    if (!text) return;
    const el = makeEl('span', `index-interrupted-line index-interrupted-${block.kind}`);
    const st = block.style;
    el.textContent = text;
    el.style.left = `${x.toFixed(2)}px`;
    el.style.top = `${y.toFixed(2)}px`;
    el.style.width = `${Math.max(1, width).toFixed(2)}px`;
    el.style.fontFamily = st.fontFamily;
    el.style.fontSize = `${st.fontSize}px`;
    el.style.fontWeight = st.fontWeight;
    el.style.fontStyle = st.fontStyle;
    el.style.letterSpacing = `${st.letterSpacing}px`;
    el.style.lineHeight = `${st.lineHeight}px`;
    el.style.color = st.color;
    el.style.opacity = String(st.opacity);
    parent.appendChild(el);
}
function renderLineIntoSegments(parent, block, lineText, segments, y) {
    const st = block.style;
    const usable = segments.filter(seg => seg.width > 1);
    if (!usable.length) return { chunks: 0 };
    const totalWidth = usable.reduce((sum, seg) => sum + seg.width, 0);
    const actualWidth = Math.min(totalWidth, textWidth(lineText, st));
    let startOffset = Math.max(0, (totalWidth - actualWidth) * 0.5);
    let segIndex = 0, localSkip = startOffset;
    while (segIndex < usable.length && localSkip >= usable[segIndex].width) { localSkip -= usable[segIndex].width; segIndex++; }
    let cursor = 0, chunks = 0;
    while (segIndex < usable.length && cursor < lineText.length) {
        const seg = usable[segIndex];
        const x = seg.left + localSkip;
        const avail = seg.width - localSkip;
        const chunk = fitChunk(lineText, cursor, avail, st);
        if (chunk && chunk.text) {
            createChunk(parent, block, chunk.text, x, y, chunk.width);
            cursor = chunk.next;
            chunks++;
        }
        localSkip = 0; segIndex++;
    }
    return { chunks };
}
function scaleBlocks(blocks, scale) {
    return blocks.map(block => {
        const style = { ...block.style };
        style.fontSize = Math.max(block.kind === 'title' ? 12 : 9, style.fontSize * scale);
        style.lineHeight = Math.max(style.fontSize * 1.18, style.lineHeight * scale);
        style.letterSpacing = style.letterSpacing * Math.max(0.72, scale);
        style.canvasFont = fontDescriptor({ fontStyle: style.fontStyle, fontWeight: style.fontWeight, fontSize: `${style.fontSize}px`, fontFamily: style.fontFamily });
        return { ...block, style, gapAfter: block.gapAfter * scale };
    });
}
function getBlocks(root) {
    const specs = [
        ['title', '.archive-index-title', 6],
        ['intro', '.index-lexicology-intro', 0]
    ];
    return specs.map(([kind, selector, gapAfter]) => {
        const el = root.querySelector(selector);
        if (!el) return null;
        return {
            kind,
            text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
            style: captureStyle(el, kind),
            gapAfter
        };
    }).filter(Boolean);
}
function layout(host, blocks, geom, drawerRect, zoneRect, lang) {
    let y = Y_PAD_TOP;
    const bottomLimit = zoneRect.height - Y_PAD_BOTTOM;
    for (const block of blocks) {
        let offset = 0;
        let safety = 0;
        while (offset < block.text.length && safety++ < 600) {
            if (y + block.style.lineHeight > bottomLimit) return false;
            const scanY = y + block.style.lineHeight * 0.56;
            const segments = stoneSegmentsAtZoneY(geom, drawerRect, zoneRect, scanY);
            const totalWidth = segments.reduce((sum, seg) => sum + seg.width, 0);
            if (!segments.length || totalWidth < block.style.fontSize * 2.2) {
                y += block.style.lineHeight * 0.9;
                continue;
            }
            const fitted = fitText(block.text, offset, totalWidth, block.style, lang);
            if (!fitted || !fitted.text) { y += block.style.lineHeight * 0.9; continue; }
            const result = renderLineIntoSegments(host, block, fitted.text, segments, y);
            if (!result.chunks) { y += block.style.lineHeight * 0.9; continue; }
            offset = fitted.next;
            y += block.style.lineHeight;
        }
        y += block.gapAfter;
        if (y > bottomLimit) return false;
    }
    return true;
}
function install() {
    const drawer = document.getElementById('index-drawer');
    const zone = document.getElementById('index-stable-heading');
    const host = document.getElementById(HOST_ID);
    if (!drawer || !zone || !host) return;
    let raf = 0, timer = 0, generation = 0;
    const source = zone;
    function clearReady() {
        host.replaceChildren();
        zone.classList.remove(READY_CLASS);
    }
    function render() {
        raf = 0;
        const myGeneration = ++generation;
        const geom = window.__indexStoneFragmentGeometry;
        if (!geom?.cells?.length || isCompactViewport()) { clearReady(); return; }
        const drawerRect = drawer.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();
        if (drawerRect.width < 400 || zoneRect.width < 260 || zoneRect.height < 36) { clearReady(); return; }
        const lang = document.documentElement.lang || window.currentLang || 'zh-Hans';
        const baseBlocks = getBlocks(source);
        let success = false;
        for (const scale of [1, 0.97, 0.94, 0.91, 0.88]) {
            if (myGeneration !== generation) return;
            host.replaceChildren();
            const textLayer = makeEl('div', 'index-interrupted-text-layer');
            host.appendChild(textLayer);
            const ok = layout(textLayer, scaleBlocks(baseBlocks, scale), geom, drawerRect, zoneRect, lang);
            if (ok) { success = true; break; }
        }
        if (success) zone.classList.add(READY_CLASS); else clearReady();
    }
    function schedule(delay = 0) {
        clearTimeout(timer);
        if (delay > 0) { timer = window.setTimeout(() => schedule(0), delay); return; }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => requestAnimationFrame(render));
    }
    window.addEventListener('index-stone-geometry-ready', () => schedule(0));
    let deferredByCyberDecode = false;
    const mo = new MutationObserver(() => {
        if (window.__cyberDecodeActive) {
            deferredByCyberDecode = true;
            return;
        }
        schedule(160);
    });
    mo.observe(source, { subtree: true, childList: true, characterData: true });
    document.addEventListener('languagechange-complete', () => {
        if (!deferredByCyberDecode) return;
        deferredByCyberDecode = false;
        schedule(0);
    });
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => schedule(80));
        ro.observe(zone);
    } else {
        window.addEventListener('resize', () => schedule(120), { passive: true });
    }
    if (document.fonts?.ready) document.fonts.ready.then(() => schedule(0)).catch(() => {});
    document.addEventListener('DOMContentLoaded', () => schedule(0), { once: true });
    schedule(0);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
})();

/* v216 · epigraphic stone-block interrupted-line reflow
   --------------------------------------------------------------------------
   Legacy random-obstacle renderer retained for reference only. v266 replaces
   its synthetic crack geometry with the actual v265 stone-fragment negative
   space, so this old renderer is intentionally disabled to avoid duplicate
   observers/layout work.
   -------------------------------------------------------------------------- */
(() => {
'use strict';
const LEGACY_V216_RANDOM_REFLOW_DISABLED = true;
if (LEGACY_V216_RANDOM_REFLOW_DISABLED) return;

const NS = 'http://www.w3.org/2000/svg';
const X_PAD = 16;
const Y_PAD_TOP = 10;
const Y_PAD_BOTTOM = 8;
const CRACK_TEXT_GAP = 6;

function randomSeed() {
    try {
        const a = new Uint32Array(1);
        crypto.getRandomValues(a);
        return a[0] >>> 0;
    } catch (_) {
        return ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    }
}
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
const layoutSeed = randomSeed();

const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

function px(value, fallback = 0) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
}
function fontDescriptor(style) {
    return `${style.fontStyle || 'normal'} ${style.fontWeight || '400'} ${style.fontSize || '13px'} ${style.fontFamily || 'sans-serif'}`;
}
function textWidth(text, style) {
    measureCtx.font = style.canvasFont;
    const base = measureCtx.measureText(text).width;
    return base + Math.max(0, text.length - 1) * style.letterSpacing;
}
function captureStyle(el, kind) {
    const cs = getComputedStyle(el);
    const fontSize = px(cs.fontSize, kind === 'link' ? 11 : 13);
    const rawLineHeight = px(cs.lineHeight, fontSize * 1.56);
    const letterSpacing = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing, 0);
    const style = {
        fontFamily: cs.fontFamily,
        fontStyle: cs.fontStyle,
        fontWeight: cs.fontWeight,
        fontSize,
        lineHeight: Math.max(fontSize * 1.26, rawLineHeight),
        letterSpacing,
        color: cs.color,
        textAlign: cs.textAlign || 'left',
        opacity: px(cs.opacity, 1),
        canvasFont: ''
    };
    style.canvasFont = fontDescriptor({
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        fontSize: `${style.fontSize}px`,
        fontFamily: style.fontFamily
    });
    return style;
}
function getTextBlocks(source) {
    const specs = [
        ['intro', '[data-i18n="index_top_title"]', 12, 'center'],
        ['body', '[data-i18n="index_p1"]', 10, 'left'],
        ['body', '[data-i18n="index_p2"]', 12, 'left'],
        ['conclusion', '[data-i18n="index_conclusion"]', 8, 'center'],
        ['link', '.index-manifesto-link', 0, 'center']
    ];
    return specs.map(([kind, selector, gapAfter, align]) => {
        const el = source.querySelector(selector);
        if (!el) return null;
        const style = captureStyle(el, kind);
        style.textAlign = align;
        return {
            kind,
            text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
            style,
            gapAfter,
            href: kind === 'link' ? el.getAttribute('href') : null,
            noSplit: kind === 'link'
        };
    }).filter(Boolean);
}
function scaleBlocks(blocks, scale) {
    return blocks.map(block => {
        const style = { ...block.style };
        style.fontSize = Math.max(block.kind === 'link' ? 10 : 9, style.fontSize * scale);
        style.lineHeight = Math.max(style.fontSize * 1.24, style.lineHeight * scale);
        style.letterSpacing = style.letterSpacing * Math.max(0.72, scale);
        style.canvasFont = fontDescriptor({
            fontStyle: style.fontStyle,
            fontWeight: style.fontWeight,
            fontSize: `${style.fontSize}px`,
            fontFamily: style.fontFamily
        });
        return {
            ...block,
            style,
            gapAfter: block.gapAfter * scale
        };
    });
}
function fitText(text, start, maxWidth, style, lang, noSplit = false) {
    let i = start;
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) return { text: '', next: text.length, done: true };

    if (noSplit) {
        const rest = text.slice(i).trim();
        if (textWidth(rest, style) > maxWidth) return null;
        return { text: rest, next: text.length, done: true };
    }

    let lo = 1, hi = text.length - i, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(i, i + mid);
        if (textWidth(candidate, style) <= maxWidth) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    if (!best) return null;

    let cut = best;
    if (/^en\b/i.test(lang) && i + best < text.length) {
        const chunk = text.slice(i, i + best + 1);
        const lastSpace = Math.max(chunk.lastIndexOf(' '), chunk.lastIndexOf('\n'));
        if (lastSpace >= Math.max(3, Math.floor(best * 0.32))) cut = lastSpace;
    }

    let out = text.slice(i, i + cut).trimEnd();
    if (!out) {
        cut = best;
        out = text.slice(i, i + cut).trimEnd();
    }
    let next = i + Math.max(1, cut);
    while (next < text.length && text[next] === ' ') next++;
    return { text: out, next, done: next >= text.length };
}
function fitChunk(text, start, maxWidth, style) {
    if (start >= text.length) return { text: '', next: start, width: 0 };
    let lo = 1, hi = text.length - start, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(start, start + mid);
        if (textWidth(candidate, style) <= maxWidth) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    if (!best) return null;
    const out = text.slice(start, start + best);
    return { text: out, next: start + best, width: textWidth(out, style) };
}
function unionIntervals(intervals) {
    if (!intervals.length) return [];
    const ordered = intervals
        .filter(iv => iv[1] - iv[0] > 0.001)
        .sort((a, b) => a[0] - b[0]);
    if (!ordered.length) return [];
    const merged = [ordered[0].slice()];
    for (let i = 1; i < ordered.length; i++) {
        const cur = ordered[i];
        const prev = merged[merged.length - 1];
        if (cur[0] <= prev[1] + 0.01) prev[1] = Math.max(prev[1], cur[1]);
        else merged.push(cur.slice());
    }
    return merged;
}
function subtractIntervals(base, blockers) {
    const out = [];
    let cursor = base[0];
    blockers.forEach(([a, b]) => {
        if (b <= cursor || a >= base[1]) return;
        const left = Math.max(base[0], a);
        const right = Math.min(base[1], b);
        if (left > cursor + 0.01) out.push({ left: cursor, right: left, width: left - cursor });
        cursor = Math.max(cursor, right);
    });
    if (cursor < base[1] - 0.01) out.push({ left: cursor, right: base[1], width: base[1] - cursor });
    return out.filter(seg => seg.width > 0.5);
}
function polygonIntervalsAtY(poly, y) {
    const xs = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        if (Math.abs(a.y - b.y) < 1e-6) continue;
        const crosses = (a.y <= y && b.y > y) || (b.y <= y && a.y > y);
        if (!crosses) continue;
        const t = (y - a.y) / (b.y - a.y);
        xs.push(a.x + (b.x - a.x) * t);
    }
    xs.sort((m, n) => m - n);
    const spans = [];
    for (let i = 0; i + 1 < xs.length; i += 2) spans.push([xs[i], xs[i + 1]]);
    return spans;
}
function blockersAtY(polys, y) {
    const intervals = [];
    polys.forEach(poly => {
        polygonIntervalsAtY(poly, y).forEach(([a, b]) => {
            intervals.push([a - CRACK_TEXT_GAP, b + CRACK_TEXT_GAP]);
        });
    });
    return unionIntervals(intervals);
}
function makeEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
}
function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
}
function polygonPath(poly) {
    return poly.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z';
}
function polylinePath(points) {
    return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}
function point(x, y) { return { x, y }; }
function normalize(vx, vy) {
    const len = Math.hypot(vx, vy) || 1;
    return { x: vx / len, y: vy / len };
}
function vertexNormals(points) {
    return points.map((p, i) => {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(points.length - 1, i + 1)];
        const t = normalize(next.x - prev.x, next.y - prev.y);
        return { x: -t.y, y: t.x };
    });
}
function roughBandPolygon(points, widths, rand, rough = 2.1) {
    const normals = vertexNormals(points);
    const left = [];
    const right = [];
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const n = normals[i];
        const w = widths[Math.min(widths.length - 1, i)] * 0.5;
        const t = points.length <= 1 ? 0 : i / (points.length - 1);
        const taper = 0.38 + Math.sin(Math.PI * t) * 0.62;
        const jl = (rand() - 0.5) * rough * taper;
        const jr = (rand() - 0.5) * rough * taper;
        left.push({ x: p.x + n.x * (w + jl), y: p.y + n.y * (w + jl) });
        right.push({ x: p.x - n.x * (w + jr), y: p.y - n.y * (w + jr) });
    }
    return [...left, ...right.reverse()];
}
function generateDamageGeometry(w, h, rand) {
    /* v247 · stone-block drawer
       We no longer think in terms of 'drawing cracks on top'.
       Instead we generate a handful of large stone slabs and represent their
       junctions as negative seams. These seams become both the visible rubbing
       gaps and the blockers used to interrupt each text line. */

    const yTop = h * (0.19 + rand() * 0.035);
    const yHub = h * (0.47 + rand() * 0.035);
    const yBottom = h * (0.81 + rand() * 0.03);

    const leftShoulderX = w * (0.31 + rand() * 0.035);
    const rightShoulderX = w * (0.69 + rand() * 0.05);
    const hubX = w * (0.515 + (rand() - 0.5) * 0.04);
    const hubY = yHub;
    const lowerLeftX = w * (0.41 + rand() * 0.05);
    const lowerRightX = w * (0.69 + rand() * 0.05);
    const rightStemX = w * (0.90 + (rand() - 0.5) * 0.025);

    const topLeftPoints = [
        point(-18, yTop + h * (rand() - 0.5) * 0.014),
        point(w * (0.12 + rand() * 0.05), yTop - h * (0.012 + rand() * 0.016)),
        point(w * (0.22 + rand() * 0.04), yTop - h * (0.004 + rand() * 0.010)),
        point(leftShoulderX, yTop)
    ];
    const topLeftWidths = [10.8, 11.8, 12.4, 11.2].map(v => v + rand() * 1.4);

    const topRightPoints = [
        point(rightShoulderX, yTop),
        point(w * (0.79 + rand() * 0.04), yTop - h * (0.006 + rand() * 0.010)),
        point(w * (0.87 + rand() * 0.03), yTop - h * (0.002 + rand() * 0.008)),
        point(w + 18, yTop + h * (rand() - 0.5) * 0.012)
    ];
    const topRightWidths = [11.0, 12.2, 11.6, 10.7].map(v => v + rand() * 1.3);

    const leftToHubPoints = [
        point(leftShoulderX, yTop),
        point(w * (0.38 + rand() * 0.04), h * (0.29 + rand() * 0.03)),
        point(w * (0.44 + rand() * 0.03), h * (0.38 + rand() * 0.03)),
        point(hubX, hubY)
    ];
    const leftToHubWidths = [10.6, 12.0, 13.2, 12.4].map(v => v + rand() * 1.3);

    const rightToHubPoints = [
        point(rightShoulderX, yTop),
        point(w * (0.64 + rand() * 0.04), h * (0.30 + rand() * 0.03)),
        point(w * (0.58 + rand() * 0.03), h * (0.39 + rand() * 0.03)),
        point(hubX, hubY)
    ];
    const rightToHubWidths = [10.6, 11.8, 13.0, 12.0].map(v => v + rand() * 1.4);

    const hubToLowerLeftPoints = [
        point(hubX, hubY),
        point(w * (0.47 + rand() * 0.04), h * (0.60 + rand() * 0.04)),
        point(lowerLeftX, yBottom)
    ];
    const hubToLowerLeftWidths = [11.0, 12.2, 11.2].map(v => v + rand() * 1.2);

    const hubToLowerRightPoints = [
        point(hubX, hubY),
        point(w * (0.61 + rand() * 0.04), h * (0.60 + rand() * 0.04)),
        point(lowerRightX, yBottom)
    ];
    const hubToLowerRightWidths = [11.4, 12.0, 11.0].map(v => v + rand() * 1.2);

    const bottomLeftPoints = [
        point(-18, yBottom + h * (rand() - 0.5) * 0.012),
        point(w * (0.18 + rand() * 0.05), yBottom + h * (rand() - 0.5) * 0.016),
        point(w * (0.29 + rand() * 0.05), yBottom - h * (0.014 + rand() * 0.016)),
        point(lowerLeftX, yBottom)
    ];
    const bottomLeftWidths = [10.4, 11.2, 12.0, 11.2].map(v => v + rand() * 1.2);

    const bottomRightPoints = [
        point(lowerRightX, yBottom),
        point(w * (0.80 + rand() * 0.05), yBottom + h * (rand() - 0.5) * 0.016),
        point(rightStemX, yBottom + h * (0.010 + rand() * 0.018))
    ];
    const bottomRightWidths = [11.0, 11.4, 10.8].map(v => v + rand() * 1.2);

    const rightStemPoints = [
        point(rightStemX, yTop + h * 0.01),
        point(rightStemX - w * (0.006 + rand() * 0.005), h * (0.53 + rand() * 0.04)),
        point(rightStemX + w * (0.003 + rand() * 0.004), yBottom + h * (0.015 + rand() * 0.02)),
        point(rightStemX, h + 18)
    ];
    const rightStemWidths = [10.0, 11.4, 10.8, 9.8].map(v => v + rand() * 1.0);

    const centerlines = [
        topLeftPoints,
        topRightPoints,
        leftToHubPoints,
        rightToHubPoints,
        hubToLowerLeftPoints,
        hubToLowerRightPoints,
        bottomLeftPoints,
        bottomRightPoints,
        rightStemPoints
    ];

    const polys = [
        roughBandPolygon(topLeftPoints, topLeftWidths, rand, 0.85 + rand() * 0.42),
        roughBandPolygon(topRightPoints, topRightWidths, rand, 0.85 + rand() * 0.42),
        roughBandPolygon(leftToHubPoints, leftToHubWidths, rand, 0.92 + rand() * 0.48),
        roughBandPolygon(rightToHubPoints, rightToHubWidths, rand, 0.92 + rand() * 0.48),
        roughBandPolygon(hubToLowerLeftPoints, hubToLowerLeftWidths, rand, 0.88 + rand() * 0.44),
        roughBandPolygon(hubToLowerRightPoints, hubToLowerRightWidths, rand, 0.88 + rand() * 0.44),
        roughBandPolygon(bottomLeftPoints, bottomLeftWidths, rand, 0.82 + rand() * 0.40),
        roughBandPolygon(bottomRightPoints, bottomRightWidths, rand, 0.82 + rand() * 0.40),
        roughBandPolygon(rightStemPoints, rightStemWidths, rand, 0.86 + rand() * 0.36)
    ];

    // Small stone losses around the hub keep the seams from feeling too diagrammatic.
    if (rand() < 0.78) {
        const cx = hubX + w * ((rand() - 0.5) * 0.035);
        const cy = hubY + h * (0.10 + rand() * 0.10);
        polys.push([
            point(cx - 12, cy - 8),
            point(cx - 2, cy - 11),
            point(cx + 8, cy - 2),
            point(cx + 10, cy + 7),
            point(cx + 1, cy + 13),
            point(cx - 11, cy + 6)
        ]);
    }

    if (rand() < 0.52) {
        const cx = w * (0.44 + rand() * 0.10);
        const cy = h * (0.73 + rand() * 0.05);
        polys.push([
            point(cx - 9, cy - 6),
            point(cx + 3, cy - 7),
            point(cx + 11, cy + 0),
            point(cx + 5, cy + 8),
            point(cx - 7, cy + 7)
        ]);
    }

    return { polys, centerlines };
}
function createChunk(parent, block, text, x, y, width) {
    if (!text) return;
    const tag = block.kind === 'link' ? 'a' : 'span';
    const el = makeEl(tag, `index-interrupted-line index-interrupted-${block.kind}`);
    if (tag === 'a' && block.href) el.href = block.href;
    const st = block.style;
    el.textContent = text;
    el.style.left = `${x.toFixed(2)}px`;
    el.style.top = `${y.toFixed(2)}px`;
    el.style.width = `${Math.max(1, width).toFixed(2)}px`;
    el.style.fontFamily = st.fontFamily;
    el.style.fontSize = `${st.fontSize}px`;
    el.style.fontWeight = st.fontWeight;
    el.style.fontStyle = st.fontStyle;
    el.style.letterSpacing = `${st.letterSpacing}px`;
    el.style.lineHeight = `${st.lineHeight}px`;
    el.style.color = st.color;
    el.style.opacity = String(st.opacity);
    parent.appendChild(el);
}
function renderLineIntoSegments(parent, block, lineText, segments, y) {
    const st = block.style;
    const usable = segments.filter(seg => seg.width > 1);
    if (!usable.length) return;
    const totalWidth = usable.reduce((sum, seg) => sum + seg.width, 0);
    const actualWidth = Math.min(totalWidth, textWidth(lineText, st));
    let startOffset = 0;
    if (st.textAlign === 'center') startOffset = Math.max(0, (totalWidth - actualWidth) * 0.5);
    else if (st.textAlign === 'right') startOffset = Math.max(0, totalWidth - actualWidth);

    let segIndex = 0;
    let localSkip = startOffset;
    while (segIndex < usable.length && localSkip >= usable[segIndex].width) {
        localSkip -= usable[segIndex].width;
        segIndex++;
    }

    let cursor = 0;
    let remaining = lineText;
    while (segIndex < usable.length && cursor < lineText.length) {
        const seg = usable[segIndex];
        const x = seg.left + localSkip;
        const avail = seg.width - localSkip;
        const chunk = fitChunk(lineText, cursor, avail, st);
        if (chunk && chunk.text) {
            createChunk(parent, block, chunk.text, x, y, chunk.width);
            cursor = chunk.next;
        }
        localSkip = 0;
        segIndex++;
    }
}
function layoutInterruptedText(host, blocks, polys, w, h, lang) {
    let y = Y_PAD_TOP;
    const bottomLimit = h - Y_PAD_BOTTOM;

    for (const block of blocks) {
        let offset = 0;
        let safety = 0;
        while (offset < block.text.length && safety++ < 800) {
            const scanY = y + block.style.lineHeight * 0.56;
            if (y + block.style.lineHeight > bottomLimit) return false;
            const blockers = blockersAtY(polys, scanY);
            const segments = subtractIntervals([X_PAD, w - X_PAD], blockers)
                .filter(seg => seg.width >= (block.noSplit ? 88 : Math.max(26, block.style.fontSize * 1.65)));
            const totalWidth = segments.reduce((sum, seg) => sum + seg.width, 0);
            if (!segments.length || totalWidth < (block.noSplit ? textWidth(block.text.slice(offset).trim(), block.style) : block.style.fontSize * 2.4)) {
                y += block.style.lineHeight * 0.92;
                continue;
            }
            const fitted = fitText(block.text, offset, totalWidth, block.style, lang, block.noSplit);
            if (!fitted || !fitted.text) {
                y += block.style.lineHeight * 0.92;
                continue;
            }
            renderLineIntoSegments(host, block, fitted.text, segments, y);
            offset = fitted.next;
            y += block.style.lineHeight;
        }
        y += block.gapAfter;
        if (y > bottomLimit) return false;
    }
    return true;
}
function renderDamageOverlay(parent, geom, w, h) {
    const svg = svgEl('svg', {
        class: 'index-epigraphic-overlay',
        viewBox: `0 0 ${w} ${h}`,
        preserveAspectRatio: 'none',
        'aria-hidden': 'true'
    });
    geom.polys.forEach(poly => {
        const d = polygonPath(poly);
        svg.appendChild(svgEl('path', { d, class: 'index-epigraphic-gap-fill', fill: 'none' }));
        svg.appendChild(svgEl('path', { d, class: 'index-epigraphic-gap-edge', fill: 'none' }));
    });
    geom.centerlines.forEach((points, index) => {
        svg.appendChild(svgEl('path', {
            d: polylinePath(points),
            class: index === 0 ? 'index-epigraphic-seam index-epigraphic-seam-main' : 'index-epigraphic-seam',
            fill: 'none'
        }));
    });
    parent.appendChild(svg);
}
function clearHost(host) {
    host.innerHTML = '';
}
function install() {
    const zone = document.getElementById('index-fracture-zone');
    const source = document.getElementById('index-fracture-source');
    const host = document.getElementById('index-fracture-fragments');
    if (!zone || !source || !host) return;

    let renderRaf = 0;

    function cleanupState() {
        zone.classList.remove('is-interrupted-ready', 'is-fragmented', 'reflow-ready');
        clearHost(host);
        const drawer = document.getElementById('index-drawer');
        if (drawer) {
            drawer.classList.remove('fragment-title-ready');
            drawer.querySelectorAll('.index-fragment-title-piece').forEach(node => node.remove());
        }
        const oldLayer = document.getElementById('index-drawer-random-fracture-layer');
        if (oldLayer) oldLayer.remove();
    }

    function render() {
        renderRaf = 0;
        cleanupState();
        if (window.matchMedia('(max-width: 768px)').matches) return;

        const zr = zone.getBoundingClientRect();
        const w = zr.width;
        const h = zr.height;
        if (w < 260 || h < 140) return;

        const rand = mulberry32(layoutSeed ^ ((Math.round(w) * 131 + Math.round(h) * 17) >>> 0));
        const geom = generateDamageGeometry(w, h, rand);
        const baseBlocks = getTextBlocks(source);
        const lang = document.documentElement.lang || 'zh-Hans';

        let success = false;
        for (const scale of [1, 0.96, 0.92, 0.88, 0.84]) {
            clearHost(host);
            const textLayer = makeEl('div', 'index-interrupted-text-layer');
            host.appendChild(textLayer);
            const blocks = scaleBlocks(baseBlocks, scale);
            const ok = layoutInterruptedText(textLayer, blocks, geom.polys, w, h, lang);
            if (ok) {
                renderDamageOverlay(host, geom, w, h);
                success = true;
                zone.dataset.interruptedScale = scale.toFixed(2);
                break;
            }
            clearHost(host);
        }

        if (success) {
            zone.classList.add('is-interrupted-ready', 'is-fragmented', 'reflow-ready');
        } else {
            cleanupState();
        }
    }

    function scheduleRender() {
        cancelAnimationFrame(renderRaf);
        renderRaf = requestAnimationFrame(() => requestAnimationFrame(render));
    }

    let deferredByCyberDecode = false;
    const mo = new MutationObserver(() => {
        if (window.__cyberDecodeActive) {
            deferredByCyberDecode = true;
            return;
        }
        scheduleRender();
    });
    mo.observe(source, { subtree: true, childList: true, characterData: true });
    document.addEventListener('languagechange-complete', () => {
        if (!deferredByCyberDecode) return;
        deferredByCyberDecode = false;
        scheduleRender();
    });

    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(scheduleRender);
        ro.observe(zone);
    } else {
        window.addEventListener('resize', scheduleRender, { passive: true });
    }

    if (document.fonts?.ready) document.fonts.ready.then(scheduleRender).catch(() => {});
    scheduleRender();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
} else {
    install();
}
})();

// ============================================================================
// v268 · Index Drawer smoother stone + rubbing text reflow source geometry
// ----------------------------------------------------------------------------
// Goals of this pass:
// - abandon the hub/radial topology: each fracture splits ONE existing slab;
// - choose 1–4 fractures per page, so later breaks may terminate on older seams;
// - fracture edges are independently irregular and often nearly coincide;
// - seam width varies along the same break, creating dark/near-contact and
//   lighter/open sections like tightly reassembled stone;
// - edge mouths follow the ACTUAL incidence angle of each fracture, but the
//   rim is now weathered as a shallow rounded bevel instead of a pointed tooth;
// - top-edge mouths avoid the central title and prefer the two side bands;
// - mouth size / erosion style varies from small to occasional large worn bays;
// - mouth throat width is oriented perpendicular to the entering fracture, so
//   the opening flows into the seam without a geometric kink;
// - seams are opened a little more again to reveal rounded, rubbed fracture faces.
// Text interruption remains disabled for this stage.
// ============================================================================
(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const LAYER_ID = 'index-stone-fragment-layer';

    function hash32(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pageSeed(forceNew = false) {
        if (!forceNew && Number.isFinite(window.__indexStoneFragmentSeed)) return window.__indexStoneFragmentSeed >>> 0;
        try {
            const params = new URLSearchParams(location.search);
            // v268 · IMPORTANT: URLSearchParams#get() returns null when the key
            // is absent, and Number(null) === 0. v267 therefore accidentally
            // interpreted every normal URL as ?stone-seed=0, freezing the same
            // fracture on every reload. Only honor an explicit, non-empty seed.
            if (params.has('stone-seed')) {
                const rawSeed = (params.get('stone-seed') || '').trim();
                if (rawSeed !== '') {
                    const querySeed = Number(rawSeed);
                    if (Number.isFinite(querySeed) && querySeed >= 0) {
                        window.__indexStoneFragmentSeed = querySeed >>> 0;
                        return window.__indexStoneFragmentSeed;
                    }
                }
            }
        } catch (_) {}
        let seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        try {
            const u = new Uint32Array(2);
            crypto.getRandomValues(u);
            seed ^= u[0];
            seed ^= ((u[1] << 7) | (u[1] >>> 25)) >>> 0;
        } catch (_) {}
        seed ^= (Math.floor((performance.timeOrigin || 0)) >>> 0);
        seed ^= ((Math.floor((performance.now() || 0) * 1000) * 2654435761) >>> 0);
        window.__indexStoneFragmentSeed = seed >>> 0;
        return window.__indexStoneFragmentSeed;
    }

    let seed = pageSeed(true);

    function svgEl(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
        return el;
    }

    function cssNumber(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function v(x, y, outer = false) { return { x, y, outer }; }
    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
    function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
    function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
    function toward(a, b, dist) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: a.x + dx / l * dist, y: a.y + dy / l * dist };
    }
    function centroid(points) {
        let x = 0, y = 0;
        points.forEach(p => { x += p.x; y += p.y; });
        return { x: x / points.length, y: y / points.length };
    }
    function polygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const a = points[i], b = points[(i + 1) % points.length];
            area += a.x * b.y - b.x * a.y;
        }
        return area * 0.5;
    }
    function absArea(points) { return Math.abs(polygonArea(points)); }
    function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
    function unitVec(a) {
        const l = Math.hypot(a.x, a.y) || 1;
        return { x: a.x / l, y: a.y / l };
    }
    function dotVec(a, b) { return a.x * b.x + a.y * b.y; }
    function blendDir(a, b, t) {
        return unitVec({ x: a.x * (1 - t) + b.x * t, y: a.y * (1 - t) + b.y * t });
    }
    function smoothstep01(x) {
        x = clamp(x, 0, 1);
        return x * x * (3 - 2 * x);
    }
    function projectAlong(origin, dir, p) {
        return (p.x - origin.x) * dir.x + (p.y - origin.y) * dir.y;
    }
    function smoothChainInterior(points, passes = 1, blend = 0.20) {
        const out = points.map(p => ({ ...p }));
        for (let pass = 0; pass < passes; pass++) {
            for (let i = 1; i < out.length - 1; i++) {
                const prev = out[i - 1], cur = out[i], next = out[i + 1];
                out[i] = {
                    ...cur,
                    x: cur.x * (1 - blend * 2) + (prev.x + next.x) * blend,
                    y: cur.y * (1 - blend * 2) + (prev.y + next.y) * blend
                };
            }
        }
        return out;
    }

    function pathD(points) {
        // v258 · only INTERNAL fracture vertices can be softly rounded.
        // The true outer silhouette remains literal / faceted.  A tiny quadratic
        // radius on seam vertices suggests abrasion after broken slabs rubbed
        // against one another, without turning the stone into a soft blob.
        const n = points.length;
        if (n < 3) return '';

        const rounded = points.map((cur, i) => {
            const prev = points[(i - 1 + n) % n];
            const next = points[(i + 1) % n];
            const requested = ((cur.mouth && cur.rimWear) || (!cur.outer && (cur.seam || cur.mouth)))
                ? (cur.wear || 0)
                : 0;
            if (requested <= 0.05) return { round: false, cur };

            const lenPrev = distance(prev, cur);
            const lenNext = distance(cur, next);
            // v265 · rounded mouths and rubbed contact nodes need slightly more
            // local radius than ordinary seam points, otherwise the geometry is
            // technically worn but still reads as a kink. Keep the outer frame
            // literal, but allow mouth/junction/contact points to consume more
            // edge length and reveal the intended eroded trajectory.
            const roundLimit = cur.junction
                ? (cur.mouth ? 0.56 : 0.38)
                : cur.contact
                    ? 0.38
                    : cur.mouth
                        ? 0.44
                        : 0.22;
            const roundBias = cur.roundBias ?? 1;
            const r = Math.min(requested * roundBias, lenPrev * roundLimit, lenNext * roundLimit);
            if (r < 0.18) return { round: false, cur };

            return {
                round: true,
                cur,
                entry: toward(cur, prev, r),
                exit: toward(cur, next, r)
            };
        });

        const first = rounded[0];
        let d;
        if (first.round) {
            d = `M ${first.entry.x.toFixed(2)} ${first.entry.y.toFixed(2)} `;
            d += `Q ${first.cur.x.toFixed(2)} ${first.cur.y.toFixed(2)} ${first.exit.x.toFixed(2)} ${first.exit.y.toFixed(2)} `;
        } else {
            d = `M ${first.cur.x.toFixed(2)} ${first.cur.y.toFixed(2)} `;
        }

        for (let i = 1; i < n; i++) {
            const item = rounded[i];
            if (item.round) {
                d += `L ${item.entry.x.toFixed(2)} ${item.entry.y.toFixed(2)} `;
                d += `Q ${item.cur.x.toFixed(2)} ${item.cur.y.toFixed(2)} ${item.exit.x.toFixed(2)} ${item.exit.y.toFixed(2)} `;
            } else {
                d += `L ${item.cur.x.toFixed(2)} ${item.cur.y.toFixed(2)} `;
            }
        }
        return d + 'Z';
    }

    function lineSegmentIntersection(linePoint, dir, p, q) {
        const sx = q.x - p.x, sy = q.y - p.y;
        const denom = cross(dir.x, dir.y, sx, sy);
        if (Math.abs(denom) < 1e-8) return null;
        const rx = p.x - linePoint.x, ry = p.y - linePoint.y;
        const t = cross(rx, ry, sx, sy) / denom;
        const u = cross(rx, ry, dir.x, dir.y) / denom;
        if (u < -1e-6 || u > 1 + 1e-6) return null;
        return { x: linePoint.x + dir.x * t, y: linePoint.y + dir.y * t, t, u };
    }

    function linePolygonIntersections(poly, linePoint, dir) {
        const hits = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            const hit = lineSegmentIntersection(linePoint, dir, a, b);
            if (!hit) continue;
            const outerEdge = !!(a.outer && b.outer);
            // v264 · a later fracture can terminate on an older fracture face.
            // Keep that information: those junctions need their own rounded /
            // rubbed opening instead of behaving like an anonymous polygon edge.
            const seamEdge = !!((a.seam || a.mouth) && (b.seam || b.mouth));
            const existing = hits.find(h => Math.hypot(h.x - hit.x, h.y - hit.y) < 0.45);
            if (existing) {
                existing.outer = existing.outer && outerEdge;
                existing.seamEdge = existing.seamEdge || seamEdge;
                existing.edgeIndex = i;
                existing.u = hit.u;
                if (Math.abs(hit.t) < Math.abs(existing.t)) existing.t = hit.t;
                continue;
            }
            hits.push({
                x: hit.x, y: hit.y, t: hit.t, u: hit.u,
                edgeIndex: i,
                outer: outerEdge,
                seamEdge
            });
        }
        hits.sort((a, b) => a.t - b.t);
        return hits;
    }

    function buildArc(poly, startEdge, endEdge, startPoint, endPoint) {
        const out = [{ ...startPoint }];
        let i = (startEdge + 1) % poly.length;
        const stop = (endEdge + 1) % poly.length;
        let guard = 0;
        while (i !== stop && guard++ < poly.length + 2) {
            out.push({ ...poly[i] });
            i = (i + 1) % poly.length;
        }
        out.push({ ...endPoint });
        return out;
    }

    function edgeFrame(poly, hit) {
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        const dx = b.x - a.x, dy = b.y - a.y;
        const edgeLen = Math.hypot(dx, dy) || 1;
        const tangent = { x: dx / edgeLen, y: dy / edgeLen };
        const n1 = { x: -tangent.y, y: tangent.x };
        const n2 = { x: tangent.y, y: -tangent.x };
        const c = centroid(poly);
        const p1 = { x: hit.x + n1.x * 10, y: hit.y + n1.y * 10 };
        const p2 = { x: hit.x + n2.x * 10, y: hit.y + n2.y * 10 };
        const d1 = Math.hypot(p1.x - c.x, p1.y - c.y);
        const d2 = Math.hypot(p2.x - c.x, p2.y - c.y);
        return { tangent, inward: d1 < d2 ? n1 : n2, edgeLen, a, b };
    }

    function pointOnHitEdge(poly, hit, u, flags = null) {
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        const t = clamp(u, 0.018, 0.982);
        const result = {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            outer: !!hit.outer,
            edgeIndex: hit.edgeIndex,
            edgeU: t
        };
        if (flags) Object.assign(result, flags);
        return result;
    }

    // v261 · angle-aware, size-varied, eroded edge mouths.
    // The reference is not a repeated notch. Some mouths are tiny and almost
    // closed, some are medium scoops, and a minority are broader worn bays. The
    // two sides are allowed to weather differently, while every mouth still
    // turns into the actual fracture direction rather than the rim normal.
    function chooseMouthProfile(rand) {
        const r = rand();
        if (r < 0.46) {
            return {
                name: 'small',
                widthScale: 0.90 + rand() * 0.18,
                depthScale: 0.90 + rand() * 0.16,
                wearScale: 0.92 + rand() * 0.18,
                throatScale: 0.96 + rand() * 0.12,
                heavyChance: 0.18
            };
        }
        if (r < 0.82) {
            return {
                name: 'medium',
                widthScale: 1.18 + rand() * 0.28,
                depthScale: 1.02 + rand() * 0.22,
                wearScale: 1.12 + rand() * 0.24,
                throatScale: 1.10 + rand() * 0.18,
                heavyChance: 0.42
            };
        }
        return {
            name: 'large',
            widthScale: 1.58 + rand() * 0.42,
            depthScale: 1.18 + rand() * 0.30,
            wearScale: 1.34 + rand() * 0.34,
            throatScale: 1.24 + rand() * 0.24,
            heavyChance: 0.68
        };
    }

    function chooseMouthShape(rand, heavy) {
        const r = rand();
        if (heavy && r < 0.34) return 'worn-bay';
        if (r < 0.30) return 'soft-scoop';
        if (r < 0.58) return 'rounded-ledge';
        if (r < 0.82) return 'worn-bay';
        return 'plain-bevel';
    }

    function mouthSideChain(shoulder, throat, frame, entryDir, rand, opts = {}) {
        const sign = opts.sign || 1;
        const slowTaper = !!opts.slowTaper;
        const weathered = !!opts.weathered;
        const profile = opts.profile || { wearScale: 1, name: 'small' };
        const shape = opts.shape || 'soft-scoop';
        const wearScale = profile.wearScale || 1;
        const heavy = weathered && (profile.name === 'large' || rand() < (profile.heavyChance || 0));

        const pts = [{
            ...shoulder,
            mouth: true,
            rimWear: true,
            roundBias: 1.52 + rand() * 0.32,
            wear: (2.45 + rand() * 2.10) * wearScale
        }];

        const direct = unitVec({ x: throat.x - shoulder.x, y: throat.y - shoulder.y });
        const seamPull = blendDir(direct, entryDir, 0.66 + rand() * 0.14);
        const sideNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        const sidePolarity = dotVec(sideNormal, frame.tangent) * sign >= 0 ? 1 : -1;

        let baseTs;
        let scoopScale;
        if (shape === 'rounded-ledge') {
            baseTs = slowTaper ? [0.05, 0.11, 0.20, 0.33, 0.49, 0.66, 0.82] : [0.07, 0.15, 0.28, 0.46, 0.69, 0.84];
            scoopScale = heavy ? 1.74 : 1.26;
        } else if (shape === 'worn-bay') {
            baseTs = slowTaper ? [0.05, 0.12, 0.22, 0.37, 0.53, 0.69, 0.84] : [0.08, 0.18, 0.33, 0.52, 0.72, 0.86];
            scoopScale = heavy ? 2.32 : 1.64;
        } else if (shape === 'plain-bevel') {
            baseTs = slowTaper ? [0.08, 0.17, 0.31, 0.50, 0.72, 0.88] : [0.10, 0.23, 0.42, 0.66, 0.86];
            scoopScale = 0.84;
        } else {
            baseTs = slowTaper ? [0.06, 0.14, 0.25, 0.40, 0.58, 0.77, 0.88] : [0.08, 0.18, 0.32, 0.52, 0.74, 0.88];
            scoopScale = heavy ? 1.58 : 1.12;
        }

        const ts = baseTs
            .map((t, idx) => {
                const jitter = (shape === 'worn-bay' ? 0.052 : 0.036) * (idx === 0 || idx === baseTs.length - 1 ? 0.42 : 1);
                return clamp(t + (rand() - 0.5) * jitter, 0.045, 0.92);
            })
            .sort((a, b) => a - b);

        const interior = [];
        const primaryBend = rand() < 0.5 ? -1 : 1;
        const secondaryBend = rand() < 0.5 ? -primaryBend : primaryBend;
        ts.forEach((t, i) => {
            const easedT = smoothstep01(t);
            const base = lerp(shoulder, throat, t);
            const envelope = Math.sin(Math.PI * easedT);
            const shoulderEase = smoothstep01(clamp(t / 0.26, 0, 1));
            const throatEase = smoothstep01(clamp((1 - t) / 0.26, 0, 1));
            const neckBell = cosineBell(t, 0.17 + rand() * 0.03, 0.11 + rand() * 0.03);
            const bayBell = cosineBell(t, 0.42 + rand() * 0.07, 0.17 + rand() * 0.07);
            const lateBell = cosineBell(t, 0.65 + rand() * 0.06, 0.12 + rand() * 0.05);

            let scoop = envelope * (0.38 + rand() * 0.66) * scoopScale * wearScale;
            if (shape === 'rounded-ledge' && i <= 1) scoop *= 0.18 + rand() * 0.16;
            if (shape === 'worn-bay' && i === Math.floor(ts.length / 2)) scoop *= 1.18 + rand() * 0.22;
            scoop *= 0.52 + shoulderEase * 0.58;
            scoop *= 0.86 + (1 - throatEase) * 0.12;

            const neckPull = neckBell * (0.42 + rand() * (heavy ? 0.78 : 0.52)) * wearScale;
            const bayPush = bayBell * (0.28 + rand() * (heavy ? 1.08 : 0.74)) * wearScale;
            const latePush = lateBell * (0.10 + rand() * 0.42) * wearScale;
            scoop = Math.max(0.08, scoop - neckPull + bayPush + latePush);

            const roughnessGate = 0.16 + envelope * 0.84;
            const along = (rand() - 0.5) * (heavy ? 1.06 : 0.62) * wearScale * roughnessGate;
            const lateralAmplitude = (0.08 + bayBell * (heavy ? 0.42 : 0.28) + lateBell * 0.16) * (0.72 + rand() * 0.70);
            const lateral = sidePolarity * ((i % 2 === 0 ? primaryBend : secondaryBend) * lateralAmplitude + (rand() - 0.5) * 0.16) * (0.35 + envelope * 0.65);
            const tangentWave = ((i % 2 === 0 ? -1 : 1) * (0.05 + bayBell * 0.20) + (rand() - 0.5) * 0.08) * sign * sidePolarity;
            const tangentSlide = frame.tangent.x ? tangentWave : tangentWave;

            interior.push({
                x: base.x + frame.inward.x * scoop + seamPull.x * along + sideNormal.x * lateral + frame.tangent.x * tangentSlide,
                y: base.y + frame.inward.y * scoop + seamPull.y * along + sideNormal.y * lateral + frame.tangent.y * tangentSlide,
                outer: false,
                mouth: true,
                seam: true,
                rimWear: t < 0.18,
                roundBias: t < 0.22 || t > 0.70 ? 1.24 + rand() * 0.18 : 1.08 + rand() * 0.14,
                wear: (2.55 + rand() * 2.05 + (slowTaper ? 0.52 : 0) + (heavy ? 0.96 : 0) + bayBell * 0.85) * wearScale
            });
        });

        if ((shape === 'worn-bay' || heavy) && rand() < (heavy ? 0.82 : 0.48)) {
            const t = 0.48 + rand() * 0.20;
            const base = lerp(shoulder, throat, t);
            interior.push({
                x: base.x + frame.inward.x * (1.10 + rand() * (heavy ? 2.25 : 1.15)) * wearScale + frame.tangent.x * sign * (rand() - 0.5) * 0.50,
                y: base.y + frame.inward.y * (1.10 + rand() * (heavy ? 2.25 : 1.15)) * wearScale + frame.tangent.y * sign * (rand() - 0.5) * 0.50,
                outer: false,
                mouth: true,
                seam: true,
                roundBias: 1.18 + rand() * 0.14,
                wear: (3.10 + rand() * 2.20) * wearScale
            });
        }

        interior.sort((a, b) => projectAlong(shoulder, direct, a) - projectAlong(shoulder, direct, b));
        for (let i = 1; i < interior.length; i++) {
            const prevProj = projectAlong(shoulder, direct, interior[i - 1]);
            const proj = projectAlong(shoulder, direct, interior[i]);
            const minStep = 0.24 + Math.min(0.34, i * 0.024);
            if (proj < prevProj + minStep) {
                const push = prevProj + minStep - proj;
                interior[i].x += direct.x * push;
                interior[i].y += direct.y * push;
            }
        }
        const smoothed = smoothChainInterior(interior, heavy ? 2 : 1, heavy ? 0.16 : 0.13);
        pts.push(...smoothed);

        pts.push({
            ...throat,
            outer: false,
            mouth: true,
            seam: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.10 + rand() * 1.85 + (heavy ? 0.72 : 0)) * wearScale
        });
        return pts;
    }


    function chooseJunctionWearProfile(rand) {
        const r = rand();
        if (r < 0.46) return { name: 'small', side: 5.4 + rand() * 3.6, run: 6.6 + rand() * 4.2, throat: 1.30 + rand() * 0.92, wear: 1.08 + rand() * 0.30 };
        if (r < 0.84) return { name: 'medium', side: 7.8 + rand() * 4.6, run: 9.2 + rand() * 5.5, throat: 1.82 + rand() * 1.36, wear: 1.28 + rand() * 0.40 };
        return { name: 'large', side: 10.8 + rand() * 6.0, run: 12.6 + rand() * 6.5, throat: 2.30 + rand() * 1.76, wear: 1.50 + rand() * 0.56 };
    }

    function buildJunctionMouth(poly, hit, rand, approachDir) {
        // A secondary crack meeting an existing fracture is a rubbed stone
        // junction, not a mathematically sharp T/Y node. We shave a short,
        // unequal section from the older seam and let the new fracture emerge
        // from a rounded pocket. Size varies per junction so the wear reads as
        // accumulated handling / rocking rather than a repeated UI motif.
        const frame = edgeFrame(poly, hit);
        const profile = chooseJunctionWearProfile(rand);
        let incoming = unitVec(approachDir || frame.inward);
        if (dotVec(incoming, frame.inward) < 0) incoming = { x: -incoming.x, y: -incoming.y };
        // v265 · contact nodes should look rubbed, not snapped. Blend a little
        // more toward the host seam's inward normal so the new branch peels out
        // of a shallow worn pocket instead of leaving a hard angular hinge.
        const entryDir = blendDir(incoming, frame.inward, 0.22 + rand() * 0.16);

        const edgeAvailBefore = hit.u * frame.edgeLen;
        const edgeAvailAfter = (1 - hit.u) * frame.edgeLen;
        if (edgeAvailBefore < 4.0 || edgeAvailAfter < 4.0) return null;

        let beforePx = profile.side * (0.82 + rand() * 0.54);
        let afterPx = profile.side * (0.82 + rand() * 0.54);
        // Unequal wear is important: one fragment often rounds farther than its
        // neighbour after repeated contact.
        if (rand() < 0.5) beforePx *= 1.15 + rand() * 0.32;
        else afterPx *= 1.15 + rand() * 0.32;
        beforePx = Math.min(beforePx, edgeAvailBefore * 0.58);
        afterPx = Math.min(afterPx, edgeAvailAfter * 0.58);

        const beforeU = hit.u - beforePx / frame.edgeLen;
        const afterU = hit.u + afterPx / frame.edgeLen;
        const shoulderBefore = pointOnHitEdge(poly, hit, beforeU, {
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.50 + rand() * 0.26,
            wear: (3.15 + rand() * 2.75) * profile.wear
        });
        const shoulderAfter = pointOnHitEdge(poly, hit, afterU, {
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.50 + rand() * 0.26,
            wear: (3.15 + rand() * 2.75) * profile.wear
        });

        const run = profile.run * (0.96 + rand() * 0.30);
        const throatCenter = {
            x: hit.x + entryDir.x * run,
            y: hit.y + entryDir.y * run,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.20,
            wear: (3.65 + rand() * 2.85) * profile.wear
        };
        let seamNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        if (dotVec(seamNormal, frame.tangent) < 0) seamNormal = { x: -seamNormal.x, y: -seamNormal.y };
        const throatHalf = profile.throat * (1.08 + rand() * 0.18);
        const throatBefore = {
            x: throatCenter.x - seamNormal.x * throatHalf,
            y: throatCenter.y - seamNormal.y * throatHalf,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.85 + rand() * 2.95) * profile.wear
        };
        const throatAfter = {
            x: throatCenter.x + seamNormal.x * throatHalf,
            y: throatCenter.y + seamNormal.y * throatHalf,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.85 + rand() * 2.95) * profile.wear
        };

        // Use the existing mouth curve builder, but with a compact custom
        // profile. One side can be visibly more worn than the other.
        const pseudoProfile = {
            name: profile.name === 'large' ? 'large' : 'medium',
            widthScale: 1,
            depthScale: 1,
            throatScale: 1,
            wearScale: profile.wear * (1.02 + rand() * 0.10),
            heavyChance: profile.name === 'large' ? 0.66 : 0.36
        };
        const weatheredSide = rand() < 0.5 ? 'before' : 'after';
        const beforeChain = mouthSideChain(shoulderBefore, throatBefore, frame, entryDir, rand, {
            sign: -1,
            slowTaper: profile.name !== 'small' && rand() < 0.56,
            weathered: weatheredSide === 'before',
            profile: pseudoProfile,
            shape: weatheredSide === 'before' && rand() < 0.58 ? 'worn-bay' : 'soft-scoop'
        }).map(p => ({ ...p, junction: true }));
        const afterChain = mouthSideChain(shoulderAfter, throatAfter, frame, entryDir, rand, {
            sign: 1,
            slowTaper: profile.name === 'large' || rand() < 0.42,
            weathered: weatheredSide === 'after',
            profile: pseudoProfile,
            shape: weatheredSide === 'after' && rand() < 0.58 ? 'worn-bay' : 'rounded-ledge'
        }).map(p => ({ ...p, junction: true }));

        return {
            hasMouth: true,
            isJunction: true,
            shoulderBefore, shoulderAfter,
            throatBefore, throatAfter, throatCenter,
            beforeChain, afterChain,
            entryDir,
            junctionProfile: profile.name
        };
    }

    function buildEdgeMouth(poly, hit, rand, approachDir) {
        const rawApproach = unitVec(approachDir || { x: 0, y: 1 });
        if (!hit.outer) {
            // v264 · when a new branch lands on an older seam, carve a rounded
            // variable-size contact pocket at the junction. Only fall back to a
            // point hit for non-seam internal edges.
            if (hit.seamEdge) {
                const junction = buildJunctionMouth(poly, hit, rand, rawApproach);
                if (junction) return junction;
            }
            const p = { x: hit.x, y: hit.y, outer: false, seam: true, mouth: false, wear: 1.9 };
            return {
                hasMouth: false,
                shoulderBefore: p,
                shoulderAfter: p,
                throatBefore: p,
                throatAfter: p,
                throatCenter: p,
                beforeChain: [p],
                afterChain: [p],
                entryDir: rawApproach
            };
        }

        const frame = edgeFrame(poly, hit);
        if (hit.u < 0.075 || hit.u > 0.925) return null;

        let incoming = rawApproach;
        if (dotVec(incoming, frame.inward) < 0) incoming = { x: -incoming.x, y: -incoming.y };
        const incidence = clamp(dotVec(incoming, frame.inward), 0.16, 1);
        const entryDir = blendDir(incoming, frame.inward, incidence < 0.34 ? 0.18 : 0.035);
        const tangentIncidence = dotVec(entryDir, frame.tangent);

        const profile = chooseMouthProfile(rand);
        const slowTaper = rand() < (profile.name === 'large' ? 0.72 : profile.name === 'medium' ? 0.60 : 0.48);
        const weatheredSide = rand() < 0.5 ? 'before' : 'after';
        const heavyBefore = weatheredSide === 'before' && rand() < profile.heavyChance;
        const heavyAfter = weatheredSide === 'after' && rand() < profile.heavyChance;
        const beforeShape = chooseMouthShape(rand, heavyBefore);
        let afterShape = chooseMouthShape(rand, heavyAfter);
        if (afterShape === beforeShape && rand() < 0.62) afterShape = chooseMouthShape(rand, heavyAfter);

        // Variable mouth scale: most are modest; some refreshes contain one of
        // the broader, more weathered openings visible in the reference.
        const glancing = 1 - incidence;
        const base = (4.2 + glancing * 2.3 + rand() * 1.8) * profile.widthScale;
        let beforePx = base * (0.80 + rand() * 0.34);
        let afterPx = base * (0.80 + rand() * 0.34);
        if (tangentIncidence > 0.08) afterPx *= 1 + Math.min(0.34, tangentIncidence * 0.42);
        if (tangentIncidence < -0.08) beforePx *= 1 + Math.min(0.34, -tangentIncidence * 0.42);
        if (weatheredSide === 'before') beforePx *= 1.10 + rand() * 0.22;
        else afterPx *= 1.10 + rand() * 0.22;

        const maxMouthSide = profile.name === 'large' ? 19.5 : profile.name === 'medium' ? 15.2 : 11.0;
        beforePx = clamp(beforePx, 3.6, maxMouthSide);
        afterPx = clamp(afterPx, 3.6, maxMouthSide);

        const beforeU = hit.u - beforePx / frame.edgeLen;
        const afterU = hit.u + afterPx / frame.edgeLen;
        if (beforeU <= 0.025 || afterU >= 0.975) return null;

        const shoulderBefore = pointOnHitEdge(poly, hit, beforeU);
        const shoulderAfter = pointOnHitEdge(poly, hit, afterU);

        const baseDepth = slowTaper ? (12.6 + rand() * 8.8) : (9.4 + rand() * 6.4);
        const desiredInwardDepth = baseDepth * profile.depthScale;
        const run = clamp(
            desiredInwardDepth / Math.max(0.38, dotVec(entryDir, frame.inward)),
            8.0,
            (slowTaper ? 29.0 : 21.8) * profile.depthScale
        );
        const throatCenter = {
            x: hit.x + entryDir.x * run + frame.tangent.x * (rand() - 0.5) * (profile.name === 'large' ? 1.6 : 1.0),
            y: hit.y + entryDir.y * run + frame.tangent.y * (rand() - 0.5) * (profile.name === 'large' ? 1.6 : 1.0),
            outer: false,
            mouth: true,
            seam: true,
            wear: 2.7 * profile.wearScale
        };

        let seamNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        if (dotVec(seamNormal, frame.tangent) < 0) seamNormal = { x: -seamNormal.x, y: -seamNormal.y };

        // Wider throat than v260. Large mouths also feed a visibly broader seam,
        // giving the quadratic abrasion enough physical space to show.
        const throatBase = slowTaper ? (1.58 + rand() * 1.02) : (1.34 + rand() * 0.88);
        const throatHalf = throatBase * profile.throatScale;
        const throatBefore = {
            x: throatCenter.x - seamNormal.x * throatHalf,
            y: throatCenter.y - seamNormal.y * throatHalf,
            outer: false, mouth: true, seam: true, wear: 2.8 * profile.wearScale
        };
        const throatAfter = {
            x: throatCenter.x + seamNormal.x * throatHalf,
            y: throatCenter.y + seamNormal.y * throatHalf,
            outer: false, mouth: true, seam: true, wear: 2.8 * profile.wearScale
        };

        const beforeChain = mouthSideChain(shoulderBefore, throatBefore, frame, entryDir, rand, {
            sign: -1,
            slowTaper,
            weathered: weatheredSide === 'before',
            profile,
            shape: beforeShape
        });
        const afterChain = mouthSideChain(shoulderAfter, throatAfter, frame, entryDir, rand, {
            sign: 1,
            slowTaper,
            weathered: weatheredSide === 'after',
            profile,
            shape: afterShape
        });

        return {
            hasMouth: true,
            shoulderBefore, shoulderAfter,
            throatBefore, throatAfter, throatCenter,
            beforeChain, afterChain,
            weatheredSide,
            slowTaper,
            entryDir,
            incidence,
            mouthProfile: profile.name,
            beforeShape,
            afterShape
        };
    }


    function buildFractureCenterline(start, end, rand, startEntryDir, endEntryDir) {
        const dx = end.x - start.x, dy = end.y - start.y;
        const l = Math.hypot(dx, dy) || 1;
        const ux = dx / l, uy = dy / l;
        const nx = -uy, ny = ux;
        const segments = clamp(Math.round(l / 72), 7, 14);
        const pts = [{ ...start, seam: true }];

        const startHint = unitVec(startEntryDir || { x: ux, y: uy });
        const endHintInward = unitVec(endEntryDir || { x: -ux, y: -uy });
        const mouthGuide = Math.min(24, Math.max(12, l * 0.055));

        if (segments >= 5) {
            pts.push({
                x: start.x + startHint.x * mouthGuide + nx * (rand() - 0.5) * 1.2,
                y: start.y + startHint.y * mouthGuide + ny * (rand() - 0.5) * 1.2,
                outer: false,
                seam: true
            });
        }

        let drift = 0;
        const firstI = segments >= 5 ? 2 : 1;
        for (let i = firstI; i < segments - 1; i++) {
            const t = i / segments;
            drift += (rand() - 0.5) * 4.2;
            const maxDrift = Math.min(10.5, 3.0 + l * 0.0105);
            drift = clamp(drift, -maxDrift, maxDrift);
            let kink = 0;
            if (rand() < 0.30) kink = (rand() < 0.5 ? -1 : 1) * (1.1 + rand() * 3.5);
            pts.push({
                x: start.x + dx * t + nx * (drift + kink),
                y: start.y + dy * t + ny * (drift + kink),
                outer: false,
                seam: true
            });
        }

        if (segments >= 5) {
            pts.push({
                x: end.x + endHintInward.x * mouthGuide + nx * (rand() - 0.5) * 1.2,
                y: end.y + endHintInward.y * mouthGuide + ny * (rand() - 0.5) * 1.2,
                outer: false,
                seam: true
            });
        }
        pts.push({ ...end, seam: true });
        return pts;
    }


    function localNormal(points, i) {
        const a = points[Math.max(0, i - 1)];
        const b = points[Math.min(points.length - 1, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: -dy / l, y: dx / l, tx: dx / l, ty: dy / l };
    }

    function seamSideSignFromEndpoint(centerline, endpoint, atStart = true) {
        // v263 · derive the retreat side from the ACTUAL mouth throat geometry.
        // v261 hard-coded +1/-1 here. That assumption fails when a fracture's
        // line direction is reversed by the intersection ordering: both slab
        // boundaries can then be displaced toward the same side and visually
        // overlap, leaving only a faint doubled line instead of negative space.
        const i = atStart ? 0 : centerline.length - 1;
        const c = centerline[i];
        const n = localNormal(centerline, i);
        const vx = endpoint.x - c.x;
        const vy = endpoint.y - c.y;
        const d = vx * n.x + vy * n.y;
        if (Math.abs(d) > 0.05) return d >= 0 ? 1 : -1;

        // Extremely narrow mouths can be numerically almost centered. Sample
        // the neighbouring centerline segment as a fallback rather than making
        // the old global-direction assumption again.
        const j = atStart ? Math.min(1, centerline.length - 1) : Math.max(0, centerline.length - 2);
        const c2 = centerline[j];
        const n2 = localNormal(centerline, j);
        const d2 = (endpoint.x - c2.x) * n2.x + (endpoint.y - c2.y) * n2.y;
        return d2 >= 0 ? 1 : -1;
    }

    function seamSidesAreSeparated(centerline, sideA, sideB) {
        if (!centerline.length || !sideA.length || !sideB.length) return false;
        const probes = [
            Math.max(1, Math.floor((centerline.length - 1) * 0.30)),
            Math.max(1, Math.floor((centerline.length - 1) * 0.50)),
            Math.max(1, Math.floor((centerline.length - 1) * 0.70))
        ];
        let opposite = 0;
        let tested = 0;
        for (const i0 of probes) {
            const i = Math.min(centerline.length - 2, i0);
            if (i <= 0 || i >= sideA.length - 1 || i >= sideB.length - 1) continue;
            const c = centerline[i];
            const n = localNormal(centerline, i);
            const da = (sideA[i].x - c.x) * n.x + (sideA[i].y - c.y) * n.y;
            const db = (sideB[i].x - c.x) * n.x + (sideB[i].y - c.y) * n.y;
            if (Math.abs(da) < 0.03 || Math.abs(db) < 0.03) continue;
            tested++;
            if (da * db < 0) opposite++;
        }
        return tested === 0 || opposite >= Math.ceil(tested * 0.67);
    }

    function cosineBell(t, center, radius) {
        const d = Math.abs(t - center);
        if (d >= radius) return 0;
        const x = d / radius;
        return 0.5 + 0.5 * Math.cos(Math.PI * x);
    }

    function buildSeamGapPlan(count, rand) {
        const widths = new Array(count).fill(0);
        const contact = new Array(count).fill(0);
        const openBoost = new Array(count).fill(0);
        const n = Math.max(1, count - 1);

        let state = 1.00 + rand() * 0.92;
        for (let i = 0; i < count; i++) {
            state = clamp(state * 0.60 + (0.70 + rand() * 1.95) * 0.40, 0.60, 2.9);
            widths[i] = state;
        }

        const bayCount = rand() < 0.56 ? 2 : 1;
        for (let b = 0; b < bayCount; b++) {
            const center = 0.22 + rand() * 0.56;
            const radius = 0.10 + rand() * 0.14;
            const amp = 0.92 + rand() * 1.85;
            for (let i = 1; i < count - 1; i++) {
                const t = i / n;
                const bell = cosineBell(t, center, radius);
                openBoost[i] += bell * amp;
                widths[i] += bell * amp;
            }
        }

        const mouthPinchSeeds = [];
        if (count >= 7) {
            mouthPinchSeeds.push(clamp(1 + Math.round(rand() * 2), 1, count - 3));
            if (count >= 9) mouthPinchSeeds.push(clamp(count - 2 - Math.round(rand() * 2), 2, count - 2));
        }
        mouthPinchSeeds.forEach((idx, order) => {
            const shouldApply = order === 0 ? true : rand() < 0.78;
            if (!shouldApply) return;
            contact[idx] = Math.max(contact[idx], 0.94);
            widths[idx] = Math.min(widths[idx], 0.055 + rand() * 0.11);
            const shoulder = idx + (idx < count / 2 ? 1 : -1);
            if (shoulder > 0 && shoulder < count - 1) {
                contact[shoulder] = Math.max(contact[shoulder], 0.52);
                widths[shoulder] = Math.min(widths[shoulder], 0.22 + rand() * 0.18);
            }
            const openIdx = idx + (idx < count / 2 ? 2 : -2);
            if (openIdx > 0 && openIdx < count - 1) {
                const openAmp = 0.72 + rand() * 1.18;
                widths[openIdx] += openAmp;
                openBoost[openIdx] += openAmp;
            }
        });

        const maxContacts = count >= 12 ? 3 : count >= 8 ? 2 : 1;
        const contactCount = 1 + Math.floor(rand() * maxContacts);
        const chosen = [];
        let guard = 0;
        while (chosen.length < contactCount && guard++ < 30) {
            const idx = clamp(Math.round((0.22 + rand() * 0.56) * n), 2, count - 3);
            if (chosen.every(v => Math.abs(v - idx) >= 2)) chosen.push(idx);
        }
        if (!chosen.length && count > 4) chosen.push(Math.floor(count / 2));

        chosen.forEach(idx => {
            contact[idx] = Math.max(contact[idx], 1);
            widths[idx] = Math.min(widths[idx], 0.030 + rand() * 0.075);
            if (idx - 1 > 0) {
                contact[idx - 1] = Math.max(contact[idx - 1], 0.68);
                widths[idx - 1] = Math.min(widths[idx - 1], 0.22 + rand() * 0.22);
            }
            if (idx + 1 < count - 1) {
                contact[idx + 1] = Math.max(contact[idx + 1], 0.68);
                widths[idx + 1] = Math.min(widths[idx + 1], 0.22 + rand() * 0.22);
            }
            if (idx - 2 > 0 && rand() < 0.72) {
                contact[idx - 2] = Math.max(contact[idx - 2], 0.32);
                widths[idx - 2] *= 0.44 + rand() * 0.18;
            }
            if (idx + 2 < count - 1 && rand() < 0.72) {
                contact[idx + 2] = Math.max(contact[idx + 2], 0.32);
                widths[idx + 2] *= 0.44 + rand() * 0.18;
            }
        });

        if (count) {
            widths[0] *= 0.48;
            widths[count - 1] *= 0.48;
        }
        return { widths, contact, openBoost, contactIndices: chosen };
    }


    function buildSeamSide(centerline, sideSign, rand, startPoint, endPoint, gapPlan, sideIdentity = 0) {
        const plan = gapPlan || buildSeamGapPlan(centerline.length, rand);
        const widths = plan.widths;
        const contacts = plan.contact || [];
        const out = [];
        const abrasionMode = rand() < 0.90;
        const abrasionStrength = 0.58 + rand() * 0.78;
        const nCount = Math.max(1, centerline.length - 1);
        // Keep each face independent, but only modestly so shared contact points
        // actually meet rather than being destroyed by unrelated randomness.
        const faceBias = sideIdentity === 0 ? (0.90 + rand() * 0.18) : (0.86 + rand() * 0.24);

        for (let i = 0; i < centerline.length; i++) {
            if (i === 0) {
                out.push({ ...startPoint, outer: false, seam: true, wear: 1.65 + rand() * 1.15 });
                continue;
            }
            if (i === centerline.length - 1) {
                out.push({ ...endPoint, outer: false, seam: true, wear: 1.65 + rand() * 1.15 });
                continue;
            }

            const p = centerline[i];
            const n = localNormal(centerline, i);
            const t = i / nCount;
            const edgeProximity = Math.pow(clamp(1 - Math.min(t, 1 - t) / 0.34, 0, 1), 1.35);
            const contactness = contacts[i] || 0;
            const contactGuard = 1 - contactness * 0.965;
            const localWear = abrasionMode
                ? edgeProximity * abrasionStrength * (0.82 + rand() * 0.74) * contactGuard
                : 0;

            let asym = faceBias * (0.86 + rand() * 0.24);
            if (contactness > 0.55) asym = 0.95 + rand() * 0.06;
            const rubbed = contactness > 0.22;
            const off = Math.min(6.1, widths[i] * asym + localWear);
            const tangential = (rand() - 0.5) * (0.34 + edgeProximity * 0.24) * (1 - contactness * 0.78);
            out.push({
                x: p.x + n.x * off * sideSign + n.tx * tangential,
                y: p.y + n.y * off * sideSign + n.ty * tangential,
                outer: false,
                seam: true,
                contact: rubbed,
                roundBias: rubbed ? (1.12 + rand() * 0.18) : undefined,
                wear: contactness > 0.55
                    ? (1.24 + rand() * 1.02)
                    : rubbed
                        ? (1.58 + rand() * 1.18 + (plan.openBoost?.[i] || 0) * 0.18)
                        : (1.75 + rand() * 1.32 + edgeProximity * (1.36 + rand() * 1.66) + (plan.openBoost?.[i] || 0) * 0.54)
            });
        }
        return out;
    }


    function splitPolygonByFracture(poly, linePoint, dir, rand) {
        const hits = linePolygonIntersections(poly, linePoint, dir);
        if (hits.length < 2) return null;
        const first = hits[0], last = hits[hits.length - 1];
        if (distance(first, last) < 110) return null;

        const firstApproach = unitVec(dir);
        const lastApproach = { x: -firstApproach.x, y: -firstApproach.y };
        const firstMouth = buildEdgeMouth(poly, first, rand, firstApproach);
        const lastMouth = buildEdgeMouth(poly, last, rand, lastApproach);
        if (!firstMouth || !lastMouth) return null;

        const center = buildFractureCenterline(
            firstMouth.throatCenter,
            lastMouth.throatCenter,
            rand,
            firstMouth.entryDir,
            lastMouth.entryDir
        );

        // v263 · IMPORTANT: retreat each stone face toward its own side of the
        // fracture. Do not assume that localNormal(+1) always corresponds to the
        // `after` mouth and localNormal(-1) to `before`; intersection ordering can
        // reverse that relationship. Derive it from the actual throat points.
        const sideASign = seamSideSignFromEndpoint(center, firstMouth.throatAfter, true);
        let sideBSign = seamSideSignFromEndpoint(center, firstMouth.throatBefore, true);
        if (sideBSign === sideASign) sideBSign = -sideASign;

        const gapPlan = buildSeamGapPlan(center.length, rand);
        let sideA = buildSeamSide(center, sideASign, rand, firstMouth.throatAfter, lastMouth.throatBefore, gapPlan, 0);
        let sideB = buildSeamSide(center, sideBSign, rand, firstMouth.throatBefore, lastMouth.throatAfter, gapPlan, 1);

        // Safety check for the exact regression visible in the user's screenshot:
        // if the two generated fracture faces still land on the same side at
        // most interior probes, rebuild B on the opposite side. This preserves
        // all v261 mouth/wear parameters while guaranteeing a real gap.
        if (!seamSidesAreSeparated(center, sideA, sideB)) {
            sideBSign = -sideASign;
            sideB = buildSeamSide(center, sideBSign, rand, firstMouth.throatBefore, lastMouth.throatAfter, gapPlan, 1);
        }

        const arcA = buildArc(poly, first.edgeIndex, last.edgeIndex, firstMouth.shoulderAfter, lastMouth.shoulderBefore);
        const arcB = buildArc(poly, last.edgeIndex, first.edgeIndex, lastMouth.shoulderAfter, firstMouth.shoulderBefore);

        const polyA = [
            ...arcA,
            ...lastMouth.beforeChain.slice(1),
            ...sideA.slice(0, -1).reverse(),
            ...firstMouth.afterChain.slice(0, -1).reverse()
        ];
        const polyB = [
            ...arcB,
            ...firstMouth.beforeChain.slice(1),
            ...sideB.slice(1),
            ...lastMouth.afterChain.slice(0, -1).reverse()
        ];

        if (polyA.length < 5 || polyB.length < 5) return null;
        if (absArea(polyA) < 9000 || absArea(polyB) < 9000) return null;
        return [polyA, polyB];
    }

    function cornerAngle(prev, cur, next) {
        const ax = prev.x - cur.x, ay = prev.y - cur.y;
        const bx = next.x - cur.x, by = next.y - cur.y;
        const al = Math.hypot(ax, ay) || 1, bl = Math.hypot(bx, by) || 1;
        const dot = clamp((ax * bx + ay * by) / (al * bl), -1, 1);
        return Math.acos(dot) * 180 / Math.PI;
    }

    function chamferAndRoughen(points, rand) {
        const base = [];
        for (let i = 0; i < points.length; i++) {
            const prev = points[(i - 1 + points.length) % points.length];
            const cur = points[i];
            const next = points[(i + 1) % points.length];

            // fracture edges and mouths are already purpose-built; don't apply
            // generic noise that would turn them into busy saw-teeth.
            if (cur.outer || cur.seam || cur.mouth) {
                base.push({ ...cur });
                continue;
            }

            const angle = cornerAngle(prev, cur, next);
            const chance = angle < 112 ? 0.52 : angle < 132 ? 0.28 : 0.12;
            if (rand() < chance) {
                const cut = 3.4 + rand() * 6.0;
                base.push(
                    { ...toward(cur, prev, Math.min(cut, distance(cur, prev) * 0.18)), outer: false },
                    { ...toward(cur, next, Math.min(cut * (0.76 + rand() * 0.30), distance(cur, next) * 0.18)), outer: false }
                );
            } else base.push({ ...cur });
        }
        return base;
    }

    // v291-opt31 · REAL desktop Index Drawer outer-rim pits.
    // Desktop V291 does not render #index-drawer::before/::after; the visible
    // shell is the generated stone-fragment silhouette itself. Therefore the
    // pit must become part of this polygon BEFORE fracture partitioning.
    function buildOuterRimPitEdge(a, b, pit = null) {
        if (!pit) return [{ ...a }, { ...b }];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const centerT = clamp(pit.centerT, 0.06, 0.94);
        const halfT = clamp(pit.halfT, 0.025, 0.18);
        const depth = clamp(pit.depth, 1.8, 8.8);
        const variant = pit.variant || 'shallow';
        const bias = clamp(pit.bias ?? 0, -0.85, 0.85);
        const profile = variant === 'deep'
            ? [
                [-1.38, 0.00], [-1.08, 0.02], [-0.84, 0.10], [-0.62, 0.26],
                [-0.46, 0.56], [-0.28, 0.90], [-0.12, 1.16], [0.05, 1.30],
                [0.18, 1.12], [0.34, 0.78], [0.54, 0.54], [0.76, 0.30],
                [1.00, 0.10], [1.26, 0.02], [1.42, 0.00]
            ]
            : [
                [-1.28, 0.00], [-0.96, 0.10], [-0.62, 0.34], [-0.30, 0.68],
                [-0.08, 0.94], [0.00, 1.00], [0.18, 0.82], [0.46, 0.48],
                [0.82, 0.17], [1.24, 0.00]
            ];
        const edgeReach = variant === 'deep' ? 1.42 : 1.30;
        const startT = clamp(centerT - halfT * edgeReach, 0, 1);
        const endT = clamp(centerT + halfT * edgeReach, 0, 1);
        const out = [{ ...a }];
        const makeBase = (t) => ({ x: a.x + dx * t, y: a.y + dy * t });
        if (startT > 0.002) out.push({ ...makeBase(startT), outer: true, pitShoulder: true });
        profile.forEach(([offset, weight]) => {
            const side = offset < 0 ? -1 : 1;
            const sideScale = variant === 'deep'
                ? 1 + bias * side * 0.24
                : 1 + bias * side * 0.14;
            const shiftedOffset = offset * sideScale;
            const t = clamp(centerT + shiftedOffset * halfT, startT, endT);
            const base = makeBase(t);
            const lip = variant === 'deep'
                ? (Math.abs(offset) < 0.24 ? 1.08 : 1.0)
                : 1.0;
            out.push({
                x: base.x + nx * depth * weight * lip,
                y: base.y + ny * depth * weight * lip,
                outer: true,
                pit: weight > 0.001,
                pitShoulder: weight <= 0.001,
                pitVariant: variant
            });
        });
        if (endT < 0.998) out.push({ ...makeBase(endT), outer: true, pitShoulder: true });
        out.push({ ...b });
        return out.filter((point, index, arr) => {
            if (index === 0) return true;
            const prev = arr[index - 1];
            return Math.hypot(point.x - prev.x, point.y - prev.y) > 0.12;
        });
    }

    function makeOuterRimPitPlan(w, h) {
        const pitRand = mulberry32(seed ^ hash32(`${Math.round(w)}x${Math.round(h)}-outer-rim-pits-v291-opt32-r1`));
        const plan = { left: null, top: null, right: null };
        const makePit = (segment) => {
            const isDeep = pitRand() < 0.32;
            if (segment === 'top') {
                const safe = [[0.090, 0.155], [0.845, 0.910]];
                const range = safe[Math.floor(pitRand() * safe.length)] || safe[0];
                return {
                    centerT: range[0] + pitRand() * (range[1] - range[0]),
                    halfT: isDeep ? (0.040 + pitRand() * 0.014) : (0.040 + pitRand() * 0.018),
                    depth: isDeep ? (5.6 + pitRand() * 2.6) : (2.3 + pitRand() * 1.10),
                    variant: isDeep ? 'deep' : 'shallow',
                    bias: (pitRand() - 0.5) * 1.45
                };
            }
            const safe = segment === 'left'
                ? [[0.16, 0.28], [0.74, 0.86]]
                : [[0.14, 0.26], [0.72, 0.84]];
            const range = safe[Math.floor(pitRand() * safe.length)] || safe[0];
            return {
                centerT: range[0] + pitRand() * (range[1] - range[0]),
                halfT: isDeep ? (0.070 + pitRand() * 0.022) : (0.082 + pitRand() * 0.026),
                depth: isDeep ? (5.8 + pitRand() * 2.8) : (2.5 + pitRand() * 1.20),
                variant: isDeep ? 'deep' : 'shallow',
                bias: (pitRand() - 0.5) * 1.35
            };
        };
        const roll = pitRand();
        const primary = roll < 0.50 ? 'top' : (roll < 0.75 ? 'left' : 'right');
        plan[primary] = makePit(primary);
        return plan;
    }

    function protectedTitleCrossing(points, w, h) {
        // Keep the central title bands readable for the future text-fracture pass.
        const zones = [
            { x1: w * 0.34, x2: w * 0.66, y1: h * 0.025, y2: h * 0.16 },
            { x1: w * 0.34, x2: w * 0.66, y1: h * 0.73, y2: h * 0.84 }
        ];
        return points.some(p => zones.some(z => p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2));
    }

    function topMouthHitAllowed(poly, hit, w) {
        if (!hit.outer) return true;
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        if (!a || !b) return true;
        if (hit.outer && (a.pit || b.pit)) return false;

        // Only police the long horizontal top rim. The user's marked preferred
        // regions correspond roughly to these two bands; the central title gap
        // and the far corners are kept free of edge mouths.
        const isTopHorizontal = Math.abs(a.y - b.y) < 1.2 && Math.max(Math.abs(a.y), Math.abs(b.y)) < 2.5;
        if (!isTopHorizontal) return true;
        const x = hit.x / Math.max(1, w);
        return (x >= 0.21 && x <= 0.47) || (x >= 0.57 && x <= 0.82);
    }

    function splitCell(cells, index, point, angleDeg, rand, w, h) {
        if (index < 0 || index >= cells.length) return false;
        const theta = angleDeg * Math.PI / 180;
        const dir = { x: Math.cos(theta), y: Math.sin(theta) };

        // Preview the entire candidate, not only its midpoint. Top-edge mouths
        // are accepted only in the two side bands marked by the user, and the
        // crack itself must not run through the title zones.
        const hits = linePolygonIntersections(cells[index].points, point, dir);
        if (hits.length < 2) return false;
        const firstHit = hits[0];
        const lastHit = hits[hits.length - 1];
        if (!topMouthHitAllowed(cells[index].points, firstHit, w)
            || !topMouthHitAllowed(cells[index].points, lastHit, w)) return false;

        const preview = [];
        for (let i = 0; i <= 10; i++) preview.push(lerp(firstHit, lastHit, i / 10));
        if (protectedTitleCrossing(preview, w, h)) return false;

        const result = splitPolygonByFracture(cells[index].points, point, dir, rand);
        if (!result) return false;
        const original = cells[index];
        cells.splice(index, 1,
            { id: `${original.id}-a`, points: result[0] },
            { id: `${original.id}-b`, points: result[1] }
        );
        return true;
    }

    function weightedCellIndex(cells, rand) {
        const weights = cells.map(c => Math.max(0, absArea(c.points) - 12000));
        const total = weights.reduce((a, b) => a + b, 0);
        if (total <= 0) return -1;
        let r = rand() * total;
        for (let i = 0; i < cells.length; i++) {
            r -= weights[i];
            if (r <= 0) return i;
        }
        return cells.length - 1;
    }

    function buildPartition(w, h, rand) {
        const leftInset = cssNumber('--frame-left', 230);
        const rightInset = cssNumber('--frame-right', 168);
        const handleH = cssNumber('--index-v208-handle-height', 60);
        const pitPlan = makeOuterRimPitPlan(w, h);
        const leftStart = v(0, handleH, true);
        const leftTop = v(leftInset, 0, true);
        const rightTop = v(w - rightInset, 0, true);
        const rightEnd = v(w, handleH, true);
        const leftEdge = buildOuterRimPitEdge(leftStart, leftTop, pitPlan.left);
        const topEdge = buildOuterRimPitEdge(leftTop, rightTop, pitPlan.top);
        const rightEdge = buildOuterRimPitEdge(rightTop, rightEnd, pitPlan.right);
        const silhouette = [
            ...leftEdge.slice(0, -1),
            ...topEdge.slice(0, -1),
            ...rightEdge,
            v(w, h, true),
            v(0, h, true)
        ];

        const cells = [{ id: 'slab-0', points: silhouette }];
        const target = 1 + Math.floor(rand() * 4); // v258: keep the composition to 1–4 independent fractures
        let made = 0;
        let attempts = 0;

        // avoid low-angle horizontal cuts. Most stone breaks are diagonal or
        // near-vertical, with secondary cuts attaching to existing seams.
        const anglePools = [
            [42, 68], [112, 138], [78, 101],
            [36, 48], [132, 145]
        ];

        const maxAttempts = 34 + target * 12;
        while (made < target && attempts++ < maxAttempts) {
            const index = weightedCellIndex(cells, rand);
            if (index < 0) break;
            const cell = cells[index];
            const c = centroid(cell.points);
            const pool = anglePools[Math.floor(rand() * anglePools.length)];
            let angle = pool[0] + rand() * (pool[1] - pool[0]);
            if (rand() < 0.5) angle += (rand() - 0.5) * 5;

            const p = {
                x: c.x + (rand() - 0.5) * w * 0.18,
                y: clamp(c.y + (rand() - 0.5) * h * 0.18, h * 0.18, h * 0.90)
            };

            if (splitCell(cells, index, p, angle, rand, w, h)) made++;
        }

        return {
            crackCount: made,
            outerPits: pitPlan,
            cells: cells
                .filter(cell => absArea(cell.points) > 5000)
                .sort((a, b) => centroid(a.points).y - centroid(b.points).y || centroid(a.points).x - centroid(b.points).x)
                .map((cell, i) => ({ id: `stone-${i + 1}`, points: cell.points }))
        };
    }

    // v291-opt01-r1 · single frosted surface, minimal-diff edition.
    // Important: no Index Drawer layout CSS is changed. The original V291
    // .index-stone-frost-face rule is reused verbatim; only the N fragment
    // surfaces are replaced by one full-size surface carrying a union SVG mask.
    function buildFrostMaskUrl(refinedCells, w, h) {
        const polygons = refinedCells.map(cell => {
            const points = cell.points
                .map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
                .join(' ');
            return `<polygon points="${points}" fill="white"/>`;
        }).join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" preserveAspectRatio="none">${polygons}</svg>`;
        return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
    }

    function buildFrostHost(refinedCells, w, h) {
        const host = document.createElement('div');
        host.className = 'index-stone-frost-host';
        host.setAttribute('aria-hidden', 'true');

        const face = document.createElement('div');
        face.className = 'index-stone-frost-face';
        face.dataset.stoneFrostSurface = 'union';
        const mask = buildFrostMaskUrl(refinedCells, w, h);
        face.style.maskImage = mask;
        face.style.webkitMaskImage = mask;
        face.style.maskSize = '100% 100%';
        face.style.webkitMaskSize = '100% 100%';
        face.style.maskPosition = '0 0';
        face.style.webkitMaskPosition = '0 0';
        face.style.maskRepeat = 'no-repeat';
        face.style.webkitMaskRepeat = 'no-repeat';
        host.appendChild(face);
        return host;
    }

    function buildIndexImmuneFrost(drawer, drawerRect) {
        const stable = document.getElementById('index-stable-zone');
        if (!stable) return null;
        const sr = stable.getBoundingClientRect();
        if (sr.width < 10 || sr.height < 10) return null;

        // v271 · Treat the lexicology area as one calm lower inscription field,
        // not merely a padded box around #index-stable-zone. The immunity veil
        // starts above the heading and feathers in vertically, then spans almost
        // the full slab width and continues to the bottom rim. This prevents a
        // diagonal seam from reappearing beside or below the last tag while the
        // 3px guard still leaves the physical outer contour visible.
        const fade = Math.max(64, Math.min(108, drawerRect.height * 0.135));
        const rimGuard = 3;
        const upperLift = Math.max(18, Math.min(34, drawerRect.height * 0.032));
        const top = Math.max(0, sr.top - drawerRect.top - fade - upperLift);
        const left = rimGuard;
        const right = rimGuard;

        // opt57 · seal the lexicology immunity field all the way to the lower
        // edge.  The old 3px bottom rim guard could expose the terminal few
        // pixels of a random stone seam, so a crack occasionally leaked out
        // beneath the last index row.  The drawer's authored outer contour is
        // rendered by its own SVG layer, therefore the immunity veil can safely
        // reach bottom:0 without erasing the physical frame line.
        const bottom = 0;

        const veil = document.createElement('div');
        veil.className = 'index-stone-crack-immunity';
        veil.setAttribute('aria-hidden', 'true');
        veil.style.top = `${top.toFixed(2)}px`;
        veil.style.left = `${left.toFixed(2)}px`;
        veil.style.right = `${right.toFixed(2)}px`;
        veil.style.bottom = `${bottom.toFixed(2)}px`;
        veil.style.setProperty('--index-immune-fade-px', `${fade.toFixed(1)}px`);
        return veil;
    }

    function ensureLayer(drawer) {
        let layer = document.getElementById(LAYER_ID);
        if (!layer) {
            layer = document.createElement('div');
            layer.id = LAYER_ID;
            layer.setAttribute('aria-hidden', 'true');
            drawer.prepend(layer);
        }
        return layer;
    }

    function render() {
        const drawer = document.getElementById('index-drawer');
        if (!drawer || isCompactViewport()) return;
        const rect = drawer.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        if (w < 400 || h < 180) return;

        const rand = mulberry32(seed ^ hash32(`${Math.round(w)}x${Math.round(h)}-v268`));
        const layer = ensureLayer(drawer);
        const svg = svgEl('svg', {
            viewBox: `0 0 ${w} ${h}`,
            preserveAspectRatio: 'none',
            class: 'index-stone-fragment-svg'
        });

        const partition = buildPartition(w, h, rand);
        const refinedCells = [];
        partition.cells.forEach((cell, index) => {
            const localRand = mulberry32(seed ^ hash32(cell.id) ^ (index * 0x9E3779B9));
            const refined = chamferAndRoughen(cell.points, localRand);
            refinedCells.push({
                id: cell.id,
                points: refined.map(pt => ({ ...pt }))
            });
            const path = svgEl('path', {
                d: pathD(refined),
                class: `index-stone-fragment-face index-stone-fragment-${cell.id}`,
                'data-stone-fragment': cell.id,
                'vector-effect': 'non-scaling-stroke'
            });
            path.style.setProperty('--stone-alpha', (0.84 + localRand() * 0.065).toFixed(3));
            // tiny per-face stroke variation lets near-coincident seams create
            // natural dark/light depth without a fake shadow.
            path.style.setProperty('--stone-stroke-alpha', (0.72 + localRand() * 0.15).toFixed(3));
            path.style.setProperty('--stone-stroke-width', (0.72 + localRand() * 0.16).toFixed(3));
            svg.appendChild(path);
        });

        const frostHost = buildFrostHost(refinedCells, w, h);
        const immuneVeil = buildIndexImmuneFrost(drawer, rect);
        if (immuneVeil) layer.replaceChildren(frostHost, svg, immuneVeil);
        else layer.replaceChildren(frostHost, svg);
        drawer.classList.add('index-stone-fragments-ready', 'index-stone-frosted-ready');
        drawer.dataset.stoneFragmentCount = String(partition.cells.length);
        drawer.dataset.stoneCrackCount = String(partition.crackCount);
        drawer.dataset.stoneFragmentSeed = String(seed >>> 0);
        drawer.dataset.outerRimPits = JSON.stringify(partition.outerPits || {});

        // v266 · expose the actual rendered stone polygons. The text rubbing
        // engine consumes these slab faces directly: text is allowed only where
        // a scanline intersects stone, so the complement becomes the crack mask.
        // This avoids trying to reconstruct a centerline from variable-width,
        // rounded negative seams.
        window.__indexStoneFragmentGeometry = {
            width: w,
            height: h,
            seed: seed >>> 0,
            crackCount: partition.crackCount,
            outerPits: partition.outerPits,
            cells: refinedCells,
            renderedAt: performance.now(),
            crackImmunity: immuneVeil ? {
                top: parseFloat(immuneVeil.style.top) || 0,
                left: parseFloat(immuneVeil.style.left) || 0,
                right: parseFloat(immuneVeil.style.right) || 0,
                bottom: parseFloat(immuneVeil.style.bottom) || 0
            } : null
        };
        window.dispatchEvent(new CustomEvent('index-stone-geometry-ready', {
            detail: window.__indexStoneFragmentGeometry
        }));
    }

    let raf = 0;
    let initialRenderComplete = false;
    function schedule() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => requestAnimationFrame(() => {
            render();
            if (window.__indexStoneFragmentGeometry) initialRenderComplete = true;
        }));
    }

    function scheduleInitialIdle() {
        if (initialRenderComplete || window.__indexStoneFragmentGeometry) {
            initialRenderComplete = true;
            return;
        }
        // opt16 · historical name retained to keep call sites stable, but this is
        // no longer an idle task. Index stone geometry belongs to critical startup.
        window.StartupIdleQueue?.cancel?.('index-stone-initial');
        schedule();
    }

    function ensureReady() {
        if (window.__indexStoneFragmentGeometry) {
            initialRenderComplete = true;
            return;
        }
        window.StartupIdleQueue?.cancel?.('index-stone-initial');
        schedule();
    }

    function install() {
        const drawer = document.getElementById('index-drawer');
        if (!drawer) return;
        // v268 · if this preview shell preserves the page context between opens,
        // force a fresh random seed unless the user explicitly supplied ?stone-seed=.
        let queryHasSeed = false;
        try {
            queryHasSeed = new URLSearchParams(location.search).has('stone-seed');
        } catch (_) {}
        if (!queryHasSeed) seed = pageSeed(true);
        window.rerollIndexStoneFragments = () => {
            seed = pageSeed(true);
            initialRenderComplete = true;
            schedule();
        };
        window.ensureIndexStoneFragmentsReady = ensureReady;
        ensureLayer(drawer);
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => {
                if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
                else scheduleInitialIdle();
            });
            ro.observe(drawer);
        } else {
            window.addEventListener('resize', () => {
                if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
                else scheduleInitialIdle();
            }, { passive: true });
        }
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && !queryHasSeed) {
                seed = pageSeed(true);
                schedule();
            }
        });
        document.fonts?.ready?.then(() => {
            if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
            else scheduleInitialIdle();
        }).catch(() => {});
        scheduleInitialIdle();
    }

    // opt16 · drawer markup is guaranteed to precede script.js.
    if (document.getElementById('index-drawer')) install();
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
    else install();
})();


// ============================================================================
// v268 · Stone-surface driven epigraphic text reflow
// ----------------------------------------------------------------------------
// Recreates the successful v216 same-line rubbing behavior, but uses the ACTUAL
// stone faces produced by the current negative-space fragment system.
//
// Important change from v216:
//   v216: synthetic crack bands -> subtract blockers from each text scanline.
//   v266: actual stone polygons -> UNION surviving stone intervals on each
//         scanline; everything between those intervals is true crack space.
//
// The visible line therefore continues on the far side of a crack without
// flowing the paragraph independently into each stone fragment.
// ============================================================================
(() => {
'use strict';

const X_PAD = 16;
const Y_PAD_TOP = 10;
const Y_PAD_BOTTOM = 8;
const STONE_EDGE_TEXT_CLEARANCE = 2.4;
const MIN_SEGMENT_PX = 22;
const HOST_ID = 'index-fracture-fragments';
const READY_CLASS = 'stone-rubbing-text-ready';

const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');

function px(value, fallback = 0) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
}
function fontDescriptor(style) {
    return `${style.fontStyle || 'normal'} ${style.fontWeight || '400'} ${style.fontSize || '13px'} ${style.fontFamily || 'sans-serif'}`;
}
function textWidth(text, style) {
    measureCtx.font = style.canvasFont;
    const base = measureCtx.measureText(text).width;
    return base + Math.max(0, text.length - 1) * style.letterSpacing;
}
function captureStyle(el, kind) {
    const cs = getComputedStyle(el);
    const fontSize = px(cs.fontSize, kind === 'link' ? 11 : 13);
    const rawLineHeight = px(cs.lineHeight, fontSize * 1.56);
    const letterSpacing = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing, 0);
    const style = {
        fontFamily: cs.fontFamily,
        fontStyle: cs.fontStyle,
        fontWeight: cs.fontWeight,
        fontSize,
        lineHeight: Math.max(fontSize * 1.26, rawLineHeight),
        letterSpacing,
        color: cs.color,
        textAlign: cs.textAlign || 'left',
        opacity: px(cs.opacity, 1),
        canvasFont: ''
    };
    style.canvasFont = fontDescriptor({
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        fontSize: `${style.fontSize}px`,
        fontFamily: style.fontFamily
    });
    return style;
}
function getTextBlocks(source) {
    const specs = [
        ['utility', '.index-fracture-add-link', 14, 'right'],
        ['intro', '[data-i18n="index_top_title"]', 12, 'center'],
        ['body', '[data-i18n="index_p1"]', 10, 'left'],
        ['body', '[data-i18n="index_p2"]', 12, 'left'],
        ['conclusion', '[data-i18n="index_conclusion"]', 8, 'center'],
        ['link', '.index-manifesto-link', 0, 'center']
    ];
    return specs.map(([kind, selector, gapAfter, align]) => {
        const el = source.querySelector(selector);
        if (!el) return null;
        const style = captureStyle(el, kind);
        style.textAlign = align;
        return {
            kind,
            text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
            style,
            gapAfter,
            href: kind === 'link' ? el.getAttribute('href') : null,
            noSplit: kind === 'link'
        };
    }).filter(Boolean);
}
function scaleBlocks(blocks, scale) {
    return blocks.map(block => {
        const style = { ...block.style };
        style.fontSize = Math.max(block.kind === 'link' ? 10 : 9, style.fontSize * scale);
        style.lineHeight = Math.max(style.fontSize * 1.24, style.lineHeight * scale);
        style.letterSpacing = style.letterSpacing * Math.max(0.72, scale);
        style.canvasFont = fontDescriptor({
            fontStyle: style.fontStyle,
            fontWeight: style.fontWeight,
            fontSize: `${style.fontSize}px`,
            fontFamily: style.fontFamily
        });
        return { ...block, style, gapAfter: block.gapAfter * scale };
    });
}
function fitText(text, start, maxWidth, style, lang, noSplit = false) {
    let i = start;
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) return { text: '', next: text.length, done: true };

    if (noSplit) {
        const rest = text.slice(i).trim();
        if (textWidth(rest, style) > maxWidth) return null;
        return { text: rest, next: text.length, done: true };
    }

    let lo = 1, hi = text.length - i, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(i, i + mid);
        if (textWidth(candidate, style) <= maxWidth) {
            best = mid;
            lo = mid + 1;
        } else hi = mid - 1;
    }
    if (!best) return null;

    let cut = best;
    if (/^en\b/i.test(lang) && i + best < text.length) {
        const chunk = text.slice(i, i + best + 1);
        const lastSpace = Math.max(chunk.lastIndexOf(' '), chunk.lastIndexOf('\n'));
        if (lastSpace >= Math.max(3, Math.floor(best * 0.32))) cut = lastSpace;
    }

    let out = text.slice(i, i + cut).trimEnd();
    if (!out) {
        cut = best;
        out = text.slice(i, i + cut).trimEnd();
    }
    let next = i + Math.max(1, cut);
    while (next < text.length && text[next] === ' ') next++;
    return { text: out, next, done: next >= text.length };
}
function fitChunk(text, start, maxWidth, style) {
    if (start >= text.length) return { text: '', next: start, width: 0 };
    let lo = 1, hi = text.length - start, best = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const candidate = text.slice(start, start + mid);
        if (textWidth(candidate, style) <= maxWidth) {
            best = mid;
            lo = mid + 1;
        } else hi = mid - 1;
    }
    if (!best) return null;
    const out = text.slice(start, start + best);
    return { text: out, next: start + best, width: textWidth(out, style) };
}
function unionIntervals(intervals) {
    if (!intervals.length) return [];
    const ordered = intervals
        .filter(iv => Number.isFinite(iv[0]) && Number.isFinite(iv[1]) && iv[1] - iv[0] > 0.001)
        .sort((a, b) => a[0] - b[0]);
    if (!ordered.length) return [];
    const merged = [ordered[0].slice()];
    for (let i = 1; i < ordered.length; i++) {
        const cur = ordered[i];
        const prev = merged[merged.length - 1];
        if (cur[0] <= prev[1] + 0.08) prev[1] = Math.max(prev[1], cur[1]);
        else merged.push(cur.slice());
    }
    return merged;
}
function polygonIntervalsAtY(poly, y) {
    const xs = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        if (Math.abs(a.y - b.y) < 1e-6) continue;
        const crosses = (a.y <= y && b.y > y) || (b.y <= y && a.y > y);
        if (!crosses) continue;
        const t = (y - a.y) / (b.y - a.y);
        xs.push(a.x + (b.x - a.x) * t);
    }
    xs.sort((a, b) => a - b);
    const spans = [];
    for (let i = 0; i + 1 < xs.length; i += 2) spans.push([xs[i], xs[i + 1]]);
    return spans;
}
function stoneSegmentsAtZoneY(geom, drawerRect, zoneRect, yLocal, xPad = X_PAD) {
    if (!geom?.cells?.length || geom.width < 1 || geom.height < 1) return [];

    // Geometry is authored in the drawer's own pixel coordinate system. The
    // drawer may be translated while opening, but width/height remain stable;
    // use rect ratios so responsive sizing and fractional pixels stay aligned.
    const sx = drawerRect.width / geom.width;
    const sy = drawerRect.height / geom.height;
    const drawerY = (zoneRect.top - drawerRect.top + yLocal) / sy;
    const zoneLeftInDrawer = (zoneRect.left - drawerRect.left) / sx;
    const zoneRightInDrawer = (zoneRect.right - drawerRect.left) / sx;

    const covered = [];
    geom.cells.forEach(cell => {
        polygonIntervalsAtY(cell.points, drawerY).forEach(([a, b]) => {
            const left = Math.max(a, zoneLeftInDrawer);
            const right = Math.min(b, zoneRightInDrawer);
            if (right <= left) return;
            covered.push([
                (left - zoneLeftInDrawer) * sx,
                (right - zoneLeftInDrawer) * sx
            ]);
        });
    });

    const merged = unionIntervals(covered);
    const leftBound = xPad;
    const rightBound = zoneRect.width - xPad;
    return merged
        .map(([a, b]) => {
            const left = Math.max(leftBound, a + STONE_EDGE_TEXT_CLEARANCE);
            const right = Math.min(rightBound, b - STONE_EDGE_TEXT_CLEARANCE);
            return { left, right, width: right - left };
        })
        .filter(seg => seg.width >= MIN_SEGMENT_PX);
}
function makeEl(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
}
function createChunk(parent, block, text, x, y, width) {
    if (!text) return;
    const tag = block.kind === 'link' ? 'a' : 'span';
    const el = makeEl(tag, `index-interrupted-line index-interrupted-${block.kind}`);
    if (tag === 'a' && block.href) el.href = block.href;
    const st = block.style;
    el.textContent = text;
    el.style.left = `${x.toFixed(2)}px`;
    el.style.top = `${y.toFixed(2)}px`;
    el.style.width = `${Math.max(1, width).toFixed(2)}px`;
    el.style.fontFamily = st.fontFamily;
    el.style.fontSize = `${st.fontSize}px`;
    el.style.fontWeight = st.fontWeight;
    el.style.fontStyle = st.fontStyle;
    el.style.letterSpacing = `${st.letterSpacing}px`;
    el.style.lineHeight = `${st.lineHeight}px`;
    el.style.color = st.color;
    el.style.opacity = String(st.opacity);
    el.dataset.rubbingKind = block.kind;
    parent.appendChild(el);
}
function renderLineIntoSegments(parent, block, lineText, segments, y) {
    const st = block.style;
    const usable = segments.filter(seg => seg.width > 1);
    if (!usable.length) return { chunks: 0, interrupted: false };
    const totalWidth = usable.reduce((sum, seg) => sum + seg.width, 0);
    const actualWidth = Math.min(totalWidth, textWidth(lineText, st));
    let startOffset = 0;
    if (st.textAlign === 'center') startOffset = Math.max(0, (totalWidth - actualWidth) * 0.5);
    else if (st.textAlign === 'right') startOffset = Math.max(0, totalWidth - actualWidth);

    let segIndex = 0;
    let localSkip = startOffset;
    while (segIndex < usable.length && localSkip >= usable[segIndex].width) {
        localSkip -= usable[segIndex].width;
        segIndex++;
    }

    let cursor = 0;
    let chunks = 0;
    while (segIndex < usable.length && cursor < lineText.length) {
        const seg = usable[segIndex];
        const x = seg.left + localSkip;
        const avail = seg.width - localSkip;
        const chunk = fitChunk(lineText, cursor, avail, st);
        if (chunk && chunk.text) {
            createChunk(parent, block, chunk.text, x, y, chunk.width);
            cursor = chunk.next;
            chunks++;
        }
        localSkip = 0;
        segIndex++;
    }
    return { chunks, interrupted: chunks > 1 };
}
function layoutInterruptedText(host, blocks, geom, drawerRect, zoneRect, lang) {
    let y = Y_PAD_TOP;
    const bottomLimit = zoneRect.height - Y_PAD_BOTTOM;
    let renderedLines = 0;
    let interruptedLines = 0;
    let maxSegments = 0;

    for (const block of blocks) {
        let offset = 0;
        let safety = 0;
        while (offset < block.text.length && safety++ < 900) {
            if (y + block.style.lineHeight > bottomLimit) {
                return { ok: false, renderedLines, interruptedLines, maxSegments };
            }
            const scanY = y + block.style.lineHeight * 0.56;
            const segments = stoneSegmentsAtZoneY(geom, drawerRect, zoneRect, scanY)
                .filter(seg => seg.width >= (block.noSplit ? 88 : Math.max(MIN_SEGMENT_PX, block.style.fontSize * 1.55)));
            const totalWidth = segments.reduce((sum, seg) => sum + seg.width, 0);
            maxSegments = Math.max(maxSegments, segments.length);

            if (!segments.length || totalWidth < (block.noSplit ? textWidth(block.text.slice(offset).trim(), block.style) : block.style.fontSize * 2.2)) {
                y += block.style.lineHeight * 0.90;
                continue;
            }

            const fitted = fitText(block.text, offset, totalWidth, block.style, lang, block.noSplit);
            if (!fitted || !fitted.text) {
                y += block.style.lineHeight * 0.90;
                continue;
            }
            const result = renderLineIntoSegments(host, block, fitted.text, segments, y);
            if (!result.chunks) {
                y += block.style.lineHeight * 0.90;
                continue;
            }
            renderedLines++;
            if (result.interrupted) interruptedLines++;
            offset = fitted.next;
            y += block.style.lineHeight;
        }
        y += block.gapAfter;
        if (y > bottomLimit) return { ok: false, renderedLines, interruptedLines, maxSegments };
    }
    return { ok: true, renderedLines, interruptedLines, maxSegments };
}

function install() {
    const drawer = document.getElementById('index-drawer');
    const zone = document.getElementById('index-fracture-zone');
    const source = document.getElementById('index-fracture-source');
    const host = document.getElementById(HOST_ID);
    if (!drawer || !zone || !source || !host) return;

    let raf = 0;
    let timer = 0;
    let generation = 0;

    function clearReady() {
        zone.classList.remove(READY_CLASS);
        host.replaceChildren();
        delete zone.dataset.rubbingScale;
        delete zone.dataset.rubbingLines;
        delete zone.dataset.rubbingInterruptedLines;
        delete zone.dataset.rubbingMaxSegments;
    }

    function render() {
        raf = 0;
        const myGeneration = ++generation;
        const geom = window.__indexStoneFragmentGeometry;
        const rootLang = String(document.documentElement.lang || window.currentLang || 'zh').toLowerCase();
        const directMaskLanguage = rootLang.startsWith('zh') || rootLang.startsWith('ja') || rootLang.startsWith('en');
        if (directMaskLanguage) {
            clearReady();
            return;
        }
        if (!geom?.cells?.length || isCompactViewport()) {
            clearReady();
            return;
        }

        const drawerRect = drawer.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();
        if (drawerRect.width < 400 || drawerRect.height < 180 || zoneRect.width < 240 || zoneRect.height < 120) {
            clearReady();
            return;
        }

        const baseBlocks = getTextBlocks(source);
        const lang = document.documentElement.lang || window.currentLang || 'zh-Hans';
        let success = false;
        let diagnostics = null;

        // Same fallback idea as v216, but prefer preserving current typography.
        for (const scale of [1, 0.97, 0.94, 0.91, 0.88, 0.85]) {
            if (myGeneration !== generation) return;
            host.replaceChildren();
            const textLayer = makeEl('div', 'index-interrupted-text-layer');
            host.appendChild(textLayer);
            const blocks = scaleBlocks(baseBlocks, scale);
            const result = layoutInterruptedText(textLayer, blocks, geom, drawerRect, zoneRect, lang);
            diagnostics = result;
            if (result.ok) {
                success = true;
                zone.dataset.rubbingScale = scale.toFixed(2);
                zone.dataset.rubbingLines = String(result.renderedLines);
                zone.dataset.rubbingInterruptedLines = String(result.interruptedLines);
                zone.dataset.rubbingMaxSegments = String(result.maxSegments);
                break;
            }
        }

        if (success) {
            zone.classList.add(READY_CLASS);
            drawer.dataset.rubbingText = 'ready';
            drawer.dataset.rubbingInterruptedLines = zone.dataset.rubbingInterruptedLines || '0';
        } else {
            clearReady();
            drawer.dataset.rubbingText = 'fallback';
            drawer.dataset.rubbingFailure = JSON.stringify(diagnostics || {});
        }
    }

    function schedule(delay = 0) {
        clearTimeout(timer);
        if (delay > 0) {
            timer = window.setTimeout(() => schedule(0), delay);
            return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => requestAnimationFrame(render));
    }

    // Stone geometry is the primary trigger. The event is emitted after the
    // actual SVG slabs are committed, so text and visible cracks share one source.
    window.addEventListener('index-stone-geometry-ready', () => schedule(0));

    // During one language decode, glyph mutations are intentionally ignored;
    // one languagechange-complete event schedules the final geometry pass.
    let deferredByCyberDecode = false;
    const mo = new MutationObserver(() => {
        if (window.__cyberDecodeActive) {
            deferredByCyberDecode = true;
            return;
        }
        schedule(180);
    });
    mo.observe(source, { subtree: true, childList: true, characterData: true });
    document.addEventListener('languagechange-complete', () => {
        if (!deferredByCyberDecode) return;
        deferredByCyberDecode = false;
        schedule(0);
    });

    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => schedule(80));
        ro.observe(zone);
    } else {
        window.addEventListener('resize', () => schedule(120), { passive: true });
    }

    if (document.fonts?.ready) document.fonts.ready.then(() => schedule(0)).catch(() => {});
    schedule(0);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
})();


/* ========================================================================== 
   V291-opt02 · unified StoneMaskController
   --------------------------------------------------------------------------
   One controller now owns every stone-loss text mask used by Index Drawer:
   - Chinese / Japanese vertical stele
   - English horizontal inscription
   - [Add Record]
   - the three bottom labels

   The visible result stays identical to the V291 implementation, but the stone
   polygons are serialized once per geometry generation and reused as one
   full-drawer SVG mask. Each target crops that shared mask with mask-size /
   mask-position instead of rebuilding and URL-encoding the same polygons.

   Runtime work is also consolidated into:
   - one index-stone-geometry-ready listener
   - one resize listener
   - one MutationObserver instance
   - one ResizeObserver instance
   - one timer + one RAF scheduler
   - one read phase followed by one write phase
   ========================================================================== */
(() => {
'use strict';

const MASK_REPEAT = 'no-repeat';

const state = {
    installed: false,
    drawer: null,
    source: null,
    verticalCopy: null,
    englishCopy: null,
    addLink: null,
    languageSwitcher: null,
    bottomLabels: [],
    timer: 0,
    raf: 0,
    cachedGeom: null,
    cachedMaskUrl: '',
    cachedMaskWidth: 0,
    cachedMaskHeight: 0,
    mutationObserver: null,
    resizeObserver: null
};

function normalizeLang() {
    const raw = String(document.documentElement.lang || window.currentLang || 'zh').toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('ja')) return 'ja';
    return 'zh';
}

function clearMaskStyles(el) {
    if (!el) return;
    el.style.removeProperty('mask-image');
    el.style.removeProperty('-webkit-mask-image');
    el.style.removeProperty('mask-size');
    el.style.removeProperty('-webkit-mask-size');
    el.style.removeProperty('mask-position');
    el.style.removeProperty('-webkit-mask-position');
    el.style.removeProperty('mask-repeat');
    el.style.removeProperty('-webkit-mask-repeat');
}

function setReadyClasses({ vertical = false, english = false, add = false } = {}) {
    state.source?.classList.toggle('vertical-stone-mask-ready', vertical);
    state.source?.classList.toggle('english-stone-mask-ready', english);
    state.addLink?.classList.toggle('archive-add-stone-mask-ready', add);
}

function clearAllMasks() {
    clearMaskStyles(state.verticalCopy);
    clearMaskStyles(state.englishCopy);
    clearMaskStyles(state.addLink);
    clearMaskStyles(state.languageSwitcher);
    state.bottomLabels.forEach(clearMaskStyles);
    setReadyClasses();
}

function getSharedMask(geom) {
    if (!geom?.cells?.length) return null;
    if (state.cachedGeom === geom && state.cachedMaskUrl) {
        return {
            url: state.cachedMaskUrl,
            width: state.cachedMaskWidth,
            height: state.cachedMaskHeight
        };
    }

    const width = Math.max(1, Number(geom.width) || 1);
    const height = Math.max(1, Number(geom.height) || 1);
    const polygons = geom.cells.map(cell => {
        const pts = cell.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
        return `<polygon points="${pts}" fill="white"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}" preserveAspectRatio="none">${polygons}</svg>`;

    state.cachedGeom = geom;
    state.cachedMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
    state.cachedMaskWidth = width;
    state.cachedMaskHeight = height;

    return { url: state.cachedMaskUrl, width, height };
}

function measureTarget(el, drawerRect, { minWidth = 8, minHeight = 8, padX = 0, padY = 0, clampOrigin = false } = {}) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < minWidth || rect.height < minHeight) return null;

    let x = rect.left - drawerRect.left - padX;
    let y = rect.top - drawerRect.top - padY;
    if (clampOrigin) {
        x = Math.max(0, x);
        y = Math.max(0, y);
    }

    const regionW = Math.max(1, rect.width + padX * 2);
    const regionH = Math.max(1, rect.height + padY * 2);
    const scaleX = rect.width / regionW;
    const scaleY = rect.height / regionH;

    return {
        el,
        x,
        y,
        width: rect.width,
        height: rect.height,
        regionW,
        regionH,
        scaleX,
        scaleY
    };
}

function applySharedMask(measurement, sharedMask) {
    if (!measurement || !sharedMask) return false;
    const { el, x, y, scaleX, scaleY } = measurement;

    // This is mathematically equivalent to the old per-element SVG viewBox:
    // crop (x,y,w,h) from the drawer-space stone mask, then map that crop to
    // the element's own box. Padding is preserved by the independent X/Y scale.
    const maskWidth = sharedMask.width * scaleX;
    const maskHeight = sharedMask.height * scaleY;
    const posX = -x * scaleX;
    const posY = -y * scaleY;

    el.style.setProperty('-webkit-mask-image', sharedMask.url);
    el.style.setProperty('mask-image', sharedMask.url);
    el.style.setProperty('-webkit-mask-size', `${maskWidth.toFixed(3)}px ${maskHeight.toFixed(3)}px`);
    el.style.setProperty('mask-size', `${maskWidth.toFixed(3)}px ${maskHeight.toFixed(3)}px`);
    el.style.setProperty('-webkit-mask-position', `${posX.toFixed(3)}px ${posY.toFixed(3)}px`);
    el.style.setProperty('mask-position', `${posX.toFixed(3)}px ${posY.toFixed(3)}px`);
    el.style.setProperty('-webkit-mask-repeat', MASK_REPEAT);
    el.style.setProperty('mask-repeat', MASK_REPEAT);
    return true;
}

function render() {
    state.raf = 0;

    const drawer = state.drawer;
    const geom = window.__indexStoneFragmentGeometry;
    if (!drawer || isCompactViewport() || !geom?.cells?.length) {
        clearAllMasks();
        return;
    }

    // ----- READ PHASE: one drawer measurement + one pass over active targets.
    const drawerRect = drawer.getBoundingClientRect();
    if (drawerRect.width < 400 || drawerRect.height < 120) {
        clearAllMasks();
        return;
    }

    const lang = normalizeLang();
    const verticalActive = lang === 'zh' || lang === 'ja';
    const englishActive = lang === 'en';

    const verticalMeasure = verticalActive
        ? measureTarget(state.verticalCopy, drawerRect, { minWidth: 20, minHeight: 20 })
        : null;
    const englishMeasure = englishActive
        ? measureTarget(state.englishCopy, drawerRect, { minWidth: 20, minHeight: 20 })
        : null;
    const addMeasure = measureTarget(state.addLink, drawerRect, {
        minWidth: 8,
        minHeight: 8,
        padX: 2,
        padY: 1,
        clampOrigin: true
    });
    // opt44 · The language switcher sits on the same fractured stone header as
    // the title and [Add Record]. Crop the shared drawer-space stone mask onto
    // the whole column so cracks can erase both the dash indicators and labels
    // without changing the buttons' hit areas or language-switch behaviour.
    const languageSwitcherMeasure = measureTarget(state.languageSwitcher, drawerRect, {
        minWidth: 8,
        minHeight: 8,
        padX: 2,
        padY: 2,
        clampOrigin: true
    });
    const bottomMeasures = state.bottomLabels.map(el => measureTarget(el, drawerRect, {
        minWidth: 8,
        minHeight: 8,
        padX: 2,
        padY: 1,
        clampOrigin: true
    }));

    const sharedMask = getSharedMask(geom);
    if (!sharedMask) {
        clearAllMasks();
        return;
    }

    // ----- WRITE PHASE: no geometry reads after this point.
    if (verticalActive && verticalMeasure) {
        applySharedMask(verticalMeasure, sharedMask);
    } else {
        clearMaskStyles(state.verticalCopy);
    }

    if (englishActive && englishMeasure) {
        applySharedMask(englishMeasure, sharedMask);
    } else {
        clearMaskStyles(state.englishCopy);
    }

    const addReady = addMeasure ? applySharedMask(addMeasure, sharedMask) : false;
    if (!addReady) clearMaskStyles(state.addLink);

    const languageSwitcherReady = languageSwitcherMeasure
        ? applySharedMask(languageSwitcherMeasure, sharedMask)
        : false;
    if (!languageSwitcherReady) clearMaskStyles(state.languageSwitcher);

    bottomMeasures.forEach((measurement, index) => {
        const el = state.bottomLabels[index];
        if (measurement) applySharedMask(measurement, sharedMask);
        else clearMaskStyles(el);
    });

    setReadyClasses({
        vertical: Boolean(verticalActive && verticalMeasure),
        english: Boolean(englishActive && englishMeasure),
        add: Boolean(addReady)
    });
}

function queueRender() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(render);
}

function schedule(delay = 0) {
    clearTimeout(state.timer);
    state.timer = 0;

    if (delay > 0) {
        state.timer = window.setTimeout(queueRender, delay);
        return;
    }
    queueRender();
}

function install() {
    if (state.installed) return;

    state.drawer = document.getElementById('index-drawer');
    state.source = document.getElementById('index-fracture-source');
    state.verticalCopy = state.source?.querySelector('.index-stele-copy') || null;
    state.englishCopy = state.source?.querySelector('.index-inscription-horizontal') || null;
    state.addLink = document.getElementById('archive-add-link');
    state.languageSwitcher = document.getElementById('bottom-stele-switcher');
    state.bottomLabels = [
        document.querySelector('#bottom-trigger-record [data-i18n]'),
        document.getElementById('bottom-center-label'),
        document.querySelector('#bottom-trigger-ruin [data-i18n]')
    ].filter(Boolean);

    if (!state.drawer || !state.source) return;
    state.installed = true;

    // One geometry listener for all masks.
    window.addEventListener('index-stone-geometry-ready', event => {
        if (event?.detail && event.detail !== state.cachedGeom) {
            state.cachedGeom = null;
            state.cachedMaskUrl = '';
        }
        schedule(0);
    });

    // One viewport listener for all masks.
    window.addEventListener('resize', () => schedule(100), { passive: true });

    // One MutationObserver instance. It watches the drawer's relevant text and
    // the document language attribute without multiplying per-target observers.
    state.pendingDecodeRefresh = false;
    state.mutationObserver = new MutationObserver(records => {
        let langChanged = false;
        let textChanged = false;
        for (const record of records) {
            if (record.type === 'attributes' && record.attributeName === 'lang') langChanged = true;
            else textChanged = true;
        }

        // The language attribute changes once and still needs a prompt mode swap.
        if (langChanged) schedule(140);

        // Do not regenerate masks for every decoded glyph. The shared scheduler
        // emits one completion event when the entire language batch settles.
        if (textChanged) {
            if (window.__cyberDecodeActive) state.pendingDecodeRefresh = true;
            else schedule(180);
        }
    });
    state.mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });
    [state.source, state.addLink, state.languageSwitcher, ...state.bottomLabels]
        .filter(Boolean)
        .forEach(el => state.mutationObserver.observe(el, {
            subtree: true,
            childList: true,
            characterData: true
        }));

    // One ResizeObserver instance can watch every masked target at once.
    if ('ResizeObserver' in window) {
        state.resizeObserver = new ResizeObserver(() => schedule(80));
        [state.drawer, state.source, state.verticalCopy, state.englishCopy, state.addLink, ...state.bottomLabels]
            .filter(Boolean)
            .forEach(el => state.resizeObserver.observe(el));
    }

    document.addEventListener('languagechange-complete', () => {
        if (!state.pendingDecodeRefresh) return;
        state.pendingDecodeRefresh = false;
        schedule(0);
    });

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => schedule(0)).catch(() => {});
    }

    schedule(0);
}

window.StoneMaskController = {
    schedule,
    render,
    clear: clearAllMasks,
    get cachedGeometry() { return state.cachedGeom; },
    get maskedTargetCount() {
        return [state.verticalCopy, state.englishCopy, state.addLink, ...state.bottomLabels].filter(Boolean).length;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
} else {
    install();
}
})();


/* ========================================================================== 
   v290-mobile-place-pass3 · mobile place / archive / record flow
   ========================================================================== */
(() => {
    const MOBILE_COPY = {
        zh: {
            archive: '档案目录', items: '项', images: '图像记录', documents: '测绘 / 文档', texts: '文字记录',
            media: '声音 / 影像', special: '特殊记录', other: '其他记录', score: '图形记谱', pointer: '记录指针',
            scoreHint: '打开记录图谱', pointerHint: '进入指针模式', mobileEyebrow: '移动地点档案',
            specialEyebrow: '废墟园林 / 特殊记录', close: '关闭地点信息', toggle: '展开或收起地点信息',
            scoreMode: '谱面', pointerMode: '指针', pointerIdle: '轻触谱面定位', scoreIdle: '轻量静态谱面',
            notice: '这是移动版本。地图、地点档案、图像与主要记录保留；全部功能和原版阅读体验请参照电脑网页端。'
        },
        ja: {
            archive: 'アーカイブ', items: '項目', images: '画像記録', documents: '測量 / 文書', texts: '文字記録',
            media: '音声 / 映像', special: '特殊記録', other: 'その他', score: '図形楽譜', pointer: '記録ポインタ',
            scoreHint: '記録図を開く', pointerHint: 'ポインタモード', mobileEyebrow: 'モバイル地点資料',
            specialEyebrow: '廃墟庭園 / 特殊記録', close: '地点情報を閉じる', toggle: '地点情報を展開・収納',
            scoreMode: '楽譜', pointerMode: 'ポインタ', pointerIdle: '楽譜をタップして位置を指定', scoreIdle: '軽量静的楽譜',
            notice: 'これはモバイル版です。地図・地点資料・画像・主要記録を保持し、全機能と原版の閲覧体験はデスクトップ版をご参照ください。'
        },
        en: {
            archive: 'Archive directory', items: 'items', images: 'Image records', documents: 'Survey / documents', texts: 'Text records',
            media: 'Audio / video', special: 'Special records', other: 'Other records', score: 'Graphic score', pointer: 'Record pointer',
            scoreHint: 'Open record score', pointerHint: 'Enter pointer mode', mobileEyebrow: 'Mobile place archive',
            specialEyebrow: 'Ruin Garden / special record', close: 'Close place information', toggle: 'Expand or collapse place information',
            scoreMode: 'Score', pointerMode: 'Pointer', pointerIdle: 'Tap the score to locate', scoreIdle: 'Lightweight static score',
            notice: 'This is the mobile version. Map, place archives, images, and primary records are retained; see the desktop site for the full original experience.'
        }
    };

    const state = {
        currentSite: null,
        currentIndex: -1,
        treeHTML: '',
        sheetState: 'closed',
        specialAttachmentId: null,
        specialMode: 'score',
        dragStartY: null
    };

    const lang = () => ['zh','ja','en'].includes(window.currentLang) ? window.currentLang : (document.documentElement.lang || 'zh').slice(0,2);
    const t = key => (MOBILE_COPY[lang()] || MOBILE_COPY.zh)[key] || MOBILE_COPY.zh[key] || key;
    const isMobileArchiveMode = () => typeof window.isCompactViewport === 'function'
        ? window.isCompactViewport()
        : false;
    window.isMobileArchiveMode = isMobileArchiveMode;

    function ensureUI() {
        let sheet = document.getElementById('mobile-place-sheet');
        if (!sheet) {
            sheet = document.createElement('section');
            sheet.id = 'mobile-place-sheet';
            sheet.dataset.state = 'closed';
            sheet.setAttribute('aria-hidden', 'true');
            sheet.setAttribute('aria-live', 'polite');
            sheet.innerHTML = `
                <button type="button" class="mobile-place-grip" data-mobile-place-toggle aria-label=""></button>
                <header class="mobile-place-head">
                    <div class="mobile-place-heading">
                        <div class="mobile-place-eyebrow" id="mobile-place-type"></div>
                        <h2 class="mobile-place-title" id="mobile-place-title"></h2>
                        <div class="mobile-place-meta">
                            <span id="mobile-place-coord"></span>
                            <span id="mobile-place-date"></span>
                        </div>
                    </div>
                    <button type="button" class="mobile-place-close" data-mobile-place-close aria-label="">×</button>
                </header>
                <div class="mobile-place-tags" id="mobile-place-tags"></div>
                <div class="mobile-place-scroll" id="mobile-place-scroll">
                    <p class="mobile-place-summary" id="mobile-place-summary"></p>
                    <section class="mobile-special-actions" id="mobile-special-actions" hidden>
                        <button type="button" class="mobile-special-action" data-mobile-special="score">
                            <span data-mobile-copy="score"></span><small data-mobile-copy="scoreHint"></small>
                        </button>
                        <button type="button" class="mobile-special-action" data-mobile-special="pointer">
                            <span data-mobile-copy="pointer"></span><small data-mobile-copy="pointerHint"></small>
                        </button>
                    </section>
                    <section class="mobile-archive-block">
                        <div class="mobile-archive-title"><span data-mobile-copy="archive"></span><small id="mobile-archive-total"></small></div>
                        <div id="mobile-archive-directory"></div>
                    </section>
                    <p class="mobile-version-note" data-mobile-copy="notice"></p>
                </div>`;
            document.body.appendChild(sheet);
        }

        let special = document.getElementById('mobile-special-record');
        if (!special) {
            special = document.createElement('section');
            special.id = 'mobile-special-record';
            special.hidden = true;
            special.innerHTML = `
                <header class="mobile-special-head">
                    <div class="mobile-special-head-text">
                        <div class="mobile-place-eyebrow" data-mobile-copy="specialEyebrow"></div>
                        <div class="mobile-special-title" id="mobile-special-title"></div>
                    </div>
                    <button type="button" class="mobile-special-close" data-mobile-special-close aria-label="">×</button>
                </header>
                <div class="mobile-special-stage" id="mobile-special-stage">
                    <img id="mobile-special-image" alt="" decoding="async">
                    <div class="mobile-special-pointer" id="mobile-special-pointer" hidden></div>
                </div>
                <footer class="mobile-special-footer">
                    <button type="button" data-mobile-special-mode="score" data-mobile-copy="scoreMode"></button>
                    <button type="button" data-mobile-special-mode="pointer" data-mobile-copy="pointerMode"></button>
                    <span class="mobile-special-readout" id="mobile-special-readout">—</span>
                </footer>`;
            document.body.appendChild(special);
        }
        syncCopy();
        bindUIOnce();
        return sheet;
    }

    function syncCopy() {
        document.querySelectorAll('[data-mobile-copy]').forEach(el => {
            el.textContent = t(el.dataset.mobileCopy);
        });
        const sheet = document.getElementById('mobile-place-sheet');
        sheet?.querySelector('[data-mobile-place-toggle]')?.setAttribute('aria-label', t('toggle'));
        sheet?.querySelector('[data-mobile-place-close]')?.setAttribute('aria-label', t('close'));
        document.querySelector('[data-mobile-special-close]')?.setAttribute('aria-label', t('close'));
        if (state.currentSite) {
            renderStaticLabels(state.currentSite);
            if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(sheet);
            const tags = String(siteTagsMapping?.[state.currentSite.name] || '').split(',').map(s => s.trim()).filter(Boolean);
            const tagBox = document.getElementById('mobile-place-tags');
            if (tagBox) {
                tagBox.innerHTML = '';
                tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'mobile-place-tag';
                    span.textContent = translatedTag(tag);
                    tagBox.appendChild(span);
                });
            }
        }
    }

    function siteCoord(site) {
        const latAbs = Math.abs(Number(site.lat || 0));
        const lngAbs = Math.abs(Number(site.lng || 0));
        return `${latAbs.toFixed(5)}°${Number(site.lat) >= 0 ? 'N' : 'S'} · ${lngAbs.toFixed(5)}°${Number(site.lng) >= 0 ? 'E' : 'W'}`;
    }

    function translatedTag(tag) {
        const node = document.querySelector(`.index-tag[data-tag="${CSS.escape(tag)}"]`);
        return (node?.textContent || tag).trim();
    }

    function cleanFileLabel(node, item, id) {
        let text = (node?.textContent || '').replace(/[├└│─\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
        if (item?.src) {
            const file = String(item.src).split('/').pop();
            if (file) return file;
        }
        if (item?.front) {
            const file = String(item.front).split('/').pop();
            if (file) return file;
        }
        return text || id;
    }

    function attachmentGroup(id, item) {
        const mode = String(item?.mode || '').toLowerCase();
        const type = String(item?.type || '').toLowerCase();
        if (type.includes('graphic score') || id.includes('score') || id === 'plague-scan') return 'special';
        if (mode === 'image' || /\.(jpe?g|png|webp|gif)$/i.test(item?.src || '')) return 'images';
        if (mode === 'pdf') return 'documents';
        if (mode === 'text' || /\.txt$/i.test(item?.src || '')) return 'texts';
        if (mode === 'video' || mode === 'audio' || type.includes('instrument')) return 'media';
        if (mode === 'card') return 'special';
        return 'other';
    }

    function extractFiles(treeHTML) {
        const holder = document.createElement('div');
        holder.innerHTML = treeHTML || '';
        const registry = typeof ensureAttachmentRegistry === 'function' ? ensureAttachmentRegistry() : (window.attachmentRegistry || {});
        const seen = new Set();
        const files = [];
        holder.querySelectorAll('[onclick*="openAttachmentViewer"]').forEach(node => {
            const raw = node.getAttribute('onclick') || '';
            const m = raw.match(/openAttachmentViewer\(['\"]([^'\"]+)['\"]\)/);
            if (!m || seen.has(m[1])) return;
            const id = m[1]; seen.add(id);
            const item = registry?.[id] || null;
            files.push({ id, item, group: attachmentGroup(id, item), label: cleanFileLabel(node, item, id) });
        });
        return files;
    }

    const GROUPS = ['images','documents','texts','media','special','other'];
    function groupTitle(group) { return t(group); }

    function renderDirectory(files) {
        const dir = document.getElementById('mobile-archive-directory');
        const total = document.getElementById('mobile-archive-total');
        if (!dir || !total) return;
        total.textContent = `${String(files.length).padStart(2,'0')} ${t('items')}`;
        dir.innerHTML = '';
        GROUPS.forEach(group => {
            const subset = files.filter(file => file.group === group);
            if (!subset.length) return;
            const details = document.createElement('details');
            details.className = 'mobile-archive-group';
            if (group === 'images') details.open = true;
            const summary = document.createElement('summary');
            summary.innerHTML = `<span>${groupTitle(group)}</span><span class="mobile-archive-count">${String(subset.length).padStart(2,'0')}</span>`;
            details.appendChild(summary);
            const list = document.createElement('div');
            list.className = 'mobile-archive-files';
            subset.forEach((file, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mobile-archive-file';
                btn.dataset.attachmentId = file.id;
                btn.innerHTML = `<span class="mobile-archive-file-glyph">${index === subset.length - 1 ? '└' : '├'}</span><span class="mobile-archive-file-name"></span><span class="mobile-archive-file-arrow">›</span>`;
                btn.querySelector('.mobile-archive-file-name').textContent = file.label;
                list.appendChild(btn);
            });
            details.appendChild(list);
            dir.appendChild(details);
        });
    }

    function findSpecialScore(files) {
        return files.find(f => f.group === 'special' && (f.id.includes('score') || f.id === 'plague-scan' || String(f.item?.type || '').toLowerCase().includes('graphic score')))
            || files.find(f => f.group === 'special')
            || null;
    }

    function renderStaticLabels(site) {
        const type = document.getElementById('mobile-place-type');
        if (type) {
            type.innerHTML = `<span data-i18n="${site.type === 'garden' ? 'ui_garden' : 'ui_record'}">${site.type === 'garden' ? '废墟园林' : '遗构录'}</span> · ${t('mobileEyebrow')}`;
            if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(type);
        }
    }

    function renderMobilePlace(site, index, treeHTML, requestedState = 'peek') {
        if (!isMobileArchiveMode() || !site) return false;
        const sheet = ensureUI();
        state.currentSite = site;
        state.currentIndex = Number.isFinite(index) ? index : sites.indexOf(site);
        state.treeHTML = treeHTML || '';
        state.sheetState = requestedState === 'open' ? 'open' : 'peek';

        document.body.classList.add('mobile-site-selected', 'mobile-place-active');
        document.body.classList.toggle('mobile-place-open', state.sheetState === 'open');
        document.body.dataset.mobileSiteType = site.type === 'garden' ? 'garden' : 'record';

        const indexDrawer = document.getElementById('index-drawer');
        indexDrawer?.classList.remove('open');
        document.getElementById('mobile-left-drawer')?.classList.remove('open');
        document.getElementById('mobile-right-drawer')?.classList.remove('open');

        const title = document.getElementById('mobile-place-title');
        title.textContent = site.name;
        title.setAttribute('data-i18n', `site_name_${site.name}`);
        document.getElementById('mobile-place-coord').textContent = siteCoord(site);
        document.getElementById('mobile-place-date').textContent = site.archiveDate || '';
        const summary = document.getElementById('mobile-place-summary');
        summary.textContent = site.desc || '';
        summary.setAttribute('data-i18n', `site_desc_${site.name}`);

        const tags = String(siteTagsMapping?.[site.name] || '').split(',').map(s => s.trim()).filter(Boolean);
        const tagBox = document.getElementById('mobile-place-tags');
        tagBox.innerHTML = '';
        tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'mobile-place-tag';
            span.textContent = translatedTag(tag);
            tagBox.appendChild(span);
        });

        const files = extractFiles(treeHTML);
        renderDirectory(files);
        const score = site.type === 'garden' ? findSpecialScore(files) : null;
        const actions = document.getElementById('mobile-special-actions');
        actions.hidden = !score;
        actions.dataset.scoreId = score?.id || '';

        renderStaticLabels(site);
        if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(sheet);
        syncCopy();
        sheet.dataset.state = state.sheetState;
        sheet.setAttribute('aria-hidden', 'false');
        document.getElementById('mobile-place-scroll').scrollTop = 0;
        return true;
    }
    window.renderMobilePlace = renderMobilePlace;

    function setSheetState(next) {
        const sheet = ensureUI();
        if (!['closed','peek','open'].includes(next)) return;
        state.sheetState = next;
        sheet.dataset.state = next;
        sheet.setAttribute('aria-hidden', next === 'closed' ? 'true' : 'false');
        document.body.classList.toggle('mobile-place-open', next === 'open');
        document.body.classList.toggle('mobile-place-active', next !== 'closed');
    }
    window.setMobilePlaceSheetState = setSheetState;

    function closeSheet({ keepSelection = true } = {}) {
        setSheetState('closed');
        if (!keepSelection) {
            state.currentSite = null;
            state.currentIndex = -1;
            document.body.classList.remove('mobile-site-selected');
            document.body.removeAttribute('data-mobile-site-type');
        }
    }
    window.closeMobilePlaceSheet = closeSheet;

    function specialSource(item) {
        return item?.front || item?.src || '';
    }
    function openSpecial(mode = 'score') {
        const actions = document.getElementById('mobile-special-actions');
        const id = actions?.dataset.scoreId;
        if (!id) return;
        const registry = typeof ensureAttachmentRegistry === 'function' ? ensureAttachmentRegistry() : (window.attachmentRegistry || {});
        const item = registry?.[id];
        const src = specialSource(item);
        if (!src) {
            if (typeof openAttachmentViewer === 'function') openAttachmentViewer(id);
            return;
        }
        const panel = ensureUI() && document.getElementById('mobile-special-record');
        const image = document.getElementById('mobile-special-image');
        const title = document.getElementById('mobile-special-title');
        state.specialAttachmentId = id;
        state.specialMode = mode;
        title.textContent = state.currentSite?.name || '';
        image.alt = state.currentSite?.name || '';
        image.src = src;
        panel.hidden = false;
        setSpecialMode(mode);
    }

    function closeSpecial() {
        const panel = document.getElementById('mobile-special-record');
        if (panel) panel.hidden = true;
        const image = document.getElementById('mobile-special-image');
        if (image) image.removeAttribute('src');
        state.specialAttachmentId = null;
    }

    function setSpecialMode(mode) {
        state.specialMode = mode === 'pointer' ? 'pointer' : 'score';
        const pointer = document.getElementById('mobile-special-pointer');
        if (pointer) pointer.hidden = state.specialMode !== 'pointer';
        const readout = document.getElementById('mobile-special-readout');
        if (readout) readout.textContent = state.specialMode === 'pointer' ? t('pointerIdle') : t('scoreIdle');
    }

    function locatePointer(event) {
        if (state.specialMode !== 'pointer') return;
        const stage = document.getElementById('mobile-special-stage');
        const pointer = document.getElementById('mobile-special-pointer');
        const readout = document.getElementById('mobile-special-readout');
        if (!stage || !pointer || !readout) return;
        const rect = stage.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left + stage.scrollLeft));
        const y = Math.max(0, Math.min(stage.scrollHeight, event.clientY - rect.top + stage.scrollTop));
        pointer.style.left = `${x}px`;
        pointer.style.top = `${y}px`;
        const xp = Math.round(Math.max(0, Math.min(100, (event.clientX - rect.left) / Math.max(1, rect.width) * 100)));
        const yp = Math.round(Math.max(0, Math.min(100, (event.clientY - rect.top) / Math.max(1, rect.height) * 100)));
        readout.textContent = `X ${xp} · Y ${yp}`;
    }

    function bindUIOnce() {
        const sheet = document.getElementById('mobile-place-sheet');
        if (!sheet || sheet.dataset.bound === '1') return;
        sheet.dataset.bound = '1';
        sheet.addEventListener('click', event => {
            if (event.target.closest('[data-mobile-place-close]')) { closeSheet({keepSelection:true}); return; }
            if (event.target.closest('[data-mobile-place-toggle]')) { setSheetState(state.sheetState === 'open' ? 'peek' : 'open'); return; }
            const file = event.target.closest('[data-attachment-id]');
            if (file) {
                const id = file.dataset.attachmentId;
                if (id && typeof openAttachmentViewer === 'function') openAttachmentViewer(id);
                return;
            }
            const special = event.target.closest('[data-mobile-special]');
            if (special) { openSpecial(special.dataset.mobileSpecial); return; }
        });
        const grip = sheet.querySelector('.mobile-place-grip');
        grip?.addEventListener('pointerdown', event => { state.dragStartY = event.clientY; }, {passive:true});
        grip?.addEventListener('pointerup', event => {
            if (state.dragStartY == null) return;
            const dy = event.clientY - state.dragStartY;
            state.dragStartY = null;
            if (dy < -26) setSheetState('open');
            else if (dy > 26) setSheetState(state.sheetState === 'open' ? 'peek' : 'closed');
        }, {passive:true});

        const panel = document.getElementById('mobile-special-record');
        panel?.addEventListener('click', event => {
            if (event.target.closest('[data-mobile-special-close]')) { closeSpecial(); return; }
            const mode = event.target.closest('[data-mobile-special-mode]');
            if (mode) { setSpecialMode(mode.dataset.mobileSpecialMode); return; }
        });
        document.getElementById('mobile-special-stage')?.addEventListener('pointerdown', locatePointer, {passive:true});
    }

    /* Build the mobile directory from the already authoritative v290 tree.
       This intentionally reuses v290's attachment mapping instead of keeping a
       second mobile-only database that could drift out of sync. */
    const desktopOpenDrawer = window.openDrawer;
    if (typeof desktopOpenDrawer === 'function') {
        window.openDrawer = function mobileAwareOpenDrawer(site, marker) {
            if (!isMobileArchiveMode()) return desktopOpenDrawer(site, marker);
            desktopOpenDrawer(site, marker);
            const treeHTML = document.querySelector('#drawer-content .drawer-section.tree')?.innerHTML || '';
            document.getElementById('archive-drawer')?.classList.remove('open');
            document.getElementById('drawer-mask')?.classList.remove('show');
            const index = sites.indexOf(site);
            const requested = window.__mobilePlaceRequestedState || 'peek';
            window.__mobilePlaceRequestedState = null;
            renderMobilePlace(site, index, treeHTML, requested);
        };
    }

    const desktopOpenDrawerByIndex = window.openDrawerByIndex;
    if (typeof desktopOpenDrawerByIndex === 'function') {
        window.openDrawerByIndex = function mobileAwareOpenDrawerByIndex(i) {
            if (!isMobileArchiveMode()) return desktopOpenDrawerByIndex(i);
            const item = markers?.[i];
            if (!item) return;
            activeSiteIndex = i;
            syncMobileSideRailContext?.(item.site);
            closeAllSitePopups?.();
            window.__mobilePlaceRequestedState = 'open';
            window.openDrawer(item.site, item.marker);
            updateMarkerState?.();
        };
    }

    const desktopFlyToSite = window.flyToSite;
    if (typeof desktopFlyToSite === 'function') {
        window.flyToSite = function mobileAwareFlyToSite(site, index, fromIndexDrawer = false) {
            if (!isMobileArchiveMode()) return desktopFlyToSite(site, index, fromIndexDrawer);
            if (!site) return;
            activeSiteIndex = index;
            syncMobileSideRailContext?.(site);
            const canonical = geoToSVG(site.lat, site.lng);
            const pos = getNearestWrappedLatLng(canonical);
            const currentZoom = map.getZoom();
            map.flyTo(pos, Math.max(3, Math.min(4.2, currentZoom + .8)), { duration: .7, easeLinearity: .24 });
            closeAllSitePopups?.();
            window.__mobilePlaceRequestedState = 'peek';
            window.openDrawer(site, markers?.[index]?.marker);
            updateMarkerState?.();
            setTimeout(() => flashMarkerCrosshair?.(markers?.[index]?.marker), 120);
        };
    }

    /* Pass11: a direct map-marker tap is discovery only.
       Keep the authored v290 popup click handler and do NOT auto-open the
       mobile archive.  The popup's archive link remains the explicit next step.
       Compass arrivals continue to auto-open the archive separately. */
    if (false && Array.isArray(window.markers || markers)) {
        markers.forEach((markerData, index) => {
            markerData?.copies?.forEach(marker => {
                marker.on('click', () => {
                    if (!isMobileArchiveMode()) return;
                    activeSiteIndex = index;
                    closeAllSitePopups?.();
                    syncMobileSideRailContext?.(markerData.site);
                    window.__mobilePlaceRequestedState = 'peek';
                    window.openDrawer(markerData.site, marker);
                    updateMarkerState?.();
                });
            });
        });
    }

    /* Opening the lexicology drawer restores discovery mode while preserving
       the current map selection and the side-frame handles. */
    document.getElementById('bottom-center-label')?.addEventListener('click', () => {
        if (isMobileArchiveMode()) closeSheet({keepSelection:true});
    }, true);

    document.addEventListener('click', event => {
        if (event.target.closest('.bottom-stele-lang-option, .index-inscription-lang-toggle')) {
            setTimeout(syncCopy, 30);
        }
    });
    new MutationObserver(syncCopy).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('resize', () => {
        if (!isMobileArchiveMode()) {
            closeSpecial();
            closeSheet({keepSelection:true});
        }
    }, {passive:true});

    ensureUI();
})();


/* ==========================================================================
   v290-mobile-compass-pass4 · compass-first discovery + side archive pages
   ========================================================================== */
(() => {
    const isMobilePass4 = () => typeof window.isCompactViewport === 'function'
        ? window.isCompactViewport()
        : false;

    const copy = {
        zh: {
            record:'遗构录', garden:'废墟园林', archive:'馆藏档案', files:'档案', intro:'简介', score:'图形记谱', pointer:'记录指针', empty:'无可见地点',
            theater:'废墟剧场', images:'图像档案', statement:'Statement',
            desktopHint:'完整浏览内容与体验，请参观网页版。'
        },
        en: {
            record:'Ruin Record', garden:'Ruin Garden', archive:'Archive', files:'Files', intro:'Introduction', score:'Graphic score', pointer:'Record pointer', empty:'No visible sites',
            theater:'Ruin Theater', images:'Images', statement:'Statement',
            desktopHint:'Visit the desktop version for the complete archive and full experience.'
        },
        ja: {
            record:'遺構録', garden:'廃墟庭園', archive:'収蔵資料', files:'資料', intro:'紹介', score:'図形楽譜', pointer:'記録ポインタ', empty:'表示地点なし',
            theater:'廃墟劇場', images:'画像記録', statement:'Statement',
            desktopHint:'全内容と完全な閲覧体験はデスクトップ版をご覧ください。'
        }
    };
    const langKey = () => {
        const raw = String(window.currentLang || document.documentElement.lang || 'zh').toLowerCase();
        return raw.startsWith('ja') ? 'ja' : raw.startsWith('en') ? 'en' : 'zh';
    };
    const tx = key => (copy[langKey()] || copy.zh)[key] || key;

    /* ---------- Visible language switcher ---------- */
    function syncMobileLanguageSwitcher() {
        const active = langKey();
        document.querySelectorAll('#mobile-language-switcher [data-mobile-lang]').forEach(btn => {
            const on = btn.dataset.mobileLang === active;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function installLanguageSwitcher() {
        // v291-opt59 · restore the compact language control itself.
        // Earlier mobile passes kept the CSS and event wiring but the actual
        // #mobile-language-switcher node disappeared, leaving the upper-left
        // corner empty. Recreate it here so this repair does not depend on an
        // additional HTML replacement and remains mobile-only through CSS.
        let switcher = document.getElementById('mobile-language-switcher');
        if (!switcher) {
            switcher = document.createElement('nav');
            switcher.id = 'mobile-language-switcher';
            switcher.className = 'mobile-language-switcher';
            switcher.setAttribute('aria-label', '语言 / Language / 言語');
            switcher.innerHTML = `
                <button type="button" data-mobile-lang="zh" aria-pressed="false">简</button>
                <button type="button" data-mobile-lang="en" aria-pressed="false">EN</button>
                <button type="button" data-mobile-lang="ja" aria-pressed="false">JP</button>
            `;
            document.body.appendChild(switcher);
        }
        if (switcher.dataset.bound === '1') {
            syncMobileLanguageSwitcher();
            return;
        }
        switcher.dataset.bound = '1';
        switcher.addEventListener('click', event => {
            const btn = event.target.closest('[data-mobile-lang]');
            if (!btn || !isMobilePass4()) return;
            event.preventDefault();
            event.stopPropagation();
            if (typeof switchLanguage === 'function') switchLanguage(btn.dataset.mobileLang);
            syncMobileLanguageSwitcher();
            window.setTimeout(() => {
                const st = window.__mobileSideArchiveState;
                if (st?.site && typeof window.openDrawer === 'function') {
                    window.openDrawer(st.site, markers?.[st.index]?.marker);
                }
                window.__mobileCompassPass4?.refresh?.();
            }, 40);
        });
        new MutationObserver(syncMobileLanguageSwitcher).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
        syncMobileLanguageSwitcher();
    }

    /* ---------- Compass-first mobile discovery ---------- */
    const compassState = { record:true, garden:true, selectedIndex:-1, scrollTimer:null };

    function ensureMobileCompassBrowser() {
        /* pass5: retired. The authored desktop compass wheel is reused on mobile. */
        return null;
    }

    function visibleSiteIndices() {
        return sites.map((site,index)=>({site,index})).filter(({site}) => site.type === 'garden' ? compassState.garden : compassState.record).map(v=>v.index);
    }

    function applyMarkerFilter() {
        if (!Array.isArray(markers) || typeof map === 'undefined') return;
        markers.forEach((entry,index) => {
            const site = sites[index];
            const show = site?.type === 'garden' ? compassState.garden : compassState.record;
            (entry?.copies || []).forEach(marker => {
                try {
                    const onMap = map.hasLayer(marker);
                    if (show && !onMap) marker.addTo(map);
                    if (!show && onMap) map.removeLayer(marker);
                } catch (_) {}
            });
        });
    }

    function updateFilterUI() {
        const recordCount = sites.filter(s => s.type !== 'garden').length;
        const gardenCount = sites.filter(s => s.type === 'garden').length;
        document.querySelectorAll('.mobile-compass-filter').forEach(btn => {
            const type = btn.dataset.mobileCompassType;
            const on = !!compassState[type];
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-checked', on ? 'true' : 'false');
            btn.querySelector('.mobile-compass-check').textContent = '';
            btn.querySelector('.mobile-compass-filter-label').textContent = tx(type);
            btn.querySelector('.mobile-compass-count').textContent = String(type === 'record' ? recordCount : gardenCount).padStart(2,'0');
        });
    }

    function setCompassPreview(index, {center=false} = {}) {
        const site = sites[index];
        if (!site) return;
        compassState.selectedIndex = index;
        const wheel = document.getElementById('mobile-compass-wheel');
        wheel?.querySelectorAll('[data-site-index]').forEach(item => {
            const active = Number(item.dataset.siteIndex) === index;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', active ? 'true' : 'false');
            if (active && center) item.scrollIntoView({block:'center', behavior:'smooth'});
        });
        const thumb = document.getElementById('mobile-compass-thumbnail');
        if (thumb && typeof mountStaticThumbnail === 'function') mountStaticThumbnail(thumb, site, undefined, 128);
        const target = markers?.[index];
        if (target?.marker && typeof window.setCompassTarget === 'function') window.setCompassTarget(target.marker);
    }

    function refreshCompassWheel({preserve=true} = {}) {
        const panel = ensureMobileCompassBrowser();
        if (!panel) return;
        updateFilterUI();
        const wheel = panel.querySelector('#mobile-compass-wheel');
        const indices = visibleSiteIndices();
        const keep = preserve && indices.includes(compassState.selectedIndex) ? compassState.selectedIndex : (indices[0] ?? -1);
        wheel.replaceChildren();
        if (!indices.length) {
            const empty = document.createElement('div');
            empty.className = 'mobile-compass-empty';
            empty.textContent = tx('empty');
            wheel.appendChild(empty);
            const thumb = document.getElementById('mobile-compass-thumbnail');
            thumb?.replaceChildren();
            thumb?.classList.remove('has-image');
            compassState.selectedIndex = -1;
            applyMarkerFilter();
            return;
        }
        const frag = document.createDocumentFragment();
        indices.forEach(index => {
            const site = sites[index];
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'mobile-compass-site';
            item.dataset.siteIndex = String(index);
            item.setAttribute('role','option');
            item.setAttribute('aria-selected','false');
            item.innerHTML = `<span data-i18n="site_name_${site.name}">${site.name}</span>`;
            frag.appendChild(item);
        });
        wheel.appendChild(frag);
        if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(wheel);
        applyMarkerFilter();
        window.requestAnimationFrame(() => setCompassPreview(keep, {center:true}));
    }

    function closeSideArchives() {
        document.getElementById('mobile-left-drawer')?.classList.remove('open');
        document.getElementById('mobile-right-drawer')?.classList.remove('open');
        document.body.classList.remove('mobile-side-archive-open');
    }
    window.closeMobileSideArchives = closeSideArchives;

    function installMobileCompassBrowser() {
        const module = document.getElementById('global-compass-module');
        const btn = document.getElementById('global-compass-btn');
        const panel = ensureMobileCompassBrowser();
        if (!module || !btn || !panel || panel.dataset.bound === '1') return;
        panel.dataset.bound = '1';

        btn.setAttribute('role','button');
        btn.setAttribute('aria-controls','mobile-compass-browser');
        btn.addEventListener('click', () => {
            if (!isMobilePass4()) return;
            const open = module.classList.contains('expanded');
            panel.setAttribute('aria-hidden', open ? 'false' : 'true');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                closeSideArchives();
                document.getElementById('index-drawer')?.classList.remove('open');
                refreshCompassWheel();
            }
        });

        panel.addEventListener('click', event => {
            const filter = event.target.closest('[data-mobile-compass-type]');
            if (filter) {
                event.preventDefault();
                event.stopPropagation();
                const type = filter.dataset.mobileCompassType;
                compassState[type] = !compassState[type];
                refreshCompassWheel({preserve:true});
                return;
            }
            const item = event.target.closest('[data-site-index]');
            if (item) {
                event.preventDefault();
                event.stopPropagation();
                const index = Number(item.dataset.siteIndex);
                setCompassPreview(index, {center:true});
                const site = sites[index];
                if (site && typeof window.flyToSite === 'function') window.flyToSite(site, index);
                module.classList.remove('expanded');
                panel.setAttribute('aria-hidden','true');
                btn.setAttribute('aria-expanded','false');
            }
        });

        panel.querySelector('#mobile-compass-wheel')?.addEventListener('scroll', () => {
            window.clearTimeout(compassState.scrollTimer);
            compassState.scrollTimer = window.setTimeout(() => {
                const wheel = document.getElementById('mobile-compass-wheel');
                if (!wheel) return;
                const center = wheel.getBoundingClientRect().top + wheel.clientHeight / 2;
                let best=null, bestDiff=Infinity;
                wheel.querySelectorAll('[data-site-index]').forEach(item => {
                    const rect=item.getBoundingClientRect();
                    const diff=Math.abs(rect.top + rect.height/2 - center);
                    if (diff < bestDiff) { bestDiff=diff; best=item; }
                });
                if (best) setCompassPreview(Number(best.dataset.siteIndex));
            }, 90);
        }, {passive:true});

        updateFilterUI();
        refreshCompassWheel({preserve:false});
    }

    window.__mobileCompassPass4 = { refresh: () => window.__mobileCompassPass5?.refresh?.(), closeArchives: closeSideArchives };

    /* ---------- Side drawers become simple archive pages ---------- */
    window.__mobileSideArchiveState = { site:null, index:-1, treeHTML:'' };

    function dmsCoord(site) {
        try {
            return `${String(formatLat(Number(site.lat))).trim()} · ${String(formatLng(Number(site.lng))).trim()}`;
        } catch (_) {
            return '';
        }
    }

    function translatedTagText(tag) {
        try {
            const node = document.querySelector(`.index-tag[data-tag="${CSS.escape(tag)}"]`);
            return (node?.textContent || tag).trim();
        } catch (_) { return tag; }
    }

    function archiveTileMeta(item, id) {
        const src = String(item?.src || item?.front || '');
        const mode = String(item?.mode || '').toLowerCase();
        const type = String(item?.type || '').toLowerCase();
        const visual = /\.(jpe?g|png|webp|gif)$/i.test(src) || mode === 'image' || (mode === 'card' && !!item?.front);
        let badge = 'FILE';
        if (mode === 'pdf' || /\.pdf$/i.test(src)) badge = 'PDF';
        else if (mode === 'text' || /\.txt$/i.test(src)) badge = 'TXT';
        else if (mode === 'video' || /\.(mp4|webm|mov)$/i.test(src)) badge = 'VIDEO';
        else if (mode === 'audio' || /\.(wav|mp3|m4a|ogg)$/i.test(src)) badge = 'AUDIO';
        else if (type.includes('graphic score') || mode === 'card') badge = 'SCORE';
        return { src, visual, badge, id };
    }

    function collectSideArchiveAttachments(hiddenDir) {
        const registry = typeof ensureAttachmentRegistry === 'function'
            ? ensureAttachmentRegistry()
            : (window.attachmentRegistry || {});
        const seen = new Set();
        const files = [];
        hiddenDir?.querySelectorAll('[data-attachment-id]').forEach(node => {
            const id = node.dataset.attachmentId;
            if (!id || seen.has(id)) return;
            seen.add(id);
            const item = registry?.[id] || null;
            const label = node.querySelector('.mobile-archive-file-name')?.textContent?.trim()
                || String(item?.src || item?.front || id).split('/').pop()
                || id;
            files.push({ id, item, label, ...archiveTileMeta(item, id) });
        });
        return files;
    }

    function createMobileArchiveButton(file, options = {}) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = options.className || `mobile-side-media-card${file.visual ? ' is-visual' : ' is-file'}`;
        btn.dataset.attachmentId = file.id;
        btn.setAttribute('aria-label', options.ariaLabel || file.label);

        if (options.textOnly) {
            const label = document.createElement('span');
            label.className = options.labelClass || 'mobile-side-media-label';
            label.textContent = options.text || file.label;
            btn.appendChild(label);
            return btn;
        }

        if (file.visual && file.src) {
            const img = document.createElement('img');
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.dataset.mobileSrc = file.src;
            btn.appendChild(img);
        } else {
            const badge = document.createElement('span');
            badge.className = 'mobile-side-media-badge';
            badge.textContent = file.badge;
            btn.appendChild(badge);
        }

        const label = document.createElement('span');
        label.className = 'mobile-side-media-label';
        label.textContent = options.text || file.label;
        btn.appendChild(label);
        return btn;
    }

    let mobileArchiveImageObserver = null;
    function hydrateMobileArchiveImages(root) {
        if (!root) return;
        mobileArchiveImageObserver?.disconnect?.();
        mobileArchiveImageObserver = null;

        const images = [...root.querySelectorAll('img[data-mobile-src]')];
        if (!images.length) return;

        const load = img => {
            if (!img || img.src) return;
            img.src = img.dataset.mobileSrc || '';
            img.removeAttribute('data-mobile-src');
        };

        if (!('IntersectionObserver' in window)) {
            images.forEach(load);
            return;
        }

        const lite = window.isMobileLiteMode?.();
        mobileArchiveImageObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                load(entry.target);
                mobileArchiveImageObserver?.unobserve(entry.target);
            });
        }, {
            root: root.closest('.mobile-drawer-content') || null,
            rootMargin: lite ? '72px 0px' : '180px 0px',
            threshold: 0.01
        });

        images.forEach(img => mobileArchiveImageObserver.observe(img));
    }

    function recordArchiveCategory(file) {
        const src = String(file?.src || '');
        const item = file?.item || null;
        const category = typeof classifyAttachment === 'function'
            ? classifyAttachment(src, item)
            : 'otherFiles';
        return category;
    }

    const RECORD_MOBILE_GROUPS = [
        ['visualFiles', 'specimen_visual', '视觉标本'],
        ['audioFiles', 'specimen_audio', '声音标本'],
        ['objectFiles', 'specimen_object', '物件标本'],
        ['noteFiles', 'specimen_note', '注释卡']
    ];

    function renderRecordArchiveMedia(container, attachments) {
        container.classList.add('mobile-record-zones');
        RECORD_MOBILE_GROUPS.forEach(([category, i18nKey, fallback]) => {
            const subset = attachments.filter(file => recordArchiveCategory(file) === category);
            const zone = document.createElement('section');
            zone.className = `mobile-record-zone mobile-record-zone-${category}`;

            const head = document.createElement('div');
            head.className = 'mobile-record-zone-head';
            head.innerHTML = `
                <span data-i18n="${i18nKey}">${fallback}</span>
                <span class="mobile-record-zone-count">${String(subset.length).padStart(2, '0')}</span>
            `;
            zone.appendChild(head);

            const list = document.createElement('div');
            list.className = `mobile-record-zone-list${category === 'visualFiles' ? ' is-visual-grid' : ''}`;

            subset.forEach(file => {
                list.appendChild(createMobileArchiveButton(file, {
                    className: `mobile-side-media-card${file.visual ? ' is-visual' : ' is-file'}`
                }));
            });

            if (!subset.length) {
                const empty = document.createElement('div');
                empty.className = 'mobile-record-zone-empty';
                empty.textContent = '—';
                list.appendChild(empty);
            }

            zone.appendChild(list);
            container.appendChild(zone);
        });
    }

    function renderGardenArchiveMedia(container, attachments) {
        container.classList.add('mobile-garden-archive');

        const theater = attachments.find(file =>
            file.item?.mode === 'video' &&
            /(?:^|\/)folly(?:-\d+)?\.mp4$/i.test(file.src)
        ) || attachments.find(file =>
            String(file.item?.type || '').toLowerCase().includes('ruin garden footage')
        );

        const images = attachments.filter(file => file.item?.mode === 'image');
        const statement = attachments.find(file =>
            file.item?.mode === 'text' &&
            /statement\.txt$/i.test(file.src)
        );

        // Intentionally omit instrument / score / mapping from the compact
        // archive surface. They remain untouched in the registry and desktop UI.
        if (theater) {
            container.appendChild(createMobileArchiveButton(theater, {
                className: 'mobile-garden-theater',
                textOnly: true,
                labelClass: 'mobile-garden-theater-label',
                text: tx('theater'),
                ariaLabel: tx('theater')
            }));
        }

        const imageSection = document.createElement('section');
        imageSection.className = 'mobile-garden-images';

        const imageHead = document.createElement('div');
        imageHead.className = 'mobile-garden-images-head';
        imageHead.innerHTML = `<span>${tx('images')}</span><span>${String(images.length).padStart(2, '0')}</span>`;
        imageSection.appendChild(imageHead);

        const imageGrid = document.createElement('div');
        imageGrid.className = 'mobile-garden-image-grid';
        images.forEach(file => imageGrid.appendChild(createMobileArchiveButton(file, {
            className: 'mobile-side-media-card mobile-garden-image-card is-visual'
        })));
        imageSection.appendChild(imageGrid);
        container.appendChild(imageSection);

        if (statement) {
            container.appendChild(createMobileArchiveButton(statement, {
                className: 'mobile-garden-statement',
                textOnly: true,
                labelClass: 'mobile-garden-statement-label',
                text: tx('statement'),
                ariaLabel: tx('statement')
            }));
        }

        const hint = document.createElement('p');
        hint.className = 'mobile-garden-desktop-hint';
        hint.textContent = tx('desktopHint');
        container.appendChild(hint);
    }

    function renderSideArchive(site, index, treeHTML='') {
        if (!isMobilePass4() || !site) return;
        const isGarden = site.type === 'garden';
        const target = document.getElementById(isGarden ? 'mobile-right-drawer' : 'mobile-left-drawer');
        const other = document.getElementById(isGarden ? 'mobile-left-drawer' : 'mobile-right-drawer');
        const content = document.getElementById(isGarden ? 'mobile-garden-list' : 'mobile-record-list');
        if (!target || !content) return;
        window.__mobileSideArchiveState = {site,index,treeHTML};

        other?.classList.remove('open');
        const hiddenDir = document.getElementById('mobile-archive-directory');
        const attachments = collectSideArchiveAttachments(hiddenDir);
        content.innerHTML = `
            <article class="mobile-side-archive-page">
                <header class="mobile-side-archive-head">
                    <div class="mobile-side-archive-family"><span data-i18n="${isGarden ? 'ui_garden' : 'ui_record'}">${isGarden ? tx('garden') : tx('record')}</span> · ${tx('archive')}</div>
                    <button type="button" class="mobile-side-archive-close" aria-label="Close">×</button>
                </header>
                <h2 class="mobile-side-archive-title" data-i18n="site_name_${site.name}">${site.name}</h2>
                <div class="mobile-side-archive-meta"><span>${dmsCoord(site)}</span><span>${site.archiveDate || ''}</span></div>
                <div class="mobile-side-archive-identity">${
                    isGarden
                        ? `<span data-i18n="ui_creator">墟构师: 罗清源</span>`
                        : `<span data-i18n="ui_recorder_label">记录者: </span><span class="mobile-side-recorder-name">${site.recorder || '罗清源'}</span>${typeof buildArchiveDocSecondaryRecords === 'function' ? buildArchiveDocSecondaryRecords([site]) : ''}`
                }</div>
                <section class="mobile-side-archive-description" data-expanded="false">
                    <div class="mobile-side-archive-description-label">${tx('intro')}</div>
                    <p class="mobile-side-archive-description-text" data-i18n="site_desc_${site.name}"></p>
                    <button type="button" class="mobile-side-archive-description-toggle" aria-expanded="false" aria-label="Expand description">[...]</button>
                </section>
                <section class="mobile-side-media">
                    <div class="mobile-side-media-grid"></div>
                </section>
            </article>`;

        const descriptionBox = content.querySelector('.mobile-side-archive-description');
        const descriptionText = content.querySelector('.mobile-side-archive-description-text');
        const descriptionToggle = content.querySelector('.mobile-side-archive-description-toggle');
        if (descriptionText) descriptionText.textContent = site.desc || '';

        function syncMobileArchiveDescriptionToggle() {
            if (!descriptionBox || !descriptionText || !descriptionToggle) return;
            const expanded = descriptionBox.dataset.expanded === 'true';
            if (expanded) {
                descriptionToggle.hidden = false;
                descriptionToggle.textContent = '[ < ]';
                descriptionToggle.setAttribute('aria-expanded', 'true');
                descriptionToggle.setAttribute('aria-label', 'Collapse description');
                return;
            }

            // Measure the translated copy only after layout has settled.
            // Temporarily lift the two-line clamp so scrollHeight reflects the
            // real paragraph rather than the clipped mobile presentation.
            const lineHeight = parseFloat(getComputedStyle(descriptionText).lineHeight) || 18;
            descriptionText.style.setProperty('display', 'block', 'important');
            descriptionText.style.setProperty('-webkit-line-clamp', 'unset', 'important');
            descriptionText.style.setProperty('overflow', 'visible', 'important');
            const fullHeight = descriptionText.scrollHeight;
            descriptionText.style.removeProperty('display');
            descriptionText.style.removeProperty('-webkit-line-clamp');
            descriptionText.style.removeProperty('overflow');
            const needsToggle = fullHeight > lineHeight * 2 + 2;
            descriptionToggle.hidden = !needsToggle;
            descriptionToggle.textContent = '[...]';
            descriptionToggle.setAttribute('aria-expanded', 'false');
            descriptionToggle.setAttribute('aria-label', 'Expand description');
        }

        if (descriptionToggle) {
            descriptionToggle.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const nextExpanded = descriptionBox.dataset.expanded !== 'true';
                descriptionBox.dataset.expanded = nextExpanded ? 'true' : 'false';
                syncMobileArchiveDescriptionToggle();
            });
        }

        const grid = content.querySelector('.mobile-side-media-grid');
        if (isGarden) renderGardenArchiveMedia(grid, attachments);
        else renderRecordArchiveMedia(grid, attachments);

        if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(content);
        window.requestAnimationFrame(() => syncMobileArchiveDescriptionToggle());
        hydrateMobileArchiveImages(content);

        target.classList.add('open');
        document.body.classList.add('mobile-side-archive-open');
        document.body.dataset.mobileSiteType = isGarden ? 'garden' : 'record';
        document.getElementById('index-drawer')?.classList.remove('open');
        document.getElementById('global-compass-module')?.classList.remove('expanded');
        if (isMobilePass4()) window.hideCompass?.();
        document.getElementById('mobile-compass-browser')?.setAttribute('aria-hidden','true');
        window.bringDrawerToFront?.(target);
    }

    let mobileArchiveDescriptionLangRaf = 0;
    document.addEventListener('languagechange-complete', () => {
        cancelAnimationFrame(mobileArchiveDescriptionLangRaf);
        mobileArchiveDescriptionLangRaf = requestAnimationFrame(() => {
            const box = document.querySelector('.mobile-side-drawer.open .mobile-side-archive-description');
            const text = box?.querySelector('.mobile-side-archive-description-text');
            const label = box?.querySelector('.mobile-side-archive-description-label');
            const toggle = box?.querySelector('.mobile-side-archive-description-toggle');
            if (!box || !text || !toggle) return;
            if (label) label.textContent = tx('intro');
            if (box.dataset.expanded === 'true') {
                toggle.hidden = false;
                toggle.textContent = '[ < ]';
                return;
            }
            const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 18;
            text.style.setProperty('display', 'block', 'important');
            text.style.setProperty('-webkit-line-clamp', 'unset', 'important');
            text.style.setProperty('overflow', 'visible', 'important');
            const fullHeight = text.scrollHeight;
            text.style.removeProperty('display');
            text.style.removeProperty('-webkit-line-clamp');
            text.style.removeProperty('overflow');
            toggle.hidden = !(fullHeight > lineHeight * 2 + 2);
            toggle.textContent = '[...]';
        });
    });

    function installSideArchiveEvents() {
        ['mobile-left-drawer','mobile-right-drawer'].forEach(id => {
            const drawer = document.getElementById(id);
            if (!drawer || drawer.dataset.archiveBound === '1') return;
            drawer.dataset.archiveBound='1';
            drawer.addEventListener('click', event => {
                const close = event.target.closest('.mobile-side-archive-close');
                if (close) { event.preventDefault(); closeSideArchives(); return; }
                const file = event.target.closest('[data-attachment-id]');
                if (file) {
                    event.preventDefault();
                    const attachmentId = file.dataset.attachmentId;
                    if (attachmentId && typeof openAttachmentViewer === 'function') openAttachmentViewer(attachmentId);
                    return;
                }
            });
        });
    }

    /* Wrap pass3's authoritative openDrawer. It still builds the real v290 tree
       and attachment mapping; pass4 simply presents that result in the correct
       left/right archive page and suppresses the bottom place sheet. */
    const pass3OpenDrawer = window.openDrawer;
    if (typeof pass3OpenDrawer === 'function') {
        window.openDrawer = function pass4OpenDrawer(site, marker) {
            const result = pass3OpenDrawer(site, marker);
            if (!isMobilePass4() || !site) return result;
            const index = sites.indexOf(site);
            const treeHTML = document.querySelector('#drawer-content .drawer-section.tree')?.innerHTML || '';
            document.getElementById('mobile-place-sheet')?.setAttribute('aria-hidden','true');
            document.body.classList.remove('mobile-place-open');
            window.requestAnimationFrame(() => renderSideArchive(site, index, treeHTML));
            return result;
        };
    }

    function install() {
        installLanguageSwitcher();
        installMobileCompassBrowser();
        installSideArchiveEvents();
        /* Record / garden bottom labels are family labels only on mobile. */
        ['bottom-trigger-record','bottom-trigger-ruin','opened-trigger-record','opened-trigger-ruin'].forEach(id => {
            const el=document.getElementById(id);
            if (el && isMobilePass4()) { el.setAttribute('aria-disabled','true'); el.setAttribute('tabindex','-1'); }
        });
        document.getElementById('bottom-center-label')?.addEventListener('click', () => {
            if (!isMobilePass4()) return;
            closeSideArchives();
            document.getElementById('global-compass-module')?.classList.remove('expanded');
            document.getElementById('mobile-compass-browser')?.setAttribute('aria-hidden','true');
        }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
    else install();
})();

/* ========================================================================== 
   v290-mobile-compass-pass5 · native compass wheel + mobile archive intro
   ========================================================================== */
(() => {
    const MOBILE_COMPASS_QUERY = window.MOBILE_ATLAS_QUERY || '(max-width: 900px) and (min-height: 560px), (max-width: 950px) and (max-height: 560px)';
    const mobileCompassMql = window.matchMedia ? window.matchMedia(MOBILE_COMPASS_QUERY) : null;
    const isPass5Mobile = () => mobileCompassMql ? mobileCompassMql.matches : (() => {
        const w = window.innerWidth || document.documentElement.clientWidth || 0;
        const h = window.innerHeight || document.documentElement.clientHeight || 0;
        return (w <= 900 && h >= 560) || (w <= 950 && h <= 560);
    })();
    /* One authoritative predicate for every compass-wheel listener.  This prevents
       the desktop 18px/5-block scroll math from fighting the filtered mobile wheel. */
    window.__mobileCompassWheelOwned = isPass5Mobile;

    const state = {
        record: true,
        garden: true,
        selectedIndex: -1,
        scrollTimer: null,
        wheelInstalled: false,
        loopMode: false,
        recenteringLoop: false
    };

    const archiveCopy = {
        zh: {
            kicker: '遗构馆',
            lead: '《墟域图・遗构馆》收录行走途中发现的遗构、荒地与被遗忘的地景，并将相关影像、声音、文字与遗物汇入地图档案。',
            note: '移动端版本；保留地图浏览、地点档案与主要记录。完整功能请参考电脑网页端。',
            record: '遗构录',
            garden: '废墟园林',
            empty: '无可见地点',
            mechanicsLink: '［墟构机械数据库 ↗］',
            manifestoLink: '［墟构师宣言 ↗］'
        },
        en: {
            kicker: 'Relic Archive',
            lead: 'Ruin Atlas · Relic Archive gathers ruins, wastelands, and forgotten landscapes encountered while walking, bringing related images, sound, text, and objects into one map archive.',
            note: 'Mobile version; map browsing, site archives, and principal records are retained. For the complete feature set, please use the desktop website.',
            record: 'Relic Archive',
            garden: 'Folly',
            empty: 'No visible sites',
            mechanicsLink: '［Ruinwright Mechanism Archive ↗］',
            manifestoLink: '［Manifesto of the Ruinwright ↗］'
        },
        ja: {
            kicker: '遺構館',
            lead: '『墟域図・遺構館』は、歩行の途中で見つけた遺構、荒地、忘れられた景観を収録し、関連する画像・音・文章・遺物を地図資料へまとめます。',
            note: 'モバイル版；地図閲覧、地点資料、主要記録を残しています。すべての機能はデスクトップ版をご参照ください。',
            record: '遺構録',
            garden: '廃墟園林',
            empty: '表示地点なし',
            mechanicsLink: '［墟構機械データベース ↗］',
            manifestoLink: '［墟構師宣言 ↗］'
        }
    };

    function langKey() {
        /* Document language is authoritative during the decode transition.
           window.currentLang can lag one frame behind and previously left the
           mobile archive intro in Chinese after switching to English. */
        const raw = String(document.documentElement.lang || window.currentLang || 'zh').toLowerCase();
        return raw.startsWith('ja') ? 'ja' : raw.startsWith('en') ? 'en' : 'zh';
    }
    function copy(key) { return (archiveCopy[langKey()] || archiveCopy.zh)[key] || key; }

    function syncArchiveIntroCopy() {
        document.querySelectorAll('[data-mobile-archive-copy]').forEach(el => {
            const key = el.dataset.mobileArchiveCopy;
            if (key && archiveCopy[langKey()]?.[key]) el.textContent = archiveCopy[langKey()][key];
        });
    }

    function syncFilterUI() {
        const recordCount = Array.isArray(sites) ? sites.filter(s => s?.type !== 'garden').length : 0;
        const gardenCount = Array.isArray(sites) ? sites.filter(s => s?.type === 'garden').length : 0;
        const module = document.getElementById('global-compass-module');
        if (module) {
            module.dataset.recordEnabled = state.record ? 'true' : 'false';
            module.dataset.gardenEnabled = state.garden ? 'true' : 'false';
        }
        document.querySelectorAll('#mobile-compass-filters [data-mobile-compass-type]').forEach(btn => {
            const type = btn.dataset.mobileCompassType;
            const on = !!state[type];
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-checked', on ? 'true' : 'false');
            const check = btn.querySelector('.mobile-compass-check');
            const label = btn.querySelector('.mobile-compass-filter-label');
            const count = btn.querySelector('.mobile-compass-count');
            if (check) check.textContent = '';
            if (label) {
                const i18nKey = type === 'garden' ? 'ui_garden' : 'ui_record';
                label.dataset.i18n = i18nKey;
                const translated = window.languageVault?.[langKey()]?.[i18nKey]
                    ?? (typeof languageVault !== 'undefined' ? languageVault?.[langKey()]?.[i18nKey] : null)
                    ?? copy(type);
                label.textContent = translated;
            }
            if (count) count.textContent = String(type === 'garden' ? gardenCount : recordCount).padStart(2, '0');
        });
    }

    function visibleIndices() {
        if (!Array.isArray(sites)) return [];
        return sites.map((site, index) => ({site, index})).filter(({site}) => {
            return site?.type === 'garden' ? state.garden : state.record;
        }).map(({index}) => index);
    }

    // pass12: mobile reuses the authored desktop compass geometry. Width is
    // entirely CSS-driven, so language/filter refreshes can never accumulate
    // inline width and make the module grow on repeated taps.
    function syncMobileCompassMeasuredWidth() {
        const module = document.getElementById('global-compass-module');
        if (!module) return;
        module.style.removeProperty('--mobile-compass-wheel-width');
        module.style.removeProperty('--mobile-compass-expanded-width');
        module.style.removeProperty('--mobile-compass-name-font');
        module.style.removeProperty('--mobile-compass-name-active-font');
    }

    function applyMarkerFilter() {
        if (!Array.isArray(markers) || typeof map === 'undefined') return;
        markers.forEach((entry, index) => {
            const site = sites?.[index];
            const show = site?.type === 'garden' ? state.garden : state.record;
            const allMarkers = new Set([entry?.marker, ...(entry?.copies || [])].filter(Boolean));
            allMarkers.forEach(marker => {
                try {
                    const onMap = map.hasLayer(marker);
                    if (show && !onMap) marker.addTo(map);
                    if (!show && onMap) map.removeLayer(marker);
                } catch (_) {}
            });
        });
    }

    function setSelection(index, {center = false} = {}) {
        if (!Number.isFinite(index) || !sites?.[index]) return;
        state.selectedIndex = index;
        const wheel = document.getElementById('compass-site-wheel');
        if (wheel) {
            const candidates = [...wheel.querySelectorAll('.compass-wheel-item[data-real-index]')];
            candidates.forEach(item => item.classList.toggle('active', Number(item.dataset.realIndex) === index));
            if (center) {
                const current = candidates.find(item => Number(item.dataset.realIndex) === index && item.dataset.loop === '1') ||
                                candidates.find(item => Number(item.dataset.realIndex) === index);
                if (current) {
                    const targetTop = current.offsetTop - wheel.clientHeight / 2 + current.offsetHeight / 2;
                    wheel.scrollTo({top: Math.max(0, targetTop), behavior: 'smooth'});
                }
            }
        }
        const thumb = document.getElementById('compass-thumbnail-frame');
        if (thumb && typeof mountStaticThumbnail === 'function') mountStaticThumbnail(thumb, sites[index], undefined, 128);
        const target = markers?.[index];
        if (target?.marker && typeof window.setCompassTarget === 'function') window.setCompassTarget(target.marker);
    }

    function renderNativeWheel({preserve = true} = {}) {
        /* v291-opt47 · Hard ownership boundary.
           This renderer belongs only to the compact/mobile compass.  The language
           hooks below are installed on every viewport so Safari/devtools can enter
           compact mode later; without this guard those hooks could rebuild the
           desktop #compass-site-wheel after the desktop initializer had already
           centred its middle row.  That produced the visible 2-row jump
           (desktop centre item -> mobile default index 0). */
        if (!isPass5Mobile()) return;

        const wheel = document.getElementById('compass-site-wheel');
        if (!wheel) return;
        syncFilterUI();
        applyMarkerFilter();
        const indices = visibleIndices();
        let selected = preserve && indices.includes(state.selectedIndex) ? state.selectedIndex : (indices[0] ?? -1);
        wheel.scrollTop = 0;
        wheel.replaceChildren();

        if (!indices.length) {
            const empty = document.createElement('div');
            empty.className = 'compass-wheel-item active';
            empty.textContent = copy('empty');
            empty.style.opacity = '.45';
            wheel.appendChild(empty);
            state.selectedIndex = -1;
            const thumb = document.getElementById('compass-thumbnail-frame');
            thumb?.replaceChildren();
            thumb?.classList.remove('has-image');
            requestAnimationFrame(syncMobileCompassMeasuredWidth);
            return;
        }

        const frag = document.createDocumentFragment();
        /* pass17 · repeat only when BOTH categories are enabled.
           If either category is disabled, the wheel becomes a finite list with
           exactly one DOM item per visible site. This avoids the absurd-looking
           A/B/A/B/A/B repetition when Folly has only two sites. */
        const loopMode = !!(state.record && state.garden && indices.length > 1);
        state.loopMode = loopMode;
        wheel.dataset.looping = loopMode ? 'true' : 'false';
        const loopCount = loopMode ? 3 : 1;

        /* pass18 · finite wheels need neutral rows above and below so their
           first/last real place can physically reach the 90px wheel centre.
           Two 18px blank candidates on each side exactly supply the required
           36px half-viewport breathing room. They are inert and untranslated. */
        const appendFiniteBlanks = () => {
            for (let i = 0; i < 2; i++) {
                const blank = document.createElement('div');
                blank.className = 'compass-wheel-item compass-wheel-blank';
                blank.setAttribute('aria-hidden', 'true');
                blank.dataset.blank = 'true';
                frag.appendChild(blank);
            }
        };
        if (!loopMode) appendFiniteBlanks();

        for (let loop = 0; loop < loopCount; loop++) {
            indices.forEach(index => {
                const site = sites[index];
                const item = document.createElement('div');
                item.className = 'compass-wheel-item';
                item.dataset.realIndex = String(index);
                item.dataset.loop = String(loop);
                item.dataset.siteType = site.type === 'garden' ? 'garden' : 'record';
                item.dataset.i18n = `site_name_${site.name}`;
                item.textContent = site.name;
                frag.appendChild(item);
            });
        }

        if (!loopMode) appendFiniteBlanks();
        wheel.appendChild(frag);
        if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(wheel);
        requestAnimationFrame(syncMobileCompassMeasuredWidth);
        setSelection(selected, {center: true});
    }

    let mobileCompassActivationSerial = 0;

    function activateCompassSite(index) {
        if (!isPass5Mobile() || !Number.isFinite(index) || !sites?.[index]) return;
        const activationSerial = ++mobileCompassActivationSerial;
        const markerData = markers?.[index];
        const marker = markerData?.marker;
        if (!marker || typeof map === 'undefined') return;

        state.selectedIndex = index;
        const site = sites[index];
        syncMobileSideRailContext?.(site);

        // The travel sequence should be readable: map -> popup -> archive page.
        // Close any previous archive immediately so it cannot sit over the flight.
        window.closeMobileSideArchives?.();
        closeAllSitePopups?.();
        lockedMarker = marker;

        const module = document.getElementById('global-compass-module');
        module?.classList.remove('expanded');
        document.getElementById('global-compass-btn')?.setAttribute('aria-expanded', 'false');
        window.hideCompass?.();

        const zoom = Math.max(4.6, Math.min(5.2, (map.getZoom?.() || 3) + 1.0));
        let arrived = false;
        const mobileFlyDuration = COMPASS_FLY_DURATION;
        const flightStartedAt = performance.now();
        const minimumArrivalMs = Math.max(0, mobileFlyDuration * 1000 - 120);
        let arrivalListener = null;

        const arrive = (force = false) => {
            if (arrived || activationSerial !== mobileCompassActivationSerial) return;

            // Leaflet can emit a stale/cancellation moveend when flyTo interrupts a
            // gesture that was still settling.  Ignore any moveend that occurs before
            // the authored 4.4 s Compass flight could plausibly have finished.
            if (!force && performance.now() - flightStartedAt < minimumArrivalMs) return;

            arrived = true;
            if (arrivalListener) {
                try { map.off('moveend', arrivalListener); } catch (_) {}
                arrivalListener = null;
            }

            // opt53 · mobile Compass arrival order is strict:
            // fly-to ends -> popup appears -> wait 1 s -> side archive starts opening.
            try { marker.openPopup(); } catch (_) {}

            window.setTimeout(() => {
                if (
                    activationSerial !== mobileCompassActivationSerial ||
                    !isPass5Mobile()
                ) return;

                if (typeof window.openDrawerByIndex === 'function') {
                    window.openDrawerByIndex(index);
                }
            }, 1000);
        };

        arrivalListener = () => arrive(false);
        try { map.on('moveend', arrivalListener); } catch (_) {}
        try {
            map.flyTo(marker.getLatLng(), zoom, {
                animate: true,
                duration: mobileFlyDuration,
                easeLinearity: .18
            });
        } catch (_) {
            arrive(true);
            return;
        }
        // Safety fallback only; normal arrival is driven by the genuine end of flyTo.
        window.setTimeout(() => arrive(true), Math.round(mobileFlyDuration * 1000 + 520));
    }
    window.__mobileCompassActivateSite = activateCompassSite;

    function normalizeMobileLoopScroll(wheel) {
        if (!wheel || wheel.dataset.looping !== 'true' || state.recenteringLoop) return;
        const firstMiddle = wheel.querySelector('.compass-wheel-item[data-loop="1"]');
        const firstLast = wheel.querySelector('.compass-wheel-item[data-loop="2"]');
        if (!firstMiddle || !firstLast) return;
        const blockHeight = firstLast.offsetTop - firstMiddle.offsetTop;
        if (!(blockHeight > 1)) return;

        /* Keep the viewport inside the middle copy. Because every copy contains
           the same sites in the same order, shifting by exactly one block is
           visually lossless and creates the continuous-wheel effect without
           hard-coded item heights. */
        let next = null;
        if (wheel.scrollTop < blockHeight * 0.5) {
            next = wheel.scrollTop + blockHeight;
        } else if (wheel.scrollTop >= blockHeight * 1.5) {
            next = wheel.scrollTop - blockHeight;
        }
        if (next == null) return;
        state.recenteringLoop = true;
        wheel.scrollTop = Math.max(0, next);
        requestAnimationFrame(() => { state.recenteringLoop = false; });
    }

    function bindMobileWheelEvents() {
        const wheel = document.getElementById('compass-site-wheel');
        if (!wheel || wheel.dataset.mobileCompassBound === '1') return;
        wheel.dataset.mobileCompassBound = '1';
        state.wheelInstalled = true;

        // opt38 · A plain tap is never a navigation command on mobile.
        // Selection/fly-to requires: press still -> long-press armed -> drag -> release.
        // This prevents closing a drawer/viewer from accidentally re-triggering the
        // already centred compass site.
        const LONG_PRESS_MS = 380;
        const ARM_SLOP_PX = 9;
        const ACTIVATE_DRAG_PX = 14;

        const dragState = {
            pointerId: null,
            startY: 0,
            startScrollTop: 0,
            maxTravel: 0,
            armed: false,
            timer: 0,
            suppressClickUntil: 0,
            selectionRaf: 0
        };

        const clearLongPressTimer = () => {
            if (dragState.timer) {
                window.clearTimeout(dragState.timer);
                dragState.timer = 0;
            }
        };

        const centeredWheelIndex = () => {
            const rect = wheel.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            let best = null;
            let bestDiff = Infinity;

            wheel.querySelectorAll('.compass-wheel-item[data-real-index]').forEach(item => {
                if (item.offsetParent === null) return;
                const r = item.getBoundingClientRect();
                const diff = Math.abs(r.top + r.height / 2 - centerY);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    best = item;
                }
            });

            return best ? Number(best.dataset.realIndex) : -1;
        };

        const syncDragSelection = () => {
            dragState.selectionRaf = 0;
            if (!dragState.armed) return;
            const index = centeredWheelIndex();
            if (Number.isFinite(index) && index >= 0) setSelection(index);
        };

        const endCompassDrag = (event, cancelled = false) => {
            if (dragState.pointerId == null) return;
            if (event?.pointerId != null && event.pointerId !== dragState.pointerId) return;

            clearLongPressTimer();

            const shouldActivate =
                !cancelled &&
                dragState.armed &&
                dragState.maxTravel >= ACTIVATE_DRAG_PX;

            const index = centeredWheelIndex();

            wheel.classList.remove('mobile-drag-selecting', 'mobile-longpress-pending');
            wheel.removeAttribute('data-mobile-drag-state');

            try {
                if (wheel.hasPointerCapture?.(dragState.pointerId)) {
                    wheel.releasePointerCapture(dragState.pointerId);
                }
            } catch (_) {}

            dragState.pointerId = null;
            dragState.armed = false;
            dragState.maxTravel = 0;

            if (Number.isFinite(index) && index >= 0) {
                setSelection(index);
            }

            if (shouldActivate && Number.isFinite(index) && index >= 0) {
                dragState.suppressClickUntil = performance.now() + 700;
                activateCompassSite(index);
            }
        };

        wheel.addEventListener('pointerdown', event => {
            if (!isPass5Mobile() || event.button > 0) return;
            if (dragState.pointerId != null) return;

            dragState.pointerId = event.pointerId;
            dragState.startY = event.clientY;
            dragState.startScrollTop = wheel.scrollTop;
            dragState.maxTravel = 0;
            dragState.armed = false;

            wheel.classList.add('mobile-longpress-pending');
            wheel.dataset.mobileDragState = 'pending';

            try { wheel.setPointerCapture?.(event.pointerId); } catch (_) {}

            clearLongPressTimer();
            dragState.timer = window.setTimeout(() => {
                if (dragState.pointerId !== event.pointerId) return;
                if (dragState.maxTravel > ARM_SLOP_PX) return;

                dragState.armed = true;
                wheel.classList.remove('mobile-longpress-pending');
                wheel.classList.add('mobile-drag-selecting');
                wheel.dataset.mobileDragState = 'armed';

                // Tiny haptic acknowledgement where supported; harmless elsewhere.
                try { navigator.vibrate?.(8); } catch (_) {}
                syncDragSelection();
            }, LONG_PRESS_MS);
        });

        wheel.addEventListener('pointermove', event => {
            if (!isPass5Mobile() || event.pointerId !== dragState.pointerId) return;

            const dy = event.clientY - dragState.startY;
            dragState.maxTravel = Math.max(dragState.maxTravel, Math.abs(dy));

            // Quick movement before the hold threshold becomes browsing only.
            if (!dragState.armed && dragState.maxTravel > ARM_SLOP_PX) {
                clearLongPressTimer();
                wheel.classList.remove('mobile-longpress-pending');
                wheel.dataset.mobileDragState = 'browse';
            }

            // The wheel owns touch movement in compact mode; native inertial scroll is
            // replaced with a predictable 1:1 drag so iOS cannot pointer-cancel the
            // long-press interaction midway through selection.
            wheel.scrollTop = Math.max(0, dragState.startScrollTop - dy);
            event.preventDefault();

            if (dragState.armed && !dragState.selectionRaf) {
                dragState.selectionRaf = requestAnimationFrame(syncDragSelection);
            }
        }, { passive: false });

        wheel.addEventListener('pointerup', event => endCompassDrag(event, false));
        wheel.addEventListener('pointercancel', event => endCompassDrag(event, true));

        wheel.addEventListener('click', event => {
            if (!isPass5Mobile()) return;
            // Swallow synthetic click-through after every mobile wheel gesture.
            event.preventDefault();
            event.stopPropagation();
        });

        wheel.addEventListener('scroll', () => {
            if (!isPass5Mobile()) return;
            normalizeMobileLoopScroll(wheel);
            clearTimeout(state.scrollTimer);
            state.scrollTimer = setTimeout(() => {
                if (!isPass5Mobile()) return;
                const rect = wheel.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                let best = null;
                let diff = Infinity;
                wheel.querySelectorAll('.compass-wheel-item[data-real-index]').forEach(item => {
                    if (item.offsetParent === null) return;
                    const r = item.getBoundingClientRect();
                    const d = Math.abs(r.top + r.height / 2 - centerY);
                    if (d < diff) { diff = d; best = item; }
                });
                if (best) setSelection(Number(best.dataset.realIndex));
            }, 90);
        }, {passive: true});
    }

    function restoreDesktopWheel() {
        const wheel = document.getElementById('compass-site-wheel');
        if (!wheel || !Array.isArray(sites)) return;
        const frag = document.createDocumentFragment();
        wheel.replaceChildren();
        for (let loop = 0; loop < 5; loop++) {
            sites.forEach((site, index) => {
                const item = document.createElement('div');
                item.className = 'compass-wheel-item';
                const tags = (typeof siteTagsMapping !== 'undefined' ? siteTagsMapping?.[site.name] : '') || '';
                item.dataset.realIndex = String(index);
                item.dataset.siteType = site.type === 'garden' ? 'garden' : 'record';
                item.dataset.tags = tags;
                item.dataset.tag = tags;
                item.dataset.i18n = `site_name_${site.name}`;
                item.textContent = site.name;
                frag.appendChild(item);
            });
        }
        wheel.appendChild(frag);
        if (typeof syncLanguageSubtree === 'function') syncLanguageSubtree(wheel);
        const module = document.getElementById('global-compass-module');
        module?.removeAttribute('data-record-enabled');
        module?.removeAttribute('data-garden-enabled');
    }

    function showAllMarkersForDesktop() {
        if (!Array.isArray(markers) || typeof map === 'undefined') return;
        markers.forEach(entry => {
            const allMarkers = new Set([entry?.marker, ...(entry?.copies || [])].filter(Boolean));
            allMarkers.forEach(marker => {
                try { if (!map.hasLayer(marker)) marker.addTo(map); } catch (_) {}
            });
        });
    }

    function syncCompassMode() {
        if (isPass5Mobile()) {
            syncArchiveIntroCopy();
            syncFilterUI();
            renderNativeWheel({preserve: true});
        } else {
            showAllMarkersForDesktop();
            restoreDesktopWheel();
        }
    }

    function installFilters() {
        const box = document.getElementById('mobile-compass-filters');
        if (!box || box.dataset.bound === '1') return;
        box.dataset.bound = '1';
        box.addEventListener('click', event => {
            const btn = event.target.closest('[data-mobile-compass-type]');
            if (!btn || !isPass5Mobile()) return;
            event.preventDefault();
            event.stopPropagation();
            const type = btn.dataset.mobileCompassType;
            if (type !== 'record' && type !== 'garden') return;
            state[type] = !state[type];
            syncFilterUI();
            applyMarkerFilter();
            renderNativeWheel({preserve: true});
        });
    }

    function installCompassBehavior() {
        const module = document.getElementById('global-compass-module');
        const btn = document.getElementById('global-compass-btn');
        if (!module || !btn || btn.dataset.pass5Bound === '1') return;
        btn.dataset.pass5Bound = '1';
        btn.addEventListener('click', () => {
            if (!isPass5Mobile()) return;
            /* The older listener toggles .expanded first; pass5 only reacts to
               that authored state, so no duplicate toggle can occur. */
            requestAnimationFrame(() => {
                const open = module.classList.contains('expanded');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (open) {
                    window.closeMobileSideArchives?.();
                    document.getElementById('index-drawer')?.classList.remove('open');
                    renderNativeWheel({preserve: true});
                    /* pass7 · the original webpage compass button listener now
                       owns show/hide on every viewport. This mobile listener only
                       refreshes filters/wheel state, avoiding a second flyToBounds. */
                    scheduleMobileCompassRecenter();
                }
            });
        });
    }

    function installLanguageHooks() {
        const refreshCompactCompassLanguage = () => {
            /* opt47 · The desktop language system already translates the authored
               wheel in place.  Rebuilding it here is both unnecessary and was the
               source of the desktop two-row selection jump. */
            if (!isPass5Mobile()) return;
            syncArchiveIntroCopy();
            syncFilterUI();
            renderNativeWheel({preserve: true});
        };

        const switcher = document.getElementById('mobile-language-switcher');
        switcher?.addEventListener('click', () => {
            setTimeout(refreshCompactCompassLanguage, 55);
        });
        new MutationObserver(refreshCompactCompassLanguage)
            .observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
        document.addEventListener('languagechange-complete', refreshCompactCompassLanguage);
    }

    function installArchiveDrawerHook() {
        document.getElementById('bottom-center-label')?.addEventListener('click', () => {
            if (!isPass5Mobile()) return;
            document.getElementById('global-compass-module')?.classList.remove('expanded');
            window.hideCompass?.();
            syncArchiveIntroCopy();
        }, true);
    }

    function install() {
        /* Bind once regardless of the initial viewport. Safari UI bars, rotation,
           foldables and responsive-devtools can enter compact mode after load. */
        bindMobileWheelEvents();
        installFilters();
        installCompassBehavior();
        installLanguageHooks();
        installArchiveDrawerHook();
        syncArchiveIntroCopy();
        syncFilterUI();
        if (isPass5Mobile()) renderNativeWheel({preserve: false});
        if (mobileCompassMql?.addEventListener) mobileCompassMql.addEventListener('change', syncCompassMode);
        else if (mobileCompassMql?.addListener) mobileCompassMql.addListener(syncCompassMode);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once: true});
    else install();

    window.__mobileCompassPass5 = {
        refresh: () => renderNativeWheel({preserve: true}),
        state
    };
    window.addEventListener('resize', () => requestAnimationFrame(syncMobileCompassMeasuredWidth), {passive:true});
})();


/* ==========================================================================
   v290-mobile-compass-pass17 · conditional wheel repetition
   --------------------------------------------------------------------------
   BOTH categories enabled  -> 3-copy continuous mobile wheel.
   Either category disabled -> one finite list, exactly one row per visible site.
   Loop recentering uses measured block offsets rather than the legacy 18px row
   constant, so translations/font changes cannot break the wrap boundary.
   ========================================================================== */

/* v290-mobile-compass-pass8 · filter labels use canonical languageVault ui_record/ui_garden translations. */


/* ==========================================================================
   v290-mobile-compass-pass10 · three-stage mobile reading environment
   --------------------------------------------------------------------------
   Mobile exposes only the three intentional states: paper / eye-care / night.
   Existing desktop five-step behavior is left untouched. When a saved desktop
   intermediate tone (22 or 60) enters compact mode, render its nearest mobile
   state without overwriting the saved desktop preference.
   ========================================================================== */
(() => {
    const MOBILE_TONES = [0, 45, 100];
    const compact = () => typeof isCompactViewport === 'function'
        ? isCompactViewport()
        : (window.innerWidth <= 900 && window.innerHeight >= 560) || (window.innerWidth <= 950 && window.innerHeight <= 560);

    function nearestMobileTone(value) {
        const n = Number(value) || 0;
        return MOBILE_TONES.reduce((best, tone) => Math.abs(tone - n) < Math.abs(best - n) ? tone : best, MOBILE_TONES[0]);
    }

    function syncMobileToneState() {
        if (!compact()) return;
        const current = Number(window.readerToneValue ?? readerToneValue ?? 0);
        const target = nearestMobileTone(current);
        if (Math.abs(current - target) > 0.5 && typeof applyReaderTone === 'function') {
            applyReaderTone(target, false);
        } else if (typeof updateReaderToneButtons === 'function') {
            updateReaderToneButtons(target);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncMobileToneState, {once:true});
    } else {
        syncMobileToneState();
    }
    window.addEventListener('resize', () => requestAnimationFrame(syncMobileToneState), {passive:true});
})();


/* ==========================================================================
   v290-mobile-compass-pass13 · fixed wide wheel + deterministic category gates
   --------------------------------------------------------------------------
   Expanded mobile compass width is CSS-fixed. Filter state is mirrored to
   data-record-enabled / data-garden-enabled so stale/native wheel nodes are
   also hard-hidden by CSS; the rendered wheel is rebuilt from visibleIndices.
   ========================================================================== */


/* ==========================================================================
   v290-mobile-compass-pass16 · single-owner wheel + resilient category filters
   --------------------------------------------------------------------------
   Mobile compass width is intentionally CSS intrinsic/max-content, matching the
   desktop module. No JS measurement is permitted here. Category filtering still
   rebuilds the wheel from visibleIndices(), so intrinsic width follows the
   longest currently visible translated place name.
   ========================================================================== */


/* ==========================================================================
   v290-mobile-compass-pass18 · finite-wheel breathing room + compact onboarding
   --------------------------------------------------------------------------
   - finite compass lists receive two blank rows above and below (in renderNativeWheel)
   - compact map load performs one gentle automatic zoom-in
   - startup hint is shortened for portrait/landscape phones
   - the existing compass manual is reused at the bottom with compact copy
   ========================================================================== */
(() => {
    const MOBILE_QUERY = window.MOBILE_ATLAS_QUERY || '(max-width: 900px) and (min-height: 560px), (max-width: 950px) and (max-height: 560px)';
    const mql = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
    const compact = () => mql ? mql.matches : ((window.innerWidth <= 900 && window.innerHeight >= 560) || (window.innerWidth <= 950 && window.innerHeight <= 560));

    const hintCopy = {
        zh: '拖曳 · 缩放地图',
        en: 'Drag · Zoom',
        ja: 'ドラッグ · ズーム'
    };
    // Mobile keeps the authored desktop manual's three symbols, but shortens
    // only the wording after them. The desktop copy remains untouched.
    const manualCopy = {
        zh: ['‹( - 指向地点', '›( - 聚焦地点', '⨀ - 锁定'],
        en: ['‹( - Point to site', '›( - Focus site', '⨀ - Lock'],
        ja: ['‹( - 地点を指す', '›( - 地点に焦点', '⨀ - 固定']
    };

    const lang = () => {
        const raw = String(document.documentElement.lang || window.currentLang || 'zh').toLowerCase();
        return raw.startsWith('en') ? 'en' : raw.startsWith('ja') ? 'ja' : 'zh';
    };

    let compactManualWrite = false;
    function syncCompactTeachingCopy() {
        if (!compact()) return;
        const key = lang();
        const hint = document.getElementById('map-init-hint');
        if (hint && hint.textContent !== hintCopy[key]) hint.textContent = hintCopy[key];

        const manual = document.querySelector('#compass-overlay .compass-manual');
        const items = manual ? [...manual.querySelectorAll('.manual-item')] : [];
        const copy = manualCopy[key] || manualCopy.zh;
        compactManualWrite = true;
        copy.forEach((text, index) => {
            if (items[index] && items[index].textContent !== text) items[index].textContent = text;
        });
        compactManualWrite = false;
    }

    function restoreDesktopTeachingCopy() {
        if (compact() || typeof languageVault === 'undefined') return;
        const key = lang();
        const vault = languageVault[key] || languageVault.zh || {};
        const hint = document.getElementById('map-init-hint');
        if (hint && vault.map_init_hint) hint.textContent = vault.map_init_hint;
        document.querySelectorAll('#compass-overlay .compass-manual [data-i18n]').forEach(el => {
            const i18n = el.getAttribute('data-i18n');
            if (i18n && vault[i18n]) el.textContent = vault[i18n];
        });
    }

    function syncTeachingCopy() {
        if (compact()) syncCompactTeachingCopy();
        else restoreDesktopTeachingCopy();
    }

    let introStarted = false;
    let introCancelled = false;
    function installCompactMapIntro() {
        if (introStarted || !compact() || typeof map === 'undefined') return;
        introStarted = true;

        const mapEl = document.getElementById('map');
        const cancel = () => { introCancelled = true; };
        ['pointerdown', 'touchstart', 'wheel'].forEach(type => mapEl?.addEventListener(type, cancel, {once:true, passive:true}));

        const start = () => {
            if (introCancelled || !compact()) return;
            const center = map.getCenter();
            const z0 = map.getZoom();
            if (!Number.isFinite(z0)) return;
            const landscape = (window.innerWidth || 0) > (window.innerHeight || 0);
            const amount = landscape ? 0.08 : 0.12;
            const z1 = Math.min(map.getMaxZoom?.() ?? 8, z0 + amount);
            if (!(z1 > z0 + 0.02)) return;
            try {
                map.flyTo(center, z1, { animate:true, duration:1.45, easeLinearity:.24 });
            } catch (_) {}
        };

        const schedule = () => window.setTimeout(start, 260);
        try { map.whenReady(schedule); } catch (_) { schedule(); }
    }

    function boot() {
        syncTeachingCopy();
        installCompactMapIntro();
        document.addEventListener('languagechange-complete', syncTeachingCopy);
        if (mql?.addEventListener) mql.addEventListener('change', syncTeachingCopy);
        else if (mql?.addListener) mql.addListener(syncTeachingCopy);

        // Translation/decode code can rewrite the original desktop manual after
        // our first compact pass. Keep mobile as the sole owner of the three
        // visible manual lines and immediately restore the short copy whenever
        // another subsystem mutates them.
        const manual = document.querySelector('#compass-overlay .compass-manual');
        if (manual && 'MutationObserver' in window) {
            let queued = false;
            const observer = new MutationObserver(() => {
                if (!compact() || compactManualWrite || queued) return;
                queued = true;
                requestAnimationFrame(() => {
                    queued = false;
                    syncCompactTeachingCopy();
                });
            });
            observer.observe(manual, { subtree:true, childList:true, characterData:true });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
    else boot();
})();


/* ========================================================================== 
   v290-mobile-compass-pass19 · transient compass drag hint
   --------------------------------------------------------------------------
   When the compact compass opens, briefly show a one-line teaching cue above
   the persistent compact compass manual. It reuses the same timing language as
   the map's startup hint and never captures pointer events.
   ========================================================================== */
(() => {
    const MOBILE_QUERY = window.MOBILE_ATLAS_QUERY || '(max-width: 900px) and (min-height: 560px), (max-width: 950px) and (max-height: 560px)';
    const mql = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
    const compact = () => mql ? mql.matches : ((window.innerWidth <= 900 && window.innerHeight >= 560) || (window.innerWidth <= 950 && window.innerHeight <= 560));

    const copy = {
        zh: '拖动地图或罗盘 · 追踪地点',
        en: 'Drag the map or compass · Track the site',
        ja: '地図または羅盤をドラッグ · 地点を追跡'
    };

    const lang = () => {
        const raw = String(document.documentElement.lang || window.currentLang || 'zh').toLowerCase();
        return raw.startsWith('en') ? 'en' : raw.startsWith('ja') ? 'ja' : 'zh';
    };

    function ensureHint() {
        let hint = document.getElementById('compass-drag-hint');
        if (hint) return hint;
        hint = document.createElement('div');
        hint.id = 'compass-drag-hint';
        hint.className = 'compass-drag-hint';
        hint.setAttribute('aria-hidden', 'true');
        document.body.appendChild(hint);
        return hint;
    }

    let clearTimer = 0;
    function flashHint() {
        const hint = ensureHint();
        hint.textContent = copy[lang()] || copy.zh;
        hint.classList.remove('show');
        // Restart the authored one-shot timeline every time the compass opens.
        void hint.offsetWidth;
        hint.classList.add('show');
        window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => hint.classList.remove('show'), 4600);
    }

    function syncCopy() {
        const hint = document.getElementById('compass-drag-hint');
        if (hint) hint.textContent = copy[lang()] || copy.zh;
    }

    function install() {
        if (typeof window.showCompass === 'function' && !window.showCompass.__mobileCompassHintWrapped) {
            const originalShowCompass = window.showCompass;
            const wrapped = function (...args) {
                const result = originalShowCompass.apply(this, args);
                flashHint();
                return result;
            };
            wrapped.__mobileCompassHintWrapped = true;
            wrapped.__originalShowCompass = originalShowCompass;
            window.showCompass = wrapped;
        }
        document.addEventListener('languagechange-complete', syncCopy);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
    else install();
})();

/* ==========================================================================
   v291-opt35 · compact outside-dismiss owner
   --------------------------------------------------------------------------
   Leaflet deliberately stops many bubbling click events, so the older global
   document click handler could not reliably close mobile drawers when the user
   tapped the map. Capture-phase pointerdown runs before Leaflet consumes it.
   ========================================================================== */
(() => {
    const compact = () => typeof window.isCompactViewport === 'function'
        ? window.isCompactViewport()
        : false;

    function closeIndexDrawerFromOutside() {
        if (typeof window.closeIndexDrawerWithAnim === 'function') {
            window.closeIndexDrawerWithAnim();
        } else {
            document.getElementById('index-drawer')?.classList.remove('open');
            document.getElementById('drawer-opened-bottom-decor')?.classList.remove('show');
        }
    }

    document.addEventListener('pointerdown', event => {
        if (!compact()) return;

        const target = event.target;
        if (!(target instanceof Element)) return;

        const viewer = document.getElementById('attachment-viewer');
        const viewerOpen = viewer?.classList.contains('open') || viewer?.classList.contains('closing');
        const immune = performance.now() < Number(window.__mobileAttachmentDismissImmuneUntil || 0);

        const left = document.getElementById('mobile-left-drawer');
        const right = document.getElementById('mobile-right-drawer');
        const sideOpen = left?.classList.contains('open') || right?.classList.contains('open');

        if (sideOpen && !viewerOpen && !immune) {
            const insideSide =
                left?.contains(target) ||
                right?.contains(target);

            if (!insideSide) {
                window.closeMobileSideArchives?.();
            }
        }

        const indexDrawer = document.getElementById('index-drawer');
        if (indexDrawer?.classList.contains('open')) {
            const insideIndex = indexDrawer.contains(target);

            if (!insideIndex) {
                closeIndexDrawerFromOutside();
            }
        }
    }, true);
})();
