import { auth } from "@/lib/auth";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { ParallaxHero } from "@/components/animations/ParallaxHero";
import { KPIDashboard } from "@/components/dashboard/KPIDashboard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <DiagonalGrid>
      <div className="pb-20">
        <ParallaxHero className="relative pt-12 pb-10 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <DashboardHero email={session?.user.email ?? ""} />
          </div>
        </ParallaxHero>

        <div className="max-w-6xl mx-auto px-6">
          <KPIDashboard />
        </div>
      </div>
    </DiagonalGrid>
  );
}
