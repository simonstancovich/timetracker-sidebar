import { useCallback, useEffect, useRef, useState } from "react";
import { roundUpToQuarter } from "./hours";
import {
  createTodo,
  normalizeTodo,
  TODOS_STORE_KEY,
  type Todo,
  type TodoDraft,
  type TodoFormState,
} from "./todos";

const EMPTY_TODO_DRAFT: TodoFormState = {
  text: "",
  estimate: "",
  planned: "",
  deadline: "",
  co: "",
  pr: "",
};

// Cohesive state for the to-do list — the items themselves, the form draft, the
// currently-active to-do (links logged time back), and the base-hours ref used
// to credit only the new delta when continuing an entry. Persistence is owned
// here too so the load/save effects don't leak into App.
export function useTodos(authed: boolean | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoaded, setTodosLoaded] = useState(false);
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [todoDraft, setTodoDraft] = useState<TodoFormState>(EMPTY_TODO_DRAFT);
  // Hours already on the entry when the active to-do session began, so we only
  // credit the new delta back to the to-do (continuing an entry resumes its time).
  const activeTodoBaseHoursRef = useRef(0);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    window.electronAPI.storeGet(TODOS_STORE_KEY).then((saved) => {
      if (cancelled) return;
      if (Array.isArray(saved))
        setTodos((saved as Todo[]).map(normalizeTodo));
      setTodosLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    if (todosLoaded) window.electronAPI.storeSet(TODOS_STORE_KEY, todos);
  }, [todos, todosLoaded]);

  // Credit a logged session back to the to-do that started it (if any). Uses the
  // same billed (rounded-up-to-15-min) hours the entry is saved with, so the
  // to-do's logged total stays in sync with its entries. Only the delta since the
  // session began counts, so continuing an entry isn't double-counted.
  const accrueTodoHours = useCallback(
    (todoId: string | null, totalHours: number) => {
      if (!todoId) return;
      const billed = roundUpToQuarter(totalHours);
      const delta = +(billed - activeTodoBaseHoursRef.current).toFixed(2);
      if (delta <= 0) return;
      setTodos((ts) =>
        ts.map((td) =>
          td.id === todoId
            ? { ...td, loggedH: +(td.loggedH + delta).toFixed(2) }
            : td,
        ),
      );
    },
    [],
  );

  const addTodo = useCallback(
    (draft: TodoDraft) => setTodos((ts) => [createTodo(draft), ...ts]),
    [],
  );

  const updateTodo = useCallback((id: string, draft: TodoDraft) => {
    setTodos((ts) =>
      ts.map((td) =>
        td.id === id
          ? {
              ...td,
              text: draft.text,
              estimateH: draft.estimateH,
              plannedDate: draft.plannedDate,
              deadline: draft.deadline,
              companyId: draft.companyId,
              companyName: draft.companyName,
              projectId: draft.projectId,
              projectName: draft.projectName,
            }
          : td,
      ),
    );
  }, []);

  const toggleTodo = useCallback(
    (id: string) =>
      setTodos((ts) =>
        ts.map((td) => (td.id === id ? { ...td, done: !td.done } : td)),
      ),
    [],
  );

  const deleteTodo = useCallback(
    (id: string) => setTodos((ts) => ts.filter((td) => td.id !== id)),
    [],
  );

  // The estimated to-do (if any) a tracked task belongs to, so logged entries
  // and the running timer can show progress against its estimate.
  const estimatedTodoFor = useCallback(
    (cid: string, prid: string, desc: string) =>
      todos.find(
        (td) =>
          td.estimateH > 0 &&
          td.companyId === cid &&
          td.projectId === prid &&
          td.text === desc,
      ),
    [todos],
  );

  const resetTodoForm = useCallback(() => {
    setEditingTodoId(null);
    setTodoDraft(EMPTY_TODO_DRAFT);
  }, []);

  return {
    todos, setTodos, todosLoaded,
    activeTodoId, setActiveTodoId,
    editingTodoId, setEditingTodoId,
    todoDraft, setTodoDraft,
    activeTodoBaseHoursRef,
    accrueTodoHours,
    addTodo, updateTodo, toggleTodo, deleteTodo,
    estimatedTodoFor,
    resetTodoForm,
  };
}

export type UseTodos = ReturnType<typeof useTodos>;
