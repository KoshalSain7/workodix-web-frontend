"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  Star,
  MoreHorizontal,
  Search,
  LogOut,
  QrCode,
  Gift,
  ChevronRight,
  User,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inbox", href: "/inbox", icon: Inbox },
];

const favorites = [
  { name: "Social profile", href: "/profile/social" },
  { name: "Attendance", href: "/attendance" },
  { name: "CTC", href: "/ctc" },
  { name: "Goals and initiatives", href: "/goals" },
  { name: "HR Handbook", href: "/handbook" },
  { name: "Leave balance", href: "/leave-balance" },
  { name: "Letter", href: "/letter" },
  { name: "Payslip", href: "/payslip" },
  { name: "Profile", href: "/profile" },
];

const requests = [
  "Asset",
  "Change goal",
  "Confirm invest",
  "Expense",
  "Expense advance",
  "Helpdesk ticket",
  "Job opening",
  "Leave",
  "Loan",
  "On duty",
  "Propose invest",
  "Reimbursement",
  "Resignation",
  "Restricted holiday",
  "Short leave",
  "Travel",
  "Variable",
];

// Combine all searchable items
const allSearchableItems = [
  ...navigation.map((item) => ({ ...item, category: "Navigation" })),
  ...favorites.map((item) => ({ ...item, category: "Favorites" })),
  ...requests.map((item) => ({
    name: item,
    href: `/request/${item.toLowerCase().replace(/\s+/g, "-")}`,
    category: "Request",
  })),
  { name: "Payslip", href: "/payslip", category: "Recent" },
  { name: "Profile", href: "/profile", category: "Recent" },
  { name: "Offers", href: "/offers", category: "Other" },
  { name: "QR code", href: "/qr-code", category: "Other" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return null; // Return null to show all sections normally
    }

    const query = searchQuery.toLowerCase().trim();
    return allSearchableItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-73px)] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search..."
          />
        </div>

        {/* Show filtered results when searching, otherwise show all sections */}
        {filteredItems ? (
          // Search Results View
          <div className="space-y-2">
            {filteredItems.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Search Results ({filteredItems.length})
                </div>
                <nav className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = "icon" in item ? item.icon : null;
                    return (
                      <Link
                        key={`${item.category}-${item.name}`}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        <span>{item.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        ) : (
          // Normal View (all sections - show everything when no search)
          <>
            {/* Main Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 hover:scale-105",
                      isActive
                        ? "bg-primary text-primary-foreground animate-scale-in"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-200" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Favorites */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>Favorites</span>
              </div>
              <nav className="space-y-1">
                {favorites.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block px-6 py-2 rounded-md text-sm transition-all duration-200 hover:scale-105",
                        isActive
                          ? "bg-accent/20 text-primary font-medium animate-scale-in"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Request */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span>Request</span>
              </div>
              <nav className="space-y-1">
                {requests.map((item) => {
                  const href = `/request/${item.toLowerCase().replace(/\s+/g, "-")}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={item}
                      href={href}
                      className={cn(
                        "block px-6 py-2 rounded-md text-sm transition-all duration-200 hover:scale-105",
                        isActive
                          ? "bg-accent/20 text-primary font-medium animate-scale-in"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Recent Searches */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                <span>Recent Searches</span>
              </div>
              <nav className="space-y-1">
                <Link
                  href="/payslip"
                  className="block px-6 py-2 rounded-md text-sm text-foreground hover:bg-muted"
                >
                  Payslip
                </Link>
                <Link
                  href="/profile"
                  className="block px-6 py-2 rounded-md text-sm text-foreground hover:bg-muted"
                >
                  Profile
                </Link>
              </nav>
            </div>

            {/* View All Button */}
            <Button variant="default" className="w-full">
              View All
            </Button>

            {/* Other Links */}
            <div className="space-y-1 pt-4 border-t border-border">
              <Link
                href="/offers"
                className="block px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              >
                Offers
              </Link>
              <Link
                href="/qr-code"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              >
                <QrCode className="h-4 w-4" />
                QR code
              </Link>
              <Link
                href="/logout"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </>
        )}

        {/* Profile Icons */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <div className="h-8 w-8 rounded-full bg-orange-500"></div>
          <div className="h-8 w-8 rounded-full bg-blue-500"></div>
        </div>
      </div>
    </aside>
  );
}

