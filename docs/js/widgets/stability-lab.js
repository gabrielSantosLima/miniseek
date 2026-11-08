/* Chapter 20: stable softmax and cross-entropy. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const PRESETS = {
    safe: { label: "Safe logits (2, 1, 0)", values: [2, 1, 0] },
    overflow: { label: "Overflow risk (1000, 999, 998)", values: [1000, 999, 998] },
    underflow: { label: "Underflow risk (−1000, −999, −998)", values: [-1000, -999, -998] }
  };

  function fmt(value) {
    if (value === Infinity) return "Inf";
    if (value === -Infinity) return "−Inf";
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 1e-6)) {
      return value.toExponential(3);
    }
    return Number(value.toFixed(6)).toString();
  }

  function stabilityLab(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Stable softmax and cross-entropy</h3>' +
      '<p class="widget-subtitle">Subtracting the maximum logit prevents overflow without changing the probabilities.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="stab-preset">Logits</label>' +
      '<select id="stab-preset" data-preset>' +
      Object.keys(PRESETS).map(function (key) {
        return '<option value="' + key + '">' + PRESETS[key].label + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="control"><label for="stab-class">Correct class</label>' +
      '<select id="stab-class" data-class>' +
      '<option value="0">1</option><option value="1" selected>2</option><option value="2">3</option>' +
      "</select></div></div>" +
      '<table>' +
      '<thead><tr><th>Class</th><th>z</th><th>exp(z)</th><th>z − max</th><th>exp(z − max)</th><th>p</th></tr></thead>' +
      '<tbody data-rows></tbody>' +
      "</table>" +
      '<div class="config-summary">' +
      '<div class="config-item"><span>max z</span><strong data-max>—</strong></div>' +
      '<div class="config-item"><span>naive sum</span><strong data-naive>—</strong></div>' +
      '<div class="config-item"><span>stable sum</span><strong data-stable>—</strong></div>' +
      '<div class="config-item"><span>cross-entropy</span><strong data-ce>—</strong></div>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Stable form: $\\operatorname{softmax}(z)_i=' +
      "\\exp(z_i-m)/\\sum_j\\exp(z_j-m)$ with $m=\\max_j z_j$. " +
      "Stable loss: $\\operatorname{logsumexp}(z)-z_c$.</p>" +
      "</div>";

    const presetSelect = container.querySelector("[data-preset]");
    const classSelect = container.querySelector("[data-class]");
    const rows = container.querySelector("[data-rows]");
    const maxOut = container.querySelector("[data-max]");
    const naiveOut = container.querySelector("[data-naive]");
    const stableOut = container.querySelector("[data-stable]");
    const ceOut = container.querySelector("[data-ce]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const z = PRESETS[presetSelect.value].values.slice();
      const correct = Number(classSelect.value);
      const max = Math.max.apply(null, z);
      const shifted = z.map(function (value) { return value - max; });
      const naive = z.map(function (value) { return Math.exp(value); });
      const stable = shifted.map(function (value) { return Math.exp(value); });
      const naiveSum = naive.reduce(function (a, b) { return a + b; }, 0);
      const stableSum = stable.reduce(function (a, b) { return a + b; }, 0);
      const probs = stable.map(function (value) { return value / stableSum; });
      const ce = Math.log(stableSum) + max - z[correct];

      rows.innerHTML = z.map(function (value, index) {
        return (
          "<tr><td>" + (index + 1) + "</td><td>" + fmt(value) + "</td><td>" +
          fmt(naive[index]) + "</td><td>" + fmt(shifted[index]) + "</td><td>" +
          fmt(stable[index]) + "</td><td>" + fmt(probs[index]) + "</td></tr>"
        );
      }).join("");

      maxOut.textContent = fmt(max);
      naiveOut.textContent = fmt(naiveSum);
      stableOut.textContent = fmt(stableSum);
      ceOut.textContent = fmt(ce);

      const overflow = naive.some(function (value) { return value === Infinity; });
      const underflow = naive.every(function (value) { return value === 0; });
      if (overflow) {
        feedback.className = "feedback warn";
        feedback.textContent =
          "The naive exponentials overflow to Infinity. Subtracting the maximum keeps every exponent at or below zero, so the stable form is finite.";
      } else if (underflow) {
        feedback.className = "feedback warn";
        feedback.textContent =
          "The naive exponentials underflow to zero. The stable form shifts the logits before exponentiating, preserving the relative probabilities.";
      } else {
        feedback.className = "feedback ok";
        feedback.textContent =
          "No overflow or underflow at this scale, but the stable form is still the correct implementation to use.";
      }
    }

    presetSelect.addEventListener("change", update);
    classSelect.addEventListener("change", update);

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.stabilityLab = stabilityLab;
})();
