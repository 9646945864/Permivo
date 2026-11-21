// Shared model for the Review page's "Sketch your project" tool.
// All sizes are whole feet. Lot origin (0, 0) is the rear-left corner; y grows toward the street.

export type SketchKind = "deck" | "addition" | "garage";
export type Rect = { x: number; y: number; w: number; d: number };
export type Sketch = {
  lotW: number;
  lotD: number;
  house: Rect;
  proj: Rect;
  height: number; // deck: floor height off the ground; addition/garage: wall height
};

export const KIND_NAMES: Record<SketchKind, string> = {
  deck: "deck",
  addition: "room addition",
  garage: "detached garage",
};

export const LIMITS = { lotMin: 20, lotMax: 400, sizeMax: 200 };

export function heightRange(kind: SketchKind) {
  return kind === "deck" ? { min: 1, max: 15, label: "Height off the ground" } : { min: 8, max: 20, label: "Wall height" };
}

export function defaultSketch(kind: SketchKind): Sketch {
  const lotW = 70;
  const lotD = 120;
  const house: Rect = { x: 15, y: 55, w: 40, d: 35 }; // 30 ft from the street
  if (kind === "garage") return { lotW, lotD, house, proj: { x: 42, y: 8, w: 20, d: 24 }, height: 9 };
  if (kind === "addition") return { lotW, lotD, house, proj: { x: 15, y: 41, w: 14, d: 14 }, height: 10 };
  return { lotW, lotD, house, proj: { x: 29, y: 39, w: 12, d: 16 }, height: 4 };
}

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

function clampRect(r: Rect, lotW: number, lotD: number): Rect {
  const w = clampN(r.w, 1, Math.min(LIMITS.sizeMax, lotW));
  const d = clampN(r.d, 1, Math.min(LIMITS.sizeMax, lotD));
  return { w, d, x: clampN(r.x, 0, lotW - w), y: clampN(r.y, 0, lotD - d) };
}

// Keeps every value a whole number inside the lot.
export function clampSketch(s: Sketch, kind: SketchKind): Sketch {
  const lotW = clampN(s.lotW, LIMITS.lotMin, LIMITS.lotMax);
  const lotD = clampN(s.lotD, LIMITS.lotMin, LIMITS.lotMax);
  const hr = heightRange(kind);
  return {
    lotW,
    lotD,
    house: clampRect(s.house, lotW, lotD),
    proj: clampRect(s.proj, lotW, lotD),
    height: clampN(s.height, hr.min, hr.max),
  };
}

export function measure(s: Sketch) {
  const p = s.proj;
  return {
    area: p.w * p.d,
    rear: p.y,
    front: s.lotD - p.y - p.d,
    left: p.x,
    right: s.lotW - p.x - p.w,
  };
}

export type Note = { tone: "info" | "warn" | "ok"; text: string };

// Notes come only from rules already in Permivo's data (see data/checklist.ts), and only for the
// county and location they apply to. Nothing here is a setback number: zoning setbacks vary by lot.
export function notesFor(s: Sketch, kind: SketchKind, county: string, location: "city" | "outside"): Note[] {
  const m = measure(s);
  const notes: Note[] = [];
  const meck = county === "Mecklenburg";
  const nearest = Math.min(m.rear, m.front, m.left, m.right);

  if (kind === "deck") {
    notes.push({ tone: "info", text: `At ${s.height} ft off the ground, show the guards and any stairs on your plans. State guidance: guards at least 36 in. high.` });
  }
  if (meck && kind === "addition") {
    notes.push(
      m.area >= 100
        ? { tone: "warn", text: `${m.area} sq ft: an enclosed addition of 100 sq ft or more goes through Mecklenburg plan review.` }
        : { tone: "ok", text: `${m.area} sq ft: Mecklenburg says an addition of 100 sq ft or less needs a permit but not plan review.` }
    );
  }
  if (meck && kind === "garage") {
    notes.push({ tone: "info", text: "Mecklenburg says a one-story detached garage with no living space needs a permit but not plan review." });
  }
  if (meck && location === "city") {
    const doc = kind === "deck" ? "a Plot Plan, and accepts a hand-drawn one if it is to scale" : kind === "addition" ? "a Plot Plan plus building elevations" : "a Plot Plan plus a Building Height Form";
    notes.push({ tone: "info", text: `Charlotte's lot review asks for ${doc}. The printable plot plan below can help.` });
  }
  notes.push({
    tone: nearest < 10 ? "warn" : "info",
    text: `Closest property line: ${nearest} ft. Check the zoning setback for your lot before you submit.`,
  });
  return notes;
}

export function draftSentence(s: Sketch, kind: SketchKind): string {
  const m = measure(s);
  const p = s.proj;
  const height =
    kind === "deck" ? ` The deck floor is about ${s.height} ft above the ground.` : ` Wall height about ${s.height} ft.`;
  return (
    `Proposed ${KIND_NAMES[kind]}, ${p.w} ft by ${p.d} ft (${m.area} sq ft), on a ${s.lotW} ft by ${s.lotD} ft lot. ` +
    `It is ${m.rear} ft from the rear property line, ${m.front} ft from the front (street) line, ` +
    `${m.left} ft from the left side line and ${m.right} ft from the right side line.${height}`
  );
}
