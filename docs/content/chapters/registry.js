/* Chapter registry: metadata for every chapter in the study plan. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;

  MS.parts = [
    "Part 0 — Orientation",
    "Part I — Mathematical Foundations",
    "Part II — Neural Networks and Backpropagation",
    "Part III — Sequence Models",
    "Part IV — Transformers",
    "Part V — Capstone Blueprint"
  ];

  MS.chapters = [
    {
      id: 1,
      part: "Part 0 — Orientation",
      title: "Orientation: What \"From Scratch\" Really Means",
      short: "Orientation",
      hours: 4
    },
    {
      id: 2,
      part: "Part I — Mathematical Foundations",
      title: "Functions, Limits, Continuity, and the Derivative",
      short: "Functions and limits",
      hours: 10
    },
    {
      id: 3,
      part: "Part I — Mathematical Foundations",
      title: "Differentiation Rules and the Chain Rule",
      short: "Differentiation rules",
      hours: 12
    },
    {
      id: 4,
      part: "Part I — Mathematical Foundations",
      title: "Optimization in One Variable",
      short: "One-variable optimization",
      hours: 10
    },
    {
      id: 5,
      part: "Part I — Mathematical Foundations",
      title: "Multivariable Calculus: Gradients, Jacobians, Hessians",
      short: "Multivariable calculus",
      hours: 16
    },
    {
      id: 6,
      part: "Part I — Mathematical Foundations",
      title: "Linear Algebra for Neural Networks",
      short: "Linear algebra",
      hours: 16
    },
    {
      id: 7,
      part: "Part I — Mathematical Foundations",
      title: "Probability, Statistics, and Information Theory",
      short: "Probability and information",
      hours: 14
    },
    {
      id: 8,
      part: "Part II — Neural Networks and Backpropagation",
      title: "From Linear Models to Neural Networks",
      short: "Neural network foundations",
      hours: 12
    },
    {
      id: 9,
      part: "Part II — Neural Networks and Backpropagation",
      title: "Backpropagation from Scratch",
      short: "Backpropagation",
      hours: 20
    },
    {
      id: 10,
      part: "Part II — Neural Networks and Backpropagation",
      title: "Training Neural Networks",
      short: "Training neural networks",
      hours: 18
    },
    {
      id: 11,
      part: "Part III — Sequence Models",
      title: "Recurrent Neural Networks and Backpropagation Through Time",
      short: "RNNs and BPTT",
      hours: 16
    },
    {
      id: 12,
      part: "Part III — Sequence Models",
      title: "Long Short-Term Memory (LSTM)",
      short: "LSTM",
      hours: 14
    },
    {
      id: 13,
      part: "Part III — Sequence Models",
      title: "Gated Recurrent Unit (GRU)",
      short: "GRU",
      hours: 10
    },
    {
      id: 14,
      part: "Part III — Sequence Models",
      title: "Sequence-to-Sequence and the Road to Attention",
      short: "Seq2seq and attention",
      hours: 12
    },
    {
      id: 15,
      part: "Part IV — Transformers",
      title: "The Attention Mechanism",
      short: "Attention",
      hours: 14
    },
    {
      id: 16,
      part: "Part IV — Transformers",
      title: "The Transformer Architecture",
      short: "Transformer architecture",
      hours: 20
    },
    {
      id: 17,
      part: "Part IV — Transformers",
      title: "From Transformer to LLM",
      short: "From Transformer to LLM",
      hours: 16
    },
    {
      id: 18,
      part: "Part V — Capstone Blueprint",
      title: "Capstone Blueprint: Design Your LLM",
      short: "Capstone blueprint",
      hours: 8
    }
  ];

  MS.getChapter = function (id) {
    return MS.chapters.find(function (chapter) {
      return chapter.id === Number(id);
    }) || null;
  };
})();
