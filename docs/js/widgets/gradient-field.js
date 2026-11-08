/* Chapter 5: contour heatmap, gradient, and 2D gradient descent. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    bowl: {
      label: "f(x,y) = x² + y²",
      f: function (x, y) { return x * x + y * y; },
      gx: function (x) { return 2 * x; },
      gy: function (y) { return 2 * y; },
      domain: 3
    },
    valley: {
      label: "f(x,y) = 0.5x² + 2y²",
      f: function (x, y) { return 0.5 * x * x + 2 * y * y; },
      gx: function (x) { return x; },
      gy: function (y) { return 4 * y; },
      domain: 3
    },
    saddle: {
      label: "f(x,y) = x² − y²",
      f: function (x, y) { return x * x - y * y; },
      gx: function (x) { return 2 * x; },
      gy: function (y) { return -2 * y; },
      domain: 2.5
    },
    ripple: {
      label: "f(x,y) = sin(x)cos(y)",
      f: function (x, y) { return Math.sin(x) * Math.cos(y); },
      gx: function (x, y) { return Math.cos(x) * Math.cos(y); },
      gy: function (x, y) { return -Math.sin(x) * Math.sin(y); },
      domain: 4
    }
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(3)).toString();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function heatColor(t) {
    // Blue (low) -> pale (middle) -> amber (high).
    const low = [37, 99, 235];
    const mid = [226, 232, 240];
    const high = [217, 119, 6];
    let from;
    let to;
    let u;
    if (t < 0.5) {
      from = low;
      to = mid;
      u = t * 2;
    } else {
      from = mid;
      to = high;
      u = (t - 0.5) * 2;
    }
    return [
      Math.round(lerp(from[0], to[0], u)),
      Math.round(lerp(from[1], to[1], u)),
      Math.round(lerp(from[2], to[2], u))
    ];
  }

  function gradientField(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Gradient field and 2D descent</h3>' +
      '<p class="widget-subtitle">Click the plot to move the point. The arrow is the gradient; descent steps against it.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="gf-fn">Surface</label>' +
      '<select id="gf-fn" data-fn>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control grow"><label for="gf-lr">Learning rate η <output data-lr-out></output></label>' +
      '<input id="gf-lr" type="range" data-lr min="0.01" max="0.5" step="0.01" value="0.12">' +
      "</div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">Point</span><span class="info-card-value" data-point>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">f(x,y)</span><span class="info-card-value" data-fxy>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">∇f</span><span class="info-card-value" data-grad>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">‖∇f‖</span><span class="info-card-value" data-gnorm>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-step>Step</button>' +
      '<button type="button" class="button secondary" data-run>Run</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">The gradient points toward steepest ascent. The update ' +
      "$\\mathbf{p}_{k+1}=\\mathbf{p}_k-\\eta\\nabla f(\\mathbf{p}_k)$" +
      " moves against it.</p>" +
      "</div>";

    const fnSelect = container.querySelector("[data-fn]");
    const lrSlider = container.querySelector("[data-lr]");
    const lrOut = container.querySelector("[data-lr-out]");
    const pointOut = container.querySelector("[data-point]");
    const fxyOut = container.querySelector("[data-fxy]");
    const gradOut = container.querySelector("[data-grad]");
    const gnormOut = container.querySelector("[data-gnorm]");
    const stepButton = container.querySelector("[data-step]");
    const runButton = container.querySelector("[data-run]");
    const resetButton = container.querySelector("[data-reset]");
    const feedback = container.querySelector("[data-feedback]");
    const shell = container.querySelector("[data-plot]");

    const canvas = document.createElement("canvas");
    canvas.className = "plot-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Contour plot with gradient descent trajectory");
    shell.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let preset = PRESETS.bowl;
    let lr = 0.12;
    let px = 2.4;
    let py = 2.1;
    let start = { x: px, y: py };
    let history = [{ x: px, y: py }];
    let timer = null;
    let width = 560;
    let height = 360;

    function domain() {
      return preset.domain;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(280, shell.clientWidth || 560);
      height = Math.max(280, Math.min(380, width * 0.66));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function sx(x) {
      const pad = 38;
      return pad + ((x + domain()) / (2 * domain())) * (width - 2 * pad);
    }

    function sy(y) {
      const pad = 38;
      return height - pad - ((y + domain()) / (2 * domain())) * (height - 2 * pad);
    }

    function wx(pxValue) {
      const pad = 38;
      return ((pxValue - pad) / (width - 2 * pad)) * 2 * domain() - domain();
    }

    function wy(pyValue) {
      const pad = 38;
      return ((height - pad - pyValue) / (height - 2 * pad)) * 2 * domain() - domain();
    }

    function sampleRange() {
      let min = Infinity;
      let max = -Infinity;
      const n = 60;
      for (let i = 0; i <= n; i += 1) {
        for (let j = 0; j <= n; j += 1) {
          const x = -domain() + (2 * domain() * i) / n;
          const y = -domain() + (2 * domain() * j) / n;
          const value = preset.f(x, y);
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }
      return { min, max };
    }

    function drawHeatmap(range) {
      const block = 4;
      const span = Math.max(1e-9, range.max - range.min);
      for (let y = 0; y < height; y += block) {
        for (let x = 0; x < width; x += block) {
          if (x < 36 || x > width - 36 || y < 36 || y > height - 36) continue;
          const wxValue = wx(x + block / 2);
          const wyValue = wy(y + block / 2);
          const value = preset.f(wxValue, wyValue);
          const t = Math.max(0, Math.min(1, (value - range.min) / span));
          const color = heatColor(t);
          ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.55)";
          ctx.fillRect(x, y, block, block);
        }
      }
    }

    function drawContours(range) {
      const n = 92;
      const levels = [];
      for (let k = 1; k <= 7; k += 1) {
        levels.push(range.min + ((range.max - range.min) * k) / 8);
      }

      const grid = [];
      for (let j = 0; j <= n; j += 1) {
        const row = [];
        for (let i = 0; i <= n; i += 1) {
          const x = -domain() + (2 * domain() * i) / n;
          const y = -domain() + (2 * domain() * j) / n;
          row.push(preset.f(x, y));
        }
        grid.push(row);
      }

      ctx.save();
      ctx.strokeStyle = "rgba(30,40,50,0.35)";
      ctx.lineWidth = 1;

      levels.forEach(function (level) {
        for (let j = 0; j < n; j += 1) {
          for (let i = 0; i < n; i += 1) {
            const x0 = -domain() + (2 * domain() * i) / n;
            const x1 = -domain() + (2 * domain() * (i + 1)) / n;
            const y0 = -domain() + (2 * domain() * j) / n;
            const y1 = -domain() + (2 * domain() * (j + 1)) / n;

            const corners = [
              { x: x0, y: y0, v: grid[j][i] },
              { x: x1, y: y0, v: grid[j][i + 1] },
              { x: x1, y: y1, v: grid[j + 1][i + 1] },
              { x: x0, y: y1, v: grid[j + 1][i] }
            ];

            const points = [];
            for (let edge = 0; edge < 4; edge += 1) {
              const a = corners[edge];
              const b = corners[(edge + 1) % 4];
              if ((a.v < level && b.v >= level) || (a.v >= level && b.v < level)) {
                const t = (level - a.v) / (b.v - a.v);
                points.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
              }
            }

            if (points.length >= 2) {
              ctx.beginPath();
              ctx.moveTo(sx(points[0].x), sy(points[0].y));
              ctx.lineTo(sx(points[1].x), sy(points[1].y));
              ctx.stroke();
              if (points.length === 4) {
                ctx.beginPath();
                ctx.moveTo(sx(points[2].x), sy(points[2].y));
                ctx.lineTo(sx(points[3].x), sy(points[3].y));
                ctx.stroke();
              }
            }
          }
        }
      });

      ctx.restore();
    }

    function drawAxes() {
      const pad = 38;
      ctx.save();
      ctx.strokeStyle = "rgba(70,80,90,0.45)";
      ctx.lineWidth = 1;
      if (-domain() <= 0 && domain() >= 0) {
        ctx.beginPath();
        ctx.moveTo(sx(0), pad);
        ctx.lineTo(sx(0), height - pad);
        ctx.moveTo(pad, sy(0));
        ctx.lineTo(width - pad, sy(0));
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(110,120,130,0.9)";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("x", width - pad + 14, sy(0) + 4);
      ctx.fillText("y", sx(0) + 4, pad - 12);
      ctx.restore();
    }

    function drawGradient() {
      const gx = preset.gx(px, py);
      const gy = preset.gy(px, py);
      const norm = Math.hypot(gx, gy);
      if (!Number.isFinite(norm) || norm < 1e-9) return;

      const scale = Math.min(52, 14 + norm * 8) / norm;
      const x0 = sx(px);
      const y0 = sy(py);
      const x1 = sx(px + gx * scale);
      const y1 = sy(py + gy * scale);

      ctx.save();
      ctx.strokeStyle = "#7c3aed";
      ctx.fillStyle = "#7c3aed";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      const angle = Math.atan2(y1 - y0, x1 - x0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - 10 * Math.cos(angle - 0.45), y1 - 10 * Math.sin(angle - 0.45));
      ctx.lineTo(x1 - 10 * Math.cos(angle + 0.45), y1 - 10 * Math.sin(angle + 0.45));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPath() {
      if (history.length < 2) return;
      ctx.save();
      ctx.strokeStyle = "rgba(225,29,72,0.75)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      history.forEach(function (point, index) {
        const x = sx(point.x);
        const y = sy(point.y);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    }

    function drawPoint() {
      ctx.save();
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(sx(px), sy(py), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const range = sampleRange();
      drawHeatmap(range);
      drawContours(range);
      drawAxes();
      drawPath();
      drawGradient();
      drawPoint();
    }

    function updateInfo() {
      const gx = preset.gx(px, py);
      const gy = preset.gy(px, py);
      const value = preset.f(px, py);
      const norm = Math.hypot(gx, gy);

      lrOut.textContent = "= " + fmt(lr);
      pointOut.textContent = "(" + fmt(px) + ", " + fmt(py) + ")";
      fxyOut.textContent = fmt(value);
      gradOut.textContent = "(" + fmt(gx) + ", " + fmt(gy) + ")";
      gnormOut.textContent = fmt(norm);
    }

    function update() {
      updateInfo();
      draw();
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
      px = start.x;
      py = start.y;
      history = [{ x: px, y: py }];
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    }

    function step() {
      const gx = preset.gx(px, py);
      const gy = preset.gy(px, py);
      const nx = px - lr * gx;
      const ny = py - lr * gy;

      if (!Number.isFinite(nx) || !Number.isFinite(ny) || Math.abs(nx) > 50 || Math.abs(ny) > 50) {
        stopTimer();
        feedback.className = "feedback bad";
        feedback.textContent = "Diverged. Reduce the learning rate or choose another starting point.";
        return;
      }

      px = nx;
      py = ny;
      history.push({ x: px, y: py });
      if (history.length > 120) history.shift();

      const norm = Math.hypot(preset.gx(px, py), preset.gy(px, py));
      if (norm < 1e-3) {
        stopTimer();
        feedback.className = "feedback ok";
        feedback.textContent = "Converged: the gradient is almost zero at this point.";
      }

      update();
    }

    function setPointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      const x = wx(event.clientX - rect.left);
      const y = wy(event.clientY - rect.top);
      if (Math.abs(x) > domain() || Math.abs(y) > domain()) return;
      px = x;
      py = y;
      start = { x: px, y: py };
      history = [{ x: px, y: py }];
      stopTimer();
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    }

    canvas.addEventListener("click", setPointFromEvent);

    fnSelect.addEventListener("change", function () {
      preset = PRESETS[fnSelect.value];
      px = domain() * 0.75;
      py = domain() * 0.65;
      start = { x: px, y: py };
      history = [{ x: px, y: py }];
      stopTimer();
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    });

    lrSlider.addEventListener("input", function () {
      lr = Number(lrSlider.value);
      lrOut.textContent = "= " + fmt(lr);
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
      if (Math.hypot(preset.gx(px, py), preset.gy(px, py)) < 1e-3) {
        feedback.className = "feedback info";
        feedback.textContent = "Already at a stationary point. Click elsewhere on the plot.";
        return;
      }
      runButton.textContent = "Pause";
      timer = window.setInterval(step, 280);
    });

    resetButton.addEventListener("click", reset);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    resize();

    update();

    MS.registerCleanup(function () {
      stopTimer();
      resizeObserver.disconnect();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.gradientField = gradientField;
})();
