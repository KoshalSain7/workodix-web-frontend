"use client";

import { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog } from "@/components/ui/dialog";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { socialApi, usersApi, chatApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  Edit,
  Star,
  Gift,
  Calendar as CalendarIcon,
  MessageCircle,
  ThumbsUp,
  Heart,
  Send,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  User,
  ArrowRight,
  Bell,
  Mail,
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
    inboxTasks,
    calendarData,
    fetchDashboard,
    loading,
  } = useDashboardStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [bouncingLikes, setBouncingLikes] = useState<Set<string>>(new Set());
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postFormData, setPostFormData] = useState({
    type: "General",
    content: "",
    hobbies: "",
    skills: "",
  });
  const [creatingPost, setCreatingPost] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [showProfileTasks, setShowProfileTasks] = useState(false);
  const [profileTasks, setProfileTasks] = useState<any>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const feedColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Initialize post likes and liked status from feedPosts
  useEffect(() => {
    const initialLikes: Record<string, number> = {};
    const initialLikedPosts = new Set<string>();
    
    feedPosts.forEach((post) => {
      initialLikes[post.id] = post.likes || 0;
      // Check if current user has liked this post
      if ((post as any).likedBy && user?.id && (post as any).likedBy.includes(user.id)) {
        initialLikedPosts.add(post.id);
      }
    });
    
    setPostLikes(initialLikes);
    setLikedPosts(initialLikedPosts);
  }, [feedPosts, user?.id]);

  useEffect(() => {
    fetchDashboard();
    loadProfileCompletion();
  }, [fetchDashboard]);

  const loadProfileCompletion = async () => {
    try {
      const response = await usersApi.getProfileCompletion();
      setProfileCompletion(response.percentage || 0);
    } catch (error: any) {
      console.error("Failed to load profile completion:", error);
      // Set to 0 if there's an error
      setProfileCompletion(0);
    }
  };

  const loadProfileTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await usersApi.getProfileTasks();
      setProfileTasks(response);
    } catch (error: any) {
      console.error("Failed to load profile tasks:", error);
      toast.error("Failed to load profile tasks", error.message || "Please try again");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleOpenProfileTasks = async () => {
    setShowProfileTasks(true);
    // Always refresh tasks to get latest completion status
    await loadProfileTasks();
    // Also refresh the completion percentage
    await loadProfileCompletion();
  };

  // Load comments when comment section is opened
  const loadComments = async (postId: string) => {
    if (loadingComments.has(postId) || postComments[postId]) return;
    
    setLoadingComments(new Set([...loadingComments, postId]));
    try {
      const comments = await socialApi.getComments(postId);
      setPostComments({
        ...postComments,
        [postId]: comments,
      });
    } catch (error: any) {
      console.error("Failed to load comments:", error);
      toast.error("Failed to load comments", error.message || "Please try again");
    } finally {
      setLoadingComments(new Set(Array.from(loadingComments).filter(id => id !== postId)));
    }
  };

  const handleToggleComments = (postId: string) => {
    const newOpenComments = new Set(openComments);
    if (newOpenComments.has(postId)) {
      newOpenComments.delete(postId);
    } else {
      newOpenComments.add(postId);
      loadComments(postId);
    }
    setOpenComments(newOpenComments);
  };

  const handleSubmitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setSubmittingComment(new Set([...submittingComment, postId]));
    try {
      const newComment = await socialApi.createComment(postId, content);
      setPostComments({
        ...postComments,
        [postId]: [...(postComments[postId] || []), newComment],
      });
      setCommentInputs({
        ...commentInputs,
        [postId]: "",
      });
      toast.success("Comment added!", "");
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment", error.message || "Please try again");
    } finally {
      setSubmittingComment(new Set(Array.from(submittingComment).filter(id => id !== postId)));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await socialApi.deleteComment(postId, commentId);
      setPostComments({
        ...postComments,
        [postId]: (postComments[postId] || []).filter((c: any) => c.id !== commentId),
      });
      // Update the feed posts comment count
      const updatedPosts = feedPosts.map(p => 
        p.id === postId ? { ...p, comments: Math.max(0, (p.comments || 0) - 1) } : p
      );
      toast.success("Comment deleted!", "");
    } catch (error: any) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment", error.message || "Please try again");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postFormData.content.trim()) {
      toast.error("Post content is required", "Please enter some content for your post");
      return;
    }

    setCreatingPost(true);
    try {
      const hobbies = postFormData.hobbies
        ? postFormData.hobbies.split(",").map((h) => h.trim()).filter(Boolean)
        : [];
      const skills = postFormData.skills
        ? postFormData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      await socialApi.createPost({
        type: postFormData.type,
        content: postFormData.content,
        hobbies,
        skills,
      });

      toast.success("Post created successfully!", "");
      setShowCreatePost(false);
      setPostFormData({
        type: "General",
        content: "",
        hobbies: "",
        skills: "",
      });
      
      // Refresh dashboard to show new post
      await fetchDashboard();
      // Refresh profile completion since creating a post affects it
      await loadProfileCompletion();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post", error.message || "Please try again");
    } finally {
      setCreatingPost(false);
    }
  };

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
          {profileCompletion < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile - {profileCompletion}% Completed</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Button 
              className="transition-smooth hover:scale-105 animate-fade-in"
              onClick={() => setShowCreatePost(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Post
            </Button>
            {profileCompletion < 100 && (
              <Button 
                variant="outline" 
                className="transition-smooth hover:scale-105 animate-fade-in"
                onClick={handleOpenProfileTasks}
              >
                <User className="h-4 w-4 mr-2" />
                Complete Profile
              </Button>
            )}
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
                        <div className="relative h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          {celebration.profilePicture ? (
                            <img
                              src={celebration.profilePicture}
                              alt={celebration.employeeName}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`avatar-fallback h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ${celebration.profilePicture ? 'hidden' : ''}`}>
                            <span className="text-sm font-medium">
                              {celebration.employeeName.charAt(0)}
                            </span>
                          </div>
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
                      <Link href={`/chat?userId=${celebration.id}`}>
                        <Button 
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              // Create or get conversation
                              const conversations = await chatApi.getConversations();
                              let conversation = conversations.find(
                                (c: any) => 
                                  (c.participant1Id === user?.id && c.participant2Id === celebration.id) ||
                                  (c.participant2Id === user?.id && c.participant1Id === celebration.id)
                              );
                              
                              if (!conversation) {
                                // Send a message to create conversation
                                await chatApi.sendMessage({
                                  content: "🎉 Happy Birthday! 🎉",
                                  recipientId: celebration.id,
                                });
                                toast.success("Birthday wish sent!", "Your message has been delivered");
                              } else {
                                // Send message to existing conversation
                                await chatApi.sendMessage({
                                  content: "🎉 Happy Birthday! 🎉",
                                  conversationId: conversation.id,
                                });
                                toast.success("Birthday wish sent!", "Your message has been delivered");
                              }
                              // Navigate to chat
                              window.location.href = `/chat?userId=${celebration.id}`;
                            } catch (error: any) {
                              console.error("Failed to send birthday wish:", error);
                              toast.error("Failed to send birthday wish", error.message || "Please try again");
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Wish
                        </Button>
                      </Link>
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
                          <span>{postLikes[post.id] !== undefined ? postLikes[post.id] : (post.likes || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>
                            {postComments[post.id]?.length !== undefined 
                              ? postComments[post.id].length 
                              : (post.comments || 0)} Comments
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`transition-smooth hover:scale-105 ${likedPosts.has(post.id) ? 'text-primary' : ''}`}
                          onClick={async () => {
                            try {
                              const wasLiked = likedPosts.has(post.id);
                              
                              // Trigger bounce animation
                              setBouncingLikes(new Set([...bouncingLikes, post.id]));
                              setTimeout(() => {
                                setBouncingLikes((prev) => new Set(Array.from(prev).filter(id => id !== post.id)));
                              }, 400);
                              
                              await socialApi.likePost(post.id);
                              
                              if (wasLiked) {
                                // Unlike
                                setLikedPosts(new Set(Array.from(likedPosts).filter(id => id !== post.id)));
                                setPostLikes({
                                  ...postLikes,
                                  [post.id]: Math.max(0, (postLikes[post.id] || post.likes || 0) - 1),
                                });
                              } else {
                                // Like
                                setLikedPosts(new Set([...likedPosts, post.id]));
                                setPostLikes({
                                  ...postLikes,
                                  [post.id]: (postLikes[post.id] || post.likes || 0) + 1,
                                });
                              }
                            } catch (error: any) {
                              console.error("Failed to like post:", error);
                              toast.error("Failed to like post", error.message || "Please try again");
                            }
                          }}
                        >
                          <ThumbsUp 
                            className={`h-4 w-4 mr-2 ${likedPosts.has(post.id) ? 'fill-current' : ''} ${bouncingLikes.has(post.id) ? 'animate-bounce-like' : ''}`} 
                          />
                          Like
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="transition-smooth hover:scale-105"
                          onClick={() => handleToggleComments(post.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {openComments.has(post.id) && (
                        <div className="mt-4 pt-4 border-t animate-fade-in">
                          {/* Comment Input */}
                          <div className="flex gap-2 mb-4">
                            <div className="relative h-8 w-8 shrink-0">
                              {user?.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.firstName || "You"}
                                  className="h-8 w-8 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`avatar-fallback h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ${user?.profilePicture ? 'hidden' : ''}`}
                              >
                                <span className="text-xs font-medium">
                                  {(user?.firstName || "U").charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 flex gap-2">
                              <Input
                                placeholder="Write a comment..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentInputs({
                                  ...commentInputs,
                                  [post.id]: e.target.value,
                                })}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitComment(post.id);
                                  }
                                }}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!commentInputs[post.id]?.trim() || submittingComment.has(post.id)}
                                className="shrink-0 transition-smooth hover:scale-105"
                              >
                                {submittingComment.has(post.id) ? (
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Comments List */}
                          {loadingComments.has(post.id) ? (
                            <div className="text-center py-4 text-sm text-muted-foreground animate-pulse">
                              Loading comments...
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(postComments[post.id] || []).map((comment: any) => {
                                const commentAuthor = comment.user
                                  ? `${comment.user.firstName} ${comment.user.lastName}`
                                  : "Unknown User";
                                const commentProfilePicture = comment.user?.profilePicture;
                                const isOwnComment = comment.userId === user?.id;

                                return (
                                  <div
                                    key={comment.id}
                                    className="flex gap-3 animate-slide-up group"
                                  >
                                    <div className="relative h-8 w-8 shrink-0">
                                      {commentProfilePicture ? (
                                        <img
                                          src={commentProfilePicture}
                                          alt={commentAuthor}
                                          className="h-8 w-8 rounded-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`avatar-fallback h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ${commentProfilePicture ? 'hidden' : ''}`}
                                      >
                                        <span className="text-xs font-medium">
                                          {commentAuthor.charAt(0)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-muted rounded-lg p-3 group-hover:bg-muted/80 transition-colors">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate">
                                              {commentAuthor}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                          </div>
                                          {isOwnComment && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                              onClick={() => handleDeleteComment(post.id, comment.id)}
                                            >
                                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-error" />
                                            </Button>
                                          )}
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                          {comment.content}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {(!postComments[post.id] || postComments[post.id].length === 0) && !loadingComments.has(post.id) && (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  No comments yet. Be the first to comment!
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
              <CardContent className="space-y-3">
                {inboxTasks ? (
                  <>
                    <Link href="/inbox">
                      <div className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Pending Tasks</span>
                        </div>
                        <span className="text-sm font-semibold">{inboxTasks.pendingTasks}</span>
                      </div>
                    </Link>
                    <Link href="/chat">
                      <div className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Messages</span>
                        </div>
                        <span className="text-sm font-semibold">{inboxTasks.unreadMessages}</span>
                      </div>
                    </Link>
                    <Link href="/inbox">
                      <Button variant="outline" className="w-full mt-2">
                        View All
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {inboxPendingCount} Pending task{inboxPendingCount !== 1 ? "s" : ""}
                  </p>
                )}
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

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost} title="Create New Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Post Type</label>
            <select
              className="w-full px-3 py-2 border rounded-md bg-background"
              value={postFormData.type}
              onChange={(e) => setPostFormData({ ...postFormData, type: e.target.value })}
              required
            >
              <option value="General">General</option>
              <option value="Welcome post">Welcome post</option>
              <option value="Announcement">Announcement</option>
              <option value="Achievement">Achievement</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Content *</label>
            <Textarea
              placeholder="What's on your mind?"
              value={postFormData.content}
              onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Hobbies (comma-separated)</label>
            <Input
              placeholder="e.g., Reading, Traveling, Photography"
              value={postFormData.hobbies}
              onChange={(e) => setPostFormData({ ...postFormData, hobbies: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Skills (comma-separated)</label>
            <Input
              placeholder="e.g., JavaScript, React, Node.js"
              value={postFormData.skills}
              onChange={(e) => setPostFormData({ ...postFormData, skills: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreatePost(false);
                setPostFormData({
                  type: "General",
                  content: "",
                  hobbies: "",
                  skills: "",
                });
              }}
              disabled={creatingPost}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creatingPost || !postFormData.content.trim()}>
              {creatingPost ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Profile Tasks Dialog */}
      <Dialog open={showProfileTasks} onOpenChange={setShowProfileTasks} title="Complete Your Profile">
        {loadingTasks ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground animate-pulse">Loading tasks...</div>
          </div>
        ) : profileTasks ? (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-semibold">{profileTasks.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${profileTasks.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {profileTasks.completedTasks} of {profileTasks.totalTasks} tasks completed
              </p>
            </div>

            {/* Incomplete Tasks */}
            {profileTasks.incompleteTasks && profileTasks.incompleteTasks.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Tasks to Complete
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(
                    profileTasks.incompleteTasks.reduce((acc: any, task: any) => {
                      if (!acc[task.section]) {
                        acc[task.section] = [];
                      }
                      acc[task.section].push(task);
                      return acc;
                    }, {})
                  ).map(([section, tasks]: [string, any]) => (
                    <div key={section} className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2 first:pt-0">
                        {section}
                      </h4>
                      {tasks.map((task: any) => (
                        <Link
                          key={task.id}
                          href={task.route}
                          onClick={() => setShowProfileTasks(false)}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                        >
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-sm">{task.label}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Profile Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  You've completed all profile tasks. Great job!
                </p>
              </div>
            )}

            {/* Completed Tasks (Collapsible) */}
            {profileTasks.tasks && profileTasks.tasks.filter((t: any) => t.completed).length > 0 && (
              <details className="space-y-2">
                <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Completed Tasks ({profileTasks.tasks.filter((t: any) => t.completed).length})
                </summary>
                <div className="space-y-2 pt-2">
                  {profileTasks.tasks
                    .filter((t: any) => t.completed)
                    .map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <span className="flex-1 text-sm text-muted-foreground line-through">
                          {task.label}
                        </span>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No tasks available</div>
          </div>
        )}
      </Dialog>
    </MainLayout>
    </AuthGuard>
  );
}
