"use client";

import { useEffect } from "react";
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
  const { feedPosts, celebrations, leaveBalances } = useDashboardStore();

  return (
    <AuthGuard>
      <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Hello, {user?.firstName} !</h1>
          <p className="text-muted-foreground">Hope you are having a great day</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile - 37.5% Completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "37.5%" }}></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Post
            </Button>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Badge
            </Button>
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Reward
            </Button>
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule 1-on-1
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Highlights */}
          <div className="space-y-6">
            {/* Today's Celebration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today&apos;s celebration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {celebrations.length} celebrations
                  </p>
                  {celebrations.map((celebration) => (
                    <div
                      key={celebration.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Wall of fame
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Badge received This week</h4>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <span className="text-2xl">?</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No badge received this week
                      </p>
                    </div>
                  </div>
                  <Link href="/wall-of-fame" className="text-sm text-primary hover:underline">
                    See more
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Feed */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Feed</h2>
            {feedPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium">
                        {post.employeeName.charAt(0)}
                      </span>
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
                        <Button variant="ghost" size="sm">
                          <Hand className="h-4 w-4 mr-2" />
                          Clap
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column - Inbox, Calendar, etc */}
          <div className="space-y-6">
            {/* Inbox */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  Inbox
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">0 Pending tasks</p>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendar</CardTitle>
                  <Link href="/calendar" className="text-sm text-primary hover:underline">
                    Go to calendar
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  attendanceData={[
                    { date: format(new Date(), "yyyy-MM-dd"), status: "Present" },
                  ]}
                />
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaveBalances.map((balance) => (
                  <div
                    key={balance.type}
                    className="p-3 bg-muted rounded-lg"
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
