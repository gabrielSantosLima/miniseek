/* Chapter 2 — Functions, limits, continuity, derivative. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(2);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 2</div>
        <h1 class="chapter-title">Functions, Limits, Continuity, and the Derivative</h1>
        <p class="chapter-goal">
          Understand the derivative as a limit and as a local linear approximation —
          the conceptual root of all gradient-based learning.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">10 hours</span>
          <span class="meta-pill">Stewart Vol. 1 §1.1–1.5, §2.1–2.8</span>
          <span class="meta-pill">3 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#functions">Functions</a>
          <a href="#limits">Limits and continuity</a>
          <a href="#derivative">The derivative</a>
          <a href="#labs">Labs</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="functions">
        <h2 class="section-title"><span class="section-index">2.1</span> Functions as machines</h2>
        <div class="prose">
          <p>
            A function assigns exactly one output to each allowed input. The set of
            allowed inputs is the <strong>domain</strong>; the set of outputs is the
            <strong>range</strong>. In machine learning, a model is a function whose
            domain is data and whose parameters are learned.
          </p>
          <p>
            The families that matter most in this course are:
          </p>
          <ul>
            <li><strong>Polynomials</strong> — sums of powers, e.g. $x^2$, $x^3-3x$.</li>
            <li><strong>Rational functions</strong> — ratios of polynomials, with domain restrictions where the denominator is zero.</li>
            <li><strong>Exponential and logarithmic functions</strong> — $e^x$ and $\\ln x$, with domain $x>0$ for the logarithm.</li>
            <li><strong>Logistic and hyperbolic functions</strong> — $\\sigma(x)$ and $\\tanh(x)$, which appear as activations and gates.</li>
          </ul>
          <p>
            Composition is the operation behind deep networks. If
            $h(x)=g(f(x))$, the output of $f$ becomes the input of $g$. A neural
            network is a long composition of affine maps and nonlinearities.
          </p>
          <p>
            Stewart insists on four representations of a function: verbal,
            numerical, visual, and algebraic. Each one exposes something different.
            A table of values reveals a trend; a graph reveals shape and
            asymptotes; a formula reveals exact structure; a sentence reveals the
            modelling assumption. In this course, you should be able to move
            between all four. A loss curve is a numerical/visual representation; a
            closed-form gradient is an algebraic one.
          </p>
          <p>
            Two structural properties recur constantly. An <strong>even</strong>
            function satisfies $f(-x)=f(x)$ and is symmetric about the $y$-axis;
            an <strong>odd</strong> function satisfies $f(-x)=-f(x)$ and is
            symmetric about the origin. An <strong>inverse</strong> function
            reverses the input-output relation and exists only when the original
            function is one-to-one on its domain. The logarithm is the inverse of
            the exponential, which is why $\\ln(e^x)=x$ and $e^{\\ln x}=x$ for
            $x>0$.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Domain first</p>
              <p>
                Before differentiating or plotting, always ask where the function is
                defined. $\\ln x$ is not defined at $x=0$, and $\\sqrt{x}$ is not real
                for $x<0$.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="limits">
        <h2 class="section-title"><span class="section-index">2.2</span> Limits and continuity</h2>
        <div class="prose">
          <p>
            The limit describes what a function approaches as the input approaches a
            value, independently of what happens exactly at that value:
          </p>
          <div class="formula">
            $$\\lim_{x\\to a}f(x)=L$$
            <div class="formula-caption">$f(x)$ can be made arbitrarily close to $L$ by taking $x$ close enough to $a$ (but not equal to $a$).</div>
          </div>
          ${MS.ui.symbols([
            ["$x\\to a$", "The input approaches $a$ from either side, but is never required to equal $a$."],
            ["$f(x)$", "The output of the function at the current input."],
            ["$L$", "The limiting value: the number the outputs approach."],
            ["$\\lim$", "A statement about behaviour near a point, not necessarily the value at that point."]
          ])}
          <p>
            The two-sided limit exists only when both one-sided limits exist and
            agree:
          </p>
          <div class="formula">
            $$\\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)=L$$
          </div>
          ${MS.ui.symbols([
            ["$x\\to a^-$", "Approach $a$ from values smaller than $a$ (from the left)."],
            ["$x\\to a^+$", "Approach $a$ from values larger than $a$ (from the right)."]
          ])}
          <p>
            Limit laws let you combine limits of sums, products, quotients, and
            compositions, provided the individual limits exist and denominators do
            not vanish. The squeeze theorem handles functions bounded between two
            simpler functions. These tools matter numerically: a model's loss can
            oscillate or diverge, and the limit language is how we describe that
            behaviour precisely.
          </p>
          <p>
            Limits can fail to exist because the left and right approaches disagree,
            because the function grows without bound, or because it oscillates.
            A function is <strong>continuous</strong> at $a$ when three things hold:
          </p>
          <div class="formula">
            $$f(a)\\text{ is defined},\\qquad
              \\lim_{x\\to a}f(x)\\text{ exists},\\qquad
              \\lim_{x\\to a}f(x)=f(a)$$
          </div>
          ${MS.ui.symbols([
            ["$f(a)$ defined", "The point $a$ is in the domain; there is an actual output to compare against."],
            ["$\\lim_{x\\to a}f(x)$ exists", "The left and right approaches agree on a finite value."],
            ["$\\lim_{x\\to a}f(x)=f(a)$", "The limiting value equals the actual value: the graph has no hole or jump at $a$."]
          ])}
          <p>
            The intermediate value theorem is the formal reason a continuous
            function cannot jump over a value. If $f$ is continuous on $[a,b]$ and
            $N$ lies between $f(a)$ and $f(b)$, then there is at least one $c\\in
            (a,b)$ with $f(c)=N$. This is the theorem behind bisection and many
            root-finding guarantees.
          </p>
          <p>
            Continuity matters for optimization because differentiability implies
            continuity. If a function is discontinuous at a point, it cannot have a
            derivative there. The converse is false: $|x|$ is continuous at $0$ but
            has no derivative there because the left and right slopes disagree.
          </p>
          <p>
            The derivative itself is a limit. That is not a technicality: it is the
            reason numerical differentiation, gradient checking, and the entire
            backpropagation algorithm are built from limits of difference quotients.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="derivative">
        <h2 class="section-title"><span class="section-index">2.3</span> The derivative</h2>
        <div class="prose">
          <p>
            The derivative of $f$ at $a$ is the limit of the average rate of change
            over an interval of width $h$:
          </p>
          <div class="formula">
            $$f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$$
          </div>
          ${MS.ui.symbols([
            ["$f'(a)$", "The derivative of $f$ at the point $a$: the instantaneous rate of change."],
            ["$h$", "A small change in the input. The limit $h\\to 0$ makes the interval shrink."],
            ["$f(a+h)-f(a)$", "The change in the output over the interval from $a$ to $a+h$."],
            ["$\\frac{f(a+h)-f(a)}{h}$", "The average rate of change — the slope of the secant line."]
          ])}
          <p>
            Geometrically, the quotient is the slope of a <strong>secant</strong>
            line through $(a,f(a))$ and $(a+h,f(a+h))$. As $h\\to 0$, the secant
            becomes the <strong>tangent</strong> line at $a$.
          </p>
          <p>
            The derivative is a function in its own right: $f'$ assigns to each
            input the local slope of $f$. Higher derivatives repeat the operation.
            $f''$ measures how the slope changes; in optimization, the sign of
            $f''$ separates a minimum from a maximum. The notation
            $\\frac{dy}{dx}$ emphasises that the derivative is a ratio of changes,
            while $Df(x)$ emphasises that it is a linear operator.
          </p>
          <p>
            A function that has a derivative at $a$ is called
            <strong>differentiable</strong> there. Differentiability is a stronger
            condition than continuity: it rules out corners, cusps, and vertical
            tangents. The absolute value at zero is the standard counterexample.
          </p>
          <p>
            The tangent line is the first-order approximation:
          </p>
          <div class="formula">
            $$f(x)\\approx f(a)+f'(a)(x-a)$$
            <div class="formula-caption">Near $a$, the curve and its tangent line almost coincide.</div>
          </div>
          ${MS.ui.symbols([
            ["$f(a)$", "The value of the function at the expansion point."],
            ["$f'(a)$", "The local slope at the expansion point."],
            ["$x-a$", "The displacement from the expansion point."],
            ["$f'(a)(x-a)$", "The linear correction predicted by the slope."]
          ])}
          <p>
            This is the one-dimensional version of the Taylor expansion used
            throughout optimization. The linear term is the gradient; the next term
            would involve $f''(a)$ and curvature. Gradient descent is built on the
            assumption that the linear approximation is valid for a small enough
            step.
          </p>
          <p>
            In optimization, $f'(a)$ tells us how a small change in the input changes
            the output. If $f'(a)>0$, increasing the input increases the output; if
            $f'(a)<0$, increasing the input decreases it. The sign of the derivative
            is the direction information that gradient descent uses.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">2.4</span> Labs</h2>
        <div data-widget="function-explorer"></div>
        <div data-widget="secant-tangent"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">2.5</span> Check your understanding</h2>
        <div data-widget="limits-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">2.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(2, [
          "State the limit definition of the derivative.",
          "Compute a derivative from the definition for a polynomial and a rational function.",
          "Explain why differentiability implies continuity but not the converse.",
          "Use a tangent-line approximation and estimate its error.",
          "Explain the derivative as sensitivity to a small parameter change."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">2.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Stewart, Cálculo Vol. 1 — Chapters 1 and 2", source: "§1.1–1.5 functions and models; §2.1–2.8 limits and derivatives" },
          { title: "Mathematics for Machine Learning — §5.1", source: "The machine-learning framing of derivatives" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(2)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.functionExplorer(root.querySelector('[data-widget="function-explorer"]'));
    MS.widgets.secantTangent(root.querySelector('[data-widget="secant-tangent"]'));

    MS.createQuiz(root.querySelector('[data-widget="limits-quiz"]'), {
      id: "limits",
      chapterId: 2,
      title: "Limits and derivatives",
      subtitle: "Work each answer on paper before selecting an option.",
      questions: [
        {
          prompt: "Evaluate $\\displaystyle\\lim_{x\\to 2}\\frac{x^2-4}{x-2}$.",
          options: ["0", "2", "4", "The limit does not exist"],
          answer: 2,
          explanation: "Factor: $\\frac{(x-2)(x+2)}{x-2}=x+2$ for $x\\ne 2$, so the limit is $4$."
        },
        {
          prompt: "Which statement is true?",
          options: [
            "Continuity implies differentiability.",
            "Differentiability implies continuity.",
            "Every continuous function has a derivative everywhere.",
            "A function with a jump discontinuity is differentiable at the jump."
          ],
          answer: 1,
          explanation: "Differentiability is the stronger condition. A sharp corner such as $|x|$ at $0$ is continuous but not differentiable there."
        },
        {
          prompt: "Use the definition to compute $f'(3)$ for $f(x)=x^2$.",
          options: ["3", "6", "9", "0"],
          answer: 1,
          explanation: "$f'(x)=2x$, so $f'(3)=6$. Equivalently, the difference quotient tends to $6$."
        },
        {
          prompt: "What does $f'(a)>0$ mean locally?",
          options: [
            "Increasing the input slightly increases the output.",
            "The function is at a maximum.",
            "The function is discontinuous.",
            "The tangent line is vertical."
          ],
          answer: 0,
          explanation: "A positive derivative means the function is locally increasing at $a$."
        },
        {
          prompt: "The tangent-line approximation at $a$ is:",
          options: [
            "$f(x)\\approx f'(a)+f(a)(x-a)$",
            "$f(x)\\approx f(a)+f'(a)(x-a)$",
            "$f(x)\\approx f(a)-f'(a)$",
            "$f(x)\\approx f(a)(x-a)$"
          ],
          answer: 1,
          explanation: "The tangent line passes through $(a,f(a))$ with slope $f'(a)$."
        }
      ]
    });

    MS.ui.bindChecklist(root, 2);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[2] = true;
})();
