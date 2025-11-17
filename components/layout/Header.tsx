"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Grid3x3, FileText, Bell, Clock, User as UserIcon, FileText as FileTextIcon, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { attendanceApi, searchApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { format } from "date-fns";

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    posts: any[];
    navigation: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Navigation items for search
  const navigationItems = [
    { name: "Home", path: "/", type: "navigation" },
    { name: "Profile", path: "/profile", type: "navigation" },
    { name: "Attendance", path: "/attendance", type: "navigation" },
    { name: "CTC", path: "/ctc", type: "navigation" },
    { name: "Goals", path: "/goals", type: "navigation" },
    { name: "Leave Balance", path: "/leave-balance", type: "navigation" },
    { name: "Letter", path: "/letter", type: "navigation" },
    { name: "Payslip", path: "/payslip", type: "navigation" },
    { name: "Inbox", path: "/inbox", type: "navigation" },
    { name: "Social Profile", path: "/social", type: "navigation" },
    { name: "HR Handbook", path: "/handbook", type: "navigation" },
  ];

  // Search API call with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchApi.search(searchQuery.trim(), 5);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Combine all search results
  const allSuggestions = useMemo(() => {
    if (!searchResults) {
      // Fallback to local navigation search
      return searchQuery.trim()
        ? navigationItems
            .filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5)
        : [];
    }

    const combined: any[] = [];
    
    // Add users
    searchResults.users.forEach((user) => {
      combined.push({
        ...user,
        path: `/profile?userId=${user.id}`,
        displayName: user.name,
      });
    });

    // Add posts
    searchResults.posts.forEach((post) => {
      combined.push({
        ...post,
        path: `/social/post/${post.id}`,
        displayName: `Post by ${post.author}`,
      });
    });

    // Add navigation items
    navigationItems.forEach((item) => {
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        combined.push({
          ...item,
          displayName: item.name,
        });
      }
    });

    return combined.slice(0, 10);
  }, [searchResults, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // If we have search results, navigate to first result
    if (allSuggestions.length > 0) {
      handleSuggestionClick(allSuggestions[0]);
    } else {
      // Fallback to navigation search
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const aliases: Record<string, string> = {
        'home': '/',
        'dashboard': '/',
        'profile': '/profile',
        'attendance': '/attendance',
        'ctc': '/ctc',
        'goal': '/goals',
        'goals': '/goals',
        'leave': '/leave-balance',
        'letter': '/letter',
        'payslip': '/payslip',
        'inbox': '/inbox',
        'social': '/social',
        'handbook': '/handbook',
        'hr': '/handbook',
      };

      const aliasPath = aliases[normalizedQuery];
      if (aliasPath) {
        router.push(aliasPath);
        setSearchQuery("");
        return;
      }

      toast.info("No matching results found", "Try searching for users, posts, or pages");
    }
  };

  const handleSuggestionClick = (item: any) => {
    router.push(item.path);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  useEffect(() => {
    loadAttendanceStatus();
  }, []);

  const loadAttendanceStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await attendanceApi.getTodayStatus();
      setIsPunchedIn(status.isPunchedIn);
      if (status.punchInTime) {
        setPunchInTime(
          format(new Date(status.punchInTime), "HH:mm")
        );
      } else {
        setPunchInTime(null);
      }
    } catch (error) {
      console.error("Failed to load attendance status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      setLoading(true);
      await attendanceApi.punchIn();
      setIsPunchedIn(true);
      setPunchInTime(format(new Date(), "HH:mm"));
      toast.success(
        "Successfully Punched In!",
        `Punch in time: ${format(new Date(), "HH:mm")}`
      );
    } catch (error: any) {
      toast.error(
        error.message || "Failed to punch in",
        "Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setLoading(true);
      const result = await attendanceApi.punchOut();
      setIsPunchedIn(false);
      setPunchInTime(null);
      const hoursWorked = result?.hoursWorked || 0;
      toast.success(
        "Successfully Punched Out!",
        `Total hours worked: ${hoursWorked.toFixed(2)} hours`
      );
    } catch (error: any) {
      toast.error(
        error.message || "Failed to punch out",
        "Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 flex-1">
        <h1 className="text-lg font-semibold">
          {user?.company || "WorkFolio"}
        </h1>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/70 z-10" />
            <Input
              type="search"
              placeholder="Search for actions, pages, requests, reports, people..."
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50 transition-smooth"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e as any);
                }
              }}
            />
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (allSuggestions.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto animate-fade-in">
                {isSearching ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  <>
                    {allSuggestions.filter((item) => item.type === 'user').length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b">
                        Users ({allSuggestions.filter((item) => item.type === 'user').length})
                      </div>
                    )}
                    {allSuggestions
                      .filter((item) => item.type === 'user')
                      .map((item) => (
                        <button
                          key={`user-${item.id}`}
                          type="button"
                          onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          {item.profilePicture ? (
                            <img
                              src={item.profilePicture}
                              alt={item.name}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ${item.profilePicture ? 'hidden' : ''}`}
                          >
                            <span className="text-xs font-medium">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.role} {item.company ? `• ${item.company}` : ''}
                            </p>
                          </div>
                          <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    
                    {allSuggestions.filter((item) => item.type === 'post').length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b">
                        Posts ({allSuggestions.filter((item) => item.type === 'post').length})
                      </div>
                    )}
                    {allSuggestions
                      .filter((item) => item.type === 'post')
                      .map((item) => (
                        <button
                          key={`post-${item.id}`}
                          type="button"
                          onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <FileTextIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">
                              {item.author}
                            </p>
                            <p className="text-sm truncate">{item.content}</p>
                          </div>
                        </button>
                      ))}
                    
                    {allSuggestions.filter((item) => item.type === 'navigation').length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b">
                        Pages ({allSuggestions.filter((item) => item.type === 'navigation').length})
                      </div>
                    )}
                    {allSuggestions
                      .filter((item) => item.type === 'navigation')
                      .map((item) => (
                        <button
                          key={`nav-${item.path}`}
                          type="button"
                          onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      ))}
                    
                    {allSuggestions.length === 0 && !isSearching && (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        {!loadingStatus && (
          <div className="flex items-center gap-2">
            {isPunchedIn && punchInTime && (
              <span className="text-sm text-primary-foreground/80">
                In: {punchInTime}
              </span>
            )}
            <Button
              onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
              disabled={loading}
              variant={isPunchedIn ? "destructive" : "default"}
              className={`${
                isPunchedIn
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md"
              } border-0 font-medium transition-all duration-200`}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              {isPunchedIn ? "Punch Out" : "Punch In"}
            </Button>
          </div>
        )}
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
          <FileText className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={() => {
            // Call logout (non-blocking - clears state immediately)
            logout();
            // Immediately redirect - don't wait for logout to complete
            if (typeof window !== "undefined") {
              // Use replace to avoid adding to history and ensure clean redirect
              window.location.replace("/login");
            }
          }}
          className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

