import { db } from "@/lib/db";
import { azureSettings } from "@/lib/schema";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { IntegrationForm } from "@/components/admin/IntegrationForm";
import { getServerT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function IntegrationPage() {
  const { t } = getServerT();

  const settings = await db
    .select({
      org: azureSettings.org,
      project: azureSettings.project,
      lastSyncAt: azureSettings.lastSyncAt,
    })
    .from(azureSettings)
    .limit(1);

  const current = settings[0]
    ? {
        org: settings[0].org,
        project: settings[0].project,
        lastSyncAt: settings[0].lastSyncAt?.toISOString() ?? null,
      }
    : null;

  return (
    <DiagonalGrid>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <FadeInSection>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {t("admin.integration_section")}
          </p>
          <h1 className="text-4xl font-black tracking-tightest text-gradient mb-8">
            {t("admin.integration_title")}
          </h1>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <IntegrationForm currentSettings={current} />
        </FadeInSection>
      </div>
    </DiagonalGrid>
  );
}
