/* Canvas plotting helper used by the interactive widgets. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function niceStep(range, targetTicks) {
    const rough = range / Math.max(1, targetTicks);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
    const residual = rough / magnitude;
    let factor = 1;
    if (residual >= 5) {
      factor = 5;
    } else if (residual >= 2) {
      factor = 2;
    }
    return factor * magnitude;
  }

  function formatTick(value, step) {
    if (Math.abs(value) < 1e-10) {
      return "0";
    }
    const decimals = Math.max(0, Math.min(4, -Math.floor(Math.log10(step))));
    return Number(value.toFixed(decimals)).toString();
  }

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value && value.trim() ? value.trim() : fallback;
  }

  class Plot {
    constructor(container, options) {
      const opts = options || {};
      this.container = container;
      this.height = opts.height || 280;
      this.xMin = opts.xMin === undefined ? -5 : opts.xMin;
      this.xMax = opts.xMax === undefined ? 5 : opts.xMax;
      this.yMin = opts.yMin === undefined ? -5 : opts.yMin;
      this.yMax = opts.yMax === undefined ? 5 : opts.yMax;
      this.padding = opts.padding === undefined ? 38 : opts.padding;
      this.renderer = null;

      this.canvas = document.createElement("canvas");
      this.canvas.className = "plot-canvas";
      this.canvas.setAttribute("role", "img");
      this.canvas.setAttribute("aria-label", opts.label || "Mathematical plot");
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");

      this.handleResize = this.handleResize.bind(this);
      this.handleTheme = () => this.draw();
      window.addEventListener("miniseek:theme", this.handleTheme);
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(container);
      } else {
        window.addEventListener("resize", this.handleResize);
      }

      this.handleResize();
    }

    handleResize() {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(260, this.container.clientWidth || 520);
      this.width = width;
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.canvas.style.width = width + "px";
      this.canvas.style.height = this.height + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    setRanges(ranges) {
      if (ranges.xMin !== undefined) this.xMin = ranges.xMin;
      if (ranges.xMax !== undefined) this.xMax = ranges.xMax;
      if (ranges.yMin !== undefined) this.yMin = ranges.yMin;
      if (ranges.yMax !== undefined) this.yMax = ranges.yMax;
      this.draw();
    }

    autoYRanges(functions, padRatio) {
      const pad = padRatio === undefined ? 0.12 : padRatio;
      let min = Infinity;
      let max = -Infinity;
      const samples = 240;

      functions.forEach((fn) => {
        for (let i = 0; i <= samples; i += 1) {
          const x = this.xMin + ((this.xMax - this.xMin) * i) / samples;
          const y = fn(x);
          if (Number.isFinite(y)) {
            if (y < min) min = y;
            if (y > max) max = y;
          }
        }
      });

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        min = -5;
        max = 5;
      }

      if (max - min < 1e-9) {
        min -= 1;
        max += 1;
      }

      const span = max - min;
      this.yMin = min - span * pad;
      this.yMax = max + span * pad;
      this.draw();
    }

    sx(x) {
      const left = this.padding;
      const right = this.width - this.padding;
      return left + ((x - this.xMin) / (this.xMax - this.xMin)) * (right - left);
    }

    sy(y) {
      const top = this.padding;
      const bottom = this.height - this.padding;
      return bottom - ((y - this.yMin) / (this.yMax - this.yMin)) * (bottom - top);
    }

    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawGrid() {
      const ctx = this.ctx;
      const left = this.padding;
      const right = this.width - this.padding;
      const top = this.padding;
      const bottom = this.height - this.padding;

      ctx.save();
      ctx.strokeStyle = cssVar("--plot-grid", "rgba(90,100,110,0.16)");
      ctx.lineWidth = 1;
      ctx.fillStyle = cssVar("--plot-label", "#6b7580");
      ctx.font = "11px system-ui, sans-serif";

      const xStep = niceStep(this.xMax - this.xMin, 6);
      const yStep = niceStep(this.yMax - this.yMin, 5);

      let x = Math.ceil(this.xMin / xStep) * xStep;
      while (x <= this.xMax + 1e-9) {
        const px = this.sx(x);
        ctx.beginPath();
        ctx.moveTo(px, top);
        ctx.lineTo(px, bottom);
        ctx.stroke();
        if (Math.abs(x) > 1e-9) {
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(formatTick(x, xStep), px, bottom + 7);
        }
        x += xStep;
      }

      let y = Math.ceil(this.yMin / yStep) * yStep;
      while (y <= this.yMax + 1e-9) {
        const py = this.sy(y);
        ctx.beginPath();
        ctx.moveTo(left, py);
        ctx.lineTo(right, py);
        ctx.stroke();
        if (Math.abs(y) > 1e-9) {
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(formatTick(y, yStep), left - 7, py);
        }
        y += yStep;
      }

      ctx.restore();
    }

    drawAxes() {
      const ctx = this.ctx;
      const left = this.padding;
      const right = this.width - this.padding;
      const top = this.padding;
      const bottom = this.height - this.padding;

      ctx.save();
      ctx.strokeStyle = cssVar("--plot-axis", "rgba(70,80,90,0.55)");
      ctx.lineWidth = 1.25;

      if (this.yMin <= 0 && this.yMax >= 0) {
        const y0 = this.sy(0);
        ctx.beginPath();
        ctx.moveTo(left, y0);
        ctx.lineTo(right, y0);
        ctx.stroke();
      }

      if (this.xMin <= 0 && this.xMax >= 0) {
        const x0 = this.sx(0);
        ctx.beginPath();
        ctx.moveTo(x0, top);
        ctx.lineTo(x0, bottom);
        ctx.stroke();
      }

      ctx.restore();
    }

    draw() {
      this.clear();
      this.drawGrid();
      this.drawAxes();
      if (typeof this.renderer === "function") {
        this.renderer(this);
      }
    }

    setRenderer(renderer) {
      this.renderer = renderer;
      this.draw();
    }

    drawFunction(fn, options) {
      const opts = options || {};
      const ctx = this.ctx;
      const left = this.padding;
      const right = this.width - this.padding;
      const top = this.padding;
      const bottom = this.height - this.padding;
      const samples = opts.samples || 360;

      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();
      ctx.strokeStyle = opts.color || "#2563eb";
      ctx.lineWidth = opts.width || 2.2;
      ctx.setLineDash(opts.dash || []);
      ctx.beginPath();

      let started = false;
      for (let i = 0; i <= samples; i += 1) {
        const x = this.xMin + ((this.xMax - this.xMin) * i) / samples;
        const y = fn(x);
        if (!Number.isFinite(y)) {
          started = false;
          continue;
        }

        const px = this.sx(x);
        const py = this.sy(y);

        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
      ctx.restore();
    }

    drawSegment(x1, y1, x2, y2, options) {
      const opts = options || {};
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = opts.color || "#7c3aed";
      ctx.lineWidth = opts.width || 1.6;
      ctx.setLineDash(opts.dash || []);
      ctx.beginPath();
      ctx.moveTo(this.sx(x1), this.sy(y1));
      ctx.lineTo(this.sx(x2), this.sy(y2));
      ctx.stroke();
      ctx.restore();
    }

    drawVertical(x, options) {
      const opts = options || {};
      this.drawSegment(x, this.yMin, x, this.yMax, opts);
    }

    drawPoint(x, y, options) {
      const opts = options || {};
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      const ctx = this.ctx;
      const px = this.sx(x);
      const py = this.sy(y);
      const radius = opts.radius || 4.5;

      ctx.save();
      ctx.fillStyle = opts.color || "#e11d48";
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      if (opts.ring !== false) {
        ctx.strokeStyle = cssVar("--bg-elevated", "#fff");
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (opts.label) {
        ctx.fillStyle = opts.labelColor || cssVar("--text", "#1d232b");
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(opts.label, px + 8, py - 7);
      }
      ctx.restore();
    }

    destroy() {
      window.removeEventListener("miniseek:theme", this.handleTheme);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", this.handleResize);
      }
    }
  }

  MS.Plot = Plot;
})();
