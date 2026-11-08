/* Chapter 4: one-dimensional gradient descent lab. */
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
    doubleWell: {
      label: "f(x) = x⁴ − 3x²",
      f: function (x) { return x * x * x * x - 3 * x * x; },
      df: function (x) { return 4 * x * x * x - 6 * x; },
      xMin: -2.6,
      xMax: 2.6,
      start: 2.3
    },
    wiggle: {
      label: "f(x) = sin(x) + 0.1x²",
      f: function (x) { return Math.sin(x) + 0.1 * x * x; },
      df: function (x) { return Math.cos(x) + 0.2 * x; },
      xMin: -6,
      xMax: 6,
      start: 4.5
    }
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function gradientDescent(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Gradient descent lab</h3>' +
      '<p class="widget-subtitle">Pick a function, a starting point, and a learning rate. Then watch the updates.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="gd-fn">Function</label>' +
      '<select id="gd-fn" data-fn>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control grow"><label for="gd-lr">Learning rate η <output data-lr-out></output></label>' +
      '<input id="gd-lr" type="range" data-lr min="0.01" max="1" step="0.01" value="0.1">' +
      "</div>" +
      '<div class="control grow"><label for="gd-start">Starting point x₀ <output data-start-out></output></label>' +
      '<input id="gd-start" type="range" data-start min="-5" max="5" step="0.01" value="4">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">Iteration</span><span class="info-card-value" data-iter>0</span></div>' +
      '<div class="info-card"><span class="info-card-label">x</span><span class="info-card-value" data-x>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f(x)</span><span class="info-card-value" data-fx>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f′(x)</span><span class="info-card-value" data-dfx>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-step>Step</button>' +
      '<button type="button" class="button secondary" data-run>Run</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Update rule: $x_{k+1}=x_k-\\eta f\'(x_k)$. A large η can overshoot; a small η can crawl.</p>' +
      "</div>";

    const fnSelect = container.querySelector("[data-fn]");
    const lrSlider = container.querySelector("[data-lr]");
    const startSlider = container.querySelector("[data-start]");
    const lrOut = container.querySelector("[data-lr-out]");
    const startOut = container.querySelector("[data-start-out]");
    const iterOut = container.querySelector("[data-iter]");
    const xOut = container.querySelector("[data-x]");
    const fxOut = container.querySelector("[data-fx]");
    const dfxOut = container.querySelector("[data-dfx]");
    const stepButton = container.querySelector("[data-step]");
    const runButton = container.querySelector("[data-run]");
    const resetButton = container.querySelector("[data-reset]");
    const feedback = container.querySelector("[data-feedback]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 320,
      label: "Gradient descent trajectory on a one-dimensional function"
    });

    let preset = PRESETS.quadratic;
    let lr = 0.1;
    let start = preset.start;
    let x = start;
    let iteration = 0;
    let history = [start];
    let timer = null;

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
        runButton.textContent = "Run";
      }
    }

    function reset() {
      stopTimer();
      x = start;
      iteration = 0;
      history = [start];
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    }

    function step() {
      const grad = preset.df(x);
      const next = x - lr * grad;

      if (!Number.isFinite(next) || Math.abs(next) > 100) {
        stopTimer();
        feedback.className = "feedback bad";
        feedback.textContent =
          "Diverged. The learning rate is too large for this function. Try a smaller η.";
        return;
      }

      x = next;
      iteration += 1;
      history.push(x);

      if (history.length > 80) {
        history = history.slice(-80);
      }

      if (Math.abs(grad) < 1e-4) {
        stopTimer();
        feedback.className = "feedback ok";
        feedback.textContent =
          "Converged: the gradient is almost zero, so this is a stationary point.";
      }

      update();
    }

    function update() {
      const grad = preset.df(x);
      lrOut.textContent = "= " + fmt(lr);
      startOut.textContent = "= " + fmt(start);
      iterOut.textContent = String(iteration);
      xOut.textContent = fmt(x);
      fxOut.textContent = fmt(preset.f(x));
      dfxOut.textContent = fmt(grad);

      plot.setRanges({ xMin: preset.xMin, xMax: preset.xMax });
      plot.autoYRanges([preset.f], 0.2);
      plot.setRenderer(function (p) {
        p.drawFunction(preset.f, { color: "#2563eb", width: 2.4 });

        for (let i = 1; i < history.length; i += 1) {
          const x1 = history[i - 1];
          const x2 = history[i];
          p.drawSegment(
            x1,
            preset.f(x1),
            x2,
            preset.f(x2),
            { color: "rgba(124,58,237,0.55)", width: 1.4 }
          );
        }

        history.forEach(function (point, index) {
          p.drawPoint(point, preset.f(point), {
            color: index === history.length - 1 ? "#e11d48" : "#7c3aed",
            radius: index === history.length - 1 ? 5.5 : 2.6,
            ring: index === history.length - 1
          });
        });
      });
    }

    function selectedPreset() {
      preset = PRESETS[fnSelect.value];
      startSlider.min = preset.xMin;
      startSlider.max = preset.xMax;
      startSlider.step = (preset.xMax - preset.xMin) / 400;
      start = preset.start;
      startSlider.value = start;
      reset();
    }

    fnSelect.addEventListener("change", selectedPreset);

    lrSlider.addEventListener("input", function () {
      lr = Number(lrSlider.value);
      lrOut.textContent = "= " + fmt(lr);
      feedback.className = "feedback";
      feedback.textContent = "";
    });

    startSlider.addEventListener("input", function () {
      start = Number(startSlider.value);
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

      if (Math.abs(preset.df(x)) < 1e-4) {
        feedback.className = "feedback info";
        feedback.textContent = "Already at a stationary point. Reset or change the starting point.";
        return;
      }

      feedback.className = "feedback";
      feedback.textContent = "";
      runButton.textContent = "Pause";
      timer = window.setInterval(function () {
        step();
        if (iteration >= 100) {
          stopTimer();
        }
      }, 320);
    });

    resetButton.addEventListener("click", reset);

    selectedPreset();

    MS.registerCleanup(function () {
      stopTimer();
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.gradientDescent = gradientDescent;
})();
