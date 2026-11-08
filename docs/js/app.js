/* Application bootstrap: navigation, routing, theme, progress. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const content = document.getElementById("content");
  const nav = document.getElementById("chapter-nav");
  const breadcrumb = document.getElementById("breadcrumb");
  const overallPercent = document.getElementById("overall-percent");
  const overallFill = document.getElementById("overall-fill");
  const overallNote = document.getElementById("overall-note");
  const progressBadge = document.getElementById("progress-badge");
  const menuToggle = document.getElementById("menu-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  let currentId = 1;

  function escapeHtml(value) {
    return MS.ui.escapeHtml(value);
  }

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------ */

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☀" : "☾";
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    window.dispatchEvent(new CustomEvent("miniseek:theme"));
  }

  function initTheme() {
    let stored = null;
    try {
      stored = window.localStorage.getItem("miniseek-theme");
    } catch (error) {
      stored = null;
    }
    const preferred =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    applyTheme(stored === "dark" || stored === "light" ? stored : preferred);

    themeToggle.addEventListener("click", function () {
      const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("miniseek-theme", next);
      } catch (error) {
        /* Storage can be unavailable; the theme still changes for this session. */
      }
      applyTheme(next);
    });
  }

  /* ------------------------------------------------------------------------
     Sidebar
     ------------------------------------------------------------------------ */

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    backdrop.hidden = !open;
  }

  function initSidebar() {
    menuToggle.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    backdrop.addEventListener("click", function () {
      setNavOpen(false);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) {
        setNavOpen(false);
      }
    });
  }

  function renderNav() {
    let html = "";

    MS.parts.forEach(function (part) {
      const chapters = MS.chapters.filter(function (chapter) {
        return chapter.part === part;
      });
      if (!chapters.length) {
        return;
      }

      html += '<div class="nav-part">' + escapeHtml(part) + "</div>";
      chapters.forEach(function (chapter) {
        const complete = MS.progress.isComplete(chapter.id);
        html +=
          '<a class="nav-link" href="#/chapter/' + chapter.id + '" data-chapter="' +
          chapter.id + '">' +
          '<span class="nav-number">' + String(chapter.id).padStart(2, "0") + "</span>" +
          "<span>" + escapeHtml(chapter.short) + "</span>" +
          (complete ? '<span class="nav-check" aria-label="Complete">✓</span>' : "") +
          "</a>";
      });
    });

    nav.innerHTML = html;
    updateActiveNav();
  }

  function updateActiveNav() {
    nav.querySelectorAll(".nav-link").forEach(function (link) {
      if (Number(link.dataset.chapter) === currentId) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateProgressUi() {
    const overall = MS.progress.overall();
    overallPercent.textContent = overall.percent + "%";
    overallFill.style.width = overall.percent + "%";
    overallNote.textContent =
      overall.completed + " of " + overall.total + " chapters complete";
    progressBadge.textContent = overall.percent + "% complete";
  }

  /* ------------------------------------------------------------------------
     Chapter rendering
     ------------------------------------------------------------------------ */

  function placeholder(meta) {
    return (
      '<header class="chapter-header">' +
      '<div class="chapter-kicker">' + escapeHtml(meta.part) +
      ' <span class="dot"></span> Chapter ' + meta.id + "</div>" +
      '<h1 class="chapter-title">' + escapeHtml(meta.title) + "</h1>" +
      '<p class="chapter-goal">This chapter belongs to the curriculum, but its interactive content is not written yet.</p>' +
      '<div class="chapter-meta">' +
      '<span class="meta-pill planned">Planned</span>' +
      '<span class="meta-pill">' + meta.hours + " hours</span>" +
      "</div></header>" +
      '<section class="chapter-section"><div class="prose">' +
      "<p>Chapters 1–4 are complete in this first build. The remaining chapters will be added in order, following <code>STUDY_PLAN.md</code>.</p>" +
      '<p><a href="STUDY_PLAN.md">Open the full study plan</a> to read the theory outline, readings, and interactive exercise specifications for this chapter.</p>' +
      "</div></section>"
    );
  }

  function pager(meta) {
    const index = MS.chapters.findIndex(function (chapter) {
      return chapter.id === meta.id;
    });
    const previous = index > 0 ? MS.chapters[index - 1] : null;
    const next = index >= 0 && index < MS.chapters.length - 1 ? MS.chapters[index + 1] : null;

    return (
      '<nav class="pager" aria-label="Chapter navigation">' +
      (previous
        ? '<a class="pager-link prev" href="#/chapter/' + previous.id + '">' +
          '<span class="pager-label">Previous</span>' +
          '<span class="pager-title">' + previous.id + ". " + escapeHtml(previous.short) + "</span></a>"
        : "<span></span>") +
      (next
        ? '<a class="pager-link next" href="#/chapter/' + next.id + '">' +
          '<span class="pager-label">Next</span>' +
          '<span class="pager-title">' + next.id + ". " + escapeHtml(next.short) + "</span></a>"
        : "<span></span>") +
      "</nav>"
    );
  }

  function renderChapter(id) {
    let meta = MS.getChapter(id);
    if (!meta) {
      meta = MS.chapters[0];
      MS.router.navigate(meta.id);
    }

    MS.runCleanups();
    currentId = meta.id;

    document.title = meta.title + " — From Scratch to an LLM";
    breadcrumb.textContent = meta.part + "  ·  Chapter " + meta.id;

    content.innerHTML =
      (typeof meta.render === "function" ? meta.render() : placeholder(meta)) +
      pager(meta);

    if (typeof meta.mount === "function") {
      meta.mount(content);
    }

    MS.math.render(content);
    updateActiveNav();
    window.scrollTo({ top: 0, behavior: "auto" });

    if (window.innerWidth <= 980) {
      setNavOpen(false);
    }
  }

  function handleCompletionClick(event) {
    const button = event.target.closest("[data-complete-toggle]");
    if (!button) {
      return;
    }

    const id = Number(button.dataset.completeToggle);
    const next = !MS.progress.isComplete(id);
    MS.progress.setComplete(id, next);

    const card = content.querySelector('.completion-card[data-completion="' + id + '"]');
    if (card) {
      card.outerHTML = MS.ui.completionCard(id);
    }
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */

  function init() {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/chapter/1");
    }

    initTheme();
    initSidebar();

    MS.progress.onChange(function () {
      renderNav();
      updateProgressUi();
    });

    content.addEventListener("click", handleCompletionClick);

    MS.router.onChange(function (id) {
      renderChapter(id);
    });

    renderNav();
    updateProgressUi();
    renderChapter(MS.router.parse());
  }

  document.addEventListener("DOMContentLoaded", init);
})();
