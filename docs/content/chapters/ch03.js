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
          <span class="meta-pill">Stewart Vol. 1 §3.1–3.6, §3.8–3.9</span>
          <span class="meta-pill">2 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#rules">Core rules</a>
          <a href="#chain">The chain rule</a>
          <a href="#activations">Activation derivatives</a>
          <a href="#worked">Worked example</a>
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
          ${MS.ui.symbols([
            ["$n$", "A constant exponent. The power rule also holds for real $n$ wherever $x^n$ is defined."],
            ["$f,g$", "Differentiable functions of the same variable. Each prime denotes a derivative with respect to that variable."],
            ["$(fg)'$", "The derivative of the product: differentiate the first factor, keep the second, then add the reverse."],
            ["$f'g-fg'$", "The numerator of the quotient rule; the order matters, so it is not symmetric."],
            ["$g^2$", "The denominator of the quotient rule. The rule requires $g\\ne0$."]
          ])}
          <div class="formula">
            $$\\frac{d}{dx}e^x=e^x,\\qquad
              \\frac{d}{dx}\\ln x=\\frac{1}{x},\\qquad
              \\frac{d}{dx}\\sin x=\\cos x$$
          </div>
          ${MS.ui.symbols([
            ["$e$", "Euler's number, approximately $2.71828$. The exponential $e^x$ is its own derivative."],
            ["$\\ln x$", "The natural logarithm, defined for $x>0$; it is the inverse of $e^x$."],
            ["$\\sin x,\\cos x$", "Trigonometric functions measured in radians. Their derivatives cycle with period four."]
          ])}
          <p>
            Differentiation is linear: the derivative of a sum is the sum of the
            derivatives, and constant multiples pass through. This is why gradients
            of large sums can be computed term by term and accumulated. The
            product, quotient, and chain rules turn composite expressions into
            products of simpler local derivatives.
          </p>
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
          ${MS.ui.symbols([
            ["$y=f(u)$", "The outer output, expressed as a function of the intermediate variable $u$."],
            ["$u=g(x)$", "The inner function: the intermediate quantity produced from $x$."],
            ["$\\frac{dy}{du}$", "The derivative of the outer function with respect to the intermediate variable."],
            ["$\\frac{du}{dx}$", "The derivative of the inner function with respect to the input."],
            ["$\\frac{dy}{dx}$", "The total derivative of the composition with respect to $x$."]
          ])}
          <p>
            In function notation:
          </p>
          <div class="formula">
            $$\\frac{d}{dx}f(g(x))=f'(g(x))\\,g'(x)$$
          </div>
          ${MS.ui.symbols([
            ["$f'(g(x))$", "The outer derivative evaluated at the inner function — not at $x$."],
            ["$g'(x)$", "The inner derivative: how fast the intermediate quantity changes."],
            ["$f(g(x))$", "The composition: apply $g$ first, then $f$."]
          ])}
          <p>
            The outer derivative is evaluated at the inner function, not at $x$.
            This point is the source of many backpropagation bugs. A useful mental
            model is a chain of gears: a small turn of $x$ turns $u$ by $g'(x)$,
            and each unit of $u$ turns $y$ by $f'(u)$. The two gear ratios
            multiply.
          </p>
          <p>
            For a deeper composition $f(g(h(x)))$, the same idea repeats:
          </p>
          <div class="formula">
            $$\\frac{d}{dx}f(g(h(x)))
              =f'(g(h(x)))\\,g'(h(x))\\,h'(x)$$
          </div>
          ${MS.ui.symbols([
            ["$h'(x)$", "The innermost derivative."],
            ["$g'(h(x))$", "The middle derivative evaluated at $h(x)$."],
            ["$f'(g(h(x)))$", "The outermost derivative evaluated at $g(h(x))$."]
          ])}
          <p>
            Reverse-mode automatic differentiation computes exactly these products
            from the outside in, caching intermediate values so that no factor is
            recomputed. The forward pass records the values; the reverse pass
            multiplies local derivatives. This is why backpropagation scales to
            millions of parameters: each parameter gradient is assembled from
            factors that are already available.
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
          ${MS.ui.symbols([
            ["$z$", "The pre-activation: the affine score before the nonlinearity."],
            ["$\\sigma(z)$", "The logistic sigmoid. Its output lies in $(0,1)$, so it can be read as a probability."],
            ["$\\sigma(z)(1-\\sigma(z))$", "The sigmoid derivative. It is largest at $z=0$ (value $1/4$) and tends to zero at both extremes."],
            ["$\\tanh(z)$", "The hyperbolic tangent, with output in $(-1,1)$ and zero at the origin."],
            ["$1-\\tanh^2(z)$", "The tanh derivative; it also saturates at both extremes."],
            ["$\\operatorname{ReLU}(z)$", "The rectified linear unit $\\max(0,z)$."],
            ["$z>0,\\ z<0$", "The two linear pieces of ReLU. At $z=0$ the derivative is undefined; implementations choose a convention."]
          ])}
          <p>
            The sigmoid and tanh derivatives approach zero when their inputs are
            large in magnitude. That saturation is the first explanation of the
            vanishing-gradient problem you will meet again with RNNs.
          </p>
          <p>
            ReLU avoids saturation for positive inputs, but its gradient is zero for
            all negative inputs, which can produce “dead” units. Smooth variants
            such as GELU and Swish interpolate between these behaviours: they are
            differentiable everywhere and do not have a hard zero region, at the
            cost of a slightly more expensive derivative.
          </p>
          <p>
            When an activation appears in a network, its derivative is multiplied
            into the backward pass. If that factor is repeatedly small, the signal
            decays as it travels toward earlier layers; if it is repeatedly large,
            the signal explodes. Activation choice is therefore not cosmetic — it
            changes the conditioning of the entire optimization problem.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">3.4</span> Worked example: rules in combination</h2>
        <div class="prose">
          <p>
            Real derivatives rarely use one rule at a time. This example combines the
            chain rule, quotient rule, product rule, and the activation derivatives
            from the chapter.
          </p>
        </div>

        <div class="worked-example">
          <h3>Four derivatives, one method</h3>
          <p class="example-intro">
            Differentiate each function first, then substitute the requested point.
            Check every result with a second rule where possible.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Chain rule and power rule</h4>
              <p>
                For $h(x)=(3x^2+1)^4$, let $u=3x^2+1$. Then
              </p>
              <p>
                $$h'(x)=4u^3\\cdot6x=24x(3x^2+1)^3.$$
                At $x=1$, $h'(1)=24\\cdot1\\cdot4^3=24\\cdot64=1536$.
                The function value is $h(1)=4^4=256$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Quotient rule</h4>
              <p>
                For $y=(x^2+1)/(x-1)$,
              </p>
              <p>
                $$y'=\\frac{2x(x-1)-(x^2+1)}{(x-1)^2}.$$
                At $x=2$:
                $y'(2)=\\frac{4(1)-5}{1^2}=-1$.
                The function value is $y(2)=5/1=5$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Product rule</h4>
              <p>
                For $p(x)=x^2e^x$,
              </p>
              <p>
                $$p'(x)=2xe^x+x^2e^x=xe^x(x+2).$$
                At $x=1$, $p'(1)=1\\cdot e\\cdot3=3e\\approx8.1548$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Activation derivatives</h4>
              <p>
                At $z=0$, $\\sigma(0)=0.5$ and
                $\\sigma'(0)=\\sigma(0)(1-\\sigma(0))=0.5\\cdot0.5=0.25$.
                For tanh, $\\tanh(0)=0$ and $\\tanh'(0)=1-0^2=1$.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the outer derivative in step 1 is $4u^3$ and the
            inner derivative is $6x$, so their product is $24x(3x^2+1)^3$. The
            quotient-rule numerator is $2x(x-1)-(x^2+1)$, which is $-1$ at $x=2$.
            The product rule splits $x^2e^x$ into $2xe^x+x^2e^x$. The sigmoid
            derivative at zero is $0.5\\cdot0.5=0.25$.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">3.5</span> Labs</h2>
        <div data-widget="chain-rule"></div>
        <div data-widget="activation-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">3.6</span> Check your understanding</h2>
        <div data-widget="chain-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">3.7</span> Mastery checklist
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
        <h2 class="section-title"><span class="section-index">3.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Stewart, Cálculo Vol. 1 — Chapter 3", source: "§3.1–3.6 differentiation rules; §3.8–3.9 exponential, logarithmic, and related rates" },
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
