/* Chapter 1: order the LLM pipeline. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const STAGES = [
    "Tokenizer",
    "Embeddings",
    "Transformer blocks",
    "Final linear layer",
    "Softmax"
  ];

  const SHUFFLED = [
    "Softmax",
    "Embeddings",
    "Final linear layer",
    "Tokenizer",
    "Transformer blocks"
  ];

  const DETAILS = {
    Tokenizer: "Turns text into integer token IDs.",
    Embeddings: "Maps token IDs to learned vectors.",
    "Transformer blocks": "Mix information across positions with attention and feed-forward layers.",
    "Final linear layer": "Projects the hidden state to one logit per vocabulary item.",
    Softmax: "Turns logits into a probability distribution over the next token."
  };

  function pipeline(container) {
    let selected = [];
    let checked = false;

    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Order the LLM pipeline</h3>' +
      '<p class="widget-subtitle">Click the stages in the order information flows from raw text to a next-token probability.</p>' +
      "</div>" +
      '<span class="widget-badge">Interactive</span></div>' +
      '<div class="pipeline">' +
      '<ol class="pipeline-slots" data-slots></ol>' +
      '<div class="pipeline-pool" data-pool></div>' +
      '<div class="widget-actions">' +
      '<button type="button" class="button" data-check>Check order</button>' +
      '<button type="button" class="button ghost" data-reset>Reset</button>' +
      "</div>" +
      '<div class="feedback" data-feedback aria-live="polite"></div>' +
      "</div></div>";

    const slots = container.querySelector("[data-slots]");
    const pool = container.querySelector("[data-pool]");
    const feedback = container.querySelector("[data-feedback]");
    const checkButton = container.querySelector("[data-check]");
    const resetButton = container.querySelector("[data-reset]");

    function render() {
      slots.innerHTML = STAGES.map(function (_, index) {
        const stage = selected[index];
        const classes = ["pipeline-slot"];
        if (stage) {
          classes.push("filled");
        }
        if (checked && stage) {
          classes.push(stage === STAGES[index] ? "correct" : "wrong");
        }

        return (
          '<li class="' + classes.join(" ") + '">' +
          '<span class="slot-index">' + (index + 1) + "</span>" +
          '<span class="slot-text">' + (stage || "Choose a stage") + "</span>" +
          (stage
            ? '<button type="button" class="slot-remove" data-remove="' + index +
              '" aria-label="Remove ' + stage + '">×</button>'
            : "") +
          "</li>"
        );
      }).join("");

      pool.innerHTML = SHUFFLED.map(function (stage) {
        const used = selected.indexOf(stage) !== -1;
        return (
          '<button type="button" class="pipeline-chip' + (used ? " used" : "") +
          '" data-add="' + stage + '"' + (used ? " disabled" : "") + ">" +
          stage + "</button>"
        );
      }).join("");
    }

    function clearFeedback() {
      feedback.className = "feedback";
      feedback.textContent = "";
    }

    pool.addEventListener("click", function (event) {
      const button = event.target.closest("[data-add]");
      if (!button) return;
      const stage = button.dataset.add;
      if (selected.length >= STAGES.length || selected.includes(stage)) return;
      selected.push(stage);
      checked = false;
      clearFeedback();
      render();
    });

    slots.addEventListener("click", function (event) {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      selected.splice(Number(button.dataset.remove), 1);
      checked = false;
      clearFeedback();
      render();
    });

    checkButton.addEventListener("click", function () {
      if (selected.length !== STAGES.length) {
        feedback.className = "feedback info";
        feedback.textContent = "Fill all five slots first.";
        return;
      }

      checked = true;
      render();
      const correct = selected.filter(function (stage, index) {
        return stage === STAGES[index];
      }).length;

      if (correct === STAGES.length) {
        feedback.className = "feedback ok";
        feedback.textContent =
          "Correct. Text → token IDs → vectors → contextual representations → logits → next-token probabilities.";
      } else {
        feedback.className = "feedback bad";
        feedback.textContent =
          correct + " of " + STAGES.length + " positions are correct. " +
          "Remember: tokens must become IDs before they can be embedded.";
      }
    });

    resetButton.addEventListener("click", function () {
      selected = [];
      checked = false;
      clearFeedback();
      render();
    });

    // Show the detail of a chosen stage when hovering, without hiding the exercise.
    slots.addEventListener("mouseover", function (event) {
      const item = event.target.closest(".pipeline-slot.filled");
      if (!item) return;
      const name = item.querySelector(".slot-text");
      if (name && DETAILS[name.textContent]) {
        item.title = DETAILS[name.textContent];
      }
    });

    render();
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.pipeline = pipeline;
})();
