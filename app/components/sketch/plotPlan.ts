import { HVAC_UNIT, KIND_NAMES, changesFootprint, hasShape, hvacClearance, measure, tradesIn, type Sketch, type SketchKind } from "./model";

// Opens a print-ready plot plan at a true architectural scale on a letter-size landscape page.
// The browser's print dialog saves it as a PDF.

const SCALES: { inPerFt: number; label: string }[] = [
  { inPerFt: 1 / 8, label: '1/8" = 1\'-0"' },
  { inPerFt: 1 / 10, label: '1" = 10\'' },
  { inPerFt: 1 / 16, label: '1/16" = 1\'-0"' },
  { inPerFt: 1 / 20, label: '1" = 20\'' },
  { inPerFt: 1 / 30, label: '1" = 30\'' },
  { inPerFt: 1 / 40, label: '1" = 40\'' },
  { inPerFt: 1 / 50, label: '1" = 50\'' },
];
const DRAW_W = 7.2; // inches available for the drawing
const DRAW_H = 6.6;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function printPlotPlan(s: Sketch, kind: SketchKind, county: string): boolean {
  const scale = SCALES.find((k) => s.lotW * k.inPerFt <= DRAW_W && s.lotD * k.inPerFt <= DRAW_H) ?? SCALES[SCALES.length - 1];
  const m = measure(s);
  const p = s.proj;
  const h = s.house;
  const shape = hasShape(kind);
  const footprint = changesFootprint(kind, s);
  const name =
    kind === "addition" && s.addType === "up" ? "second-story addition" : kind === "addition" && s.addType === "inside" ? "conversion of existing space" : KIND_NAMES[kind];
  const label = kind === "trade" ? "Trade work (equipment location)" : `Proposed ${name}`;
  const shortName = kind === "deck" ? "DECK" : kind === "garage" ? "GARAGE" : s.addType === "up" ? "2ND STORY" : s.addType === "inside" ? "CONVERTED" : "ADD.";
  // Outdoor HVAC units with a dimension line to the nearest property line
  const half = HVAC_UNIT / 2;
  const units = s.equip
    .filter((e) => e.type === "hvacOut")
    .map((e) => {
      const opts = [
        { d: e.x - half, lx1: e.x - half, ly1: e.y, lx2: 0, ly2: e.y },
        { d: s.lotW - e.x - half, lx1: e.x + half, ly1: e.y, lx2: s.lotW, ly2: e.y },
        { d: e.y - half, lx1: e.x, ly1: e.y - half, lx2: e.x, ly2: 0 },
        { d: s.lotD - e.y - half, lx1: e.x, ly1: e.y + half, lx2: e.x, ly2: s.lotD },
      ].sort((a, b) => a.d - b.d)[0];
      return { x: e.x, y: e.y, c: hvacClearance(s, e), ...opts };
    });
  const wIn = s.lotW * scale.inPerFt;
  const dIn = s.lotD * scale.inPerFt;
  const fs = 1 / scale.inPerFt / 9; // text size in feet so it prints about 1/9 in tall
  const barFt = scale.inPerFt >= 1 / 16 ? 20 : 50;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${wIn + 0.8}in" height="${dIn + 1.05}in" viewBox="${-0.4 / scale.inPerFt} ${-0.45 / scale.inPerFt} ${s.lotW + 0.8 / scale.inPerFt} ${s.lotD + 1.05 / scale.inPerFt}" font-family="Arial, sans-serif" font-size="${fs}">
  <rect x="0" y="0" width="${s.lotW}" height="${s.lotD}" fill="none" stroke="#000" stroke-width="${fs / 6}" stroke-dasharray="${fs} ${fs / 2}"/>
  <text x="${s.lotW / 2}" y="${-fs * 0.8}" text-anchor="middle">Rear property line, ${s.lotW} ft</text>
  <text x="${s.lotW / 2}" y="${s.lotD + fs * 1.6}" text-anchor="middle">Street (front property line)</text>
  <text x="${-fs * 0.8}" y="${s.lotD / 2}" text-anchor="middle" transform="rotate(-90 ${-fs * 0.8} ${s.lotD / 2})">Side line, ${s.lotD} ft</text>
  <rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.d}" fill="#eee" stroke="#000" stroke-width="${fs / 8}"/>
  <text x="${h.x + h.w / 2}" y="${h.y + h.d / 2}" text-anchor="middle" dominant-baseline="middle">Existing house</text>
  ${shape ? `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.d}" fill="#f6d2c3" stroke="#000" stroke-width="${fs / 5}"${footprint ? "" : ` stroke-dasharray="${fs / 2} ${fs / 3}" fill-opacity="0.7"`}/>
  <text x="${p.x + p.w / 2}" y="${p.y + p.d / 2}" text-anchor="middle" dominant-baseline="middle">${shortName}</text>
  <text x="${p.x + p.w / 2}" y="${p.y - fs * 0.4}" text-anchor="middle">Proposed ${p.w}' x ${p.d}'</text>` : ""}
  ${footprint ? `${dim(p.x + p.w * 0.2, 0, p.x + p.w * 0.2, p.y, `${m.rear}'`, fs)}
  ${dim(p.x + p.w * 0.2, p.y + p.d, p.x + p.w * 0.2, s.lotD, `${m.front}'`, fs)}
  ${dim(0, p.y + p.d * 0.8, p.x, p.y + p.d * 0.8, `${m.left}'`, fs)}
  ${dim(p.x + p.w, p.y + p.d * 0.8, s.lotW, p.y + p.d * 0.8, `${m.right}'`, fs)}` : ""}
  ${units.map((u) => `<rect x="${u.x - HVAC_UNIT / 2}" y="${u.y - HVAC_UNIT / 2}" width="${HVAC_UNIT}" height="${HVAC_UNIT}" fill="#fff" stroke="#000" stroke-width="${fs / 8}"/>
  <text x="${u.x}" y="${u.y + HVAC_UNIT / 2 + fs}" text-anchor="middle">HVAC unit</text>
  ${dim(u.lx1, u.ly1, u.lx2, u.ly2, `${u.c}'`, fs)}`).join("\n")}
  <g transform="translate(0 ${s.lotD + fs * 3})">
    <rect x="0" y="0" width="${barFt / 2}" height="${fs / 2}" fill="#000"/><rect x="${barFt / 2}" y="0" width="${barFt / 2}" height="${fs / 2}" fill="none" stroke="#000" stroke-width="${fs / 10}"/>
    <text x="0" y="${fs * 1.6}">0</text><text x="${barFt}" y="${fs * 1.6}" text-anchor="middle">${barFt} ft</text>
  </g>
</svg>`;

  const rows: [string, string][] = [["Project", label]];
  if (shape) {
    rows.push(["Size", `${p.w} ft x ${p.d} ft (${m.area} sq ft)`]);
    if (!(kind === "addition" && s.addType === "inside")) rows.push([kind === "deck" ? "Deck height" : "Wall height", `About ${s.height} ft`]);
  }
  rows.push(["Lot", `${s.lotW} ft x ${s.lotD} ft`], ["Existing house", `${h.w} ft x ${h.d} ft, walls about ${s.houseHeight} ft`]);
  if (footprint) {
    rows.push(["To rear line", `${m.rear} ft`], ["To front line", `${m.front} ft`], ["To side lines", `${m.left} ft (left), ${m.right} ft (right)`]);
  } else if (shape) {
    rows.push(["Footprint", "Unchanged"]);
  }
  const trades = tradesIn(s);
  if (trades.length) rows.push(["Trade work", trades.map((t) => (t === "hvac" ? "HVAC" : t.charAt(0).toUpperCase() + t.slice(1))).join(", ")]);
  units.forEach((u, i) => rows.push([units.length > 1 ? `HVAC unit ${i + 1}` : "HVAC unit", `${u.c} ft to nearest property line`]));
  rows.push(["County", county], ["Scale", scale.label], ["Date", new Date().toLocaleDateString()]);

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Plot plan - ${esc(label)}</title>
<style>
@page { size: letter landscape; margin: 0.4in; }
body { font-family: Arial, sans-serif; margin: 0; color: #000; }
.sheet { display: flex; gap: 0.3in; align-items: flex-start; }
.block { width: 2.6in; border: 1px solid #000; padding: 0.12in; font-size: 10pt; }
.block h1 { font-size: 13pt; margin: 0 0 0.08in; }
.block table { width: 100%; border-collapse: collapse; }
.block td { padding: 2px 0; vertical-align: top; }
.block td:first-child { color: #444; padding-right: 6px; white-space: nowrap; }
.note { margin-top: 0.1in; font-size: 8.5pt; border-top: 1px solid #000; padding-top: 0.08in; }
.hint { font-size: 10pt; margin: 0.1in 0; }
@media print { .hint { display: none; } }
</style></head><body>
<p class="hint">Use your browser's print dialog and choose "Save as PDF". Print at 100% (no "fit to page") to keep the scale.</p>
<div class="sheet">
${svg}
<div class="block"><h1>Plot plan</h1><table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
<div class="note">Drawn by the applicant with Permivo. Not a survey. Property lines and distances are as entered; confirm them from the plat or survey. Check zoning setbacks for this lot.</div></div>
</div>
<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 300); });</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}

function dim(x1: number, y1: number, x2: number, y2: number, text: string, fs: number) {
  if (Math.hypot(x2 - x1, y2 - y1) < 0.5) return "";
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const tx = vertical ? mx - fs * 0.4 : mx;
  const ty = vertical ? my : my - fs * 0.75;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${fs / 12}" stroke-dasharray="${fs / 3} ${fs / 4}"/>
  <text x="${tx}" y="${ty}" text-anchor="${vertical ? "end" : "middle"}" dominant-baseline="middle">${text}</text>`;
}
