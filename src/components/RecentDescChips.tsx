import * as prim from "../primitives";
import type { TimeEntry } from "../api";
import * as s from "./RecentDescChips.css";

interface Props {
  entries: TimeEntry[];
  projectId: string;
  onSelect: (desc: string) => void;
}

export function RecentDescChips({ entries, projectId, onSelect }: Props) {
  const recent = Array.from(
    new Set(
      entries
        .filter((e) => e._project_id === projectId && e.description?.trim())
        .map((e) => e.description.trim()),
    ),
  ).slice(0, 3);
  if (recent.length === 0) return null;
  return (
    <prim.Stack direction="row" className={s.row}>
      {recent.map((d) => (
        <prim.Button
          key={d}
          variant="link"
          onClick={() => onSelect(d)}
          title={d}
          className={s.chip}
        >
          &ldquo;{d}&rdquo;
        </prim.Button>
      ))}
    </prim.Stack>
  );
}
