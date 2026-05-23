import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { getLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  title: "DDTeam Hub",
  description: "Команда. Метрики. Прозорість.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();

  return (
    <html lang={locale}>
      <body>
        <Providers initialLocale={locale}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
