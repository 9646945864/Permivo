"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { EQUIP, HVAC_UNIT, storiesFor, type Equip, type Sketch, type SketchKind } from "./model";

// 3D view of the same sketch. three.js is loaded only when this view is opened.
// Buildings get a foundation, siding with corner trim, a gable roof with overhangs, windows per story,
// a street-facing door, and soft shadows. X-ray mode makes the house see-through so inside conversions
// and trade equipment show. Still a massing model, not an architectural drawing.

type Three = typeof THREE_NS;
type Api = { rebuild: (s: Sketch, k: SketchKind, xray: boolean) => void };

export default function Sketch3D({ sketch, kind, xray }: { sketch: Sketch; kind: SketchKind; xray: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const latest = useRef({ sketch, kind, xray });
  latest.current = { sketch, kind, xray };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three")
      .then((T: Three) => {
        if (disposed || !hostRef.current) return;
        cleanup = mount(T, hostRef.current, api);
        const l = latest.current;
        api.current?.rebuild(l.sketch, l.kind, l.xray);
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      cleanup();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.rebuild(sketch, kind, xray);
  }, [sketch, kind, xray]);

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
  const ghost = (c: number, opacity: number) => new T.MeshLambertMaterial({ color: c, transparent: true, opacity, depthWrite: false });
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
    floor: mat(0xd9d2c3),
    convert: ghost(0xe98a5e, 0.7),
    // X-ray versions of the existing house
    xSiding: ghost(0xe4ddd0, 0.22),
    xRoof: ghost(0x50555d, 0.16),
    xTrim: ghost(0xfbfaf6, 0.3),
    xGlass: ghost(0x5f7a93, 0.25),
    // equipment
    panel: mat(0x9aa3ad),
    outlet: mat(0xf2c400),
    heater: mat(0xdfe6ee),
    fixture: mat(0xf7f7f7),
    unit: mat(0xb7c2c6),
    fan: mat(0x3b4650),
    handler: mat(0x9fb1b7),
    pad: mat(0xbdb8ae),
    elec: new T.MeshBasicMaterial({ color: 0xe0b400 }),
    plumb: new T.MeshBasicMaterial({ color: 0x2f7fd1 }),
    hvac: new T.MeshBasicMaterial({ color: 0x2aa198 }),
  };
  const textures: THREE_NS.Texture[] = [];

  let world = new T.Group();
  scene.add(world);
  let target = new T.Vector3();
  let radius = 120;

  function disposeGroup(g: THREE_NS.Object3D) {
    g.traverse((o) => {
      const mesh = o as THREE_NS.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const sprite = o as THREE_NS.Sprite;
      if (sprite.isSprite) sprite.material.dispose();
    });
    textures.splice(0).forEach((t) => t.dispose());
  }

  function rebuild(s: Sketch, kind: SketchKind, xray: boolean) {
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
      const see = (m as THREE_NS.Material).transparent;
      b.castShadow = !see;
      b.receiveShadow = !see;
      parent.add(b);
      return b;
    };
    const label = (text: string, x: number, y: number, z: number, color: string) => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 96;
      const g = c.getContext("2d")!;
      g.font = "600 40px system-ui, sans-serif";
      const w = Math.min(500, g.measureText(text).width + 36);
      g.fillStyle = "rgba(255,255,255,0.93)";
      g.fillRect((512 - w) / 2, 14, w, 68);
      g.strokeStyle = color;
      g.lineWidth = 4;
      g.strokeRect((512 - w) / 2, 14, w, 68);
      g.fillStyle = color;
      g.textAlign = "center";
      g.fillText(text, 256, 62);
      const tex = new T.CanvasTexture(c);
      textures.push(tex);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false }));
      sp.scale.set(13, 2.45, 1);
      sp.position.set(x, y, z);
      sp.renderOrder = 10;
      world.add(sp);
    };
    const run = (pts: [number, number, number][], m: THREE_NS.Material) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = new T.Vector3(...pts[i]);
        const b = new T.Vector3(...pts[i + 1]);
        const len = a.distanceTo(b);
        if (len < 0.01) continue;
        const c = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, len, 8), m);
        c.position.copy(a).add(b).multiplyScalar(0.5);
        c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        world.add(c);
      }
    };

    // Ground, grid and dashed lot line
    box(s.lotW, 0.4, s.lotD, 0, -0.2, 0, M.grass).castShadow = false;
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
      y0?: number; // sits on top of something (a new story); no foundation then
      siding: THREE_NS.Material;
      roof: THREE_NS.Material;
      trim?: THREE_NS.Material;
      glass?: THREE_NS.Material;
      door: "front" | "garage" | "none";
      chimney?: boolean;
      floor?: boolean; // show the floor slab (used in X-ray)
    }) {
      const { w, d, wall, x, z } = opts;
      const trim = opts.trim ?? M.trim;
      const glass = opts.glass ?? M.glass;
      const g = new T.Group();
      g.position.set(x, opts.y0 ?? 0, z);
      world.add(g);
      const base = opts.y0 ? 0 : 1;
      if (base) box(w + 0.4, base, d + 0.4, 0, base / 2, 0, M.foundation, g);
      if (opts.floor) box(w - 0.2, 0.15, d - 0.2, 0, base + 0.08, 0, M.floor, g);
      box(w, wall, d, 0, base + wall / 2, 0, opts.siding, g);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.5, wall, 0.5, (sx * w) / 2, base + wall / 2, (sz * d) / 2, trim, g);
      box(w + 0.3, 0.5, d + 0.3, 0, base + wall - 0.25, 0, trim, g);

      const stories = storiesFor(wall);
      const storyH = wall / stories;
      const winW = 3;
      const winH = Math.min(4.5, storyH * 0.45);
      const faces = [
        { len: w, at: (t: number) => [t, d / 2 + 0.06] as const, along: "x", front: true },
        { len: w, at: (t: number) => [t, -d / 2 - 0.06] as const, along: "x", front: false },
        { len: d, at: (t: number) => [w / 2 + 0.06, t] as const, along: "z", front: false },
        { len: d, at: (t: number) => [-w / 2 - 0.06, t] as const, along: "z", front: false },
      ];
      for (const f of faces) {
        const n = Math.max(1, Math.floor(f.len / 10));
        for (let st = 0; st < stories; st++) {
          const cy = base + st * storyH + storyH * 0.55;
          for (let i = 0; i < n; i++) {
            const t = -f.len / 2 + ((i + 0.5) * f.len) / n;
            if (st === 0 && f.front && opts.door === "front" && Math.abs(t) < 4.5) continue;
            if (st === 0 && f.front && opts.door === "garage") continue;
            const [wx, wz] = f.at(t);
            const alongX = f.along === "x";
            box(alongX ? winW + 0.6 : 0.12, winH + 0.6, alongX ? 0.12 : winW + 0.6, wx, cy, wz, trim, g);
            box(alongX ? winW : 0.16, winH, alongX ? 0.16 : winW, wx, cy, wz, glass, g);
          }
        }
      }
      if (opts.door === "front") {
        box(4, 7.6, 0.14, 0, base + 3.8, d / 2 + 0.06, trim, g);
        box(3.2, 7, 0.2, 0, base + 3.5, d / 2 + 0.08, M.door, g);
        box(5, 0.4, 3, 0, 0.2, d / 2 + 1.5, M.walk, g);
      } else if (opts.door === "garage") {
        const gw = Math.min(16, w - 3);
        box(gw + 0.6, 7.6, 0.14, 0, base + 3.5, d / 2 + 0.06, trim, g);
        box(gw, 7, 0.2, 0, base + 3.2, d / 2 + 0.08, M.garageDoor, g);
        for (let k = 1; k < 4; k++) box(gw, 0.08, 0.24, 0, base - 0.3 + k * 1.75, d / 2 + 0.1, trim, g);
      }

      // Gable roof, 6-in-12 pitch, ridge along the longer side, 1.5 ft overhangs.
      const long = Math.max(w, d);
      const short = Math.min(w, d);
      const o = 1.5;
      const pitch = 0.5;
      const rise = (short / 2) * pitch;
      const roof = new T.Group();
      roof.position.y = base + wall;
      if (d > w) roof.rotation.y = Math.PI / 2;
      g.add(roof);
      const hw = short / 2 + o;
      const ang = Math.atan(pitch);
      for (const side of [1, -1]) {
        const slab = box(long + 2 * o, 0.45, hw / Math.cos(ang), 0, rise - (hw / 2) * pitch + 0.2, side * (hw / 2), opts.roof, roof);
        slab.rotation.x = side * ang;
      }
      const gable = new T.Shape();
      gable.moveTo(-short / 2, 0);
      gable.lineTo(short / 2, 0);
      gable.lineTo(0, rise);
      gable.closePath();
      const attic = new T.Mesh(new T.ExtrudeGeometry(gable, { depth: long, bevelEnabled: false }), opts.siding);
      attic.geometry.translate(0, 0, -long / 2);
      attic.rotation.y = Math.PI / 2;
      attic.castShadow = !(opts.siding as THREE_NS.Material).transparent;
      roof.add(attic);
      if (opts.chimney) box(2.2, rise + 4, 2.2, long * 0.3, rise / 2 + 2, short * 0.15, M.chimney, roof);
      return { top: base + wall, base };
    }

    // Existing house, front door toward the street. X-ray makes it see-through.
    const h = s.house;
    const hx = toX(h.x, h.w);
    const hz = toZ(h.y, h.d);
    const house = building({
      w: h.w,
      d: h.d,
      wall: s.houseHeight,
      x: hx,
      z: hz,
      siding: xray ? M.xSiding : M.siding,
      roof: xray ? M.xRoof : M.roof,
      trim: xray ? M.xTrim : M.trim,
      glass: xray ? M.xGlass : M.glass,
      door: "front",
      chimney: !xray,
      floor: xray,
    });
    for (let i = -1; i <= 1; i += 2) {
      const shrub = new T.Mesh(new T.SphereGeometry(1.6, 12, 10), M.shrub);
      shrub.scale.y = 0.75;
      shrub.position.set(hx + i * Math.min(10, h.w / 3), 1.2, hz + h.d / 2 + 2);
      shrub.castShadow = true;
      world.add(shrub);
    }

    const p = s.proj;
    const px = toX(p.x, p.w);
    const pz = toZ(p.y, p.d);
    let focus = { x: px, z: pz, y: Math.min(8, Math.max(s.height, s.houseHeight) / 2 + 2), size: Math.max(p.w, p.d) };

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
      const runLen = 0.9;
      const stairW = Math.min(4, p.w - 1);
      for (let k = 0; k < steps; k++) {
        box(stairW, 0.3, runLen, px + p.w / 2 - stairW / 2 - 0.5, top - (k + 1) * (top / steps) + 0.15, pz - p.d / 2 - runLen / 2 - k * runLen, M.wood);
      }
    } else if (kind === "garage") {
      building({ w: p.w, d: p.d, wall: s.height, x: px, z: pz, siding: M.newSiding, roof: M.newRoof, door: "garage" });
    } else if (kind === "addition" && s.addType === "out") {
      building({ w: p.w, d: p.d, wall: s.height, x: px, z: pz, siding: M.newSiding, roof: M.newRoof, door: "none" });
    } else if (kind === "addition" && s.addType === "up") {
      // New story on top of the house walls, over the area drawn inside the house
      building({ w: p.w, d: p.d, wall: s.height, x: px, z: pz, y0: house.top, siding: M.newSiding, roof: M.newRoof, door: "none" });
      focus = { ...focus, y: house.top + s.height / 2 };
    } else if (kind === "addition" && s.addType === "inside") {
      // Converted space glows inside the see-through house
      const hgt = Math.max(3, s.houseHeight / storiesFor(s.houseHeight) - 0.6);
      box(p.w - 0.3, hgt, p.d - 0.3, px, house.base + hgt / 2 + 0.15, pz, M.convert);
      const outline = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(p.w - 0.3, hgt, p.d - 0.3)), new T.LineBasicMaterial({ color: 0xc2410c }));
      outline.position.set(px, house.base + hgt / 2 + 0.15, pz);
      world.add(outline);
    } else {
      focus = { x: hx, z: hz, y: 5, size: Math.max(h.w, h.d) };
    }

    // Trade equipment, with runs: circuits from the panel, fixtures from the water heater, air handler to the outdoor unit
    const inHouse = (e: Equip) => e.x >= h.x && e.x <= h.x + h.w && e.y >= h.y && e.y <= h.y + h.d;
    const pos = (e: Equip) => ({ x: e.x - s.lotW / 2, z: e.y - s.lotD / 2, floor: inHouse(e) ? house.base : 0 });
    const ceiling = house.base + Math.min(s.houseHeight, 9.5) - 0.8;
    for (const e of s.equip) {
      const { x, z, floor } = pos(e);
      const color = EQUIP[e.type].color;
      if (e.type === "panel") box(1.4, 2.4, 0.5, x, floor + 4.5, z, M.panel);
      if (e.type === "circuit") box(0.8, 0.8, 0.8, x, floor + 1.4, z, M.outlet);
      if (e.type === "waterHeater") {
        const c = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 5, 18), M.heater);
        c.position.set(x, floor + 2.5, z);
        c.castShadow = true;
        world.add(c);
      }
      if (e.type === "fixture") box(2.4, 2.6, 2, x, floor + 1.3, z, M.fixture);
      if (e.type === "airHandler") box(2.6, 4.2, 2.6, x, floor + 2.1, z, M.handler);
      if (e.type === "hvacOut") {
        box(HVAC_UNIT + 1, 0.4, HVAC_UNIT + 1, x, 0.2, z, M.pad);
        box(HVAC_UNIT, HVAC_UNIT, HVAC_UNIT, x, 0.4 + HVAC_UNIT / 2, z, M.unit);
        const fan = new T.Mesh(new T.CylinderGeometry(1.15, 1.15, 0.12, 20), M.fan);
        fan.position.set(x, 0.45 + HVAC_UNIT, z);
        world.add(fan);
      }
      label(EQUIP[e.type].label, x, floor + (e.type === "hvacOut" ? 6.5 : 7.2), z, color);
    }
    const panel = s.equip.find((e) => e.type === "panel");
    const heater = s.equip.find((e) => e.type === "waterHeater");
    const outdoor = s.equip.find((e) => e.type === "hvacOut");
    for (const e of s.equip) {
      const b = pos(e);
      if (e.type === "circuit" && panel) {
        const a = pos(panel);
        run([[a.x, a.floor + 5.7, a.z], [a.x, ceiling, a.z], [b.x, ceiling, a.z], [b.x, ceiling, b.z], [b.x, b.floor + 1.8, b.z]], M.elec);
      }
      if (e.type === "fixture" && heater) {
        const a = pos(heater);
        const y = Math.max(a.floor, b.floor) + 0.35;
        run([[a.x, y, a.z], [b.x, y, a.z], [b.x, y, b.z]], M.plumb);
      }
      if (e.type === "airHandler" && outdoor) {
        const a = pos(outdoor);
        run([[a.x, 1.4, a.z], [b.x, 1.4, a.z], [b.x, 1.4, b.z], [b.x, b.floor + 2, b.z]], M.hvac);
      }
    }

    // Camera aims at the project; the sun follows the lot size so shadows stay sharp.
    target = new T.Vector3(focus.x, focus.y, focus.z);
    radius = Math.max(42, focus.size * 2.2, Math.min(s.lotW, s.lotD) * 0.7, s.houseHeight * 3);
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
