/* Chapter 18: capstone configuration and budget estimator. */
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

  function capstonePlanner(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Capstone configurator</h3>' +
      '<p class="widget-subtitle">Choose a small decoder-only configuration and estimate its parameter count and inference memory.</p>' +
      "</div>" +
      '<span class="widget-badge">Planner</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control"><label for="cp-d">d_model</label><select id="cp-d" data-d>' +
      [64, 128, 256].map(function (v) { return '<option value="' + v + '"' + (v === 128 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="cp-layers">Layers</label><select id="cp-layers" data-layers>' +
      [2, 4, 6, 8].map(function (v) { return '<option value="' + v + '"' + (v === 4 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="cp-heads">Heads</label><select id="cp-heads" data-heads>' +
      [2, 4, 8].map(function (v) { return '<option value="' + v + '"' + (v === 4 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="cp-ctx">Context</label><select id="cp-ctx" data-ctx>' +
      [64, 128, 256, 512].map(function (v) { return '<option value="' + v + '"' + (v === 128 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="cp-vocab">Vocabulary</label><select id="cp-vocab" data-vocab>' +
      [1000, 10000, 32000].map(function (v) { return '<option value="' + v + '"' + (v === 10000 ? " selected" : "") + ">" + fmtInt(v) + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="cp-batch">Batch</label><select id="cp-batch" data-batch>' +
      [1, 8, 32].map(function (v) { return '<option value="' + v + '"' + (v === 1 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div></div>" +
      '<div class="config-summary">' +
      '<div class="config-item"><span>parameters</span><strong data-params>—</strong></div>' +
      '<div class="config-item"><span>per block</span><strong data-block>—</strong></div>' +
      '<div class="config-item"><span>attention matrix</span><strong data-attn>—</strong></div>' +
      '<div class="config-item"><span>KV cache</span><strong data-kv>—</strong></div>' +
      '<div class="config-item"><span>logits tensor</span><strong data-logits>—</strong></div>' +
      '<div class="config-item"><span>approx. FLOPs/token</span><strong data-flops>—</strong></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Parameter count uses a pre-norm decoder-only block with a 4× FFN. KV cache assumes FP16 (2 bytes per entry).</p>' +
      "</div>";

    const dSelect = container.querySelector("[data-d]");
    const layersSelect = container.querySelector("[data-layers]");
    const headsSelect = container.querySelector("[data-heads]");
    const ctxSelect = container.querySelector("[data-ctx]");
    const vocabSelect = container.querySelector("[data-vocab]");
    const batchSelect = container.querySelector("[data-batch]");
    const paramsOut = container.querySelector("[data-params]");
    const blockOut = container.querySelector("[data-block]");
    const attnOut = container.querySelector("[data-attn]");
    const kvOut = container.querySelector("[data-kv]");
    const logitsOut = container.querySelector("[data-logits]");
    const flopsOut = container.querySelector("[data-flops]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const d = Number(dSelect.value);
      const layers = Number(layersSelect.value);
      const heads = Number(headsSelect.value);
      const T = Number(ctxSelect.value);
      const V = Number(vocabSelect.value);
      const B = Number(batchSelect.value);
      const ff = 4 * d;
      const dHead = d / heads;

      if (!Number.isInteger(dHead)) {
        feedback.className = "feedback bad";
        feedback.textContent = "d_model must be divisible by the number of heads.";
        return;
      }

      const perBlock = 4 * d * d + 2 * d * ff + ff + 9 * d;
      const total = layers * perBlock + V * d + 2 * d;
      const attentionEntries = B * heads * T * T * layers;
      const kvBytes = B * layers * 2 * T * d * 2;
      const logits = B * T * V;
      const flops = 6 * total;

      paramsOut.textContent = fmtMillions(total);
      blockOut.textContent = fmtMillions(perBlock);
      attnOut.textContent = fmtMillions(attentionEntries) + " entries";
      kvOut.textContent = (kvBytes / 1e6).toFixed(2) + " MB";
      logitsOut.textContent = fmtMillions(logits) + " values";
      flopsOut.textContent = fmtMillions(flops);

      const share = (V * d) / total;
      feedback.className = "feedback info";
      feedback.textContent =
        "The embedding table is " + (share * 100).toFixed(1) + "% of the parameters. " +
        "The attention matrix grows with T²; at T=" + T + " and " + heads +
        " heads it has " + fmtInt(heads * T * T) + " entries per layer per item.";
    }

    [dSelect, layersSelect, headsSelect, ctxSelect, vocabSelect, batchSelect].forEach(function (input) {
      input.addEventListener("change", update);
      input.addEventListener("input", update);
    });

    update();
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.capstonePlanner = capstonePlanner;
})();
