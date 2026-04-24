import { ProtectedAppShell } from "@/components/protected-app-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
