/* Chapter 3: activation functions and their derivatives. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  const PRESETS = {
    sigmoid: {
      label: "Sigmoid",
      formula: "$\\sigma(x)=\\dfrac{1}{1+e^{-x}}$",
      f: sigmoid,
      df: function (x) {
        const s = sigmoid(x);
        return s * (1 - s);
      },
      note: "Saturates for large |x|, so the derivative approaches zero."
    },
    tanh: {
      label: "Tanh",
      formula: "$\\tanh(x)=\\dfrac{e^x-e^{-x}}{e^x+e^{-x}}$",
      f: Math.tanh,
      df: function (x) {
        const t = Math.tanh(x);
        return 1 - t * t;
      },
      note: "Zero-centred, but still saturates at both ends."
    },
    relu: {
      label: "ReLU",
      formula: "$\\operatorname{ReLU}(x)=\\max(0,x)$",
      f: function (x) { return Math.max(0, x); },
      df: function (x) {
        if (x > 0) return 1;
        if (x < 0) return 0;
        return NaN;
      },
      note: "Cheap and non-saturating for positive inputs; the derivative is undefined at zero."
    },
    gelu: {
      label: "GELU (approx.)",
      formula: "$\\operatorname{GELU}(x)\\approx 0.5x\\left(1+\\tanh\\left(\\sqrt{2/\\pi}(x+0.044715x^3)\\right)\\right)$",
      f: function (x) {
        const c = Math.sqrt(2 / Math.PI);
        return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
      },
      df: function (x) {
        const c = Math.sqrt(2 / Math.PI);
        const u = c * (x + 0.044715 * x * x * x);
        const t = Math.tanh(u);
        return (
          0.5 * (1 + t) +
          0.5 * x * (1 - t * t) * c * (1 + 3 * 0.044715 * x * x)
        );
      },
      note: "Smooth and used in many Transformers; it is not exactly zero for negative inputs."
    },
    swish: {
      label: "Swish",
      formula: "$\\operatorname{Swish}(x)=x\\,\\sigma(x)$",
      f: function (x) { return x * sigmoid(x); },
      df: function (x) {
        const s = sigmoid(x);
        return s + x * s * (1 - s);
      },
      note: "Smooth, non-monotonic, and closely related to GELU."
    }
  };

  function activationLab(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Activation and derivative lab</h3>' +
      '<p class="widget-subtitle">Compare the function with its slope. A flat curve means a small gradient.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="act-select">Activation</label>' +
      '<select id="act-select" data-act>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="plot-legend">' +
      '<span class="legend-item"><span class="legend-swatch" style="background:#2563eb"></span>activation f(x)</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:#d97706"></span>derivative f′(x)</span>' +
      "</div>" +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">f(0)</span><span class="info-card-value" data-f0>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f′(0)</span><span class="info-card-value" data-df0>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Behaviour</span><span class="info-card-value" data-behaviour>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-formula aria-live="polite"></div>' +
      '<p class="widget-note" data-note></p>' +
      "</div>";

    const select = container.querySelector("[data-act]");
    const f0Out = container.querySelector("[data-f0]");
    const df0Out = container.querySelector("[data-df0]");
    const behaviourOut = container.querySelector("[data-behaviour]");
    const formulaOut = container.querySelector("[data-formula]");
    const noteOut = container.querySelector("[data-note]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 300,
      xMin: -4,
      xMax: 4,
      label: "Activation function and its derivative"
    });

    let preset = PRESETS.sigmoid;

    function fmt(value) {
      if (!Number.isFinite(value)) return "undefined";
      return Number(value.toFixed(3)).toString();
    }

    function update() {
      f0Out.textContent = fmt(preset.f(0));
      df0Out.textContent = fmt(preset.df(0));
      behaviourOut.textContent =
        preset.df(-3) < 0.05 && preset.df(3) < 0.05 ? "Saturating" : "Non-saturating";
      formulaOut.innerHTML = preset.formula;
      noteOut.textContent = preset.note;

      plot.setRanges({ xMin: -4, xMax: 4 });
      plot.autoYRanges([preset.f, preset.df], 0.18);
      plot.setRenderer(function (p) {
        p.drawFunction(preset.f, { color: "#2563eb", width: 2.4 });
        p.drawFunction(preset.df, { color: "#d97706", width: 1.9, dash: [6, 4] });
      });

      MS.math.render(container);
    }

    select.addEventListener("change", function () {
      preset = PRESETS[select.value];
      update();
    });

    update();

    MS.registerCleanup(function () {
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.activationLab = activationLab;
})();
