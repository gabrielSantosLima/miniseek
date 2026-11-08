/* Reusable multiple-choice quiz. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function optionHtml(quizId, questionIndex, optionIndex, text) {
    const name = ("quiz-" + quizId + "-" + questionIndex).replace(/[^a-zA-Z0-9_-]/g, "_");
    return (
      '<label class="quiz-option" data-option-index="' + optionIndex + '">' +
      '<input type="radio" name="' + name + '" ' +
      'data-question="' + questionIndex + '" data-option="' + optionIndex + '">' +
      "<span>" + text + "</span></label>"
    );
  }

  function createQuiz(container, config) {
    const questions = config.questions || [];
    const quizId = config.id;
    const chapterId = config.chapterId;

    const questionHtml = questions
      .map(function (question, index) {
        const promptId = "quiz-" + quizId + "-prompt-" + index;
        return (
          '<div class="quiz-question" data-question-index="' + index +
          '" role="group" aria-labelledby="' + promptId + '">' +
          '<p class="quiz-prompt" id="' + promptId + '">' +
          '<span class="sr-only">Question ' + (index + 1) + ".</span> " +
          question.prompt +
          "</p>" +
          '<div class="quiz-options">' +
          question.options
            .map(function (option, optionIndex) {
              return optionHtml(quizId, index, optionIndex, option);
            })
            .join("") +
          "</div>" +
          '<div class="quiz-explanation" data-explanation="' + index + '"></div>' +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">' + (config.title || "Check your understanding") + "</h3>" +
      '<p class="widget-subtitle">' + (config.subtitle || "Choose one answer per question.") + "</p>" +
      "</div>" +
      '<span class="widget-badge">Quiz</span></div>' +
      '<form class="quiz" novalidate>' +
      questionHtml +
      '<div class="widget-actions">' +
      '<button type="submit" class="button">Check answers</button>' +
      '<button type="button" class="button ghost" data-quiz-reset>Try again</button>' +
      "</div>" +
      '<div class="quiz-result" aria-live="polite"></div>' +
      "</form>" +
      "</div>";

    const form = container.querySelector("form");
    const result = container.querySelector(".quiz-result");
    const resetButton = container.querySelector("[data-quiz-reset]");

    MS.math.render(container);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      let score = 0;
      questions.forEach(function (question, index) {
        const questionEl = form.querySelector('[data-question-index="' + index + '"]');
        const options = questionEl.querySelectorAll(".quiz-option");
        const explanation = questionEl.querySelector('[data-explanation="' + index + '"]');
        const selected = form.querySelector(
          'input[data-question="' + index + '"]:checked'
        );

        options.forEach(function (option) {
          option.classList.remove("correct", "wrong");
        });

        options.forEach(function (option, optionIndex) {
          if (optionIndex === question.answer) {
            option.classList.add("correct");
          }
        });

        if (selected) {
          const selectedIndex = Number(selected.dataset.option);
          if (selectedIndex === question.answer) {
            score += 1;
          } else {
            options[selectedIndex].classList.add("wrong");
          }
        }

        explanation.innerHTML =
          (selected ? "" : "<strong>No answer selected.</strong> ") +
          (question.explanation || "");
      });

      form.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.disabled = true;
      });

      result.textContent = "Score: " + score + " / " + questions.length;
      if (score === questions.length) {
        result.textContent += " — perfect.";
      } else if (score >= questions.length * 0.7) {
        result.textContent += " — solid, review the explanations you missed.";
      } else {
        result.textContent += " — revisit the theory before moving on.";
      }

      MS.progress.setQuizScore(chapterId, quizId, {
        score: score,
        total: questions.length,
        at: new Date().toISOString()
      });

      MS.math.render(container);
    });

    resetButton.addEventListener("click", function () {
      form.reset();
      form.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.disabled = false;
      });
      form.querySelectorAll(".quiz-option").forEach(function (option) {
        option.classList.remove("correct", "wrong");
      });
      form.querySelectorAll(".quiz-explanation").forEach(function (explanation) {
        explanation.innerHTML = "";
      });
      result.textContent = "";
    });
  }

  MS.createQuiz = createQuiz;
})();
