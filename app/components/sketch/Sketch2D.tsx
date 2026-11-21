"use client";

import { useRef, useState } from "react";
import { EQUIP, HVAC_UNIT, changesFootprint, hasShape, hvacClearance, type Equip, type Rect, type Sketch, type SketchKind } from "./model";

// Top-down plan of the lot.
// - Drag on empty ground to draw the project; drag a shape or equipment icon to move it.
// - For a new story or an inside conversion, drag inside the house to draw the area.
// - Arrow keys move the focused item 1 ft (Shift: 5 ft); Delete removes focused equipment.

const VIEW_W = 640;
const PAD = 36;

type Drag =
  | { mode: "draw"; sx: number; sy: number }
  | { mode: "move"; target: "proj" | "house"; ox: number; oy: number; start: Rect }
  | { mode: "equip"; id: string; ox: number; oy: number };

function projLabel(kind: SketchKind, s: Sketch) {
  if (kind === "deck") return "Deck";
  if (kind === "garage") return "Garage";
  if (s.addType === "up") return "New story";
  if (s.addType === "inside") return "Converted";
  return "Addition";
}

export default function Sketch2D({
  sketch,
  kind,
  onChange,
}: {
  sketch: Sketch;
  kind: SketchKind;
  onChange: (s: Sketch) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const { lotW, lotD, house, proj } = sketch;
  const shape = hasShape(kind);
  const inHouse = kind === "addition" && sketch.addType !== "out";
  const footprint = changesFootprint(kind, sketch);
  const sc = Math.min((VIEW_W - 2 * PAD) / lotW, 520 / lotD);
  const viewH = Math.round(2 * PAD + lotD * sc + 16);
  const offX = (VIEW_W - lotW * sc) / 2; // center the lot horizontally
  const px = (ft: number) => PAD + ft * sc; // y (and lengths)
  const pxX = (ft: number) => offX + ft * sc;
  const iconR = Math.max(7, 1.4 * sc);

  function toFeet(e: React.PointerEvent) {
    // Map the pointer into SVG user units with the browser's own transform (handles any scaling).
    const svg = svgRef.current!;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: -1, y: -1 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: (pt.x - offX) / sc, y: (pt.y - PAD) / sc };
  }
  const inside = (r: Rect, q: { x: number; y: number }) => q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.d;
  const hitEquip = (q: { x: number; y: number }) =>
    [...sketch.equip].reverse().find((e) => Math.hypot(q.x - e.x, q.y - e.y) <= Math.max(EQUIP[e.type].outdoor ? HVAC_UNIT / 2 + 0.5 : 1.5, iconR / sc));

  // Moving the house carries along what sits in it: the new story or converted area, and indoor equipment.
  function moveHouse(to: Rect, from: Rect) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    onChange({
      ...sketch,
      house: to,
      proj: inHouse ? { ...sketch.proj, x: sketch.proj.x + dx, y: sketch.proj.y + dy } : sketch.proj,
      equip: sketch.equip.map((e) => (!EQUIP[e.type].outdoor && inside(from, e) ? { ...e, x: e.x + dx, y: e.y + dy } : e)),
    });
  }

  function onDown(e: React.PointerEvent) {
    const q = toFeet(e);
    const eq = hitEquip(q);
    if (eq) setDrag({ mode: "equip", id: eq.id, ox: q.x - eq.x, oy: q.y - eq.y });
    else if (shape && inside(proj, q)) setDrag({ mode: "move", target: "proj", ox: q.x - proj.x, oy: q.y - proj.y, start: proj });
    else if (inHouse && inside(house, q)) setDrag({ mode: "draw", sx: Math.round(q.x), sy: Math.round(q.y) });
    else if (inside(house, q)) setDrag({ mode: "move", target: "house", ox: q.x - house.x, oy: q.y - house.y, start: house });
    else if (shape && !inHouse && q.x >= 0 && q.y >= 0 && q.x <= lotW && q.y <= lotD) setDrag({ mode: "draw", sx: Math.round(q.x), sy: Math.round(q.y) });
    else return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const q = toFeet(e);
    if (drag.mode === "equip") {
      onChange({ ...sketch, equip: sketch.equip.map((x) => (x.id === drag.id ? { ...x, x: Math.round(q.x - drag.ox), y: Math.round(q.y - drag.oy) } : x)) });
    } else if (drag.mode === "move") {
      const r = sketch[drag.target];
      const to = { ...r, x: Math.round(q.x - drag.ox), y: Math.round(q.y - drag.oy) };
      if (drag.target === "house") moveHouse(to, r);
      else onChange({ ...sketch, proj: to });
    } else {
      const x2 = Math.round(q.x);
      const y2 = Math.round(q.y);
      onChange({
        ...sketch,
        proj: { x: Math.min(drag.sx, x2), y: Math.min(drag.sy, y2), w: Math.max(1, Math.abs(x2 - drag.sx)), d: Math.max(1, Math.abs(y2 - drag.sy)) },
      });
    }
  }

  function step(e: React.KeyboardEvent) {
    const n = e.shiftKey ? 5 : 1;
    return {
      dx: e.key === "ArrowLeft" ? -n : e.key === "ArrowRight" ? n : 0,
      dy: e.key === "ArrowUp" ? -n : e.key === "ArrowDown" ? n : 0,
    };
  }
  function onKey(target: "proj" | "house", e: React.KeyboardEvent) {
    const { dx, dy } = step(e);
    if (!dx && !dy) return;
    e.preventDefault();
    const r = sketch[target];
    const to = { ...r, x: r.x + dx, y: r.y + dy };
    if (target === "house") moveHouse(to, r);
    else onChange({ ...sketch, proj: to });
  }
  function onEquipKey(eq: Equip, e: React.KeyboardEvent) {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onChange({ ...sketch, equip: sketch.equip.filter((x) => x.id !== eq.id) });
      return;
    }
    const { dx, dy } = step(e);
    if (!dx && !dy) return;
    e.preventDefault();
    onChange({ ...sketch, equip: sketch.equip.map((x) => (x.id === eq.id ? { ...x, x: x.x + dx, y: x.y + dy } : x)) });
  }

  const grid: React.ReactNode[] = [];
  for (let x = 0; x <= lotW; x += 5) grid.push(<line key={`x${x}`} x1={pxX(x)} y1={px(0)} x2={pxX(x)} y2={px(lotD)} className="sk-grid" />);
  for (let y = 0; y <= lotD; y += 5) grid.push(<line key={`y${y}`} x1={pxX(0)} y1={px(y)} x2={pxX(lotW)} y2={px(y)} className="sk-grid" />);

  const cx = pxX(proj.x + proj.w / 2);
  const cy = px(proj.y + proj.d / 2);
  const dimX = pxX(proj.x + proj.w * 0.2);
  const label = projLabel(kind, sketch);

  // Connection lines: circuits to the panel, fixtures to the water heater, air handler to the outdoor unit.
  const first = (t: Equip["type"]) => sketch.equip.find((e) => e.type === t);
  const links: { a: Equip; b: Equip; cls: string }[] = [];
  const panel = first("panel");
  const heater = first("waterHeater");
  const outdoor = first("hvacOut");
  for (const e of sketch.equip) {
    if (e.type === "circuit" && panel) links.push({ a: panel, b: e, cls: "sk-link-elec" });
    if (e.type === "fixture" && heater) links.push({ a: heater, b: e, cls: "sk-link-plumb" });
    if (e.type === "airHandler" && outdoor) links.push({ a: outdoor, b: e, cls: "sk-link-hvac" });
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      className="sk-plan"
      role="application"
      aria-label={`Lot plan, ${lotW} by ${lotD} feet.${shape ? ` Drag to draw or move the ${label.toLowerCase()}.` : ""} Drag equipment icons to place them.`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => setDrag(null)}
      onPointerCancel={() => setDrag(null)}
    >
      {grid}
      <rect x={pxX(0)} y={px(0)} width={lotW * sc} height={lotD * sc} className="sk-lot" />
      <text x={pxX(lotW / 2)} y={px(0) - 10} textAnchor="middle" className="sk-label">Rear property line · {lotW} ft</text>
      <text x={pxX(lotW / 2)} y={px(lotD) + 22} textAnchor="middle" className="sk-label">Street</text>
      <text x={pxX(0) - 10} y={px(lotD / 2)} textAnchor="middle" className="sk-label" transform={`rotate(-90 ${pxX(0) - 10} ${px(lotD / 2)})`}>
        {lotD} ft
      </text>

      <g tabIndex={0} role="button" aria-label={`House, ${house.w} by ${house.d} ft. Arrow keys move it.`} onKeyDown={(e) => onKey("house", e)} className="sk-house">
        <rect x={pxX(house.x)} y={px(house.y)} width={house.w * sc} height={house.d * sc} rx={2} />
        <text x={pxX(house.x + house.w / 2)} y={px(house.y + house.d) - 10} textAnchor="middle">House</text>
      </g>

      {shape && footprint && proj.y > 0 && (
        <g className="sk-dim">
          <line x1={dimX} y1={px(0)} x2={dimX} y2={px(proj.y)} />
          <text x={dimX - 5} y={px(proj.y / 2)} textAnchor="end" dominantBaseline="middle">{proj.y} ft</text>
        </g>
      )}

      {shape && (
        <>
          <g
            tabIndex={0}
            role="button"
            aria-label={`${label}, ${proj.w} by ${proj.d} ft. Arrow keys move it.`}
            onKeyDown={(e) => onKey("proj", e)}
            className={`sk-proj${inHouse ? " sk-proj-in" : ""}`}
          >
            <rect x={pxX(proj.x)} y={px(proj.y)} width={proj.w * sc} height={proj.d * sc} rx={2} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">{label}</text>
          </g>
          <text x={cx} y={px(proj.y) - 5} textAnchor="middle" className="sk-size">{proj.w} ft</text>
          <text x={pxX(proj.x + proj.w) + 5} y={cy} dominantBaseline="middle" className="sk-size">{proj.d} ft</text>
        </>
      )}

      {links.map((l, i) => (
        <line key={i} x1={pxX(l.a.x)} y1={px(l.a.y)} x2={pxX(l.b.x)} y2={px(l.b.y)} className={l.cls} />
      ))}

      {sketch.equip.map((e) => {
        const info = EQUIP[e.type];
        const x = pxX(e.x);
        const y = px(e.y);
        const clearance = info.outdoor ? hvacClearance(sketch, e) : 0;
        return (
          <g
            key={e.id}
            tabIndex={0}
            role="button"
            aria-label={`${info.label}. Arrow keys move it, Delete removes it.${info.outdoor ? ` ${clearance} ft from the nearest property line.` : ""}`}
            onKeyDown={(k) => onEquipKey(e, k)}
            className="sk-equip"
          >
            {info.outdoor ? (
              <rect x={x - (HVAC_UNIT / 2) * sc} y={y - (HVAC_UNIT / 2) * sc} width={HVAC_UNIT * sc} height={HVAC_UNIT * sc} rx={2} fill="#fff" stroke={info.color} strokeWidth={2} />
            ) : (
              <circle cx={x} cy={y} r={iconR} fill="#fff" stroke={info.color} strokeWidth={2} />
            )}
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={info.color} style={{ fontSize: Math.min(11, iconR * 1.1) }}>
              {info.short}
            </text>
            {info.outdoor && (
              <text x={x} y={y + (HVAC_UNIT / 2) * sc + 12} textAnchor="middle" className="sk-size">
                {clearance} ft to line
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
