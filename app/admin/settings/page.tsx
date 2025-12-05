"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Settings {
  site?: {
    name?: string;
    description?: string;
    contactEmail?: string;
    siteTagline?: string;
    logoUrl?: string;
    logoUrlLight?: string;
    logoUrlDark?: string;
    topBarText?: string;
    topBarContact?: string;
    copyrightText?: string;
    faviconUrl?: string;
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
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
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
            siteTagline: "EST. 2025",
            topBarText: "Curated tools • Premium insights •",
            topBarContact: "Business inquiries: partner@mostpopularaitools.com",
            copyrightText: "© {year} AI Tools Directory. All rights reserved.",
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

  const uploadLogoImage = async (file: File, type: string) => {
    setUploadingImage(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      toast.success("Logo uploaded successfully!");
      return data.url;
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
      throw error;
    } finally {
      setUploadingImage(null);
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

          <div>
            <Label>Site Tagline</Label>
            <Input
              value={settings.site?.siteTagline || ""}
              onChange={(e) => updateSetting("site", "siteTagline", e.target.value)}
              placeholder="EST. 2025"
            />
          </div>

          <div>
            <Label>Top Bar Text</Label>
            <Input
              value={settings.site?.topBarText || ""}
              onChange={(e) => updateSetting("site", "topBarText", e.target.value)}
              placeholder="Curated tools • Premium insights •"
            />
          </div>

          <div>
            <Label>Top Bar Contact</Label>
            <Input
              value={settings.site?.topBarContact || ""}
              onChange={(e) => updateSetting("site", "topBarContact", e.target.value)}
              placeholder="Business inquiries: partner@mostpopularaitools.com"
            />
          </div>

          <div>
            <Label>Copyright Text</Label>
            <Input
              value={settings.site?.copyrightText || ""}
              onChange={(e) => updateSetting("site", "copyrightText", e.target.value)}
              placeholder="© {year} AI Tools Directory. All rights reserved."
            />
            <p className="text-xs text-muted-foreground mt-1">Use &#123;year&#125; placeholder for dynamic year</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Site Logos</h4>

            <div>
              <Label>Logo URL (Default)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={settings.site?.logoUrl || ""}
                  onChange={(e) => updateSetting("site", "logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="site-logo-default"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await uploadLogoImage(file, "site-logo-default");
                          updateSetting("site", "logoUrl", imageUrl);
                          toast.success("Logo uploaded successfully!");
                        } catch (error) {
                          toast.error("Failed to upload logo");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage === "site-logo-default"}
                    onClick={() => document.getElementById("site-logo-default")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingImage === "site-logo-default" ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              {settings.site?.logoUrl && (
                <div className="mt-2">
                  <Image
                    src={settings.site.logoUrl}
                    alt="Site logo"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain border rounded"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Default logo used when light/dark mode logos are not specified</p>
            </div>

            <div>
              <Label>Logo URL (Light Mode)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={settings.site?.logoUrlLight || ""}
                  onChange={(e) => updateSetting("site", "logoUrlLight", e.target.value)}
                  placeholder="https://example.com/logo-light.png"
                />
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="site-logo-light"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await uploadLogoImage(file, "site-logo-light");
                          updateSetting("site", "logoUrlLight", imageUrl);
                          toast.success("Light mode logo uploaded successfully!");
                        } catch (error) {
                          toast.error("Failed to upload light mode logo");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage === "site-logo-light"}
                    onClick={() => document.getElementById("site-logo-light")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingImage === "site-logo-light" ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              {settings.site?.logoUrlLight && (
                <div className="mt-2">
                  <Image
                    src={settings.site.logoUrlLight}
                    alt="Site logo (light mode)"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain border rounded"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Logo for light mode. Leave empty to use default logo</p>
            </div>

            <div>
              <Label>Logo URL (Dark Mode)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={settings.site?.logoUrlDark || ""}
                  onChange={(e) => updateSetting("site", "logoUrlDark", e.target.value)}
                  placeholder="https://example.com/logo-dark.png"
                />
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="site-logo-dark"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await uploadLogoImage(file, "site-logo-dark");
                          updateSetting("site", "logoUrlDark", imageUrl);
                          toast.success("Dark mode logo uploaded successfully!");
                        } catch (error) {
                          toast.error("Failed to upload dark mode logo");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage === "site-logo-dark"}
                    onClick={() => document.getElementById("site-logo-dark")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingImage === "site-logo-dark" ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              {settings.site?.logoUrlDark && (
                <div className="mt-2">
                  <Image
                    src={settings.site.logoUrlDark}
                    alt="Site logo (dark mode)"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain border rounded bg-gray-900 p-1"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Logo for dark mode. Leave empty to use default logo</p>
            </div>

            <div>
              <Label>Favicon URL</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={settings.site?.faviconUrl || ""}
                  onChange={(e) => updateSetting("site", "faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
                <div className="flex gap-1">
                  <input
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml"
                    className="hidden"
                    id="site-favicon"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await uploadLogoImage(file, "site-favicon");
                          updateSetting("site", "faviconUrl", imageUrl);
                          toast.success("Favicon uploaded successfully!");
                        } catch (error) {
                          toast.error("Failed to upload favicon");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage === "site-favicon"}
                    onClick={() => document.getElementById("site-favicon")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingImage === "site-favicon" ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              {settings.site?.faviconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={settings.site.faviconUrl}
                    alt="Favicon preview"
                    width={16}
                    height={16}
                    className="border rounded"
                  />
                  <span className="text-xs text-muted-foreground">Favicon preview</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Upload favicon in ICO, PNG, or SVG format (recommended: 32x32 or 64x64)</p>
            </div>
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

