/* Chapter 3 — Differentiation rules and the chain rule. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(3);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 3</div>
        <h1 class="chapter-title">Differentiation Rules and the Chain Rule</h1>
        <p class="chapter-goal">
          Become fluent with the rules that make differentiation mechanical, and
          internalize the chain rule as composition of sensitivities.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">12 hours</span>
          <span class="meta-pill">Stewart §3.1–3.6, §3.8–3.9</span>
          <span class="meta-pill">2 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#rules">Core rules</a>
          <a href="#chain">The chain rule</a>
          <a href="#activations">Activation derivatives</a>
          <a href="#labs">Labs</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="rules">
        <h2 class="section-title"><span class="section-index">3.1</span> Core rules</h2>
        <div class="prose">
          <p>
            Differentiation is local and compositional. Once the following rules
            are automatic, most derivatives in deep learning become bookkeeping:
          </p>
          <div class="formula">
            $$\\frac{d}{dx}x^n=nx^{n-1},\\qquad
              (fg)'=f'g+fg',\\qquad
              \\left(\\frac{f}{g}\\right)'=\\frac{f'g-fg'}{g^2}$$
          </div>
          <div class="formula">
            $$\\frac{d}{dx}e^x=e^x,\\qquad
              \\frac{d}{dx}\\ln x=\\frac{1}{x},\\qquad
              \\frac{d}{dx}\\sin x=\\cos x$$
          </div>
          <p>
            The product rule and quotient rule are useful, but the rule that powers
            neural networks is the chain rule. Backpropagation is not a different
            algorithm; it is the chain rule applied efficiently to a computation
            graph.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Higher derivatives</p>
              <p>
                The second derivative measures how the slope itself changes. In
                optimization, it distinguishes a minimum from a maximum and controls
                curvature.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="chain">
        <h2 class="section-title"><span class="section-index">3.2</span> The chain rule</h2>
        <div class="prose">
          <p>
            If $y=f(u)$ and $u=g(x)$, then a small change in $x$ changes $u$, and
            that change in $u$ changes $y$. The sensitivities multiply:
          </p>
          <div class="formula">
            $$\\frac{dy}{dx}=\\frac{dy}{du}\\cdot\\frac{du}{dx}$$
          </div>
          <p>
            In function notation:
          </p>
          <div class="formula">
            $$\\frac{d}{dx}f(g(x))=f'(g(x))\\,g'(x)$$
          </div>
          <p>
            The outer derivative is evaluated at the inner function, not at $x$.
            This point is the source of many backpropagation bugs.
          </p>
          <p>
            For a deeper composition $f(g(h(x)))$, the same idea repeats:
          </p>
          <div class="formula">
            $$\\frac{d}{dx}f(g(h(x)))
              =f'(g(h(x)))\\,g'(h(x))\\,h'(x)$$
          </div>
          <p>
            Reverse-mode automatic differentiation computes exactly these products
            from the outside in, caching intermediate values so that no factor is
            recomputed.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="activations">
        <h2 class="section-title"><span class="section-index">3.3</span> Activation derivatives</h2>
        <div class="prose">
          <p>
            The derivative of an activation controls whether gradients flow. Three
            results are worth memorizing:
          </p>
          <div class="formula">
            $$\\sigma'(z)=\\sigma(z)(1-\\sigma(z))$$
            $$\\tanh'(z)=1-\\tanh^2(z)$$
            $$\\operatorname{ReLU}'(z)=\\begin{cases}1,&z>0\\\\0,&z<0\\end{cases}$$
          </div>
          <p>
            The sigmoid and tanh derivatives approach zero when their inputs are
            large in magnitude. That saturation is the first explanation of the
            vanishing-gradient problem you will meet again with RNNs.
          </p>
          <p>
            ReLU avoids saturation for positive inputs, but its gradient is zero for
            all negative inputs, which can produce “dead” units.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">3.4</span> Labs</h2>
        <div data-widget="chain-rule"></div>
        <div data-widget="activation-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">3.5</span> Check your understanding</h2>
        <div data-widget="chain-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">3.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(3, [
          "Differentiate every elementary function in the chapter without a table.",
          "Apply the chain rule to a three-level composition.",
          "Derive the sigmoid and tanh derivatives.",
          "Explain why a saturating activation produces a small gradient.",
          "Explain the chain rule as a product of local sensitivities."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">3.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Stewart, Calculus — Chapter 3", source: "§3.1–3.6 differentiation rules; §3.8–3.9 exponential, logarithmic, and related rates" },
          { title: "Parr & Howard, The Matrix Calculus You Need For Deep Learning — §2–3", source: "Read after the scalar chain rule is solid" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(3)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.chainRule(root.querySelector('[data-widget="chain-rule"]'));
    MS.widgets.activationLab(root.querySelector('[data-widget="activation-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="chain-quiz"]'), {
      id: "chain-rule",
      chapterId: 3,
      title: "Differentiation checkpoint",
      subtitle: "No calculator required; the point is the rule, not arithmetic.",
      questions: [
        {
          prompt: "Differentiate $f(x)=(3x^2+1)^4$.",
          options: [
            "$4(3x^2+1)^3$",
            "$24x(3x^2+1)^3$",
            "$12x(3x^2+1)^4$",
            "$6x(3x^2+1)^3$"
          ],
          answer: 1,
          explanation: "Outer derivative $4u^3$ times inner derivative $6x$, with $u=3x^2+1$, gives $24x(3x^2+1)^3$."
        },
        {
          prompt: "What is $\\frac{d}{dx}\\ln(2x+1)$?",
          options: ["$\\frac{1}{2x+1}$", "$\\frac{2}{2x+1}$", "$\\ln 2$", "$2\\ln(2x+1)$"],
          answer: 1,
          explanation: "The outer derivative is $1/u$ and the inner derivative is $2$, so the result is $2/(2x+1)$."
        },
        {
          prompt: "Which activation has derivative $\\sigma(z)(1-\\sigma(z))$?",
          options: ["ReLU", "Tanh", "Sigmoid", "Linear"],
          answer: 2,
          explanation: "That is the derivative of the logistic sigmoid, and it is at most $1/4$."
        },
        {
          prompt: "Why does a saturating activation produce a small gradient?",
          options: [
            "Its output is always zero.",
            "Its slope approaches zero at the extremes.",
            "It is not differentiable.",
            "It uses the chain rule incorrectly."
          ],
          answer: 1,
          explanation: "Saturation means the curve flattens, so the local derivative — the factor propagated backward — becomes tiny."
        },
        {
          prompt: "For $h(x)=f(g(x))$, which expression is correct?",
          options: [
            "$h'(x)=f'(x)g'(x)$",
            "$h'(x)=f'(g(x))g'(x)$",
            "$h'(x)=f(g'(x))$",
            "$h'(x)=f'(g'(x))$"
          ],
          answer: 1,
          explanation: "The outer derivative is evaluated at $g(x)$, then multiplied by the inner derivative."
        }
      ]
    });

    MS.ui.bindChecklist(root, 3);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[3] = true;
})();
