"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale-context";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function TopBar() {
  const { data: session } = useSession();
  const { t } = useLocale();

  if (!session) return null;

  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="h-14 bg-white/80 apple-blur border-b border-gray-100 flex items-center justify-end px-6 sticky top-0 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-full hover:bg-gray-100 p-1 pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-gray-900 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {session.user.email}
            </span>
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {session.user.role}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-gray-500">
            {session.user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="gap-2 text-sm flex items-center w-full cursor-pointer">
              <User size={14} />
              {t("topbar.profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-sm text-red-600"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={14} />
            {t("topbar.sign_out")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LanguageSwitcher />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
