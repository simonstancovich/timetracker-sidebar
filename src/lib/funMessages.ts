// Back-compat shim. Pool now lives in /locales/{en,sv}.json. Old name
// `pickRandomMessage` re-exported as an alias so existing call sites work.
export { pickFunMessage as pickRandomMessage } from './i18n'
