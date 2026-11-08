/* Chapter 14: alignment scores, softmax weights, and context vector. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const STATES = [
    [2, 0],
    [0, 1],
    [1, 1]
  ];

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function softmax(values) {
    const max = Math.max.apply(null, values);
    const exps = values.map(function (value) { return Math.exp(value - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (value) { return value / sum; });
  }

  function attentionPreview(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Attention before Transformers</h3>' +
      '<p class="widget-subtitle">A query scores three encoder states. Softmax turns the scores into alignment weights, and the context is their weighted sum.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="att-q1">Query q₁ <output data-q1-out></output></label>' +
      '<input id="att-q1" type="range" data-q1 min="-2" max="2" step="0.1" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="att-q2">Query q₂ <output data-q2-out></output></label>' +
      '<input id="att-q2" type="range" data-q2 min="-2" max="2" step="0.1" value="0">' +
      "</div></div>" +
      '<div class="bar-chart" data-bars></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">scores</span><span class="info-card-value" data-scores>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">weights</span><span class="info-card-value" data-weights>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">context vector</span><span class="info-card-value" data-context>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">max weight</span><span class="info-card-value" data-max>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Scores are $s_i=\\mathbf{q}\\cdot\\mathbf{e}_i$; weights are ' +
      "$\\alpha_i=\\operatorname{softmax}(\\mathbf{s})_i$; context is " +
      "$\\mathbf{c}=\\sum_i\\alpha_i\\mathbf{e}_i$.</p>" +
      "</div>";

    const q1Input = container.querySelector("[data-q1]");
    const q2Input = container.querySelector("[data-q2]");
    const q1Out = container.querySelector("[data-q1-out]");
    const q2Out = container.querySelector("[data-q2-out]");
    const bars = container.querySelector("[data-bars]");
    const scoresOut = container.querySelector("[data-scores]");
    const weightsOut = container.querySelector("[data-weights]");
    const contextOut = container.querySelector("[data-context]");
    const maxOut = container.querySelector("[data-max]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const q1 = Number(q1Input.value);
      const q2 = Number(q2Input.value);
      const q = [q1, q2];
      const scores = STATES.map(function (state) {
        return q[0] * state[0] + q[1] * state[1];
      });
      const weights = softmax(scores);
      const context = [0, 0];
      weights.forEach(function (weight, index) {
        context[0] += weight * STATES[index][0];
        context[1] += weight * STATES[index][1];
      });

      q1Out.textContent = "= " + fmt(q1);
      q2Out.textContent = "= " + fmt(q2);
      scoresOut.textContent = "(" + scores.map(fmt).join(", ") + ")";
      weightsOut.textContent = "(" + weights.map(fmt).join(", ") + ")";
      contextOut.textContent = "(" + fmt(context[0]) + ", " + fmt(context[1]) + ")";
      maxOut.textContent = fmt(Math.max.apply(null, weights));

      bars.innerHTML = weights.map(function (weight, index) {
        return (
          '<div class="bar-row">' +
          "<span>e" + (index + 1) + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          (weight * 100).toFixed(1) + '%"></div></div>' +
          '<span class="bar-value">' + (weight * 100).toFixed(1) + "%</span>" +
          "</div>"
        );
      }).join("");

      const maxIndex = weights.indexOf(Math.max.apply(null, weights));
      if (weights[maxIndex] > 0.8) {
        feedback.className = "feedback info";
        feedback.textContent =
          "The query aligns strongly with encoder state e" + (maxIndex + 1) +
          "; the context is dominated by that state.";
      } else {
        feedback.className = "feedback info";
        feedback.textContent =
          "The context blends all three encoder states. The weights always sum to one, so attention is a convex combination.";
      }
    }

    q1Input.addEventListener("input", update);
    q2Input.addEventListener("input", update);

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.attentionPreview = attentionPreview;
})();
