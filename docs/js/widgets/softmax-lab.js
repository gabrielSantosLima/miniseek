/* Chapter 7: softmax, temperature, entropy, and sampling. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function softmaxLab(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Softmax and temperature</h3>' +
      '<p class="widget-subtitle">Logits are scores. Softmax turns them into probabilities; temperature controls how sharp the distribution is.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="sm-z1">Logit z₁ <output data-z1-out></output></label>' +
      '<input id="sm-z1" type="range" data-z="0" min="-4" max="4" step="0.1" value="2">' +
      "</div>" +
      '<div class="control grow"><label for="sm-z2">Logit z₂ <output data-z2-out></output></label>' +
      '<input id="sm-z2" type="range" data-z="1" min="-4" max="4" step="0.1" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="sm-z3">Logit z₃ <output data-z3-out></output></label>' +
      '<input id="sm-z3" type="range" data-z="2" min="-4" max="4" step="0.1" value="0">' +
      "</div>" +
      '<div class="control grow"><label for="sm-temp">Temperature T <output data-temp-out></output></label>' +
      '<input id="sm-temp" type="range" data-temp min="0.1" max="3" step="0.05" value="1">' +
      "</div></div>" +
      '<div class="bar-chart" data-bars></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">argmax</span><span class="info-card-value" data-argmax>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">max p</span><span class="info-card-value" data-maxp>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">entropy H(p)</span><span class="info-card-value" data-entropy>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">surprise −log p</span><span class="info-card-value" data-surprise>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-sample>Sample 200 tokens</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">$p_i=\\dfrac{e^{z_i/T}}{\\sum_j e^{z_j/T}}$. As $T\\to 0$ the distribution approaches the argmax; as $T$ grows it approaches uniform.</p>' +
      "</div>";

    const zInputs = [
      container.querySelector('[data-z="0"]'),
      container.querySelector('[data-z="1"]'),
      container.querySelector('[data-z="2"]')
    ];
    const zOutputs = [
      container.querySelector("[data-z1-out]"),
      container.querySelector("[data-z2-out]"),
      container.querySelector("[data-z3-out]")
    ];
    const tempInput = container.querySelector("[data-temp]");
    const tempOut = container.querySelector("[data-temp-out]");
    const bars = container.querySelector("[data-bars]");
    const argmaxOut = container.querySelector("[data-argmax]");
    const maxpOut = container.querySelector("[data-maxp]");
    const entropyOut = container.querySelector("[data-entropy]");
    const surpriseOut = container.querySelector("[data-surprise]");
    const feedback = container.querySelector("[data-feedback]");
    const sampleButton = container.querySelector("[data-sample]");
    const resetButton = container.querySelector("[data-reset]");

    const labels = ["A", "B", "C"];

    function read() {
      return {
        z: zInputs.map(function (input) { return Number(input.value); }),
        t: Number(tempInput.value)
      };
    }

    function probabilities(z, t) {
      const scaled = z.map(function (value) { return value / t; });
      const max = Math.max.apply(null, scaled);
      const exps = scaled.map(function (value) { return Math.exp(value - max); });
      const sum = exps.reduce(function (a, b) { return a + b; }, 0);
      return exps.map(function (value) { return value / sum; });
    }

    function update() {
      const state = read();
      const p = probabilities(state.z, state.t);
      const maxIndex = p.indexOf(Math.max.apply(null, p));
      const entropy = -p.reduce(function (acc, value) {
        return value > 0 ? acc + value * Math.log(value) : acc;
      }, 0);
      const surprise = -Math.log(p[maxIndex]);

      zInputs.forEach(function (input, index) {
        zOutputs[index].textContent = "= " + fmt(state.z[index]);
      });
      tempOut.textContent = "= " + fmt(state.t);

      bars.innerHTML = p.map(function (value, index) {
        return (
          '<div class="bar-row">' +
          "<span>" + labels[index] + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          (value * 100).toFixed(2) + '%"></div></div>' +
          '<span class="bar-value">' + (value * 100).toFixed(1) + "%</span>" +
          "</div>"
        );
      }).join("");

      argmaxOut.textContent = labels[maxIndex];
      maxpOut.textContent = fmt(p[maxIndex]);
      entropyOut.textContent = fmt(entropy) + " nats";
      surpriseOut.textContent = fmt(surprise);
    }

    zInputs.forEach(function (input) {
      input.addEventListener("input", update);
    });
    tempInput.addEventListener("input", update);

    sampleButton.addEventListener("click", function () {
      const state = read();
      const p = probabilities(state.z, state.t);
      const counts = [0, 0, 0];

      for (let i = 0; i < 200; i += 1) {
        const u = Math.random();
        let cumulative = 0;
        let chosen = 0;
        for (let j = 0; j < p.length; j += 1) {
          cumulative += p[j];
          if (u <= cumulative) {
            chosen = j;
            break;
          }
        }
        counts[chosen] += 1;
      }

      feedback.className = "feedback info";
      feedback.textContent =
        "200 samples — A: " + counts[0] + ", B: " + counts[1] + ", C: " + counts[2] +
        ". Expected counts: " + p.map(function (value) {
          return (value * 200).toFixed(1);
        }).join(" / ") + ".";
    });

    resetButton.addEventListener("click", function () {
      zInputs[0].value = 2;
      zInputs[1].value = 1;
      zInputs[2].value = 0;
      tempInput.value = 1;
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    });

    update();
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.softmaxLab = softmaxLab;
})();
