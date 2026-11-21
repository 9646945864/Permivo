"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Sketch2D from "./Sketch2D";
import {
  ADD_NAMES,
  EQUIP,
  EQUIP_GROUPS,
  HOUSE_HEIGHT,
  LIMITS,
  MAX_EQUIP,
  addEquip,
  changesFootprint,
  clampSketch,
  defaultSketch,
  draftSentence,
  followPlacement,
  hasShape,
  heightRange,
  hvacClearance,
  measure,
  notesFor,
  projFor,
  storiesFor,
  type AddType,
  type Sketch,
  type SketchKind,
} from "./model";
import { printPlotPlan } from "./plotPlan";
import { track } from "../analytics";

// "Sketch your project" on the Review page: a 2D plan to scale, a 3D view of the same sketch,
// measurements, rule notes, trade equipment, a printable plot plan, and a sentence for the draft.
// Nothing is stored or sent anywhere unless the contractor adds the sentence to the draft.

const Sketch3D = dynamic(() => import("./Sketch3D"), {
  ssr: false,
  loading: () => <div className="sk-3d sk-3d-loading">Loading 3D view…</div>,
});

const NOTE_STYLE = {
  info: "border-orange-100 bg-orange-50 text-gray-800",
  warn: "border-yellow-300 bg-yellow-100 text-yellow-900",
  ok: "border-green-300 bg-green-100 text-green-900",
};

const ADD_HINTS: Record<AddType, string> = {
  out: "A new room that extends the footprint, like a rear bump-out.",
  up: "A new story on top of the house. Draw the area inside the house outline.",
  inside: "Turn existing space (garage, porch, attic, basement) into living space. Draw it inside the house outline.",
};

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <label className="sk-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(Math.round(n));
        }}
        onBlur={() => setText(String(value))}
      />
      <span>ft</span>
    </label>
  );
}

