/** @jsx createElement */
import { createElement, renderToDOM } from "./jsx-runtime";

// Simple test component
const TestComponent = () => createElement("div", null, "Hello Performance!");

export function runBenchmarks() {
  console.log("🚀 Performance Benchmark Starting...");

  // Benchmark createElement speed
  const startCreate = performance.now();
  for (let i = 0; i < 10000; i++) {
    createElement("div", null, "Item ", i);
  }
  const endCreate = performance.now();
  console.log(
    `⚡ createElement x10k: ${(endCreate - startCreate).toFixed(2)}ms`
  );

  // Benchmark renderToDOM
  const vnode = createElement(
    "div",
    null,
    createElement("h1", null, "Benchmark Test"),
    createElement(TestComponent, null),
    createElement("p", null, "Testing render performance")
  );

  const container = document.createElement("div");
  document.body.appendChild(container);

  const startRender = performance.now();
  for (let i = 0; i < 100; i++) {
    container.innerHTML = "";
    container.appendChild(renderToDOM(vnode));
  }
  const endRender = performance.now();

  console.log(`🧱 renderToDOM x100: ${(endRender - startRender).toFixed(2)}ms`);
  console.log("✅ Benchmark finished.");
}
