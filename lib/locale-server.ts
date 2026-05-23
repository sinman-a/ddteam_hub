import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, getMessages, t as tFn, type Locale } from "./i18n";

export function getLocale(): Locale {
  const cookieStore = cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export function getServerT() {
  const locale = getLocale();
  const messages = getMessages(locale);
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) => tFn(messages, key, vars),
  };
}
