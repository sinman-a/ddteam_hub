import { db } from "@/lib/db";
import { teamProfiles } from "@/lib/schema";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { ParallaxHero } from "@/components/animations/ParallaxHero";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { TeamGrid } from "@/components/team/TeamGrid";
import type { TeamProfile } from "@/types/profile";
import { getServerT } from "@/lib/locale-server";
import { BackButton } from "@/components/team/BackButton";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { t } = getServerT();

  const profiles = await db
    .select()
    .from(teamProfiles)
    .orderBy(teamProfiles.name) as TeamProfile[];

  return (
    <DiagonalGrid>
      <div className="pb-20">
        <ParallaxHero className="relative pt-20 pb-16 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <BackButton label={t("common.back")} />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">
                {t("team.subtitle")}
              </p>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tightest text-gradient mb-4">
                {t("team.title")}
              </h1>
              <p className="text-lg text-gray-500 max-w-md">
                {t("team.count", { count: profiles.length })}
              </p>
            </FadeInSection>
          </div>
        </ParallaxHero>

        <div className="max-w-6xl mx-auto px-6">
          <TeamGrid profiles={profiles} />
        </div>
      </div>
    </DiagonalGrid>
  );
}
