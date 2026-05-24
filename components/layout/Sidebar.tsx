"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  UserCog,
  Plug,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const { t } = useLocale();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/team", label: t("nav.team"), icon: Users },
  ];

  const adminItems = [
    { href: "/admin/profiles", label: t("nav.profiles"), icon: UserCog },
    { href: "/admin/integration", label: t("nav.azure"), icon: Plug },
    { href: "/admin/users", label: t("nav.users"), icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white/80 apple-blur border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">DD</span>
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">
            DDTeam Hub
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1",
                active
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                {t("nav.admin_section")}
              </span>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1",
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
