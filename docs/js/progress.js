/* Local progress storage. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const STORAGE_KEY = "miniseek-progress-v1";
  const listeners = new Set();

  const empty = {
    complete: {},
    checklists: {},
    quizzes: {}
  };

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return structuredClone(empty);
      }
      const parsed = JSON.parse(raw);
      return {
        complete: parsed.complete || {},
        checklists: parsed.checklists || {},
        quizzes: parsed.quizzes || {}
      };
    } catch (error) {
      console.warn("Could not read progress:", error);
      return structuredClone(empty);
    }
  }

  let state = load();

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save progress:", error);
    }
    listeners.forEach(function (listener) {
      try {
        listener(state);
      } catch (error) {
        console.warn("Progress listener failed:", error);
      }
    });
  }

  function onChange(listener) {
    listeners.add(listener);
    return function () {
      listeners.delete(listener);
    };
  }

  function isComplete(chapterId) {
    return Boolean(state.complete[String(chapterId)]);
  }

  function setComplete(chapterId, value) {
    const key = String(chapterId);
    if (value) {
      state.complete[key] = true;
    } else {
      delete state.complete[key];
    }
    save();
  }

  function getChecklist(chapterId) {
    return state.checklists[String(chapterId)] || {};
  }

  function setChecklist(chapterId, itemKey, value) {
    const chapterKey = String(chapterId);
    const chapter = state.checklists[chapterKey] || {};
    if (value) {
      chapter[itemKey] = true;
    } else {
      delete chapter[itemKey];
    }
    state.checklists[chapterKey] = chapter;
    save();
  }

  function getQuizScore(chapterId, quizId) {
    const chapter = state.quizzes[String(chapterId)] || {};
    return chapter[quizId] || null;
  }

  function setQuizScore(chapterId, quizId, score) {
    const chapterKey = String(chapterId);
    const chapter = state.quizzes[chapterKey] || {};
    chapter[quizId] = score;
    state.quizzes[chapterKey] = chapter;
    save();
  }

  function overall() {
    const total = (MS.chapters || []).length || 18;
    let completed = 0;
    (MS.chapters || []).forEach(function (chapter) {
      if (isComplete(chapter.id)) {
        completed += 1;
      }
    });
    return {
      total: total,
      completed: completed,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  }

  function reset() {
    state = structuredClone(empty);
    save();
  }

  MS.progress = {
    isComplete: isComplete,
    setComplete: setComplete,
    getChecklist: getChecklist,
    setChecklist: setChecklist,
    getQuizScore: getQuizScore,
    setQuizScore: setQuizScore,
    overall: overall,
    onChange: onChange,
    reset: reset
  };
})();
