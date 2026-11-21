// Shared model for the Review page's "Sketch your project" tool.
// All sizes are whole feet. Lot origin (0, 0) is the rear-left corner; y grows toward the street.

export type SketchKind = "deck" | "addition" | "garage" | "trade";
export type AddType = "out" | "up" | "inside"; // bump-out, new story, convert space inside the house
export type Rect = { x: number; y: number; w: number; d: number };

export type Trade = "electrical" | "plumbing" | "hvac";
export type EquipType = "panel" | "circuit" | "waterHeater" | "fixture" | "hvacOut" | "airHandler";
export type Equip = { id: string; type: EquipType; x: number; y: number };

export const EQUIP: Record<EquipType, { label: string; one: string; many: string; short: string; trade: Trade; outdoor: boolean; color: string }> = {
  panel: { label: "Electrical panel", one: "an electrical panel", many: "electrical panels", short: "P", trade: "electrical", outdoor: false, color: "#b08900" },
  circuit: { label: "New circuit or outlet", one: "a new circuit or outlet", many: "new circuits or outlets", short: "C", trade: "electrical", outdoor: false, color: "#b08900" },
  waterHeater: { label: "Water heater", one: "a water heater", many: "water heaters", short: "WH", trade: "plumbing", outdoor: false, color: "#1f6fc5" },
  fixture: { label: "Plumbing fixture", one: "a plumbing fixture", many: "plumbing fixtures", short: "F", trade: "plumbing", outdoor: false, color: "#1f6fc5" },
  hvacOut: { label: "Outdoor HVAC unit", one: "an outdoor HVAC unit", many: "outdoor HVAC units", short: "AC", trade: "hvac", outdoor: true, color: "#1a8a82" },
  airHandler: { label: "Air handler or furnace", one: "an air handler or furnace", many: "air handlers or furnaces", short: "AH", trade: "hvac", outdoor: false, color: "#1a8a82" },
};
export const EQUIP_GROUPS: { trade: Trade; label: string; types: EquipType[] }[] = [
  { trade: "electrical", label: "Electrical", types: ["panel", "circuit"] },
  { trade: "plumbing", label: "Plumbing", types: ["waterHeater", "fixture"] },
  { trade: "hvac", label: "HVAC", types: ["hvacOut", "airHandler"] },
];
export const MAX_EQUIP = 16;
export const HVAC_UNIT = 3; // outdoor unit footprint, ft

export type Sketch = {
  lotW: number;
  lotD: number;
  house: Rect;
  proj: Rect;
  height: number; // deck: floor height off the ground; addition/garage: wall height
  houseHeight: number; // existing house wall height (about 9 ft per story)
  addType: AddType;
  equip: Equip[];
};

export const HOUSE_HEIGHT = { min: 8, max: 30 };
export const storiesFor = (wall: number) => Math.max(1, Math.round(wall / 9.5));

export const KIND_NAMES: Record<SketchKind, string> = {
  deck: "deck",
  addition: "room addition",
  garage: "detached garage",
  trade: "trade work",
};
export const ADD_NAMES: Record<AddType, string> = {
  out: "Build out",
  up: "Build up",
  inside: "Convert inside",
};

export const LIMITS = { lotMin: 20, lotMax: 400, sizeMax: 200 };

/** Is there a project shape to draw? (Trade-only work has just equipment.) */
export const hasShape = (kind: SketchKind) => kind !== "trade";
/** Does the project change the footprint on the lot? */
export const changesFootprint = (kind: SketchKind, s: Pick<Sketch, "addType">) =>
  kind === "deck" || kind === "garage" || (kind === "addition" && s.addType === "out");

export function heightRange(kind: SketchKind, addType: AddType = "out") {
  if (kind === "deck") return { min: 1, max: 15, label: "Height off the ground" };
  if (kind === "addition" && addType === "up") return { min: 8, max: 12, label: "New story height" };
  return { min: 8, max: 20, label: "Wall height" };
}

/** Where the project starts for each addition type, relative to the house. */
export function projFor(addType: AddType, house: Rect): Rect {
  if (addType === "up") return { x: house.x, y: house.y, w: Math.max(8, Math.round(house.w / 2)), d: house.d };
  if (addType === "inside") {
    const w = Math.min(16, house.w - 2);
    const d = Math.min(14, house.d - 2);
    return { x: house.x + house.w - w - 1, y: house.y + 1, w, d };
  }
  return { x: house.x, y: Math.max(0, house.y - 14), w: 14, d: 14 };
}

