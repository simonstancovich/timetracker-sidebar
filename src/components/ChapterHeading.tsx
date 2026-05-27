import * as prim from "../primitives";

interface Props {
  title: string;
  hint?: string;
}

export function ChapterHeading({ title, hint }: Props) {
  return (
    <prim.Stack
      direction="row"
      justify="spaceBetween"
      align="baseline"
      gap="md"
      paddingBottom="xs"
    >
      <prim.Stack direction="row" align="baseline" gap="xs">
        <prim.DisplayText size="2xl" italic color="accent">
          §
        </prim.DisplayText>
        <prim.DisplayText size="2xl" italic>
          {title}
        </prim.DisplayText>
      </prim.Stack>
      {hint && (
        <prim.MonoText
          size="xs"
          weight="semibold"
          color="faint"
          tracking="loosest"
          transform="uppercase"
        >
          — {hint} —
        </prim.MonoText>
      )}
    </prim.Stack>
  );
}
