"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock,
  User,
  MessageSquare,
  Globe,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

export default function ContactManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read" | "replied">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contact?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched messages from database:", data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        const error = await response.json();
        console.error("❌ Failed to fetch messages:", error);
        toast.error(error.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || msg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
  };

  const handleMarkAsRead = async (id: string) => {
    setUpdating(id);
    try {
      const response = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: id,
          status: "read",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.map((m) => 
          m.id === id ? { ...m, status: "read" as const } : m
        ));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: "read" });
        }
        toast.success("Marked as read");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update message");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkAsReplied = async (id: string) => {
    setUpdating(id);
    try {
      const response = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: id,
          status: "replied",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.map((m) => 
          m.id === id ? { ...m, status: "replied" as const } : m
        ));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: "replied" });
        }
        toast.success("Marked as replied");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update message");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/contact?messageId=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        toast.success("Message deleted");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "read":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage contact form submissions and inquiries
          </p>
        </div>
        <Button
          onClick={fetchMessages}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.unread}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read</p>
                <p className="text-2xl font-bold mt-1 text-gray-600">{stats.read}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.replied}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "unread" ? "default" : "outline"}
                onClick={() => setFilterStatus("unread")}
                size="sm"
              >
                Unread
              </Button>
              <Button
                variant={filterStatus === "read" ? "default" : "outline"}
                onClick={() => setFilterStatus("read")}
                size="sm"
              >
                Read
              </Button>
              <Button
                variant={filterStatus === "replied" ? "default" : "outline"}
                onClick={() => setFilterStatus("replied")}
                size="sm"
              >
                Replied
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading messages...</p>
              </CardContent>
            </Card>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <Card
                key={message.id}
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedMessage?.id === message.id ? "ring-2 ring-primary" : ""
                } ${message.status === "unread" ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{message.name}</h3>
                        {message.status === "unread" && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{message.email}</p>
                      <p className="font-semibold text-sm mb-2 line-clamp-1">{message.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-2 sticky top-8">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                      <Badge className={getStatusColor(selectedMessage.status)}>
                        {selectedMessage.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary">
                          {selectedMessage.email}
                        </a>
                      </div>
                      {selectedMessage.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <a
                            href={selectedMessage.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedMessage.status === "unread" && (
                      <Button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Mark as Read
                      </Button>
                    )}
                    {selectedMessage.status !== "replied" && (
                      <Button
                        onClick={() => handleMarkAsReplied(selectedMessage.id)}
                        variant="outline"
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Replied
                      </Button>
                    )}
                    <a 
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(`\n\n--- Original Message ---\nFrom: ${selectedMessage.name} <${selectedMessage.email}>\nDate: ${new Date(selectedMessage.created_at).toLocaleString()}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.message}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="gap-2">
                        <Mail className="h-4 w-4" />
                        Reply via Gmail
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

