/* Chapter 6: matrix transformation and geometry lab. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    identity: { label: "Identity", a: 1, b: 0, c: 0, d: 1 },
    rotation: { label: "Rotate 90°", a: 0, b: -1, c: 1, d: 0 },
    scale: { label: "Scale (2, 0.5)", a: 2, b: 0, c: 0, d: 0.5 },
    shear: { label: "Horizontal shear", a: 1, b: 1, c: 0, d: 1 },
    reflection: { label: "Reflect over x-axis", a: 1, b: 0, c: 0, d: -1 },
    singular: { label: "Singular (det = 0)", a: 1, b: 2, c: 2, d: 4 }
  };

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(3)).toString();
  }

  function matrixLab(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Matrix as a linear map</h3>' +
      '<p class="widget-subtitle">Edit the matrix and the vector. The grid shows how the whole plane is transformed.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control"><label for="mat-preset">Preset</label>' +
      '<select id="mat-preset" data-preset>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control"><label>Matrix A</label>' +
      '<div class="matrix-wrap"><span class="matrix-bracket">[</span>' +
      '<div class="matrix-grid">' +
      '<input type="number" step="0.1" data-matrix="a" aria-label="a">' +
      '<input type="number" step="0.1" data-matrix="b" aria-label="b">' +
      '<input type="number" step="0.1" data-matrix="c" aria-label="c">' +
      '<input type="number" step="0.1" data-matrix="d" aria-label="d">' +
      "</div><span class=\"matrix-bracket\">]</span></div></div>" +
      '<div class="control"><label>Vector v</label>' +
      '<div class="matrix-vector">' +
      '<input type="number" step="0.1" data-vector="x" aria-label="Vector x">' +
      '<input type="number" step="0.1" data-vector="y" aria-label="Vector y">' +
      "</div></div></div>" +
      '<div class="plot-shell" data-plot></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">det(A)</span><span class="info-card-value" data-det>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">trace(A)</span><span class="info-card-value" data-trace>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">eigenvalues</span><span class="info-card-value" data-eigen>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">A·v</span><span class="info-card-value" data-av>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-note>Drag the number inputs. A singular matrix collapses the plane onto a line.</div>' +
      '<p class="widget-note">A dense layer computes $W\\mathbf{x}+\\mathbf{b}$: the matrix transforms the input, and the bias shifts it.</p>' +
      "</div>";

    const presetSelect = container.querySelector("[data-preset]");
    const matrixInputs = {
      a: container.querySelector('[data-matrix="a"]'),
      b: container.querySelector('[data-matrix="b"]'),
      c: container.querySelector('[data-matrix="c"]'),
      d: container.querySelector('[data-matrix="d"]')
    };
    const vectorInputs = {
      x: container.querySelector('[data-vector="x"]'),
      y: container.querySelector('[data-vector="y"]')
    };
    const detOut = container.querySelector("[data-det]");
    const traceOut = container.querySelector("[data-trace]");
    const eigenOut = container.querySelector("[data-eigen]");
    const avOut = container.querySelector("[data-av]");
    const noteOut = container.querySelector("[data-note]");
    const shell = container.querySelector("[data-plot]");

    const canvas = document.createElement("canvas");
    canvas.className = "plot-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Linear transformation of the plane");
    shell.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let state = { a: 1, b: 0, c: 0, d: 1, x: 1.4, y: 1.1 };
    let width = 560;
    let height = 360;

    function readInputs() {
      Object.keys(matrixInputs).forEach(function (key) {
        const value = Number(matrixInputs[key].value);
        state[key] = Number.isFinite(value) ? value : 0;
      });
      Object.keys(vectorInputs).forEach(function (key) {
        const value = Number(vectorInputs[key].value);
        state[key] = Number.isFinite(value) ? value : 0;
      });
      update();
    }

    function writeInputs() {
      Object.keys(matrixInputs).forEach(function (key) {
        matrixInputs[key].value = state[key];
      });
      Object.keys(vectorInputs).forEach(function (key) {
        vectorInputs[key].value = state[key];
      });
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(280, shell.clientWidth || 560);
      height = Math.max(280, Math.min(380, width * 0.62));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function range() {
      const corners = [
        [state.a, state.b],
        [state.c, state.d]
      ].reduce(function (acc, row) { return acc.concat(row); }, []);
      const values = [
        state.x, state.y,
        state.a * state.x + state.b * state.y,
        state.c * state.x + state.d * state.y,
        corners[0], corners[1], corners[2], corners[3]
      ];
      const max = Math.max(2, ...values.map(function (v) { return Math.abs(v); }));
      return max * 1.25;
    }

    function scale() {
      return Math.min(width, height) / (2 * range());
    }

    function sx(x) {
      return width / 2 + x * scale();
    }

    function sy(y) {
      return height / 2 - y * scale();
    }

    function line(x1, y1, x2, y2, color, lineWidth, dash) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth || 1;
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      ctx.moveTo(sx(x1), sy(y1));
      ctx.lineTo(sx(x2), sy(y2));
      ctx.stroke();
      ctx.restore();
    }

    function arrow(x, y, color, label) {
      const x0 = sx(0);
      const y0 = sy(0);
      const x1 = sx(x);
      const y1 = sy(y);
      const angle = Math.atan2(y1 - y0, x1 - x0);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - 10 * Math.cos(angle - 0.45), y1 - 10 * Math.sin(angle - 0.45));
      ctx.lineTo(x1 - 10 * Math.cos(angle + 0.45), y1 - 10 * Math.sin(angle + 0.45));
      ctx.closePath();
      ctx.fill();
      if (label) {
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(label, x1 + 8, y1 - 6);
      }
      ctx.restore();
    }

    function draw() {
      const r = range();
      const step = r > 6 ? 2 : 1;
      ctx.clearRect(0, 0, width, height);

      // Original grid.
      for (let k = -Math.ceil(r); k <= Math.ceil(r); k += step) {
        line(-r, k, r, k, "rgba(120,130,140,0.16)", 1);
        line(k, -r, k, r, "rgba(120,130,140,0.16)", 1);
      }

      // Transformed grid.
      for (let k = -Math.ceil(r); k <= Math.ceil(r); k += step) {
        line(
          state.a * -r + state.b * k,
          state.c * -r + state.d * k,
          state.a * r + state.b * k,
          state.c * r + state.d * k,
          "rgba(37,99,235,0.28)",
          1
        );
        line(
          state.a * k + state.b * -r,
          state.c * k + state.d * -r,
          state.a * k + state.b * r,
          state.c * k + state.d * r,
          "rgba(37,99,235,0.28)",
          1
        );
      }

      // Axes.
      line(-r, 0, r, 0, "rgba(70,80,90,0.55)", 1.2);
      line(0, -r, 0, r, "rgba(70,80,90,0.55)", 1.2);

      // Original unit square.
      line(-1, -1, 1, -1, "rgba(120,130,140,0.7)", 1.2, [4, 3]);
      line(1, -1, 1, 1, "rgba(120,130,140,0.7)", 1.2, [4, 3]);
      line(1, 1, -1, 1, "rgba(120,130,140,0.7)", 1.2, [4, 3]);
      line(-1, 1, -1, -1, "rgba(120,130,140,0.7)", 1.2, [4, 3]);

      // Transformed unit square.
      const corners = [
        [state.a * -1 + state.b * -1, state.c * -1 + state.d * -1],
        [state.a * 1 + state.b * -1, state.c * 1 + state.d * -1],
        [state.a * 1 + state.b * 1, state.c * 1 + state.d * 1],
        [state.a * -1 + state.b * 1, state.c * -1 + state.d * 1]
      ];
      ctx.save();
      ctx.beginPath();
      corners.forEach(function (corner, index) {
        if (index === 0) ctx.moveTo(sx(corner[0]), sy(corner[1]));
        else ctx.lineTo(sx(corner[0]), sy(corner[1]));
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(37,99,235,0.14)";
      ctx.fill();
      ctx.strokeStyle = "rgba(37,99,235,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      const avx = state.a * state.x + state.b * state.y;
      const avy = state.c * state.x + state.d * state.y;
      arrow(state.x, state.y, "#0f766e", "v");
      arrow(avx, avy, "#e11d48", "Av");
    }

    function update() {
      const det = state.a * state.d - state.b * state.c;
      const trace = state.a + state.d;
      const disc = trace * trace - 4 * det;
      const avx = state.a * state.x + state.b * state.y;
      const avy = state.c * state.x + state.d * state.y;

      detOut.textContent = fmt(det);
      traceOut.textContent = fmt(trace);
      if (disc >= 0) {
        const root = Math.sqrt(disc);
        eigenOut.textContent = fmt((trace + root) / 2) + ", " + fmt((trace - root) / 2);
      } else {
        eigenOut.textContent = "complex";
      }
      avOut.textContent = "(" + fmt(avx) + ", " + fmt(avy) + ")";

      if (Math.abs(det) < 1e-9) {
        noteOut.className = "feedback warn";
        noteOut.textContent = "det(A) = 0: the transformation collapses the plane onto a line and has no inverse.";
      } else {
        noteOut.className = "feedback info";
        noteOut.textContent = "det(A) = " + fmt(det) + " multiplies areas. A negative determinant includes a reflection.";
      }

      draw();
    }

    Object.values(matrixInputs).forEach(function (input) {
      input.addEventListener("input", readInputs);
    });
    Object.values(vectorInputs).forEach(function (input) {
      input.addEventListener("input", readInputs);
    });

    presetSelect.addEventListener("change", function () {
      const preset = PRESETS[presetSelect.value];
      state = {
        a: preset.a,
        b: preset.b,
        c: preset.c,
        d: preset.d,
        x: 1.4,
        y: 1.1
      };
      writeInputs();
      update();
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    writeInputs();
    resize();

    MS.registerCleanup(function () {
      resizeObserver.disconnect();
    });
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.matrixLab = matrixLab;
})();
