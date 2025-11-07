/** @jsx createElement */
import { createElement, useState, ComponentProps } from "./jsx-runtime";

// --- Interface cho Todo ---
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// --- Props cho từng Component ---
interface TodoItemProps extends ComponentProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface TodoListProps extends ComponentProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

interface AddTodoFormProps extends ComponentProps {
  onAdd: (text: string) => void;
}

// --- Component TodoItem ---
const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  const textStyle = {
    textDecoration: todo.completed ? "line-through" : "none",
    color: todo.completed ? "#888" : "black",
  };

  return createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "6px",
        borderBottom: "1px solid #ddd",
        padding: "4px 0",
      },
    },
    createElement(
      "div",
      {
        style: { display: "flex", alignItems: "center", gap: "8px" },
      },
      createElement("input", {
        type: "checkbox",
        checked: todo.completed,
        onChange: () => onToggle(todo.id),
      }),
      createElement("span", { style: textStyle }, todo.text)
    ),
    createElement(
      "button",
      {
        style: {
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px 8px",
        },
        onClick: () => onDelete(todo.id),
      },
      "Delete"
    )
  );
};

// --- Component TodoList ---
const TodoList = ({ todos, onToggle, onDelete }: TodoListProps) => {
  return createElement(
    "div",
    null,
    ...todos.map((todo) =>
      createElement(TodoItem, {
        key: todo.id, // (optional, không ảnh hưởng render thủ công)
        todo,
        onToggle,
        onDelete,
      })
    )
  );
};

// --- Component AddTodoForm ---
const AddTodoForm = ({ onAdd }: AddTodoFormProps) => {
  const [getValue, setValue] = useState<string>("");

  const handleSubmit = (e?: Event) => {
    if (e) e.preventDefault();
    const value = getValue().trim();
    if (value !== "") {
      onAdd(value);
      setValue("");
    }
  };

  return createElement(
    "form",
    {
      onSubmit: (e: Event) => {
        e.preventDefault();
        handleSubmit();
      },
      style: { marginBottom: "10px" },
    },
    createElement("input", {
      type: "text",
      value: getValue(),
      placeholder: "Enter a new task...",
      onInput: (e: any) => setValue(e.target.value),
      style: {
        padding: "8px",
        width: "200px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        marginRight: "8px",
      },
    }),
    createElement(
      "button",
      {
        type: "submit",
        style: {
          padding: "8px 12px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        },
      },
      "Add"
    )
  );
};

// --- Component chính: TodoApp ---
const TodoApp = () => {
  const [getTodos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([...getTodos(), newTodo]);
  };

  const toggleTodo = (id: number) => {
    const updated = getTodos().map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updated);
  };

  const deleteTodo = (id: number) => {
    const filtered = getTodos().filter((t) => t.id !== id);
    setTodos(filtered);
  };

  const todos = getTodos();
  const completedCount = todos.filter((t) => t.completed).length;

  return createElement(
    "div",
    {
      className: "todo-app",
      style: {
        width: "300px",
        margin: "50px auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        fontFamily: "Arial",
      },
    },
    createElement("h2", { style: { textAlign: "center" } }, "✅ Todo List"),
    createElement(AddTodoForm, { onAdd: addTodo }),
    createElement(TodoList, {
      todos,
      onToggle: toggleTodo,
      onDelete: deleteTodo,
    }),
    createElement(
      "p",
      { style: { textAlign: "center", marginTop: "10px" } },
      `Total: ${todos.length} | Completed: ${completedCount}`
    )
  );
};

export { TodoApp };
