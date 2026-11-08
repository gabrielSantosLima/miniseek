/* Chapter 16: Transformer shape tracer and parameter counter. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmtInt(value) {
    return Math.round(value).toLocaleString("en-US");
  }

  function fmtMillions(value) {
    return (value / 1e6).toFixed(3) + "M";
  }

  function transformerShapes(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Transformer shape tracer</h3>' +
      '<p class="widget-subtitle">Change the configuration and follow the shape of every tensor through one decoder-only block.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control"><label for="ts-d">d_model</label><select id="ts-d" data-d>' +
      [8, 16, 32, 64].map(function (v) { return '<option value="' + v + '"' + (v === 16 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="ts-heads">Heads</label><select id="ts-heads" data-heads>' +
      [2, 4, 8].map(function (v) { return '<option value="' + v + '"' + (v === 4 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="ts-layers">Layers <output data-layers-out>2</output></label>' +
      '<input id="ts-layers" type="range" data-layers min="1" max="12" step="1" value="2">' +
      "</div>" +
      '<div class="control"><label for="ts-ctx">Context T</label><select id="ts-ctx" data-ctx>' +
      [4, 8, 16, 32, 64, 128].map(function (v) { return '<option value="' + v + '"' + (v === 16 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="ts-vocab">Vocabulary V</label><select id="ts-vocab" data-vocab>' +
      [1000, 10000, 32000, 50257].map(function (v) { return '<option value="' + v + '"' + (v === 10000 ? " selected" : "") + ">" + fmtInt(v) + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="ts-ff">FF multiplier</label><select id="ts-ff" data-ff>' +
      [2, 4, 8].map(function (v) { return '<option value="' + v + '"' + (v === 4 ? " selected" : "") + ">" + v + "×</option>"; }).join("") +
      "</select></div></div>" +
      '<div class="config-summary">' +
      '<div class="config-item"><span>parameters</span><strong data-params>—</strong></div>' +
      '<div class="config-item"><span>per block</span><strong data-block>—</strong></div>' +
      '<div class="config-item"><span>d_head</span><strong data-dhead>—</strong></div>' +
      '<div class="config-item"><span>attention scores</span><strong data-scores>—</strong></div>' +
      "</div>" +
      '<table style="margin-top:16px">' +
      '<thead><tr><th>Stage</th><th>Shape</th></tr></thead>' +
      '<tbody data-shapes></tbody>' +
      "</table>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Parameter count for one pre-norm block: ' +
      "$4d^2+2df+f+9d$, where $f$ is the FFN width. Embeddings add $Vd$ and the final norm adds $2d$.</p>" +
      "</div>";

    const dSelect = container.querySelector("[data-d]");
    const headsSelect = container.querySelector("[data-heads]");
    const layersInput = container.querySelector("[data-layers]");
    const layersOut = container.querySelector("[data-layers-out]");
    const ctxSelect = container.querySelector("[data-ctx]");
    const vocabSelect = container.querySelector("[data-vocab]");
    const ffSelect = container.querySelector("[data-ff]");
    const paramsOut = container.querySelector("[data-params]");
    const blockOut = container.querySelector("[data-block]");
    const dheadOut = container.querySelector("[data-dhead]");
    const scoresOut = container.querySelector("[data-scores]");
    const shapesBody = container.querySelector("[data-shapes]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const d = Number(dSelect.value);
      const heads = Number(headsSelect.value);
      const layers = Number(layersInput.value);
      const T = Number(ctxSelect.value);
      const V = Number(vocabSelect.value);
      const ff = Number(ffSelect.value) * d;
      const dHead = d / heads;

      layersOut.textContent = String(layers);

      if (!Number.isInteger(dHead)) {
        feedback.className = "feedback bad";
        feedback.textContent = "d_model must be divisible by the number of heads. Choose a compatible pair.";
        return;
      }

      const qkv = 3 * d * d + 3 * d;
      const outProj = d * d + d;
      const ffn = 2 * d * ff + ff + d;
      const norms = 4 * d;
      const block = qkv + outProj + ffn + norms;
      const embedding = V * d;
      const finalNorm = 2 * d;
      const total = layers * block + embedding + finalNorm;

      paramsOut.textContent = fmtMillions(total);
      blockOut.textContent = fmtMillions(block);
      dheadOut.textContent = String(dHead);
      scoresOut.textContent = fmtInt(heads * T * T) + " / layer";

      shapesBody.innerHTML = [
        ["token IDs", "(T) = (" + T + ")"],
        ["embeddings", "(T, d_model) = (" + T + ", " + d + ")"],
        ["Q, K, V", "(T, d_model) = (" + T + ", " + d + ")"],
        ["per-head Q, K, V", "(heads, T, d_head) = (" + heads + ", " + T + ", " + dHead + ")"],
        ["attention scores", "(heads, T, T) = (" + heads + ", " + T + ", " + T + ")"],
        ["attention output", "(T, d_model) = (" + T + ", " + d + ")"],
        ["FFN hidden", "(T, f) = (" + T + ", " + ff + ")"],
        ["block output", "(T, d_model) = (" + T + ", " + d + ")"],
        ["logits", "(T, V) = (" + T + ", " + fmtInt(V) + ")"]
      ].map(function (row) {
        return "<tr><td>" + row[0] + "</td><td><code>" + row[1] + "</code></td></tr>";
      }).join("");

      feedback.className = "feedback info";
      feedback.textContent =
        "The attention matrix has " + fmtInt(heads * T * T) + " entries per layer. " +
        "For long contexts, this quadratic term dominates memory.";
    }

    [dSelect, headsSelect, layersInput, ctxSelect, vocabSelect, ffSelect].forEach(function (input) {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });

    update();
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.transformerShapes = transformerShapes;
})();
