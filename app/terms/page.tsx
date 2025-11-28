"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  User,
  FileEdit,
  Upload,
  Copyright,
  ExternalLink,
  AlertTriangle,
  Scale,
  RefreshCw,
  Gavel,
  Mail,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms", icon: CheckCircle },
  { id: "description", title: "Description of Service", icon: FileText },
  { id: "accounts", title: "User Accounts", icon: User },
  { id: "content", title: "User Content", icon: FileEdit },
  { id: "submissions", title: "Tool Submissions", icon: Upload },
  { id: "intellectual", title: "Intellectual Property", icon: Copyright },
  { id: "third-party", title: "Third-Party Links", icon: ExternalLink },
  { id: "disclaimers", title: "Disclaimers", icon: AlertTriangle },
  { id: "liability", title: "Limitation of Liability", icon: Scale },
  { id: "changes", title: "Changes to Terms", icon: RefreshCw },
  { id: "governing", title: "Governing Law", icon: Gavel },
  { id: "contact", title: "Contact Information", icon: Mail },
];

export default function TermsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
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
                Terms of Service
              </h1>
              <p className="text-blue-100 mt-2">
                Please read these terms carefully before using our service
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Last updated: {lastUpdated || "Loading..."}
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              Version 1.0
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
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Welcome to AI Tools Directory. By accessing and using our platform, you agree to
                  be bound by these Terms of Service. If you do not agree with any part of these
                  terms, please do not use our service.
                </p>
              </CardContent>
            </Card>

            {/* Section 1: Acceptance of Terms */}
            <Card id="acceptance" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  By accessing and using AI Tools Directory, you accept and agree to be bound by
                  these Terms of Service. If you do not agree to these terms, please do not use
                  our service.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Important:</strong> Your use of our service constitutes acceptance of
                    these terms. We recommend reviewing them periodically as they may be updated.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Description of Service */}
            <Card id="description" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  2. Description of Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  AI Tools Directory provides a platform for discovering, reviewing, and comparing
                  AI tools. We aggregate information about AI tools and provide a community platform
                  for users to share their experiences.
                </p>
              </CardContent>
            </Card>

            {/* Section 3: User Accounts */}
            <Card id="accounts" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  3. User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    3.1 Account Creation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    To access certain features, you may need to create an account. You must provide
                    accurate and complete information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    3.2 Account Security
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials
                    and for all activities under your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    3.3 Account Termination
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to suspend or terminate accounts that violate these terms
                    or engage in abusive behavior.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: User Content */}
            <Card id="content" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <FileEdit className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  4. User Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    4.1 Content Ownership
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    You retain ownership of content you submit (reviews, tool submissions, etc.).
                    By submitting content, you grant us a license to use, display, and distribute
                    that content on our platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    4.2 Content Guidelines
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">User content must:</p>
                  <ul className="space-y-2 ml-6">
                    {[
                      "Be accurate and truthful",
                      "Not contain offensive, abusive, or discriminatory material",
                      "Not infringe on intellectual property rights",
                      "Not contain spam or promotional material",
                      "Comply with all applicable laws",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    4.3 Content Moderation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to remove or modify content that violates our guidelines
                    or these terms.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Tool Submissions */}
            <Card id="submissions" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  5. Tool Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">When submitting tools to our directory:</p>
                <ul className="space-y-2 ml-6">
                  {[
                    "You must have the right to submit the information",
                    "Information must be accurate and up-to-date",
                    "Tools are subject to review and approval",
                    "We reserve the right to reject or remove submissions",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Section 6: Intellectual Property */}
            <Card id="intellectual" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Copyright className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  6. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The AI Tools Directory platform, including its design, features, and content
                  (excluding user-generated content), is owned by us and protected by intellectual
                  property laws.
                </p>
              </CardContent>
            </Card>

            {/* Section 7: Third-Party Links */}
            <Card id="third-party" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  7. Third-Party Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our service may contain links to third-party websites or services. We are not
                  responsible for the content or practices of these third parties.
                </p>
              </CardContent>
            </Card>

            {/* Section 8: Disclaimers */}
            <Card id="disclaimers" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  8. Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our service is provided &quot;as is&quot; without warranties of any kind. We do not
                  guarantee the accuracy, completeness, or reliability of information about AI tools.
                </p>
              </CardContent>
            </Card>

            {/* Section 9: Limitation of Liability */}
            <Card id="liability" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Scale className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  9. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We shall not be liable for any indirect, incidental, special, or consequential
                  damages arising from your use of our service.
                </p>
              </CardContent>
            </Card>

            {/* Section 10: Changes to Terms */}
            <Card id="changes" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  10. Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of our
                  service after changes constitutes acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            {/* Section 11: Governing Law */}
            <Card id="governing" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Gavel className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  11. Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  These terms shall be governed by and construed in accordance with applicable laws.
                </p>
              </CardContent>
            </Card>

            {/* Section 12: Contact Information */}
            <Card id="contact" className="border-2 shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  12. Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  For questions about these terms, please contact us at:
                </p>
                <a
                  href="mailto:legal@aitoolsdirectory.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  legal@aitoolsdirectory.com
                </a>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/privacy" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Privacy Policy
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
