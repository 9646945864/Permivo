"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import type { Sketch, SketchKind } from "./model";

// 3D view of the same sketch. three.js is loaded only when this view is opened.
// Simple massing: boxes, a hip roof, deck posts, railings and stairs. Not an architectural model.

type Three = typeof THREE_NS;

const HOUSE_WALL = 12;

export default function Sketch3D({ sketch, kind }: { sketch: Sketch; kind: SketchKind }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ rebuild: (s: Sketch, k: SketchKind) => void } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three")
      .then((T: Three) => {
        if (disposed || !hostRef.current) return;
        cleanup = mount(T, hostRef.current, api);
        api.current?.rebuild(sketch, kind);
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      cleanup();
      api.current = null;
    };
    // mount once; updates go through rebuild below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current?.rebuild(sketch, kind);
  }, [sketch, kind]);

  if (failed) return <p className="text-sm text-gray-600">The 3D view could not load. The plan view still works.</p>;
  return <div ref={hostRef} className="sk-3d" aria-label="3D view of the sketch. Drag to turn, scroll to zoom." role="img" />;
}

function mount(T: Three, host: HTMLDivElement, api: React.MutableRefObject<{ rebuild: (s: Sketch, k: SketchKind) => void } | null>) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.5, 2000);
  scene.add(new T.HemisphereLight(0xffffff, 0x888866, 0.9 * Math.PI));
  const sun = new T.DirectionalLight(0xffffff, 0.8 * Math.PI);
  sun.position.set(60, 120, 80);
  scene.add(sun);

  const mat = (c: number) => new T.MeshLambertMaterial({ color: c });
  const M = { grass: mat(0x9fc57a), house: mat(0xe8e4da), roof: mat(0x8a5a3c), wood: mat(0xc4874f), post: mat(0x8a5a33), proj: mat(0xd85a30) };

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
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE_NS.Material, parent = world) => {
      const b = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      b.position.set(x, y, z);
      parent.add(b);
      return b;
    };
    const building = (w: number, d: number, wall: number, x: number, z: number, m: THREE_NS.Material) => {
      box(w, wall, d, x, wall / 2, z, m);
      const diag = Math.hypot(w, d);
      const roof = new T.Mesh(new T.ConeGeometry(diag / 2, wall * 0.5, 4, 1), M.roof);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set((w / diag) * Math.SQRT2, 1, (d / diag) * Math.SQRT2);
      roof.position.set(x, wall + wall * 0.25, z);
      world.add(roof);
    };

    box(s.lotW, 0.4, s.lotD, 0, -0.2, 0, M.grass);
    const grid = new T.GridHelper(Math.max(s.lotW, s.lotD), Math.max(s.lotW, s.lotD) / 5, 0x7fa35f, 0x8fb46d);
    grid.scale.set(s.lotW / Math.max(s.lotW, s.lotD), 1, s.lotD / Math.max(s.lotW, s.lotD));
    grid.position.y = 0.02;
    world.add(grid);
    const edge = new T.LineSegments(
      new T.EdgesGeometry(new T.BoxGeometry(s.lotW, 0.1, s.lotD)),
      new T.LineDashedMaterial({ color: 0x333333, dashSize: 2, gapSize: 1.5 })
    );
    edge.computeLineDistances();
    edge.position.y = 0.06;
    world.add(edge);

    const h = s.house;
    building(h.w, h.d, HOUSE_WALL, toX(h.x, h.w), toZ(h.y, h.d), M.house);

    const p = s.proj;
    const px = toX(p.x, p.w);
    const pz = toZ(p.y, p.d);
    if (kind === "deck") {
      const top = s.height;
      box(p.w, 0.5, p.d, px, top, pz, M.wood);
      const postXs = [-p.w / 2 + 0.4, p.w / 2 - 0.4];
      if (p.w > 14) postXs.push(0);
      for (const ox of postXs) for (const oz of [-p.d / 2 + 0.4, p.d / 2 - 0.4]) box(0.6, top, 0.6, px + ox, top / 2, pz + oz, M.post);
      // guards on all four sides, about 3 ft high
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
      // stairs down off the side away from the house
      const steps = Math.max(1, Math.round(top / 0.6));
      const run = 0.9;
      const stairW = Math.min(4, p.w - 1);
      for (let k = 0; k < steps; k++) {
        box(stairW, 0.3, run, px + p.w / 2 - stairW / 2 - 0.5, top - (k + 1) * (top / steps) + 0.15, pz - p.d / 2 - run / 2 - k * run, M.wood);
      }
    } else {
      building(p.w, p.d, s.height, px, pz, M.proj);
    }

    // Aim at the project; frame enough of the lot to see the house next to it.
    target = new T.Vector3(px, Math.min(6, s.height / 2 + 2), pz);
    radius = Math.max(45, Math.max(p.w, p.d) * 2.2, Math.min(s.lotW, s.lotD) * 0.9);
    place();
  }

  let yaw = Math.PI + 0.65; // start behind the house, looking toward the street
  let pitch = 0.55;
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
  const down = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY };
    host.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!drag) return;
    yaw -= (e.clientX - drag.x) * 0.008;
    pitch = Math.max(0.12, Math.min(1.4, pitch + (e.clientY - drag.y) * 0.006));
    drag = { x: e.clientX, y: e.clientY };
    place();
  };
  const up = () => (drag = null);
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom = Math.max(0.35, Math.min(2, zoom + e.deltaY * 0.001));
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
