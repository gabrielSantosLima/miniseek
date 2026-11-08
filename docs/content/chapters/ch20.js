/* Chapter 20 — Numerical stability for LLM training. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(20);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part VI — Minimal LLM Bridge <span class="dot"></span> Chapter 20</div>
        <h1 class="chapter-title">Numerical Stability for LLM Training</h1>
        <p class="chapter-goal">
          Implement softmax, cross-entropy, and gradient updates without overflow,
          underflow, or silent NaNs.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">4 hours</span>
          <span class="meta-pill">Numerical math</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#float">Floating point</a>
          <a href="#softmax">Stable softmax</a>
          <a href="#loss">Stable cross-entropy</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="float">
        <h2 class="section-title"><span class="section-index">20.1</span> Why logits break naive code</h2>
        <div class="prose">
          <p>
            Floating-point numbers have a finite exponent range. For FP32, values
            above roughly $3.4\\times10^{38}$ become infinity. The exponential
            function grows quickly, so a naive softmax can overflow even when the
            logits themselves are finite numbers the model produced.
          </p>
          <p>
            The opposite failure is underflow: exponentials of very negative numbers
            become zero, and the entire distribution can collapse to zeros. Both
            failures turn a mathematically valid probability into NaN or a useless
            vector.
          </p>
          <p>
            Training amplifies the problem. A single NaN in the loss or gradient can
            propagate through the optimizer and destroy every parameter. Numerical
            stability is therefore not an optimization; it is a correctness
            requirement.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="softmax">
        <h2 class="section-title"><span class="section-index">20.2</span> Stable softmax</h2>
        <div class="prose">
          <p>
            The softmax is invariant to adding the same constant to every logit:
          </p>
          <div class="formula">
            $$\\frac{e^{z_i}}{\\sum_j e^{z_j}}
              =\\frac{e^{z_i-m}}{\\sum_j e^{z_j-m}}.$$
          </div>
          <p>
            Choosing $m=\\max_j z_j$ makes every exponent at most zero, so the
            exponentials lie in $(0,1]$ and cannot overflow. At least one of them is
            exactly $1$, so the denominator is at least one and cannot underflow to
            zero.
          </p>
          <div class="formula">
            $$m=\\max_j z_j,\\qquad
              p_i=\\frac{e^{z_i-m}}{\\sum_j e^{z_j-m}}.$$
          </div>
          ${MS.ui.symbols([
            ["$z_i$", "The logit for class $i$."],
            ["$m$", "The maximum logit, subtracted from every entry."],
            ["$z_i-m$", "A non-positive shifted logit."],
            ["$e^{z_i-m}$", "A stable exponential in $(0,1]$."],
            ["$p_i$", "The resulting probability; unchanged by the shift."]
          ])}
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Same distribution, safer arithmetic</p>
              <p>
                Subtracting the maximum does not change the mathematical softmax. It
                only changes which numbers the computer evaluates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="loss">
        <h2 class="section-title"><span class="section-index">20.3</span> Stable cross-entropy and gradient checks</h2>
        <div class="prose">
          <p>
            The negative log-likelihood of the correct class $c$ can be written
            without ever materializing the probability vector:
          </p>
          <div class="formula">
            $$L=-\\log p_c
              =\\operatorname{logsumexp}(\\mathbf{z})-z_c,$$
            $$\\operatorname{logsumexp}(\\mathbf{z})
              =m+\\log\\sum_j e^{z_j-m}.$$
          </div>
          ${MS.ui.symbols([
            ["$\\operatorname{logsumexp}(\\mathbf{z})$", "A numerically stable way to compute $\\log\\sum_j e^{z_j}$."],
            ["$z_c$", "The logit of the correct class."],
            ["$L$", "The cross-entropy loss for one position."]
          ])}
          <p>
            Many frameworks provide a fused log-softmax plus NLL loss for this reason.
            If you implement it yourself, compute the log-sum-exp, subtract the
            correct logit, and only then exponentiate if you need probabilities.
          </p>
          <p>
            Two more checks catch most instability:
          </p>
          <ul>
            <li><strong>Gradient clipping</strong> — rescale the global gradient when its norm exceeds a threshold.</li>
            <li><strong>NaN/Inf checks</strong> — after the forward loss and after the backward pass, assert that loss and gradients are finite.</li>
          </ul>
          <p>
            Gradient clipping was introduced in Chapter 11; here the point is that it
            belongs in the training loop alongside stable softmax. A finite loss with
            an infinite gradient is still a failed step.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">Do not mask with −Infinity blindly</p>
              <p>
                Large negative masks can create NaNs when a row is fully masked.
                Padding masks and causal masks should leave at least one valid entry
                per row, or the implementation must handle the all-masked case.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">20.4</span> Worked example: 1000-scale logits</h2>
        <div class="prose">
          <p>
            Take logits $(1000,999,998)$ and suppose the correct class is the second
            one. A naive implementation computes $e^{1000}$, which overflows.
          </p>
        </div>

        <div class="worked-example">
          <h3>Rescue the softmax and the loss</h3>
          <p class="example-intro">
            Subtract the maximum before exponentiating, then compute the loss from
            the stable log-sum-exp.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Shift the logits</h4>
              <p>
                $$m=\\max(1000,999,998)=1000,$$
                $$\\mathbf{z}-m=(0,-1,-2).$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Stable exponentials and normalization</h4>
              <p>
                $$e^0=1,\\quad e^{-1}\\approx0.3679,\\quad e^{-2}\\approx0.1353,$$
                $$\\sum\\approx1.5032,$$
                $$\\mathbf{p}\\approx(0.6652,0.2447,0.0900).$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Stable cross-entropy</h4>
              <p>
                The correct class is index 1, with $z_c=999$:
              </p>
              <p>
                $$L=\\log(1.5032)+1000-999
                  \\approx0.4076+1=1.4076.$$
              </p>
              <p>
                The result is identical to the loss for logits $(2,1,0)$, because
                adding a constant to all logits does not change the distribution.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the shifted logits are $(0,-1,-2)$; the stable
            exponentials sum to $1.5032$; the probabilities match the low-logit
            example; and the loss is $\\log(1.5032)+1=1.4076$. The naive route would
            overflow before reaching these values.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">20.5</span> Lab</h2>
        <div data-widget="stability-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">20.6</span> Check your understanding</h2>
        <div data-widget="stability-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">20.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(20, [
          "Explain why naive softmax can overflow.",
          "Write the stable softmax formula.",
          "Write cross-entropy in log-sum-exp form.",
          "Explain what gradient clipping does.",
          "Add NaN/Inf checks to the forward and backward passes."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">20.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 4", source: "Numerical computation and conditioning" },
          { title: "Pascanu, Mikolov & Bengio (2013)", source: "Gradient clipping and recurrent stability" },
          { title: "PyTorch documentation — log-sum-exp and cross-entropy", source: "Reference for fused stable implementations" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(20)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.stabilityLab(root.querySelector('[data-widget="stability-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="stability-quiz"]'), {
      id: "stability",
      chapterId: 20,
      title: "Numerical stability checkpoint",
      subtitle: "Overflow, underflow, and finite gradients.",
      questions: [
        {
          prompt: "Why subtract the maximum logit in softmax?",
          options: [
            "It changes the probabilities",
            "It keeps the exponentials from overflowing",
            "It removes the need for a denominator",
            "It makes the logits integers"
          ],
          answer: 1,
          explanation: "Shifting by the maximum makes every exponent at most zero, so the exponentials are in (0,1]."
        },
        {
          prompt: "Which expression is the stable cross-entropy for class $c$?",
          options: [
            "$\\operatorname{logsumexp}(z)+z_c$",
            "$\\operatorname{logsumexp}(z)-z_c$",
            "$z_c-\\operatorname{logsumexp}(z)$",
            "$\\exp(z_c)$"
          ],
          answer: 1,
          explanation: "The negative log-probability is log-sum-exp of the logits minus the correct logit."
        },
        {
          prompt: "A fully masked attention row can cause:",
          options: ["A NaN", "A larger vocabulary", "A smaller learning rate", "A shorter context"],
          answer: 0,
          explanation: "If every entry is -infinity, the softmax denominator can become zero."
        },
        {
          prompt: "Gradient clipping protects against:",
          options: [
            "Exploding gradient norms",
            "Vanishing gradients",
            "Tokenizer errors",
            "Overfitting"
          ],
          answer: 0,
          explanation: "Clipping rescales the gradient when its norm exceeds a threshold."
        }
      ]
    });

    MS.ui.bindChecklist(root, 20);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[20] = true;
})();
