import ukRaw from "../messages/uk.json";
import enRaw from "../messages/en.json";

export const LOCALES = ["uk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ddteam-locale";

type NestedObject = { [key: string]: string | NestedObject };

function flatten(obj: NestedObject, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      Object.assign(acc, flatten(v as NestedObject, key));
    } else {
      acc[key] = v as string;
    }
    return acc;
  }, {});
}

const messagesMap: Record<Locale, Record<string, string>> = {
  uk: flatten(ukRaw as NestedObject),
  en: flatten(enRaw as NestedObject),
};

export function getMessages(locale: Locale): Record<string, string> {
  return messagesMap[locale] ?? messagesMap.uk;
}

export function t(
  messages: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>
): string {
  let str = messages[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
