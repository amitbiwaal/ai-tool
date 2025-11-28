"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  Database,
  Eye,
  Lock,
  Cookie,
  ExternalLink,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  CheckCircle,
  ArrowLeft,
  Info,
  Settings,
} from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction", icon: Info },
  { id: "information", title: "Information We Collect", icon: Database },
  { id: "usage", title: "How We Use Your Information", icon: Settings },
  { id: "security", title: "Data Security", icon: Lock },
  { id: "cookies", title: "Cookies", icon: Cookie },
  { id: "third-party", title: "Third-Party Services", icon: ExternalLink },
  { id: "rights", title: "Your Rights", icon: UserCheck },
  { id: "children", title: "Children's Privacy", icon: Baby },
  { id: "changes", title: "Changes to This Policy", icon: RefreshCw },
  { id: "contact", title: "Contact Us", icon: Mail },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    // Format date on client side to avoid hydration mismatch
    setLastUpdated(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-blue-100 mt-2">
                Your privacy is important to us. Learn how we protect your data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Last updated: {lastUpdated || "Loading..."}
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              GDPR Compliant
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Table of Contents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          onClick={() => setActiveSection(section.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === section.id
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="line-clamp-1">{section.title}</span>
                        </a>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Introduction */}
            <Card id="introduction" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Welcome to AI Tools Directory. We respect your privacy and are committed to
                  protecting your personal data. This privacy policy explains how we collect,
                  use, and safeguard your information.
                </p>
                <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 p-4 rounded-r-lg mt-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Our Commitment:</strong> We are committed to transparency and protecting
                    your privacy. This policy outlines our practices regarding your personal information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card id="information" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Personal Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    We collect the following personal information when you use our service:
                  </p>
                  <ul className="space-y-2 ml-6">
                    {[
                      "Name and email address when you create an account",
                      "Profile information you choose to provide",
                      "Reviews and ratings you submit",
                      "Tools you submit to our directory",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Usage Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    We automatically collect certain information about your usage:
                  </p>
                  <ul className="space-y-2 ml-6">
                    {[
                      "Pages you visit on our website",
                      "Tools you view and interact with",
                      "Search queries",
                      "Device and browser information",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card id="usage" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    "Provide and improve our services",
                    "Personalize your experience",
                    "Communicate with you about updates and features",
                    "Moderate user-generated content",
                    "Analyze usage patterns to improve our platform",
                    "Prevent fraud and abuse",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card id="security" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your
                  personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Security Measures:</strong> We use industry-standard encryption, secure
                    servers, and regular security audits to protect your data.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card id="cookies" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Cookie className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience,
                  analyze site traffic, and personalize content. You can control cookies through
                  your browser settings.
                </p>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Cookie Types:</strong> We use essential cookies for site functionality,
                    analytics cookies to understand usage, and preference cookies to remember your settings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Services */}
            <Card id="third-party" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  Third-Party Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We may use third-party services for analytics, authentication, and other
                  functionalities. These services have their own privacy policies.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Note:</strong> We carefully select third-party services that comply
                    with privacy regulations and only share necessary information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card id="rights" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <UserCheck className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  You have the right to:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    "Access your personal data",
                    "Correct inaccurate data",
                    "Request deletion of your data",
                    "Object to processing of your data",
                    "Export your data",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Exercise Your Rights:</strong> To exercise any of these rights, please
                    contact us using the information provided in the Contact Us section.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card id="children" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Baby className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  Children&apos;s Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our service is not intended for children under 13. We do not knowingly collect
                  personal information from children under 13.
                </p>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Important:</strong> If you are a parent or guardian and believe your
                    child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to This Policy */}
            <Card id="changes" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of
                  significant changes by posting the new policy on this page.
                </p>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <strong>Stay Informed:</strong> We recommend reviewing this policy periodically
                    to stay informed about how we protect your information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card id="contact" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  If you have questions about this privacy policy or wish to exercise your rights,
                  please contact us at:
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:privacy@aitoolsdirectory.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    privacy@aitoolsdirectory.com
                  </a>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <strong>Response Time:</strong> We aim to respond to all privacy-related
                      inquiries within 30 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/terms" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Terms of Service
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
