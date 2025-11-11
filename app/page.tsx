"use client";

import { useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Star,
  Gift,
  Calendar as CalendarIcon,
  MessageCircle,
  ThumbsUp,
  Heart,
  Hand,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function Home() {
  const { user } = useAuthStore();
  const {
    feedPosts,
    celebrations,
    leaveBalances,
    badges,
    inboxPendingCount,
    calendarData,
    fetchDashboard,
    loading,
  } = useDashboardStore();

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const feedColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-hide scrollbar functionality
  useEffect(() => {
    const setupScrollbarAutoHide = (element: HTMLDivElement | null) => {
      if (!element) return;

      let hideTimeout: NodeJS.Timeout;

      const showScrollbar = () => {
        element.classList.add("scrollbar-visible");
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          element.classList.remove("scrollbar-visible");
        }, 1500);
      };

      const handleScroll = () => {
        showScrollbar();
      };

      const handleMouseEnter = () => {
        showScrollbar();
      };

      const handleMouseLeave = () => {
        hideTimeout = setTimeout(() => {
          element.classList.remove("scrollbar-visible");
        }, 1500);
      };

      element.addEventListener("scroll", handleScroll);
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        clearTimeout(hideTimeout);
        element.removeEventListener("scroll", handleScroll);
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const cleanup1 = setupScrollbarAutoHide(leftColumnRef.current);
    const cleanup2 = setupScrollbarAutoHide(feedColumnRef.current);
    const cleanup3 = setupScrollbarAutoHide(rightColumnRef.current);

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, []);

  return (
    <AuthGuard>
      <MainLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Welcome Section - Sticky at top */}
        <div className="space-y-4 animate-fade-in mb-6 flex-shrink-0 sticky top-0 bg-background z-10 pb-4 border-b">
          <h1 className="text-3xl font-bold animate-slide-down">Hello, {user?.firstName} !</h1>
          <p className="text-muted-foreground">Hope you are having a great day</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile - 37.5% Completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "37.5%" }}></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button className="transition-smooth hover:scale-105 animate-fade-in">
              <Edit className="h-4 w-4 mr-2" />
              Post
            </Button>
            <Button variant="outline" className="transition-smooth hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Star className="h-4 w-4 mr-2" />
              Badge
            </Button>
            <Button variant="outline" className="transition-smooth hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Gift className="h-4 w-4 mr-2" />
              Reward
            </Button>
            <Button variant="outline" className="transition-smooth hover:scale-105 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule 1-on-1
            </Button>
          </div>
        </div>

        {/* Grid Layout - Three columns with independent scrolling (2:4:2 ratio) */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] gap-6 flex-1 min-h-0">
          {/* Left Column - Highlights */}
          <div ref={leftColumnRef} className="space-y-6 overflow-y-auto pr-2 scrollbar-thin animate-fade-in">
            {/* Today's Celebration */}
            <Card className="animate-scale-in transition-smooth hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Today&apos;s celebration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {celebrations.length} celebrations
                  </p>
                  {celebrations.map((celebration, idx) => (
                    <div
                      key={celebration.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg transition-smooth hover:bg-muted/80 animate-slide-up"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {celebration.employeeName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {celebration.employeeName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {celebration.type === "Birthday"
                              ? "Birthday is today"
                              : "1 year work anniversary"}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">Wish</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wall of Fame */}
            <Card className="animate-scale-in transition-smooth hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 animate-pulse" />
                  Wall of fame
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Badge received This week</h4>
                    {badges.length > 0 ? (
                      <div className="space-y-3">
                        {badges.slice(0, 3).map((badge, idx) => (
                          <div
                            key={badge.id}
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg transition-smooth hover:bg-muted/80 animate-slide-up"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Star className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{badge.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {badge.employeeName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                          <span className="text-2xl">?</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No badge received this week
                        </p>
                      </div>
                    )}
                  </div>
                  <Link href="/wall-of-fame" className="text-sm text-primary hover:underline">
                    See more
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Feed */}
          <div ref={feedColumnRef} className="space-y-6 overflow-y-auto pr-2 scrollbar-thin animate-fade-in flex flex-col min-h-0">
            <h2 className="text-xl font-semibold flex-shrink-0">Feed</h2>
            <div className="space-y-6 flex-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Loading feed...</div>
            ) : feedPosts.length > 0 ? (
              feedPosts.map((post, index) => (
              <Card key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-10 w-10 shrink-0">
                      {post.profilePicture ? (
                        <img
                          src={post.profilePicture}
                          alt={post.employeeName}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            // Hide image and show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`avatar-fallback h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ${post.profilePicture ? 'hidden' : ''}`}
                      >
                        <span className="text-sm font-medium">
                          {post.employeeName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{post.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.company} • {post.employeeRole} • {post.createdAt}
                          </p>
                        </div>
                        <span className="text-xs bg-accent-light text-primary px-2 py-1 rounded">
                          {post.type}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {post.hobbies && post.hobbies.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Hobbies</p>
                          <p className="text-xs text-muted-foreground">
                            {post.hobbies.join(", ")}
                          </p>
                        </div>
                      )}
                      {post.skills && post.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Skills</p>
                          <p className="text-xs text-muted-foreground">
                            {post.skills.join(", ")}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} Comments</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="ghost" size="sm" className="transition-smooth hover:scale-105">
                          <Hand className="h-4 w-4 mr-2" />
                          Clap
                        </Button>
                        <Button variant="ghost" size="sm" className="transition-smooth hover:scale-105">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground animate-fade-in">No posts yet</div>
            )}
            </div>
          </div>

          {/* Right Column - Inbox, Calendar, etc */}
          <div ref={rightColumnRef} className="space-y-6 overflow-y-auto pr-2 scrollbar-thin animate-fade-in">
            {/* Inbox */}
            <Card className="animate-scale-in transition-smooth hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500 transition-smooth hover:scale-110" />
                  Inbox
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {inboxPendingCount} Pending task{inboxPendingCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="animate-scale-in transition-smooth hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendar</CardTitle>
                  <Link href="/attendance" className="text-sm text-primary hover:underline transition-smooth">
                    Go to calendar
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Calendar
                  attendanceData={calendarData.length > 0 ? calendarData : [
                    { date: format(new Date(), "yyyy-MM-dd"), status: "Present" },
                  ]}
                />
                {/* Quick Actions */}
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
                  <Link href="/request/attendance-regularization" className="block">
                    <Button variant="outline" className="w-full justify-start text-xs h-8 transition-smooth hover:scale-105">
                      Request Attendance Regularization
                    </Button>
                  </Link>
                  <Link href="/request/leave" className="block">
                    <Button className="w-full justify-start text-xs h-8 transition-smooth hover:scale-105">
                      Apply for Leave
                    </Button>
                  </Link>
                  <Link href="/request/on-duty" className="block">
                    <Button variant="outline" className="w-full justify-start text-xs h-8 transition-smooth hover:scale-105">
                      Request On Duty
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Do you know? */}
            {/* <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Do you know?</h3>
                    <p className="text-sm text-muted-foreground">
                      OneAI can now mark attendance, apply leave, AR, On-Duty & more for you.
                      Just ask!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Leave Balance */}
            <Card className="animate-scale-in transition-smooth hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Leave balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaveBalances.map((balance, idx) => (
                  <div
                    key={balance.type}
                    className="p-3 bg-muted rounded-lg transition-smooth hover:bg-muted/80 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <p className="text-sm font-medium">{balance.remaining}</p>
                    <p className="text-xs text-muted-foreground">{balance.type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </MainLayout>
    </AuthGuard>
  );
}
