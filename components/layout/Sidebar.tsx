"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  User,
  Calendar,
  Briefcase,
  Target,
  BookOpen,
  FileText,
  DollarSign,
  Mail,
  Settings,
  Gift,
  MessageCircle,
  Folder,
  TrendingUp,
  Receipt,
  Plane,
  Clock,
  Building,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Helpdesk", href: "/helpdesk", icon: Settings },
];

const favorites = [
  { name: "Social profile", href: "/profile/social", icon: User },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "CTC", href: "/ctc", icon: DollarSign },
  { name: "Goals and initiatives", href: "/goals", icon: Target },
  { name: "HR Handbook", href: "/handbook", icon: BookOpen },
  { name: "Leave balance", href: "/leave-balance", icon: Calendar },
  { name: "Letter", href: "/letter", icon: FileText },
  { name: "Payslip", href: "/payslip", icon: Receipt },
  { name: "Profile", href: "/profile", icon: User },
];

const requests = [
  { name: "Job opening", href: "/request/job-opening", icon: Briefcase },
  { name: "Leave", href: "/request/leave", icon: Calendar },
  { name: "On duty", href: "/request/on-duty", icon: Clock },
  { name: "Resignation", href: "/request/resignation", icon: FileText },
];

// Combine all searchable items
const allSearchableItems = [
  ...navigation.map((item) => ({ ...item, category: "Navigation" })),
  ...favorites.map((item) => ({ ...item, category: "Favorites" })),
  ...requests.map((item) => ({ ...item, category: "Request" })),
];

export function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLAsideElement>(null);

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

  // Auto-expand on hover, collapse when mouse leaves
  useEffect(() => {
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener("mouseenter", handleMouseEnter);
      sidebar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        sidebar.removeEventListener("mouseenter", handleMouseEnter);
        sidebar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  const isExpanded = isHovered || searchQuery.trim().length > 0;
  const sidebarWidth = isExpanded ? "w-64" : "w-16";

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "bg-card border-r border-border h-[calc(100vh-73px)] overflow-y-auto transition-all duration-300 ease-in-out",
        sidebarWidth
      )}
    >
      <div className="p-4 space-y-4">
        {/* Search - Only show when expanded */}
        {isExpanded && (
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
        )}

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
                    const Icon = item.icon || null;
                    return (
                      <Link
                        key={`${item.category}-${item.name}`}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative",
                          isActive
                            ? "bg-primary text-white font-semibold shadow-sm"
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        {Icon && (
                          <Icon className={cn(
                            "h-5 w-5 shrink-0",
                            isActive ? "text-white" : "text-foreground"
                          )} />
                        )}
                        <span className={cn("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0")}>
                          {item.name}
                        </span>
                        {isExpanded && (
                          <span className={cn(
                            "ml-auto text-xs",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}>
                            {item.category}
                          </span>
                        )}
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
            <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm transition-all duration-200 relative group",
                      isExpanded 
                        ? "gap-3 px-3 py-2.5 rounded-lg w-full"
                        : "justify-center w-10 h-10 rounded-lg",
                      isActive
                        ? "bg-primary text-white font-semibold shadow-lg"
                        : "text-foreground hover:bg-muted/50"
                    )}
                    title={!isExpanded ? item.name : undefined}
                  >
                    <Icon className={cn(
                      "shrink-0 transition-all duration-200",
                      "h-5 w-5",
                      isActive 
                        ? "text-white"
                        : "text-foreground group-hover:text-primary"
                    )} />
                    {isExpanded && (
                      <span className="transition-all duration-300 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Favorites */}
            <div>
              {isExpanded && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Favorites</span>
                </div>
              )}
              <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
                {favorites.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center text-sm transition-all duration-200 relative group",
                        isExpanded 
                          ? "gap-3 px-3 py-2.5 rounded-lg w-full"
                          : "justify-center w-10 h-10 rounded-lg",
                        isActive
                          ? "bg-primary text-white font-semibold shadow-lg"
                          : "text-foreground hover:bg-muted/50"
                      )}
                      title={!isExpanded ? item.name : undefined}
                    >
                      <Icon className={cn(
                        "shrink-0 transition-all duration-200",
                        "h-5 w-5",
                        isActive 
                          ? "text-white"
                          : "text-foreground group-hover:text-primary"
                      )} />
                      {isExpanded && (
                        <span className="transition-all duration-300 whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Request */}
            <div>
              {isExpanded && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Request</span>
                </div>
              )}
              <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
                {requests.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center text-sm transition-all duration-200 relative group",
                        isExpanded 
                          ? "gap-3 px-3 py-2.5 rounded-lg w-full"
                          : "justify-center w-10 h-10 rounded-lg",
                        isActive
                          ? "bg-primary text-white font-semibold shadow-lg"
                          : "text-foreground hover:bg-muted/50"
                      )}
                      title={!isExpanded ? item.name : undefined}
                    >
                      <Icon className={cn(
                        "shrink-0 transition-all duration-200",
                        "h-5 w-5",
                        isActive 
                          ? "text-white"
                          : "text-foreground group-hover:text-primary"
                      )} />
                      {isExpanded && (
                        <span className="transition-all duration-300 whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Other Links */}
            <div className="space-y-1 pt-4 border-t border-border">
              {isExpanded ? (
                <>
                  <Link
                    href="/chat"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-all duration-200 relative group"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" />
                    <span>Chat</span>
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-all duration-200 relative group"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/chat"
                    className="flex items-center justify-center px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-all duration-200 relative group"
                    title="Chat"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0" />
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center justify-center px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-all duration-200 relative group"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                  </Link>
                </>
              )}
            </div>
          </>
        )}

        {/* Profile Icons - Only show when expanded */}
        {isExpanded && (
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <div className="h-8 w-8 rounded-full bg-orange-500"></div>
            <div className="h-8 w-8 rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>
    </aside>
  );
}
