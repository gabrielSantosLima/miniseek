/* Chapter 9 — Backpropagation from scratch. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(9);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part II — Neural Networks and Backpropagation <span class="dot"></span> Chapter 9</div>
        <h1 class="chapter-title">Backpropagation from Scratch</h1>
        <p class="chapter-goal">
          Derive backpropagation completely, from a scalar computational graph to
          vectorized matrix formulas, and understand why it is reverse-mode
          automatic differentiation.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">20 hours</span>
          <span class="meta-pill">DLB Ch. 6</span>
          <span class="meta-pill">2 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#graph">Computational graphs</a>
          <a href="#reverse">The reverse pass</a>
          <a href="#matrix">Matrix backprop</a>
          <a href="#worked">Worked example</a>
          <a href="#exercise">Exercise</a>
          <a href="#labs">Labs</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="graph">
        <h2 class="section-title"><span class="section-index">9.1</span> Computational graphs</h2>
        <div class="prose">
          <p>
            A computation is a directed acyclic graph (DAG). Each node produces a
            value from its parents. For a two-layer MLP:
          </p>
          <div class="formula">
            $$\\mathbf{z}_1=W_1\\mathbf{x}+\\mathbf{b}_1,\\quad
              \\mathbf{a}_1=\\phi(\\mathbf{z}_1),\\quad
              \\mathbf{z}_2=W_2\\mathbf{a}_1+\\mathbf{b}_2,\\quad
              L=\\ell(\\mathbf{z}_2,\\mathbf{y})$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{x}$", "The input vector."],
            ["$W_1,\\mathbf{b}_1$", "Parameters of the first dense layer."],
            ["$\\mathbf{z}_1$", "The first pre-activation."],
            ["$\\mathbf{a}_1$", "The first activation, which becomes the input to the next layer."],
            ["$W_2,\\mathbf{b}_2$", "Parameters of the output layer."],
            ["$\\mathbf{z}_2$", "The output logits."],
            ["$\\ell$", "The loss function comparing logits to the target $\\mathbf{y}$."],
            ["$L$", "The final scalar loss."]
          ])}
          <p>
            The forward pass computes every intermediate value and caches it. The
            backward pass needs those cached values to evaluate local derivatives.
            The graph must be traversed in reverse topological order: a node can be
            differentiated only after all nodes that depend on it have contributed
            their gradients.
          </p>
          <p>
            For a scalar node $u=f(v)$, the local derivative is $\\partial u/\\partial v$.
            The chain rule multiplies local derivatives along every path from the
            loss to a parameter. If a value has several consumers, the contributions
            add; this is exactly why shared parameters accumulate gradients.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="reverse">
        <h2 class="section-title"><span class="section-index">9.2</span> The reverse pass</h2>
        <div class="prose">
          <p>
            Reverse-mode autodiff starts with
            $\\partial L/\\partial L=1$ and walks the graph backwards. At each node,
            it computes a vector-Jacobian product (VJP):
          </p>
          <div class="formula">
            $$\\bar{v}=\\sum_{u\\in\\text{children}(v)}
              \\bar{u}\\,\\frac{\\partial u}{\\partial v}$$
          </div>
          ${MS.ui.symbols([
            ["$\\bar{v}$", "The accumulated gradient $\\partial L/\\partial v$ at node $v$."],
            ["$\\text{children}(v)$", "All nodes that directly consume the value produced by $v$."],
            ["$\\bar{u}$", "The upstream gradient at a child node."],
            ["$\\partial u/\\partial v$", "The local derivative of the child with respect to $v$."]
          ])}
          <p>
            If a value is used by several nodes, its gradient contributions
            accumulate. This is why parameter sharing works naturally in the same
            framework. It is also why a single backward pass can compute gradients
            for every parameter, regardless of how many times a parameter is reused.
          </p>
          <p>
            For a dense layer $\\mathbf{z}=W\\mathbf{a}+\\mathbf{b}$ with upstream
            gradient $\\delta=\\partial L/\\partial\\mathbf{z}$:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial W}=\\delta\\mathbf{a}^T,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{b}}=\\delta,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{a}}=W^T\\delta$$
          </div>
          ${MS.ui.symbols([
            ["$\\delta$", "The upstream gradient with respect to the layer output."],
            ["$\\delta\\mathbf{a}^T$", "The outer product that gives the gradient with respect to $W$; it has the same shape as $W$."],
            ["$W^T\\delta$", "The gradient with respect to the input; it maps the output-space gradient back to input space."],
            ["$\\mathbf{a}$", "The input to the layer (the previous activation)."]
          ])}
          <p>
            For a layer followed by an activation,
            $\\delta_{\\text{prev}}=(W^T\\delta)\\odot\\phi'(\\mathbf{z})$.
            The Hadamard product $\\odot$ applies the activation derivative
            element-wise. If the activation derivative is tiny, the signal shrinks;
            if it is large, the signal grows. Deep chains multiply many such factors.
          </p>
          <p>
            The reverse pass costs roughly one forward pass plus one backward pass,
            independent of the number of parameters (for a scalar loss). That is the
            key efficiency of reverse mode.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="matrix">
        <h2 class="section-title"><span class="section-index">9.3</span> Softmax, cross-entropy, and gradient checking</h2>
        <div class="prose">
          <p>
            For logits $\\mathbf{z}$ and a correct class $c$, softmax plus
            cross-entropy has a remarkably simple gradient:
          </p>
          <div class="formula">
            $$\\hat{\\mathbf{y}}=\\operatorname{softmax}(\\mathbf{z}),\\qquad
              L=-\\log\\hat y_c,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{z}}=\\hat{\\mathbf{y}}-\\mathbf{y}$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{z}$", "The logits produced by the final linear layer."],
            ["$\\hat{\\mathbf{y}}$", "The predicted probability distribution over the vocabulary."],
            ["$c$", "The index of the correct next token."],
            ["$\\hat y_c$", "The probability the model assigned to the correct token."],
            ["$L$", "The negative log-likelihood for this position."],
            ["$\\mathbf{y}$", "The one-hot target vector with a $1$ at index $c$."],
            ["$\\hat{\\mathbf{y}}-\\mathbf{y}$", "The error signal: predicted probability minus target probability."]
          ])}
          <p>
            This is the gradient that flows into the final linear layer of a language
            model. The target $\\mathbf{y}$ is one-hot for the correct next token.
            The simplicity of $\\hat{\\mathbf{y}}-\\mathbf{y}$ is not an accident:
            the softmax and the logarithm cancel in the derivative.
          </p>
          <p>
            To debug a backward pass, compare it with a central finite difference:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial\\theta}
              \\approx\\frac{L(\\theta+h)-L(\\theta-h)}{2h}$$
          </div>
          ${MS.ui.symbols([
            ["$\\theta$", "A single scalar parameter (perturb one entry at a time)."],
            ["$h$", "A small step size; typical values are $10^{-4}$ to $10^{-6}$."],
            ["$L(\\theta+h)$", "The loss after increasing the parameter."],
            ["$L(\\theta-h)$", "The loss after decreasing the parameter."]
          ])}
          <p>
            Use a moderate $h$ (for example $10^{-4}$ to $10^{-6}$). Too large and the
            approximation is biased; too small and floating-point cancellation
            dominates.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Backprop is not a separate algorithm</p>
              <p>
                It is the chain rule applied in reverse topological order, with
                cached forward values and accumulated gradients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">9.4</span> Worked example: one full forward and backward pass</h2>
        <div class="prose">
          <p>
            This is a complete training step for a tiny network with two inputs, two
            ReLU hidden units, one linear output, and squared-error loss. Every number
            is chosen for arithmetic clarity; the method is exactly the one used for
            large networks.
          </p>
          <table>
            <thead><tr><th>Object</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Input $\\mathbf{x}$</td><td>$(x_1,x_2)=(1,2)$</td></tr>
              <tr><td>Target</td><td>$y=1$</td></tr>
              <tr><td>Hidden weights $W_1$</td><td>$\\begin{bmatrix}1.0&0.5\\\\-1.0&1.0\\end{bmatrix}$</td></tr>
              <tr><td>Hidden bias $\\mathbf{b}_1$</td><td>$(0.0,0.5)$</td></tr>
              <tr><td>Output weights $\\mathbf{v}$</td><td>$(0.5,-0.5)$</td></tr>
              <tr><td>Output bias $b_{out}$</td><td>$0.1$</td></tr>
              <tr><td>Learning rate $\\eta$</td><td>$0.05$</td></tr>
            </tbody>
          </table>
        </div>

        <div class="worked-example">
          <h3>Forward pass and reverse pass, step by step</h3>
          <p class="example-intro">
            Write each intermediate value down. The backward pass will need every one
            of them.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Hidden pre-activations</h4>
              <p>
                $$z_1=1.0\\cdot1+0.5\\cdot2+0.0=2.0,$$
                $$z_2=-1.0\\cdot1+1.0\\cdot2+0.5=1.5.$$
                Both are positive, so the ReLU derivatives will be $1$:
                $a_1=2.0$ and $a_2=1.5$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Output and loss</h4>
              <p>
                $$\\hat y=0.5\\cdot2.0+(-0.5)\\cdot1.5+0.1=0.35,$$
                $$L=(\\hat y-y)^2=(0.35-1)^2=(-0.65)^2=0.4225.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Output-layer gradients</h4>
              <p>
                $$\\frac{\\partial L}{\\partial\\hat y}=2(\\hat y-y)=2(0.35-1)=-1.3.$$
                Multiply by the hidden activations:
              </p>
              <p>
                $$\\frac{\\partial L}{\\partial v_1}=-1.3\\cdot2.0=-2.6,\\qquad
                  \\frac{\\partial L}{\\partial v_2}=-1.3\\cdot1.5=-1.95,$$
                $$\\frac{\\partial L}{\\partial b_{out}}=-1.3.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Backpropagate into the hidden layer</h4>
              <p>
                $$\\frac{\\partial L}{\\partial a_1}
                  =\\frac{\\partial L}{\\partial\\hat y}\\,v_1
                  =(-1.3)(0.5)=-0.65,$$
                $$\\frac{\\partial L}{\\partial a_2}
                  =(-1.3)(-0.5)=0.65.$$
                The ReLU derivative is $1$ at both pre-activations, so
                $\\partial L/\\partial z_1=-0.65$ and
                $\\partial L/\\partial z_2=0.65$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">5</span>
            <div>
              <h4>Hidden parameter gradients</h4>
              <p>
                For a dense layer, $\\partial L/\\partial w_{ij}
                =(\\partial L/\\partial z_i)x_j$. Therefore:
              </p>
              <p>
                $$\\frac{\\partial L}{\\partial w_{11}}=-0.65\\cdot1=-0.65,\\qquad
                  \\frac{\\partial L}{\\partial w_{12}}=-0.65\\cdot2=-1.3,$$
                $$\\frac{\\partial L}{\\partial b_1}=-0.65,$$
                $$\\frac{\\partial L}{\\partial w_{21}}=0.65\\cdot1=0.65,\\qquad
                  \\frac{\\partial L}{\\partial w_{22}}=0.65\\cdot2=1.3,\\qquad
                  \\frac{\\partial L}{\\partial b_2}=0.65.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">6</span>
            <div>
              <h4>Apply one gradient step</h4>
              <p>
                Use $\\theta\\leftarrow\\theta-\\eta\\,\\partial L/\\partial\\theta$
                with $\\eta=0.05$:
              </p>
              <p>
                $$w_{11}=1.0-0.05(-0.65)=1.0325,\\qquad
                  w_{12}=0.5-0.05(-1.3)=0.565,$$
                $$b_1=0.0-0.05(-0.65)=0.0325,$$
                $$w_{21}=-1.0-0.05(0.65)=-1.0325,\\qquad
                  w_{22}=1.0-0.05(1.3)=0.935,$$
                $$b_2=0.5-0.05(0.65)=0.4675,$$
                $$v_1=0.5-0.05(-2.6)=0.63,\\qquad
                  v_2=-0.5-0.05(-1.95)=-0.4025,$$
                $$b_{out}=0.1-0.05(-1.3)=0.165.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">7</span>
            <div>
              <h4>Recompute the forward pass to verify the step</h4>
              <p>
                $$z_1=1.0325\\cdot1+0.565\\cdot2+0.0325=2.195,$$
                $$z_2=-1.0325\\cdot1+0.935\\cdot2+0.4675=1.305,$$
                $$\\hat y=0.63\\cdot2.195+(-0.4025)\\cdot1.305+0.165
                  =1.0225875,$$
                $$L=(1.0225875-1)^2\\approx0.0005102.$$
                The loss decreased from $0.4225$ to approximately $0.00051$.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the output gradient is $\\hat y-y=-0.65$ before
            the factor of two; the factor of two gives $-1.3$. The hidden gradients
            are $(-1.3)v_1$ and $(-1.3)v_2$, and the ReLU derivatives are both $1$.
            Recomputing the forward pass after the update gives a smaller loss, so
            the signs and the update direction are consistent.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="exercise">
        <h2 class="section-title"><span class="section-index">9.5</span> Exercise: run the backward pass yourself</h2>
        <div class="prose">
          <p>
            Use the same architecture as the worked example — two inputs, two ReLU
            hidden units, one linear output, squared-error loss — but with the
            parameters below. Compute the full training step on paper before opening
            the solution.
          </p>
        </div>

        <div class="exercise-card">
          <h3>Your turn</h3>
          <p class="exercise-intro">
            Inputs $(2,1)$, target $y=2$, learning rate $\\eta=0.02$.
          </p>
          <table>
            <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>$W_1$</td><td>$\\begin{bmatrix}0.5&-0.5\\\\-0.25&1.0\\end{bmatrix}$</td></tr>
              <tr><td>$\\mathbf{b}_1$</td><td>$(0.1,0.0)$</td></tr>
              <tr><td>$\\mathbf{v}$</td><td>$(0.8,-0.6)$</td></tr>
              <tr><td>$b_{out}$</td><td>$0.2$</td></tr>
            </tbody>
          </table>
          <p>Compute, in this order:</p>
          <ol>
            <li>the hidden pre-activations $z_1,z_2$ and activations $a_1,a_2$;</li>
            <li>the output $\\hat y$ and the loss $L$;</li>
            <li>$\\partial L/\\partial\\hat y$;</li>
            <li>$\\partial L/\\partial v_1$, $\\partial L/\\partial v_2$, and $\\partial L/\\partial b_{out}$;</li>
            <li>the hidden gradients $\\partial L/\\partial z_1$ and $\\partial L/\\partial z_2$;</li>
            <li>all six hidden parameter gradients (four weights and two biases);</li>
            <li>the updated parameters after one step;</li>
            <li>the new forward loss.</li>
          </ol>
          <details class="solution">
            <summary>Show the full solution</summary>
            <p><strong>Forward:</strong></p>
            <p>
              $$z_1=0.5\\cdot2+(-0.5)\\cdot1+0.1=0.6,\\qquad a_1=0.6,$$
              $$z_2=(-0.25)\\cdot2+1.0\\cdot1+0.0=0.5,\\qquad a_2=0.5,$$
              $$\\hat y=0.8\\cdot0.6+(-0.6)\\cdot0.5+0.2=0.38,$$
              $$L=(0.38-2)^2=(-1.62)^2=2.6244.$$
            </p>
            <p><strong>Output gradient:</strong></p>
            <p>
              $$\\frac{\\partial L}{\\partial\\hat y}=2(0.38-2)=-3.24.$$
            </p>
            <p><strong>Output parameters:</strong></p>
            <p>
              $$\\frac{\\partial L}{\\partial v_1}=-3.24\\cdot0.6=-1.944,\\qquad
                \\frac{\\partial L}{\\partial v_2}=-3.24\\cdot0.5=-1.62,$$
              $$\\frac{\\partial L}{\\partial b_{out}}=-3.24.$$
            </p>
            <p><strong>Hidden layer:</strong> both pre-activations are positive, so
              the ReLU derivatives are $1$.</p>
            <p>
              $$\\frac{\\partial L}{\\partial z_1}=-3.24\\cdot0.8=-2.592,\\qquad
                \\frac{\\partial L}{\\partial z_2}=-3.24\\cdot(-0.6)=1.944.$$
            </p>
            <p><strong>Hidden parameter gradients:</strong></p>
            <p>
              $$\\frac{\\partial L}{\\partial w_{11}}=-2.592\\cdot2=-5.184,\\qquad
                \\frac{\\partial L}{\\partial w_{12}}=-2.592\\cdot1=-2.592,$$
              $$\\frac{\\partial L}{\\partial b_1}=-2.592,$$
              $$\\frac{\\partial L}{\\partial w_{21}}=1.944\\cdot2=3.888,\\qquad
                \\frac{\\partial L}{\\partial w_{22}}=1.944\\cdot1=1.944,\\qquad
                \\frac{\\partial L}{\\partial b_2}=1.944.$$
            </p>
            <p><strong>Update with $\\eta=0.02$:</strong></p>
            <p>
              $$w_{11}=0.60368,\\quad w_{12}=-0.44816,\\quad b_1=0.15184,$$
              $$w_{21}=-0.32776,\\quad w_{22}=0.96112,\\quad b_2=-0.03888,$$
              $$v_1=0.83888,\\quad v_2=-0.5676,\\quad b_{out}=0.2648.$$
            </p>
            <p><strong>New forward pass:</strong></p>
            <p>
              $$z_1=0.91104,\\quad z_2=0.26672,$$
              $$\\hat y\\approx0.877663,\\qquad L\\approx1.25964.$$
              The loss decreased from $2.6244$ to about $1.2596$.
            </p>
            <p><strong>Exact fractions (optional check):</strong></p>
            <ul class="answer-list">
              <li>$\\hat y_0=19/50$, $L_0=6561/2500$</li>
              <li>$\\partial L/\\partial\\hat y=-81/25$</li>
              <li>$\\partial L/\\partial v_1=-243/125$, $\\partial L/\\partial v_2=-81/50$</li>
              <li>$\\partial L/\\partial w_{11}=-648/125$, $\\partial L/\\partial w_{21}=486/125$</li>
              <li>$w_{11}=3773/6250$, $w_{21}=-4097/12500$</li>
            </ul>
          </details>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">9.6</span> Labs</h2>
        <div data-widget="backprop-graph"></div>
        <div data-widget="gradient-check"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">9.7</span> Check your understanding</h2>
        <div data-widget="backprop-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">9.8</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(9, [
          "Draw the computational graph for a two-layer MLP.",
          "Derive every local derivative in that graph.",
          "Write the vectorized backward pass for a dense layer.",
          "Derive the softmax + cross-entropy gradient.",
          "Explain why gradients accumulate when parameters are shared.",
          "Perform a gradient check and interpret a mismatch.",
          "Explain reverse-mode autodiff in one paragraph."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">9.9</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 6", source: "Backpropagation and computational graphs" },
          { title: "Nielsen, Neural Networks and Deep Learning — Chapter 2", source: "A step-by-step derivation of backpropagation" },
          { title: "Parr & Howard, The Matrix Calculus You Need For Deep Learning", source: "Matrix chain rule and VJPs" },
          { title: "Rumelhart, Hinton & Williams (1986)", source: "The original back-propagation paper" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(9)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.backpropGraph(root.querySelector('[data-widget="backprop-graph"]'));
    MS.widgets.gradientCheck(root.querySelector('[data-widget="gradient-check"]'));

    MS.createQuiz(root.querySelector('[data-widget="backprop-quiz"]'), {
      id: "backprop",
      chapterId: 9,
      title: "Backpropagation checkpoint",
      subtitle: "Follow the chain rule backwards.",
      questions: [
        {
          prompt: "Reverse-mode autodiff starts the backward pass at:",
          options: ["The first parameter", "The loss", "The input", "The last activation"],
          answer: 1,
          explanation: "It seeds the loss gradient at 1 and propagates contributions backwards."
        },
        {
          prompt: "For a dense layer, the gradient with respect to the input is:",
          options: ["$W\\delta$", "$W^T\\delta$", "$\\delta W$", "$\\delta^T W$"],
          answer: 1,
          explanation: "The VJP of $y=Wx+b$ with respect to $x$ is $W^T\\delta$."
        },
        {
          prompt: "For softmax + cross-entropy, $\\partial L/\\partial z$ equals:",
          options: ["$\\hat y$", "$\\hat y-y$", "$y-\\hat y$", "$\\hat y\\odot y$"],
          answer: 1,
          explanation: "The softmax and log cancel, leaving the clean gradient $\\hat y-y$."
        },
        {
          prompt: "Why does the backward pass cache forward values?",
          options: [
            "To avoid computing local derivatives",
            "To evaluate local derivatives without recomputing the forward pass",
            "To make the loss smaller",
            "To remove the need for a learning rate"
          ],
          answer: 1,
          explanation: "Local derivatives such as $\\phi'(z)$ need the intermediate values from the forward pass."
        },
        {
          prompt: "A gradient check uses:",
          options: [
            "A random guess",
            "A central finite difference",
            "The determinant of the Jacobian",
            "The softmax output"
          ],
          answer: 1,
          explanation: "Comparing the analytic gradient with $(L(\\theta+h)-L(\\theta-h))/(2h)$ catches implementation errors."
        }
      ]
    });

    MS.ui.bindChecklist(root, 9);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[9] = true;
})();
