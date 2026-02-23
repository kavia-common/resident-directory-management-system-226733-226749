import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Resident Directory",
  description:
    "Retro-themed resident directory dashboard with search, admin tools, CSV import/export, and audit log.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
