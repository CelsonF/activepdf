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
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(2, 2.5, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xf0e3d6, 0.28);
      rim.position.set(-4, -2, 2);
      scene.add(rim);

      // Stack of "paper" sheets
      const group = new THREE.Group();
      scene.add(group);

      const SEG_X = 24;
      const SEG_Y = 32;

      // Soft contact shadow behind the stack (radial-gradient sprite).
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = shadowCanvas.height = 256;
      const sctx = shadowCanvas.getContext("2d")!;
      const sgrad = sctx.createRadialGradient(128, 145, 6, 128, 145, 122);
      sgrad.addColorStop(0, "rgba(38,22,18,0.72)");
      sgrad.addColorStop(0.45, "rgba(38,22,18,0.45)");
      sgrad.addColorStop(1, "rgba(38,22,18,0)");
      sctx.fillStyle = sgrad;
      sctx.fillRect(0, 0, 256, 256);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
      const shadowGeo = new THREE.PlaneGeometry(4.6, 5.4);
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.position.set(-0.25, -0.5, -0.9);
      group.add(shadow);

      // Texture for the top sheet. The highlighter swipe and the form fields
      // are drawn procedurally over an intro timeline (progress 0..1) so they
      // look like they're being applied to the paper, then baked into a texture
      // that bends with the sheet.
      const topCanvas = document.createElement("canvas");
      topCanvas.width = 768;
      topCanvas.height = 1024;
      const tx = topCanvas.getContext("2d")!;
      const topTex = new THREE.CanvasTexture(topCanvas);
      topTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const fields: ReadonlyArray<readonly [number, number, number, number]> = [
        [80, 505, 608, 116],
        [80, 690, 282, 116],
        [406, 690, 282, 116],
      ];
      const fieldWindows: ReadonlyArray<readonly [number, number]> = [
        [0.4, 0.62],
        [0.6, 0.82],
        [0.8, 1],
      ];
      const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
      const drawTopSheet = (p: number) => {
        const seg = (a: number, b: number) => clamp01((p - a) / (b - a));
        tx.fillStyle = "#ffffff";
        tx.fillRect(0, 0, 768, 1024);
        // heading lines fade in first
        tx.globalAlpha = seg(0, 0.1);
        tx.fillStyle = "#dfe6f2";
        tx.fillRect(80, 150, 360, 26);
        tx.fillRect(80, 200, 520, 14);
        tx.globalAlpha = 1;
        // highlighter swipe grows left -> right like a marker stroke
        const hp = seg(0.1, 0.4);
        if (hp > 0) {
          tx.fillStyle = "rgba(177,18,38,0.22)";
          tx.beginPath();
          tx.roundRect(80, 300, Math.max(14, 600 * hp), 92, 8);
          tx.fill();
        }
        // form fields appear one by one, border drawing itself around
        fields.forEach(([x, y, w, h], idx) => {
          const ap = seg(fieldWindows[idx][0], fieldWindows[idx][1]);
          if (ap <= 0) return;
          tx.globalAlpha = ap;
          tx.fillStyle = "rgba(32,26,22,0.16)";
          tx.fillRect(x, y - 26, Math.min(160, w - 20), 12);
          tx.fillStyle = "rgba(32,26,22,0.05)";
          tx.beginPath();
          tx.roundRect(x, y, w, h, 10);
          tx.fill();
          tx.globalAlpha = 1;
          const per = 2 * (w + h);
          tx.strokeStyle = "rgba(32,26,22,0.5)";
          tx.lineWidth = 3;
          tx.setLineDash([per]);
          tx.lineDashOffset = per * (1 - ap);
          tx.beginPath();
          tx.roundRect(x, y, w, h, 10);
          tx.stroke();
          tx.setLineDash([]);
        });
        topTex.needsUpdate = true;
      };
      drawTopSheet(0);

      // Each sheet is a subdivided plane with a static curl baked into its
      // vertices; the flat base positions are kept so the tick loop can add a
      // travelling flutter on top.
      const colors = [0xffffff, 0xfdf8f1, 0xf6efe5];
      const sheetGeos: THREE_NS.PlaneGeometry[] = [];
      const basePositions: Float32Array[] = [];
      const sheets: THREE_NS.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.PlaneGeometry(3, 4, SEG_X, SEG_Y);
        const pos = geo.getAttribute("position") as THREE_NS.BufferAttribute;
        for (let v = 0; v < pos.count; v++) {
          const nx = pos.getX(v) / 1.5; // -1..1
          const ny = pos.getY(v) / 2; // -1..1
          // concave bow + soft diagonal curl, unique per sheet
          const curl = -0.22 * nx * nx + 0.1 * nx * ny + 0.07 * Math.sin(ny * Math.PI + i);
          pos.setZ(v, curl);
        }
        geo.computeVertexNormals();
        basePositions.push(Float32Array.from(pos.array as Float32Array));
        sheetGeos.push(geo);

        const isTop = i === 0;
        // The top sheet reads as clean white paper: a soft emissive driven by
        // its own texture lifts the shaded/curved areas without washing out the
        // highlighter and fields. The other sheets keep their plain shading.
        const mat = new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.92,
          metalness: 0,
          side: THREE.DoubleSide,
          map: isTop ? topTex : null,
          emissive: new THREE.Color(isTop ? 0xffffff : 0x000000),
          emissiveMap: isTop ? topTex : null,
          emissiveIntensity: isTop ? 0.32 : 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(i * 0.18 - 0.18, -i * 0.22, -i * 0.3);
        mesh.rotation.z = (i - 1) * 0.05;
        group.add(mesh);
        sheets.push(mesh);
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
      let introDone = false;
      const start = performance.now();
      const INSERT_DUR = 1.3; // seconds for a sheet to slide up into place
      const RISE_FROM = -3.8; // start position, below the frame (the "upload")
      const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
      const tick = (now: number) => {
        const t = (now - start) / 1000;

        // Phase 1 — "upload": sheets slide up from below and settle into the
        // stack. Phase 2 — draw the highlighter + fields, but only once the top
        // sheet is in place.
        const groupRise = easeOut(t / INSERT_DUR);
        if (!introDone) {
          const p = (t - INSERT_DUR - 0.3) / 3.2;
          drawTopSheet(clamp01(p));
          if (p >= 1) introDone = true;
        }
        shadowMat.opacity = groupRise;

        group.rotation.y += (target.x * 0.6 * groupRise - group.rotation.y) * 0.05;
        group.rotation.x += (-target.y * 0.4 * groupRise - group.rotation.x) * 0.05;
        group.position.y = Math.sin(t * 0.8) * 0.15 * groupRise;
        group.position.x = Math.sin(t * 0.5) * 0.08 * groupRise;
        sheets.forEach((s, i) => {
          const riseI = easeOut((t - i * 0.12) / INSERT_DUR);
          const restY = -i * 0.22 + Math.sin(t * 0.9 + i) * 0.09 * riseI;
          s.position.y = RISE_FROM * (1 - riseI) + restY;
          s.position.x = i * 0.18 - 0.18 + Math.cos(t * 0.6 + i) * 0.05 * riseI;
          // a slight tilt on entry that straightens out as the sheet settles
          s.rotation.z = (i - 1) * 0.05 + Math.sin(t * 0.5 + i) * 0.025 + (1 - riseI) * 0.12;
          // travelling flutter, stronger toward the free (right/top) edge
          const pos = sheetGeos[i].getAttribute("position") as THREE_NS.BufferAttribute;
          const base = basePositions[i];
          for (let v = 0; v < pos.count; v++) {
            const x = base[v * 3];
            const y = base[v * 3 + 1];
            const edge = (x / 1.5 + 1) * 0.35 + (y / 2 + 1) * 0.15;
            const wave = Math.sin(x * 1.6 + y * 0.9 + t * 1.8 + i * 1.3) * 0.05 * edge * riseI;
            pos.setZ(v, base[v * 3 + 2] + wave);
          }
          pos.needsUpdate = true;
          sheetGeos[i].computeVertexNormals();
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
        sheetGeos.forEach((g) => g.dispose());
        shadowGeo.dispose();
        shadowTex.dispose();
        topTex.dispose();
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