(function () {
  "use strict";

  /* ═══════════════════════════════════════════
     CONFIG — set this when you have a mailing
     list. Leave it empty and the form stays
     honest instead of faking a signup.
     ═══════════════════════════════════════════ */
  const SIGNUP_ENDPOINT = "";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ───────────────────────────────────────────
     THE BLOCKOUT
     Five placeholder volumes on a grid, drawn
     with a hand-rolled perspective projection.
     ─────────────────────────────────────────── */
  const BOXES = [
    { c: [-1.55, 0.55, -0.70], s: [1.30, 1.10, 1.30] },
    { c: [ 0.75, 0.35,  0.95], s: [1.70, 0.70, 1.10] },
    { c: [ 1.75, 0.95, -1.25], s: [0.75, 1.90, 0.75] },
    { c: [-0.15, 1.60, -0.50], s: [0.45, 0.45, 0.45] },
    { c: [ 0.05, 0.45,  2.00], s: [0.36, 0.90, 0.36], accent: true }
  ];

  /* The scene borrows the logo's structure: everything bone, one thing red. */
  const PAL = {
    base:   { lo: [18, 19, 21], hi: [48, 51, 55],   edge: [242, 239, 234], ea: 0.70 },
    accent: { lo: [48, 6, 8],   hi: [140, 12, 18],  edge: [253, 1, 11],    ea: 0.95 }
  };

  document.getElementById("r-objects").textContent =
    String(BOXES.length).padStart(2, "0");

  // Face winding chosen so every normal points outward.
  const FACES = [
    [4, 5, 6, 7], [1, 0, 3, 2], [5, 1, 2, 6],
    [0, 4, 7, 3], [3, 7, 6, 2], [0, 1, 5, 4]
  ];

  function corners(box) {
    const [cx, cy, cz] = box.c;
    const hx = box.s[0] / 2, hy = box.s[1] / 2, hz = box.s[2] / 2;
    return [
      [cx - hx, cy - hy, cz - hz], [cx + hx, cy - hy, cz - hz],
      [cx + hx, cy + hy, cz - hz], [cx - hx, cy + hy, cz - hz],
      [cx - hx, cy - hy, cz + hz], [cx + hx, cy - hy, cz + hz],
      [cx + hx, cy + hy, cz + hz], [cx - hx, cy + hy, cz + hz]
    ];
  }

  const canvas = document.getElementById("scene");
  const stage  = document.getElementById("stage");
  const frame  = document.getElementById("viewport");
  const ctx    = canvas.getContext("2d");

  let W = 0, H = 0;

  /* The scene is rendered small and scaled up by CSS, so the blockout is
     built from real pixels rather than smooth vectors. Lower = chunkier. */
  const RES = 0.34, RES_MIN = 170, RES_MAX = 380;

  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;

    const cssW = r.width, cssH = r.height;
    const bufW = Math.max(RES_MIN, Math.min(RES_MAX, Math.round(cssW * RES)));
    const scale = bufW / cssW;

    W = bufW;
    H = Math.round(cssH * scale);
    canvas.width = W;
    canvas.height = H;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const res = document.getElementById("r-res");
    if (res) res.textContent = W + "\u00d7" + H;
  }

  // Camera
  let yaw = 0.62, pitch = 0.40;
  let spin = 0.0015, vYaw = 0, vPitch = 0;
  const CAM = 8.4;

  function rotate(p) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x =  p[0] * cy - p[2] * sy;
    const z =  p[0] * sy + p[2] * cy;
    const y =  p[1] - 0.55;               // drop the horizon a little
    return [x, y * cp - z * sp, y * sp + z * cp];
  }

  function project(v) {
    const z = v[2] + CAM;
    const d = z < 0.25 ? 0.25 : z;
    const f = Math.min(W, H) * 1.28;
    return [W / 2 + (v[0] * f) / d, H / 2 - (v[1] * f) / d, d];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  const LIGHT = (function () {
    const l = [-0.42, 0.86, -0.30];
    const m = Math.hypot(l[0], l[1], l[2]);
    return [l[0] / m, l[1] / m, l[2] / m];
  })();

  function shade(t, pal) {
    const r = Math.round(pal.lo[0] + (pal.hi[0] - pal.lo[0]) * t);
    const g = Math.round(pal.lo[1] + (pal.hi[1] - pal.lo[1]) * t);
    const b = Math.round(pal.lo[2] + (pal.hi[2] - pal.lo[2]) * t);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function drawGrid(alpha) {
    const N = 4;
    ctx.lineWidth = 1;
    for (let i = -N; i <= N; i++) {
      for (let axis = 0; axis < 2; axis++) {
        const p1 = axis === 0 ? [i, 0, -N] : [-N, 0, i];
        const p2 = axis === 0 ? [i, 0,  N] : [ N, 0, i];
        const a = project(rotate(p1));
        const b = project(rotate(p2));
        const origin = (i === 0);
        const fade = origin ? 0.34 : 0.11 - Math.abs(i) * 0.012;
        const rgb = origin ? "253,1,11" : "242,239,234";
        ctx.strokeStyle = "rgba(" + rgb + "," + Math.max(0, fade) * alpha + ")";
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }
  }

  function drawBoxes(alpha) {
    const polys = [];

    for (const box of BOXES) {
      const pal = box.accent ? PAL.accent : PAL.base;
      const pts = corners(box).map(rotate);
      for (const f of FACES) {
        const A = pts[f[0]], B = pts[f[1]], C = pts[f[2]];
        const n = cross(
          [B[0] - A[0], B[1] - A[1], B[2] - A[2]],
          [C[0] - B[0], C[1] - B[1], C[2] - B[2]]
        );
        const mid = [
          (pts[f[0]][0] + pts[f[2]][0]) / 2,
          (pts[f[0]][1] + pts[f[2]][1]) / 2,
          (pts[f[0]][2] + pts[f[2]][2]) / 2 + CAM
        ];
        // Back-face cull: skip faces whose normal points away from the camera.
        if (n[0] * mid[0] + n[1] * mid[1] + n[2] * mid[2] >= 0) continue;

        const m = Math.hypot(n[0], n[1], n[2]) || 1;
        const lit = (n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / m;
        const screenPts = f.map(function (i) { return project(pts[i]); });
        let depth = 0;
        for (const s of screenPts) depth += s[2];

        polys.push({
          pts: screenPts,
          depth: depth / screenPts.length,
          fill: shade(Math.max(0, Math.min(1, 0.5 + 0.5 * lit)), pal),
          edge: pal.edge,
          ea: pal.ea
        });
      }
    }

    // Painter's algorithm: far to near, so solid fills hide the edges behind them.
    polys.sort(function (a, b) { return b.depth - a.depth; });

    ctx.lineWidth = 1;
    ctx.lineJoin = "round";

    for (const poly of polys) {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(poly.pts[0][0], poly.pts[0][1]);
      for (let i = 1; i < poly.pts.length; i++) ctx.lineTo(poly.pts[i][0], poly.pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = poly.fill;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(" + poly.edge[0] + "," + poly.edge[1] + "," +
                        poly.edge[2] + "," + (poly.ea * alpha) + ")";
      ctx.stroke();
    }
  }

  /* Boot: grid resolves first, then the geometry, then a single sweep. */
  let boot = reduce ? 1 : 0;
  let last = performance.now();

  function render(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (boot < 1) boot = Math.min(1, boot + dt / 1.5);

    if (!dragging) {
      yaw += vYaw;
      pitch = Math.max(0.06, Math.min(1.05, pitch + vPitch));
      vYaw *= 0.92;
      vPitch *= 0.92;
      if (!reduce) yaw += spin;
    }

    ctx.clearRect(0, 0, W, H);

    const gridA = Math.min(1, boot / 0.45);
    const bodyA = Math.max(0, Math.min(1, (boot - 0.35) / 0.55));

    drawGrid(gridA);
    if (bodyA > 0) drawBoxes(bodyA);

    // One-time scan sweep during boot
    if (boot < 1 && !reduce) {
      const y = H * boot;
      const band = Math.max(6, H * 0.11);
      const g = ctx.createLinearGradient(0, y - band, 0, y + 2);
      g.addColorStop(0, "rgba(253,1,11,0)");
      g.addColorStop(1, "rgba(253,1,11,0.30)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y - band, W, band + 2);
    }

    requestAnimationFrame(render);
  }

  /* Drag to orbit */
  let dragging = false, lastX = 0, lastY = 0;

  stage.addEventListener("pointerdown", function (e) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    vYaw = vPitch = 0;
    frame.classList.add("is-touched");
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    vYaw = dx * 0.0055;
    vPitch = dy * 0.0040;
    yaw += vYaw;
    pitch = Math.max(0.06, Math.min(1.05, pitch + vPitch));
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    if (e && e.pointerId !== undefined && stage.hasPointerCapture(e.pointerId)) {
      stage.releasePointerCapture(e.pointerId);
    }
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  /* Keyboard orbit, so the viewport isn't mouse-only */
  stage.tabIndex = 0;
  stage.addEventListener("keydown", function (e) {
    const step = 0.09;
    if (e.key === "ArrowLeft")       yaw -= step;
    else if (e.key === "ArrowRight") yaw += step;
    else if (e.key === "ArrowUp")    pitch = Math.min(1.05, pitch + step * 0.6);
    else if (e.key === "ArrowDown")  pitch = Math.max(0.06, pitch - step * 0.6);
    else return;
    e.preventDefault();
    frame.classList.add("is-touched");
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(render);

  /* ───────────────────────────────────────────
     THEME: day / night / auto
     "auto" is resolved to a concrete value here,
     so the CSS only ever deals with two states.
     ─────────────────────────────────────────── */
  const THEME_KEY = "mps-theme";
  const root = document.documentElement;
  const sysLight = window.matchMedia("(prefers-color-scheme: light)");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeBtns = Array.prototype.slice.call(
    document.querySelectorAll(".themer__opt")
  );

  let memPref = "auto";           // fallback when storage is unavailable
  let themeTimer = null;

  function readPref() {
    try {
      return localStorage.getItem(THEME_KEY) || "auto";
    } catch (e) {
      return memPref;
    }
  }

  function writePref(pref) {
    memPref = pref;
    try { localStorage.setItem(THEME_KEY, pref); } catch (e) { /* private mode */ }
  }

  function applyTheme(pref, animate) {
    const mode = pref === "auto"
      ? (sysLight.matches ? "light" : "dark")
      : pref;

    if (animate && !reduce) {
      root.classList.add("is-theming");
      clearTimeout(themeTimer);
      themeTimer = setTimeout(function () {
        root.classList.remove("is-theming");
      }, 520);
    }

    root.setAttribute("data-theme", mode);
    if (themeMeta) themeMeta.setAttribute("content", mode === "light" ? "#F2F0EB" : "#0E0D0D");
    themeBtns.forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.set === pref));
    });
  }

  themeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      const pref = b.dataset.set;
      writePref(pref);
      applyTheme(pref, true);
    });
  });

  // In auto mode, follow the system if it flips while the page is open.
  const onSysChange = function () {
    if (readPref() === "auto") applyTheme("auto", true);
  };
  if (sysLight.addEventListener) sysLight.addEventListener("change", onSysChange);
  else if (sysLight.addListener) sysLight.addListener(onSysChange);

  applyTheme(readPref(), false);

  /* ───────────────────────────────────────────
     SIGNUP
     ─────────────────────────────────────────── */
  const form  = document.getElementById("signup");
  const email = document.getElementById("email");
  const reply = document.getElementById("reply");
  const submit = document.getElementById("submit");

  function say(text) {
    reply.textContent = text;
    reply.classList.add("is-shown");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      say("That address doesn't look complete — check it and try again.");
      email.focus();
      return;
    }

    if (!SIGNUP_ENDPOINT) {
      say("The list isn't connected yet. Email hello@mikropixel.studio and we'll add you by hand.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Adding you";

    fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        form.reset();
        submit.textContent = "You're on the list";
        say("Done. You'll hear from us once and it'll be worth it.");
      })
      .catch(function () {
        submit.disabled = false;
        submit.textContent = "Keep me posted";
        say("That didn't go through. Try again, or email hello@mikropixel.studio.");
      });
  });

  email.addEventListener("input", function () {
    reply.classList.remove("is-shown");
  });

  /* Single page-load sequence */
  requestAnimationFrame(function () {
    document.body.classList.add("is-ready");
  });
})();
