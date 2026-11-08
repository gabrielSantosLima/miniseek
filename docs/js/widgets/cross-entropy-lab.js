/* Chapter 7: cross-entropy and KL divergence. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function softmax(values) {
    const max = Math.max.apply(null, values);
    const exps = values.map(function (value) { return Math.exp(value - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (value) { return value / sum; });
  }

  function fmt(value) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(4)).toString();
  }

  function crossEntropyLab(container) {
    function column(prefix, title, values) {
      return (
        '<div class="ce-column"><h4>' + title + "</h4>" +
        ["A", "B", "C"].map(function (label, index) {
          return (
            '<div class="ce-row">' +
            "<span>" + label + "</span>" +
            '<input type="range" data-' + prefix + '="' + index + '" min="-3" max="3" step="0.1" value="' + values[index] + '" aria-label="' + title + ' ' + label + '">' +
            '<output data-' + prefix + '-out="' + index + '"></output>' +
            "</div>"
          );
        }).join("") +
        "</div>"
      );
    }

    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Cross-entropy and KL divergence</h3>' +
      '<p class="widget-subtitle">$p$ is the true distribution; $q$ is the model. Cross-entropy penalizes probability assigned to the wrong classes.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="ce-grid">' +
      column("p", "True distribution p", [2, 0.5, -1]) +
      column("q", "Model distribution q", [1.5, 0, -0.5]) +
      "</div>" +
      '<div class="info-grid" style="margin-top:14px">' +
      '<div class="info-card"><span class="info-card-label">H(p)</span><span class="info-card-value" data-hp>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">H(p,q)</span><span class="info-card-value" data-ce>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">D_KL(p‖q)</span><span class="info-card-value" data-kl>—</span></div>' +
      '<div class="info-card"><span class="info-card-label">best possible CE</span><span class="info-card-value" data-best>—</span></div>' +
      "</div>" +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-match>Set q = p</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback info" data-feedback>When p is fixed, minimizing cross-entropy is the same as minimizing KL divergence.</div>' +
      '<p class="widget-note">$H(p,q)=-\\sum_i p_i\\log q_i$ and ' +
      "$D_{KL}(p\\|q)=H(p,q)-H(p)$.</p>" +
      "</div>";

    const pInputs = [0, 1, 2].map(function (index) {
      return container.querySelector('[data-p="' + index + '"]');
    });
    const qInputs = [0, 1, 2].map(function (index) {
      return container.querySelector('[data-q="' + index + '"]');
    });
    const pOutputs = [0, 1, 2].map(function (index) {
      return container.querySelector('[data-p-out="' + index + '"]');
    });
    const qOutputs = [0, 1, 2].map(function (index) {
      return container.querySelector('[data-q-out="' + index + '"]');
    });
    const hpOut = container.querySelector("[data-hp]");
    const ceOut = container.querySelector("[data-ce]");
    const klOut = container.querySelector("[data-kl]");
    const bestOut = container.querySelector("[data-best]");
    const matchButton = container.querySelector("[data-match]");
    const resetButton = container.querySelector("[data-reset]");

    function values(inputs) {
      return inputs.map(function (input) { return Number(input.value); });
    }

    function update() {
      const pLogits = values(pInputs);
      const qLogits = values(qInputs);
      const p = softmax(pLogits);
      const q = softmax(qLogits);

      let hp = 0;
      let ce = 0;
      let kl = 0;
      for (let i = 0; i < p.length; i += 1) {
        if (p[i] > 0) {
          hp -= p[i] * Math.log(p[i]);
          ce -= p[i] * Math.log(Math.max(q[i], 1e-12));
          kl += p[i] * Math.log(Math.max(p[i] / Math.max(q[i], 1e-12), 1e-12));
        }
      }

      p.forEach(function (value, index) {
        pOutputs[index].textContent = fmt(value);
      });
      q.forEach(function (value, index) {
        qOutputs[index].textContent = fmt(value);
      });

      hpOut.textContent = fmt(hp);
      ceOut.textContent = fmt(ce);
      klOut.textContent = fmt(kl);
      bestOut.textContent = fmt(hp);
    }

    pInputs.forEach(function (input) { input.addEventListener("input", update); });
    qInputs.forEach(function (input) { input.addEventListener("input", update); });

    matchButton.addEventListener("click", function () {
      pInputs.forEach(function (input, index) {
        qInputs[index].value = input.value;
      });
      update();
    });

    resetButton.addEventListener("click", function () {
      [2, 0.5, -1].forEach(function (value, index) {
        pInputs[index].value = value;
      });
      [1.5, 0, -0.5].forEach(function (value, index) {
        qInputs[index].value = value;
      });
      update();
    });

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.crossEntropyLab = crossEntropyLab;
})();
