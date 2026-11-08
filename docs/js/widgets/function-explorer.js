/* Chapter 2: function, derivative, and tangent-line explorer. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    quadratic: {
      label: "f(x) = x²",
      f: function (x) { return x * x; },
      df: function (x) { return 2 * x; },
      xMin: -4,
      xMax: 4,
      x0: 1
    },
    cubic: {
      label: "f(x) = x³ − 3x",
      f: function (x) { return x * x * x - 3 * x; },
      df: function (x) { return 3 * x * x - 3; },
      xMin: -3,
      xMax: 3,
      x0: 1.5
    },
    sigmoid: {
      label: "f(x) = 1 / (1 + e⁻ˣ)",
      f: function (x) { return 1 / (1 + Math.exp(-x)); },
      df: function (x) {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      },
      xMin: -6,
      xMax: 6,
      x0: 0
    },
    logarithm: {
      label: "f(x) = ln(x)",
      f: function (x) { return x > 0 ? Math.log(x) : NaN; },
      df: function (x) { return x > 0 ? 1 / x : NaN; },
      xMin: 0.15,
      xMax: 6,
      x0: 1.5
    }
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(3)).toString();
  }

  function functionExplorer(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Function and tangent-line explorer</h3>' +
      '<p class="widget-subtitle">Move the point and watch the derivative become the slope of the tangent line.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="fn-select">Function</label>' +
      '<select id="fn-select" data-fn>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control grow"><label for="fn-x0">Point x₀ <output data-x0-out></output></label>' +
      '<input id="fn-x0" type="range" data-x0 min="-4" max="4" step="0.01" value="1">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">f(x₀)</span><span class="info-card-value" data-fx>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f′(x₀)</span><span class="info-card-value" data-dfx>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Tangent slope</span><span class="info-card-value" data-slope>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Tangent line</span><span class="info-card-value" data-tangent>—</span></div>' +
      "</div>" +
      '<p class="widget-note">The tangent line is the first-order approximation ' +
      "$f(x) \\approx f(x_0) + f'(x_0)(x-x_0)$" +
      ". Near $x_0$, the curve and the line almost coincide.</p>" +
      "</div>";

    const select = container.querySelector("[data-fn]");
    const xSlider = container.querySelector("[data-x0]");
    const xOut = container.querySelector("[data-x0-out]");
    const fxOut = container.querySelector("[data-fx]");
    const dfxOut = container.querySelector("[data-dfx]");
    const slopeOut = container.querySelector("[data-slope]");
    const tangentOut = container.querySelector("[data-tangent]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 300,
      label: "Function and tangent line"
    });

    let preset = PRESETS.quadratic;
    let x0 = preset.x0;

    function syncSlider() {
      xSlider.min = preset.xMin;
      xSlider.max = preset.xMax;
      xSlider.step = (preset.xMax - preset.xMin) / 400;
      xSlider.value = x0;
      xOut.textContent = "= " + fmt(x0);
    }

    function update() {
      const y0 = preset.f(x0);
      const slope = preset.df(x0);
      const intercept = y0 - slope * x0;

      fxOut.textContent = fmt(y0);
      dfxOut.textContent = fmt(slope);
      slopeOut.textContent = fmt(slope);
      tangentOut.textContent =
        "y = " + fmt(slope) + "x" + (intercept >= 0 ? " + " : " − ") + fmt(Math.abs(intercept));

      plot.setRanges({ xMin: preset.xMin, xMax: preset.xMax });
      plot.autoYRanges([preset.f], 0.18);
      plot.setRenderer(function (p) {
        p.drawFunction(preset.f, { color: "#2563eb", width: 2.4 });
        const left = Math.max(preset.xMin, x0 - 1.2);
        const right = Math.min(preset.xMax, x0 + 1.2);
        p.drawSegment(
          left,
          y0 + slope * (left - x0),
          right,
          y0 + slope * (right - x0),
          { color: "#e11d48", width: 1.8, dash: [5, 4] }
        );
        p.drawPoint(x0, y0, { color: "#e11d48", label: "x₀" });
      });
    }

    select.addEventListener("change", function () {
      preset = PRESETS[select.value];
      x0 = preset.x0;
      syncSlider();
      update();
    });

    xSlider.addEventListener("input", function () {
      x0 = Number(xSlider.value);
      xOut.textContent = "= " + fmt(x0);
      update();
    });

    syncSlider();
    update();

    MS.registerCleanup(function () {
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.functionExplorer = functionExplorer;
})();
