// Back-compat shim. Greetings now live in /locales/{en,sv}.json and are picked
// via the i18n adapter. Keep this file so existing imports continue to work.
export { pickGreeting } from './i18n'
