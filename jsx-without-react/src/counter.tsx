/** @jsx createElement */
import { createElement, useState, ComponentProps } from "./jsx-runtime";

// --- Định nghĩa props cho Button ---
interface ButtonProps extends ComponentProps {
  onClick?: () => void;
  className?: string;
}

// --- Component Button ---
const Button = ({ onClick, className, children }: ButtonProps) => {
  return createElement(
    "button",
    {
      onClick,
      className: className || "btn",
      style: {
        margin: "5px",
        padding: "8px 12px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      },
    },
    ...(children || [])
  );
};

// --- Định nghĩa props cho Counter ---
interface CounterProps extends ComponentProps {
  initialCount?: number;
}

// --- Component Counter ---
const Counter = ({ initialCount = 0 }: CounterProps) => {
  // STEP 1: Tạo state cho count
  const [getCount, setCount] = useState<number>(initialCount);

  // STEP 2: Các hàm thay đổi state
  const increment = () => setCount(getCount() + 1);
  const decrement = () => setCount(getCount() - 1);
  const reset = () => setCount(initialCount);

  // STEP 3: JSX hiển thị
  return createElement(
    "div",
    { className: "counter", style: { textAlign: "center", marginTop: "40px" } },
    createElement("h2", null, `Count: ${getCount()}`),
    createElement(
      "div",
      { className: "buttons" },
      createElement(Button, { onClick: increment }, "+"),
      createElement(Button, { onClick: decrement }, "−"),
      createElement(Button, { onClick: reset }, "Reset")
    )
  );
};

// --- Xuất Counter ---
export { Counter };
