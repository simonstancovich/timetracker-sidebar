import { DisplayText, MonoText, Stack } from "../primitives";

interface Props {
  title: string;
  hint?: string;
}

export function ChapterHeading({ title, hint }: Props) {
  return (
    <Stack
      direction="row"
      justify="spaceBetween"
      align="baseline"
      gap="md"
      paddingBottom="xs"
    >
      <Stack direction="row" align="baseline" gap="xs">
        <DisplayText size="2xl" italic color="accent">
          §
        </DisplayText>
        <DisplayText size="2xl" italic>
          {title}
        </DisplayText>
      </Stack>
      {hint && (
        <MonoText
          size="xs"
          weight="semibold"
          color="faint"
          tracking="loosest"
          transform="uppercase"
        >
          — {hint} —
        </MonoText>
      )}
    </Stack>
  );
}
