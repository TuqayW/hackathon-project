import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <DashboardHeader user={session.user} />

        <div className="flex">
          {/* Sidebar Navigation */}
          <DashboardNav role={session.user.role} />

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}


