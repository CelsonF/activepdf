import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";

/**
 * Lightweight three.js scene: a stack of paper sheets that float and
 * react to the cursor. Pure visual flourish — no interaction.
 * Renders only on the client (guarded by useEffect).
 */
export function PaperScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;
      const host = mountRef.current;

      const width = host.clientWidth;
      const height = host.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x6aa9ff, 0.6);
      rim.position.set(-4, -2, 2);
      scene.add(rim);

      // Stack of "paper" sheets
      const group = new THREE.Group();
      scene.add(group);

      const sheetGeo = new THREE.PlaneGeometry(3, 4, 1, 1);

      const colors = [0xffffff, 0xfff8d6, 0xeaf2ff];
      const sheets: THREE_NS.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.85,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(sheetGeo, mat);
        mesh.position.set(i * 0.18 - 0.18, -i * 0.22, -i * 0.3);
        mesh.rotation.z = (i - 1) * 0.05;
        group.add(mesh);
        sheets.push(mesh);
      }

      // Highlighter "swipe" bar on the top sheet
      const markGeo = new THREE.PlaneGeometry(2.4, 0.35);
      const markMat = new THREE.MeshBasicMaterial({
        color: 0xf5d524,
        transparent: true,
        opacity: 0.78,
      });
      const mark = new THREE.Mesh(markGeo, markMat);
      mark.position.set(0, 0.6, 0.01);
      sheets[0].add(mark);

      // Field rectangles
      const fieldMat = new THREE.MeshBasicMaterial({ color: 0x2b6cff, transparent: true, opacity: 0.18 });
      const fieldBorderMat = new THREE.LineBasicMaterial({ color: 0x2b6cff });
      for (const [w, h, x, y] of [
        [2.4, 0.45, 0, -0.2],
        [1.1, 0.45, -0.65, -0.9],
        [1.1, 0.45, 0.65, -0.9],
      ] as const) {
        const fg = new THREE.PlaneGeometry(w, h);
        const fm = new THREE.Mesh(fg, fieldMat);
        fm.position.set(x, y, 0.011);
        sheets[0].add(fm);
        const edges = new THREE.EdgesGeometry(fg);
        const line = new THREE.LineSegments(edges, fieldBorderMat);
        line.position.copy(fm.position);
        sheets[0].add(line);
      }

      // Mouse parallax
      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.6;
      };
      window.addEventListener("pointermove", onMove);

      const onResize = () => {
        if (!host) return;
        const w = host.clientWidth;
        const h = host.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      let raf = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const t = (now - start) / 1000;
        group.rotation.y += (target.x * 0.6 - group.rotation.y) * 0.05;
        group.rotation.x += (-target.y * 0.4 - group.rotation.x) * 0.05;
        group.position.y = Math.sin(t * 0.8) * 0.08;
        sheets.forEach((s, i) => {
          s.position.y = -i * 0.22 + Math.sin(t * 0.9 + i) * 0.04;
          s.rotation.z = (i - 1) * 0.05 + Math.sin(t * 0.5 + i) * 0.01;
        });
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        sheetGeo.dispose();
        markGeo.dispose();
        host.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}