export function defaultSketch(kind: SketchKind): Sketch {
  const lotW = 70;
  const lotD = 120;
  const house: Rect = { x: 15, y: 55, w: 40, d: 35 }; // 30 ft from the street
  const base = { lotW, lotD, house, houseHeight: 10, addType: "out" as AddType, equip: [] as Equip[] };
  if (kind === "garage") return { ...base, proj: { x: 42, y: 8, w: 20, d: 24 }, height: 9 };
  if (kind === "addition") return { ...base, proj: projFor("out", house), height: 10 };
  if (kind === "trade") return { ...base, proj: { x: 0, y: 0, w: 1, d: 1 }, height: 8 };
  return { ...base, proj: { x: 29, y: 39, w: 12, d: 16 }, height: 4 };
}

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

function clampRect(r: Rect, lotW: number, lotD: number): Rect {
  const w = clampN(r.w, 1, Math.min(LIMITS.sizeMax, lotW));
  const d = clampN(r.d, 1, Math.min(LIMITS.sizeMax, lotD));
  return { w, d, x: clampN(r.x, 0, lotW - w), y: clampN(r.y, 0, lotD - d) };
}

function clampInside(r: Rect, outer: Rect): Rect {
  const w = clampN(r.w, 1, outer.w);
  const d = clampN(r.d, 1, outer.d);
  return { w, d, x: clampN(r.x, outer.x, outer.x + outer.w - w), y: clampN(r.y, outer.y, outer.y + outer.d - d) };
}

// Keeps every value a whole number inside the lot. A new story or an inside conversion stays within the house.
export function clampSketch(s: Sketch, kind: SketchKind): Sketch {
  const lotW = clampN(s.lotW, LIMITS.lotMin, LIMITS.lotMax);
  const lotD = clampN(s.lotD, LIMITS.lotMin, LIMITS.lotMax);
  const house = clampRect(s.house, lotW, lotD);
  const hr = heightRange(kind, s.addType);
  const inHouse = kind === "addition" && s.addType !== "out";
  const half = HVAC_UNIT / 2;
  return {
    lotW,
    lotD,
    house,
    proj: inHouse ? clampInside(s.proj, house) : clampRect(s.proj, lotW, lotD),
    height: clampN(s.height, hr.min, hr.max),
    houseHeight: clampN(s.houseHeight, HOUSE_HEIGHT.min, HOUSE_HEIGHT.max),
    addType: s.addType,
    equip: s.equip.slice(0, MAX_EQUIP).map((e) => {
      const pad = EQUIP[e.type].outdoor ? half : 0.5;
      return { ...e, x: Math.max(pad, Math.min(lotW - pad, Math.round(e.x))), y: Math.max(pad, Math.min(lotD - pad, Math.round(e.y))) };
    }),
  };
}

let nextId = 1;
/** Adds a piece of equipment at a sensible spot: indoor items inside the house, the outdoor unit beside it. */
export function addEquip(s: Sketch, type: EquipType): Sketch {
  if (s.equip.length >= MAX_EQUIP) return s;
  const h = s.house;
  const n = s.equip.filter((e) => e.type === type).length;
  let x: number;
  let y: number;
  if (EQUIP[type].outdoor) {
    x = h.x + h.w + 4;
    if (x > s.lotW - 2) x = h.x - 4;
    y = h.y + h.d / 2 + n * 5;
  } else {
    const col = { panel: 0.12, circuit: 0.4, waterHeater: 0.85, fixture: 0.6, airHandler: 0.3, hvacOut: 0 }[type];
    x = h.x + h.w * col + n * 3;
    y = h.y + h.d * (type === "fixture" || type === "circuit" ? 0.25 : 0.7) + n * 2;
  }
  return { ...s, equip: [...s.equip, { id: `e${Date.now().toString(36)}${nextId++}`, type, x, y }] };
}

export function tradesIn(s: Sketch): Trade[] {
  const set = new Set(s.equip.map((e) => EQUIP[e.type].trade));
  return (["electrical", "plumbing", "hvac"] as Trade[]).filter((t) => set.has(t));
}

