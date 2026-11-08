/* Chapter 19: causal language-model windows and label shifting. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  const TOKENS = ["the", "cat", "sat", "on", "the", "mat", "and", "the", "dog"];

  function dataPipeline(container) {
    container.innerHTML =
      '<div class="widget">' +
      '<div class="widget-head"><div>' +
      '<h3 class="widget-title">Build causal LM windows</h3>' +
      '<p class="widget-subtitle">The input is a block of tokens; the target is the same block shifted one position to the left.</p>' +
      "</div>" +
      '<span class="widget-badge">Lab</span></div>' +
      '<div class="widget-controls">' +
      '<div class="control"><label for="dp-t">Context length T</label>' +
      '<select id="dp-t" data-t>' +
      [3, 4, 5, 6].map(function (v) { return '<option value="' + v + '"' + (v === 4 ? " selected" : "") + ">" + v + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="control"><label for="dp-stride">Stride</label>' +
      '<select id="dp-stride" data-stride>' +
      '<option value="t" selected>Non-overlapping (T)</option>' +
      '<option value="1">Sliding (1)</option>' +
      "</select></div></div>" +
      '<div class="config-summary">' +
      '<div class="config-item"><span>corpus tokens</span><strong data-total>—</strong></div>' +
      '<div class="config-item"><span>windows</span><strong data-windows>—</strong></div>' +
      '<div class="config-item"><span>input shape</span><strong data-input>—</strong></div>' +
      '<div class="config-item"><span>target shape</span><strong data-target>—</strong></div>' +
      "</div>" +
      '<table style="margin-top:16px">' +
      '<thead><tr><th>Window</th><th>Input tokens</th><th>Target tokens</th></tr></thead>' +
      '<tbody data-rows></tbody>' +
      "</table>" +
      '<div class="feedback info" data-feedback aria-live="polite"></div>' +
      '<p class="widget-note">The target at position $t$ is the input at position $t+1$. The last token is used as a target but never as the start of a window.</p>' +
      "</div>";

    const tSelect = container.querySelector("[data-t]");
    const strideSelect = container.querySelector("[data-stride]");
    const totalOut = container.querySelector("[data-total]");
    const windowsOut = container.querySelector("[data-windows]");
    const inputOut = container.querySelector("[data-input]");
    const targetOut = container.querySelector("[data-target]");
    const rows = container.querySelector("[data-rows]");
    const feedback = container.querySelector("[data-feedback]");

    function update() {
      const T = Number(tSelect.value);
      const stride = strideSelect.value === "t" ? T : 1;
      const maxStart = TOKENS.length - (T + 1);
      const starts = [];

      for (let start = 0; start <= maxStart; start += stride) {
        starts.push(start);
      }

      totalOut.textContent = String(TOKENS.length);
      windowsOut.textContent = String(starts.length);
      inputOut.textContent = "(" + starts.length + ", " + T + ")";
      targetOut.textContent = "(" + starts.length + ", " + T + ")";

      rows.innerHTML = starts.map(function (start, index) {
        const input = TOKENS.slice(start, start + T).join(" ");
        const target = TOKENS.slice(start + 1, start + T + 1).join(" ");
        return (
          "<tr><td>" + (index + 1) + "</td><td><code>" + input + "</code></td><td><code>" +
          target + "</code></td></tr>"
        );
      }).join("");

      const dropped = TOKENS.length - (starts.length ? starts[starts.length - 1] + T + 1 : 0);
      feedback.className = "feedback info";
      feedback.textContent =
        "Stride " + stride + ": " + starts.length + " window(s). " +
        (dropped > 0
          ? dropped + " token(s) at the end do not have a full target window and are dropped."
          : "Every token participates in at least one target.");
    }

    tSelect.addEventListener("change", update);
    strideSelect.addEventListener("change", update);

    update();
    MS.math.render(container);
  }

  MS.widgets = MS.widgets || {};
  MS.widgets.dataPipeline = dataPipeline;
})();
