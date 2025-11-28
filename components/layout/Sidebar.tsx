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
  User,
  Calendar,
  Briefcase,
  Target,
  BookOpen,
  FileText,
  DollarSign,
  Settings,
  MessageCircle,
  Receipt,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { accessApi } from "@/lib/api";

// Icon mapping from backend icon names to React components
const iconMap: Record<string, any> = {
  Home,
  Inbox,
  User,
  Calendar,
  Briefcase,
  Target,
  BookOpen,
  FileText,
  DollarSign,
  Settings,
  Receipt,
  Clock,
};

// Helper function to get icon component from icon name
const getIcon = (iconName: string | null | undefined) => {
  if (!iconName) return null;
  return iconMap[iconName] || FileText; // Default to FileText if icon not found
};

export function Sidebar() {
  const pathname = usePathname();
  const { accessibleOptions, loadAccessibleOptions } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLAsideElement>(null);

  // Load accessible options on mount (only once)
  useEffect(() => {
    if (!accessibleOptions || accessibleOptions.length === 0) {
      loadAccessibleOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Group accessible options by category
  const groupedOptions = useMemo(() => {
    if (!accessibleOptions || accessibleOptions.length === 0) {
      return {
        Navigation: [],
        Favorites: [],
        Request: [],
      };
    }

    const grouped: Record<string, any[]> = {
      Navigation: [],
      Favorites: [],
      Request: [],
    };

    accessibleOptions.forEach((option: any) => {
      const category = option.category || "Navigation";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        name: option.optionName,
        href: option.optionPath,
        icon: getIcon(option.icon),
        category: category,
      });
    });

    return grouped;
  }, [accessibleOptions]);

  // Combine all searchable items
  const allSearchableItems = useMemo(() => {
    return Object.values(groupedOptions).flat();
  }, [groupedOptions]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return null; // Return null to show all sections normally
    }

    const query = searchQuery.toLowerCase().trim();
    return allSearchableItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery, allSearchableItems]);

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
                    const Icon = item.icon || FileText;
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
                        <Icon className={cn(
                          "h-5 w-5 shrink-0",
                          isActive ? "text-white" : "text-foreground"
                        )} />
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
            {groupedOptions.Navigation.length > 0 && (
              <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
                {groupedOptions.Navigation.map((item) => {
                  const Icon = item.icon || FileText;
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
            )}

            {/* Favorites */}
            {groupedOptions.Favorites.length > 0 && (
              <div>
                {isExpanded && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>Favorites</span>
                  </div>
                )}
                <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
                  {groupedOptions.Favorites.map((item) => {
                    const Icon = item.icon || FileText;
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
              </div>
            )}

            {/* Request */}
            {groupedOptions.Request.length > 0 && (
              <div>
                {isExpanded && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                    <span>Request</span>
                  </div>
                )}
                <nav className={cn("space-y-2", !isExpanded && "flex flex-col items-center")}>
                  {groupedOptions.Request.map((item) => {
                    const Icon = item.icon || FileText;
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
              </div>
            )}

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