/** Distance from the outdoor unit's edge to the nearest property line. */
export function hvacClearance(s: Sketch, e: Equip): number {
  const h = HVAC_UNIT / 2;
  return Math.max(0, Math.round(Math.min(e.x - h, s.lotW - e.x - h, e.y - h, s.lotD - e.y - h)));
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

// Notes come only from rules already in Permivo's data (see data/checklist.ts and data/rules.ts), and only
// for the county and location they apply to. Nothing here is a setback number: zoning setbacks vary by lot.
export function notesFor(s: Sketch, kind: SketchKind, county: string, location: "city" | "outside"): Note[] {
  const m = measure(s);
  const notes: Note[] = [];
  const meck = county === "Mecklenburg";
  const footprint = changesFootprint(kind, s);

  if (kind === "deck") {
    notes.push({ tone: "info", text: `At ${s.height} ft off the ground, show the guards and any stairs on your plans. State guidance: guards at least 36 in. high.` });
  }
  if (meck && kind === "addition") {
    if (s.addType === "out") {
      notes.push(
        m.area >= 100
          ? { tone: "warn", text: `${m.area} sq ft: an enclosed addition of 100 sq ft or more goes through Mecklenburg plan review.` }
          : { tone: "ok", text: `${m.area} sq ft: Mecklenburg says an addition of 100 sq ft or less needs a permit but not plan review.` }
      );
    } else if (s.addType === "up") {
      notes.push({ tone: "warn", text: "A new story is on Mecklenburg's plan review list. Show the new height on the elevations." });
    } else {
      notes.push({
        tone: "info",
        text: "Mecklenburg's plan review list includes any garage with living space, and enclosing a deck into a room. For other conversions, ask the Plan Review Facilitator Line, 980-314-2633.",
      });
    }
  }
  if (meck && kind === "garage") {
    notes.push({ tone: "info", text: "Mecklenburg says a one-story detached garage with no living space needs a permit but not plan review." });
  }
  if (meck && location === "city" && hasShape(kind) && !(kind === "addition" && s.addType === "inside")) {
    const doc = kind === "deck" ? "a Plot Plan, and accepts a hand-drawn one if it is to scale" : kind === "addition" ? "a Plot Plan plus building elevations" : "a Plot Plan plus a Building Height Form";
    notes.push({ tone: "info", text: `Charlotte's lot review asks for ${doc}. The printable plot plan below can help.` });
  }

  const trades = tradesIn(s);
  if (trades.length > 0) {
    notes.push({ tone: "info", text: "State law does not exempt work that adds or changes electrical, plumbing or heating and air conditioning systems from a permit. Like-kind replacement of devices and fixtures is exempt." });
    if (meck) notes.push({ tone: "info", text: "Mecklenburg permits electrical, plumbing, and heating and air conditioning separately from the building work. Apply for each trade you placed." });
  }
  for (const e of s.equip.filter((x) => x.type === "hvacOut")) {
    const c = hvacClearance(s, e);
    notes.push({
      tone: c < 5 ? "warn" : "info",
      text:
        `Outdoor HVAC unit: ${c} ft from the nearest property line. Check the zoning setback for equipment.` +
        (meck && location === "city" ? " Charlotte's lot review checks where HVAC equipment sits, so show it on the plot plan." : ""),
    });
  }

  if (footprint) {
    const nearest = Math.min(m.rear, m.front, m.left, m.right);
    notes.push({
      tone: nearest < 10 ? "warn" : "info",
      text: `Closest property line: ${nearest} ft. Check the zoning setback for your lot before you submit.`,
    });
  } else if (kind === "addition") {
    notes.push({ tone: "ok", text: "The footprint does not change, so the distances to the property lines stay the same." });
  }
  return notes;
}

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0] ?? "";
}

export function draftSentence(s: Sketch, kind: SketchKind): string {
  const m = measure(s);
  const p = s.proj;
  const parts: string[] = [];

  if (kind === "addition" && s.addType === "up") {
    parts.push(`Proposed second-story addition over part of the existing house, ${p.w} ft by ${p.d} ft (${m.area} sq ft), about ${s.height} ft high. No change to the footprint.`);
  } else if (kind === "addition" && s.addType === "inside") {
    parts.push(`Convert existing space inside the house to living space, ${p.w} ft by ${p.d} ft (${m.area} sq ft). No change to the footprint.`);
  } else if (hasShape(kind)) {
    const height = kind === "deck" ? ` The deck floor is about ${s.height} ft above the ground.` : ` Wall height about ${s.height} ft.`;
    parts.push(
      `Proposed ${KIND_NAMES[kind]}, ${p.w} ft by ${p.d} ft (${m.area} sq ft), on a ${s.lotW} ft by ${s.lotD} ft lot. ` +
        `It is ${m.rear} ft from the rear property line, ${m.front} ft from the front (street) line, ` +
        `${m.left} ft from the left side line and ${m.right} ft from the right side line.${height}`
    );
  }

  if (s.equip.length > 0) {
    const counts = new Map<EquipType, number>();
    for (const e of s.equip) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    const items = [...counts].map(([t, n]) => (n > 1 ? `${n} ${EQUIP[t].many}` : EQUIP[t].one));
    const tradeNames = tradesIn(s).map((t) => (t === "hvac" ? "heating and air conditioning (HVAC)" : t));
    let line = `Trade work: ${list(tradeNames)}. Equipment: ${list(items)}.`;
    const outs = s.equip.filter((e) => e.type === "hvacOut");
    if (outs.length) line += ` The outdoor HVAC unit is ${list(outs.map((e) => `${hvacClearance(s, e)} ft`))} from the nearest property line.`;
    parts.push(line);
  }
  return parts.join(" ") || "No project drawn yet.";
}
