"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { storiesFor, type Sketch, type SketchKind } from "./model";

// 3D view of the same sketch. three.js is loaded only when this view is opened.
// Buildings get a foundation, siding with corner trim, a gable roof with overhangs, windows per story,
// a street-facing door, and soft shadows. Still a massing model, not an architectural drawing.

type Three = typeof THREE_NS;
type Api = { rebuild: (s: Sketch, k: SketchKind) => void };

export default function Sketch3D({ sketch, kind }: { sketch: Sketch; kind: SketchKind }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const latest = useRef({ sketch, kind });
  latest.current = { sketch, kind };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three")
      .then((T: Three) => {
        if (disposed || !hostRef.current) return;
        cleanup = mount(T, hostRef.current, api);
        api.current?.rebuild(latest.current.sketch, latest.current.kind);
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      cleanup();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.rebuild(sketch, kind);
  }, [sketch, kind]);

  if (failed) return <p className="text-sm text-gray-600">The 3D view could not load. The plan view still works.</p>;
  return <div ref={hostRef} className="sk-3d" aria-label="3D view of the sketch. Drag to turn, scroll to zoom." role="img" />;
}

function mount(T: Three, host: HTMLDivElement, api: React.MutableRefObject<Api | null>) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.5, 3000);
  scene.add(new T.HemisphereLight(0xf4f7ff, 0x8a8a70, 0.75 * Math.PI));
  const sun = new T.DirectionalLight(0xfff4e0, 0.95 * Math.PI);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.add(sun.target);

  const mat = (c: number) => new T.MeshLambertMaterial({ color: c });
  const M = {
    grass: mat(0x9cc47a),
    siding: mat(0xe4ddd0),
    newSiding: mat(0xf2c6ae),
    trim: mat(0xfbfaf6),
    roof: mat(0x50555d),
    newRoof: mat(0x7a4a36),
    foundation: mat(0x9b978f),
    glass: mat(0x5f7a93),
    door: mat(0x7b3b22),
    garageDoor: mat(0xf0eee8),
    chimney: mat(0x9a5640),
    shrub: mat(0x4f7d3a),
    wood: mat(0xc4874f),
    post: mat(0x8a5a33),
    walk: mat(0xcfcac0),
  };

  let world = new T.Group();
  scene.add(world);
  let target = new T.Vector3();
  let radius = 120;

  function disposeGroup(g: THREE_NS.Object3D) {
    g.traverse((o) => {
      const mesh = o as THREE_NS.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
    });
  }

  function rebuild(s: Sketch, kind: SketchKind) {
    scene.remove(world);
    disposeGroup(world);
    world = new T.Group();
    scene.add(world);

    // Lot centered at the origin; +z is toward the street.
    const toX = (x: number, w: number) => x + w / 2 - s.lotW / 2;
    const toZ = (y: number, d: number) => y + d / 2 - s.lotD / 2;
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE_NS.Material, parent: THREE_NS.Object3D = world) => {
      const b = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      b.position.set(x, y, z);
      b.castShadow = true;
      b.receiveShadow = true;
      parent.add(b);
      return b;
    };

    // Ground, grid and dashed lot line
    const ground = box(s.lotW, 0.4, s.lotD, 0, -0.2, 0, M.grass);
    ground.castShadow = false;
    const big = Math.max(s.lotW, s.lotD);
    const grid = new T.GridHelper(big, big / 5, 0x86ad66, 0x92b973);
    grid.scale.set(s.lotW / big, 1, s.lotD / big);
    grid.position.y = 0.02;
    world.add(grid);
    const edge = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(s.lotW, 0.1, s.lotD)),
      new T.LineDashedMaterial({ color: 0x333333, dashSize: 2, gapSize: 1.5 })
    );
    edge.computeLineDistances();
    edge.position.y = 0.06;
    world.add(edge);

    // A building: foundation, walls with corner trim, windows per story, gable roof, optional door.
    function building(opts: {
      w: number;
      d: number;
      wall: number;
      x: number;
      z: number;
      siding: THREE_NS.Material;
      roof: THREE_NS.Material;
      door: "front" | "garage" | "none";
      chimney?: boolean;
    }) {
      const { w, d, wall, x, z } = opts;
      const g = new T.Group();
      g.position.set(x, 0, z);
      world.add(g);
      const base = 1; // foundation height
      box(w + 0.4, base, d + 0.4, 0, base / 2, 0, M.foundation, g);
      box(w, wall, d, 0, base + wall / 2, 0, opts.siding, g);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.5, wall, 0.5, (sx * w) / 2, base + wall / 2, (sz * d) / 2, M.trim, g);
      box(w + 0.3, 0.5, d + 0.3, 0, base + wall - 0.25, 0, M.trim, g); // frieze board under the eaves

      // Windows: about one per 10 ft of wall on each story, framed in trim.
      const stories = storiesFor(wall);
      const storyH = wall / stories;
      const winW = 3;
      const winH = Math.min(4.5, storyH * 0.45);
      const faces: { len: number; place: (t: number) => [number, number, number]; along: "x" | "z"; skipCenter: boolean }[] = [
        { len: w, place: (t) => [t, 0, d / 2 + 0.06], along: "x", skipCenter: opts.door !== "none" },
        { len: w, place: (t) => [t, 0, -d / 2 - 0.06], along: "x", skipCenter: false },
        { len: d, place: (t) => [w / 2 + 0.06, 0, t], along: "z", skipCenter: false },
        { len: d, place: (t) => [-w / 2 - 0.06, 0, t], along: "z", skipCenter: false },
      ];
      for (const f of faces) {
        const n = Math.max(1, Math.floor(f.len / 10));
        for (let st = 0; st < stories; st++) {
          const cy = base + st * storyH + storyH * 0.55;
          for (let i = 0; i < n; i++) {
            const t = -f.len / 2 + ((i + 0.5) * f.len) / n;
            if (st === 0 && f.skipCenter && Math.abs(t) < 4.5) continue; // leave room for the door
            if (opts.door === "garage" && st === 0 && f === faces[0]) continue; // garage door wall
            const [px, , pz] = f.place(t);
            const fw = f.along === "x" ? winW + 0.6 : 0.12;
            const fd = f.along === "x" ? 0.12 : winW + 0.6;
            box(fw, winH + 0.6, fd, px, cy, pz, M.trim, g);
            box(f.along === "x" ? winW : 0.16, winH, f.along === "x" ? 0.16 : winW, px, cy, pz, M.glass, g);
          }
        }
      }
      if (opts.door === "front") {
        box(4, 7.6, 0.14, 0, base + 3.8, d / 2 + 0.06, M.trim, g);
        box(3.2, 7, 0.2, 0, base + 3.5, d / 2 + 0.08, M.door, g);
        box(5, 0.4, 3, 0, base - 0.2 + 0.2, d / 2 + 1.5, M.walk, g); // stoop
      } else if (opts.door === "garage") {
        const gw = Math.min(16, w - 3);
        box(gw + 0.6, 7.6, 0.14, 0, base + 3.8 - 0.3, d / 2 + 0.06, M.trim, g);
        box(gw, 7, 0.2, 0, base + 3.5 - 0.3, d / 2 + 0.08, M.garageDoor, g);
        for (let k = 1; k < 4; k++) box(gw, 0.08, 0.24, 0, base - 0.3 + k * 1.75, d / 2 + 0.1, M.trim, g);
      }

      // Gable roof, 6-in-12 pitch, ridge along the longer side, 1.5 ft overhangs.
      const long = Math.max(w, d);
      const short = Math.min(w, d);
      const o = 1.5;
      const pitch = 0.5;
      const rise = (short / 2) * pitch;
      const top = base + wall;
      const roof = new T.Group();
      roof.position.y = top;
      if (d > w) roof.rotation.y = Math.PI / 2;
      g.add(roof);
      const hw = short / 2 + o;
      const ang = Math.atan(pitch);
      const slopeLen = hw / Math.cos(ang);
      for (const side of [1, -1]) {
        const slab = new T.Mesh(new T.BoxGeometry(long + 2 * o, 0.45, slopeLen), opts.roof);
        slab.rotation.x = side * ang;
        slab.position.set(0, rise - (hw / 2) * pitch + 0.2, side * (hw / 2));
        slab.castShadow = true;
        slab.receiveShadow = true;
        roof.add(slab);
      }
      const gable = new T.Shape();
      gable.moveTo(-short / 2, 0);
      gable.lineTo(short / 2, 0);
      gable.lineTo(0, rise);
      gable.closePath();
      const attic = new T.Mesh(new T.ExtrudeGeometry(gable, { depth: long, bevelEnabled: false }), opts.siding);
      attic.geometry.translate(0, 0, -long / 2);
      attic.rotation.y = Math.PI / 2;
      attic.castShadow = true;
      roof.add(attic);
      if (opts.chimney) {
        const ch = box(2.2, rise + 4, 2.2, long * 0.3, rise / 2 + 2, short * 0.15, M.chimney, roof);
        ch.castShadow = true;
      }
    }

    // Existing house, front door toward the street
    const h = s.house;
    building({ w: h.w, d: h.d, wall: s.houseHeight, x: toX(h.x, h.w), z: toZ(h.y, h.d), siding: M.siding, roof: M.roof, door: "front", chimney: true });
    // Shrubs along the front of the house
    for (let i = -1; i <= 1; i += 2) {
      const shrub = new T.Mesh(new T.SphereGeometry(1.6, 12, 10), M.shrub);
      shrub.scale.y = 0.75;
      shrub.position.set(toX(h.x, h.w) + i * Math.min(10, h.w / 3), 1.2, toZ(h.y, h.d) + h.d / 2 + 2);
      shrub.castShadow = true;
      world.add(shrub);
    }

    const p = s.proj;
    const px = toX(p.x, p.w);
    const pz = toZ(p.y, p.d);
    if (kind === "deck") {
      const top = s.height;
      box(p.w, 0.5, p.d, px, top, pz, M.wood);
      const postXs = [-p.w / 2 + 0.4, p.w / 2 - 0.4];
      if (p.w > 14) postXs.push(0);
      for (const ox of postXs) for (const oz of [-p.d / 2 + 0.4, p.d / 2 - 0.4]) box(0.6, top, 0.6, px + ox, top / 2, pz + oz, M.post);
      const rail = 3;
      const ry = top + 0.25 + rail;
      box(p.w, 0.25, 0.25, px, ry, pz - p.d / 2 + 0.15, M.wood);
      box(p.w, 0.25, 0.25, px, ry, pz + p.d / 2 - 0.15, M.wood);
      box(0.25, 0.25, p.d, px - p.w / 2 + 0.15, ry, pz, M.wood);
      box(0.25, 0.25, p.d, px + p.w / 2 - 0.15, ry, pz, M.wood);
      for (let i = -p.w / 2 + 1; i < p.w / 2; i += 1.5) {
        box(0.15, rail, 0.15, px + i, top + 0.25 + rail / 2, pz - p.d / 2 + 0.15, M.wood);
        box(0.15, rail, 0.15, px + i, top + 0.25 + rail / 2, pz + p.d / 2 - 0.15, M.wood);
      }
      for (let j = -p.d / 2 + 1; j < p.d / 2; j += 1.5) {
        box(0.15, rail, 0.15, px - p.w / 2 + 0.15, top + 0.25 + rail / 2, pz + j, M.wood);
        box(0.15, rail, 0.15, px + p.w / 2 - 0.15, top + 0.25 + rail / 2, pz + j, M.wood);
      }
      const steps = Math.max(1, Math.round(top / 0.6));
      const run = 0.9;
      const stairW = Math.min(4, p.w - 1);
      for (let k = 0; k < steps; k++) {
        box(stairW, 0.3, run, px + p.w / 2 - stairW / 2 - 0.5, top - (k + 1) * (top / steps) + 0.15, pz - p.d / 2 - run / 2 - k * run, M.wood);
      }
    } else {
      building({
        w: p.w,
        d: p.d,
        wall: s.height,
        x: px,
        z: pz,
        siding: M.newSiding,
        roof: M.newRoof,
        door: kind === "garage" ? "garage" : "none",
      });
    }

    // Camera aims at the project; the sun follows the lot size so shadows stay sharp.
    target = new T.Vector3(px, Math.min(8, Math.max(s.height, s.houseHeight) / 2 + 2), pz);
    radius = Math.max(42, Math.max(p.w, p.d) * 2.2, Math.min(s.lotW, s.lotD) * 0.7, s.houseHeight * 3);
    sun.position.set(big * 0.6, big * 1.1, big * 0.8);
    sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera;
    sc.left = -big;
    sc.right = big;
    sc.top = big;
    sc.bottom = -big;
    sc.near = 1;
    sc.far = big * 4;
    sc.updateProjectionMatrix();
    place();
  }

  let yaw = Math.PI + 0.65; // start behind the house, looking toward the street
  let pitch = 0.5;
  let zoom = 1;
  function place() {
    const r = radius * zoom;
    camera.position.set(
      target.x + r * Math.cos(pitch) * Math.sin(yaw),
      target.y + r * Math.sin(pitch),
      target.z + r * Math.cos(pitch) * Math.cos(yaw)
    );
    camera.lookAt(target);
  }
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let drag: { x: number; y: number } | null = null;
  const pinch = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  const down = (e: PointerEvent) => {
    pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.size === 1) drag = { x: e.clientX, y: e.clientY };
    host.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (pinch.has(e.pointerId)) pinch.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.size === 2) {
      const [a, b] = [...pinch.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist) zoom = Math.max(0.3, Math.min(2, zoom * (pinchDist / dist)));
      pinchDist = dist;
      place();
      return;
    }
    if (!drag) return;
    yaw -= (e.clientX - drag.x) * 0.008;
    pitch = Math.max(0.08, Math.min(1.4, pitch + (e.clientY - drag.y) * 0.006));
    drag = { x: e.clientX, y: e.clientY };
    place();
  };
  const up = (e: PointerEvent) => {
    pinch.delete(e.pointerId);
    pinchDist = 0;
    drag = null;
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom = Math.max(0.3, Math.min(2, zoom + e.deltaY * 0.001));
    place();
  };
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("wheel", wheel, { passive: false });
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let frame = 0;
  const loop = () => {
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  loop();

  api.current = { rebuild };

  return () => {
    cancelAnimationFrame(frame);
    ro.disconnect();
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", up);
    host.removeEventListener("wheel", wheel);
    disposeGroup(world);
    Object.values(M).forEach((m) => m.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
