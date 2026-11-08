/* Chapter 12: LSTM gate calculator. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function lstmGates(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">LSTM gate calculator</h3>' +
      '<p class="widget-subtitle">Move the gates and watch how the cell state and hidden state change.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="lstm-f">Forget gate f <output data-f-out></output></label>' +
      '<input id="lstm-f" type="range" data-f min="0" max="1" step="0.01" value="0.5">' +
      "</div>" +
      '<div class="control grow"><label for="lstm-i">Input gate i <output data-i-out></output></label>' +
      '<input id="lstm-i" type="range" data-i min="0" max="1" step="0.01" value="0.8">' +
      "</div>" +
      '<div class="control grow"><label for="lstm-o">Output gate o <output data-o-out></output></label>' +
      '<input id="lstm-o" type="range" data-o min="0" max="1" step="0.01" value="0.6">' +
      "</div>" +
      '<div class="control grow"><label for="lstm-cprev">Previous cell c<sub>t−1</sub> <output data-c-out></output></label>' +
      '<input id="lstm-cprev" type="range" data-cprev min="-2" max="2" step="0.1" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="lstm-cand">Candidate c̃<sub>t</sub> <output data-cand-out></output></label>' +
      '<input id="lstm-cand" type="range" data-cand min="-2" max="2" step="0.1" value="2">' +
      "</div></div>" +
      '<div class="bar-chart" data-bars></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">c_t</span><span class="info-card-value" data-ct>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">tanh(c_t)</span><span class="info-card-value" data-tanh>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">h_t</span><span class="info-card-value" data-ht>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">memory change</span><span class="info-card-value" data-change>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">$c_t=f_t\\odot c_{t-1}+i_t\\odot\\tilde c_t$ and ' +
      "$h_t=o_t\\odot\\tanh(c_t)$.</p>" +
      "</div>";

    const fInput = container.querySelector("[data-f]");
    const iInput = container.querySelector("[data-i]");
    const oInput = container.querySelector("[data-o]");
    const cInput = container.querySelector("[data-cprev]");
    const candInput = container.querySelector("[data-cand]");
    const fOut = container.querySelector("[data-f-out]");
    const iOut = container.querySelector("[data-i-out]");
    const oOut = container.querySelector("[data-o-out]");
    const cOut = container.querySelector("[data-c-out]");
    const candOut = container.querySelector("[data-cand-out]");
    const bars = container.querySelector("[data-bars]");
    const ctOut = container.querySelector("[data-ct]");
    const tanhOut = container.querySelector("[data-tanh]");
    const htOut = container.querySelector("[data-ht]");
    const changeOut = container.querySelector("[data-change]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const f = Number(fInput.value);
      const i = Number(iInput.value);
      const o = Number(oInput.value);
      const cPrev = Number(cInput.value);
      const candidate = Number(candInput.value);

      const c = f * cPrev + i * candidate;
      const tanhC = Math.tanh(c);
      const h = o * tanhC;
      const change = c - cPrev;

      fOut.textContent = "= " + fmt(f);
      iOut.textContent = "= " + fmt(i);
      oOut.textContent = "= " + fmt(o);
      cOut.textContent = "= " + fmt(cPrev);
      candOut.textContent = "= " + fmt(candidate);

      bars.innerHTML = [
        ["f", f, "forget"],
        ["i", i, "input"],
        ["o", o, "output"]
      ].map(function (row) {
        return (
          '<div class="bar-row">' +
          "<span>" + row[0] + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          (row[1] * 100).toFixed(1) + '%"></div></div>' +
          '<span class="bar-value">' + row[2] + "</span>" +
          "</div>"
        );
      }).join("");

      ctOut.textContent = fmt(c);
      tanhOut.textContent = fmt(tanhC);
      htOut.textContent = fmt(h);
      changeOut.textContent = (change >= 0 ? "+" : "") + fmt(change);

      if (f > 0.8 && i > 0.5) {
        feedback.className = "feedback ok";
        feedback.textContent =
          "The cell keeps most of its old memory and also writes a strong new candidate. This is the additive path that helps gradients flow.";
      } else if (f < 0.3) {
        feedback.className = "feedback warn";
        feedback.textContent =
          "The forget gate is small, so most of the previous cell state is discarded. Long-range information is lost.";
      } else {
        feedback.className = "feedback info";
        feedback.textContent =
          "The cell state is a weighted blend of old memory and new candidate; the output gate then decides how much is exposed as h_t.";
      }
    }

    [fInput, iInput, oInput, cInput, candInput].forEach(function (input) {
      input.addEventListener("input", update);
    });

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.lstmGates = lstmGates;
})();
