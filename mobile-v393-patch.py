from pathlib import Path
import re

# Patch mobile side-frame wear and mobile Index Drawer fracture density.
p = Path('script.js')
s = p.read_text(encoding='utf-8')

pattern = re.compile(
    r"\n\s*// v392 · side stone damage is owned by the inner rails\.\n"
    r"\s*function buildInnerRailWear\(x, yTop, yBottom, side, label\) \{.*?\n\s*\}\n\n\s*const leftInnerWear =",
    re.S
)

replacement = r'''

        // v393 · mobile side wear: sparse, globally coordinated and genuinely irregular.
        // Across BOTH side stones there are only 1–3 wear events in total. No more than
        // two of them are open notches; any remaining event may be a standalone fissure.
        // Every fissure starts at the map-facing inner rail and runs outward past the
        // viewport edge, so it reads as a crack travelling through the stone rather than
        // a decorative line stopping inside the frame.
        const sideWearPlanRng = rngFor('mobile-shell-inner-rail-plan-v393');
        const sideWearRoll = sideWearPlanRng();
        const sideWearEventCount = sideWearRoll < 0.24 ? 1 : (sideWearRoll < 0.76 ? 2 : 3);
        const sideWearNotchRoll = sideWearPlanRng();
        const sideWearNotchCount = Math.min(
            2,
            sideWearEventCount,
            sideWearNotchRoll < 0.16 ? 0 : (sideWearNotchRoll < 0.66 ? 1 : 2)
        );

        const sideWearKinds = Array.from({ length: sideWearEventCount }, (_, i) =>
            i < sideWearNotchCount ? 'notch' : 'crack'
        );
        for (let i = sideWearKinds.length - 1; i > 0; i--) {
            const j = Math.floor(sideWearPlanRng() * (i + 1));
            [sideWearKinds[i], sideWearKinds[j]] = [sideWearKinds[j], sideWearKinds[i]];
        }

        const slotSets = sideWearEventCount === 1
            ? [0.28 + sideWearPlanRng() * 0.43]
            : sideWearEventCount === 2
                ? [0.22 + sideWearPlanRng() * 0.18, 0.62 + sideWearPlanRng() * 0.20]
                : [
                    0.16 + sideWearPlanRng() * 0.13,
                    0.43 + sideWearPlanRng() * 0.16,
                    0.72 + sideWearPlanRng() * 0.14
                ];

        const sideWearPlan = { left: [], right: [] };
        sideWearKinds.forEach((kind, i) => {
            let side = sideWearPlanRng() < 0.5 ? 'left' : 'right';
            // With multiple events, avoid the mechanical look of placing every mark on
            // the same rail. Two-on-one/one-on-the-other is still allowed and common.
            if (i === sideWearKinds.length - 1 && sideWearKinds.length > 1) {
                if (!sideWearPlan.left.length) side = 'left';
                if (!sideWearPlan.right.length) side = 'right';
            }
            const eventSeed = Math.floor(sideWearPlanRng() * 0xffffffff) >>> 0;
            sideWearPlan[side].push({
                id: `${side}-${i}-${eventSeed}`,
                kind,
                t: clamp(slotSets[i] + (sideWearPlanRng() - 0.5) * 0.055, 0.12, 0.88),
                halfHeight: 5.5 + sideWearPlanRng() * 11.5,
                depthRatio: 0.20 + sideWearPlanRng() * 0.58,
                asymmetry: (sideWearPlanRng() - 0.5) * 0.90,
                profile: Math.floor(sideWearPlanRng() * 3),
                addCrack: kind === 'crack' || sideWearPlanRng() < 0.72,
                crackSegments: 3 + Math.floor(sideWearPlanRng() * 4),
                crackRise: (sideWearPlanRng() - 0.5) * (18 + sideWearPlanRng() * 36),
                crackWiggle: 1.1 + sideWearPlanRng() * 3.4,
                exitOvershoot: 9 + sideWearPlanRng() * 23,
                eventSeed
            });
        });

        function buildInnerRailWear(x, yTop, yBottom, side, label) {
            const outward = side === 'left' ? -1 : 1;
            const span = Math.max(0, yBottom - yTop);
            const available = side === 'left'
                ? Math.max(4, x - outerLeft)
                : Math.max(4, outerRight - x);
            const events = [...(sideWearPlan[side] || [])].sort((a, b) => a.t - b.t);
            const topDown = [{ x, y: yTop }];
            const cracks = [];
            const roots = new Map();

            const profiles = [
                [
                    [-1.18, 0.00], [-0.82, 0.10], [-0.52, 0.38], [-0.20, 0.82],
                    [0.02, 1.00], [0.28, 0.70], [0.58, 0.32], [0.92, 0.08], [1.16, 0.00]
                ],
                [
                    [-1.12, 0.00], [-0.74, 0.18], [-0.46, 0.58], [-0.08, 0.92],
                    [0.20, 0.72], [0.36, 1.00], [0.62, 0.48], [0.86, 0.16], [1.12, 0.00]
                ],
                [
                    [-1.22, 0.00], [-0.92, 0.06], [-0.68, 0.32], [-0.42, 0.30],
                    [-0.14, 0.88], [0.10, 1.00], [0.34, 0.54], [0.68, 0.44], [0.96, 0.10], [1.20, 0.00]
                ]
            ];

            events.filter(event => event.kind === 'notch').forEach(event => {
                const centerY = yTop + span * event.t;
                const half = Math.min(event.halfHeight, Math.max(4.5, span * 0.035));
                const depth = clamp(available * event.depthRatio, 2.6, Math.max(3.2, available * 0.90));
                const shape = profiles[event.profile % profiles.length];
                let deepest = { x, y: centerY };
                let deepestWeight = -1;

                shape.forEach(([relY, baseWeight], idx) => {
                    const skew = relY < 0
                        ? 1 + event.asymmetry * 0.24
                        : 1 - event.asymmetry * 0.24;
                    const weight = Math.max(0, baseWeight * skew);
                    const point = {
                        x: x + outward * depth * weight,
                        y: clamp(centerY + relY * half, yTop + 1.2, yBottom - 1.2)
                    };
                    if (idx > 0 && point.y <= topDown[topDown.length - 1].y) {
                        point.y = topDown[topDown.length - 1].y + 0.55;
                    }
                    topDown.push(point);
                    if (weight > deepestWeight) {
                        deepestWeight = weight;
                        deepest = point;
                    }
                });
                roots.set(event.id, { ...deepest });
            });

            events.forEach(event => {
                if (!event.addCrack) return;
                const eventRand = mulberry32(event.eventSeed ^ 0x9E3779B9);
                const centerY = yTop + span * event.t;
                const root = roots.get(event.id) || { x, y: centerY };
                const outsideX = side === 'left'
                    ? outerLeft - event.exitOvershoot
                    : outerRight + event.exitOvershoot;
                const points = [{ ...root }];
                const segmentCount = Math.max(3, event.crackSegments);
                let previousY = root.y;

                for (let step = 1; step < segmentCount; step++) {
                    const t = step / segmentCount;
                    const envelope = Math.sin(Math.PI * t);
                    const drift = event.crackRise * t;
                    const jitter = (eventRand() - 0.5) * 2 * event.crackWiggle * envelope;
                    const bend = (eventRand() - 0.5) * event.crackWiggle * 0.75 * envelope;
                    const y = clamp(
                        root.y + drift + jitter + bend,
                        yTop + 2,
                        yBottom - 2
                    );
                    points.push({
                        x: root.x + (outsideX - root.x) * t + outward * (eventRand() - 0.35) * 1.7,
                        y
                    });
                    previousY = y;
                }

                points.push({
                    x: outsideX,
                    y: clamp(
                        previousY + event.crackRise / Math.max(5, segmentCount) + (eventRand() - 0.5) * event.crackWiggle * 1.7,
                        yTop + 1,
                        yBottom - 1
                    )
                });
                cracks.push(points);
            });

            topDown.push({ x, y: yBottom });
            topDown.sort((a, b) => a.y - b.y);
            return { topDown, bottomUp: [...topDown].reverse(), cracks };
        }

        const leftInnerWear ='''

