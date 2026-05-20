import { useTranslation } from "../lib/i18n";
import { Stack, IconTile, Heading, Text, Button } from "../primitives";
import { StopwatchIcon } from "../icons/StopwatchIcon";

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const { t } = useTranslation();
  return (
    <Stack align="center" justify="center" gap="lg" padding="xl" fullHeight>
      <IconTile size="xl">
        <StopwatchIcon />
      </IconTile>
      <Stack align="center" gap="xs">
        <Heading level={1}>DevCore TimeTracker</Heading>
        <Text color="tertiary" align="center" maxWidth="prose">
          {t("login.pitch")}
        </Text>
      </Stack>
      <Button onClick={onLogin}>{t("login.signIn")}</Button>
    </Stack>
  );
}
