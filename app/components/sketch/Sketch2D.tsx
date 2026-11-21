"use client";

import { useRef, useState } from "react";
import type { Rect, Sketch, SketchKind } from "./model";

// Top-down plan of the lot. Drag on empty ground to draw the project, drag a shape to move it.
// Arrow keys move the focused shape by 1 ft (Shift: 5 ft).

const VIEW_W = 640;
const PAD = 36;
const LABEL: Record<SketchKind, string> = { deck: "Deck", addition: "Addition", garage: "Garage" };

type Drag = { mode: "draw"; sx: number; sy: number } | { mode: "move"; target: "proj" | "house"; ox: number; oy: number };

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
  const sc = Math.min((VIEW_W - 2 * PAD) / lotW, 520 / lotD);
  const viewH = Math.round(2 * PAD + lotD * sc + 16);
  const offX = (VIEW_W - lotW * sc) / 2; // center the lot horizontally
  const px = (ft: number) => PAD + ft * sc; // y (and lengths)
  const pxX = (ft: number) => offX + ft * sc;

  function toFeet(e: React.PointerEvent) {
    // Map the pointer into SVG user units with the browser's own transform (handles any scaling).
    const svg = svgRef.current!;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: -1, y: -1 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: (pt.x - offX) / sc, y: (pt.y - PAD) / sc };
  }
  const inside = (r: Rect, q: { x: number; y: number }) => q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.d;

  function onDown(e: React.PointerEvent) {
    const q = toFeet(e);
    if (inside(proj, q)) setDrag({ mode: "move", target: "proj", ox: q.x - proj.x, oy: q.y - proj.y });
    else if (inside(house, q)) setDrag({ mode: "move", target: "house", ox: q.x - house.x, oy: q.y - house.y });
    else if (q.x >= 0 && q.y >= 0 && q.x <= lotW && q.y <= lotD) setDrag({ mode: "draw", sx: Math.round(q.x), sy: Math.round(q.y) });
    else return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const q = toFeet(e);
    if (drag.mode === "move") {
      const r = sketch[drag.target];
      onChange({ ...sketch, [drag.target]: { ...r, x: Math.round(q.x - drag.ox), y: Math.round(q.y - drag.oy) } });
    } else {
      const x2 = Math.round(q.x);
      const y2 = Math.round(q.y);
      onChange({
        ...sketch,
        proj: { x: Math.min(drag.sx, x2), y: Math.min(drag.sy, y2), w: Math.max(1, Math.abs(x2 - drag.sx)), d: Math.max(1, Math.abs(y2 - drag.sy)) },
      });
    }
  }

  function onKey(target: "proj" | "house", e: React.KeyboardEvent) {
    const step = e.shiftKey ? 5 : 1;
    const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
    const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    const r = sketch[target];
    onChange({ ...sketch, [target]: { ...r, x: r.x + dx, y: r.y + dy } });
  }

  const grid: React.ReactNode[] = [];
  for (let x = 0; x <= lotW; x += 5) grid.push(<line key={`x${x}`} x1={pxX(x)} y1={px(0)} x2={pxX(x)} y2={px(lotD)} className="sk-grid" />);
  for (let y = 0; y <= lotD; y += 5) grid.push(<line key={`y${y}`} x1={pxX(0)} y1={px(y)} x2={pxX(lotW)} y2={px(y)} className="sk-grid" />);

  const cx = pxX(proj.x + proj.w / 2);
  const cy = px(proj.y + proj.d / 2);
  const dimX = pxX(proj.x + proj.w * 0.2); // rear-distance line, off to the side of the width label
  const rearToLine = proj.y;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      className="sk-plan"
      role="application"
      aria-label={`Lot plan, ${lotW} by ${lotD} feet. Drag to draw or move the ${LABEL[kind].toLowerCase()}.`}
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
        <text x={pxX(house.x + house.w / 2)} y={px(house.y + house.d / 2)} textAnchor="middle" dominantBaseline="middle">House</text>
      </g>

      {rearToLine > 0 && (
        <g className="sk-dim">
          <line x1={dimX} y1={px(0)} x2={dimX} y2={px(proj.y)} />
          <text x={dimX - 5} y={px(proj.y / 2)} textAnchor="end" dominantBaseline="middle">{rearToLine} ft</text>
        </g>
      )}

      <g tabIndex={0} role="button" aria-label={`${LABEL[kind]}, ${proj.w} by ${proj.d} ft. Arrow keys move it.`} onKeyDown={(e) => onKey("proj", e)} className="sk-proj">
        <rect x={pxX(proj.x)} y={px(proj.y)} width={proj.w * sc} height={proj.d * sc} rx={2} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">{LABEL[kind]}</text>
      </g>
      <text x={cx} y={px(proj.y) - 5} textAnchor="middle" className="sk-size">{proj.w} ft</text>
      <text x={pxX(proj.x + proj.w) + 5} y={cy} dominantBaseline="middle" className="sk-size">{proj.d} ft</text>
    </svg>
  );
}
