/* Global namespace + math rendering helpers. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const DELIMITERS = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false }
  ];

  let pendingRoots = [];
  let retryTimer = null;

  function renderNow(root) {
    if (typeof window.renderMathInElement !== "function") {
      return false;
    }

    try {
      window.renderMathInElement(root, {
        delimiters: DELIMITERS,
        throwOnError: false,
        errorColor: "#b42318",
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
      });
      return true;
    } catch (error) {
      console.warn("KaTeX rendering failed:", error);
      return false;
    }
  }

  function render(root) {
    const target = root || document;
    if (renderNow(target)) {
      return;
    }

    if (!pendingRoots.includes(target)) {
      pendingRoots.push(target);
    }

    if (retryTimer) {
      return;
    }

    let attempts = 0;
    retryTimer = window.setInterval(function () {
      attempts += 1;
      if (typeof window.renderMathInElement === "function") {
        window.clearInterval(retryTimer);
        retryTimer = null;
        const roots = pendingRoots;
        pendingRoots = [];
        roots.forEach(renderNow);
        return;
      }

      if (attempts >= 40) {
        window.clearInterval(retryTimer);
        retryTimer = null;
        pendingRoots = [];
      }
    }, 150);
  }

  MS.math = { render: render };
})();
