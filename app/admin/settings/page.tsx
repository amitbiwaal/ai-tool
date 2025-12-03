"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  site?: {
    name?: string;
    description?: string;
    contactEmail?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleSiteVerification?: string;
  };
  email?: {
    smtpHost?: string;
    smtpPort?: string;
    fromEmail?: string;
  };
  payment?: {
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
  };
}

export default function SettingsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    site: {},
    seo: {},
    email: {},
    payment: {},
    analytics: {},
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (response.ok && data.settings) {
        setSettings(data.settings);
      } else {
        // Initialize with defaults if no settings exist
        setSettings({
          site: {
            name: "AI Tools Directory",
            description: "Discover the best AI tools",
            contactEmail: "hello@mostpopularaitools.com",
          },
          seo: {
            metaTitle: "AI Tools Directory - Best AI Tools",
            metaDescription: "Discover and compare the best AI tools...",
            metaKeywords: "AI tools, artificial intelligence, AI directory",
          },
          email: {
            smtpHost: "smtp.example.com",
            smtpPort: "587",
            fromEmail: "noreply@mostpopularaitools.com",
          },
          payment: {
            razorpayKeyId: "",
            razorpayKeySecret: "",
          },
          analytics: {
            googleAnalyticsId: "",
            googleSiteVerification: "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Settings saved successfully!");
        // Refresh settings
        await fetchSettings();
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Configure your platform</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings.site?.name || ""}
              onChange={(e) => updateSetting("site", "name", e.target.value)}
              placeholder="AI Tools Directory"
            />
          </div>
          <div>
            <Label>Site Description</Label>
            <Textarea
              value={settings.site?.description || ""}
              onChange={(e) => updateSetting("site", "description", e.target.value)}
              placeholder="Discover the best AI tools"
              rows={3}
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={settings.site?.contactEmail || ""}
              onChange={(e) => updateSetting("site", "contactEmail", e.target.value)}
              placeholder="hello@mostpopularaitools.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Title</Label>
            <Input
              value={settings.seo?.metaTitle || ""}
              onChange={(e) => updateSetting("seo", "metaTitle", e.target.value)}
              placeholder="AI Tools Directory - Best AI Tools"
            />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={settings.seo?.metaDescription || ""}
              onChange={(e) => updateSetting("seo", "metaDescription", e.target.value)}
              placeholder="Discover and compare the best AI tools..."
              rows={3}
            />
          </div>
          <div>
            <Label>Meta Keywords</Label>
            <Input
              value={settings.seo?.metaKeywords || ""}
              onChange={(e) => updateSetting("seo", "metaKeywords", e.target.value)}
              placeholder="AI tools, artificial intelligence, AI directory"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Analytics & Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Google Analytics ID (GA4)</Label>
            <Input
              value={settings.analytics?.googleAnalyticsId || ""}
              onChange={(e) => updateSetting("analytics", "googleAnalyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your Google Analytics 4 Measurement ID (starts with G-)
            </p>
          </div>
          <div>
            <Label>Google Site Verification Code</Label>
            <Input
              value={settings.analytics?.googleSiteVerification || ""}
              onChange={(e) => updateSetting("analytics", "googleSiteVerification", e.target.value)}
              placeholder="verification_code_from_google"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get this from Google Search Console → Settings → Ownership verification
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> After saving, add these values to your <code>.env.local</code> file as <code>NEXT_PUBLIC_GA_ID</code> and <code>NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION</code> for them to take effect.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>SMTP Host</Label>
            <Input
              value={settings.email?.smtpHost || ""}
              onChange={(e) => updateSetting("email", "smtpHost", e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          <div>
            <Label>SMTP Port</Label>
            <Input
              type="number"
              value={settings.email?.smtpPort || ""}
              onChange={(e) => updateSetting("email", "smtpPort", e.target.value)}
              placeholder="587"
            />
          </div>
          <div>
            <Label>From Email</Label>
            <Input
              type="email"
              value={settings.email?.fromEmail || ""}
              onChange={(e) => updateSetting("email", "fromEmail", e.target.value)}
              placeholder="noreply@mostpopularaitools.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Payment Gateway Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Razorpay Key ID</Label>
            <Input
              type="password"
              value={settings.payment?.razorpayKeyId || ""}
              onChange={(e) => updateSetting("payment", "razorpayKeyId", e.target.value)}
              placeholder="rzp_test_..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
            </p>
          </div>
          <div>
            <Label>Razorpay Key Secret</Label>
            <Input
              type="password"
              value={settings.payment?.razorpayKeySecret || ""}
              onChange={(e) => updateSetting("payment", "razorpayKeySecret", e.target.value)}
              placeholder="Your Razorpay Key Secret"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your Razorpay Key Secret (keep this secure)
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save All Settings
          </>
        )}
      </Button>
    </div>
  );
}

