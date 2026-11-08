/* Chapter 11: recurrent gradient flow and vanishing/exploding products. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
      return value.toExponential(3);
    }
    return Number(value.toFixed(4)).toString();
  }

  function rnnFlow(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Recurrent gradient flow</h3>' +
      '<p class="widget-subtitle">For the linear recurrence $h_t=w h_{t-1}+x_t$, the gradient $\\partial h_T/\\partial h_1$ is $w^{T-1}$.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="rnn-w">Recurrent weight w <output data-w-out></output></label>' +
      '<input id="rnn-w" type="range" data-w min="0.1" max="1.8" step="0.01" value="0.5">' +
      "</div>" +
      '<div class="control grow"><label for="rnn-t">Sequence length T <output data-t-out></output></label>' +
      '<input id="rnn-t" type="range" data-t min="1" max="30" step="1" value="10">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">gradient</span><span class="info-card-value" data-grad>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">log₁₀ |gradient|</span><span class="info-card-value" data-log>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">behaviour</span><span class="info-card-value" data-behaviour>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">hidden state h_T</span><span class="info-card-value" data-hidden>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">The plot shows $\\log_{10}|w|^{k-1}$ versus the number of steps $k$. A line with negative slope is vanishing; a line with positive slope is exploding.</p>' +
      "</div>";

    const wInput = container.querySelector("[data-w]");
    const tInput = container.querySelector("[data-t]");
    const wOut = container.querySelector("[data-w-out]");
    const tOut = container.querySelector("[data-t-out]");
    const gradOut = container.querySelector("[data-grad]");
    const logOut = container.querySelector("[data-log]");
    const behaviourOut = container.querySelector("[data-behaviour]");
    const hiddenOut = container.querySelector("[data-hidden]");
    const feedback = container.querySelector("[data-feedback]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 310,
      xMin: 0,
      xMax: 30,
      yMin: -15,
      yMax: 15,
      label: "Log gradient magnitude versus recurrent steps"
    });

    let w = 0.5;
    let steps = 10;

    function update() {
      const logw = Math.log10(w);
      const gradient = Math.pow(w, steps - 1);
      const logGradient = (steps - 1) * logw;
      const hidden = steps === 1 ? 1 : Math.pow(w, steps - 1);

      wOut.textContent = "= " + fmt(w);
      tOut.textContent = "= " + steps;
      gradOut.textContent = fmt(gradient);
      logOut.textContent = fmt(logGradient);
      hiddenOut.textContent = fmt(hidden);

      const behaviour = w < 1 ? "Vanishing" : w > 1 ? "Exploding" : "Neutral";
      behaviourOut.textContent = behaviour;

      if (w < 1) {
        feedback.className = "feedback info";
        feedback.textContent =
          "w < 1: each backward step multiplies the gradient by a factor smaller than one. After many steps the signal vanishes.";
      } else if (w > 1) {
        feedback.className = "feedback warn";
        feedback.textContent =
          "w > 1: each backward step multiplies the gradient by a factor greater than one. After many steps the signal explodes.";
      } else {
        feedback.className = "feedback ok";
        feedback.textContent =
          "w = 1: the gradient is preserved in this linear toy model, but nonlinear recurrent networks still suffer from unstable products.";
      }

      plot.setRenderer(function (p) {
        p.drawSegment(0, 0, 30, 0, { color: "rgba(120,130,140,0.55)", width: 1.2, dash: [5, 4] });
        p.drawFunction(function (k) { return (k - 1) * logw; }, {
          color: w < 1 ? "#2563eb" : w > 1 ? "#d97706" : "#16794a",
          width: 2.4
        });
        p.drawPoint(steps, logGradient, {
          color: "#e11d48",
          label: "T=" + steps
        });
      });
    }

    wInput.addEventListener("input", function () {
      w = Number(wInput.value);
      update();
    });

    tInput.addEventListener("input", function () {
      steps = Number(tInput.value);
      update();
    });

    update();

    MS.registerCleanup(function () {
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.rnnFlow = rnnFlow;
})();
