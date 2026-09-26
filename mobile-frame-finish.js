(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const media = window.matchMedia(
    '(max-width: 900px) and (min-height: 560px), (max-width: 950px) and (max-height: 560px)'
  );

  const seedArray = new Uint32Array(1);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(seedArray);
  else seedArray[0] = Math.floor(Math.random() * 0xffffffff);
  const seed = seedArray[0] || 0x91a7d35b;

  function mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const leftRandom = mulberry32(seed ^ 0x4f1bbcdc);
  const rightRandom = mulberry32(seed ^ 0x9e3779b9);

  function makeSideSpec(rand) {
    const pitCount = 1 + Math.floor(rand() * 3);
    const pits = [];
    let attempts = 0;

    while (pits.length < pitCount && attempts < 80) {
      attempts += 1;
      const center = 0.12 + rand() * 0.76;
      if (pits.some(p => Math.abs(p.center - center) < 0.13)) continue;
      pits.push({
        center,
        halfRatio: 0.0065 + rand() * 0.0065,
        depth: 1.8 + rand() * 3.8,
        skew: (rand() - 0.5) * 0.9,
        crack: rand() < 0.72,
        crackLength: 7 + rand() * 13,
        crackLift: (rand() - 0.5) * 9
      });
    }
    pits.sort((a, b) => a.center - b.center);

    const hairlineCount = Math.floor(rand() * 3);
    const hairlines = Array.from({ length: hairlineCount }, () => ({
      center: 0.14 + rand() * 0.72,
      length: 6 + rand() * 12,
      bend: (rand() - 0.5) * 11
    }));

    return { pits, hairlines };
  }

  const spec = {
    left: makeSideSpec(leftRandom),
    right: makeSideSpec(rightRandom)
  };

  function pathFrom(points) {
    return points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  }

  function addPath(svg, points, className) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathFrom(points));
    path.setAttribute('class', className);
    svg.appendChild(path);
    return path;
  }

  function buildSide(side, sideSpec, width, height) {
    const x = side === 'left' ? 0.65 : width - 0.65;
    const inward = side === 'left' ? 1 : -1;
    const points = [{ x, y: 0.65 }];
    const roots = [];

    sideSpec.pits.forEach((pit, index) => {
      const half = Math.max(6, Math.min(16, height * pit.halfRatio));
      const centerY = Math.max(half + 8, Math.min(height - half - 8, height * pit.center));
      const y0 = centerY - half;
      const y1 = centerY + half;
      const depth = pit.depth;

      points.push({ x, y: y0 });
      points.push({ x: x + inward * (depth * 0.18), y: y0 + half * 0.22 });
      points.push({ x: x + inward * (depth * 0.48), y: centerY - half * 0.38 + pit.skew });
      points.push({ x: x + inward * depth, y: centerY });
      points.push({ x: x + inward * (depth * 0.58), y: centerY + half * 0.42 - pit.skew * 0.6 });
      points.push({ x: x + inward * (depth * 0.22), y: y1 - half * 0.16 });
      points.push({ x, y: y1 });

      roots.push({
        x: x + inward * depth,
        y: centerY,
        pit,
        index
      });
    });

    points.push({ x, y: height - 0.65 });
    return { points, roots, inward, edgeX: x };
  }

  function createHost() {
    let host = document.getElementById('mobile-outer-rim');
    if (!host) {
      host = document.createElement('div');
      host.id = 'mobile-outer-rim';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }
    return host;
  }

  function render() {
    const host = createHost();
    if (!media.matches) {
      host.replaceChildren();
      return;
    }

    const width = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const height = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    // The top and bottom remain calm architectural runs.
    addPath(svg, [
      { x: 0.65, y: 0.65 },
      { x: width - 0.65, y: 0.65 }
    ], 'mobile-outer-rim-edge');
    addPath(svg, [
      { x: 0.65, y: height - 0.65 },
      { x: width - 0.65, y: height - 0.65 }
    ], 'mobile-outer-rim-edge');

    ['left', 'right'].forEach(side => {
      const built = buildSide(side, spec[side], width, height);
      addPath(svg, built.points, 'mobile-outer-rim-edge');

      built.roots.forEach((root, i) => {
        if (!root.pit.crack) return;
        const signY = root.pit.crackLift >= 0 ? 1 : -1;
        const len = root.pit.crackLength;
        addPath(svg, [
          { x: root.x, y: root.y },
          { x: root.x + built.inward * (len * 0.28), y: root.y + signY * 1.2 },
          { x: root.x + built.inward * (len * 0.60), y: root.y + root.pit.crackLift * 0.48 },
          { x: root.x + built.inward * len, y: root.y + root.pit.crackLift }
        ], 'mobile-outer-rim-crack');
      });

      spec[side].hairlines.forEach((hair, i) => {
        const y = Math.max(14, Math.min(height - 14, height * hair.center));
        const len = hair.length;
        addPath(svg, [
          { x: built.edgeX, y },
          { x: built.edgeX + built.inward * (len * 0.30), y: y + hair.bend * 0.15 },
          { x: built.edgeX + built.inward * (len * 0.68), y: y + hair.bend * 0.52 },
          { x: built.edgeX + built.inward * len, y: y + hair.bend }
        ], 'mobile-outer-rim-crack');
      });
    });

    host.replaceChildren(svg);
    host.dataset.seed = seed.toString(16).padStart(8, '0');
  }

  let raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  }

  function install() {
    createHost();
    render();
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.addEventListener('ruin-fracture-static-ready', schedule, { passive: true });
    media.addEventListener?.('change', schedule);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
