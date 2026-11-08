/* Chapter 4 — One-variable optimization. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(4);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 4</div>
        <h1 class="chapter-title">Optimization in One Variable</h1>
        <p class="chapter-goal">
          Understand how derivatives locate extrema and how iterative descent finds
          minima — including the ways it fails.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">10 hours</span>
          <span class="meta-pill">Stewart §4.1–4.4, §4.7–4.8</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#extrema">Extrema</a>
          <a href="#newton">Newton's method</a>
          <a href="#descent">Gradient descent</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="extrema">
        <h2 class="section-title"><span class="section-index">4.1</span> Extrema and derivative tests</h2>
        <div class="prose">
          <p>
            A point $c$ is a <strong>critical point</strong> of $f$ when $f'(c)=0$
            or $f'(c)$ does not exist. Critical points are the only interior
            candidates for a local maximum or minimum, but not every critical point
            is an extremum.
          </p>
          <p>
            The first-derivative test asks how the sign of $f'$ changes at $c$:
          </p>
          <ul>
            <li>$f'$ changes from positive to negative: local maximum.</li>
            <li>$f'$ changes from negative to positive: local minimum.</li>
            <li>$f'$ does not change sign: neither (a saddle or flat inflection).</li>
          </ul>
          <p>
            The second-derivative test uses curvature:
          </p>
          <div class="formula">
            $$f'(c)=0,\\quad f''(c)>0\\;\\Rightarrow\\;\\text{local minimum}$$
            $$f'(c)=0,\\quad f''(c)<0\\;\\Rightarrow\\;\\text{local maximum}$$
            $$f'(c)=0,\\quad f''(c)=0\\;\\Rightarrow\\;\\text{test is inconclusive}$$
          </div>
          <p>
            On a closed interval, also evaluate the endpoints. A global extremum can
            occur at a boundary even when the derivative there is not zero.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">Critical point ≠ minimum</p>
              <p>
                The function $x^3$ has $f'(0)=0$, but $0$ is neither a maximum nor a
                minimum. This is the one-dimensional version of a saddle point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="newton">
        <h2 class="section-title"><span class="section-index">4.2</span> Newton's method</h2>
        <div class="prose">
          <p>
            Newton's method finds roots by repeatedly replacing the function with its
            tangent line:
          </p>
          <div class="formula">
            $$x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}$$
          </div>
          <p>
            It converges very quickly near a simple root, but it can diverge or cycle
            when the initial guess is far away or the derivative is small. The same
            structure — use local slope to choose a step — reappears in second-order
            optimization methods.
          </p>
          <p>
            To find a minimum of $f$, apply Newton's method to $f'$:
          </p>
          <div class="formula">
            $$x_{n+1}=x_n-\\frac{f'(x_n)}{f''(x_n)}$$
          </div>
        </div>
      </section>

      <section class="chapter-section" id="descent">
        <h2 class="section-title"><span class="section-index">4.3</span> Gradient descent</h2>
        <div class="prose">
          <p>
            Gradient descent takes a step opposite the derivative:
          </p>
          <div class="formula">
            $$x_{k+1}=x_k-\\eta f'(x_k)$$
            <div class="formula-caption">$\\eta>0$ is the learning rate.</div>
          </div>
          <p>
            If $f'(x_k)>0$, the function increases to the right, so the update moves
            left. If $f'(x_k)<0$, it moves right. At a minimum, the derivative is
            zero and the update stops.
          </p>
          <p>
            The learning rate controls the step size:
          </p>
          <ul>
            <li><strong>Too small:</strong> convergence is slow and may look like a plateau.</li>
            <li><strong>Too large:</strong> the iterates overshoot, oscillate, or diverge.</li>
            <li><strong>Just right:</strong> the sequence approaches a stationary point efficiently.</li>
          </ul>
          <p>
            In more than one dimension, the derivative becomes the gradient and the
            same update is written $\\theta_{k+1}=\\theta_k-\\eta\\nabla L(\\theta_k)$.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Local, not global</p>
              <p>
                Gradient descent follows local slope. On a non-convex function it can
                settle in a local minimum or a saddle. The lab below shows both.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">4.4</span> Lab</h2>
        <div data-widget="gradient-descent"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">4.5</span> Check your understanding</h2>
        <div data-widget="optimization-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">4.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(4, [
          "Find all critical points and classify them.",
          "State the second-derivative test and its limitations.",
          "Derive the gradient-descent update for a quadratic loss.",
          "Explain divergence caused by a too-large learning rate.",
          "Use Newton's method and explain when it fails."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">4.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Stewart, Calculus — Chapter 4", source: "§4.1–4.4 extrema and derivative tests; §4.7–4.8 optimization and Newton's method" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — §4.3", source: "The loss-surface perspective on optimization" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(4)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.gradientDescent(root.querySelector('[data-widget="gradient-descent"]'));

    MS.createQuiz(root.querySelector('[data-widget="optimization-quiz"]'), {
      id: "optimization",
      chapterId: 4,
      title: "Optimization checkpoint",
      subtitle: "Reason about signs and curvature, not just the final number.",
      questions: [
        {
          prompt: "For $f(x)=x^3$, what is the critical point at $x=0$?",
          options: ["Local minimum", "Local maximum", "Neither", "Discontinuity"],
          answer: 2,
          explanation: "$f'(x)=3x^2$ is zero at $0$, but it does not change sign, so $0$ is neither a maximum nor a minimum."
        },
        {
          prompt: "If $f'(c)=0$ and $f''(c)>0$, then $c$ is a:",
          options: ["Local maximum", "Local minimum", "Saddle point", "Vertical asymptote"],
          answer: 1,
          explanation: "Positive curvature means the graph is concave up at $c$, so the critical point is a local minimum."
        },
        {
          prompt: "Gradient descent updates $x$ in the direction:",
          options: [
            "Of the gradient",
            "Opposite the gradient",
            "Of the second derivative",
            "Of the function value"
          ],
          answer: 1,
          explanation: "The negative gradient is the direction of steepest descent."
        },
        {
          prompt: "A learning rate that is too large typically causes:",
          options: [
            "Immediate convergence",
            "Oscillation or divergence",
            "A smaller gradient",
            "A guaranteed global minimum"
          ],
          answer: 1,
          explanation: "Large steps can jump over the minimum and grow in magnitude instead of settling."
        },
        {
          prompt: "Newton's method for finding a root uses:",
          options: [
            "$x_{n+1}=x_n+f(x_n)$",
            "$x_{n+1}=x_n-f(x_n)/f'(x_n)$",
            "$x_{n+1}=x_n-\\eta$",
            "$x_{n+1}=f'(x_n)$"
          ],
          answer: 1,
          explanation: "It follows the tangent line to the x-axis and repeats, which is fast near a simple root."
        }
      ]
    });

    MS.ui.bindChecklist(root, 4);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[4] = true;
})();
