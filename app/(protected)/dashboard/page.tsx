import { auth } from "@/lib/auth";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { ParallaxHero } from "@/components/animations/ParallaxHero";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { KPIDashboard } from "@/components/dashboard/KPIDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <DiagonalGrid>
      <div className="pb-20">
        <ParallaxHero className="relative pt-12 pb-10 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <FadeInSection>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Team Performance
              </p>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tightest text-gradient mb-2">
                KPI Дашборд
              </h1>
              <p className="text-gray-500 text-base">
                Вітаємо,{" "}
                <span className="text-gray-700 font-medium">
                  {session?.user.email}
                </span>
              </p>
            </FadeInSection>
          </div>
        </ParallaxHero>

        <div className="max-w-6xl mx-auto px-6">
          <KPIDashboard />
        </div>
      </div>
    </DiagonalGrid>
  );
}
