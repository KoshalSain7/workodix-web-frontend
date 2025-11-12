"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { socialApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, MessageCircle, ThumbsUp, Heart, Hand } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await socialApi.getPost(postId);
      // API response is already unwrapped by apiClient
      setPost(postData);
    } catch (error: any) {
      console.error("Failed to load post:", error);
      toast.error("Failed to load post", error.message || "Post not found");
      // Don't redirect immediately, show error message first
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await socialApi.likePost(post.id);
      setPost({ ...post, likes: post.likes + 1 });
      toast.success("Post liked!", "");
    } catch (error: any) {
      console.error("Failed to like post:", error);
      toast.error("Failed to like post", error.message || "Please try again");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse">Loading post...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Post not found</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go to Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const authorName = post.user
    ? `${post.user.firstName} ${post.user.lastName}`
    : "Unknown User";
  const authorRole = post.user?.role || "";
  const authorCompany = post.user?.company || "";
  const profilePicture = post.user?.profilePicture;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4 transition-smooth hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Post Card */}
        <Card className="animate-scale-in transition-smooth hover:shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="relative h-12 w-12 shrink-0">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={authorName}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.parentElement?.querySelector(
                        ".avatar-fallback"
                      ) as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`avatar-fallback h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center ${
                    profilePicture ? "hidden" : ""
                  }`}
                >
                  <span className="text-lg font-medium">
                    {authorName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile?userId=${post.user?.id || ""}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {authorName}
                  </Link>
                  {post.type && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-primary">
                      {post.type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {authorRole}
                  {authorCompany && ` • ${authorCompany}`}
                  {post.createdAt &&
                    ` • ${format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Post Content */}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
            </div>

            {/* Hobbies and Skills */}
            {(post.hobbies && post.hobbies.length > 0) ||
            (post.skills && post.skills.length > 0) ? (
              <div className="space-y-3 pt-4 border-t">
                {post.hobbies && post.hobbies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Hobbies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.hobbies.map((hobby: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs px-3 py-1 rounded-full bg-muted text-foreground"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {post.skills && post.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-2 transition-smooth hover:scale-105"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{post.likes || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 transition-smooth hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments || 0} Comments</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

