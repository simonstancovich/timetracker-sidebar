import { t as tr, type Lang } from '../lib/i18n'
import { Stack, IconTile, Heading, Text, Button } from '../primitives'

interface Props {
  onLogin: () => void
  lang?: Lang
}

export function LoginScreen({ onLogin, lang = 'en' }: Props) {
  const t = (k: Parameters<typeof tr>[0], v?: Parameters<typeof tr>[2]) => tr(k, lang, v)
  return (
    <Stack align="center" justify="center" gap="lg" padding="xl" fullHeight>
      <IconTile size="xl">⏱</IconTile>
      <Stack align="center" gap="xs">
        <Heading level={1}>DevCore TimeTracker</Heading>
        <Text color="tertiary" align="center" maxWidth={280}>
          {t('login.pitch')}
        </Text>
      </Stack>
      <Button onClick={onLogin}>{t('login.signIn')}</Button>
    </Stack>
  )
}
