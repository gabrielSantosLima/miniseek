/* Chapter 9: analytic versus numerical gradient. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    cubic: {
      label: "f(x) = x³",
      f: function (x) { return x * x * x; },
      df: function (x) { return 3 * x * x; }
    },
    sine: {
      label: "f(x) = sin(x)",
      f: Math.sin,
      df: Math.cos
    },
    sigmoid: {
      label: "f(x) = σ(x)",
      f: function (x) { return 1 / (1 + Math.exp(-x)); },
      df: function (x) {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      }
    }
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toExponential(3)).toString();
  }

  function gradientCheck(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Gradient checking</h3>' +
      '<p class="widget-subtitle">Compare the analytic derivative with a central difference. Too large or too small an h breaks the check.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="gc-fn">Function</label>' +
      '<select id="gc-fn" data-fn>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control grow"><label for="gc-x">Point x <output data-x-out></output></label>' +
      '<input id="gc-x" type="range" data-x min="-2.5" max="2.5" step="0.01" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="gc-h">Step h <output data-h-out></output></label>' +
      '<input id="gc-h" type="range" data-h min="1" max="7" step="0.5" value="3">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">analytic f′(x)</span><span class="info-card-value" data-analytic>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">numeric</span><span class="info-card-value" data-numeric>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">abs error</span><span class="info-card-value" data-error>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">relative error</span><span class="info-card-value" data-rel>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback>Central difference: $(f(x+h)-f(x-h))/(2h)$.</div>' +
      "</div>";

    const fnSelect = container.querySelector("[data-fn]");
    const xInput = container.querySelector("[data-x]");
    const hInput = container.querySelector("[data-h]");
    const xOut = container.querySelector("[data-x-out]");
    const hOut = container.querySelector("[data-h-out]");
    const analyticOut = container.querySelector("[data-analytic]");
    const numericOut = container.querySelector("[data-numeric]");
    const errorOut = container.querySelector("[data-error]");
    const relOut = container.querySelector("[data-rel]");
    const feedback = container.querySelector("[data-feedback]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 290,
      xMin: -3,
      xMax: 3,
      label: "Function, tangent, and finite-difference points"
    });

    let preset = PRESETS.cubic;
    let x = 1;
    let h = 1e-3;

    function update() {
      const analytic = preset.df(x);
      const numeric = (preset.f(x + h) - preset.f(x - h)) / (2 * h);
      const error = Math.abs(analytic - numeric);
      const rel = analytic === 0 ? error : error / Math.abs(analytic);

      xOut.textContent = "= " + fmt(x);
      hOut.textContent = "= " + fmt(h);
      analyticOut.textContent = fmt(analytic);
      numericOut.textContent = fmt(numeric);
      errorOut.textContent = fmt(error);
      relOut.textContent = fmt(rel);

      if (rel < 1e-5) {
        feedback.className = "feedback ok";
        feedback.textContent = "The check passes: analytic and numerical derivatives agree to roughly five digits.";
      } else if (h < 1e-5) {
        feedback.className = "feedback warn";
        feedback.textContent = "h is very small; floating-point cancellation is now dominating the finite difference.";
      } else {
        feedback.className = "feedback info";
        feedback.textContent = "The difference is still visible. Try a smaller h, but watch for round-off.";
      }

      plot.setRanges({ xMin: -3, xMax: 3 });
      plot.autoYRanges([preset.f], 0.2);
      plot.setRenderer(function (p) {
        p.drawFunction(preset.f, { color: "#2563eb", width: 2.4 });
        const y = preset.f(x);
        p.drawSegment(x - 1.2, y - analytic * 1.2, x + 1.2, y + analytic * 1.2, {
          color: "#e11d48",
          width: 1.7,
          dash: [5, 4]
        });
        p.drawPoint(x - h, preset.f(x - h), { color: "#7c3aed", radius: 3, ring: false });
        p.drawPoint(x + h, preset.f(x + h), { color: "#7c3aed", radius: 3, ring: false });
        p.drawPoint(x, y, { color: "#e11d48", label: "x" });
      });
    }

    fnSelect.addEventListener("change", function () {
      preset = PRESETS[fnSelect.value];
      update();
    });

    xInput.addEventListener("input", function () {
      x = Number(xInput.value);
      update();
    });

    hInput.addEventListener("input", function () {
      h = Math.pow(10, -Number(hInput.value));
      update();
    });

    update();

    MS.registerCleanup(function () {
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.gradientCheck = gradientCheck;
})();
