/* Chapter 8: fit a 1D target with a one-hidden-layer MLP. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const TARGETS = {
    step: {
      label: "Step: sign(x)",
      f: function (x) { return x >= 0 ? 1 : -1; }
    },
    sine: {
      label: "Sine: sin(1.6x)",
      f: function (x) { return Math.sin(1.6 * x); }
    },
    abs: {
      label: "Absolute value: |x| − 0.7",
      f: function (x) { return Math.abs(x) - 0.7; }
    }
  };

  function makeRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function mlpFit(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Universal approximation playground</h3>' +
      '<p class="widget-subtitle">A single hidden layer can bend. Train it on a target a straight line cannot fit.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="mlp-target">Target</label>' +
      '<select id="mlp-target" data-target>' +
      Object.keys(TARGETS).map(function (key) {
        return '<option value="' + key + '">' + TARGETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control"><label for="mlp-hidden">Hidden units</label>' +
      '<select id="mlp-hidden" data-hidden>' +
      '<option value="4">4</option>' +
      '<option value="8" selected>8</option>' +
      '<option value="16">16</option>' +
      "</select></div>" +
      '<div class="control"><label for="mlp-act">Activation</label>' +
      '<select id="mlp-act" data-act>' +
      '<option value="tanh">tanh</option>' +
      '<option value="relu">ReLU</option>' +
      "</select></div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">epoch</span><span class="info-card-value" data-epoch>0</span></div>' +
      '<div class="info-card"><span class="info-card-label">train MSE</span><span class="info-card-value" data-loss>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">hidden units</span><span class="info-card-value" data-hidden-out>8</span></div>' +
      '<div class="info-card"><span class="info-card-label">parameters</span><span class="info-card-value" data-params>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-train>Train</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">The hidden units compute $\\phi(w_jx+b_j)$; the output layer combines them linearly. Nonlinearity in the middle is what creates the bend.</p>' +
      "</div>";

    const targetSelect = container.querySelector("[data-target]");
    const hiddenSelect = container.querySelector("[data-hidden]");
    const actSelect = container.querySelector("[data-act]");
    const epochOut = container.querySelector("[data-epoch]");
    const lossOut = container.querySelector("[data-loss]");
    const hiddenOut = container.querySelector("[data-hidden-out]");
    const paramsOut = container.querySelector("[data-params]");
    const feedback = container.querySelector("[data-feedback]");
    const trainButton = container.querySelector("[data-train]");
    const resetButton = container.querySelector("[data-reset]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 320,
      xMin: -3.1,
      xMax: 3.1,
      yMin: -1.7,
      yMax: 1.7,
      label: "Target function and MLP approximation"
    });

    const xs = [];
    for (let i = 0; i < 60; i += 1) {
      xs.push(-3 + (6 * i) / 59);
    }

    let target = TARGETS.step;
    let hidden = 8;
    let activation = "tanh";
    let model = { w: [], b: [], v: [], c: 0 };
    let epochs = 0;
    let running = false;
    let frame = null;

    function act(value) {
      return activation === "relu" ? Math.max(0, value) : Math.tanh(value);
    }

    function actDerivative(value) {
      if (activation === "relu") {
        return value > 0 ? 1 : 0;
      }
      const t = Math.tanh(value);
      return 1 - t * t;
    }

    function initModel() {
      const rng = makeRandom(42 + hidden * 7 + (activation === "relu" ? 3 : 11));
      model = {
        w: [],
        b: [],
        v: [],
        c: (rng() - 0.5) * 0.1
      };
      for (let j = 0; j < hidden; j += 1) {
        model.w.push((rng() - 0.5) * 2.2);
        model.b.push((rng() - 0.5) * 1.2);
        model.v.push((rng() - 0.5) * 1.4);
      }
      epochs = 0;
    }

    function forward(x) {
      const pre = [];
      const h = [];
      for (let j = 0; j < hidden; j += 1) {
        const value = model.w[j] * x + model.b[j];
        pre.push(value);
        h.push(act(value));
      }
      let y = model.c;
      for (let j = 0; j < hidden; j += 1) {
        y += model.v[j] * h[j];
      }
      return { pre: pre, h: h, y: y };
    }

    function loss() {
      let total = 0;
      xs.forEach(function (x) {
        const y = target.f(x);
        const prediction = forward(x).y;
        total += (prediction - y) * (prediction - y);
      });
      return total / xs.length;
    }

    function trainStep() {
      const n = xs.length;
      const dw = new Array(hidden).fill(0);
      const db = new Array(hidden).fill(0);
      const dv = new Array(hidden).fill(0);
      let dc = 0;

      xs.forEach(function (x) {
        const y = target.f(x);
        const out = forward(x);
        const dY = (2 * (out.y - y)) / n;
        dc += dY;
        for (let j = 0; j < hidden; j += 1) {
          dv[j] += dY * out.h[j];
          const dPre = dY * model.v[j] * actDerivative(out.pre[j]);
          dw[j] += dPre * x;
          db[j] += dPre;
        }
      });

      const lr = 0.08;
      model.c -= lr * dc;
      for (let j = 0; j < hidden; j += 1) {
        model.w[j] -= lr * dw[j];
        model.b[j] -= lr * db[j];
        model.v[j] -= lr * dv[j];
      }
      epochs += 1;
    }

    function paint() {
      const currentLoss = loss();
      epochOut.textContent = String(epochs);
      lossOut.textContent = fmt(currentLoss);
      hiddenOut.textContent = String(hidden);
      paramsOut.textContent = String(hidden * 3 + 1);

      plot.setRenderer(function (p) {
        p.drawFunction(target.f, { color: "#94a3b8", width: 2, dash: [5, 4] });
        p.drawFunction(function (x) { return forward(x).y; }, { color: "#2563eb", width: 2.6 });
        xs.forEach(function (x) {
          p.drawPoint(x, target.f(x), { color: "#94a3b8", radius: 1.8, ring: false });
        });
      });
    }

    function reset() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      running = false;
      trainButton.textContent = "Train";
      initModel();
      feedback.className = "feedback";
      feedback.textContent = "";
      paint();
    }

    function run() {
      if (running) {
        running = false;
        if (frame) cancelAnimationFrame(frame);
        frame = null;
        trainButton.textContent = "Train";
        return;
      }

      running = true;
      trainButton.textContent = "Pause";

      function loop() {
        if (!running) return;
        for (let i = 0; i < 18; i += 1) {
          trainStep();
        }
        paint();

        if (epochs >= 900) {
          running = false;
          trainButton.textContent = "Train";
          feedback.className = "feedback ok";
          feedback.textContent =
            "Training stopped at " + epochs + " epochs. A linear model would remain a straight line; the hidden layer creates curvature.";
          return;
        }

        if (epochs % 90 === 0) {
          feedback.className = "feedback info";
          feedback.textContent = "Epoch " + epochs + " — MSE " + fmt(loss()) + ".";
        }

        frame = requestAnimationFrame(loop);
      }

      loop();
    }

    targetSelect.addEventListener("change", function () {
      target = TARGETS[targetSelect.value];
      reset();
    });

    hiddenSelect.addEventListener("change", function () {
      hidden = Number(hiddenSelect.value);
      reset();
    });

    actSelect.addEventListener("change", function () {
      activation = actSelect.value;
      reset();
    });

    trainButton.addEventListener("click", run);
    resetButton.addEventListener("click", reset);

    initModel();
    paint();

    MS.registerCleanup(function () {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.mlpFit = mlpFit;
})();
