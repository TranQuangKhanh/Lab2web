/** @jsx createElement */
import { createElement, mount, useState } from "./jsx-runtime";
import { Counter } from "./counter";
import { TodoApp } from "./todo-app";
import { Card, Modal, Form, Input } from "./components";

// Hàm main — nơi chạy toàn bộ ví dụ
const Main = () => {
  // State quản lý Modal
  const [getOpen, setOpen] = useState<boolean>(false);
  const [getName, setName] = useState<string>("");

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  // JSX demo toàn bộ component
  return createElement(
    "div",
    { className: "app", style: { padding: "20px", fontFamily: "Arial" } },

    createElement("h1", null, "JSX Runtime Demo (Lab 2: Exercises 1–3)"),

    // --- Exercise 1.2 + 1.3 ---
    createElement(
      "section",
      null,
      createElement("h2", null, "Exercise 1 & 2: Counter Component"),
      createElement(Counter, { initialCount: 5 })
    ),

    // --- Exercise 2.2 ---
    createElement(
      "section",
      null,
      createElement("h2", null, "Exercise 2.2: Todo App"),
      createElement(TodoApp, null)
    ),

    // --- Exercise 3.2 ---
    createElement(
      "section",
      null,
      createElement("h2", null, "Exercise 3.2: Component Library Demo"),
      createElement(
        Card,
        {
          title: "Reusable Components",
          className: "demo-card",
          onClick: openModal,
        },
        createElement("p", null, "Click this card to open a modal!")
      ),

      // --- Modal Demo ---
      createElement(
        Modal,
        { isOpen: getOpen(), onClose: closeModal, title: "Demo Modal" },
        createElement(
          Form,
          {
            onSubmit: () => {
              alert(`Submitted: ${getName()}`);
              closeModal();
            },
            className: "demo-form",
          },
          createElement("h3", null, "Enter your name:"),
          createElement(Input, {
            name: "name",
            placeholder: "Your name",
            value: getName(),
            onChange: (v: string) => setName(v),
          }),
          createElement(
            "button",
            {
              type: "submit",
              style: {
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              },
            },
            "Submit"
          )
        )
      )
    )
  );
};
import { runBenchmarks } from "./performance-test";
runBenchmarks();

// Mount toàn bộ app
const root = document.getElementById("app");
if (root) {
  mount(createElement(Main, null), root);
}
