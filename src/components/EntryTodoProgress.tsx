import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import type { Todo } from "../lib/todos";
import * as s from "./EntryTodoProgress.css";

interface Props {
  todo: Todo;
  loggedHours: number;
}

export function EntryTodoProgress({ todo, loggedHours }: Props) {
  const complete = loggedHours >= todo.estimateH;
  return (
    <prim.Stack direction="row" align="center" className={s.row}>
      <prim.ProgressBar
        value={loggedHours / todo.estimateH}
        tone={complete ? "green" : "accent"}
        size="mid"
        grow
        className={s.bar}
      />
      <prim.Text as="span" className={cx(s.text, complete && s.textComplete)}>
        {fmtHours(loggedHours)} / {fmtHours(todo.estimateH)}
      </prim.Text>
    </prim.Stack>
  );
}
