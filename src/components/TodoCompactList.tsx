import * as prim from "../primitives";
import type { Todo } from "../lib/todos";
import { TodoCompactRow } from "./TodoCompactRow";
import * as s from "./TodoCompactList.css";

interface Props {
  title: string;
  todos: Todo[];
  activeTaskKey: string | null;
  showPressure: boolean;
  onStart: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoCompactList({
  title,
  todos,
  activeTaskKey,
  showPressure,
  onStart,
  onEdit,
}: Props) {
  if (todos.length === 0) return null;
  return (
    <prim.Stack className={s.wrap}>
      <prim.Stack className={s.header}>
        <prim.Text as="span" className={s.title}>
          {title}
        </prim.Text>
        <prim.Text as="span" className={s.count}>
          {todos.length}
        </prim.Text>
      </prim.Stack>
      {todos.map((todo) => (
        <TodoCompactRow
          key={todo.id}
          todo={todo}
          activeTaskKey={activeTaskKey}
          showPressure={showPressure}
          onStart={onStart}
          onEdit={onEdit}
        />
      ))}
    </prim.Stack>
  );
}