export default function SketchTool({
  kind,
  county,
  location,
  onAddToDraft,
}: {
  kind: SketchKind;
  county: string;
  location: "city" | "outside";
  onAddToDraft: (sentence: string) => void;
}) {
  const [sketch, setSketch] = useState<Sketch>(() => defaultSketch(kind));
  const [view, setView] = useState<"plan" | "3d">("plan");
  const [msg, setMsg] = useState("");
  const [help, setHelp] = useState(false);
  const [xrayPref, setXrayPref] = useState<boolean | null>(null); // null = automatic

  // A new project type starts from a sensible layout for that type, keeping the lot, house and equipment.
  useEffect(() => {
    setSketch((cur) => {
      const d = defaultSketch(kind);
      return clampSketch({ ...d, lotW: cur.lotW, lotD: cur.lotD, house: cur.house, houseHeight: cur.houseHeight, equip: cur.equip }, kind);
    });
    setMsg("");
  }, [kind]);

  const update = (s: Sketch) => {
    // Only a pure move of the project (same size, new spot) can change the addition type.
    const moved =
      s.proj.w === sketch.proj.w && s.proj.d === sketch.proj.d && (s.proj.x !== sketch.proj.x || s.proj.y !== sketch.proj.y) && s.house === sketch.house;
    const { sketch: placed, switched } = moved ? followPlacement(s, kind) : { sketch: s, switched: null };
    setSketch(clampSketch(placed, kind));
    setMsg(
      switched === "inside"
        ? "Moved inside the house, so this is now a conversion of existing space. Pick Build up instead if it is a new story."
        : switched === "out"
          ? "Moved outside the house, so this is now a Build out addition."
          : ""
    );
  };
  function setAddType(t: AddType) {
    const hr = heightRange(kind, t);
    update({ ...sketch, addType: t, proj: projFor(t, sketch.house), height: t === "up" ? 9 : Math.max(hr.min, sketch.height) });
  }

  const shape = hasShape(kind);
  const footprint = changesFootprint(kind, sketch);
  const m = measure(sketch);
  const hr = heightRange(kind, sketch.addType);
  const notes = notesFor(sketch, kind, county, location);
  const xrayAuto = (kind === "addition" && sketch.addType === "inside") || sketch.equip.length > 0;
  const xray = xrayPref ?? xrayAuto;
  const title = kind === "trade" ? "Sketch the trade work" : "Sketch your project";

  return (
    <section className="sk-panel mt-6" aria-labelledby="sk-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="sk-title" className="text-lg font-medium text-gray-900">{title}</h2>
          <button
            type="button"
            className="sk-info"
            aria-expanded={help}
            aria-controls="sk-help"
            aria-label="How to use the sketch"
            onClick={() => setHelp((v) => !v)}
          >
            i
          </button>
        </div>
        <div className="sk-tabs" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "plan"} onClick={() => setView("plan")}>Plan</button>
          <button
            type="button"
            aria-pressed={view === "3d"}
            onClick={() => {
              setView("3d");
              track("sketch_3d_opened", { kind });
            }}
          >
            3D
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        {kind === "trade"
          ? "Place the equipment on your lot and in the house. Permivo shows it in the plan and in 3D, notes the rules it has, and can add it to your draft."
          : "Draw it to scale on your lot and place any trade equipment. Permivo measures it, checks it against the rules it has, and can add it to your draft."}
      </p>

      {help && (
        <div id="sk-help" className="sk-help" role="region" aria-label="How to use the sketch">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-medium text-gray-900">How to use the sketch</h3>
            <button type="button" onClick={() => setHelp(false)} aria-label="Close help" className="rounded border border-gray-300 px-2 text-sm text-gray-700">✕</button>
          </div>
          <div className="sk-help-cols">
            <div>
              <h4>1. Set up your lot</h4>
              <ul>
                <li>Enter the lot width and depth from your plat or survey.</li>
                <li>Enter the house width and depth, and set the <b>house wall height</b> (about 9 to 10 ft per story).</li>
                <li>The top of the plan is the rear property line. The street is at the bottom.</li>
              </ul>
            </div>
            <div>
              <h4>2. Plan view (2D)</h4>
              <ul>
                <li><b>Draw:</b> press on empty ground and drag. For <b>Build up</b> or <b>Convert inside</b>, drag inside the house.</li>
                <li><b>Move:</b> drag the project, the house or any equipment icon anywhere on the lot.</li>
                <li><b>Resize:</b> drag the small squares on the corners and edges. The size updates as you drag.</li>
                <li><b>Exact sizes:</b> type them in the width and depth boxes.</li>
                <li>Drag a room addition fully into the house and it becomes a conversion; drag it out and it becomes a build-out.</li>
                <li><b>Keyboard:</b> click a shape or icon, then use the arrow keys (Shift for 5 ft). Delete removes an icon.</li>
                <li>One grid square is 5 ft. Everything snaps to whole feet.</li>
              </ul>
            </div>
            <div>
              <h4>3. Additions and trades</h4>
              <ul>
                <li><b>Build out</b> extends the footprint. <b>Build up</b> adds a story. <b>Convert inside</b> turns existing space into living space.</li>
                <li>Add <b>electrical</b>, <b>plumbing</b> or <b>HVAC</b> equipment with the buttons, then drag each icon to its spot.</li>
                <li>Lines show the runs: circuits to the panel, fixtures to the water heater, the air handler to the outdoor unit.</li>
              </ul>
            </div>
            <div>
              <h4>4. 3D view</h4>
              <ul>
                <li><b>Turn:</b> drag with the mouse or one finger. <b>Zoom:</b> scroll or pinch.</li>
                <li><b>X-ray</b> makes the house see-through so inside work and equipment show. It turns on by itself when needed.</li>
                <li>New work is shaded orange. The existing house is beige.</li>
              </ul>
            </div>
            <div>
              <h4>5. Use the result</h4>
              <ul>
                <li><b>Add to my draft</b> writes the sizes, distances and equipment into your application below.</li>
                <li><b>Print plot plan</b> opens a to-scale drawing. Save it as a PDF and print at 100%.</li>
                <li>It is not a survey. Confirm property lines and setbacks before you submit.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {kind === "addition" && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">What kind of addition?</p>
          <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Addition type">
            {(["out", "up", "inside"] as AddType[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={sketch.addType === t}
                onClick={() => setAddType(t)}
                className={`rounded-md border px-3 py-2 text-sm ${sketch.addType === t ? "border-orange-800 bg-orange-800 text-white" : "border-gray-300 bg-white text-gray-800"}`}
              >
                {ADD_NAMES[t]}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">{ADD_HINTS[sketch.addType]}</p>
        </div>
      )}

      <div className="sk-fields">
        <NumberField label="Lot width" value={sketch.lotW} min={LIMITS.lotMin} max={LIMITS.lotMax} onChange={(v) => update({ ...sketch, lotW: v })} />
        <NumberField label="Lot depth" value={sketch.lotD} min={LIMITS.lotMin} max={LIMITS.lotMax} onChange={(v) => update({ ...sketch, lotD: v })} />
        {shape && (
          <>
            <NumberField label={kind === "addition" && sketch.addType !== "out" ? "Area width" : "Project width"} value={sketch.proj.w} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, proj: { ...sketch.proj, w: v } })} />
            <NumberField label={kind === "addition" && sketch.addType !== "out" ? "Area depth" : "Project depth"} value={sketch.proj.d} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, proj: { ...sketch.proj, d: v } })} />
          </>
        )}
        <NumberField label="House width" value={sketch.house.w} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, house: { ...sketch.house, w: v } })} />
        <NumberField label="House depth" value={sketch.house.d} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, house: { ...sketch.house, d: v } })} />
        {shape && !(kind === "addition" && sketch.addType === "inside") && (
          <label className="sk-field sk-range">
            <span>{hr.label}</span>
            <input type="range" min={hr.min} max={hr.max} step={1} value={sketch.height} onChange={(e) => update({ ...sketch, height: Number(e.target.value) })} />
            <span>{sketch.height} ft</span>
          </label>
        )}
        <label className="sk-field sk-range">
          <span>House wall height</span>
          <input
            type="range"
            min={HOUSE_HEIGHT.min}
            max={HOUSE_HEIGHT.max}
            step={1}
            value={sketch.houseHeight}
            onChange={(e) => update({ ...sketch, houseHeight: Number(e.target.value) })}
          />
          <span>
            {sketch.houseHeight} ft · {storiesFor(sketch.houseHeight)} {storiesFor(sketch.houseHeight) === 1 ? "story" : "stories"}
          </span>
        </label>
      </div>

      <div className="sk-equip-bar" aria-label="Trade equipment">
        <p className="text-sm font-medium text-gray-700">{kind === "trade" ? "Place equipment" : "Trade work (optional)"}</p>
        <div className="sk-equip-groups">
          {EQUIP_GROUPS.map((g) => (
            <div key={g.trade} className="sk-equip-group">
              <span>{g.label}</span>
              {g.types.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={sketch.equip.length >= MAX_EQUIP}
                  onClick={() => update(addEquip(sketch, t))}
                  style={{ borderColor: EQUIP[t].color, color: EQUIP[t].color }}
                >
                  + {EQUIP[t].label}
                </button>
              ))}
            </div>
          ))}
        </div>
        {sketch.equip.length > 0 && (
          <ul className="sk-equip-list">
            {sketch.equip.map((e) => (
              <li key={e.id}>
                <span className="sk-equip-tag" style={{ borderColor: EQUIP[e.type].color, color: EQUIP[e.type].color }}>{EQUIP[e.type].short}</span>
                {EQUIP[e.type].label}
                {EQUIP[e.type].outdoor && <span className="text-gray-500"> · {hvacClearance(sketch, e)} ft to nearest line</span>}
                <button type="button" aria-label={`Remove ${EQUIP[e.type].label}`} onClick={() => update({ ...sketch, equip: sketch.equip.filter((x) => x.id !== e.id) })}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3">
        {view === "3d" && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button type="button" aria-pressed={xray} onClick={() => setXrayPref(!xray)} className={`sk-xray${xray ? " on" : ""}`}>
              X-ray walls {xray ? "on" : "off"}
            </button>
            {xrayPref !== null && (
              <button type="button" className="text-xs text-orange-800 underline" onClick={() => setXrayPref(null)}>
                Back to automatic
              </button>
            )}
          </div>
        )}
        {view === "plan" ? <Sketch2D sketch={sketch} kind={kind} onChange={update} /> : <Sketch3D sketch={sketch} kind={kind} xray={xray} />}
        <p className="mt-1 text-xs text-gray-500">
          {view === "plan"
            ? kind === "addition" && sketch.addType !== "out"
              ? "Drag inside the house to draw the area. Drag shapes to move them, or the small squares to resize. One square = 5 ft. The street is at the bottom."
              : "Drag on the lot to draw. Drag shapes and icons to move them, or the small squares to resize. One square = 5 ft. The street is at the bottom."
            : "Drag to turn the view. Scroll or pinch to zoom. New work is shaded orange. A simple model, not an architectural drawing."}
        </p>
      </div>

      {shape && (
        <div className="sk-metrics">
          <div><span>Size</span><b>{sketch.proj.w} × {sketch.proj.d} ft</b></div>
          <div><span>Area</span><b>{m.area.toLocaleString()} sq ft</b></div>
          {footprint ? (
            <>
              <div><span>To rear / front</span><b>{m.rear} / {m.front} ft</b></div>
              <div><span>To left / right</span><b>{m.left} / {m.right} ft</b></div>
            </>
          ) : (
            <div><span>Footprint</span><b>Unchanged</b></div>
          )}
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {notes.map((n, i) => (
          <li key={i} className={`rounded-md border p-2 text-sm ${NOTE_STYLE[n.tone]}`}>{n.text}</li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!shape && sketch.equip.length === 0) {
              setMsg("Place at least one piece of equipment first.");
              return;
            }
            onAddToDraft(draftSentence(sketch, kind));
            setMsg("Added to your draft below.");
            track("sketch_added_to_draft", { kind });
          }}
          className="rounded-md border border-orange-800 bg-orange-800 px-4 py-2 text-sm text-white"
        >
          Add to my draft
        </button>
        <button
          type="button"
          onClick={() => {
            const ok = printPlotPlan(sketch, kind, county);
            setMsg(ok ? "Plot plan opened in a new tab. Save it as a PDF from the print dialog." : "Your browser blocked the new tab. Allow pop-ups for Permivo and try again.");
            if (ok) track("sketch_plot_plan_printed", { kind });
          }}
          className="rounded-md border border-orange-800 bg-white px-4 py-2 text-sm text-orange-800"
        >
          Print plot plan (PDF)
        </button>
        <span className="text-sm text-gray-600" aria-live="polite">{msg}</span>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Not a survey. Distances are only as accurate as the numbers you enter. The sketch stays in your browser and is not saved.
      </p>
    </section>
  );
}