s, count = pattern.subn(replacement, s, count=1)
if count != 1:
    raise SystemExit(f'inner rail wear replacement count={count}')

old_target = "        const target = 1 + Math.floor(rand() * 4); // v258: keep the composition to 1–4 independent fractures"
new_target = """        // v393 · Phone-sized stone rubbings keep the desktop split logic, but\n        // reduce density to suit the much smaller slab: usually 1–2 seams, rarely 3.\n        // Desktop keeps the original 1–4 fracture range unchanged.\n        const compactFractureRoll = compact ? rand() : 0;\n        const target = compact\n            ? (compactFractureRoll < 0.56 ? 1 : (compactFractureRoll < 0.92 ? 2 : 3))\n            : 1 + Math.floor(rand() * 4);"""
if old_target not in s:
    raise SystemExit('index drawer target marker not found')
s = s.replace(old_target, new_target, 1)

s = s.replace(
    '// v376 · mobile uses the exact desktop stone partition algorithm.\n        // Only the minimum viable box is relaxed for phone geometry.',
    '// v393 · mobile keeps the desktop stone-partition METHOD and silhouette logic,\n        // but uses a sparse fracture-count rule sized for a phone slab.'
)

p.write_text(s, encoding='utf-8')

# Cache bust only; no structural HTML changes.
p = Path('index.html')
h = p.read_text(encoding='utf-8')
h = h.replace('style.css?v=392-mobile-inner-fractures', 'style.css?v=393-mobile-fracture-randomness')
h = h.replace('script.js?v=392-mobile-inner-fractures', 'script.js?v=393-mobile-fracture-randomness')
p.write_text(h, encoding='utf-8')
