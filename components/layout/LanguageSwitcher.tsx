"use client";

import { useLocale } from "@/lib/locale-context";
import { LOCALES } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="px-2 pb-1">
      <p className="text-xs text-gray-600 mb-1 px-1">{t("lang.switcher_label")}</p>
      <div className="flex gap-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={`flex-1 text-xs px-2 py-1 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1 ${
              locale === l
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t(`lang.${l}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
