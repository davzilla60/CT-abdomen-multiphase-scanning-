/* Multiphase Abdomen & Pelvis CT teaching tool (Rad-Lad).
 * Plain JS, no build step. Phase definitions and the contrast diagram are data-driven:
 * edit PHASES / STRUCTURES below; slice lists come from js/series.js. */
(function () {
  "use strict";

  const SERIES = window.SERIES || {};

  // ---- Phases ---------------------------------------------------------------
  const PHASES = [
    {
      key: "non-contrast",
      name: "Non-contrast",
      color: "#9fb3c6",
      t: 0,
      timing: "Before injection",
      summary: "No IV contrast yet. Every tissue shows its native density.",
      findings: [
        "Baseline attenuation (HU) to measure enhancement against",
        "Calcifications and renal or ureteric stones",
        "Acute haemorrhage and fat-containing lesions",
      ],
      diagram: "Before injection the contrast is still in the IV line, so the organs show their native density.",
      bestFor: "Stones, calcification, haemorrhage, baseline HU",
    },
    {
      key: "arterial",
      name: "Arterial",
      color: "#ff5c5c",
      t: 35,
      timing: "≈ 35–40 s (late arterial)",
      summary: "Contrast fills the aorta and its branches; hypervascular tissue lights up.",
      findings: [
        "Bright aorta, coeliac axis, SMA and renal arteries",
        "Kidneys show corticomedullary differentiation",
        "Pancreas enhances avidly; spleen can look striped (heterogeneous)",
        "HCC shows arterial-phase hyperenhancement",
      ],
      diagram: "Contrast leaves the heart through the aorta. The arteries, renal cortex, pancreas and spleen enhance first.",
      bestFor: "Hypervascular liver lesions (HCC), arterial anatomy, active bleeding",
    },
    {
      key: "portal-venous",
      name: "Portal venous",
      color: "#5aa9ff",
      t: 70,
      timing: "≈ 60–75 s",
      summary: "Contrast returns from the gut and spleen through the portal vein; the liver reaches peak enhancement.",
      findings: [
        "Portal, splenic, mesenteric and hepatic veins opacified",
        "Liver parenchyma at peak enhancement",
        "Spleen and kidneys now enhance homogeneously",
        "HCC typically shows washout relative to the liver",
      ],
      diagram: "Blood returning from the bowel and spleen carries contrast through the portal vein into the liver, then out via the hepatic veins to the IVC.",
      bestFor: "Routine abdomen and pelvis, liver lesion detection, venous patency",
    },
    {
      key: "delayed",
      name: "Delayed",
      color: "#3fdc63",
      t: 300,
      timing: "≈ 3–5 min (excretory 5–15 min)",
      summary: "The kidneys excrete contrast into the collecting systems, ureters and bladder.",
      findings: [
        "Renal collecting systems, ureters and bladder opacify",
        "Liver: persistent washout, capsule, delayed fibrous enhancement",
        "Urothelial lesions and urinary leaks",
      ],
      diagram: "The kidneys filter contrast out of the blood and excrete it into the collecting systems, ureters and bladder.",
      bestFor: "Collecting systems and ureters, HCC capsule and washout, cholangiocarcinoma",
    },
  ];
  PHASES.forEach((p) => (p.series = SERIES[p.key] || null));

  // ---- Contrast diagram -----------------------------------------------------
  // Each structure: key (drives the contrast level), kind (organ = filled, vessel = stroked),
  // geometry, base anatomical colour. `glowOnly` structures have no base drawing.
  const KIDNEY_CORTEX = "M-2,-31 C-25,-30 -25,30 -2,31 C12,30 18,20 14,10 C10,4 10,-4 14,-10 C18,-20 12,-30 -2,-31 Z";
  const KIDNEY_MEDULLA = "M-13,-18 L-3,-11 L-14,-7 Z M-17,-3 L-5,0 L-17,4 Z M-13,8 L-3,11 L-14,17 Z";
  const KIDNEY_COLLECTING = "M-3,-12 L7,-2 M-5,0 L7,0 M-3,12 L7,2 M6,-3 L15,0 L6,3 Z";
  const RK = "translate(330,234)";
  const LK = "translate(436,222) scale(-1,1)";

  const STRUCTURES = [
    { key: "bowel", kind: "vessel", w: 9, base: "#6b4a44",
      d: "M300,262 q20,-14 40,0 t40,0 t40,0 t40,0 M302,290 q20,14 40,0 t40,0 t40,0 t36,0 M312,318 q20,-14 40,0 t40,0 t40,0" },
    { key: "liver", kind: "organ", base: "#7a4535",
      d: "M276,96 C300,78 372,76 422,92 C432,98 430,108 414,114 C380,130 350,160 320,186 C300,190 282,176 276,150 C270,130 270,108 276,96 Z" },
    { key: "spleen", kind: "organ", base: "#6e3d5c",
      d: "M462,108 C484,112 488,160 470,172 C456,180 448,160 452,138 C454,122 452,108 462,108 Z" },
    { key: "spleenArterial", kind: "organ", glowOnly: true, fill: "url(#zebra)",
      d: "M462,108 C484,112 488,160 470,172 C456,180 448,160 452,138 C454,122 452,108 462,108 Z" },
    { key: "pancreas", kind: "organ", base: "#a48a5a",
      d: "M358,204 C382,196 420,186 452,160 C460,166 458,176 448,182 C420,200 392,214 362,216 Z M348,196 C340,210 344,228 360,228 C368,220 366,206 356,198 Z" },
    { key: "cortex", kind: "organ", base: "#7a3b3b", d: KIDNEY_CORTEX, transform: RK },
    { key: "cortex", kind: "organ", base: "#7a3b3b", d: KIDNEY_CORTEX, transform: LK },
    { key: "medulla", kind: "organ", base: "#4a2424", d: KIDNEY_MEDULLA, transform: RK },
    { key: "medulla", kind: "organ", base: "#4a2424", d: KIDNEY_MEDULLA, transform: LK },
    { key: "collecting", kind: "vessel", w: 2.5, base: "#8a8450", d: KIDNEY_COLLECTING, transform: RK },
    { key: "collecting", kind: "vessel", w: 2.5, base: "#8a8450", d: KIDNEY_COLLECTING, transform: LK },
    { key: "ureters", kind: "vessel", w: 3, base: "#8a8450",
      d: "M345,236 Q354,280 351,330 Q350,382 366,404 M421,224 Q413,280 414,330 Q415,382 394,404" },
    { key: "bladder", kind: "organ", base: "#6a7a5a", d: "M350,412 a30,18 0 1,0 60,0 a30,18 0 1,0 -60,0 Z" },
    // Veins
    { key: "ivc", kind: "vessel", w: 8, base: "#2f5f9e",
      d: "M372,300 L368,150 L374,90 M372,300 Q356,340 338,372 L324,440 M372,300 Q390,340 404,372 L412,440 M367,228 L344,232 M367,224 L424,224" },
    { key: "hepaticv", kind: "vessel", w: 4, base: "#2f5f9e",
      d: "M371,98 Q340,106 298,116 M371,100 Q354,118 334,140 M373,98 Q392,104 412,106" },
    { key: "mesenteric", kind: "vessel", w: 5, base: "#3d63b0",
      d: "M372,202 Q410,192 440,170 Q452,160 458,148 M372,202 Q378,242 372,292" },
    { key: "portal", kind: "vessel", w: 6, base: "#3d63b0",
      d: "M372,202 Q352,182 332,162 M332,162 Q304,152 288,130 M332,162 Q362,140 400,108 M332,162 Q314,170 296,166" },
    // Arteries
    { key: "arteries", kind: "vessel", w: 3.5, base: "#b33a3a",
      d: "M396,152 Q370,150 342,154 Q322,158 314,166 M396,152 Q430,140 458,128 M395,170 Q410,200 405,240 Q398,270 388,292 M394,214 L346,226 M394,212 L424,218 M392,300 Q372,340 352,372 L340,440 M392,300 Q408,340 420,372 L428,440" },
    { key: "aorta", kind: "vessel", w: 9, base: "#b33a3a", d: "M384,62 C382,36 412,36 406,66 L392,300" },
    { key: "heart", kind: "organ", base: "#8a2c2c",
      d: "M360,54 Q368,34 388,42 Q408,30 418,50 Q424,72 392,96 Q364,80 360,54 Z" },
    { key: "armvein", kind: "vessel", w: 4, base: "#2f5f9e",
      d: "M193,318 Q206,258 220,200 Q232,124 262,72 Q298,46 352,48 L366,56" },
    { key: "iv", kind: "vessel", w: 2.5, base: "#9fb3c6", d: "M64,360 Q70,412 130,398 Q172,382 193,320" },
  ];

  // Order in which contrast reaches each structure; drives the staggered fill animation.
  const ARRIVAL = {
    iv: 0, armvein: 1, heart: 2, aorta: 3, arteries: 4, cortex: 5, pancreas: 5, spleen: 5.2,
    spleenArterial: 5.2, bowel: 5.6, mesenteric: 6.2, medulla: 6.6, portal: 7, liver: 7.6,
    hepaticv: 8.5, ivc: 9, collecting: 10.5, ureters: 11.5, bladder: 12.5,
  };

  // Relative contrast density in each structure per phase (0 = none, 1 = maximal).
  const LEVELS = {
    "non-contrast": {},
    arterial: { iv: 0.9, armvein: 0.5, heart: 0.75, aorta: 1, arteries: 1, cortex: 0.9, medulla: 0.12,
      spleenArterial: 0.8, pancreas: 0.8, bowel: 0.3, mesenteric: 0.4, portal: 0.3, liver: 0.18, ivc: 0.15 },
    "portal-venous": { iv: 0.3, armvein: 0.2, heart: 0.5, aorta: 0.55, arteries: 0.5, cortex: 0.8, medulla: 0.7,
      spleen: 0.75, pancreas: 0.5, bowel: 0.3, mesenteric: 1, portal: 1, liver: 0.9, hepaticv: 0.85, ivc: 0.7 },
    delayed: { armvein: 0.05, heart: 0.25, aorta: 0.3, arteries: 0.25, cortex: 0.45, medulla: 0.45, spleen: 0.35,
      pancreas: 0.25, bowel: 0.15, mesenteric: 0.3, portal: 0.35, liver: 0.45, hepaticv: 0.35, ivc: 0.35,
      collecting: 1, ureters: 1, bladder: 0.95 },
  };

  // Labels: anchor point on the structure, text position, which side the text sits.
  const LABELS = {
    iv: { text: "IV line", ax: 150, ay: 392, x: 118, y: 438, side: "left" },
    heart: { text: "Heart", ax: 404, ay: 58, x: 505, y: 46 },
    aorta: { text: "Aorta", ax: 395, ay: 120, x: 505, y: 92 },
    arteries: { text: "Iliac arteries", ax: 424, ay: 392, x: 505, y: 380 },
    cortex: { text: "Renal cortex", ax: 452, ay: 222, x: 505, y: 222 },
    kidneys: { text: "Kidneys", ax: 452, ay: 222, x: 505, y: 222 },
    pancreas: { text: "Pancreas", ax: 430, ay: 186, x: 505, y: 184 },
    spleen: { text: "Spleen", ax: 474, ay: 140, x: 505, y: 140 },
    hepaticv: { text: "Hepatic veins", ax: 408, ay: 106, x: 505, y: 104 },
    liver: { text: "Liver", ax: 296, ay: 140, x: 258, y: 214, side: "left" },
    portal: { text: "Portal vein", ax: 346, ay: 176, x: 258, y: 250, side: "left" },
    collecting: { text: "Renal collecting\nsystems", ax: 432, ay: 222, x: 505, y: 214 },
    ureters: { text: "Ureters", ax: 414, ay: 320, x: 505, y: 320 },
    bladder: { text: "Bladder", ax: 404, ay: 412, x: 505, y: 412 },
  };
  const PHASE_LABELS = {
    "non-contrast": ["iv"],
    arterial: ["aorta", "cortex", "pancreas", "spleen", "arteries"],
    "portal-venous": ["liver", "portal", "hepaticv", "spleen", "kidneys"],
    delayed: ["collecting", "ureters", "bladder"],
  };

  // ---- DOM ------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const SVGNS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };

  const diagram = $("diagram");
  const glowEls = [];
  const labelEls = {};

  function buildDiagram() {
    const defs = svgEl("defs", {}, diagram);
    const f = svgEl("filter", { id: "glow", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs);
    svgEl("feGaussianBlur", { stdDeviation: "2.6", result: "b" }, f);
    const m = svgEl("feMerge", {}, f);
    svgEl("feMergeNode", { in: "b" }, m);
    svgEl("feMergeNode", { in: "SourceGraphic" }, m);
    const zebra = svgEl("pattern", { id: "zebra", width: "9", height: "9", patternUnits: "userSpaceOnUse", patternTransform: "rotate(35)" }, defs);
    svgEl("rect", { width: "4.5", height: "9", fill: "#8dffd7" }, zebra);
    svgEl("rect", { x: "4.5", width: "4.5", height: "9", fill: "#8dffd7", "fill-opacity": "0.25" }, zebra);
    const bodyGrad = svgEl("radialGradient", { id: "bodyGrad", cx: "50%", cy: "40%", r: "70%" }, defs);
    svgEl("stop", { offset: "0%", "stop-color": "#2a5378", "stop-opacity": "0.55" }, bodyGrad);
    svgEl("stop", { offset: "100%", "stop-color": "#0d2236", "stop-opacity": "0.25" }, bodyGrad);

    // Silhouette, arm, pelvis and spine (context only)
    const ctx = svgEl("g", { opacity: "0.9" }, diagram);
    svgEl("path", { d: "M276,30 Q236,60 226,140 Q218,220 196,300 Q190,320 186,346", fill: "none", stroke: "#2a5378", "stroke-opacity": "0.45", "stroke-width": "34", "stroke-linecap": "round" }, ctx);
    svgEl("path", { d: "M310,6 Q276,12 272,58 L266,226 Q260,300 282,352 Q298,398 312,458 L448,458 Q462,398 478,352 Q500,300 494,226 L488,58 Q484,12 450,6 Z", fill: "url(#bodyGrad)", stroke: "#4b82b3", "stroke-opacity": "0.6", "stroke-width": "1.5" }, ctx);
    for (let y = 100; y < 380; y += 17) svgEl("rect", { x: 374, y, width: 14, height: 12, rx: 3, fill: "#c9d9e6", "fill-opacity": "0.12" }, ctx);
    svgEl("path", { d: "M288,334 Q300,300 344,316 Q352,350 342,384 Q310,376 288,334 Z M472,334 Q460,300 416,316 Q408,350 418,384 Q450,376 472,334 Z", fill: "#c9d9e6", "fill-opacity": "0.1", stroke: "#c9d9e6", "stroke-opacity": "0.25" }, ctx);

    // IV bag with contrast
    const bag = svgEl("g", {}, diagram);
    svgEl("rect", { x: 58, y: 270, width: 12, height: 10, rx: 2, fill: "#9fb3c6", "fill-opacity": "0.6" }, bag);
    svgEl("rect", { x: 42, y: 280, width: 44, height: 66, rx: 9, fill: "#0f2a40", stroke: "#9fd9ff", "stroke-opacity": "0.7" }, bag);
    svgEl("rect", { x: 46, y: 304, width: 36, height: 38, rx: 6, fill: "#8dffd7", "fill-opacity": "0.55", filter: "url(#glow)" }, bag);
    svgEl("rect", { x: 58, y: 346, width: 12, height: 14, rx: 2, fill: "#9fb3c6", "fill-opacity": "0.6" }, bag);
    svgEl("circle", { cx: 64, cy: 364, r: 2.5, fill: "#8dffd7", class: "drip" }, bag);
    svgEl("text", { x: 64, y: 330, "text-anchor": "middle", "font-size": "10", fill: "#06111c", "font-weight": "600" }, bag).textContent = "IV";

    const baseG = svgEl("g", { class: "base-layer" }, diagram);
    const glowG = svgEl("g", { class: "glow-layer", filter: "url(#glow)" }, diagram);

    STRUCTURES.forEach((s) => {
      const common = { d: s.d };
      if (s.transform) common.transform = s.transform;
      if (!s.glowOnly) {
        svgEl("path", Object.assign({}, common, s.kind === "organ"
          ? { fill: s.base, "fill-opacity": "0.5", stroke: s.base, "stroke-opacity": "0.9", "stroke-width": "1" }
          : { fill: "none", stroke: s.base, "stroke-opacity": "0.75", "stroke-width": s.w, "stroke-linecap": "round", "stroke-linejoin": "round" }), baseG);
      }
      const g = svgEl("path", Object.assign({}, common, s.kind === "organ"
        ? { fill: s.fill || "#8dffd7", "fill-opacity": s.fill ? "0.9" : "0.6", stroke: "#c9fff0", "stroke-opacity": "0.6", "stroke-width": "1" }
        : { fill: "none", stroke: "#8dffd7", "stroke-width": s.w, "stroke-linecap": "round", "stroke-linejoin": "round" }), glowG);
      g.classList.add("glow", s.kind);
      g.dataset.key = s.key;
      glowEls.push(g);
    });

    const labelG = svgEl("g", {}, diagram);
    Object.keys(LABELS).forEach((k) => {
      const L = LABELS[k];
      const g = svgEl("g", { class: "label" }, labelG);
      const left = L.side === "left";
      const tx = left ? L.x + 4 : L.x - 4;
      svgEl("line", { x1: L.ax, y1: L.ay, x2: tx, y2: L.y - 4 }, g);
      svgEl("circle", { cx: L.ax, cy: L.ay, r: 2.6 }, g);
      const text = svgEl("text", { x: L.x, y: L.y, "text-anchor": left ? "end" : "start" }, g);
      L.text.split("\n").forEach((line, i) => (svgEl("tspan", { x: L.x, dy: i ? "1.15em" : "0" }, text).textContent = line));
      labelEls[k] = g;
    });
  }

  function renderContrast(phaseKey, speed) {
    const levels = LEVELS[phaseKey];
    const step = 0.2 / speed;
    glowEls.forEach((el) => {
      const key = el.dataset.key;
      const target = levels[key] || 0;
      const current = parseFloat(el.style.opacity || "0");
      const rising = target > current + 0.01;
      el.style.transitionDuration = (rising ? 0.9 : 1.2) / speed + "s";
      el.style.transitionDelay = rising ? (ARRIVAL[key] || 0) * step + "s" : "0s";
      el.style.opacity = target;
      el.classList.toggle("flowing", target >= 0.5);
    });
    const show = PHASE_LABELS[phaseKey];
    Object.keys(labelEls).forEach((k) => labelEls[k].classList.toggle("on", show.includes(k)));
  }

  // ---- CT viewer ------------------------------------------------------------
  const state = { phase: 0, z: null, compare: false, playing: false, cineTimer: null };
  const pad = (i) => String(i).padStart(3, "0");
  const src = (p, i) => `images/${p.key}/${pad(i)}.jpg`;
  const cache = {};

  // Union of every series' table positions, superior -> inferior, for synced scrolling.
  const allZ = Array.from(new Set(PHASES.flatMap((p) => (p.series ? p.series.z.map((z) => Math.round(z * 2) / 2) : []))))
    .sort((a, b) => b - a);

  function nearest(p, z) {
    const zs = p.series.z;
    let best = 0;
    for (let i = 1; i < zs.length; i++) if (Math.abs(zs[i] - z) < Math.abs(zs[best] - z)) best = i;
    const step = zs.length > 1 ? Math.abs(zs[1] - zs[0]) : 2.5;
    return { i: best, covered: Math.abs(zs[best] - z) <= step };
  }

  function preload(p) {
    if (!p.series || cache[p.key]) return;
    cache[p.key] = [];
    for (let i = 0; i < p.series.count; i++) {
      const im = new Image();
      im.decoding = "async";
      im.src = src(p, i);
      cache[p.key].push(im);
    }
  }

  const curPhase = () => PHASES[state.phase];
  const slider = $("sliceRange");

  function sliceList() {
    return state.compare ? allZ : (curPhase().series ? curPhase().series.z : []);
  }

  function renderViewer() {
    const p = curPhase();
    $("single").hidden = state.compare;
    $("compare").hidden = !state.compare;
    const list = sliceList();
    slider.disabled = list.length === 0;
    $("sliceUp").disabled = $("sliceDown").disabled = $("cineBtn").disabled = list.length === 0;

    if (state.compare) {
      const idx = list.indexOf(nearestIn(list, state.z));
      slider.max = list.length - 1;
      slider.value = idx;
      PHASES.forEach((q, n) => {
        const tile = $("compare").children[n];
        tile.classList.toggle("active", n === state.phase);
        const img = tile.querySelector("img");
        const miss = tile.querySelector(".miss");
        if (!q.series) { img.hidden = true; miss.hidden = false; miss.textContent = "Images coming soon"; return; }
        const r = nearest(q, state.z);
        img.hidden = false;
        img.src = src(q, r.i);
        miss.hidden = r.covered;
        miss.textContent = "Not covered at this level";
      });
    } else {
      const ph = $("mainPlaceholder");
      if (!p.series) {
        ph.hidden = false;
        $("mainImg").hidden = true;
        $("coverageNote").hidden = true;
        $("ovSlice").textContent = $("ovZ").textContent = "";
      } else {
        ph.hidden = true;
        $("mainImg").hidden = false;
        const r = nearest(p, state.z);
        $("mainImg").src = src(p, r.i);
        $("mainImg").alt = `${p.name} phase axial CT, slice ${r.i + 1} of ${p.series.count}`;
        slider.max = p.series.count - 1;
        slider.value = r.i;
        $("ovSlice").textContent = `Im ${r.i + 1} / ${p.series.count}`;
        $("ovZ").textContent = `Z ${p.series.z[r.i].toFixed(1)} mm`;
        const note = $("coverageNote");
        note.hidden = r.covered;
        note.textContent = `${p.name} series doesn't reach this level · nearest slice shown`;
      }
      $("ovPhase").textContent = p.name;
    }
    renderThumbs();
  }

  function nearestIn(list, z) {
    let best = list[0];
    for (const v of list) if (Math.abs(v - z) < Math.abs(best - z)) best = v;
    return best;
  }

  function stepSlice(delta) {
    const list = sliceList();
    if (!list.length) return;
    const cur = list.indexOf(nearestIn(list, state.z));
    const next = Math.max(0, Math.min(list.length - 1, cur + delta));
    state.z = list[next];
    renderViewer();
  }

  function setSliceIndex(i) {
    const list = sliceList();
    if (!list.length) return;
    state.z = list[Math.max(0, Math.min(list.length - 1, i))];
    renderViewer();
  }

  // ---- Thumbnails, timeline, phase card --------------------------------------
  function buildChrome() {
    const stops = $("stops");
    const thumbs = $("thumbs");
    const cmp = $("compare");
    PHASES.forEach((p, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stop";
      b.setAttribute("role", "tab");
      b.innerHTML = `<span class="ring"></span><span>${p.name}</span><span class="t">${p.t === 0 ? "0 s" : p.t < 120 ? p.t + " s" : p.t / 60 + " min"}</span>`;
      b.addEventListener("click", () => { stopPlayback(); selectPhase(n); });
      stops.appendChild(b);

      const t = document.createElement("button");
      t.type = "button";
      t.className = "thumb";
      t.setAttribute("aria-label", `Show ${p.name} phase`);
      t.innerHTML = p.series
        ? `<img alt="" loading="lazy"><span class="tname">${p.name}</span>`
        : `<span class="soon">Images coming soon</span><span class="tname">${p.name}</span>`;
      t.addEventListener("click", () => { stopPlayback(); selectPhase(n); });
      thumbs.appendChild(t);

      const tile = document.createElement("div");
      tile.className = "tile";
      tile.innerHTML = `<img alt="${p.name} phase"><span class="tname">${p.name}</span><div class="miss" hidden></div>`;
      tile.addEventListener("click", () => { stopPlayback(); selectPhase(n); });
      cmp.appendChild(tile);

      const row = document.createElement("tr");
      row.innerHTML = `<td><strong>${p.name}</strong></td><td>${p.timing}</td><td>${p.bestFor}</td>`;
      $("learnRows").appendChild(row);
    });
  }

  function renderThumbs() {
    const thumbs = $("thumbs").children;
    PHASES.forEach((p, n) => {
      thumbs[n].classList.toggle("active", n === state.phase);
      if (!p.series) return;
      const img = thumbs[n].querySelector("img");
      const s = src(p, nearest(p, state.z).i);
      if (img.getAttribute("src") !== s) img.src = s;
    });
  }

  let clockAnim = null;
  function animateClock(from, to, ms) {
    cancelAnimationFrame(clockAnim);
    const start = performance.now();
    const fmt = (s) => (s < 120 ? Math.round(s) + " s" : Math.floor(s / 60) + " min " + String(Math.round(s % 60)).padStart(2, "0") + " s");
    const tick = (now) => {
      const k = Math.min(1, (now - start) / ms);
      $("clock").textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) clockAnim = requestAnimationFrame(tick);
    };
    clockAnim = requestAnimationFrame(tick);
  }

  const speed = () => parseFloat($("speed").value) || 1;

  function selectPhase(n) {
    const prev = curPhase();
    state.phase = n;
    const p = curPhase();
    preload(p);
    renderContrast(p.key, speed());
    animateClock(prev.t, p.t, 1600 / speed());

    $("journeyText").textContent = p.diagram;
    $("phaseName").textContent = p.name;
    $("phaseSummary").textContent = `${p.timing}. ${p.summary}`;
    $("phaseFindings").innerHTML = p.findings.map((f) => `<li>${f}</li>`).join("");
    $("phaseDot").style.background = p.color;
    $("phaseDot").style.boxShadow = `0 0 14px ${p.color}`;
    $("trackFill").style.width = (n / (PHASES.length - 1)) * 100 + "%";
    Array.from($("stops").children).forEach((b, i) => {
      b.setAttribute("aria-selected", String(i === n));
      b.classList.toggle("passed", i < n);
    });
    renderViewer();
  }

  // ---- Injection playback -----------------------------------------------------
  let playTimer = null;
  function startPlayback() {
    stopPlayback();
    state.playing = true;
    diagram.classList.add("injecting");
    $("playLabel").textContent = "Injecting…";
    let n = state.phase >= PHASES.length - 1 ? 0 : state.phase;
    if (n === 0) selectPhase(0);
    const advance = () => {
      n += 1;
      if (n >= PHASES.length) { stopPlayback(); $("playLabel").textContent = "Replay injection"; return; }
      selectPhase(n);
      playTimer = setTimeout(advance, 4200 / speed());
    };
    playTimer = setTimeout(advance, (n === 0 ? 1200 : 300) / speed());
  }
  function stopPlayback() {
    clearTimeout(playTimer);
    if (state.playing) $("playLabel").textContent = "Resume injection";
    state.playing = false;
    diagram.classList.remove("injecting");
  }

  // ---- Input ----------------------------------------------------------------
  function bindInput() {
    const viewer = $("viewer");
    let wheelAcc = 0;
    viewer.addEventListener("wheel", (e) => {
      e.preventDefault();
      wheelAcc += e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      while (Math.abs(wheelAcc) >= 40) {
        stepSlice(wheelAcc > 0 ? 1 : -1);
        wheelAcc -= Math.sign(wheelAcc) * 40;
      }
    }, { passive: false });

    let dragY = null;
    viewer.addEventListener("pointerdown", (e) => { dragY = e.clientY; viewer.setPointerCapture(e.pointerId); });
    viewer.addEventListener("pointermove", (e) => {
      if (dragY === null) return;
      const d = e.clientY - dragY;
      if (Math.abs(d) >= 6) { stepSlice(Math.trunc(d / 6)); dragY = e.clientY; }
    });
    const end = () => (dragY = null);
    viewer.addEventListener("pointerup", end);
    viewer.addEventListener("pointercancel", end);

    viewer.addEventListener("keydown", (e) => {
      const map = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
      if (e.key in map) { e.preventDefault(); stepSlice(map[e.key]); }
      if (e.key === "Home") { e.preventDefault(); setSliceIndex(0); }
      if (e.key === "End") { e.preventDefault(); setSliceIndex(1e6); }
    });
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, select, textarea, dialog[open]")) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= PHASES.length) { stopPlayback(); selectPhase(n - 1); }
    });

    slider.addEventListener("input", () => setSliceIndex(parseInt(slider.value, 10)));
    $("sliceUp").addEventListener("click", () => stepSlice(-1));
    $("sliceDown").addEventListener("click", () => stepSlice(1));
    $("cineBtn").addEventListener("click", () => {
      const btn = $("cineBtn");
      if (state.cineTimer) { clearInterval(state.cineTimer); state.cineTimer = null; btn.setAttribute("aria-pressed", "false"); return; }
      btn.setAttribute("aria-pressed", "true");
      let dir = 1;
      state.cineTimer = setInterval(() => {
        const list = sliceList();
        const i = list.indexOf(nearestIn(list, state.z));
        if (i + dir < 0 || i + dir >= list.length) dir = -dir;
        stepSlice(dir);
      }, 90);
    });

    $("compareToggle").addEventListener("change", (e) => {
      state.compare = e.target.checked;
      if (state.compare) PHASES.forEach(preload);
      renderViewer();
    });
    $("playBtn").addEventListener("click", startPlayback);
    $("pauseBtn").addEventListener("click", stopPlayback);
    $("resetBtn").addEventListener("click", () => { stopPlayback(); $("playLabel").textContent = "Start injection"; selectPhase(0); });
    $("speed").addEventListener("change", () => { if (state.playing) startPlayback(); });

    const dlg = $("learnDialog");
    $("learnBtn").addEventListener("click", () => (dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "")));
  }

  // ---- Init -----------------------------------------------------------------
  buildDiagram();
  buildChrome();
  bindInput();

  // Start at the level of the kidneys/pancreas on the first available series.
  const first = PHASES.find((p) => p.series);
  state.z = first ? first.series.z[Math.round(first.series.count * 0.32)] : 0;

  const params = new URLSearchParams(location.search);
  const start = Math.max(0, PHASES.findIndex((p) => p.key === params.get("phase")));
  selectPhase(start);
  $("clock").textContent = PHASES[start].t + " s";

  // Warm the cache for the other phases once the page is idle.
  (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => PHASES.forEach(preload));
})();
