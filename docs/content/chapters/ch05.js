/* Chapter 5 — Multivariable calculus. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(5);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 5</div>
        <h1 class="chapter-title">Multivariable Calculus: Gradients, Jacobians, Hessians</h1>
        <p class="chapter-goal">
          Extend differentiation to vector-valued functions and derive the objects
          that appear everywhere in deep learning.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">16 hours</span>
          <span class="meta-pill">Stewart Vol. 2 Ch. 14</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#surfaces">Surfaces and partials</a>
          <a href="#gradient">The gradient</a>
          <a href="#jacobian">Jacobians and VJPs</a>
          <a href="#lab">Lab</a>
          <a href="#worked">Worked example</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="surfaces">
        <h2 class="section-title"><span class="section-index">5.1</span> Surfaces and partial derivatives</h2>
        <div class="prose">
          <p>
            A scalar function of two variables, $f(x,y)$, defines a surface.
            Holding one variable fixed and differentiating with respect to the
            other gives a <strong>partial derivative</strong>:
          </p>
          <div class="formula">
            $$\\frac{\\partial f}{\\partial x}
              =\\lim_{h\\to 0}\\frac{f(x+h,y)-f(x,y)}{h}$$
          </div>
          ${MS.ui.symbols([
            ["$f(x,y)$", "A scalar-valued function of two inputs — for example, a loss surface over two parameters."],
            ["$\\partial f/\\partial x$", "The partial derivative with respect to $x$: the slope in the $x$ direction while $y$ is held fixed."],
            ["$h$", "A small change in $x$ only; $y$ does not change."],
            ["$\\partial$", "The partial-derivative symbol, used when other variables are held constant."]
          ])}
          <p>
            Geometrically, $\\partial f/\\partial x$ is the slope of the surface in
            the $x$ direction at a fixed $y$. The two partials together describe the
            local slope in every coordinate direction. If you stand at a point on a
            hillside, the partial in the east direction is the slope you feel while
            walking exactly east; the partial in the north direction is the slope
            while walking exactly north.
          </p>
          <p>
            The total differential packages the first-order change into a single
            linear expression:
          </p>
          <div class="formula">
            $$df=\\frac{\\partial f}{\\partial x}\\,dx+\\frac{\\partial f}{\\partial y}\\,dy$$
          </div>
          ${MS.ui.symbols([
            ["$df$", "The first-order change in $f$ for small changes $dx,dy$."],
            ["$dx,dy$", "Small independent changes in the two inputs."],
            ["$\\partial f/\\partial x,\\ \\partial f/\\partial y$", "The local sensitivities multiplying those changes."]
          ])}
          <p>
            Level curves are the sets $f(x,y)=c$. They are the two-dimensional
            analogue of contour lines on a map. The gradient will turn out to be
            orthogonal to these curves.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Notation</p>
              <p>
                $f_x$, $\\partial f/\\partial x$, and $D_x f$ all denote the same
                partial derivative. In deep learning, the loss is usually a scalar
                and the parameters form a very high-dimensional vector.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="gradient">
        <h2 class="section-title"><span class="section-index">5.2</span> The gradient and directional derivatives</h2>
        <div class="prose">
          <p>
            The gradient stacks all partial derivatives into one vector:
          </p>
          <div class="formula">
            $$\\nabla f(x,y)=\\left(\\frac{\\partial f}{\\partial x},
              \\frac{\\partial f}{\\partial y}\\right)$$
          </div>
          ${MS.ui.symbols([
            ["$\\nabla f$", "The gradient: a vector of all first partial derivatives."],
            ["$\\partial f/\\partial x$", "The component of the gradient in the $x$ direction."],
            ["$\\partial f/\\partial y$", "The component of the gradient in the $y$ direction."]
          ])}
          <p>
            For a unit vector $\\mathbf{u}$, the directional derivative is:
          </p>
          <div class="formula">
            $$D_{\\mathbf{u}}f=\\nabla f\\cdot\\mathbf{u}$$
            <div class="formula-caption">The dot product is largest when $\\mathbf{u}$ points along $\\nabla f$.</div>
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{u}$", "A unit vector: the direction in which the derivative is measured."],
            ["$D_{\\mathbf{u}}f$", "The rate of change of $f$ in the direction $\\mathbf{u}$."],
            ["$\\nabla f\\cdot\\mathbf{u}$", "The dot product, equal to $\\lVert\\nabla f\\rVert\\cos\\theta$, where $\\theta$ is the angle between the gradient and $\\mathbf{u}$."]
          ])}
          <p>
            Therefore the gradient points in the direction of steepest ascent, and
            its magnitude is the maximum rate of increase. Gradient descent moves in
            the opposite direction. The gradient is also orthogonal to the level
            curve through the point: moving along a level curve does not change $f$,
            so the directional derivative in that direction is zero.
          </p>
          <p>
            At a critical point, $\\nabla f=0$. To classify it, look at the Hessian:
          </p>
          <div class="formula">
            $$H=\\begin{bmatrix}
              f_{xx} & f_{xy}\\\\
              f_{yx} & f_{yy}
            \\end{bmatrix}$$
          </div>
          ${MS.ui.symbols([
            ["$H$", "The Hessian matrix of second partial derivatives."],
            ["$f_{xx}$", "The second partial derivative in $x$: curvature along the $x$ direction."],
            ["$f_{yy}$", "Curvature along the $y$ direction."],
            ["$f_{xy}=f_{yx}$", "The mixed partial derivative. For smooth functions, the order of differentiation does not matter (Clairaut's theorem)."]
          ])}
          <p>
            A positive-definite Hessian means a local minimum, a negative-definite
            Hessian means a local maximum, and an indefinite Hessian means a saddle.
            In two dimensions this can be checked from the determinant and the
            $f_{xx}$ entry: if $f_{xx}f_{yy}-f_{xy}^2>0$ and $f_{xx}>0$, it is a
            minimum; if the determinant is positive and $f_{xx}<0$, it is a maximum;
            if the determinant is negative, it is a saddle.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">Saddle points are common</p>
              <p>
                In high dimensions, most stationary points of a non-convex loss are
                saddles, not local minima. The one-dimensional example $x^3$ is a
                preview of this geometry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="jacobian">
        <h2 class="section-title"><span class="section-index">5.3</span> Jacobians, Hessians, and VJPs</h2>
        <div class="prose">
          <p>
            For a vector-valued function $\\mathbf{f}:\\mathbb{R}^n\\to\\mathbb{R}^m$,
            the Jacobian collects every first partial derivative:
          </p>
          <div class="formula">
            $$J_{ij}=\\frac{\\partial f_i}{\\partial x_j},
              \\qquad J\\in\\mathbb{R}^{m\\times n}$$
          </div>
          ${MS.ui.symbols([
            ["$f_i$", "The $i$-th output component of the vector-valued function $\\mathbf{f}$."],
            ["$x_j$", "The $j$-th input component."],
            ["$J_{ij}$", "The partial derivative of output $i$ with respect to input $j$."],
            ["$m,n$", "Output and input dimensions. The Jacobian is $m\\times n$."]
          ])}
          <p>
            The multivariable chain rule is a product of Jacobians. If
            $\\mathbf{y}=g(\\mathbf{x})$ and $L=h(\\mathbf{y})$, then:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial \\mathbf{x}}
              =\\left(\\frac{\\partial \\mathbf{y}}{\\partial \\mathbf{x}}\\right)^T
                \\frac{\\partial L}{\\partial \\mathbf{y}}$$
          </div>
          ${MS.ui.symbols([
            ["$\\partial L/\\partial \\mathbf{x}$", "The gradient of the scalar loss with respect to the input vector; same shape as $\\mathbf{x}$."],
            ["$\\partial \\mathbf{y}/\\partial \\mathbf{x}$", "The Jacobian of the intermediate map $g$; shape $m\\times n$."],
            ["$(\\cdot)^T$", "Transpose, which turns an $m\\times n$ Jacobian into an $n\\times m$ matrix."],
            ["$\\partial L/\\partial \\mathbf{y}$", "The upstream gradient; same shape as $\\mathbf{y}$."]
          ])}
          <p>
            The right-hand side is a <strong>vector-Jacobian product</strong>
            (VJP): a vector multiplied by a Jacobian transpose. Reverse-mode
            automatic differentiation computes one VJP per node, which is why it is
            efficient for a scalar loss. A forward-mode pass would instead compute
            Jacobian-vector products and would need one pass per input dimension.
          </p>
          <p>
            A second-order Taylor expansion around a point $\\mathbf{a}$ explains
            why the Hessian controls local geometry:
          </p>
          <div class="formula">
            $$f(\\mathbf{a}+\\Delta)
              \\approx f(\\mathbf{a})+\\nabla f(\\mathbf{a})^T\\Delta
              +\\frac12\\Delta^T H(\\mathbf{a})\\Delta$$
          </div>
          ${MS.ui.symbols([
            ["$\\Delta$", "A small displacement from the expansion point."],
            ["$\\nabla f(\\mathbf{a})^T\\Delta$", "The first-order (linear) change predicted by the gradient."],
            ["$\\frac12\\Delta^T H\\Delta$", "The second-order (quadratic) correction predicted by the Hessian."]
          ])}
          <p>
            At a critical point the linear term vanishes, so the quadratic term is
            the first non-zero piece. Its sign determines whether the point curves
            upward in every direction, curves downward, or has mixed directions.
          </p>
          <p>
            For a dense layer $\\mathbf{y}=W\\mathbf{x}+\\mathbf{b}$ with
            $W\\in\\mathbb{R}^{m\\times n}$, the VJP with respect to the input is:
          </p>
          <div class="formula">
            $$\\delta_{\\mathbf{x}}=W^T\\delta_{\\mathbf{y}}$$
          </div>
          ${MS.ui.symbols([
            ["$W\\in\\mathbb{R}^{m\\times n}$", "A dense layer mapping $n$ input features to $m$ output features."],
            ["$\\delta_{\\mathbf{y}}$", "The upstream gradient with respect to the layer output; shape $m$."],
            ["$W^T$", "The transpose, which maps an $m$-vector back to an $n$-vector."],
            ["$\\delta_{\\mathbf{x}}$", "The gradient with respect to the layer input; shape $n$."]
          ])}
          <p>
            This single equation is the entire backward pass of a linear layer. The
            gradient with respect to $W$ is
            $\\delta_{\\mathbf{y}}\\mathbf{x}^T$, an outer product that has the same
            shape as $W$. The gradient with respect to the bias is just
            $\\delta_{\\mathbf{y}}$, because addition distributes the upstream
            gradient unchanged.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">5.4</span> Lab</h2>
        <div data-widget="gradient-field"></div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">5.5</span> Worked example: the rules end to end</h2>
        <div class="prose">
          <p>
            This example is the bridge between the calculus rules and the
            backpropagation chapter. Work every line on paper before reading the next
            step. The numbers are exact, and every result is checked at the end.
          </p>
        </div>

        <div class="worked-example">
          <h3>One function, six calculations</h3>
          <p class="example-intro">
            Use $h(x)=(x^2+1)^3$ for the one-variable warm-up, then
            $f(x,y)=x^2y+3xy^2$ at the point $(1,2)$ for the multivariable work.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Power rule and chain rule</h4>
              <p>
                Write $h(x)=u^3$ with $u=x^2+1$. The outer derivative is $3u^2$ and
                the inner derivative is $2x$:
              </p>
              <p>
                $$h'(x)=3(x^2+1)^2\cdot 2x=6x(x^2+1)^2.$$
                At $x=1$, $h'(1)=6\cdot1\cdot 2^2=24$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Function value</h4>
              <p>
                $$f(1,2)=1^2\cdot2+3\cdot1\cdot2^2=2+12=14.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Partial derivatives and gradient</h4>
              <p>
                Differentiate with respect to $x$ while holding $y$ fixed, then the
                reverse:
              </p>
              <p>
                $$f_x=2xy+3y^2,\qquad f_y=x^2+6xy.$$
                At $(1,2)$:
                $$f_x(1,2)=2\cdot1\cdot2+3\cdot2^2=4+12=16,$$
                $$f_y(1,2)=1^2+6\cdot1\cdot2=1+12=13.$$
                Therefore $\\nabla f(1,2)=(16,13)$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Directional derivative</h4>
              <p>
                Let $\\mathbf{u}=(3/5,4/5)$. It is a unit vector because
                $(3/5)^2+(4/5)^2=9/25+16/25=1$. Then
              </p>
              <p>
                $$D_{\\mathbf{u}}f(1,2)
                  =\\nabla f(1,2)\\cdot\\mathbf{u}
                  =16\\cdot\\frac35+13\\cdot\\frac45
                  =\\frac{48}{5}+\\frac{52}{5}=20.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">5</span>
            <div>
              <h4>Multivariable chain rule</h4>
              <p>
                Put the surface on a circle: $g(t)=f(\\cos t,\\sin t)$. With
                $x=\\cos t$ and $y=\\sin t$,
              </p>
              <p>
                $$g'(t)=f_x\\,(-\\sin t)+f_y\\,(\\cos t).$$
                At $t=0$, $(x,y)=(1,0)$, so $f_x(1,0)=0$ and $f_y(1,0)=1$. Hence
                $g'(0)=0\\cdot0+1\\cdot1=1$.
              </p>
              <p>
                Direct check: $g(t)=\\cos^2t\\sin t+3\\cos t\\sin^2t$, and
                differentiating gives $g'(0)=1$ as well.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">6</span>
            <div>
              <h4>Hessian and local geometry</h4>
              <p>
                Differentiate the first partials again:
              </p>
              <p>
                $$f_{xx}=2y,\\qquad f_{xy}=2x+6y,\\qquad f_{yy}=6x.$$
                At $(1,2)$:
              </p>
              <p>
                $$H(1,2)=\\begin{bmatrix}4&14\\\\14&6\\end{bmatrix},
                  \\qquad \\det H=4\\cdot6-14^2=24-196=-172.$$
              </p>
              <p>
                The determinant is negative, so the Hessian is indefinite and the
                point is a saddle, not a minimum.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> $f(1,2)=14$; the gradient is $(16,13)$; the
            unit-vector check gives $9/25+16/25=1$; the directional derivative is
            $48/5+52/5=20$; the chain-rule result is $1$ both by the formula and by
            direct differentiation; and the Hessian determinant is $-172&lt;0$.
            Every number is consistent with the rules used.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">5.6</span> Check your understanding</h2>
        <div data-widget="multivariable-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">5.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(5, [
          "Compute partial derivatives and the gradient of a scalar function.",
          "Explain why the gradient is orthogonal to level sets.",
          "Classify critical points with the Hessian.",
          "Write the multivariable chain rule in both index and matrix form.",
          "Explain the difference between a Jacobian and a Hessian.",
          "Explain why reverse-mode differentiation is cheap for scalar losses."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">5.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Stewart, Cálculo Vol. 2 — Chapter 14", source: "§14.1–14.3 partial derivatives; §14.4–14.5 tangent planes and chain rule; §14.6–14.8 gradient, extrema, Lagrange multipliers" },
          { title: "Parr & Howard, The Matrix Calculus You Need For Deep Learning — §1–4", source: "Matrix chain rule and vector-Jacobian products" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — §4.3", source: "Gradients, Jacobians, and Hessians in the context of loss surfaces" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(5)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.gradientField(root.querySelector('[data-widget="gradient-field"]'));

    MS.createQuiz(root.querySelector('[data-widget="multivariable-quiz"]'), {
      id: "multivariable",
      chapterId: 5,
      title: "Multivariable checkpoint",
      subtitle: "Focus on shapes, directions, and local geometry.",
      questions: [
        {
          prompt: "The gradient points in the direction of:",
          options: [
            "Steepest descent",
            "Steepest ascent",
            "The nearest level curve",
            "The Hessian eigenvector"
          ],
          answer: 1,
          explanation: "The directional derivative is largest when the direction is parallel to the gradient."
        },
        {
          prompt: "For $f(x,y)=x^2y$, what is $\\partial f/\\partial x$ at $(2,3)$?",
          options: ["6", "12", "9", "24"],
          answer: 1,
          explanation: "$\\partial f/\\partial x=2xy$, so at $(2,3)$ it is $2\\cdot2\\cdot3=12$."
        },
        {
          prompt: "A positive-definite Hessian at a critical point indicates:",
          options: ["A local maximum", "A local minimum", "A saddle point", "A discontinuity"],
          answer: 1,
          explanation: "Positive curvature in every direction means the point is a local minimum."
        },
        {
          prompt: "If $W\\in\\mathbb{R}^{4\\times3}$ and $\\delta_y\\in\\mathbb{R}^4$, the VJP with respect to the input has shape:",
          options: ["4", "3", "4×3", "3×4"],
          answer: 1,
          explanation: "$\\delta_x=W^T\\delta_y$ has shape $3\\times1$, so it matches the input dimension."
        },
        {
          prompt: "Why is reverse-mode autodiff efficient for a scalar loss?",
          options: [
            "It differentiates every input separately",
            "It computes one VJP per node in a single backward pass",
            "It avoids the chain rule",
            "It requires no intermediate values"
          ],
          answer: 1,
          explanation: "A scalar loss has one output, so one reverse pass accumulates all parameter gradients."
        }
      ]
    });

    MS.ui.bindChecklist(root, 5);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[5] = true;
})();
