"use client";

import { useState, useRef, useEffect } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  createdAt: Date;
};

const STORAGE_KEY = "todos";

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: Todo & { createdAt: string }) => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }));
  } catch {
    return [];
  }
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: Date.now(), text, done: false, createdAt: new Date() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <main className="min-h-screen flex flex-col items-center py-16 px-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl">✓</span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            タスク管理
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          今日やることを整理しよう
        </p>
      </div>

      <div className="w-full max-w-lg">
        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-violet-600 text-white text-sm font-medium shadow-sm hover:bg-violet-500 active:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            追加
          </button>
        </div>

        {/* Stats + Filter */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-400">
              残り <span className="font-semibold text-slate-600">{activeCount}</span> 件
              {doneCount > 0 && (
                <> ／ 完了 <span className="font-semibold text-slate-600">{doneCount}</span> 件</>
              )}
            </p>
            <div className="flex gap-1">
              {(["all", "active", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    filter === f
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Todo List */}
        <ul className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <li className="text-center py-12 text-slate-300 text-sm select-none">
              {todos.length === 0
                ? "タスクを追加してみましょう"
                : "該当するタスクがありません"}
            </li>
          )}
          {filtered.map((todo) => (
            <li
              key={todo.id}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border shadow-sm transition ${
                todo.done
                  ? "border-slate-100 opacity-60"
                  : "border-slate-200 hover:border-violet-200 hover:shadow-md"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.done ? "未完了に戻す" : "完了にする"}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  todo.done
                    ? "border-violet-500 bg-violet-500"
                    : "border-slate-300 hover:border-violet-400"
                }`}
              >
                {todo.done && (
                  <svg
                    className="w-3 h-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span
                className={`flex-1 text-sm leading-relaxed ${
                  todo.done ? "line-through text-slate-400" : "text-slate-700"
                }`}
              >
                {todo.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="削除"
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="w-3.5 h-3.5"
                >
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* Clear done */}
        {doneCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}
              className="text-xs text-slate-400 hover:text-red-400 transition"
            >
              完了済みをすべて削除
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
