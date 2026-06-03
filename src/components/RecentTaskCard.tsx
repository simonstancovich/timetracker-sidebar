import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { PlayIcon } from "../icons/PlayIcon";
import * as s from "./RecentTaskCard.css";

interface Props {
  index: number;
  company: string;
  project: string;
  onPlay: () => void;
}

const CHART_KEYS = ["0", "1", "2", "3"] as const;

export function RecentTaskCard({ index, company, project, onPlay }: Props) {
  const idx = CHART_KEYS[index % CHART_KEYS.length]!;
  return (
    <prim.Stack direction="row" align="center" className={s.card}>
      <prim.Stack as="span" inline className={cx(s.dot, s.dotColor[idx])}>{null}</prim.Stack>
      <prim.Stack flex1 minWidth0>
        <prim.Text as="span" className={s.title}>
          {company}
        </prim.Text>
        <prim.Text as="span" className={s.subtitle}>
          {project}
        </prim.Text>
      </prim.Stack>
      <prim.IconButton
        variant="solid"
        shape="circle"
        size="md"
        onClick={onPlay}
        aria-label={`Start ${company} — ${project}`}
        className={s.playBtn}
      >
        <PlayIcon size={13} />
      </prim.IconButton>
    </prim.Stack>
  );
}
