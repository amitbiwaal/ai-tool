import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available" },
      { status: 503 }
    );
  }

  try {
    // Get only public site settings (no sensitive data like payment keys, emails, etc.)
    const { data, error } = await supabase
      .from("settings")
      .select("category, key, value")
      .eq("category", "site");


    if (error) {
      console.error("Error fetching public settings:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Convert array to object for easier access
    const settingsObj: Record<string, any> = {};
    data?.forEach((setting) => {
      if (!settingsObj[setting.category]) {
        settingsObj[setting.category] = {};
      }
      settingsObj[setting.category][setting.key] = setting.value;
    });

    // Provide defaults if no settings exist
    if (!settingsObj.site) {
      settingsObj.site = {
        name: "AI Tools Directory",
        description: "Discover the best AI tools",
        siteTagline: "EST. 2025",
        topBarText: "Curated tools • Premium insights •",
        topBarContact: "Business inquiries: partner@mostpopularaitools.com",
        copyrightText: "© {year} AI Tools Directory. All rights reserved.",
      };
    }


    return NextResponse.json(
      { settings: settingsObj },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'CDN-Cache-Control': 'max-age=3600', // CDN cache for 1 hour
        }
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
