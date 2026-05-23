"use client";

import { FadeInSection } from "@/components/animations/FadeInSection";
import { useLocale } from "@/lib/locale-context";

export function DashboardHero({ email }: { email: string }) {
  const { t } = useLocale();

  return (
    <FadeInSection>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {t("dashboard.subtitle")}
      </p>
      <h1 className="text-5xl sm:text-6xl font-black tracking-tightest text-gradient mb-2">
        {t("dashboard.title")}
      </h1>
      <p className="text-gray-500 text-base">
        {t("dashboard.welcome")}{" "}
        <span className="text-gray-700 font-medium">{email}</span>
      </p>
    </FadeInSection>
  );
}
