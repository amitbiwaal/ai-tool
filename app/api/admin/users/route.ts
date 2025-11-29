import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      console.error("Supabase client not available");
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Authentication error" }, { status: 401 });
    }

    if (!user) {
      console.error("No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", user.id);

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      console.error("User role not authorized:", profile?.role);
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    console.log("User authorized, fetching profiles...");

    // Use service role client for admin operations to bypass RLS if needed
    // But first try with regular client (RLS should allow admin access)
    let querySupabase = supabase;
    
    // If service role key is available, we can use it as fallback
    // But regular client should work if RLS policies are correct
    console.log("Using authenticated client for query (RLS should allow admin access)");
    
    // Check if we should use service role client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      // Use admin client for fetching all profiles (bypasses RLS)
      querySupabase = supabaseAdmin;
      console.log("Using service role client to fetch all profiles (bypasses RLS)");
    }

    // Fetch all profiles with tool counts
    // Try to fetch with status column, fallback if it doesn't exist
    let profiles;
    let profilesError;
    
    const { data: profilesWithStatus, error: errorWithStatus } = await querySupabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        status,
        bio,
        website,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (errorWithStatus && errorWithStatus.message?.includes("column") && errorWithStatus.message?.includes("status")) {
      // Status column doesn't exist yet, fetch without it
      console.warn("Status column not found, fetching without it.");
      const { data: profilesWithoutStatus, error: errorWithoutStatus } = await querySupabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          role,
          bio,
          website,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });
      
      profiles = profilesWithoutStatus;
      profilesError = errorWithoutStatus;
    } else {
      profiles = profilesWithStatus;
      profilesError = errorWithStatus;
    }

    if (profilesError) {
      console.error("Profiles fetch error:", JSON.stringify(profilesError, null, 2));
      console.error("Error code:", profilesError.code);
      console.error("Error message:", profilesError.message);
      console.error("Error details:", profilesError.details);
      console.error("Error hint:", profilesError.hint);
      return NextResponse.json({ 
        error: profilesError.message || "Failed to fetch profiles",
        details: profilesError,
        code: profilesError.code
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in database");
      console.log("Query was successful but returned empty array");
      return NextResponse.json({ 
        users: [],
        message: "No users found in database"
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log(`✅ Fetched ${profiles.length} profiles from database`);
    console.log("All profiles:", JSON.stringify(profiles, null, 2));
    console.log("Profile roles:", profiles.map(p => ({ id: p.id, email: p.email, role: p.role })));
    
    if (profiles.length > 0) {
      console.log("Sample profile:", profiles[0]);
    }

    // Get tool counts for each user
    const usersWithCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count } = await querySupabase
          .from("tools")
          .select("*", { count: "exact", head: true })
          .eq("submitted_by", profile.id);

        return {
          ...profile,
          tools_count: count || 0,
          status: (profile as any)?.status || "active" as "active" | "banned" | "suspended",
        };
      })
    );

    console.log(`✅ Returning ${usersWithCounts.length} users with tool counts`);
    
    return NextResponse.json({ 
      users: usersWithCounts || [],
      count: usersWithCounts?.length || 0
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("Unexpected error in GET users route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    // Validate role
    if (!["user", "admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent self-demotion (admin can't remove their own admin role)
    if (userId === user.id && role !== "admin" && profile?.role === "admin") {
      return NextResponse.json({ error: "You cannot change your own admin role" }, { status: 400 });
    }

    // Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Update role error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to update user role",
        details: updateError.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ 
      user: updatedProfile,
      message: "User role updated successfully" 
    });
  } catch (error: any) {
    console.error("Unexpected error in PUT users route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json({ 
        error: "Invalid API key: SUPABASE_SERVICE_ROLE_KEY is not configured. Please add it to your .env.local file. Get it from Supabase Dashboard > Settings > API > service_role key (secret)" 
      }, { status: 500 });
    }
    
    // Validate that the key is not empty
    if (process.env.SUPABASE_SERVICE_ROLE_KEY.trim().length === 0) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is empty");
      return NextResponse.json({ 
        error: "Invalid API key: SUPABASE_SERVICE_ROLE_KEY is empty. Please add a valid service role key." 
      }, { status: 500 });
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate role
    if (role && !["user", "admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Use Supabase Admin API to create user
    const { createClient } = require('@supabase/supabase-js');
    
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    
    if (!supabaseUrl) {
      console.error("NEXT_PUBLIC_SUPABASE_URL is missing or empty");
      return NextResponse.json({ 
        error: "Invalid API key: NEXT_PUBLIC_SUPABASE_URL is not configured" 
      }, { status: 500 });
    }
    
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing or empty");
      return NextResponse.json({ 
        error: "Invalid API key: SUPABASE_SERVICE_ROLE_KEY is not configured. Please add it to your .env.local file and restart the server." 
      }, { status: 500 });
    }
    
    // Validate key format (should start with 'eyJ' for JWT)
    if (!serviceRoleKey.startsWith('eyJ')) {
      console.error("SUPABASE_SERVICE_ROLE_KEY format appears invalid (should start with 'eyJ')");
      return NextResponse.json({ 
        error: "Invalid API key format: SUPABASE_SERVICE_ROLE_KEY should be a JWT token starting with 'eyJ'. Please check your .env.local file and ensure you copied the service_role key (not anon key)." 
      }, { status: 500 });
    }
    
    // Log key info for debugging (first 20 chars only for security)
    console.log("Using Supabase URL:", supabaseUrl);
    console.log("Service Role Key (first 20 chars):", serviceRoleKey.substring(0, 20) + "...");
    console.log("Service Role Key length:", serviceRoleKey.length);
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name || null,
      }
    });

    if (authError || !authUser) {
      console.error("Error creating auth user:", authError);
      console.error("Error code:", authError?.code);
      console.error("Error status:", authError?.status);
      console.error("Full error:", JSON.stringify(authError, null, 2));
      
      // Provide more specific error messages
      let errorMessage = authError?.message || "Failed to create user";
      
      if (authError?.message?.includes('Invalid API key') || 
          authError?.message?.includes('JWT') || 
          authError?.message?.includes('invalid') ||
          authError?.status === 401 ||
          authError?.code === 'invalid_api_key') {
        errorMessage = "Invalid API key: Please verify your SUPABASE_SERVICE_ROLE_KEY in .env.local file. Make sure:\n1. You copied the service_role key (not anon key)\n2. No extra spaces or quotes\n3. Server was restarted after adding the key\n4. Key starts with 'eyJ'";
      } else if (authError?.message?.includes('already registered') || 
                 authError?.message?.includes('already exists') ||
                 authError?.code === 'user_already_exists') {
        errorMessage = "User with this email already exists";
      } else if (authError?.message?.includes('email')) {
        errorMessage = "Invalid email format or email already in use";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: authError?.message,
          code: authError?.code,
          status: authError?.status,
          hint: "Check server console for detailed error logs"
        },
        { status: 500 }
      );
    }

    // Create profile using admin client (bypasses RLS)
    const { data: newProfile, error: profileCreateError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: full_name || null,
        role: role || "user",
      })
      .select()
      .single();

    if (profileCreateError) {
      console.error("Error creating profile:", profileCreateError);
      // Try to delete the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      } catch (deleteError) {
        console.error("Error deleting auth user after profile creation failure:", deleteError);
      }
      return NextResponse.json(
        { error: profileCreateError.message || "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: newProfile,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Unexpected error in POST users route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: "User ID and status are required" }, { status: 400 });
    }

    // Validate status
    if (!["active", "banned", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Prevent self-ban
    if (userId === user.id && status !== "active") {
      return NextResponse.json({ error: "You cannot ban or suspend yourself" }, { status: 400 });
    }

    // Update user status
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Update status error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to update user status",
        details: updateError.details || null
      }, { status: 500 });
    }

    // If banning, also disable auth user
    if (status === "banned" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        // Update user metadata to mark as banned
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { banned: true }
        });
      } catch (authError) {
        console.error("Error updating auth user:", authError);
        // Don't fail the request if auth update fails
      }
    }

    return NextResponse.json({ 
      user: updatedProfile,
      message: `User ${status === "banned" ? "banned" : status === "suspended" ? "suspended" : "activated"} successfully` 
    });
  } catch (error: any) {
    console.error("Unexpected error in PATCH users route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (only admin can delete users)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json({ 
        error: "Server configuration error: Service role key not available" 
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    // Check if user being deleted is an admin
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (targetUser?.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 400 });
    }

    // Use Supabase Admin API to delete user from auth
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Delete user from Supabase Auth (this will cascade delete profile due to foreign key)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      // If auth deletion fails, try to delete profile manually
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        return NextResponse.json(
          { error: deleteError.message || "Failed to delete user" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Unexpected error in DELETE users route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

