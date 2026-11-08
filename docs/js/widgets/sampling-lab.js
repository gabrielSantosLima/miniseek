/* Chapter 17: temperature, top-k, top-p, and sampling. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const TOKENS = ["the", "a", "cat", "sat", "on"];
  const LOGITS = [2.0, 1.2, 0.8, 0.3, 0.0];

  function softmax(values, temperature) {
    const scaled = values.map(function (value) { return value / temperature; });
    const max = Math.max.apply(null, scaled);
    const exps = scaled.map(function (value) { return Math.exp(value - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (value) { return value / sum; });
  }

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function samplingLab(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Decoding and sampling</h3>' +
      '<p class="widget-subtitle">Temperature reshapes the distribution; top-k and top-p truncate the tail before sampling.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="samp-temp">Temperature T <output data-temp-out></output></label>' +
      '<input id="samp-temp" type="range" data-temp min="0.1" max="2" step="0.05" value="1">' +
      "</div>" +
      '<div class="control"><label for="samp-topk">Top-k</label>' +
      '<select id="samp-topk" data-topk>' +
      '<option value="1">1 (greedy)</option>' +
      '<option value="3" selected>3</option>' +
      '<option value="5">5 (all)</option>' +
      "</select></div>" +
      '<div class="control grow"><label for="samp-topp">Top-p <output data-topp-out></output></label>' +
      '<input id="samp-topp" type="range" data-topp min="0.5" max="1" step="0.01" value="1">' +
      "</div></div>" +
      '<div class="bar-chart" data-bars></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">greedy</span><span class="info-card-value" data-greedy>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">kept tokens</span><span class="info-card-value" data-kept>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">max p</span><span class="info-card-value" data-max>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">entropy</span><span class="info-card-value" data-entropy>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-sample>Sample 100 tokens</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">Sampling draws from the truncated, renormalized distribution. Greedy decoding is the limit $T\\to0$ or top-k $=1$.</p>' +
      "</div>";

    const tempInput = container.querySelector("[data-temp]");
    const topkSelect = container.querySelector("[data-topk]");
    const toppInput = container.querySelector("[data-topp]");
    const tempOut = container.querySelector("[data-temp-out]");
    const toppOut = container.querySelector("[data-topp-out]");
    const bars = container.querySelector("[data-bars]");
    const greedyOut = container.querySelector("[data-greedy]");
    const keptOut = container.querySelector("[data-kept]");
    const maxOut = container.querySelector("[data-max]");
    const entropyOut = container.querySelector("[data-entropy]");
    const feedback = container.querySelector("[data-feedback]");
    const sampleButton = container.querySelector("[data-sample]");
    const resetButton = container.querySelector("[data-reset]");

    function truncate(probs, k, p) {
      const indexed = probs.map(function (value, index) {
        return { value: value, index: index };
      }).sort(function (a, b) { return b.value - a.value; });

      let kept = indexed.slice(0, k);
      if (p < 1) {
        const selected = [];
        let cumulative = 0;
        for (let i = 0; i < kept.length; i += 1) {
          selected.push(kept[i]);
          cumulative += kept[i].value;
          if (cumulative >= p) break;
        }
        kept = selected;
      }

      const sum = kept.reduce(function (acc, item) { return acc + item.value; }, 0);
      const final = new Array(probs.length).fill(0);
      const normalized = {};
      kept.forEach(function (item) {
        final[item.index] = item.value / sum;
        normalized[item.index] = item.value / sum;
      });
      return { final: final, kept: kept.map(function (item) { return item.index; }) };
    }

    function state() {
      const T = Number(tempInput.value);
      const k = Number(topkSelect.value);
      const p = Number(toppInput.value);
      const base = softmax(LOGITS, T);
      const truncated = truncate(base, k, p);
      return { T: T, k: k, p: p, base: base, final: truncated.final, kept: truncated.kept };
    }

    function update() {
      const s = state();
      tempOut.textContent = "= " + fmt(s.T);
      toppOut.textContent = "= " + fmt(s.p);

      bars.innerHTML = s.final.map(function (probability, index) {
        return (
          '<div class="bar-row">' +
          "<span>" + TOKENS[index] + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          (probability * 100).toFixed(2) + '%"></div></div>' +
          '<span class="bar-value">' + (probability * 100).toFixed(1) + "%</span>" +
          "</div>"
        );
      }).join("");

      const maxIndex = s.final.indexOf(Math.max.apply(null, s.final));
      const entropy = -s.final.reduce(function (acc, probability) {
        return probability > 0 ? acc + probability * Math.log(probability) : acc;
      }, 0);

      greedyOut.textContent = TOKENS[maxIndex];
      keptOut.textContent = String(s.kept.length);
      maxOut.textContent = fmt(s.final[maxIndex]);
      entropyOut.textContent = fmt(entropy) + " nats";
    }

    sampleButton.addEventListener("click", function () {
      const s = state();
      const counts = new Array(TOKENS.length).fill(0);
      for (let i = 0; i < 100; i += 1) {
        const u = Math.random();
        let cumulative = 0;
        let chosen = s.final.length - 1;
        for (let j = 0; j < s.final.length; j += 1) {
          cumulative += s.final[j];
          if (u <= cumulative) {
            chosen = j;
            break;
          }
        }
        counts[chosen] += 1;
      }

      feedback.className = "feedback info";
      feedback.textContent =
        "100 samples — " +
        TOKENS.map(function (token, index) {
          return token + ": " + counts[index];
        }).join(", ") +
        ". Tokens with zero truncated probability are never sampled.";
    });

    resetButton.addEventListener("click", function () {
      tempInput.value = 1;
      topkSelect.value = "3";
      toppInput.value = 1;
      feedback.className = "feedback";
      feedback.textContent = "";
      update();
    });

    [tempInput, topkSelect, toppInput].forEach(function (input) {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });

    update();
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.samplingLab = samplingLab;
})();
