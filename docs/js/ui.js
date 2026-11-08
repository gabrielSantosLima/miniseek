/* Shared HTML helpers. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function checklist(chapterId, items) {
    const saved = MS.progress.getChecklist(chapterId);
    const rows = items.map(function (item, index) {
      const key = "item-" + (index + 1);
      const checked = saved[key] ? " checked" : "";
      return (
        '<li><label class="checklist-item">' +
        '<input type="checkbox" data-check-key="' + key + '"' + checked + ">" +
        "<span>" + escapeHtml(item) + "</span>" +
        "</label></li>"
      );
    });

    return '<ul class="checklist">' + rows.join("") + "</ul>";
  }

  function bindChecklist(root, chapterId) {
    root.querySelectorAll("input[data-check-key]").forEach(function (input) {
      input.addEventListener("change", function () {
        MS.progress.setChecklist(chapterId, input.dataset.checkKey, input.checked);
      });
    });
  }

  function completionCard(chapterId) {
    const complete = MS.progress.isComplete(chapterId);
    return (
      '<div class="completion-card" data-completion="' + chapterId + '">' +
      "<div>" +
      "<h3>" + (complete ? "Chapter complete" : "Finished this chapter?") + "</h3>" +
      "<p>" +
      (complete
        ? "Your progress is saved in this browser."
        : "Mark it complete once every checklist item is true for you.") +
      "</p></div>" +
      '<button type="button" class="button ' +
      (complete ? "secondary" : "success") +
      '" data-complete-toggle="' + chapterId + '">' +
      (complete ? "Mark as incomplete" : "Mark chapter complete") +
      "</button></div>"
    );
  }

  function readingList(readings) {
    return (
      '<ul class="reading-list">' +
      readings
        .map(function (reading) {
          return (
            "<li>" + escapeHtml(reading.title) +
            '<span class="reading-source">' + escapeHtml(reading.source) + "</span>" +
            "</li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function symbols(rows) {
    return (
      '<dl class="symbol-table">' +
      rows
        .map(function (row) {
          return (
            '<div class="symbol-row"><dt>' + row[0] + "</dt><dd>" + row[1] + "</dd></div>"
          );
        })
        .join("") +
      "</dl>"
    );
  }

  MS.ui = {
    escapeHtml: escapeHtml,
    checklist: checklist,
    bindChecklist: bindChecklist,
    completionCard: completionCard,
    readingList: readingList,
    symbols: symbols
  };

  const cleanups = [];

  MS.registerCleanup = function (fn) {
    if (typeof fn === "function") {
      cleanups.push(fn);
    }
  };

  MS.runCleanups = function () {
    while (cleanups.length) {
      const fn = cleanups.pop();
      try {
        fn();
      } catch (error) {
        console.warn("Cleanup failed:", error);
      }
    }
  };
})();
