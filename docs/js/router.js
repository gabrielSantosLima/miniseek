/* Hash-based chapter router. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  function parse() {
    const match = window.location.hash.match(/^#\/chapter\/(\d+)/);
    if (!match) {
      return 1;
    }
    return Number(match[1]);
  }

  function navigate(id) {
    window.location.hash = "#/chapter/" + id;
  }

  function onChange(callback) {
    window.addEventListener("hashchange", function () {
      callback(parse());
    });
  }

  MS.router = {
    parse: parse,
    navigate: navigate,
    onChange: onChange
  };
})();
