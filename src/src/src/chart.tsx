/** @jsx createElement */
// src/chart.tsx

import { createElement, ComponentProps } from "./jsx-runtime";
import { DataPoint } from "./data-service";

export type ChartType = "line" | "bar" | "pie";

export interface ChartProps extends ComponentProps {
  data: DataPoint[];
  type?: ChartType;
  width?: number;
  height?: number;
  colors?: string[];
  // callbacks
  onPointHover?: (point: DataPoint | null) => void;
  onPointClick?: (point: DataPoint | null) => void;
}

// Utility: map categories to colors
const DEFAULT_COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"];

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  c.style.width = width + "px";
  c.style.height = height + "px";
  return c;
}

// Hit-testing structures
interface HitItem {
  id: number;
  x: number;
  y: number;
  r: number;
  data: DataPoint;
}

// Draw helpers
function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: DataPoint[],
  colors: string[],
  hitItems: HitItem[]
) {
  if (!data.length) return;
  const padding = 30;
  const left = padding;
  const right = w - padding;
  const top = padding;
  const bottom = h - padding;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (right - left) / (data.length - 1 || 1);

  ctx.lineWidth = 2;
  ctx.strokeStyle = colors[0] || "#4e79a7";
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = left + i * stepX;
    const y = bottom - ((d.value - min) / span) * (bottom - top);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    // mark hit
    hitItems.push({ id: d.id, x, y, r: 6, data: d });
  });
  ctx.stroke();

  // points
  ctx.fillStyle = colors[0] || "#4e79a7";
  data.forEach((d, i) => {
    const x = left + i * stepX;
    const y = bottom - ((d.value - min) / span) * (bottom - top);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: DataPoint[],
  colors: string[],
  hitItems: HitItem[]
) {
  if (!data.length) return;
  const padding = 30;
  const left = padding;
  const right = w - padding;
  const top = padding;
  const bottom = h - padding;

  const values = data.map((d) => d.value);
  const min = 0; // start bars from 0
  const max = Math.max(...values);
  const span = max - min || 1;
  const barWidth = Math.max(6, (right - left) / data.length - 6);
  data.forEach((d, i) => {
    const x = left + i * ((right - left) / data.length) + 4;
    const barH = ((d.value - min) / span) * (bottom - top);
    const y = bottom - barH;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y, barWidth, barH);
    // register hit item as rectangle approximated by circle center
    hitItems.push({
      id: d.id,
      x: x + barWidth / 2,
      y: y + barH / 2,
      r: Math.max(6, barWidth / 2),
      data: d,
    });
  });
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: DataPoint[],
  colors: string[],
  hitItems: HitItem[]
) {
  if (!data.length) return;
  // Aggregate by category
  const byCat = new Map<string, number>();
  for (const d of data) {
    byCat.set(d.category, (byCat.get(d.category) || 0) + d.value);
  }
  const total = Array.from(byCat.values()).reduce((a, b) => a + b, 0) || 1;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 20;
  let start = -Math.PI / 2;
  let idx = 0;
  for (const [cat, val] of Array.from(byCat.entries())) {
    const angle = (val / total) * Math.PI * 2;
    const end = start + angle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fill();

    // approximate hit with arc center
    const mid = (start + end) / 2;
    const hx = cx + Math.cos(mid) * (r * 0.6);
    const hy = cy + Math.sin(mid) * (r * 0.6);
    // store a synthetic DataPoint (id = idx)
    const synthetic: DataPoint = {
      id: idx,
      category: cat,
      value: val,
      timestamp: Date.now(),
    };
    hitItems.push({ id: idx, x: hx, y: hy, r: r * 0.6, data: synthetic });

    start = end;
    idx++;
  }
}

// Hit test: return first item under (mx,my)
function hitTest(
  hitItems: HitItem[],
  mx: number,
  my: number
): DataPoint | null {
  for (const item of hitItems) {
    const dx = mx - item.x;
    const dy = my - item.y;
    if (dx * dx + dy * dy <= item.r * item.r) return item.data;
  }
  return null;
}

// Chart component
const Chart = (props: ChartProps) => {
  const {
    data = [],
    type = "line",
    width = 600,
    height = 300,
    colors = DEFAULT_COLORS,
    onPointHover,
    onPointClick,
  } = props;

  // create canvas element and draw on it
  // We'll create a canvas element and attach event listeners
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const hitItems: HitItem[] = [];

  // draw background
  clear(ctx, width, height);

  // choose drawing by type
  if (type === "line") {
    drawLineChart(ctx, width, height, data, colors, hitItems);
  } else if (type === "bar") {
    drawBarChart(ctx, width, height, data, colors, hitItems);
  } else if (type === "pie") {
    drawPieChart(ctx, width, height, data, colors, hitItems);
  }

  // attach mouse events
  canvas.onmousemove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(hitItems, mx, my);
    if (onPointHover) onPointHover(hit);
  };

  canvas.onclick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(hitItems, mx, my);
    if (onPointClick) onPointClick(hit);
  };

  // Return canvas element as a DOM node wrapped by VNode
  // We can't return HTMLCanvasElement directly as string/number; rather createElement('div', null, canvas) won't work
  // Instead, return a VNode that renderToDOM will create element and we append canvas into it.
  return createElement(
    "div",
    { style: { display: "flex", justifyContent: "center" } },
    // container div will receive the canvas as a child DOM node by using a ref
    createElement("div", {
      ref: (el: HTMLElement) => {
        if (!el) return;
        // clear and append canvas (avoid duplicate)
        el.innerHTML = "";
        el.appendChild(canvas);
      },
    })
  );
};

export { Chart };
