/* Chapter 10: compare SGD, momentum, and Adam on the same 1D loss. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    quadratic: {
      label: "f(x) = x²",
      f: function (x) { return x * x; },
      df: function (x) { return 2 * x; },
      xMin: -5,
      xMax: 5,
      start: 4
    },
    shifted: {
      label: "f(x) = (x−1)² + 0.5",
      f: function (x) { return (x - 1) * (x - 1) + 0.5; },
      df: function (x) { return 2 * (x - 1); },
      xMin: -4,
      xMax: 6,
      start: 5
    },
    quartic: {
      label: "f(x) = x⁴ − 3x²",
      f: function (x) { return x * x * x * x - 3 * x * x; },
      df: function (x) { return 4 * x * x * x - 6 * x; },
      xMin: -3,
      xMax: 3,
      start: 2.4
    }
  };

  const COLORS = {
    sgd: "#2563eb",
    momentum: "#7c3aed",
    adam: "#d97706"
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function optimizerRace(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Optimizer race</h3>' +
      '<p class="widget-subtitle">SGD, momentum, and Adam start from the same point and use the same learning rate.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="opt-fn">Loss function</label>' +
      '<select id="opt-fn" data-fn>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control grow"><label for="opt-lr">Learning rate η <output data-lr-out></output></label>' +
      '<input id="opt-lr" type="range" data-lr min="0.01" max="0.5" step="0.01" value="0.1">' +
      "</div>" +
      '<div class="control grow"><label for="opt-start">Starting point x₀ <output data-start-out></output></label>' +
      '<input id="opt-start" type="range" data-start min="-5" max="5" step="0.01" value="4">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="plot-legend">' +
      '<span class="legend-item"><span class="legend-swatch" style="background:#2563eb"></span>SGD</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:#7c3aed"></span>Momentum</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:#d97706"></span>Adam</span>' +
      "</div>" +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">SGD x</span><span class="info-card-value" data-sgd-x>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Momentum x</span><span class="info-card-value" data-mom-x>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Adam x</span><span class="info-card-value" data-adam-x>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">iteration</span><span class="info-card-value" data-iter>0</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-step>Step</button>' +
      '<button type="button" class="button secondary" data-run>Run</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Momentum accumulates past gradients; Adam rescales each step using running estimates of the first and second moments.</p>' +
      "</div>";

    const fnSelect = container.querySelector("[data-fn]");
    const lrInput = container.querySelector("[data-lr]");
    const startInput = container.querySelector("[data-start]");
    const lrOut = container.querySelector("[data-lr-out]");
    const startOut = container.querySelector("[data-start-out]");
    const sgdX = container.querySelector("[data-sgd-x]");
    const momX = container.querySelector("[data-mom-x]");
    const adamX = container.querySelector("[data-adam-x]");
    const iterOut = container.querySelector("[data-iter]");
    const feedback = container.querySelector("[data-feedback]");
    const stepButton = container.querySelector("[data-step]");
    const runButton = container.querySelector("[data-run]");
    const resetButton = container.querySelector("[data-reset]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 320,
      label: "Optimizer trajectories on a one-dimensional loss"
    });

    let preset = PRESETS.quadratic;
    let lr = 0.1;
    let start = preset.start;
    let iteration = 0;
    let timer = null;
    let state = null;

    function initialState() {
      return {
        sgd: { x: start },
        momentum: { x: start, v: 0 },
        adam: { x: start, m: 0, v: 0, t: 0 },
        history: {
          sgd: [start],
          momentum: [start],
          adam: [start]
        }
      };
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
        runButton.textContent = "Run";
      }
    }

    function reset() {
      stopTimer();
      iteration = 0;
      state = initialState();
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    }

    function step() {
      const g = preset.df;

      // SGD
      state.sgd.x -= lr * g(state.sgd.x);

      // Momentum
      const gradM = g(state.momentum.x);
      state.momentum.v = 0.9 * state.momentum.v + gradM;
      state.momentum.x -= lr * state.momentum.v;

      // Adam
      const gradA = g(state.adam.x);
      state.adam.t += 1;
      state.adam.m = 0.9 * state.adam.m + 0.1 * gradA;
      state.adam.v = 0.999 * state.adam.v + 0.001 * gradA * gradA;
      const mHat = state.adam.m / (1 - Math.pow(0.9, state.adam.t));
      const vHat = state.adam.v / (1 - Math.pow(0.999, state.adam.t));
      state.adam.x -= lr * mHat / (Math.sqrt(vHat) + 1e-8);

      iteration += 1;
      ["sgd", "momentum", "adam"].forEach(function (key) {
        const value = state[key].x;
        if (Number.isFinite(value) && Math.abs(value) < 50) {
          state.history[key].push(value);
          if (state.history[key].length > 100) state.history[key].shift();
        }
      });

      update();
    }

    function update() {
      lrOut.textContent = "= " + fmt(lr);
      startOut.textContent = "= " + fmt(start);
      iterOut.textContent = String(iteration);
      sgdX.textContent = fmt(state.sgd.x);
      momX.textContent = fmt(state.momentum.x);
      adamX.textContent = fmt(state.adam.x);

      plot.setRanges({ xMin: preset.xMin, xMax: preset.xMax });
      plot.autoYRanges([preset.f], 0.2);
      plot.setRenderer(function (p) {
        p.drawFunction(preset.f, { color: "#94a3b8", width: 2.2 });

        ["sgd", "momentum", "adam"].forEach(function (key) {
          const points = state.history[key];
          for (let i = 1; i < points.length; i += 1) {
            p.drawSegment(
              points[i - 1],
              preset.f(points[i - 1]),
              points[i],
              preset.f(points[i]),
              { color: COLORS[key], width: 1.2 }
            );
          }
          p.drawPoint(state[key].x, preset.f(state[key].x), {
            color: COLORS[key],
            radius: 4.5,
            ring: false
          });
        });
      });
    }

    function selectedPreset() {
      preset = PRESETS[fnSelect.value];
      startInput.min = preset.xMin;
      startInput.max = preset.xMax;
      startInput.step = (preset.xMax - preset.xMin) / 400;
      start = preset.start;
      startInput.value = start;
      reset();
    }

    fnSelect.addEventListener("change", selectedPreset);

    lrInput.addEventListener("input", function () {
      lr = Number(lrInput.value);
      lrOut.textContent = "= " + fmt(lr);
    });

    startInput.addEventListener("input", function () {
      start = Number(startInput.value);
      reset();
    });

    stepButton.addEventListener("click", function () {
      stopTimer();
      step();
    });

    runButton.addEventListener("click", function () {
      if (timer) {
        stopTimer();
        return;
      }
      runButton.textContent = "Pause";
      timer = window.setInterval(function () {
        step();
        if (iteration >= 80) {
          stopTimer();
          feedback.className = "feedback info";
          feedback.textContent = "Stopped after 80 iterations to keep the lab readable.";
        }
      }, 260);
    });

    resetButton.addEventListener("click", reset);
    selectedPreset();

    MS.registerCleanup(function () {
      stopTimer();
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.optimizerRace = optimizerRace;
})();
