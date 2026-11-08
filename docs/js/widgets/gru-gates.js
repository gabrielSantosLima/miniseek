/* Chapter 13: GRU gate calculator. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function gruGates(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">GRU gate calculator</h3>' +
      '<p class="widget-subtitle">The update gate interpolates between the old state and the candidate; the reset gate shapes the candidate.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="gru-z">Update gate z <output data-z-out></output></label>' +
      '<input id="gru-z" type="range" data-z min="0" max="1" step="0.01" value="0.3">' +
      "</div>" +
      '<div class="control grow"><label for="gru-r">Reset gate r <output data-r-out></output></label>' +
      '<input id="gru-r" type="range" data-r min="0" max="1" step="0.01" value="0.6">' +
      "</div>" +
      '<div class="control grow"><label for="gru-hprev">Previous state h<sub>t−1</sub> <output data-hprev-out></output></label>' +
      '<input id="gru-hprev" type="range" data-hprev min="-2" max="2" step="0.1" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="gru-pre">Candidate pre-activation <output data-pre-out></output></label>' +
      '<input id="gru-pre" type="range" data-pre min="-3" max="3" step="0.1" value="0.4">' +
      "</div></div>" +
      '<div class="bar-chart" data-bars></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">candidate h̃</span><span class="info-card-value" data-candidate>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">old contribution</span><span class="info-card-value" data-old>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">new contribution</span><span class="info-card-value" data-new>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">h_t</span><span class="info-card-value" data-ht>—</span></div>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">$\\tilde h_t=\\tanh(\\text{pre-activation})$, ' +
      "$h_t=(1-z_t)\\odot h_{t-1}+z_t\\odot\\tilde h_t$.</p>" +
      "</div>";

    const zInput = container.querySelector("[data-z]");
    const rInput = container.querySelector("[data-r]");
    const hInput = container.querySelector("[data-hprev]");
    const preInput = container.querySelector("[data-pre]");
    const zOut = container.querySelector("[data-z-out]");
    const rOut = container.querySelector("[data-r-out]");
    const hOut = container.querySelector("[data-hprev-out]");
    const preOut = container.querySelector("[data-pre-out]");
    const bars = container.querySelector("[data-bars]");
    const candidateOut = container.querySelector("[data-candidate]");
    const oldOut = container.querySelector("[data-old]");
    const newOut = container.querySelector("[data-new]");
    const htOut = container.querySelector("[data-ht]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const z = Number(zInput.value);
      const r = Number(rInput.value);
      const hPrev = Number(hInput.value);
      const pre = Number(preInput.value);
      const candidate = Math.tanh(pre);
      const oldPart = (1 - z) * hPrev;
      const newPart = z * candidate;
      const h = oldPart + newPart;

      zOut.textContent = "= " + fmt(z);
      rOut.textContent = "= " + fmt(r);
      hOut.textContent = "= " + fmt(hPrev);
      preOut.textContent = "= " + fmt(pre);

      bars.innerHTML = [
        ["z", z, "update"],
        ["r", r, "reset"],
        ["h̃", (candidate + 1) / 2, "candidate"]
      ].map(function (row) {
        return (
          '<div class="bar-row">' +
          "<span>" + row[0] + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          (Math.max(0, Math.min(1, row[1])) * 100).toFixed(1) + '%"></div></div>' +
          '<span class="bar-value">' + row[2] + "</span>" +
          "</div>"
        );
      }).join("");

      candidateOut.textContent = fmt(candidate);
      oldOut.textContent = fmt(oldPart);
      newOut.textContent = fmt(newPart);
      htOut.textContent = fmt(h);

      if (z < 0.3) {
        feedback.className = "feedback info";
        feedback.textContent =
          "A small update gate keeps most of the previous state. The GRU behaves like a slowly changing memory.";
      } else if (z > 0.7) {
        feedback.className = "feedback warn";
        feedback.textContent =
          "A large update gate replaces most of the previous state with the candidate. Old information is quickly overwritten.";
      } else {
        feedback.className = "feedback info";
        feedback.textContent =
          "The new state is a convex blend of the previous state and the candidate. The reset gate controls how much past state enters the candidate.";
      }
    }

    [zInput, rInput, hInput, preInput].forEach(function (input) {
      input.addEventListener("input", update);
    });

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.gruGates = gruGates;
})();
