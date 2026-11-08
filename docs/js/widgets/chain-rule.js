/* Chapter 3: build the chain rule for f(x) = (3x^2 + 1)^4. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function chainRule(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Build the chain rule</h3>' +
      '<p class="widget-subtitle">Differentiate $f(x)=(3x^2+1)^4$ by decomposing it into an outer and an inner function.</p>' +
      "</div>" +
      '<span class="widget-badge">Interactive</span></div>' +
      '<div class="chain-grid">' +
      '<div class="chain-card" data-card="outer">' +
      '<span class="chain-card-label">Outer function</span>' +
      '<select data-select="outer" aria-label="Choose the outer function">' +
      '<option value="">Choose…</option>' +
      '<option value="u^4">u⁴</option>' +
      '<option value="3x^2+1">3x² + 1</option>' +
      '<option value="4u^3">4u³</option>' +
      "</select></div>" +
      '<div class="chain-times" aria-hidden="true">→</div>' +
      '<div class="chain-card" data-card="inner">' +
      '<span class="chain-card-label">Inner function</span>' +
      '<select data-select="inner" aria-label="Choose the inner function">' +
      '<option value="">Choose…</option>' +
      '<option value="3x^2+1">3x² + 1</option>' +
      '<option value="u^4">u⁴</option>' +
      '<option value="6x">6x</option>' +
      "</select></div>" +
      "</div>" +
      '<div class="chain-grid" style="margin-top:12px">' +
      '<div class="chain-card" data-card="outerder">' +
      '<span class="chain-card-label">d/du of the outer function</span>' +
      '<select data-select="outerder" aria-label="Choose the outer derivative">' +
      '<option value="">Choose…</option>' +
      '<option value="u^4">u⁴</option>' +
      '<option value="4u^3">4u³</option>' +
      '<option value="12u^3">12u³</option>' +
      "</select></div>" +
      '<div class="chain-times" aria-hidden="true">×</div>' +
      '<div class="chain-card" data-card="innerder">' +
      '<span class="chain-card-label">d/dx of the inner function</span>' +
      '<select data-select="innerder" aria-label="Choose the inner derivative">' +
      '<option value="">Choose…</option>' +
      '<option value="3x">3x</option>' +
      '<option value="6x">6x</option>' +
      '<option value="6x+1">6x + 1</option>' +
      "</select></div>" +
      "</div>" +
      '<div class="chain-result" data-result>Complete the four choices to assemble the derivative.</div>' +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-check>Check</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">The chain rule multiplies the outer derivative, evaluated at the inner function, by the inner derivative: ' +
      "$\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)$.</p>" +
      "</div>";

    const selects = container.querySelectorAll("[data-select]");
    const result = container.querySelector("[data-result]");
    const feedback = container.querySelector("[data-feedback]");
    const checkButton = container.querySelector("[data-check]");
    const resetButton = container.querySelector("[data-reset]");

    const correct = {
      outer: "u^4",
      inner: "3x^2+1",
      outerder: "4u^3",
      innerder: "6x"
    };

    function values() {
      const out = {};
      selects.forEach(function (select) {
        out[select.dataset.select] = select.value;
      });
      return out;
    }

    function updateResult() {
      const v = values();
      if (v.outerder && v.innerder) {
        const outerPart = v.outerder === "4u^3" ? "4(3x²+1)³" : v.outerder;
        result.textContent =
          "f′(x) = " + outerPart + " · " + v.innerder;
      } else {
        result.textContent = "Complete the four choices to assemble the derivative.";
      }
    }

    selects.forEach(function (select) {
      select.addEventListener("change", function () {
        select.closest(".chain-card").classList.remove("correct", "wrong");
        feedback.className = "feedback";
        feedback.textContent = "";
        updateResult();
      });
    });

    checkButton.addEventListener("click", function () {
      const v = values();
      let score = 0;

      Object.keys(correct).forEach(function (key) {
        const card = container.querySelector('[data-card="' + key + '"]');
        card.classList.remove("correct", "wrong");
        if (v[key] === correct[key]) {
          card.classList.add("correct");
          score += 1;
        } else {
          card.classList.add("wrong");
        }
      });

      updateResult();

      if (score === 4) {
        feedback.className = "feedback ok";
        feedback.textContent =
          "Correct: f′(x) = 4(3x²+1)³ · 6x. The outer derivative is evaluated at the inner function, then multiplied by the inner derivative.";
        result.textContent = "f′(x) = 4(3x²+1)³ · 6x = 24x(3x²+1)³";
      } else {
        feedback.className = "feedback bad";
        feedback.textContent =
          score + " of 4 choices are correct. The outer function is u⁴; its derivative with respect to u is 4u³.";
      }
    });

    resetButton.addEventListener("click", function () {
      selects.forEach(function (select) {
        select.value = "";
        select.closest(".chain-card").classList.remove("correct", "wrong");
      });
      feedback.className = "feedback";
      feedback.textContent = "";
      updateResult();
    });

    updateResult();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.chainRule = chainRule;
})();
