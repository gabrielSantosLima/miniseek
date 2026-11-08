/* Chapter 9: step through forward and reverse passes on a scalar graph. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(3)).toString();
  }

  function backpropGraph(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Backpropagation, node by node</h3>' +
      '<p class="widget-subtitle">$L=(wx+b-y)^2$. Walk the reverse pass and multiply local derivatives.</p>' +
      "</div>" +
      '<span class="widget-badge">Step-through</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control grow"><label for="bp-w">w <output data-w-out></output></label>' +
      '<input id="bp-w" type="range" data-w min="-3" max="3" step="0.1" value="2">' +
      "</div>" +
      '<div class="control grow"><label for="bp-x">x <output data-x-out></output></label>' +
      '<input id="bp-x" type="range" data-x min="-3" max="3" step="0.1" value="3">' +
      "</div>" +
      '<div class="control grow"><label for="bp-b">b <output data-b-out></output></label>' +
      '<input id="bp-b" type="range" data-b min="-3" max="3" step="0.1" value="1">' +
      "</div>" +
      '<div class="control grow"><label for="bp-y">target y <output data-y-out></output></label>' +
      '<input id="bp-y" type="range" data-y min="-5" max="12" step="0.1" value="10">' +
      "</div></div>" +
      '<div class="bp-flow" data-flow></div>' +
      '<div class="info-grid">' +
      '<div class="info-card"><span class="info-card-label">loss L</span><span class="info-card-value" data-loss>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">dL/dw</span><span class="info-card-value" data-dw>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">dL/db</span><span class="info-card-value" data-db>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">reverse steps</span><span class="info-card-value" data-step>0 / 4</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-next>Next reverse step</button>' +
      '<button type="button" class="button secondary" data-all>Reveal all</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback info" data-feedback aria-live="polite">Forward pass first: compute and cache every intermediate value. Then reverse.</div>' +
      "</div>";

    const inputs = {
      w: container.querySelector("[data-w]"),
      x: container.querySelector("[data-x]"),
      b: container.querySelector("[data-b]"),
      y: container.querySelector("[data-y]")
    };
    const outputs = {
      w: container.querySelector("[data-w-out]"),
      x: container.querySelector("[data-x-out]"),
      b: container.querySelector("[data-b-out]"),
      y: container.querySelector("[data-y-out]")
    };
    const flow = container.querySelector("[data-flow]");
    const lossOut = container.querySelector("[data-loss]");
    const dwOut = container.querySelector("[data-dw]");
    const dbOut = container.querySelector("[data-db]");
    const stepOut = container.querySelector("[data-step]");
    const feedback = container.querySelector("[data-feedback]");
    const nextButton = container.querySelector("[data-next]");
    const allButton = container.querySelector("[data-all]");
    const resetButton = container.querySelector("[data-reset]");

    const labels = ["L", "e", "z", "w", "b"];
    let revealed = 0;

    function read() {
      return {
        w: Number(inputs.w.value),
        x: Number(inputs.x.value),
        b: Number(inputs.b.value),
        y: Number(inputs.y.value)
      };
    }

    function values() {
      const v = read();
      const z = v.w * v.x + v.b;
      const e = z - v.y;
      const L = e * e;
      return {
        w: v.w,
        x: v.x,
        b: v.b,
        y: v.y,
        z: z,
        e: e,
        L: L,
        dzDw: v.x,
        dzDb: 1,
        deDz: 1,
        dLDe: 2 * e,
        dLDz: 2 * e,
        dLDw: 2 * e * v.x,
        dLDb: 2 * e
      };
    }

    function node(label, subtitle, value, local, gradient, visible) {
      return (
        '<div class="bp-node ' + (visible ? "revealed" : "") + '">' +
        '<span class="bp-label">' + label + "</span>" +
        '<span class="bp-sub">' + subtitle + "</span>" +
        '<span class="bp-value">' + value + "</span>" +
        (visible && local ? '<span class="bp-local">local: ' + local + "</span>" : "") +
        (visible && gradient ? '<span class="bp-grad">∂L: ' + gradient + "</span>" : "") +
        "</div>"
      );
    }

    function update() {
      const v = values();
      Object.keys(inputs).forEach(function (key) {
        outputs[key].textContent = "= " + fmt(Number(inputs[key].value));
      });

      lossOut.textContent = fmt(v.L);
      dwOut.textContent = revealed >= 4 ? fmt(v.dLDw) : "—";
      dbOut.textContent = revealed >= 4 ? fmt(v.dLDb) : "—";
      stepOut.textContent = revealed + " / 4";

      flow.innerHTML =
        '<div class="bp-node revealed">' +
        '<span class="bp-label">forward</span>' +
        '<span class="bp-sub">z = wx + b</span>' +
        '<span class="bp-value">' + fmt(v.z) + "</span></div>" +
        '<div class="bp-node revealed">' +
        '<span class="bp-label">forward</span>' +
        '<span class="bp-sub">e = z − y</span>' +
        '<span class="bp-value">' + fmt(v.e) + "</span></div>" +
        '<div class="bp-node revealed">' +
        '<span class="bp-label">forward</span>' +
        '<span class="bp-sub">L = e²</span>' +
        '<span class="bp-value">' + fmt(v.L) + "</span></div>" +
        node("reverse 1", "dL/dL", "1", "—", "1", revealed >= 1) +
        node("reverse 2", "dL/de = 2e", fmt(v.dLDe), "2e = " + fmt(v.dLDe), fmt(v.dLDe), revealed >= 2) +
        node("reverse 3", "dL/dz = dL/de · 1", fmt(v.dLDz), "1", fmt(v.dLDz), revealed >= 3) +
        node("reverse 4", "dL/dw = dL/dz · x", fmt(v.dLDw), "x = " + fmt(v.dzDw), fmt(v.dLDw), revealed >= 4) +
        node("reverse 5", "dL/db = dL/dz · 1", fmt(v.dLDb), "1", fmt(v.dLDb), revealed >= 4);

      MS.math.render(container);
    }

    function setRevealed(value) {
      revealed = Math.max(0, Math.min(4, value));
      if (revealed === 0) {
        feedback.className = "feedback info";
        feedback.textContent = "Forward pass first: compute and cache every intermediate value. Then reverse.";
      } else if (revealed === 4) {
        feedback.className = "feedback ok";
        feedback.textContent =
          "Backward pass complete: dL/dw = " + fmt(values().dLDw) +
          " and dL/db = " + fmt(values().dLDb) + ".";
      } else {
        feedback.className = "feedback info";
        feedback.textContent = "Revealed " + revealed + " of 4 reverse steps. Keep multiplying local derivatives.";
      }
      update();
    }

    Object.values(inputs).forEach(function (input) {
      input.addEventListener("input", function () {
        revealed = 0;
        feedback.className = "feedback info";
        feedback.textContent = "Inputs changed. The forward values update; the reverse pass resets.";
        update();
      });
    });

    nextButton.addEventListener("click", function () {
      setRevealed(revealed + 1);
    });

    allButton.addEventListener("click", function () {
      setRevealed(4);
    });

    resetButton.addEventListener("click", function () {
      inputs.w.value = 2;
      inputs.x.value = 3;
      inputs.b.value = 1;
      inputs.y.value = 10;
      setRevealed(0);
    });

    setRevealed(0);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.backpropGraph = backpropGraph;
})();
