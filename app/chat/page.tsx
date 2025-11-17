"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { chatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  User as UserIcon,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: any;
  participant2?: any;
  otherParticipant?: any;
  unreadCount?: number;
  lastMessageAt: string | null;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  company?: string;
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id, false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data);
      
      // If userId param is provided, find and select that conversation
      if (userIdParam && data.length > 0) {
        const conversation = data.find(
          (c: Conversation) =>
            (c.participant1Id === user?.id && c.participant2Id === userIdParam) ||
            (c.participant2Id === user?.id && c.participant1Id === userIdParam)
        );
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await chatApi.getMessages(conversationId, 100);
      setMessages(data);
      // Refresh conversations to update unread counts
      if (showLoading) {
        loadConversations();
      }
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages", error.message || "Please try again");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await chatApi.sendMessage({
        content: messageInput.trim(),
        conversationId: selectedConversation.id,
      });
      setMessageInput("");
      // Reload messages
      await loadMessages(selectedConversation.id, false);
      // Refresh conversations
      await loadConversations();
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message", error.message || "Please try again");
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await chatApi.searchUsers(query, 20);
      setSearchResults(results);
    } catch (error: any) {
      console.error("Failed to search users:", error);
      toast.error("Failed to search users", error.message || "Please try again");
    }
  };

  const handleStartConversation = async (recipientId: string) => {
    try {
      setLoading(true);
      // Send an initial message to create conversation
      await chatApi.sendMessage({
        content: "Hi! 👋",
        recipientId,
      });
      // Reload conversations
      await loadConversations();
      // Find and select the new conversation
      const updatedConversations = await chatApi.getConversations();
      const newConversation = updatedConversations.find(
        (c: Conversation) =>
          (c.participant1Id === user?.id && c.participant2Id === recipientId) ||
          (c.participant2Id === user?.id && c.participant1Id === recipientId)
      );
      if (newConversation) {
        setSelectedConversation(newConversation);
        setShowSearch(false);
        setSearchQuery("");
      }
    } catch (error: any) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.otherParticipant) {
      return conversation.otherParticipant;
    }
    return conversation.participant1Id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  const getParticipantName = (conversation: Conversation) => {
    const participant = getOtherParticipant(conversation);
    return participant
      ? `${participant.firstName} ${participant.lastName}`
      : "Unknown User";
  };

  const getParticipantPicture = (conversation: Conversation) => {
    const participant = getOtherParticipant(conversation);
    return participant?.profilePicture;
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="flex h-[calc(100vh-140px)] gap-4">
          {/* Conversations List */}
          <div className="w-80 border-r bg-background flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Messages</h2>
                <Button
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {showSearch && (
                <div className="space-y-2">
                  <Input
                    placeholder="Search users by name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearchUsers(e.target.value);
                    }}
                    className="w-full"
                  />
                  {searchResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto space-y-1 border rounded p-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleStartConversation(result.id)}
                        >
                          <div className="relative h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            {result.profilePicture ? (
                              <img
                                src={result.profilePicture}
                                alt={`${result.firstName} ${result.lastName}`}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`avatar-fallback h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ${result.profilePicture ? 'hidden' : ''}`}>
                              <span className="text-xs font-medium">
                                {result.firstName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {result.firstName} {result.lastName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Search for users to start chatting</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => {
                    const isSelected = selectedConversation?.id === conversation.id;
                    const participantName = getParticipantName(conversation);
                    const participantPicture = getParticipantPicture(conversation);
                    const unreadCount = conversation.unreadCount || 0;

                    return (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            {participantPicture ? (
                              <img
                                src={participantPicture}
                                alt={participantName}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`avatar-fallback h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ${participantPicture ? 'hidden' : ''}`}>
                              <span className="text-sm font-medium">
                                {participantName.charAt(0)}
                              </span>
                            </div>
                            {unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error text-error-foreground text-xs flex items-center justify-center font-semibold">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium truncate">
                                {participantName}
                              </p>
                              {conversation.lastMessageAt && (
                                <span className="text-xs opacity-70 shrink-0">
                                  {format(
                                    new Date(conversation.lastMessageAt),
                                    "MMM d"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {getParticipantPicture(selectedConversation) ? (
                      <img
                        src={getParticipantPicture(selectedConversation)}
                        alt={getParticipantName(selectedConversation)}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`avatar-fallback h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ${getParticipantPicture(selectedConversation) ? 'hidden' : ''}`}>
                      <span className="text-sm font-medium">
                        {getParticipantName(selectedConversation).charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">
                      {getParticipantName(selectedConversation)}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      const senderName = message.sender
                        ? `${message.sender.firstName} ${message.sender.lastName}`
                        : "Unknown User";
                      const senderPicture = message.sender?.profilePicture;

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          <div className="relative h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            {senderPicture ? (
                              <img
                                src={senderPicture}
                                alt={senderName}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`avatar-fallback h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center ${senderPicture ? 'hidden' : ''}`}>
                              <span className="text-xs font-medium">
                                {senderName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className={`flex-1 min-w-0 ${isOwn ? "flex flex-col items-end" : ""}`}>
                            <div
                              className={`inline-block max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(
                                new Date(message.createdAt),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                    >
                      {sending ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list or search for a user to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

