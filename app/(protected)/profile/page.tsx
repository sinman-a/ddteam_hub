"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { FadeInSection } from "@/components/animations/FadeInSection";
import type { TeamProfile } from "@/types/profile";
import { useLocale } from "@/lib/locale-context";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<TeamProfile | null | undefined>(undefined);
  const { t } = useLocale();

  const fetchProfile = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      setProfile(await res.json());
    } else {
      setProfile(null);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <DiagonalGrid>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <FadeInSection>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
            {t("topbar.profile")}
          </p>
          <h1 className="text-4xl font-black tracking-tightest text-gradient mb-8">
            {t("profile_page.title")}
          </h1>
        </FadeInSection>
        <FadeInSection delay={0.1}>
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <ProfileForm
              profile={profile ?? undefined}
              createUrl="/api/profile"
              onSuccess={fetchProfile}
              onCancel={() => {}}
            />
          </div>
        </FadeInSection>
      </div>
    </DiagonalGrid>
  );
}
