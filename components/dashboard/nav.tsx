"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Wallet,
  TrendingUp,
  Building2,
  Sparkles,
  Settings,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "PERSONAL" | "COMPANY";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["PERSONAL", "COMPANY"],
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    roles: ["PERSONAL", "COMPANY"],
  },
  {
    label: "Income",
    href: "/dashboard/income",
    icon: TrendingUp,
    roles: ["PERSONAL", "COMPANY"],
  },
  {
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: Wallet,
    roles: ["PERSONAL", "COMPANY"],
  },
  {
    label: "Savings",
    href: "/dashboard/savings",
    icon: PiggyBank,
    roles: ["PERSONAL"],
  },
  {
    label: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["COMPANY"],
  },
  {
    label: "AI Analysis",
    href: "/dashboard/analyze",
    icon: Sparkles,
    roles: ["COMPANY"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["PERSONAL", "COMPANY"],
  },
];

interface DashboardNavProps {
  role: UserRole;
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 border-r bg-card/50 backdrop-blur-xl z-40">
        <nav className="flex-1 p-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId={`activeNav-desktop-${item.href}`}
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Role Badge */}
        <div className="p-4 border-t">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium",
              role === "COMPANY"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-emerald-500/10 text-emerald-500"
            )}
          >
            {role === "COMPANY" ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <PiggyBank className="w-4 h-4" />
            )}
            {role === "COMPANY" ? "Business Account" : "Personal Account"}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-card/80 backdrop-blur-xl z-50">
        <div className="flex items-center justify-around py-2">
          {filteredItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

