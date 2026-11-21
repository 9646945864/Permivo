"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Sketch2D from "./Sketch2D";
import { LIMITS, clampSketch, defaultSketch, draftSentence, heightRange, measure, notesFor, type Sketch, type SketchKind } from "./model";
import { printPlotPlan } from "./plotPlan";
import { track } from "../analytics";

// "Sketch your project" on the Review page: a 2D plan to scale, a 3D view of the same sketch,
// measurements, rule notes, a printable plot plan, and a sentence for the application draft.
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

  // A new project type starts from a sensible layout for that type.
  useEffect(() => {
    setSketch(defaultSketch(kind));
    setMsg("");
  }, [kind]);

  const update = (s: Sketch) => {
    setSketch(clampSketch(s, kind));
    setMsg("");
  };
  const m = measure(sketch);
  const hr = heightRange(kind);
  const notes = notesFor(sketch, kind, county, location);

  return (
    <section className="sk-panel mt-6" aria-labelledby="sk-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sk-title" className="text-lg font-medium text-gray-900">Sketch your project</h2>
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
        Draw it to scale on your lot. Permivo measures it, checks it against the rules it has, and can add the numbers to your draft.
      </p>

      <div className="sk-fields">
        <NumberField label="Lot width" value={sketch.lotW} min={LIMITS.lotMin} max={LIMITS.lotMax} onChange={(v) => update({ ...sketch, lotW: v })} />
        <NumberField label="Lot depth" value={sketch.lotD} min={LIMITS.lotMin} max={LIMITS.lotMax} onChange={(v) => update({ ...sketch, lotD: v })} />
        <NumberField label="Project width" value={sketch.proj.w} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, proj: { ...sketch.proj, w: v } })} />
        <NumberField label="Project depth" value={sketch.proj.d} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, proj: { ...sketch.proj, d: v } })} />
        <NumberField label="House width" value={sketch.house.w} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, house: { ...sketch.house, w: v } })} />
        <NumberField label="House depth" value={sketch.house.d} min={1} max={LIMITS.sizeMax} onChange={(v) => update({ ...sketch, house: { ...sketch.house, d: v } })} />
        <label className="sk-field sk-range">
          <span>{hr.label}</span>
          <input type="range" min={hr.min} max={hr.max} step={1} value={sketch.height} onChange={(e) => update({ ...sketch, height: Number(e.target.value) })} />
          <span>{sketch.height} ft</span>
        </label>
      </div>

      <div className="mt-3">
        {view === "plan" ? <Sketch2D sketch={sketch} kind={kind} onChange={update} /> : <Sketch3D sketch={sketch} kind={kind} />}
        <p className="mt-1 text-xs text-gray-500">
          {view === "plan"
            ? "Drag on the lot to draw the project. Drag a shape, or select it and use the arrow keys, to move it. One square = 5 ft. The street is at the bottom."
            : "Drag to turn the view. Scroll or pinch to zoom. Simple shapes only, not an architectural model."}
        </p>
      </div>

      <div className="sk-metrics">
        <div><span>Size</span><b>{sketch.proj.w} × {sketch.proj.d} ft</b></div>
        <div><span>Area</span><b>{m.area.toLocaleString()} sq ft</b></div>
        <div><span>To rear / front</span><b>{m.rear} / {m.front} ft</b></div>
        <div><span>To left / right</span><b>{m.left} / {m.right} ft</b></div>
      </div>

      <ul className="mt-3 space-y-2">
        {notes.map((n, i) => (
          <li key={i} className={`rounded-md border p-2 text-sm ${NOTE_STYLE[n.tone]}`}>{n.text}</li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
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
