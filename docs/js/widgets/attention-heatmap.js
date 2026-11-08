/* Chapter 15: scaled dot-product self-attention heatmap. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const TOKENS = [
    [1, 0],
    [0, 1],
    [1, 1]
  ];

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function softmax(row) {
    const max = Math.max.apply(null, row);
    const exps = row.map(function (value) { return Math.exp(value - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (value) { return value / sum; });
  }

  function attentionHeatmap(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Scaled dot-product self-attention</h3>' +
      '<p class="widget-subtitle">Each row is one query. The columns are keys; the cell is the attention weight after softmax.</p>' +
      "</div>" +
      '<span class="widget-badge">Heatmap</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label>Mode</label>' +
      '<label class="quiz-option" style="min-height:38px;margin:0">' +
      '<input type="checkbox" data-scale checked> Scale by 1/√d_k' +
      "</label></div>" +
      '<div class="control grow"><label>Masking</label>' +
      '<label class="quiz-option" style="min-height:38px;margin:0">' +
      '<input type="checkbox" data-causal> Causal mask' +
      "</label></div></div>" +
      '<div class="attention-grid" data-grid></div>' +
      '<div class="attention-legend">' +
      '<span>0</span><span class="attention-scale"></span><span>1</span>' +
      '<span data-legend>row weights sum to 1</span>' +
      "</div>" +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">d_k</span><span class="info-card-value" data-dk>2</span></div>' +
      '<div class="info-card"><span class="info-card-label">scale</span><span class="info-card-value" data-scale-out>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">masked cells</span><span class="info-card-value" data-masked>0</span></div>' +
      '<div class="info-card"><span class="info-card-label">max weight</span><span class="info-card-value" data-max>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">$\\operatorname{softmax}(QK^T/\\sqrt{d_k})V$. The causal mask prevents a query from attending to future keys.</p>' +
      "</div>";

    const grid = container.querySelector("[data-grid]");
    const scaleBox = container.querySelector("[data-scale]");
    const causalBox = container.querySelector("[data-causal]");
    const dkOut = container.querySelector("[data-dk]");
    const scaleOut = container.querySelector("[data-scale-out]");
    const maskedOut = container.querySelector("[data-masked]");
    const maxOut = container.querySelector("[data-max]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const dk = TOKENS[0].length;
      const scale = scaleBox.checked ? Math.sqrt(dk) : 1;
      const useMask = causalBox.checked;

      const scores = TOKENS.map(function (query) {
        return TOKENS.map(function (key) {
          return (query[0] * key[0] + query[1] * key[1]) / scale;
        });
      });

      const weights = scores.map(function (row, i) {
        return softmax(row.map(function (value, j) {
          return useMask && j > i ? -1e9 : value;
        }));
      });

      let masked = 0;
      let max = 0;
      weights.forEach(function (row) {
        row.forEach(function (value) {
          if (value > max) max = value;
        });
      });

      let html = '<span class="attention-axis"></span>';
      [1, 2, 3].forEach(function (j) {
        html += '<span class="attention-axis">k' + j + "</span>";
      });

      weights.forEach(function (row, i) {
        html += '<span class="attention-axis">q' + (i + 1) + "</span>";
        row.forEach(function (value, j) {
          const isMasked = useMask && j > i;
          if (isMasked) masked += 1;
          const alpha = isMasked ? 0 : 0.12 + value * 0.78;
          const style = isMasked
            ? ""
            : ' style="background:rgba(37,99,235,' + alpha.toFixed(3) +
              ');color:' + (value > 0.45 ? "#ffffff" : "var(--text)") + '"';
          html +=
            '<span class="attention-cell' + (isMasked ? " masked" : "") + '"' + style +
            ' aria-label="query ' + (i + 1) + ', key ' + (j + 1) +
            ': ' + (isMasked ? "masked" : fmt(value)) + '">' +
            (isMasked ? "—" : fmt(value)) + "</span>";
        });
      });

      grid.innerHTML = html;
      dkOut.textContent = String(dk);
      scaleOut.textContent = scaleBox.checked
        ? "1/√" + dk + " = " + fmt(1 / Math.sqrt(dk))
        : "1 (disabled)";
      maskedOut.textContent = String(masked);
      maxOut.textContent = fmt(max);

      if (useMask) {
        feedback.className = "feedback info";
        feedback.textContent =
          "Causal mask: row i can attend only to keys 1..i. The first row is forced onto key 1, and future cells are removed.";
      } else {
        feedback.className = "feedback info";
        feedback.textContent =
          "No mask: every query can attend to every key. Scaling keeps the logits from growing with d_k.";
      }
    }

    scaleBox.addEventListener("change", update);
    causalBox.addEventListener("change", update);

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.attentionHeatmap = attentionHeatmap;
})();
