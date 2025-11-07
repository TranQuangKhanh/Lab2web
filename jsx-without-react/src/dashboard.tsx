/** @jsx createElement */
// src/dashboard.tsx

import { createElement, useState } from "./jsx-runtime";
import { defaultDataService, DataPoint } from "./data-service";
import { Chart, ChartProps, ChartType } from "./chart";
import { Card } from "./components";

const Dashboard = () => {
  // state
  const [getChartType, setChartType] = useState<ChartType>("line");
  const [getCategory, setCategory] = useState<string | null>(null);
  const [getData, setData] = useState<DataPoint[]>(defaultDataService.getAll());
  const [getRealtime, setRealtime] = useState<boolean>(false);

  // subscribe once (guarded by state flag)
  const [getSubscribed, setSubscribed] = useState<boolean>(false);
  if (!getSubscribed()) {
    defaultDataService.subscribe((snapshot) => {
      // apply category filter
      const filtered = getCategory()
        ? snapshot.filter((d) => d.category === getCategory())
        : snapshot;
      setData(filtered);
    });
    setSubscribed(true);
  }

  // start/stop realtime
  const toggleRealtime = () => {
    if (getRealtime()) {
      defaultDataService.stopRealtime();
      setRealtime(false);
    } else {
      defaultDataService.startRealtime(1500);
      setRealtime(true);
    }
  };

  // manual refresh (re-query)
  const refresh = () => {
    const raw = defaultDataService.getAll();
    const filtered = getCategory()
      ? raw.filter((d) => d.category === getCategory())
      : raw;
    setData(filtered);
  };

  // category list from service
  const categories = ["A", "B", "C", "D"];

  // computed aggregates
  const totalPoints = getData().length;
  const avgValue = totalPoints
    ? Math.round(getData().reduce((s, d) => s + d.value, 0) / totalPoints)
    : 0;

  return createElement(
    "div",
    {
      style: {
        padding: "20px",
        maxWidth: "980px",
        margin: "0 auto",
        fontFamily: "Arial",
      },
    },

    // Header + controls
    createElement(
      "header",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        },
      },
      createElement("h2", null, "📊 Real-time Dashboard"),
      createElement(
        "div",
        null,
        createElement(
          "select",
          {
            value: getChartType(),
            onChange: (e: any) => setChartType(e.target.value as ChartType),
            style: { marginRight: "8px", padding: "6px" },
          },
          createElement("option", { value: "line" }, "Line"),
          createElement("option", { value: "bar" }, "Bar"),
          createElement("option", { value: "pie" }, "Pie")
        ),

        createElement(
          "select",
          {
            value: getCategory() || "",
            onChange: (e: any) => setCategory(e.target.value || null),
            style: { marginRight: "8px", padding: "6px" },
          },
          createElement("option", { value: "" }, "All Categories"),
          ...categories.map((c) => createElement("option", { value: c }, c))
        ),

        createElement(
          "button",
          {
            onClick: toggleRealtime,
            style: { marginRight: "8px", padding: "6px 10px" },
          },
          getRealtime() ? "Stop" : "Start"
        ),
        createElement(
          "button",
          { onClick: refresh, style: { padding: "6px 10px" } },
          "Refresh"
        )
      )
    ),

    // Summary cards
    createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "12px",
          marginBottom: "12px",
          flexWrap: "wrap",
        },
      },
      createElement(
        Card,
        { title: "Points", style: { minWidth: "120px" } },
        createElement("div", null, String(totalPoints))
      ),
      createElement(
        Card,
        { title: "Avg Value", style: { minWidth: "120px" } },
        createElement("div", null, String(avgValue))
      ),
      createElement(
        Card,
        { title: "Category", style: { minWidth: "120px" } },
        createElement("div", null, getCategory() || "All")
      )
    ),

    // Chart area
    createElement(
      "div",
      {
        style: {
          border: "1px solid #eee",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        },
      },
      createElement(Chart, {
        data: getData(),
        type: getChartType(),
        width: 860,
        height: 360,
        onPointHover: (p: DataPoint | null) => {
          // optional: show tooltip — for simplicity we console.log
          // In a real app you'd set a tooltip state
          if (p) {
            // console.log('hover', p);
          }
        },
        onPointClick: (p: DataPoint | null) => {
          if (p) alert(`Clicked point: ${p.category} - ${p.value}`);
        },
      } as Partial<ChartProps> as ChartProps)
    )
  );
};

export { Dashboard };
