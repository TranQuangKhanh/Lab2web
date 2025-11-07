/** @jsx createElement */
// Exercise 3.2: Component Library
// Compatible with jsx-runtime.ts provided by Khanh Tran

import { createElement, ComponentProps } from "./jsx-runtime";

// --- 1️⃣ Card Component ---
interface CardProps extends ComponentProps {
  title?: string;
  className?: string;
  onClick?: () => void;
}

const Card = ({ title, className, onClick, children }: CardProps) => {
  return createElement(
    "div",
    {
      className: className || "card",
      onClick,
      style: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        backgroundColor: "white",
      },
    },
    title
      ? createElement("h3", { style: { marginBottom: "8px" } }, title)
      : null,
    ...(children || [])
  );
};

// --- 2️⃣ Modal Component ---
interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return createElement("div", null); // Hidden modal

  const handleOverlayClick = (e: any) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return createElement(
    "div",
    {
      className: "modal-overlay",
      onClick: handleOverlayClick,
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "999",
      },
    },
    createElement(
      "div",
      {
        className: "modal-content",
        style: {
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "300px",
          maxWidth: "90%",
          textAlign: "center",
        },
      },
      title
        ? createElement("h3", { style: { marginBottom: "12px" } }, title)
        : null,
      ...(children || []),
      createElement(
        "button",
        {
          onClick: onClose,
          style: {
            marginTop: "16px",
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          },
        },
        "Close"
      )
    )
  );
};

// --- 3️⃣ Form Component ---
interface FormProps extends ComponentProps {
  onSubmit: (data: Record<string, string>) => void;
  className?: string;
}

const Form = ({ onSubmit, className, children }: FormProps) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    onSubmit(data);
  };

  return createElement(
    "form",
    { className: className || "form", onSubmit: handleSubmit },
    ...(children || [])
  );
};

// --- 4️⃣ Input Component ---
interface InputProps extends ComponentProps {
  type?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}

const Input = ({
  type = "text",
  value = "",
  placeholder,
  className,
  onChange,
}: InputProps) => {
  return createElement("input", {
    type,
    value,
    placeholder,
    className: className || "input",
    onInput: (e: any) => onChange(e.target.value),
    style: {
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      width: "100%",
      boxSizing: "border-box",
    },
  });
};

export { Card, Modal, Form, Input };
