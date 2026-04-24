import { ProtectedAppShell } from "@/components/protected-app-shell";

export default function CompetitorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
