"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Users, Shield, Search, UserCheck, UserX, Plus, X, Ban, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "moderator";
  tools_count: number;
  status: "active" | "banned" | "suspended";
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [banningUser, setBanningUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user" as "user" | "admin" | "moderator",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ API Response received");
        console.log("Users count:", data.users?.length || 0);
        console.log("Total count from API:", data.count || 0);
        console.log("Users data:", data.users);
        
        if (data.users && data.users.length > 0) {
          console.log("✅ Setting users in state:", data.users.length);
          setUsers(data.users);
        } else {
          console.warn("⚠️ No users in response, setting empty array");
          setUsers([]);
          if (data.message) {
            toast.info(data.message);
          }
        }
      } else {
        const error = await response.json();
        console.error("❌ Failed to fetch users:", error);
        console.error("Error details:", error.details);
        console.error("Error code:", error.code);
        toast.error(error.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin" | "moderator") => {
    if (changingRole) return; // Prevent multiple clicks
    
    setChangingRole(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`User role updated to ${newRole} successfully!`);
        // Update user in list
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Change role error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to change user roles.");
        } else {
          toast.error(errorMessage || "Failed to change user role");
        }
      }
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast.error(error?.message || "Network error. Please check your connection and try again.");
    } finally {
      setChangingRole(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.password) {
      toast.error("Email and password are required");
      return;
    }

    if (newUserData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setAddingUser(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("User created successfully!");
        setShowAddUserForm(false);
        setNewUserData({ email: "", password: "", full_name: "", role: "user" });
        fetchUsers(); // Refresh users list
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Add user error:", {
          status: response.status,
          error: errorMessage,
        });
        
        if (response.status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to create users.");
        } else {
          toast.error(errorMessage || "Failed to create user");
        }
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setAddingUser(false);
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    if (banningUser) return;
    
    const newStatus = currentStatus === "banned" ? "active" : "banned";
    const action = newStatus === "banned" ? "ban" : "unban";
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setBanningUser(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: newStatus,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`User ${action === "ban" ? "banned" : "unbanned"} successfully!`);
        fetchUsers(); // Refresh users list
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Ban user error:", {
          status: response.status,
          error: errorMessage,
        });
        toast.error(errorMessage || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error("Error banning user:", error);
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setBanningUser(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (deletingUser) return;
    
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUser(userId);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("User deleted successfully!");
        fetchUsers(); // Refresh users list
      } else {
        const errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("Delete user error:", {
          status: response.status,
          error: errorMessage,
        });
        toast.error(errorMessage || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setDeletingUser(null);
    }
  };

  const getUserName = (user: User) => {
    return user.full_name || user.email?.split("@")[0] || "User";
  };

  const getUserAvatar = (user: User) => {
    if (user.avatar_url) return user.avatar_url;
    if (user.email) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
    }
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      getUserName(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    moderators: users.filter(u => u.role === "moderator").length,
    regularUsers: users.filter(u => u.role === "user").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage platform users and their roles</p>
      </div>
        <Button 
          className="gap-2 shadow-lg"
          onClick={() => setShowAddUserForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-[500px] mx-4 border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Add New User</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddUserForm(false);
                  setNewUserData({ email: "", password: "", full_name: "", role: "user" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as "user" | "admin" | "moderator" })}
                  className="mt-2"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddUserForm(false);
                    setNewUserData({ email: "", password: "", full_name: "", role: "user" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={addingUser}>
                  {addingUser ? "Creating..." : "Create User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold mt-1">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold mt-1">{stats.moderators}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold mt-1">{stats.regularUsers}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search Users</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Role</Label>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-2"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
      <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 flex-shrink-0">
                      <img
                        src={getUserAvatar(user)}
                        alt={getUserName(user)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{getUserName(user)}</h3>
                        {user.status === "banned" && (
                          <Badge variant="destructive" className="text-xs">Banned</Badge>
                        )}
                        {user.status === "suspended" && (
                          <Badge variant="secondary" className="text-xs bg-yellow-500">Suspended</Badge>
                        )}
                      </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                        <Badge 
                          variant={user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"}
                        >
                          {user.role}
                        </Badge>
                        <Badge variant="outline">{user.tools_count || 0} tools</Badge>
                        <Badge variant="outline" className="text-xs">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                      </div>
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    <Select
                      id={`role-${user.id}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "user" | "admin" | "moderator")}
                      disabled={changingRole === user.id}
                      className="min-w-[130px]"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </Select>
                    {changingRole === user.id && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <Button
                      variant={user.status === "banned" ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleBanUser(user.id, user.status)}
                      disabled={banningUser === user.id || user.role === "admin"}
                      title={user.status === "banned" ? "Unban user" : "Ban user"}
                    >
                      {banningUser === user.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : user.status === "banned" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id, getUserName(user))}
                      disabled={deletingUser === user.id || user.role === "admin"}
                      title="Delete user"
                    >
                      {deletingUser === user.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Users Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || roleFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "No users in the system yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

