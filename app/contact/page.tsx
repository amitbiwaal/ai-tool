"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  MapPin, 
  Phone, 
  Clock,
  Headphones,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ContactPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });

  // Content from database
  const [pageContent, setPageContent] = useState<Record<string, string>>({});

  // Fetch page content from database
  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch("/api/admin/content?page=contact");
      const content: Record<string, string> = {};

      if (response.ok) {
        const data = await response.json();
        data.content?.forEach((item: any) => {
          const value = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
          content[item.key] = value;
        });
      }

      setPageContent(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          website: formData.website || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || pageContent.successMessage || "Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      } else {
        toast.error(data.error || pageContent.errorMessage || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(pageContent.errorMessage || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactReasons = [
    {
      icon: Headphones,
      title: pageContent.reason1Title || "General Support",
      description: pageContent.reason1Description || "Get help with using our platform",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: FileText,
      title: pageContent.reason2Title || "Submit a Tool",
      description: pageContent.reason2Description || "Add your AI tool to our directory",
      color: "text-purple-600 dark:text-purple-400",
      link: "/submit"
    },
    {
      icon: Users,
      title: pageContent.reason3Title || "Partnership",
      description: pageContent.reason3Description || "Collaborate with us",
      color: "text-pink-600 dark:text-pink-400"
    },
    {
      icon: MessageSquare,
      title: pageContent.reason4Title || "Feedback",
      description: pageContent.reason4Description || "Share your thoughts and suggestions",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-24 text-center">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs sm:text-sm">
            {pageContent.heroBadge || "Get in Touch"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
            {pageContent.heroTitle || "We're Here to Help"}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {pageContent.heroDescription || "Have a question, suggestion, or just want to say hello? We'd love to hear from you."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Contact Reasons */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{pageContent.howCanWeHelpTitle || "How Can We Help?"}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {pageContent.howCanWeHelpDescription || "Choose the best way to reach us based on your needs"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
            {contactReasons.map((reason, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="pt-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reason.color.includes('blue') ? 'from-blue-500/10 to-blue-600/10' : reason.color.includes('purple') ? 'from-purple-500/10 to-purple-600/10' : reason.color.includes('pink') ? 'from-pink-500/10 to-pink-600/10' : 'from-orange-500/10 to-orange-600/10'} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <reason.icon className={`w-7 h-7 ${reason.color}`} />
                  </div>
                  <h3 className="font-bold mb-2">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  {pageContent.formTitle || "Send Us a Message"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {pageContent.formDescription || "Fill out the form below and we'll get back to you as soon as possible"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm sm:text-base font-semibold">
                        {pageContent.nameLabel || "Name"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder={pageContent.namePlaceholder || "John Doe"}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base font-semibold">
                        {pageContent.emailLabel || "Email"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder={pageContent.emailPlaceholder || "john@example.com"}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm sm:text-base font-semibold">
                        {pageContent.subjectLabel || "Subject"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder={pageContent.subjectPlaceholder || "What is this regarding?"}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm sm:text-base font-semibold">
                        {pageContent.websiteLabel || "Website URL"}
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder={pageContent.websitePlaceholder || "https://example.com"}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm sm:text-base font-semibold">
                      {pageContent.messageLabel || "Message"} <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder={pageContent.messagePlaceholder || "Tell us more about your inquiry..."}
                      rows={5}
                      className="resize-none text-sm sm:text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-12 gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {pageContent.sendingButton || "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {pageContent.sendButton || "Send Message"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Email Card */}
            <Card className="border-2 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">{pageContent.emailLabelText || "Email Us"}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  {pageContent.emailDescription || "For general inquiries and support"}
                </p>
                <a
                  href={`mailto:${pageContent.emailValue || "hello@aitoolsdirectory.com"}`}
                  className="text-primary hover:underline font-medium flex items-center gap-1 text-sm sm:text-base break-all"
                >
                  {pageContent.emailValue || "hello@aitoolsdirectory.com"}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                </a>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card className="border-2">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">{pageContent.responseTitle || "Response Time"}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {pageContent.responseText1 || "24-48 hours for general inquiries"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {pageContent.responseText2 || "Priority support for partners"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {pageContent.responseText3 || "Available Monday to Friday"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links Card */}
            <Card className="border-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">{pageContent.quickLinksTitle || "Quick Links"}</h3>
                <div className="space-y-2">
                  <Link href="/submit" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowRight className="w-4 h-4" />
                    {pageContent.quickLink1 || "Submit Your AI Tool"}
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowRight className="w-4 h-4" />
                    {pageContent.quickLink2 || "About Us"}
                  </Link>
                  <Link href="/blog" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowRight className="w-4 h-4" />
                    {pageContent.quickLink3 || "Read Our Blog"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Prompt */}
        <Card className="mt-12 sm:mt-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 overflow-hidden relative mx-4 sm:mx-0">
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <CardContent className="relative pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{pageContent.faqTitle || "Looking for Quick Answers?"}</h3>
                <p className="text-sm sm:text-base text-white/90">
                  {pageContent.faqDescription || "Check out our FAQ section or browse our help documentation"}
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
                <Link href="/tools">
                  <Button size="lg" variant="secondary" className="gap-2">
                    {pageContent.faqButton || "Browse Tools"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

