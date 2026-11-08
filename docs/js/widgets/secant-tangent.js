/* Chapter 2: secant line approaching the tangent line. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const f = function (x) { return x * x; };
  const df = function (x) { return 2 * x; };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function secantTangent(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">From secant to tangent</h3>' +
      '<p class="widget-subtitle">The difference quotient is the slope of a secant line. As h shrinks, it approaches the derivative.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="st-x0">Point x₀ <output data-x0-out></output></label>' +
      '<input id="st-x0" type="range" data-x0 min="-3" max="3" step="0.01" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="st-h">Step h <output data-h-out></output></label>' +
      '<input id="st-h" type="range" data-h min="0.01" max="2" step="0.01" value="1.5">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">f(x₀)</span><span class="info-card-value" data-fx>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f(x₀+h)</span><span class="info-card-value" data-fxh>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Secant slope</span><span class="info-card-value" data-secant>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">Tangent slope</span><span class="info-card-value" data-tangent>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-animate>Shrink h toward 0</button>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite">' +
      "For $f(x)=x^2$, the difference quotient simplifies to $2x_0+h$." +
      "</div>" +
      "</div>";

    const xSlider = container.querySelector("[data-x0]");
    const hSlider = container.querySelector("[data-h]");
    const xOut = container.querySelector("[data-x0-out]");
    const hOut = container.querySelector("[data-h-out]");
    const fxOut = container.querySelector("[data-fx]");
    const fxhOut = container.querySelector("[data-fxh]");
    const secantOut = container.querySelector("[data-secant]");
    const tangentOut = container.querySelector("[data-tangent]");
    const animateButton = container.querySelector("[data-animate]");
    const plot = new MS.Plot(container.querySelector("[data-plot]"), {
      height: 310,
      label: "Secant line approaching a tangent line"
    });

    let x0 = 1;
    let h = 1.5;
    let animationFrame = null;

    function update() {
      const y0 = f(x0);
      const x1 = x0 + h;
      const y1 = f(x1);
      const secant = (y1 - y0) / h;
      const tangent = df(x0);

      xOut.textContent = "= " + fmt(x0);
      hOut.textContent = "= " + fmt(h);
      fxOut.textContent = fmt(y0);
      fxhOut.textContent = fmt(y1);
      secantOut.textContent = fmt(secant);
      tangentOut.textContent = fmt(tangent);

      plot.setRanges({ xMin: -4, xMax: 4 });
      plot.autoYRanges([f], 0.18);
      plot.setRenderer(function (p) {
        p.drawFunction(f, { color: "#2563eb", width: 2.4 });

        const pad = 1.3;
        const sx1 = Math.max(-4, Math.min(x0, x1) - pad);
        const sx2 = Math.min(4, Math.max(x0, x1) + pad);
        p.drawSegment(
          sx1,
          y0 + secant * (sx1 - x0),
          sx2,
          y0 + secant * (sx2 - x0),
          { color: "#7c3aed", width: 1.7 }
        );

        p.drawSegment(
          x0 - 1.4,
          y0 - tangent * 1.4,
          x0 + 1.4,
          y0 + tangent * 1.4,
          { color: "#e11d48", width: 1.8, dash: [5, 4] }
        );

        p.drawPoint(x0, y0, { color: "#e11d48", label: "x₀" });
        p.drawPoint(x1, y1, { color: "#7c3aed", label: "x₀+h" });
      });
    }

    xSlider.addEventListener("input", function () {
      x0 = Number(xSlider.value);
      update();
    });

    hSlider.addEventListener("input", function () {
      h = Number(hSlider.value);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      update();
    });

    animateButton.addEventListener("click", function () {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        return;
      }

      const start = Number(hSlider.value);
      const duration = 1200;
      const startedAt = performance.now();

      function frame(now) {
        const t = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        h = start + (0.01 - start) * eased;
        hSlider.value = h;
        update();
        if (t < 1) {
          animationFrame = requestAnimationFrame(frame);
        } else {
          animationFrame = null;
          h = 0.01;
          hSlider.value = h;
          update();
        }
      }

      animationFrame = requestAnimationFrame(frame);
    });

    update();

    MS.registerCleanup(function () {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      plot.destroy();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.secantTangent = secantTangent;
})();
