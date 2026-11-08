/* Chapter 6 — Linear algebra. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(6);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 6</div>
        <h1 class="chapter-title">Linear Algebra for Neural Networks</h1>
        <p class="chapter-goal">
          Become fluent in the matrix and tensor operations that define layers,
          embeddings, and attention.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">16 hours</span>
          <span class="meta-pill">MML Ch. 2–4</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#vectors">Vectors and matrices</a>
          <a href="#products">Matrix products</a>
          <a href="#structure">Rank, eigen, SVD</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="vectors">
        <h2 class="section-title"><span class="section-index">6.1</span> Vectors and matrices</h2>
        <div class="prose">
          <p>
            A vector is an ordered list of numbers; a matrix is a rectangular array.
            In this course, vectors are columns and a matrix acts on a vector as a
            linear map:
          </p>
          <div class="formula">
            $$\\mathbf{y}=W\\mathbf{x},\\qquad
              W\\in\\mathbb{R}^{m\\times n},\\quad
              \\mathbf{x}\\in\\mathbb{R}^{n},\\quad
              \\mathbf{y}\\in\\mathbb{R}^{m}$$
          </div>
          <p>
            The dot product measures alignment:
            $\\mathbf{x}\\cdot\\mathbf{y}=\\sum_i x_i y_i
              =\\lVert\\mathbf{x}\\rVert\\lVert\\mathbf{y}\\rVert\\cos\\theta$.
            It is zero for orthogonal vectors.
          </p>
          <p>
            Norms measure size. The $L_2$ norm is
            $\\lVert\\mathbf{x}\\rVert_2=\\sqrt{\\sum_i x_i^2}$; the $L_1$ norm is the
            sum of absolute values. Regularization often penalizes a norm.
          </p>
          <p>
            A matrix can be read in two equivalent ways: as a collection of columns,
            or as a collection of rows. Matrix multiplication combines both views:
            each output entry is a dot product of a row of the left matrix with a
            column of the right matrix.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="products">
        <h2 class="section-title"><span class="section-index">6.2</span> Matrix products and shapes</h2>
        <div class="prose">
          <p>
            If $A\\in\\mathbb{R}^{m\\times k}$ and $B\\in\\mathbb{R}^{k\\times n}$,
            then $AB\\in\\mathbb{R}^{m\\times n}$. The inner dimensions must match:
          </p>
          <div class="formula">
            $$(m\\times k)(k\\times n)\\longrightarrow(m\\times n)$$
          </div>
          <p>
            Matrix multiplication is associative but not commutative:
            $AB\\ne BA$ in general. This is one reason layer order matters.
          </p>
          <p>
            The transpose swaps rows and columns: $(AB)^T=B^TA^T$. In
            backpropagation, transposes are everywhere because a VJP multiplies by
            the Jacobian transpose.
          </p>
          <p>
            An affine layer adds a bias after the matrix product:
            $\\mathbf{y}=W\\mathbf{x}+\\mathbf{b}$. The bias shifts the entire
            hyperplane and is essential: without it, every layer would map the origin
            to the origin.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Shape discipline</p>
              <p>
                Most implementation bugs are shape bugs. Before multiplying, write
                down the shape of every operand; after multiplying, write down the
                result shape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="structure">
        <h2 class="section-title"><span class="section-index">6.3</span> Rank, eigenvalues, and SVD</h2>
        <div class="prose">
          <p>
            The <strong>rank</strong> of a matrix is the dimension of its column
            space. A square matrix is invertible exactly when its rank equals its
            size. The determinant is zero exactly when the matrix is singular and
            collapses space.
          </p>
          <p>
            An eigenvector $\\mathbf{v}$ of $A$ satisfies:
          </p>
          <div class="formula">
            $$A\\mathbf{v}=\\lambda\\mathbf{v}$$
            <div class="formula-caption">The matrix only scales the eigenvector; it does not rotate it.</div>
          </div>
          <p>
            Eigenvalues reveal stability and curvature. A positive-definite matrix
            has all positive eigenvalues; it curves upward in every direction.
          </p>
          <p>
            The singular value decomposition writes any matrix as:
          </p>
          <div class="formula">
            $$A=U\\Sigma V^T$$
          </div>
          <p>
            $U$ and $V$ are orthogonal and $\\Sigma$ is diagonal with non-negative
            singular values. The SVD separates rotation, scaling, and another
            rotation. Truncating the smallest singular values gives the best
            low-rank approximation, which is why it appears in compression and in
            analyzing representation geometry.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">6.4</span> Lab</h2>
        <div data-widget="matrix-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">6.5</span> Check your understanding</h2>
        <div data-widget="linear-algebra-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">6.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(6, [
          "Multiply matrices by hand and explain the row/column interpretation.",
          "Determine whether a matrix product is shape-valid.",
          "Explain rank and why low-rank structure matters.",
          "Compute eigenvalues of a 2×2 matrix.",
          "Explain the geometry of the SVD.",
          "Count parameters in an MLP and in an attention head."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">6.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapters 2–4", source: "Linear algebra, analytic geometry, matrix decompositions" },
          { title: "Strang, MIT 18.06 — selected lectures", source: "Matrices, elimination, eigenvalues, SVD" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 2", source: "Linear algebra reference" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(6)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.matrixLab(root.querySelector('[data-widget="matrix-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="linear-algebra-quiz"]'), {
      id: "linear-algebra",
      chapterId: 6,
      title: "Linear algebra checkpoint",
      subtitle: "Shapes first, arithmetic second.",
      questions: [
        {
          prompt: "What is the shape of $(2\\times3)(3\\times4)$?",
          options: ["2×4", "3×3", "4×2", "2×3"],
          answer: 0,
          explanation: "The inner dimensions match (3), and the outer dimensions give the result: $2\\times4$."
        },
        {
          prompt: "A square matrix with determinant zero is:",
          options: ["Orthogonal", "Singular", "Positive definite", "Symmetric"],
          answer: 1,
          explanation: "A zero determinant means the columns are linearly dependent, so the matrix has no inverse."
        },
        {
          prompt: "Which statement is generally true?",
          options: ["$AB=BA$", "$AB\\ne BA$ in general", "$A+B=AB$", "$A^T=A$"],
          answer: 1,
          explanation: "Matrix multiplication is not commutative; order changes the linear map."
        },
        {
          prompt: "An eigenvector $\\mathbf{v}$ of $A$ satisfies:",
          options: ["$A\\mathbf{v}=0$", "$A\\mathbf{v}=\\lambda\\mathbf{v}$", "$A\\mathbf{v}=\\mathbf{v}^T$", "$A^T\\mathbf{v}=0$"],
          answer: 1,
          explanation: "Eigenvectors are directions that the matrix only scales, by the eigenvalue $\\lambda$."
        },
        {
          prompt: "The SVD writes a matrix as:",
          options: ["$A=U\\Sigma V^T$", "$A=U+V$", "$A=\\Sigma^{-1}$", "$A=UV$"],
          answer: 0,
          explanation: "The SVD factors a matrix into two orthogonal matrices and a diagonal matrix of singular values."
        }
      ]
    });

    MS.ui.bindChecklist(root, 6);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[6] = true;
})();
