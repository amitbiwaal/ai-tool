"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw, Home, TrendingUp, Sparkles, FolderTree, MessageSquare, Mail, Info, Users, FileText, Shield, BookOpen, Wrench, Upload, GitCompare, Clock, Grid3x3, Search } from "lucide-react";
import { toast } from "sonner";

interface HomeContent {
  // Hero Section
  heroTitle: string;
  heroDescription: string;
  primaryButton: string;
  secondaryButton: string;
  heroStats: string;
  
  // Categories Section
  categoriesTitle: string;
  categoriesDescription: string;
  categoriesButton: string;
  
  // Trending Section
  trendingTitle: string;
  trendingDescription: string;
  
  // How It Works Section
  howItWorksTitle: string;
  howItWorksDescription: string;
  ctaButton: string;
  // How It Works Cards
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  step4Title: string;
  step4Description: string;
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaBadgeText: string;
  ctaPrimaryButton: string;
  ctaSecondaryButton: string;
  ctaTrustIndicator1: string;
  ctaTrustIndicator2: string;
  ctaTrustIndicator3: string;
  
  // Testimonials Section
  testimonialsTitle: string;
  testimonialsDescription: string;
  testimonialsBadgeText: string;
  testimonialsBadgeEmoji: string;
  // Testimonial Cards (up to 12)
  testimonial1Name: string;
  testimonial1Role: string;
  testimonial1Content: string;
  testimonial1Rating: string;
  testimonial2Name: string;
  testimonial2Role: string;
  testimonial2Content: string;
  testimonial2Rating: string;
  testimonial3Name: string;
  testimonial3Role: string;
  testimonial3Content: string;
  testimonial3Rating: string;
  testimonial4Name: string;
  testimonial4Role: string;
  testimonial4Content: string;
  testimonial4Rating: string;
  testimonial5Name: string;
  testimonial5Role: string;
  testimonial5Content: string;
  testimonial5Rating: string;
  testimonial6Name: string;
  testimonial6Role: string;
  testimonial6Content: string;
  testimonial6Rating: string;
  testimonial7Name: string;
  testimonial7Role: string;
  testimonial7Content: string;
  testimonial7Rating: string;
  testimonial8Name: string;
  testimonial8Role: string;
  testimonial8Content: string;
  testimonial8Rating: string;
  testimonial9Name: string;
  testimonial9Role: string;
  testimonial9Content: string;
  testimonial9Rating: string;
  testimonial10Name: string;
  testimonial10Role: string;
  testimonial10Content: string;
  testimonial10Rating: string;
  testimonial11Name: string;
  testimonial11Role: string;
  testimonial11Content: string;
  testimonial11Rating: string;
  testimonial12Name: string;
  testimonial12Role: string;
  testimonial12Content: string;
  testimonial12Rating: string;
  
  // Newsletter Section
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterSubtext: string;
  
  // Recently Added Section
  recentlyAddedTitle: string;
  recentlyAddedDescription: string;
  recentlyAddedButtonText: string;
}

interface AboutContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  statsTitle1: string;
  statsValue1: string;
  statsTitle2: string;
  statsValue2: string;
  statsTitle3: string;
  statsValue3: string;
  statsTitle4: string;
  statsValue4: string;
  directoryBadge: string;
  directoryTitle: string;
  directoryDescription1: string;
  directoryDescription2: string;
  storyBadge: string;
  storyTitle: string;
  storyDescription1: string;
  storyDescription2: string;
  storyDescription3: string;
  exploreToolsButton: string;
  submitToolButton: string;
  valuesTitle: string;
  valuesDescription: string;
  value1Title: string;
  value1Description: string;
  value2Title: string;
  value2Description: string;
  value3Title: string;
  value3Description: string;
  value4Title: string;
  value4Description: string;
  missionTitle: string;
  missionDescription: string;
  missionPoint1: string;
  missionPoint2: string;
  missionPoint3: string;
  visionTitle: string;
  visionDescription: string;
  visionPoint1: string;
  visionPoint2: string;
  visionPoint3: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaSubmitButton: string;
  ctaContactButton: string;
}

interface ContactContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  howCanWeHelpTitle: string;
  howCanWeHelpDescription: string;
  reason1Title: string;
  reason1Description: string;
  reason2Title: string;
  reason2Description: string;
  reason3Title: string;
  reason3Description: string;
  reason4Title: string;
  reason4Description: string;
  formTitle: string;
  formDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  websiteLabel: string;
  websitePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  sendButton: string;
  sendingButton: string;
  successMessage: string;
  errorMessage: string;
  emailLabelText: string;
  emailDescription: string;
  emailValue: string;
  responseTitle: string;
  responseText1: string;
  responseText2: string;
  responseText3: string;
  quickLinksTitle: string;
  quickLink1: string;
  quickLink2: string;
  quickLink3: string;
  faqTitle: string;
  faqDescription: string;
  faqButton: string;
}

interface PrivacyContent {
  heroTitle: string;
  heroDescription: string;
  introduction: string;
  informationPersonal: string;
  informationUsage: string;
  usageDescription: string;
  securityDescription: string;
  cookiesDescription: string;
  thirdPartyDescription: string;
  rightsDescription: string;
  childrenDescription: string;
  changesDescription: string;
  contactEmail: string;
}

interface TermsContent {
  heroTitle: string;
  heroDescription: string;
  introduction: string;
  acceptanceDescription: string;
  serviceDescription: string;
  accountsCreation: string;
  accountsSecurity: string;
  accountsTermination: string;
  contentOwnership: string;
  contentGuidelines: string;
  contentModeration: string;
  submissionsDescription: string;
  intellectualDescription: string;
  thirdPartyDescription: string;
  disclaimersDescription: string;
  liabilityDescription: string;
  changesDescription: string;
  governingDescription: string;
  contactEmail: string;
}

interface BlogContent {
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  allPostsButton: string;
  featuredArticleTitle: string;
  featuredBadge: string;
  latestArticlesTitle: string;
  searchResultsTitle: string;
  articleText: string;
  articlesText: string;
  readMoreButton: string;
  emptyStateTitle: string;
  emptyStateMessageSearch: string;
  emptyStateMessageCategory: string;
  viewAllPostsButton: string;
  trendingBadge: string;
  minReadText: string;
  // Single Article Page
  backToBlogButton: string;
  authorRoleText: string;
  viewsText: string;
  saveButton: string;
  savedButton: string;
  shareButton: string;
  shareFacebook: string;
  shareTwitter: string;
  shareLinkedIn: string;
  shareCopyLink: string;
  linkCopiedMessage: string;
  taggedInHeading: string;
  aboutAuthorHeading: string;
  visitWebsiteButton: string;
  commentsHeading: string;
  leaveCommentHeading: string;
  commentPlaceholder: string;
  postCommentButton: string;
  replyButton: string;
  loadMoreCommentsButton: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  newsletterSubtext: string;
  popularPostsHeading: string;
  categoriesHeading: string;
  submitToolHeading: string;
  submitToolDescription: string;
  submitToolButton: string;
  relatedArticlesHeading: string;
}

interface ToolsContent {
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  statsToolsLabel: string;
  statsCategoriesLabel: string;
  statsRatingLabel: string;
  statsRatingValue: string;
  emptyStateTitle: string;
  emptyStateMessageSearch: string;
  emptyStateMessageFilters: string;
  sortNewest: string;
  sortPopular: string;
  sortRating: string;
  sortName: string;
  loadMoreButton: string;
  endMessage: string;
  showingText: string;
  toolsFoundText: string;
}

interface SubmitContent {
  heroTitle: string;
  heroDescription: string;
  quickStat1: string;
  quickStat2: string;
  quickStat3: string;
  howItWorksTitle: string;
  howItWorksDescription: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  step4Title: string;
  step4Description: string;
  formTitle: string;
  formDescription: string;
}

interface CategoriesContent {
  heroTitle: string;
  heroDescription: string;
  statsCategoriesLabel: string;
  statsToolsLabel: string;
  statsTrendingLabel: string;
  searchPlaceholder: string;
  sortPopular: string;
  sortTools: string;
  sortName: string;
  trendingOnlyButton: string;
  clearSearchButton: string;
  mostPopularTitle: string;
  emptyStateTitle: string;
  emptyStateMessageSearch: string;
  emptyStateMessageDefault: string;
  infoSectionTitle: string;
  infoSectionDescription: string;
  infoCard1Title: string;
  infoCard1Description: string;
  infoCard2Title: string;
  infoCard2Description: string;
  infoCard3Title: string;
  infoCard3Description: string;
  infoCard4Title: string;
  infoCard4Description: string;
  showingText: string;
}

interface HeaderContent {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  topBarText: string;
  topBarContact: string;
  navigationItems: string; // JSON string for navigation array
  submitButtonText: string;
  signInButtonText: string;
  signUpButtonText: string;
}

interface FooterContent {
  logoUrl: string;
  siteName: string;
  description: string;
  statsTools: string;
  statsUsers: string;
  statsCategories: string;
  productLinks: string; // JSON string for product links array
  companyLinks: string; // JSON string for company links array
  resourcesLinks: string; // JSON string for resources links array
  communityLinks: string; // JSON string for community links array
  socialLinks: string; // JSON string for social links array
  copyrightText: string;
  madeWithText: string;
}

interface CompareContent {
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateHeroTitle: string;
  emptyStateHeroDescription: string;
  browseAllToolsButton: string;
  browseCategoriesButton: string;
  popularComparisonsTitle: string;
  backToToolsButton: string;
  compareDifferentToolsButton: string;
  comparisonHeroTitle: string;
  comparisonHeroDescription: string;
  overviewSectionTitle: string;
  keyFeaturesSectionTitle: string;
  prosConsSectionTitle: string;
  readyToStartText: string;
  visitToolButton: string;
  viewFullDetailsButton: string;
  loadingText: string;
}

const defaultHomeContent: HomeContent = {
  heroTitle: "Discover the Best AI Tools for Your Business",
  heroDescription: "Explore our carefully curated collection of cutting-edge AI tools. Find the perfect solution to supercharge your productivity, creativity, and business growth.",
  primaryButton: "Explore Tools",
  secondaryButton: "Submit Your Tool",
  heroStats: "50,000+ innovators already discovering the future of AI tools • Join the community today",
  categoriesTitle: "Explore by Category",
  categoriesDescription: "Discover AI tools organized by their primary use cases and categories. Find the perfect tool for your specific needs.",
  categoriesButton: "View All Categories",
  trendingTitle: "Trending Now",
  trendingDescription: "Most popular tools this week",
  howItWorksTitle: "Simple Steps to Find Your Perfect AI Tool",
  howItWorksDescription: "Discover, compare, and choose the perfect AI tools for your needs in just a few simple steps.",
  ctaButton: "Start Discovering Tools",
  // How It Works Cards
  step1Title: "Discover",
  step1Description: "Browse our curated collection of AI tools or search by keyword, category, or pricing type.",
  step2Title: "Compare",
  step2Description: "Compare multiple tools side-by-side, read detailed reviews, and check ratings to make informed decisions.",
  step3Title: "Choose",
  step3Description: "View detailed tool pages with features, pricing, screenshots, and user reviews to select the best option.",
  step4Title: "Use",
  step4Description: "Visit the tool's website directly, start using it, and save your favorites for easy access later.",
  ctaTitle: "Ready to Transform Your Workflow with AI?",
  ctaDescription: "Join thousands of innovators discovering cutting-edge AI tools daily. Get exclusive updates and early access to new features.",
  ctaButtonText: "Get Started Today",
  ctaBadgeText: "Join the Revolution",
  ctaPrimaryButton: "Explore All Tools",
  ctaSecondaryButton: "Submit Your Tool",
  ctaTrustIndicator1: "1000+ AI Tools",
  ctaTrustIndicator2: "50K+ Active Users",
  ctaTrustIndicator3: "Updated Daily",
  testimonialsTitle: "What Our Users Say",
  testimonialsDescription: "Join thousands of satisfied users who are discovering the best AI tools for their needs",
  testimonialsBadgeText: "Testimonials",
  testimonialsBadgeEmoji: "💬",
  // Testimonials
  testimonial1Name: "Sarah Johnson",
  testimonial1Role: "Content Creator",
  testimonial1Content: "This directory has been a game-changer for my content creation workflow. I discovered tools I never knew existed!",
  testimonial1Rating: "5",
  testimonial2Name: "Michael Chen",
  testimonial2Role: "Software Developer",
  testimonial2Content: "The best curated list of AI tools I've found. Saved me hours of research and helped me find the perfect tools for my projects.",
  testimonial2Rating: "5",
  testimonial3Name: "Emily Rodriguez",
  testimonial3Role: "Marketing Manager",
  testimonial3Content: "Incredible resource! The categorization makes it so easy to find exactly what I need. Highly recommend to any marketer.",
  testimonial3Rating: "5",
  testimonial4Name: "David Kim",
  testimonial4Role: "Designer",
  testimonial4Content: "As a designer, I'm always looking for AI tools to enhance my workflow. This directory is my go-to resource now.",
  testimonial4Rating: "5",
  testimonial5Name: "Jessica Taylor",
  testimonial5Role: "Business Owner",
  testimonial5Content: "Found amazing AI tools that have transformed my business operations. The quality of tools listed here is top-notch!",
  testimonial5Rating: "5",
  testimonial6Name: "Alex Martinez",
  testimonial6Role: "Data Scientist",
  testimonial6Content: "Comprehensive collection of AI tools with detailed information. Makes comparing different options so much easier.",
  testimonial6Rating: "5",
  testimonial7Name: "Rachel Green",
  testimonial7Role: "Freelance Writer",
  testimonial7Content: "This platform has helped me discover tools that doubled my productivity. The AI writing tools section is particularly impressive!",
  testimonial7Rating: "5",
  testimonial8Name: "James Wilson",
  testimonial8Role: "Product Manager",
  testimonial8Content: "An invaluable resource for anyone working with AI. The regular updates and new tool additions keep it relevant and useful.",
  testimonial8Rating: "5",
  testimonial9Name: "Lisa Anderson",
  testimonial9Role: "Social Media Manager",
  testimonial9Content: "Love how easy it is to navigate and find tools specific to my needs. The filtering system is brilliant!",
  testimonial9Rating: "5",
  testimonial10Name: "Tom Brown",
  testimonial10Role: "Entrepreneur",
  testimonial10Content: "Best AI tools directory out there. Helped me find cost-effective solutions for my startup. Absolutely essential!",
  testimonial10Rating: "5",
  testimonial11Name: "Nina Patel",
  testimonial11Role: "UX Designer",
  testimonial11Content: "The user experience of this directory is exceptional. Finding the right AI design tools has never been easier!",
  testimonial11Rating: "5",
  testimonial12Name: "Chris Lee",
  testimonial12Role: "Video Editor",
  testimonial12Content: "Discovered some incredible AI video tools that cut my editing time in half. This directory is a goldmine!",
  testimonial12Rating: "5",
  newsletterTitle: "Stay Updated with AI Trends",
  newsletterDescription: "Get weekly updates on the latest AI tools, trends, and insights delivered straight to your inbox.",
  newsletterSubtext: "Join 10,000+ subscribers. No spam, ever. Unsubscribe anytime.",
  recentlyAddedTitle: "Recently Added",
  recentlyAddedDescription: "Latest tools in our directory",
  recentlyAddedButtonText: "View All",
};

const defaultAboutContent: AboutContent = {
  heroBadge: "About Us",
  heroTitle: "Empowering Your AI Journey",
  heroDescription: "We're on a mission to help you discover, compare, and choose the perfect AI tools that transform the way you work, create, and innovate.",
  statsTitle1: "AI Tools Listed",
  statsValue1: "500+",
  statsTitle2: "Active Users",
  statsValue2: "50K+",
  statsTitle3: "Categories",
  statsValue3: "25+",
  statsTitle4: "User Reviews",
  statsValue4: "10K+",
  directoryBadge: "Global AI Platform",
  directoryTitle: "The World's Best AI Tools Directory",
  directoryDescription1: "Lately, the site also posts articles that explain how each AI works. Found an AI tool that doesn't appear in the list? From now on, it is possible to submit new AIs so that they can be added to the ranking or the top 10.",
  directoryDescription2: "Actually, Aixploria is a kind of directory and search engine dedicated to AI. With its simple and clean style, you can easily search using keywords like on a search engine.",
  storyBadge: "Our Story",
  storyTitle: "Born from a passion for AI innovation",
  storyDescription1: "In 2025, we recognized a growing challenge: the AI tools landscape was becoming increasingly complex and overwhelming. Professionals, creators, and businesses were struggling to find the right tools for their specific needs.",
  storyDescription2: "We founded AI Tools Directory to bridge this gap. What started as a simple curated list has evolved into a comprehensive platform trusted by thousands of users worldwide.",
  storyDescription3: "Today, we're proud to be the go-to resource for anyone looking to harness the power of AI, offering detailed reviews, comparisons, and a vibrant community of AI enthusiasts.",
  exploreToolsButton: "Explore Tools",
  submitToolButton: "Submit a Tool",
  valuesTitle: "Our Core Values",
  valuesDescription: "The principles that guide everything we do",
  value1Title: "Transparency",
  value1Description: "We provide honest, unbiased reviews and comparisons to help you make informed decisions.",
  value2Title: "Quality",
  value2Description: "Every tool in our directory is carefully vetted and evaluated by our expert team.",
  value3Title: "Community First",
  value3Description: "Built by the community, for the community. Your feedback shapes our platform.",
  value4Title: "Innovation",
  value4Description: "We stay ahead of the curve, constantly updating with the latest AI tools and technologies.",
  missionTitle: "Our Mission",
  missionDescription: "To democratize access to AI tools by providing a comprehensive, transparent, and user-friendly platform that empowers individuals and businesses to discover and leverage the best AI solutions for their unique needs.",
  missionPoint1: "Curate the highest quality AI tools",
  missionPoint2: "Provide honest, detailed reviews",
  missionPoint3: "Build a thriving AI community",
  visionTitle: "Our Vision",
  visionDescription: "To become the world's most trusted and comprehensive AI tools platform, where anyone—from beginners to experts—can confidently find, compare, and choose the perfect AI solutions to achieve their goals.",
  visionPoint1: "Global leader in AI tool discovery",
  visionPoint2: "Foster innovation and creativity",
  visionPoint3: "Shape the future of AI adoption",
  ctaTitle: "Join Our Community",
  ctaDescription: "Whether you're discovering AI tools or sharing your own, we'd love to have you as part of our growing community.",
  ctaSubmitButton: "Submit Your Tool",
  ctaContactButton: "Get in Touch",
};

const defaultContactContent: ContactContent = {
  heroBadge: "Get in Touch",
  heroTitle: "We're Here to Help",
  heroDescription: "Have a question, suggestion, or just want to say hello? We'd love to hear from you.",
  howCanWeHelpTitle: "How Can We Help?",
  howCanWeHelpDescription: "Choose the best way to reach us based on your needs",
  reason1Title: "General Support",
  reason1Description: "Get help with using our platform",
  reason2Title: "Submit a Tool",
  reason2Description: "Add your AI tool to our directory",
  reason3Title: "Partnership",
  reason3Description: "Collaborate with us",
  reason4Title: "Feedback",
  reason4Description: "Share your thoughts and suggestions",
  formTitle: "Send Us a Message",
  formDescription: "Fill out the form below and we'll get back to you as soon as possible",
  nameLabel: "Name",
  namePlaceholder: "John Doe",
  emailLabel: "Email",
  emailPlaceholder: "john@example.com",
  subjectLabel: "Subject",
  subjectPlaceholder: "What is this regarding?",
  websiteLabel: "Website URL",
  websitePlaceholder: "https://example.com",
  messageLabel: "Message",
  messagePlaceholder: "Tell us more about your inquiry...",
  sendButton: "Send Message",
  sendingButton: "Sending...",
  successMessage: "Message sent successfully! We'll get back to you soon.",
  errorMessage: "Failed to send message. Please try again.",
  emailLabelText: "Email Us",
  emailDescription: "For general inquiries and support",
  emailValue: "hello@mostpopularaitools.com",
  responseTitle: "Response Time",
  responseText1: "24-48 hours for general inquiries",
  responseText2: "Priority support for partners",
  responseText3: "Available Monday to Friday",
  quickLinksTitle: "Quick Links",
  quickLink1: "Submit Your AI Tool",
  quickLink2: "About Us",
  quickLink3: "Read Our Blog",
  faqTitle: "Looking for Quick Answers?",
  faqDescription: "Check out our FAQ section or browse our help documentation",
  faqButton: "Browse Tools",
};

const defaultPrivacyContent: PrivacyContent = {
  heroTitle: "Privacy Policy",
  heroDescription: "Your privacy is important to us. Learn how we protect your data.",
  introduction: "Welcome to AI Tools Directory. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.",
  informationPersonal: "We collect the following personal information when you use our service: Name and email address when you create an account, Profile information you choose to provide, Reviews and ratings you submit, Tools you submit to our directory.",
  informationUsage: "We automatically collect certain information about your usage: Pages you visit on our website, Tools you view and interact with, Search queries, Device and browser information.",
  usageDescription: "We use the information we collect to: Provide and improve our services, Personalize your experience, Communicate with you about updates and features, Moderate user-generated content, Analyze usage patterns to improve our platform, Prevent fraud and abuse.",
  securityDescription: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.",
  cookiesDescription: "We use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.",
  thirdPartyDescription: "We may use third-party services for analytics, authentication, and other functionalities. These services have their own privacy policies.",
  rightsDescription: "You have the right to: Access your personal data, Correct inaccurate data, Request deletion of your data, Object to processing of your data, Export your data.",
  childrenDescription: "Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.",
  changesDescription: "We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page.",
  contactEmail: "privacy@mostpopularaitools.com",
};

const defaultTermsContent: TermsContent = {
  heroTitle: "Terms of Service",
  heroDescription: "Please read these terms carefully before using our service",
  introduction: "Welcome to AI Tools Directory. By accessing and using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our service.",
  acceptanceDescription: "By accessing and using AI Tools Directory, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
  serviceDescription: "AI Tools Directory provides a platform for discovering, reviewing, and comparing AI tools. We aggregate information about AI tools and provide a community platform for users to share their experiences.",
  accountsCreation: "To access certain features, you may need to create an account. You must provide accurate and complete information.",
  accountsSecurity: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
  accountsTermination: "We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.",
  contentOwnership: "You retain ownership of content you submit (reviews, tool submissions, etc.). By submitting content, you grant us a license to use, display, and distribute that content on our platform.",
  contentGuidelines: "User content must: Be accurate and truthful, Not contain offensive, abusive, or discriminatory material, Not infringe on intellectual property rights, Not contain spam or promotional material, Comply with all applicable laws.",
  contentModeration: "We reserve the right to remove or modify content that violates our guidelines or these terms.",
  submissionsDescription: "When submitting tools to our directory: You must have the right to submit the information, Information must be accurate and up-to-date, Tools are subject to review and approval, We reserve the right to reject or remove submissions.",
  intellectualDescription: "The AI Tools Directory platform, including its design, features, and content (excluding user-generated content), is owned by us and protected by intellectual property laws.",
  thirdPartyDescription: "Our service may contain links to third-party websites or services. We are not responsible for the content or practices of these third parties.",
  disclaimersDescription: "Our service is provided \"as is\" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of information about AI tools.",
  liabilityDescription: "We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.",
  changesDescription: "We reserve the right to modify these terms at any time. Continued use of our service after changes constitutes acceptance of the new terms.",
  governingDescription: "These terms shall be governed by and construed in accordance with applicable laws.",
  contactEmail: "legal@mostpopularaitools.com",
};

const defaultBlogContent: BlogContent = {
  heroTitle: "Blog",
  heroDescription: "Latest insights, tutorials, and news about AI tools",
  searchPlaceholder: "Search articles...",
  allPostsButton: "All Posts",
  featuredArticleTitle: "Featured Article",
  featuredBadge: "Featured",
  latestArticlesTitle: "Latest Articles",
  searchResultsTitle: "Search Results",
  articleText: "article",
  articlesText: "articles",
  readMoreButton: "Read More",
  emptyStateTitle: "No articles found",
  emptyStateMessageSearch: 'No articles match "{query}". Try a different search term.',
  emptyStateMessageCategory: "No articles available in this category.",
  viewAllPostsButton: "View All Posts",
  trendingBadge: "Trending",
  minReadText: "min read",
  // Single Article Page
  backToBlogButton: "Back to Blog",
  authorRoleText: "AI Writer & Enthusiast",
  viewsText: "views",
  saveButton: "Save",
  savedButton: "Saved",
  shareButton: "Share",
  shareFacebook: "Facebook",
  shareTwitter: "Twitter",
  shareLinkedIn: "LinkedIn",
  shareCopyLink: "Copy Link",
  linkCopiedMessage: "Link copied to clipboard!",
  taggedInHeading: "TAGGED IN",
  aboutAuthorHeading: "About",
  visitWebsiteButton: "Visit Website →",
  commentsHeading: "Comments",
  leaveCommentHeading: "Leave a Comment",
  commentPlaceholder: "Write your comment here... *",
  postCommentButton: "Post Comment",
  replyButton: "Reply",
  loadMoreCommentsButton: "Load More Comments",
  newsletterTitle: "Subscribe to Newsletter",
  newsletterDescription: "Get the latest AI tools and insights delivered to your inbox",
  newsletterPlaceholder: "Enter your email",
  newsletterButton: "Subscribe",
  newsletterSubtext: "No spam. Unsubscribe anytime.",
  popularPostsHeading: "Popular Posts",
  categoriesHeading: "Categories",
  submitToolHeading: "Have an AI Tool?",
  submitToolDescription: "Submit your AI tool to our directory and reach thousands of users",
  submitToolButton: "Submit Your Tool",
  relatedArticlesHeading: "Related Articles",
};

const defaultToolsContent: ToolsContent = {
  heroTitle: "All AI Tools",
  heroDescription: "Discover, compare, and find the perfect AI tools for your needs. Browse our comprehensive collection of cutting-edge AI solutions.",
  searchPlaceholder: "Search for AI tools...",
  statsToolsLabel: "Tools Available",
  statsCategoriesLabel: "Categories",
  statsRatingLabel: "Avg Rating",
  statsRatingValue: "4.7+",
  emptyStateTitle: "No tools found",
  emptyStateMessageSearch: "No tools match \"{query}\". Try adjusting your filters or search term.",
  emptyStateMessageFilters: "No tools match your current filters. Try adjusting your criteria.",
  sortNewest: "⚡ Newest",
  sortPopular: "🔥 Most Popular",
  sortRating: "⭐ Top Rated",
  sortName: "🔤 A-Z",
  loadMoreButton: "Load More Tools",
  endMessage: "You've reached the end! All tools loaded.",
  showingText: "Showing {count} of {total} tools",
  toolsFoundText: "{count} tools found",
};

const defaultSubmitContent: SubmitContent = {
  heroTitle: "Share Your AI Tool with the World",
  heroDescription: "Join thousands of AI tools in our directory. All submissions are carefully reviewed by our team before publishing to ensure quality.",
  quickStat1: "Fast approval process",
  quickStat2: "Free & paid listings",
  quickStat3: "Reach thousands of users",
  howItWorksTitle: "Submit Your Tool in 4 Simple Steps",
  howItWorksDescription: "Get your AI tool listed in our directory and reach thousands of potential users.",
  step1Title: "Fill Form",
  step1Description: "Complete the submission form with your tool's details, features, pricing, and media.",
  step2Title: "Review",
  step2Description: "Our expert team carefully reviews your submission to ensure quality and accuracy.",
  step3Title: "Approval",
  step3Description: "Once approved, your tool gets published and appears in our directory for users to discover.",
  step4Title: "Grow",
  step4Description: "Get discovered by thousands of users, receive reviews, and grow your user base.",
  formTitle: "Tool Submission Form",
  formDescription: "Fill out the form below to submit your AI tool to our directory",
};

const defaultCategoriesContent: CategoriesContent = {
  heroTitle: "Browse Categories",
  heroDescription: "Discover {totalTools}+ AI tools organized by their primary use cases. Find the perfect solution for your needs.",
  statsCategoriesLabel: "Categories",
  statsToolsLabel: "AI Tools",
  statsTrendingLabel: "Trending",
  searchPlaceholder: "Search categories...",
  sortPopular: "Most Popular",
  sortTools: "Most Tools",
  sortName: "A-Z",
  trendingOnlyButton: "Trending Only",
  clearSearchButton: "Clear Search",
  mostPopularTitle: "Most Popular",
  emptyStateTitle: "No categories found",
  emptyStateMessageSearch: "No categories match \"{query}\". Try a different search term.",
  emptyStateMessageDefault: "Categories will appear here once they are added.",
  infoSectionTitle: "Find Your Perfect AI Tool",
  infoSectionDescription: "Our categories are meticulously organized to help you discover AI tools that perfectly match your needs. From content creation to development, marketing to research—find everything in one place.",
  infoCard1Title: "Use Case Focused",
  infoCard1Description: "Every category is designed around real workflows and specific needs",
  infoCard2Title: "Quality Curated",
  infoCard2Description: "Each tool is thoroughly reviewed and verified by our team",
  infoCard3Title: "Always Fresh",
  infoCard3Description: "New tools and categories added daily to keep you updated",
  infoCard4Title: "Easy Discovery",
  infoCard4Description: "Find exactly what you need with powerful search and filters",
  showingText: "Showing {count} {count === 1 ? 'category' : 'categories'}",
};

const defaultHeaderContent: HeaderContent = {
  siteName: "AI Tools Directory",
  siteTagline: "EST. 2025",
  logoUrl: "",
  topBarText: "Curated tools • Premium insights •",
  topBarContact: "Business inquiries: partner@mostpopularaitools.com",
  navigationItems: JSON.stringify([
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: "Categories", href: "/categories" },
    { name: "Compare", href: "/compare" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]),
  submitButtonText: "Submit Tool",
  signInButtonText: "Sign in",
  signUpButtonText: "Sign Up",
};

const defaultFooterContent: FooterContent = {
  logoUrl: "",
  siteName: "AI Tools Directory",
  description: "Discover the best AI tools to supercharge your productivity. Our curated collection features cutting-edge artificial intelligence solutions for every need.",
  statsTools: "1000+",
  statsUsers: "50K+",
  statsCategories: "25+",
  productLinks: JSON.stringify([
    { name: "All Tools", href: "/tools" },
    { name: "Categories", href: "/categories" },
    { name: "Submit Tool", href: "/submit" },
    { name: "Blog", href: "/blog" },
    { name: "Compare Tools", href: "/compare" },
  ]),
  companyLinks: JSON.stringify([
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ]),
  resourcesLinks: JSON.stringify([
    { name: "Documentation", href: "/docs" },
    { name: "API", href: "/api" },
    { name: "Support", href: "/support" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ]),
  communityLinks: JSON.stringify([
    { name: "Discord", href: "#" },
    { name: "Twitter", href: "#" },
    { name: "GitHub", href: "#" },
    { name: "Newsletter", href: "#" },
  ]),
  socialLinks: JSON.stringify([
    { name: "Twitter", href: "#", icon: "Twitter" },
    { name: "GitHub", href: "#", icon: "Github" },
    { name: "LinkedIn", href: "#", icon: "Linkedin" },
    { name: "Email", href: "#", icon: "Mail" },
  ]),
  copyrightText: `© ${new Date().getFullYear()} AI Tools Directory. All rights reserved.`,
  madeWithText: "Made with ❤️ by AI Enthusiasts",
};

const defaultCompareContent: CompareContent = {
  emptyStateTitle: "Compare AI Tools",
  emptyStateDescription: "Make informed decisions by comparing features, pricing, and ratings side-by-side",
  emptyStateHeroTitle: "Select Tools to Compare",
  emptyStateHeroDescription: "Choose two AI tools from our directory to see a detailed side-by-side comparison",
  browseAllToolsButton: "Browse All Tools",
  browseCategoriesButton: "Browse Categories",
  popularComparisonsTitle: "Popular Comparisons",
  backToToolsButton: "Back to Tools",
  compareDifferentToolsButton: "Compare Different Tools",
  comparisonHeroTitle: "Tool Comparison",
  comparisonHeroDescription: "Side-by-side comparison to help you make the right choice",
  overviewSectionTitle: "Overview",
  keyFeaturesSectionTitle: "Key Features",
  prosConsSectionTitle: "Pros & Cons",
  readyToStartText: "Ready to start?",
  visitToolButton: "Visit",
  viewFullDetailsButton: "View Full Details",
  loadingText: "Loading comparison...",
};

export default function ContentManagementPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact" | "privacy" | "terms" | "blog" | "tools" | "submit" | "categories" | "header" | "footer" | "compare">("home");
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultHomeContent);
  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent);
  const [contactContent, setContactContent] = useState<ContactContent>(defaultContactContent);
  const [privacyContent, setPrivacyContent] = useState<PrivacyContent>(defaultPrivacyContent);
  const [termsContent, setTermsContent] = useState<TermsContent>(defaultTermsContent);
  const [blogContent, setBlogContent] = useState<BlogContent>(defaultBlogContent);
  const [toolsContent, setToolsContent] = useState<ToolsContent>(defaultToolsContent);
  const [submitContent, setSubmitContent] = useState<SubmitContent>(defaultSubmitContent);
  const [categoriesContent, setCategoriesContent] = useState<CategoriesContent>(defaultCategoriesContent);
  const [headerContent, setHeaderContent] = useState<HeaderContent>(defaultHeaderContent);
  const [footerContent, setFooterContent] = useState<FooterContent>(defaultFooterContent);
  const [compareContent, setCompareContent] = useState<CompareContent>(defaultCompareContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [homeRes, aboutRes, contactRes, privacyRes, termsRes, blogRes, toolsRes, submitRes, categoriesRes, headerRes, footerRes, compareRes] = await Promise.all([
        fetch("/api/admin/content?page=home"),
        fetch("/api/admin/content?page=about"),
        fetch("/api/admin/content?page=contact"),
        fetch("/api/admin/content?page=privacy"),
        fetch("/api/admin/content?page=terms"),
        fetch("/api/admin/content?page=blog"),
        fetch("/api/admin/content?page=tools"),
        fetch("/api/admin/content?page=submit"),
        fetch("/api/admin/content?page=categories"),
        fetch("/api/admin/content?page=header"),
        fetch("/api/admin/content?page=footer"),
        fetch("/api/admin/content?page=compare"),
      ]);

      // Fetch Home Content
      if (homeRes.ok) {
        const data = await homeRes.json();
        const fetched: Partial<HomeContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultHomeContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setHomeContent({ ...defaultHomeContent, ...fetched });
      }

      // Fetch About Content
      if (aboutRes.ok) {
        const data = await aboutRes.json();
        const fetched: Partial<AboutContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultAboutContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setAboutContent({ ...defaultAboutContent, ...fetched });
      }

      // Fetch Contact Content
      if (contactRes.ok) {
        const data = await contactRes.json();
        const fetched: Partial<ContactContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultContactContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setContactContent({ ...defaultContactContent, ...fetched });
      }

      // Fetch Privacy Content
      if (privacyRes.ok) {
        const data = await privacyRes.json();
        const fetched: Partial<PrivacyContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultPrivacyContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setPrivacyContent({ ...defaultPrivacyContent, ...fetched });
      }

      // Fetch Terms Content
      if (termsRes.ok) {
        const data = await termsRes.json();
        const fetched: Partial<TermsContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultTermsContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setTermsContent({ ...defaultTermsContent, ...fetched });
      }

      // Fetch Blog Content
      if (blogRes.ok) {
        const data = await blogRes.json();
        const fetched: Partial<BlogContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultBlogContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setBlogContent({ ...defaultBlogContent, ...fetched });
      }

      // Fetch Tools Content
      if (toolsRes.ok) {
        const data = await toolsRes.json();
        const fetched: Partial<ToolsContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultToolsContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setToolsContent({ ...defaultToolsContent, ...fetched });
      }

      // Fetch Submit Content
      if (submitRes.ok) {
        const data = await submitRes.json();
        const fetched: Partial<SubmitContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultSubmitContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setSubmitContent({ ...defaultSubmitContent, ...fetched });
      }

      // Fetch Categories Content
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        const fetched: Partial<CategoriesContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultCategoriesContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setCategoriesContent({ ...defaultCategoriesContent, ...fetched });
      }

      // Fetch Header Content
      if (headerRes.ok) {
        const data = await headerRes.json();
        const fetched: Partial<HeaderContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultHeaderContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setHeaderContent({ ...defaultHeaderContent, ...fetched });
      }

      // Fetch Footer Content
      if (footerRes.ok) {
        const data = await footerRes.json();
        const fetched: Partial<FooterContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultFooterContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setFooterContent({ ...defaultFooterContent, ...fetched });
      }

      // Fetch Compare Content
      if (compareRes.ok) {
        const data = await compareRes.json();
        const fetched: Partial<CompareContent> = {};
        data.content?.forEach((item: any) => {
          const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
          Object.keys(defaultCompareContent).forEach((key) => {
            if (item.key === key) {
              (fetched as any)[key] = value;
            }
          });
        });
        setCompareContent({ ...defaultCompareContent, ...fetched });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (page: "home" | "about" | "contact" | "privacy" | "terms" | "blog" | "tools" | "submit" | "categories" | "header" | "footer" | "compare") => {
    setSaving(true);
    try {
      let contentItems: any[] = [];
      
      if (page === "home") {
        contentItems = [
          { page: "home", section: "hero", key: "heroTitle", value: homeContent.heroTitle },
          { page: "home", section: "hero", key: "heroDescription", value: homeContent.heroDescription },
          { page: "home", section: "hero", key: "primaryButton", value: homeContent.primaryButton },
          { page: "home", section: "hero", key: "secondaryButton", value: homeContent.secondaryButton },
          { page: "home", section: "hero", key: "heroStats", value: homeContent.heroStats },
          { page: "home", section: "categories", key: "categoriesTitle", value: homeContent.categoriesTitle },
          { page: "home", section: "categories", key: "categoriesDescription", value: homeContent.categoriesDescription },
          { page: "home", section: "categories", key: "categoriesButton", value: homeContent.categoriesButton },
          { page: "home", section: "trending", key: "trendingTitle", value: homeContent.trendingTitle },
          { page: "home", section: "trending", key: "trendingDescription", value: homeContent.trendingDescription },
          { page: "home", section: "how-it-works", key: "howItWorksTitle", value: homeContent.howItWorksTitle },
          { page: "home", section: "how-it-works", key: "howItWorksDescription", value: homeContent.howItWorksDescription },
          { page: "home", section: "how-it-works", key: "ctaButton", value: homeContent.ctaButton },
          { page: "home", section: "how-it-works", key: "step1Title", value: homeContent.step1Title },
          { page: "home", section: "how-it-works", key: "step1Description", value: homeContent.step1Description },
          { page: "home", section: "how-it-works", key: "step2Title", value: homeContent.step2Title },
          { page: "home", section: "how-it-works", key: "step2Description", value: homeContent.step2Description },
          { page: "home", section: "how-it-works", key: "step3Title", value: homeContent.step3Title },
          { page: "home", section: "how-it-works", key: "step3Description", value: homeContent.step3Description },
          { page: "home", section: "how-it-works", key: "step4Title", value: homeContent.step4Title },
          { page: "home", section: "how-it-works", key: "step4Description", value: homeContent.step4Description },
          { page: "home", section: "cta", key: "ctaTitle", value: homeContent.ctaTitle },
          { page: "home", section: "cta", key: "ctaDescription", value: homeContent.ctaDescription },
          { page: "home", section: "cta", key: "ctaButtonText", value: homeContent.ctaButtonText },
          { page: "home", section: "cta", key: "ctaBadgeText", value: homeContent.ctaBadgeText },
          { page: "home", section: "cta", key: "ctaPrimaryButton", value: homeContent.ctaPrimaryButton },
          { page: "home", section: "cta", key: "ctaSecondaryButton", value: homeContent.ctaSecondaryButton },
          { page: "home", section: "cta", key: "ctaTrustIndicator1", value: homeContent.ctaTrustIndicator1 },
          { page: "home", section: "cta", key: "ctaTrustIndicator2", value: homeContent.ctaTrustIndicator2 },
          { page: "home", section: "cta", key: "ctaTrustIndicator3", value: homeContent.ctaTrustIndicator3 },
          { page: "home", section: "testimonials", key: "testimonialsTitle", value: homeContent.testimonialsTitle },
          { page: "home", section: "testimonials", key: "testimonialsDescription", value: homeContent.testimonialsDescription },
          { page: "home", section: "testimonials", key: "testimonialsBadgeText", value: homeContent.testimonialsBadgeText },
          { page: "home", section: "testimonials", key: "testimonialsBadgeEmoji", value: homeContent.testimonialsBadgeEmoji },
          { page: "home", section: "testimonials", key: "testimonial1Name", value: homeContent.testimonial1Name },
          { page: "home", section: "testimonials", key: "testimonial1Role", value: homeContent.testimonial1Role },
          { page: "home", section: "testimonials", key: "testimonial1Content", value: homeContent.testimonial1Content },
          { page: "home", section: "testimonials", key: "testimonial1Rating", value: homeContent.testimonial1Rating },
          { page: "home", section: "testimonials", key: "testimonial2Name", value: homeContent.testimonial2Name },
          { page: "home", section: "testimonials", key: "testimonial2Role", value: homeContent.testimonial2Role },
          { page: "home", section: "testimonials", key: "testimonial2Content", value: homeContent.testimonial2Content },
          { page: "home", section: "testimonials", key: "testimonial2Rating", value: homeContent.testimonial2Rating },
          { page: "home", section: "testimonials", key: "testimonial3Name", value: homeContent.testimonial3Name },
          { page: "home", section: "testimonials", key: "testimonial3Role", value: homeContent.testimonial3Role },
          { page: "home", section: "testimonials", key: "testimonial3Content", value: homeContent.testimonial3Content },
          { page: "home", section: "testimonials", key: "testimonial3Rating", value: homeContent.testimonial3Rating },
          { page: "home", section: "testimonials", key: "testimonial4Name", value: homeContent.testimonial4Name },
          { page: "home", section: "testimonials", key: "testimonial4Role", value: homeContent.testimonial4Role },
          { page: "home", section: "testimonials", key: "testimonial4Content", value: homeContent.testimonial4Content },
          { page: "home", section: "testimonials", key: "testimonial4Rating", value: homeContent.testimonial4Rating },
          { page: "home", section: "testimonials", key: "testimonial5Name", value: homeContent.testimonial5Name },
          { page: "home", section: "testimonials", key: "testimonial5Role", value: homeContent.testimonial5Role },
          { page: "home", section: "testimonials", key: "testimonial5Content", value: homeContent.testimonial5Content },
          { page: "home", section: "testimonials", key: "testimonial5Rating", value: homeContent.testimonial5Rating },
          { page: "home", section: "testimonials", key: "testimonial6Name", value: homeContent.testimonial6Name },
          { page: "home", section: "testimonials", key: "testimonial6Role", value: homeContent.testimonial6Role },
          { page: "home", section: "testimonials", key: "testimonial6Content", value: homeContent.testimonial6Content },
          { page: "home", section: "testimonials", key: "testimonial6Rating", value: homeContent.testimonial6Rating },
          { page: "home", section: "testimonials", key: "testimonial7Name", value: homeContent.testimonial7Name },
          { page: "home", section: "testimonials", key: "testimonial7Role", value: homeContent.testimonial7Role },
          { page: "home", section: "testimonials", key: "testimonial7Content", value: homeContent.testimonial7Content },
          { page: "home", section: "testimonials", key: "testimonial7Rating", value: homeContent.testimonial7Rating },
          { page: "home", section: "testimonials", key: "testimonial8Name", value: homeContent.testimonial8Name },
          { page: "home", section: "testimonials", key: "testimonial8Role", value: homeContent.testimonial8Role },
          { page: "home", section: "testimonials", key: "testimonial8Content", value: homeContent.testimonial8Content },
          { page: "home", section: "testimonials", key: "testimonial8Rating", value: homeContent.testimonial8Rating },
          { page: "home", section: "testimonials", key: "testimonial9Name", value: homeContent.testimonial9Name },
          { page: "home", section: "testimonials", key: "testimonial9Role", value: homeContent.testimonial9Role },
          { page: "home", section: "testimonials", key: "testimonial9Content", value: homeContent.testimonial9Content },
          { page: "home", section: "testimonials", key: "testimonial9Rating", value: homeContent.testimonial9Rating },
          { page: "home", section: "testimonials", key: "testimonial10Name", value: homeContent.testimonial10Name },
          { page: "home", section: "testimonials", key: "testimonial10Role", value: homeContent.testimonial10Role },
          { page: "home", section: "testimonials", key: "testimonial10Content", value: homeContent.testimonial10Content },
          { page: "home", section: "testimonials", key: "testimonial10Rating", value: homeContent.testimonial10Rating },
          { page: "home", section: "testimonials", key: "testimonial11Name", value: homeContent.testimonial11Name },
          { page: "home", section: "testimonials", key: "testimonial11Role", value: homeContent.testimonial11Role },
          { page: "home", section: "testimonials", key: "testimonial11Content", value: homeContent.testimonial11Content },
          { page: "home", section: "testimonials", key: "testimonial11Rating", value: homeContent.testimonial11Rating },
          { page: "home", section: "testimonials", key: "testimonial12Name", value: homeContent.testimonial12Name },
          { page: "home", section: "testimonials", key: "testimonial12Role", value: homeContent.testimonial12Role },
          { page: "home", section: "testimonials", key: "testimonial12Content", value: homeContent.testimonial12Content },
          { page: "home", section: "testimonials", key: "testimonial12Rating", value: homeContent.testimonial12Rating },
          { page: "home", section: "newsletter", key: "newsletterTitle", value: homeContent.newsletterTitle },
          { page: "home", section: "newsletter", key: "newsletterDescription", value: homeContent.newsletterDescription },
          { page: "home", section: "newsletter", key: "newsletterSubtext", value: homeContent.newsletterSubtext },
          { page: "home", section: "recently-added", key: "recentlyAddedTitle", value: homeContent.recentlyAddedTitle },
          { page: "home", section: "recently-added", key: "recentlyAddedDescription", value: homeContent.recentlyAddedDescription },
          { page: "home", section: "recently-added", key: "recentlyAddedButtonText", value: homeContent.recentlyAddedButtonText },
        ];
      } else if (page === "about") {
        contentItems = Object.entries(aboutContent).map(([key, value]) => ({
          page: "about",
          section: key.includes("hero") ? "hero" : key.includes("stats") ? "stats" : key.includes("directory") ? "directory" : key.includes("story") ? "story" : key.includes("values") ? "values" : key.includes("mission") ? "mission" : key.includes("vision") ? "vision" : "cta",
          key,
          value,
        }));
      } else if (page === "contact") {
        contentItems = Object.entries(contactContent).map(([key, value]) => ({
          page: "contact",
          section: key.includes("hero") ? "hero" : key.includes("form") ? "form" : key.includes("email") ? "info" : key.includes("response") ? "info" : key.includes("quickLinks") ? "info" : "faq",
          key,
          value,
        }));
      } else if (page === "privacy") {
        contentItems = Object.entries(privacyContent).map(([key, value]) => ({
          page: "privacy",
          section: key.includes("hero") ? "hero" : key.includes("introduction") ? "introduction" : key.includes("information") ? "information" : key.includes("usage") ? "usage" : key.includes("security") ? "security" : key.includes("cookies") ? "cookies" : key.includes("thirdParty") ? "third-party" : key.includes("rights") ? "rights" : key.includes("children") ? "children" : key.includes("changes") ? "changes" : "contact",
          key,
          value,
        }));
      } else if (page === "terms") {
        contentItems = Object.entries(termsContent).map(([key, value]) => ({
          page: "terms",
          section: key.includes("hero") ? "hero" : key.includes("introduction") ? "introduction" : key.includes("acceptance") ? "acceptance" : key.includes("service") ? "description" : key.includes("accounts") ? "accounts" : key.includes("content") ? "content" : key.includes("submissions") ? "submissions" : key.includes("intellectual") ? "intellectual" : key.includes("thirdParty") ? "third-party" : key.includes("disclaimers") ? "disclaimers" : key.includes("liability") ? "liability" : key.includes("changes") ? "changes" : key.includes("governing") ? "governing" : "contact",
          key,
          value,
        }));
      } else if (page === "blog") {
        contentItems = Object.entries(blogContent).map(([key, value]) => ({
          page: "blog",
          section: "hero",
          key,
          value,
        }));
      } else if (page === "tools") {
        contentItems = Object.entries(toolsContent).map(([key, value]) => ({
          page: "tools",
          section: "hero",
          key,
          value,
        }));
      } else if (page === "submit") {
        contentItems = Object.entries(submitContent).map(([key, value]) => ({
          page: "submit",
          section: key.includes("hero") ? "hero" : "form",
          key,
          value,
        }));
      } else if (page === "categories") {
        contentItems = Object.entries(categoriesContent).map(([key, value]) => ({
          page: "categories",
          section: key.includes("hero") ? "hero" : key.includes("stats") ? "stats" : key.includes("info") ? "info" : "general",
          key,
          value,
        }));
      } else if (page === "header") {
        contentItems = Object.entries(headerContent).map(([key, value]) => ({
          page: "header",
          section: "navigation",
          key,
          value,
        }));
      } else if (page === "footer") {
        contentItems = Object.entries(footerContent).map(([key, value]) => ({
          page: "footer",
          section: "main",
          key,
          value,
        }));
      } else if (page === "compare") {
        contentItems = Object.entries(compareContent).map(([key, value]) => ({
          page: "compare",
          section: key.includes("hero") ? "hero" : key.includes("empty") ? "empty" : "general",
          key,
          value,
        }));
      }

      if (contentItems.length === 0) {
        toast.error(`No content to save for ${page} page`);
        setSaving(false);
        return;
      }

      const promises = contentItems.map(async (item) => {
        const response = await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Failed to save ${item.key}:`, errorData);
          return { ok: false, error: errorData.error || `HTTP ${response.status}` };
        }
        
        return { ok: true };
      });

      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok);
      const allSuccess = results.every((r) => r.ok);

      if (allSuccess) {
        toast.success(`${page.charAt(0).toUpperCase() + page.slice(1)} content saved successfully!`);
        
        // Clear browser cache to ensure fresh content loads
        if (typeof window !== "undefined" && 'caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorMessages = failed.map((f: any) => f.error).filter(Boolean);
        const errorMsg = errorMessages.length > 0 
          ? `Failed: ${errorMessages[0]}${errorMessages.length > 1 ? ` (+${errorMessages.length - 1} more)` : ''}`
          : "Some content failed to save";
        toast.error(errorMsg);
        console.error("Failed saves:", failed);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Frontend Content Editor</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Edit all website content easily - changes will appear on the website
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAllContent} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "home"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Home className="h-4 w-4 inline mr-2" />
          Homepage
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "about"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Info className="h-4 w-4 inline mr-2" />
          About
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "contact"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail className="h-4 w-4 inline mr-2" />
          Contact
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Privacy
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "terms"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Terms
        </button>
        <button
          onClick={() => setActiveTab("blog")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "blog"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Blog
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "tools"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench className="h-4 w-4 inline mr-2" />
          Tools
        </button>
        <button
          onClick={() => setActiveTab("submit")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "submit"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Submit
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "categories"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Grid3x3 className="h-4 w-4 inline mr-2" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab("header")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "header"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Header
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "footer"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Footer
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "compare"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Compare
        </button>
      </div>

      {/* Homepage Content */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={homeContent.heroTitle} onChange={(e) => setHomeContent({ ...homeContent, heroTitle: e.target.value })} />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={homeContent.heroDescription} onChange={(e) => setHomeContent({ ...homeContent, heroDescription: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary Button</Label>
                  <Input value={homeContent.primaryButton} onChange={(e) => setHomeContent({ ...homeContent, primaryButton: e.target.value })} />
                </div>
                <div>
                  <Label>Secondary Button</Label>
                  <Input value={homeContent.secondaryButton} onChange={(e) => setHomeContent({ ...homeContent, secondaryButton: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Hero Stats Text</Label>
                <Input value={homeContent.heroStats} onChange={(e) => setHomeContent({ ...homeContent, heroStats: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-green-600" />
                Categories Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={homeContent.categoriesTitle} onChange={(e) => setHomeContent({ ...homeContent, categoriesTitle: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={homeContent.categoriesDescription} onChange={(e) => setHomeContent({ ...homeContent, categoriesDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input value={homeContent.categoriesButton} onChange={(e) => setHomeContent({ ...homeContent, categoriesButton: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Trending Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trending Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={homeContent.trendingTitle} onChange={(e) => setHomeContent({ ...homeContent, trendingTitle: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={homeContent.trendingDescription} onChange={(e) => setHomeContent({ ...homeContent, trendingDescription: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                How It Works Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={homeContent.howItWorksTitle} onChange={(e) => setHomeContent({ ...homeContent, howItWorksTitle: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={homeContent.howItWorksDescription} onChange={(e) => setHomeContent({ ...homeContent, howItWorksDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>CTA Button Text</Label>
                <Input value={homeContent.ctaButton} onChange={(e) => setHomeContent({ ...homeContent, ctaButton: e.target.value })} />
              </div>
              
              {/* Step Cards */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Step Cards Content</h3>
                
                {/* Step 1 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-blue-600">Step 1: Discover</h4>
                  <div>
                    <Label>Step 1 Title</Label>
                    <Input value={homeContent.step1Title} onChange={(e) => setHomeContent({ ...homeContent, step1Title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Step 1 Description</Label>
                    <Textarea value={homeContent.step1Description} onChange={(e) => setHomeContent({ ...homeContent, step1Description: e.target.value })} rows={2} />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-purple-600">Step 2: Compare</h4>
                  <div>
                    <Label>Step 2 Title</Label>
                    <Input value={homeContent.step2Title} onChange={(e) => setHomeContent({ ...homeContent, step2Title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Step 2 Description</Label>
                    <Textarea value={homeContent.step2Description} onChange={(e) => setHomeContent({ ...homeContent, step2Description: e.target.value })} rows={2} />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-pink-600">Step 3: Choose</h4>
                  <div>
                    <Label>Step 3 Title</Label>
                    <Input value={homeContent.step3Title} onChange={(e) => setHomeContent({ ...homeContent, step3Title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Step 3 Description</Label>
                    <Textarea value={homeContent.step3Description} onChange={(e) => setHomeContent({ ...homeContent, step3Description: e.target.value })} rows={2} />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-orange-600">Step 4: Use</h4>
                  <div>
                    <Label>Step 4 Title</Label>
                    <Input value={homeContent.step4Title} onChange={(e) => setHomeContent({ ...homeContent, step4Title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Step 4 Description</Label>
                    <Textarea value={homeContent.step4Description} onChange={(e) => setHomeContent({ ...homeContent, step4Description: e.target.value })} rows={2} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Badge Text</Label>
                <Input value={homeContent.ctaBadgeText} onChange={(e) => setHomeContent({ ...homeContent, ctaBadgeText: e.target.value })} placeholder="Join the Revolution" />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={homeContent.ctaTitle} onChange={(e) => setHomeContent({ ...homeContent, ctaTitle: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={homeContent.ctaDescription} onChange={(e) => setHomeContent({ ...homeContent, ctaDescription: e.target.value })} rows={2} />
              </div>
              
              {/* Buttons */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Buttons</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input value={homeContent.ctaPrimaryButton} onChange={(e) => setHomeContent({ ...homeContent, ctaPrimaryButton: e.target.value })} placeholder="Explore All Tools" />
                  </div>
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input value={homeContent.ctaSecondaryButton} onChange={(e) => setHomeContent({ ...homeContent, ctaSecondaryButton: e.target.value })} placeholder="Submit Your Tool" />
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">Trust Indicators</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Trust Indicator 1</Label>
                    <Input value={homeContent.ctaTrustIndicator1} onChange={(e) => setHomeContent({ ...homeContent, ctaTrustIndicator1: e.target.value })} placeholder="1000+ AI Tools" />
                  </div>
                  <div>
                    <Label>Trust Indicator 2</Label>
                    <Input value={homeContent.ctaTrustIndicator2} onChange={(e) => setHomeContent({ ...homeContent, ctaTrustIndicator2: e.target.value })} placeholder="50K+ Active Users" />
                  </div>
                  <div>
                    <Label>Trust Indicator 3</Label>
                    <Input value={homeContent.ctaTrustIndicator3} onChange={(e) => setHomeContent({ ...homeContent, ctaTrustIndicator3: e.target.value })} placeholder="Updated Daily" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-pink-600" />
                Testimonials Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge Emoji</Label>
                  <Input value={homeContent.testimonialsBadgeEmoji} onChange={(e) => setHomeContent({ ...homeContent, testimonialsBadgeEmoji: e.target.value })} placeholder="💬" maxLength={2} />
                  <p className="text-xs text-muted-foreground mt-1">Single emoji (e.g., 💬, ⭐, 💭)</p>
                </div>
                <div>
                  <Label>Badge Text</Label>
                  <Input value={homeContent.testimonialsBadgeText} onChange={(e) => setHomeContent({ ...homeContent, testimonialsBadgeText: e.target.value })} placeholder="Testimonials" />
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={homeContent.testimonialsTitle} onChange={(e) => setHomeContent({ ...homeContent, testimonialsTitle: e.target.value })} placeholder="What Our Users Say" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={homeContent.testimonialsDescription} onChange={(e) => setHomeContent({ ...homeContent, testimonialsDescription: e.target.value })} rows={2} placeholder="Join thousands of satisfied users who are discovering the best AI tools for their needs" />
              </div>

              {/* Testimonial Cards */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Testimonial Cards (12 cards)</h3>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <div key={num} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3">
                      <h4 className="font-medium text-pink-600">Testimonial {num}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input 
                            value={(homeContent as any)[`testimonial${num}Name`] || ""} 
                            onChange={(e) => setHomeContent({ ...homeContent, [`testimonial${num}Name`]: e.target.value } as any)} 
                            placeholder="Name"
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Input 
                            value={(homeContent as any)[`testimonial${num}Role`] || ""} 
                            onChange={(e) => setHomeContent({ ...homeContent, [`testimonial${num}Role`]: e.target.value } as any)} 
                            placeholder="Role"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Content</Label>
                        <Textarea 
                          value={(homeContent as any)[`testimonial${num}Content`] || ""} 
                          onChange={(e) => setHomeContent({ ...homeContent, [`testimonial${num}Content`]: e.target.value } as any)} 
                          rows={2}
                          placeholder="Testimonial content"
                        />
                      </div>
                      <div>
                        <Label>Rating (1-5)</Label>
                        <Input 
                          type="number"
                          min="1"
                          max="5"
                          value={(homeContent as any)[`testimonial${num}Rating`] || "5"} 
                          onChange={(e) => setHomeContent({ ...homeContent, [`testimonial${num}Rating`]: e.target.value } as any)} 
                          placeholder="5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recently Added Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Recently Added Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={homeContent.recentlyAddedTitle} onChange={(e) => setHomeContent({ ...homeContent, recentlyAddedTitle: e.target.value })} placeholder="Recently Added" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={homeContent.recentlyAddedDescription} onChange={(e) => setHomeContent({ ...homeContent, recentlyAddedDescription: e.target.value })} placeholder="Latest tools in our directory" />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input value={homeContent.recentlyAddedButtonText} onChange={(e) => setHomeContent({ ...homeContent, recentlyAddedButtonText: e.target.value })} placeholder="View All" />
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Section */}
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={homeContent.newsletterTitle} onChange={(e) => setHomeContent({ ...homeContent, newsletterTitle: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={homeContent.newsletterDescription} onChange={(e) => setHomeContent({ ...homeContent, newsletterDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Subtext</Label>
                <Input value={homeContent.newsletterSubtext} onChange={(e) => setHomeContent({ ...homeContent, newsletterSubtext: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("home")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Homepage Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* About Page Content */}
      {activeTab === "about" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Badge</Label>
                <Input value={aboutContent.heroBadge} onChange={(e) => setAboutContent({ ...aboutContent, heroBadge: e.target.value })} placeholder="About Us" />
              </div>
              <div>
                <Label>Hero Title</Label>
                <Input value={aboutContent.heroTitle} onChange={(e) => setAboutContent({ ...aboutContent, heroTitle: e.target.value })} placeholder="Empowering Your AI Journey" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={aboutContent.heroDescription} onChange={(e) => setAboutContent({ ...aboutContent, heroDescription: e.target.value })} rows={3} placeholder="We're on a mission to help you discover, compare, and choose the perfect AI tools..." />
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Stats Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Stat 1 Label</Label>
                  <Input value={aboutContent.statsTitle1} onChange={(e) => setAboutContent({ ...aboutContent, statsTitle1: e.target.value })} placeholder="AI Tools Listed" />
              </div>
              <div>
                <Label>Stat 1 Value</Label>
                  <Input value={aboutContent.statsValue1} onChange={(e) => setAboutContent({ ...aboutContent, statsValue1: e.target.value })} placeholder="500+" />
              </div>
              <div>
                <Label>Stat 2 Label</Label>
                  <Input value={aboutContent.statsTitle2} onChange={(e) => setAboutContent({ ...aboutContent, statsTitle2: e.target.value })} placeholder="Active Users" />
              </div>
              <div>
                <Label>Stat 2 Value</Label>
                  <Input value={aboutContent.statsValue2} onChange={(e) => setAboutContent({ ...aboutContent, statsValue2: e.target.value })} placeholder="50K+" />
              </div>
              <div>
                <Label>Stat 3 Label</Label>
                  <Input value={aboutContent.statsTitle3} onChange={(e) => setAboutContent({ ...aboutContent, statsTitle3: e.target.value })} placeholder="Categories" />
              </div>
              <div>
                <Label>Stat 3 Value</Label>
                  <Input value={aboutContent.statsValue3} onChange={(e) => setAboutContent({ ...aboutContent, statsValue3: e.target.value })} placeholder="25+" />
              </div>
              <div>
                <Label>Stat 4 Label</Label>
                  <Input value={aboutContent.statsTitle4} onChange={(e) => setAboutContent({ ...aboutContent, statsTitle4: e.target.value })} placeholder="User Reviews" />
              </div>
              <div>
                <Label>Stat 4 Value</Label>
                  <Input value={aboutContent.statsValue4} onChange={(e) => setAboutContent({ ...aboutContent, statsValue4: e.target.value })} placeholder="10K+" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Directory Section */}
          <Card>
            <CardHeader>
              <CardTitle>Directory Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Directory Badge</Label>
                <Input value={aboutContent.directoryBadge} onChange={(e) => setAboutContent({ ...aboutContent, directoryBadge: e.target.value })} placeholder="Global AI Platform" />
              </div>
              <div>
                <Label>Directory Title</Label>
                <Input value={aboutContent.directoryTitle} onChange={(e) => setAboutContent({ ...aboutContent, directoryTitle: e.target.value })} placeholder="The World's Best AI Tools Directory" />
              </div>
              <div>
                <Label>Description 1</Label>
                <Textarea value={aboutContent.directoryDescription1} onChange={(e) => setAboutContent({ ...aboutContent, directoryDescription1: e.target.value })} rows={3} placeholder="Lately, the site also posts articles..." />
              </div>
              <div>
                <Label>Description 2</Label>
                <Textarea value={aboutContent.directoryDescription2} onChange={(e) => setAboutContent({ ...aboutContent, directoryDescription2: e.target.value })} rows={3} placeholder="Actually, Aixploria is a kind of directory..." />
              </div>
            </CardContent>
          </Card>

          {/* Our Story Section */}
          <Card>
            <CardHeader>
              <CardTitle>Our Story Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Story Badge</Label>
                <Input value={aboutContent.storyBadge} onChange={(e) => setAboutContent({ ...aboutContent, storyBadge: e.target.value })} placeholder="Our Story" />
              </div>
              <div>
                <Label>Story Title</Label>
                <Input value={aboutContent.storyTitle} onChange={(e) => setAboutContent({ ...aboutContent, storyTitle: e.target.value })} placeholder="Born from a passion for AI innovation" />
              </div>
              <div>
                <Label>Paragraph 1</Label>
                <Textarea value={aboutContent.storyDescription1} onChange={(e) => setAboutContent({ ...aboutContent, storyDescription1: e.target.value })} rows={3} placeholder="In 2025, we recognized a growing challenge..." />
              </div>
              <div>
                <Label>Paragraph 2</Label>
                <Textarea value={aboutContent.storyDescription2} onChange={(e) => setAboutContent({ ...aboutContent, storyDescription2: e.target.value })} rows={3} placeholder="We founded AI Tools Directory to bridge this gap..." />
              </div>
              <div>
                <Label>Paragraph 3</Label>
                <Textarea value={aboutContent.storyDescription3} onChange={(e) => setAboutContent({ ...aboutContent, storyDescription3: e.target.value })} rows={3} placeholder="Today, we're proud to be the go-to resource..." />
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Story Buttons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Explore Tools Button</Label>
                    <Input value={aboutContent.exploreToolsButton} onChange={(e) => setAboutContent({ ...aboutContent, exploreToolsButton: e.target.value })} placeholder="Explore Tools" />
                  </div>
                  <div>
                    <Label>Submit Tool Button</Label>
                    <Input value={aboutContent.submitToolButton} onChange={(e) => setAboutContent({ ...aboutContent, submitToolButton: e.target.value })} placeholder="Submit a Tool" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Values Section */}
          <Card>
            <CardHeader>
              <CardTitle>Our Values Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Values Title</Label>
                <Input value={aboutContent.valuesTitle} onChange={(e) => setAboutContent({ ...aboutContent, valuesTitle: e.target.value })} placeholder="Our Core Values" />
              </div>
              <div>
                <Label>Values Description</Label>
                <Textarea value={aboutContent.valuesDescription} onChange={(e) => setAboutContent({ ...aboutContent, valuesDescription: e.target.value })} rows={2} placeholder="The principles that guide everything we do" />
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">4 Values Cards</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-blue-600 mb-3">Value 1: Transparency</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Value 1 Title</Label>
                        <Input value={aboutContent.value1Title} onChange={(e) => setAboutContent({ ...aboutContent, value1Title: e.target.value })} placeholder="Transparency" />
                      </div>
                      <div>
                        <Label>Value 1 Description</Label>
                        <Textarea value={aboutContent.value1Description} onChange={(e) => setAboutContent({ ...aboutContent, value1Description: e.target.value })} rows={2} placeholder="We provide honest, unbiased reviews..." />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-purple-600 mb-3">Value 2: Quality</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Value 2 Title</Label>
                        <Input value={aboutContent.value2Title} onChange={(e) => setAboutContent({ ...aboutContent, value2Title: e.target.value })} placeholder="Quality" />
                      </div>
                      <div>
                        <Label>Value 2 Description</Label>
                        <Textarea value={aboutContent.value2Description} onChange={(e) => setAboutContent({ ...aboutContent, value2Description: e.target.value })} rows={2} placeholder="Every tool in our directory is carefully vetted..." />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-pink-600 mb-3">Value 3: Community First</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Value 3 Title</Label>
                        <Input value={aboutContent.value3Title} onChange={(e) => setAboutContent({ ...aboutContent, value3Title: e.target.value })} placeholder="Community First" />
                      </div>
                      <div>
                        <Label>Value 3 Description</Label>
                        <Textarea value={aboutContent.value3Description} onChange={(e) => setAboutContent({ ...aboutContent, value3Description: e.target.value })} rows={2} placeholder="Built by the community, for the community..." />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium text-orange-600 mb-3">Value 4: Innovation</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Value 4 Title</Label>
                        <Input value={aboutContent.value4Title} onChange={(e) => setAboutContent({ ...aboutContent, value4Title: e.target.value })} placeholder="Innovation" />
                      </div>
                      <div>
                        <Label>Value 4 Description</Label>
                        <Textarea value={aboutContent.value4Description} onChange={(e) => setAboutContent({ ...aboutContent, value4Description: e.target.value })} rows={2} placeholder="We stay ahead of the curve..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Mission</h3>
              <div>
                <Label>Mission Title</Label>
                  <Input value={aboutContent.missionTitle} onChange={(e) => setAboutContent({ ...aboutContent, missionTitle: e.target.value })} placeholder="Our Mission" />
              </div>
              <div>
                <Label>Mission Description</Label>
                  <Textarea value={aboutContent.missionDescription} onChange={(e) => setAboutContent({ ...aboutContent, missionDescription: e.target.value })} rows={3} placeholder="To democratize access to AI tools..." />
              </div>
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Mission Points</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Mission Point 1</Label>
                      <Input value={aboutContent.missionPoint1} onChange={(e) => setAboutContent({ ...aboutContent, missionPoint1: e.target.value })} placeholder="Curate the highest quality AI tools" />
                    </div>
                    <div>
                      <Label>Mission Point 2</Label>
                      <Input value={aboutContent.missionPoint2} onChange={(e) => setAboutContent({ ...aboutContent, missionPoint2: e.target.value })} placeholder="Provide honest, detailed reviews" />
                    </div>
                    <div>
                      <Label>Mission Point 3</Label>
                      <Input value={aboutContent.missionPoint3} onChange={(e) => setAboutContent({ ...aboutContent, missionPoint3: e.target.value })} placeholder="Build a thriving AI community" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vision</h3>
              <div>
                <Label>Vision Title</Label>
                  <Input value={aboutContent.visionTitle} onChange={(e) => setAboutContent({ ...aboutContent, visionTitle: e.target.value })} placeholder="Our Vision" />
              </div>
              <div>
                <Label>Vision Description</Label>
                  <Textarea value={aboutContent.visionDescription} onChange={(e) => setAboutContent({ ...aboutContent, visionDescription: e.target.value })} rows={3} placeholder="To become the world's most trusted..." />
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Vision Points</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>Vision Point 1</Label>
                      <Input value={aboutContent.visionPoint1} onChange={(e) => setAboutContent({ ...aboutContent, visionPoint1: e.target.value })} placeholder="Global leader in AI tool discovery" />
                    </div>
                    <div>
                      <Label>Vision Point 2</Label>
                      <Input value={aboutContent.visionPoint2} onChange={(e) => setAboutContent({ ...aboutContent, visionPoint2: e.target.value })} placeholder="Foster innovation and creativity" />
                    </div>
                    <div>
                      <Label>Vision Point 3</Label>
                      <Input value={aboutContent.visionPoint3} onChange={(e) => setAboutContent({ ...aboutContent, visionPoint3: e.target.value })} placeholder="Shape the future of AI adoption" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>CTA Title</Label>
                <Input value={aboutContent.ctaTitle} onChange={(e) => setAboutContent({ ...aboutContent, ctaTitle: e.target.value })} placeholder="Join Our Community" />
              </div>
              <div>
                <Label>CTA Description</Label>
                <Textarea value={aboutContent.ctaDescription} onChange={(e) => setAboutContent({ ...aboutContent, ctaDescription: e.target.value })} rows={2} placeholder="Whether you're discovering AI tools or sharing your own..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Submit Button</Label>
                  <Input value={aboutContent.ctaSubmitButton} onChange={(e) => setAboutContent({ ...aboutContent, ctaSubmitButton: e.target.value })} placeholder="Submit Your Tool" />
                </div>
                <div>
                  <Label>CTA Contact Button</Label>
                  <Input value={aboutContent.ctaContactButton} onChange={(e) => setAboutContent({ ...aboutContent, ctaContactButton: e.target.value })} placeholder="Get in Touch" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("about")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save About Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Contact Page Content */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Badge</Label>
                <Input value={contactContent.heroBadge} onChange={(e) => setContactContent({ ...contactContent, heroBadge: e.target.value })} placeholder="Get in Touch" />
              </div>
              <div>
                <Label>Hero Title</Label>
                <Input value={contactContent.heroTitle} onChange={(e) => setContactContent({ ...contactContent, heroTitle: e.target.value })} placeholder="We're Here to Help" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={contactContent.heroDescription} onChange={(e) => setContactContent({ ...contactContent, heroDescription: e.target.value })} rows={2} placeholder="Have a question, suggestion, or just want to say hello? We'd love to hear from you." />
              </div>
            </CardContent>
          </Card>

          {/* How Can We Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>How Can We Help Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Section Title</Label>
                <Input value={contactContent.howCanWeHelpTitle} onChange={(e) => setContactContent({ ...contactContent, howCanWeHelpTitle: e.target.value })} placeholder="How Can We Help?" />
              </div>
              <div>
                <Label>Section Description</Label>
                <Textarea value={contactContent.howCanWeHelpDescription} onChange={(e) => setContactContent({ ...contactContent, howCanWeHelpDescription: e.target.value })} rows={2} placeholder="Choose the best way to reach us based on your needs" />
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">4 Contact Reason Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reason 1 Title</Label>
                    <Input value={contactContent.reason1Title} onChange={(e) => setContactContent({ ...contactContent, reason1Title: e.target.value })} placeholder="General Support" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 1 Description</Label>
                    <Input value={contactContent.reason1Description} onChange={(e) => setContactContent({ ...contactContent, reason1Description: e.target.value })} placeholder="Get help with using our platform" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 2 Title</Label>
                    <Input value={contactContent.reason2Title} onChange={(e) => setContactContent({ ...contactContent, reason2Title: e.target.value })} placeholder="Submit a Tool" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 2 Description</Label>
                    <Input value={contactContent.reason2Description} onChange={(e) => setContactContent({ ...contactContent, reason2Description: e.target.value })} placeholder="Add your AI tool to our directory" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 3 Title</Label>
                    <Input value={contactContent.reason3Title} onChange={(e) => setContactContent({ ...contactContent, reason3Title: e.target.value })} placeholder="Partnership" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 3 Description</Label>
                    <Input value={contactContent.reason3Description} onChange={(e) => setContactContent({ ...contactContent, reason3Description: e.target.value })} placeholder="Collaborate with us" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 4 Title</Label>
                    <Input value={contactContent.reason4Title} onChange={(e) => setContactContent({ ...contactContent, reason4Title: e.target.value })} placeholder="Feedback" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason 4 Description</Label>
                    <Input value={contactContent.reason4Description} onChange={(e) => setContactContent({ ...contactContent, reason4Description: e.target.value })} placeholder="Share your thoughts and suggestions" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Form Title</Label>
                <Input value={contactContent.formTitle} onChange={(e) => setContactContent({ ...contactContent, formTitle: e.target.value })} placeholder="Send Us a Message" />
              </div>
              <div>
                <Label>Form Description</Label>
                <Textarea value={contactContent.formDescription} onChange={(e) => setContactContent({ ...contactContent, formDescription: e.target.value })} rows={2} placeholder="Fill out the form below and we'll get back to you as soon as possible" />
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name Label</Label>
                    <Input value={contactContent.nameLabel} onChange={(e) => setContactContent({ ...contactContent, nameLabel: e.target.value })} placeholder="Name" />
                  </div>
                  <div>
                    <Label>Name Placeholder</Label>
                    <Input value={contactContent.namePlaceholder} onChange={(e) => setContactContent({ ...contactContent, namePlaceholder: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Email Label</Label>
                    <Input value={contactContent.emailLabel} onChange={(e) => setContactContent({ ...contactContent, emailLabel: e.target.value })} placeholder="Email" />
                  </div>
                  <div>
                    <Label>Email Placeholder</Label>
                    <Input value={contactContent.emailPlaceholder} onChange={(e) => setContactContent({ ...contactContent, emailPlaceholder: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Subject Label</Label>
                    <Input value={contactContent.subjectLabel} onChange={(e) => setContactContent({ ...contactContent, subjectLabel: e.target.value })} placeholder="Subject" />
                  </div>
                  <div>
                    <Label>Subject Placeholder</Label>
                    <Input value={contactContent.subjectPlaceholder} onChange={(e) => setContactContent({ ...contactContent, subjectPlaceholder: e.target.value })} placeholder="What is this regarding?" />
                  </div>
                  <div>
                    <Label>Website Label</Label>
                    <Input value={contactContent.websiteLabel} onChange={(e) => setContactContent({ ...contactContent, websiteLabel: e.target.value })} placeholder="Website URL" />
                  </div>
                  <div>
                    <Label>Website Placeholder</Label>
                    <Input value={contactContent.websitePlaceholder} onChange={(e) => setContactContent({ ...contactContent, websitePlaceholder: e.target.value })} placeholder="https://example.com" />
                  </div>
                  <div>
                    <Label>Message Label</Label>
                    <Input value={contactContent.messageLabel} onChange={(e) => setContactContent({ ...contactContent, messageLabel: e.target.value })} placeholder="Message" />
                  </div>
                  <div>
                    <Label>Message Placeholder</Label>
                    <Input value={contactContent.messagePlaceholder} onChange={(e) => setContactContent({ ...contactContent, messagePlaceholder: e.target.value })} placeholder="Tell us more about your inquiry..." />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Form Buttons & Messages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Send Button</Label>
                    <Input value={contactContent.sendButton} onChange={(e) => setContactContent({ ...contactContent, sendButton: e.target.value })} placeholder="Send Message" />
                  </div>
                  <div>
                    <Label>Sending Button</Label>
                    <Input value={contactContent.sendingButton} onChange={(e) => setContactContent({ ...contactContent, sendingButton: e.target.value })} placeholder="Sending..." />
                  </div>
                  <div>
                    <Label>Success Message</Label>
                    <Input value={contactContent.successMessage} onChange={(e) => setContactContent({ ...contactContent, successMessage: e.target.value })} placeholder="Message sent successfully! We'll get back to you soon." />
                  </div>
                  <div>
                    <Label>Error Message</Label>
                    <Input value={contactContent.errorMessage} onChange={(e) => setContactContent({ ...contactContent, errorMessage: e.target.value })} placeholder="Failed to send message. Please try again." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Info Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Label</Label>
                <Input value={contactContent.emailLabelText} onChange={(e) => setContactContent({ ...contactContent, emailLabelText: e.target.value })} placeholder="Email Us" />
              </div>
              <div>
                <Label>Email Description</Label>
                <Textarea value={contactContent.emailDescription} onChange={(e) => setContactContent({ ...contactContent, emailDescription: e.target.value })} rows={2} placeholder="For general inquiries and support" />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input value={contactContent.emailValue} onChange={(e) => setContactContent({ ...contactContent, emailValue: e.target.value })} placeholder="hello@mostpopularaitools.com" />
              </div>
              <div className="pt-4 border-t">
                <Label>Response Time Title</Label>
                <Input value={contactContent.responseTitle} onChange={(e) => setContactContent({ ...contactContent, responseTitle: e.target.value })} placeholder="Response Time" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Response Text 1</Label>
                  <Input value={contactContent.responseText1} onChange={(e) => setContactContent({ ...contactContent, responseText1: e.target.value })} placeholder="24-48 hours for general inquiries" />
              </div>
              <div>
                <Label>Response Text 2</Label>
                  <Input value={contactContent.responseText2} onChange={(e) => setContactContent({ ...contactContent, responseText2: e.target.value })} placeholder="Priority support for partners" />
              </div>
              <div>
                <Label>Response Text 3</Label>
                  <Input value={contactContent.responseText3} onChange={(e) => setContactContent({ ...contactContent, responseText3: e.target.value })} placeholder="Available Monday to Friday" />
              </div>
              </div>
              <div className="pt-4 border-t">
                <Label>Quick Links Title</Label>
                <Input value={contactContent.quickLinksTitle} onChange={(e) => setContactContent({ ...contactContent, quickLinksTitle: e.target.value })} placeholder="Quick Links" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Quick Link 1</Label>
                  <Input value={contactContent.quickLink1} onChange={(e) => setContactContent({ ...contactContent, quickLink1: e.target.value })} placeholder="Submit Your AI Tool" />
                </div>
                <div>
                  <Label>Quick Link 2</Label>
                  <Input value={contactContent.quickLink2} onChange={(e) => setContactContent({ ...contactContent, quickLink2: e.target.value })} placeholder="About Us" />
                </div>
                <div>
                  <Label>Quick Link 3</Label>
                  <Input value={contactContent.quickLink3} onChange={(e) => setContactContent({ ...contactContent, quickLink3: e.target.value })} placeholder="Read Our Blog" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>FAQ Title</Label>
                <Input value={contactContent.faqTitle} onChange={(e) => setContactContent({ ...contactContent, faqTitle: e.target.value })} placeholder="Looking for Quick Answers?" />
              </div>
              <div>
                <Label>FAQ Description</Label>
                <Textarea value={contactContent.faqDescription} onChange={(e) => setContactContent({ ...contactContent, faqDescription: e.target.value })} rows={2} placeholder="Check out our FAQ section or browse our help documentation" />
              </div>
              <div>
                <Label>FAQ Button</Label>
                <Input value={contactContent.faqButton} onChange={(e) => setContactContent({ ...contactContent, faqButton: e.target.value })} placeholder="Browse Tools" />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("contact")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Contact Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Privacy Page Content */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Privacy Policy Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={privacyContent.heroTitle} onChange={(e) => setPrivacyContent({ ...privacyContent, heroTitle: e.target.value })} />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={privacyContent.heroDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, heroDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Introduction</Label>
                <Textarea value={privacyContent.introduction} onChange={(e) => setPrivacyContent({ ...privacyContent, introduction: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Information We Collect - Personal</Label>
                <Textarea value={privacyContent.informationPersonal} onChange={(e) => setPrivacyContent({ ...privacyContent, informationPersonal: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Information We Collect - Usage</Label>
                <Textarea value={privacyContent.informationUsage} onChange={(e) => setPrivacyContent({ ...privacyContent, informationUsage: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>How We Use Information</Label>
                <Textarea value={privacyContent.usageDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, usageDescription: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Data Security</Label>
                <Textarea value={privacyContent.securityDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, securityDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Cookies</Label>
                <Textarea value={privacyContent.cookiesDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, cookiesDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Third-Party Services</Label>
                <Textarea value={privacyContent.thirdPartyDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, thirdPartyDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Your Rights</Label>
                <Textarea value={privacyContent.rightsDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, rightsDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Children&apos;s Privacy</Label>
                <Textarea value={privacyContent.childrenDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, childrenDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Changes to Policy</Label>
                <Textarea value={privacyContent.changesDescription} onChange={(e) => setPrivacyContent({ ...privacyContent, changesDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input value={privacyContent.contactEmail} onChange={(e) => setPrivacyContent({ ...privacyContent, contactEmail: e.target.value })} />
              </div>
            </CardContent>
          </Card>
          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("privacy")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Privacy Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Terms Page Content */}
      {activeTab === "terms" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Terms of Service Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={termsContent.heroTitle} onChange={(e) => setTermsContent({ ...termsContent, heroTitle: e.target.value })} />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={termsContent.heroDescription} onChange={(e) => setTermsContent({ ...termsContent, heroDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Introduction</Label>
                <Textarea value={termsContent.introduction} onChange={(e) => setTermsContent({ ...termsContent, introduction: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Acceptance of Terms</Label>
                <Textarea value={termsContent.acceptanceDescription} onChange={(e) => setTermsContent({ ...termsContent, acceptanceDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Description of Service</Label>
                <Textarea value={termsContent.serviceDescription} onChange={(e) => setTermsContent({ ...termsContent, serviceDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Account Creation</Label>
                <Textarea value={termsContent.accountsCreation} onChange={(e) => setTermsContent({ ...termsContent, accountsCreation: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Account Security</Label>
                <Textarea value={termsContent.accountsSecurity} onChange={(e) => setTermsContent({ ...termsContent, accountsSecurity: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Account Termination</Label>
                <Textarea value={termsContent.accountsTermination} onChange={(e) => setTermsContent({ ...termsContent, accountsTermination: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Content Ownership</Label>
                <Textarea value={termsContent.contentOwnership} onChange={(e) => setTermsContent({ ...termsContent, contentOwnership: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Content Guidelines</Label>
                <Textarea value={termsContent.contentGuidelines} onChange={(e) => setTermsContent({ ...termsContent, contentGuidelines: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Content Moderation</Label>
                <Textarea value={termsContent.contentModeration} onChange={(e) => setTermsContent({ ...termsContent, contentModeration: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Tool Submissions</Label>
                <Textarea value={termsContent.submissionsDescription} onChange={(e) => setTermsContent({ ...termsContent, submissionsDescription: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Intellectual Property</Label>
                <Textarea value={termsContent.intellectualDescription} onChange={(e) => setTermsContent({ ...termsContent, intellectualDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Third-Party Links</Label>
                <Textarea value={termsContent.thirdPartyDescription} onChange={(e) => setTermsContent({ ...termsContent, thirdPartyDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Disclaimers</Label>
                <Textarea value={termsContent.disclaimersDescription} onChange={(e) => setTermsContent({ ...termsContent, disclaimersDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Limitation of Liability</Label>
                <Textarea value={termsContent.liabilityDescription} onChange={(e) => setTermsContent({ ...termsContent, liabilityDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Changes to Terms</Label>
                <Textarea value={termsContent.changesDescription} onChange={(e) => setTermsContent({ ...termsContent, changesDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Governing Law</Label>
                <Textarea value={termsContent.governingDescription} onChange={(e) => setTermsContent({ ...termsContent, governingDescription: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input value={termsContent.contactEmail} onChange={(e) => setTermsContent({ ...termsContent, contactEmail: e.target.value })} />
              </div>
            </CardContent>
          </Card>
          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("terms")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Terms Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Blog Page Content */}
      {activeTab === "blog" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={blogContent.heroTitle} onChange={(e) => setBlogContent({ ...blogContent, heroTitle: e.target.value })} placeholder="Blog" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={blogContent.heroDescription} onChange={(e) => setBlogContent({ ...blogContent, heroDescription: e.target.value })} rows={2} placeholder="Latest insights, tutorials, and news about AI tools" />
              </div>
              <div>
                <Label>Search Placeholder</Label>
                <Input value={blogContent.searchPlaceholder} onChange={(e) => setBlogContent({ ...blogContent, searchPlaceholder: e.target.value })} placeholder="Search articles..." />
              </div>
            </CardContent>
          </Card>

          {/* Buttons and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons and Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>All Posts Button</Label>
                <Input value={blogContent.allPostsButton} onChange={(e) => setBlogContent({ ...blogContent, allPostsButton: e.target.value })} placeholder="All Posts" />
              </div>
            </CardContent>
          </Card>

          {/* Featured Section */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Featured Article Title</Label>
                <Input value={blogContent.featuredArticleTitle} onChange={(e) => setBlogContent({ ...blogContent, featuredArticleTitle: e.target.value })} placeholder="Featured Article" />
              </div>
              <div>
                <Label>Featured Badge Text</Label>
                <Input value={blogContent.featuredBadge} onChange={(e) => setBlogContent({ ...blogContent, featuredBadge: e.target.value })} placeholder="Featured" />
              </div>
            </CardContent>
          </Card>

          {/* Articles Section */}
          <Card>
            <CardHeader>
              <CardTitle>Articles Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Latest Articles Title</Label>
                  <Input value={blogContent.latestArticlesTitle} onChange={(e) => setBlogContent({ ...blogContent, latestArticlesTitle: e.target.value })} placeholder="Latest Articles" />
                </div>
                <div>
                  <Label>Search Results Title</Label>
                  <Input value={blogContent.searchResultsTitle} onChange={(e) => setBlogContent({ ...blogContent, searchResultsTitle: e.target.value })} placeholder="Search Results" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Article Text (Singular)</Label>
                  <Input value={blogContent.articleText} onChange={(e) => setBlogContent({ ...blogContent, articleText: e.target.value })} placeholder="article" />
                </div>
                <div>
                  <Label>Articles Text (Plural)</Label>
                  <Input value={blogContent.articlesText} onChange={(e) => setBlogContent({ ...blogContent, articlesText: e.target.value })} placeholder="articles" />
                </div>
              </div>
              <div>
                <Label>Read More Button</Label>
                <Input value={blogContent.readMoreButton} onChange={(e) => setBlogContent({ ...blogContent, readMoreButton: e.target.value })} placeholder="Read More" />
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Trending Badge Text</Label>
                <Input value={blogContent.trendingBadge} onChange={(e) => setBlogContent({ ...blogContent, trendingBadge: e.target.value })} placeholder="Trending" />
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card>
            <CardHeader>
              <CardTitle>Empty State Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Empty State Title</Label>
                <Input value={blogContent.emptyStateTitle} onChange={(e) => setBlogContent({ ...blogContent, emptyStateTitle: e.target.value })} placeholder="No articles found" />
              </div>
              <div>
                <Label>Empty State Message (Search)</Label>
                <Textarea value={blogContent.emptyStateMessageSearch} onChange={(e) => setBlogContent({ ...blogContent, emptyStateMessageSearch: e.target.value })} rows={2} placeholder='No articles match "{query}". Try a different search term.' />
                <p className="text-xs text-muted-foreground mt-1">Use {"{query}"} as placeholder for search term</p>
              </div>
              <div>
                <Label>Empty State Message (Category)</Label>
                <Textarea value={blogContent.emptyStateMessageCategory} onChange={(e) => setBlogContent({ ...blogContent, emptyStateMessageCategory: e.target.value })} rows={2} placeholder="No articles available in this category." />
              </div>
              <div>
                <Label>View All Posts Button</Label>
                <Input value={blogContent.viewAllPostsButton} onChange={(e) => setBlogContent({ ...blogContent, viewAllPostsButton: e.target.value })} placeholder="View All Posts" />
              </div>
            </CardContent>
          </Card>

          {/* Reading Time */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Min Read Text</Label>
                <Input value={blogContent.minReadText} onChange={(e) => setBlogContent({ ...blogContent, minReadText: e.target.value })} placeholder="min read" />
              </div>
            </CardContent>
          </Card>

          {/* Single Article Page */}
          <Card>
            <CardHeader>
              <CardTitle>Single Article Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Navigation */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Navigation</h3>
                <div>
                  <Label>Back to Blog Button</Label>
                  <Input value={blogContent.backToBlogButton} onChange={(e) => setBlogContent({ ...blogContent, backToBlogButton: e.target.value })} placeholder="Back to Blog" />
                </div>
              </div>

              {/* Author Info */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Author Info</h3>
                <div>
                  <Label>Author Role Text</Label>
                  <Input value={blogContent.authorRoleText} onChange={(e) => setBlogContent({ ...blogContent, authorRoleText: e.target.value })} placeholder="AI Writer & Enthusiast" />
                </div>
                <div>
                  <Label>Views Text</Label>
                  <Input value={blogContent.viewsText} onChange={(e) => setBlogContent({ ...blogContent, viewsText: e.target.value })} placeholder="views" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Action Buttons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Save Button</Label>
                    <Input value={blogContent.saveButton} onChange={(e) => setBlogContent({ ...blogContent, saveButton: e.target.value })} placeholder="Save" />
                  </div>
                  <div>
                    <Label>Saved Button</Label>
                    <Input value={blogContent.savedButton} onChange={(e) => setBlogContent({ ...blogContent, savedButton: e.target.value })} placeholder="Saved" />
                  </div>
                </div>
                <div>
                  <Label>Share Button</Label>
                  <Input value={blogContent.shareButton} onChange={(e) => setBlogContent({ ...blogContent, shareButton: e.target.value })} placeholder="Share" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Share Facebook</Label>
                    <Input value={blogContent.shareFacebook} onChange={(e) => setBlogContent({ ...blogContent, shareFacebook: e.target.value })} placeholder="Facebook" />
                  </div>
                  <div>
                    <Label>Share Twitter</Label>
                    <Input value={blogContent.shareTwitter} onChange={(e) => setBlogContent({ ...blogContent, shareTwitter: e.target.value })} placeholder="Twitter" />
                  </div>
                  <div>
                    <Label>Share LinkedIn</Label>
                    <Input value={blogContent.shareLinkedIn} onChange={(e) => setBlogContent({ ...blogContent, shareLinkedIn: e.target.value })} placeholder="LinkedIn" />
                  </div>
                  <div>
                    <Label>Copy Link</Label>
                    <Input value={blogContent.shareCopyLink} onChange={(e) => setBlogContent({ ...blogContent, shareCopyLink: e.target.value })} placeholder="Copy Link" />
                  </div>
                </div>
                <div>
                  <Label>Link Copied Message</Label>
                  <Input value={blogContent.linkCopiedMessage} onChange={(e) => setBlogContent({ ...blogContent, linkCopiedMessage: e.target.value })} placeholder="Link copied to clipboard!" />
                </div>
              </div>

              {/* Tags & Author */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Tags & Author</h3>
                <div>
                  <Label>Tagged In Heading</Label>
                  <Input value={blogContent.taggedInHeading} onChange={(e) => setBlogContent({ ...blogContent, taggedInHeading: e.target.value })} placeholder="TAGGED IN" />
                </div>
                <div>
                  <Label>About Author Heading</Label>
                  <Input value={blogContent.aboutAuthorHeading} onChange={(e) => setBlogContent({ ...blogContent, aboutAuthorHeading: e.target.value })} placeholder="About" />
                </div>
                <div>
                  <Label>Visit Website Button</Label>
                  <Input value={blogContent.visitWebsiteButton} onChange={(e) => setBlogContent({ ...blogContent, visitWebsiteButton: e.target.value })} placeholder="Visit Website →" />
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Comments Section</h3>
                <div>
                  <Label>Comments Heading</Label>
                  <Input value={blogContent.commentsHeading} onChange={(e) => setBlogContent({ ...blogContent, commentsHeading: e.target.value })} placeholder="Comments" />
                </div>
                <div>
                  <Label>Leave Comment Heading</Label>
                  <Input value={blogContent.leaveCommentHeading} onChange={(e) => setBlogContent({ ...blogContent, leaveCommentHeading: e.target.value })} placeholder="Leave a Comment" />
                </div>
                <div>
                  <Label>Comment Placeholder</Label>
                  <Input value={blogContent.commentPlaceholder} onChange={(e) => setBlogContent({ ...blogContent, commentPlaceholder: e.target.value })} placeholder="Write your comment here... *" />
                </div>
                <div>
                  <Label>Post Comment Button</Label>
                  <Input value={blogContent.postCommentButton} onChange={(e) => setBlogContent({ ...blogContent, postCommentButton: e.target.value })} placeholder="Post Comment" />
                </div>
                <div>
                  <Label>Reply Button</Label>
                  <Input value={blogContent.replyButton} onChange={(e) => setBlogContent({ ...blogContent, replyButton: e.target.value })} placeholder="Reply" />
                </div>
                <div>
                  <Label>Load More Comments Button</Label>
                  <Input value={blogContent.loadMoreCommentsButton} onChange={(e) => setBlogContent({ ...blogContent, loadMoreCommentsButton: e.target.value })} placeholder="Load More Comments" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Sidebar</h3>
                <div>
                  <Label>Newsletter Title</Label>
                  <Input value={blogContent.newsletterTitle} onChange={(e) => setBlogContent({ ...blogContent, newsletterTitle: e.target.value })} placeholder="Subscribe to Newsletter" />
                </div>
                <div>
                  <Label>Newsletter Description</Label>
                  <Textarea value={blogContent.newsletterDescription} onChange={(e) => setBlogContent({ ...blogContent, newsletterDescription: e.target.value })} rows={2} placeholder="Get the latest AI tools and insights delivered to your inbox" />
                </div>
                <div>
                  <Label>Newsletter Placeholder</Label>
                  <Input value={blogContent.newsletterPlaceholder} onChange={(e) => setBlogContent({ ...blogContent, newsletterPlaceholder: e.target.value })} placeholder="Enter your email" />
                </div>
                <div>
                  <Label>Newsletter Button</Label>
                  <Input value={blogContent.newsletterButton} onChange={(e) => setBlogContent({ ...blogContent, newsletterButton: e.target.value })} placeholder="Subscribe" />
                </div>
                <div>
                  <Label>Newsletter Subtext</Label>
                  <Input value={blogContent.newsletterSubtext} onChange={(e) => setBlogContent({ ...blogContent, newsletterSubtext: e.target.value })} placeholder="No spam. Unsubscribe anytime." />
                </div>
                <div>
                  <Label>Popular Posts Heading</Label>
                  <Input value={blogContent.popularPostsHeading} onChange={(e) => setBlogContent({ ...blogContent, popularPostsHeading: e.target.value })} placeholder="Popular Posts" />
                </div>
                <div>
                  <Label>Categories Heading</Label>
                  <Input value={blogContent.categoriesHeading} onChange={(e) => setBlogContent({ ...blogContent, categoriesHeading: e.target.value })} placeholder="Categories" />
                </div>
                <div>
                  <Label>Submit Tool Heading</Label>
                  <Input value={blogContent.submitToolHeading} onChange={(e) => setBlogContent({ ...blogContent, submitToolHeading: e.target.value })} placeholder="Have an AI Tool?" />
                </div>
                <div>
                  <Label>Submit Tool Description</Label>
                  <Textarea value={blogContent.submitToolDescription} onChange={(e) => setBlogContent({ ...blogContent, submitToolDescription: e.target.value })} rows={2} placeholder="Submit your AI tool to our directory and reach thousands of users" />
                </div>
                <div>
                  <Label>Submit Tool Button</Label>
                  <Input value={blogContent.submitToolButton} onChange={(e) => setBlogContent({ ...blogContent, submitToolButton: e.target.value })} placeholder="Submit Your Tool" />
                </div>
              </div>

              {/* Related Articles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Related Articles</h3>
                <div>
                  <Label>Related Articles Heading</Label>
                  <Input value={blogContent.relatedArticlesHeading} onChange={(e) => setBlogContent({ ...blogContent, relatedArticlesHeading: e.target.value })} placeholder="Related Articles" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("blog")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Blog Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Tools Page Content */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Tools Page Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hero Section</h3>
                <div>
                  <Label>Hero Title</Label>
                  <Input value={toolsContent.heroTitle} onChange={(e) => setToolsContent({ ...toolsContent, heroTitle: e.target.value })} placeholder="All AI Tools" />
                </div>
                <div>
                  <Label>Hero Description</Label>
                  <Textarea value={toolsContent.heroDescription} onChange={(e) => setToolsContent({ ...toolsContent, heroDescription: e.target.value })} rows={3} placeholder="Discover, compare, and find the perfect AI tools..." />
                </div>
                <div>
                  <Label>Search Placeholder</Label>
                  <Input value={toolsContent.searchPlaceholder} onChange={(e) => setToolsContent({ ...toolsContent, searchPlaceholder: e.target.value })} placeholder="Search for AI tools..." />
                </div>
              </div>

              {/* Stats Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Stats Section</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tools Label</Label>
                    <Input value={toolsContent.statsToolsLabel} onChange={(e) => setToolsContent({ ...toolsContent, statsToolsLabel: e.target.value })} placeholder="Tools Available" />
                  </div>
                  <div>
                    <Label>Categories Label</Label>
                    <Input value={toolsContent.statsCategoriesLabel} onChange={(e) => setToolsContent({ ...toolsContent, statsCategoriesLabel: e.target.value })} placeholder="Categories" />
                  </div>
                  <div>
                    <Label>Rating Label</Label>
                    <Input value={toolsContent.statsRatingLabel} onChange={(e) => setToolsContent({ ...toolsContent, statsRatingLabel: e.target.value })} placeholder="Avg Rating" />
                  </div>
                  <div>
                    <Label>Rating Value</Label>
                    <Input value={toolsContent.statsRatingValue} onChange={(e) => setToolsContent({ ...toolsContent, statsRatingValue: e.target.value })} placeholder="4.7+" />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Sort Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Newest Option</Label>
                    <Input value={toolsContent.sortNewest} onChange={(e) => setToolsContent({ ...toolsContent, sortNewest: e.target.value })} placeholder="⚡ Newest" />
                  </div>
                  <div>
                    <Label>Popular Option</Label>
                    <Input value={toolsContent.sortPopular} onChange={(e) => setToolsContent({ ...toolsContent, sortPopular: e.target.value })} placeholder="🔥 Most Popular" />
                  </div>
                  <div>
                    <Label>Rating Option</Label>
                    <Input value={toolsContent.sortRating} onChange={(e) => setToolsContent({ ...toolsContent, sortRating: e.target.value })} placeholder="⭐ Top Rated" />
                  </div>
                  <div>
                    <Label>Name Option</Label>
                    <Input value={toolsContent.sortName} onChange={(e) => setToolsContent({ ...toolsContent, sortName: e.target.value })} placeholder="🔤 A-Z" />
                  </div>
                </div>
              </div>

              {/* Empty State */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Empty State Messages</h3>
                <div>
                  <Label>Empty State Title</Label>
                  <Input value={toolsContent.emptyStateTitle} onChange={(e) => setToolsContent({ ...toolsContent, emptyStateTitle: e.target.value })} placeholder="No tools found" />
                </div>
                <div>
                  <Label>Empty State Message (Search)</Label>
                  <Textarea value={toolsContent.emptyStateMessageSearch} onChange={(e) => setToolsContent({ ...toolsContent, emptyStateMessageSearch: e.target.value })} rows={2} placeholder='No tools match "{query}". Try adjusting your filters...' />
                  <p className="text-xs text-muted-foreground mt-1">Use {"{query}"} as placeholder for search term</p>
                </div>
                <div>
                  <Label>Empty State Message (Filters)</Label>
                  <Textarea value={toolsContent.emptyStateMessageFilters} onChange={(e) => setToolsContent({ ...toolsContent, emptyStateMessageFilters: e.target.value })} rows={2} placeholder="No tools match your current filters..." />
                </div>
              </div>

              {/* Load More Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Load More Section</h3>
                <div>
                  <Label>Load More Button Text</Label>
                  <Input value={toolsContent.loadMoreButton} onChange={(e) => setToolsContent({ ...toolsContent, loadMoreButton: e.target.value })} placeholder="Load More Tools" />
                </div>
                <div>
                  <Label>End Message</Label>
                  <Input value={toolsContent.endMessage} onChange={(e) => setToolsContent({ ...toolsContent, endMessage: e.target.value })} placeholder="You've reached the end! All tools loaded." />
                </div>
                <div>
                  <Label>Showing Text</Label>
                  <Input value={toolsContent.showingText} onChange={(e) => setToolsContent({ ...toolsContent, showingText: e.target.value })} placeholder="Showing {count} of {total} tools" />
                  <p className="text-xs text-muted-foreground mt-1">Use {"{count}"} and {"{total}"} as placeholders</p>
                </div>
                <div>
                  <Label>Tools Found Text</Label>
                  <Input value={toolsContent.toolsFoundText} onChange={(e) => setToolsContent({ ...toolsContent, toolsFoundText: e.target.value })} placeholder="{count} tools found" />
                  <p className="text-xs text-muted-foreground mt-1">Use {"{count}"} as placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("tools")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Tools Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Submit Page Content */}
      {activeTab === "submit" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={submitContent.heroTitle} onChange={(e) => setSubmitContent({ ...submitContent, heroTitle: e.target.value })} placeholder="Share Your AI Tool with the World" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={submitContent.heroDescription} onChange={(e) => setSubmitContent({ ...submitContent, heroDescription: e.target.value })} rows={3} placeholder="Join thousands of AI tools in our directory..." />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Stat 1</Label>
                <Input value={submitContent.quickStat1} onChange={(e) => setSubmitContent({ ...submitContent, quickStat1: e.target.value })} placeholder="Fast approval process" />
              </div>
              <div>
                <Label>Stat 2</Label>
                <Input value={submitContent.quickStat2} onChange={(e) => setSubmitContent({ ...submitContent, quickStat2: e.target.value })} placeholder="Free & paid listings" />
              </div>
              <div>
                <Label>Stat 3</Label>
                <Input value={submitContent.quickStat3} onChange={(e) => setSubmitContent({ ...submitContent, quickStat3: e.target.value })} placeholder="Reach thousands of users" />
              </div>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Section Title</Label>
                <Input value={submitContent.howItWorksTitle} onChange={(e) => setSubmitContent({ ...submitContent, howItWorksTitle: e.target.value })} placeholder="Submit Your Tool in 4 Simple Steps" />
              </div>
              <div>
                <Label>Section Description</Label>
                <Textarea value={submitContent.howItWorksDescription} onChange={(e) => setSubmitContent({ ...submitContent, howItWorksDescription: e.target.value })} rows={2} placeholder="Get your AI tool listed in our directory..." />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">4 Steps Cards Content</h3>
                
                {/* Step 1 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-blue-600">Step 1: Fill Form</h4>
                  <div>
                    <Label>Step 1 Title</Label>
                    <Input value={submitContent.step1Title} onChange={(e) => setSubmitContent({ ...submitContent, step1Title: e.target.value })} placeholder="Fill Form" />
                  </div>
                  <div>
                    <Label>Step 1 Description</Label>
                    <Textarea value={submitContent.step1Description} onChange={(e) => setSubmitContent({ ...submitContent, step1Description: e.target.value })} rows={2} placeholder="Complete the submission form..." />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-purple-600">Step 2: Review</h4>
                  <div>
                    <Label>Step 2 Title</Label>
                    <Input value={submitContent.step2Title} onChange={(e) => setSubmitContent({ ...submitContent, step2Title: e.target.value })} placeholder="Review" />
                  </div>
                  <div>
                    <Label>Step 2 Description</Label>
                    <Textarea value={submitContent.step2Description} onChange={(e) => setSubmitContent({ ...submitContent, step2Description: e.target.value })} rows={2} placeholder="Our expert team carefully reviews..." />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-pink-600">Step 3: Approval</h4>
                  <div>
                    <Label>Step 3 Title</Label>
                    <Input value={submitContent.step3Title} onChange={(e) => setSubmitContent({ ...submitContent, step3Title: e.target.value })} placeholder="Approval" />
                  </div>
                  <div>
                    <Label>Step 3 Description</Label>
                    <Textarea value={submitContent.step3Description} onChange={(e) => setSubmitContent({ ...submitContent, step3Description: e.target.value })} rows={2} placeholder="Once approved, your tool gets published..." />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-orange-600">Step 4: Grow</h4>
                  <div>
                    <Label>Step 4 Title</Label>
                    <Input value={submitContent.step4Title} onChange={(e) => setSubmitContent({ ...submitContent, step4Title: e.target.value })} placeholder="Grow" />
                  </div>
                  <div>
                    <Label>Step 4 Description</Label>
                    <Textarea value={submitContent.step4Description} onChange={(e) => setSubmitContent({ ...submitContent, step4Description: e.target.value })} rows={2} placeholder="Get discovered by thousands of users..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Form Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Form Title</Label>
                <Input value={submitContent.formTitle} onChange={(e) => setSubmitContent({ ...submitContent, formTitle: e.target.value })} placeholder="Tool Submission Form" />
              </div>
              <div>
                <Label>Form Description</Label>
                <Textarea value={submitContent.formDescription} onChange={(e) => setSubmitContent({ ...submitContent, formDescription: e.target.value })} rows={2} placeholder="Fill out the form below to submit your AI tool..." />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("submit")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Submit Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Categories Page Content */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-blue-600" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={categoriesContent.heroTitle} onChange={(e) => setCategoriesContent({ ...categoriesContent, heroTitle: e.target.value })} placeholder="Browse Categories" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={categoriesContent.heroDescription} onChange={(e) => setCategoriesContent({ ...categoriesContent, heroDescription: e.target.value })} rows={2} placeholder="Discover {totalTools}+ AI tools organized by their primary use cases. Find the perfect solution for your needs." />
                <p className="text-xs text-muted-foreground mt-1">Use {"{totalTools}"} as placeholder for total tools count</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Stats Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Categories Label</Label>
                  <Input value={categoriesContent.statsCategoriesLabel} onChange={(e) => setCategoriesContent({ ...categoriesContent, statsCategoriesLabel: e.target.value })} placeholder="Categories" />
                </div>
                <div>
                  <Label>Tools Label</Label>
                  <Input value={categoriesContent.statsToolsLabel} onChange={(e) => setCategoriesContent({ ...categoriesContent, statsToolsLabel: e.target.value })} placeholder="AI Tools" />
                </div>
                <div>
                  <Label>Trending Label</Label>
                  <Input value={categoriesContent.statsTrendingLabel} onChange={(e) => setCategoriesContent({ ...categoriesContent, statsTrendingLabel: e.target.value })} placeholder="Trending" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Sort Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search and Sort</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Placeholder</Label>
                <Input value={categoriesContent.searchPlaceholder} onChange={(e) => setCategoriesContent({ ...categoriesContent, searchPlaceholder: e.target.value })} placeholder="Search categories..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Sort Popular Option</Label>
                  <Input value={categoriesContent.sortPopular} onChange={(e) => setCategoriesContent({ ...categoriesContent, sortPopular: e.target.value })} placeholder="Most Popular" />
                </div>
                <div>
                  <Label>Sort Tools Option</Label>
                  <Input value={categoriesContent.sortTools} onChange={(e) => setCategoriesContent({ ...categoriesContent, sortTools: e.target.value })} placeholder="Most Tools" />
                </div>
                <div>
                  <Label>Sort Name Option</Label>
                  <Input value={categoriesContent.sortName} onChange={(e) => setCategoriesContent({ ...categoriesContent, sortName: e.target.value })} placeholder="A-Z" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Trending Only Button</Label>
                  <Input value={categoriesContent.trendingOnlyButton} onChange={(e) => setCategoriesContent({ ...categoriesContent, trendingOnlyButton: e.target.value })} placeholder="Trending Only" />
                </div>
                <div>
                  <Label>Clear Search Button</Label>
                  <Input value={categoriesContent.clearSearchButton} onChange={(e) => setCategoriesContent({ ...categoriesContent, clearSearchButton: e.target.value })} placeholder="Clear Search" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Popular Section */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Most Popular Title</Label>
                <Input value={categoriesContent.mostPopularTitle} onChange={(e) => setCategoriesContent({ ...categoriesContent, mostPopularTitle: e.target.value })} placeholder="Most Popular" />
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card>
            <CardHeader>
              <CardTitle>Empty State Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Empty State Title</Label>
                <Input value={categoriesContent.emptyStateTitle} onChange={(e) => setCategoriesContent({ ...categoriesContent, emptyStateTitle: e.target.value })} placeholder="No categories found" />
              </div>
              <div>
                <Label>Empty State Message (Search)</Label>
                <Textarea value={categoriesContent.emptyStateMessageSearch} onChange={(e) => setCategoriesContent({ ...categoriesContent, emptyStateMessageSearch: e.target.value })} rows={2} placeholder='No categories match "{query}". Try a different search term.' />
                <p className="text-xs text-muted-foreground mt-1">Use {"{query}"} as placeholder for search term</p>
              </div>
              <div>
                <Label>Empty State Message (Default)</Label>
                <Textarea value={categoriesContent.emptyStateMessageDefault} onChange={(e) => setCategoriesContent({ ...categoriesContent, emptyStateMessageDefault: e.target.value })} rows={2} placeholder="Categories will appear here once they are added." />
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Info Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Info Section Title</Label>
                <Input value={categoriesContent.infoSectionTitle} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoSectionTitle: e.target.value })} placeholder="Find Your Perfect AI Tool" />
              </div>
              <div>
                <Label>Info Section Description</Label>
                <Textarea value={categoriesContent.infoSectionDescription} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoSectionDescription: e.target.value })} rows={3} placeholder="Our categories are meticulously organized to help you discover AI tools..." />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">4 Info Cards Content</h3>
                
                {/* Card 1 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-blue-600">Card 1: Use Case Focused</h4>
                  <div>
                    <Label>Card 1 Title</Label>
                    <Input value={categoriesContent.infoCard1Title} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard1Title: e.target.value })} placeholder="Use Case Focused" />
                  </div>
                  <div>
                    <Label>Card 1 Description</Label>
                    <Textarea value={categoriesContent.infoCard1Description} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard1Description: e.target.value })} rows={2} placeholder="Every category is designed around real workflows and specific needs" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-purple-600">Card 2: Quality Curated</h4>
                  <div>
                    <Label>Card 2 Title</Label>
                    <Input value={categoriesContent.infoCard2Title} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard2Title: e.target.value })} placeholder="Quality Curated" />
                  </div>
                  <div>
                    <Label>Card 2 Description</Label>
                    <Textarea value={categoriesContent.infoCard2Description} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard2Description: e.target.value })} rows={2} placeholder="Each tool is thoroughly reviewed and verified by our team" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-pink-600">Card 3: Always Fresh</h4>
                  <div>
                    <Label>Card 3 Title</Label>
                    <Input value={categoriesContent.infoCard3Title} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard3Title: e.target.value })} placeholder="Always Fresh" />
                  </div>
                  <div>
                    <Label>Card 3 Description</Label>
                    <Textarea value={categoriesContent.infoCard3Description} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard3Description: e.target.value })} rows={2} placeholder="New tools and categories added daily to keep you updated" />
                  </div>
                </div>

                {/* Card 4 */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-green-600">Card 4: Easy Discovery</h4>
                  <div>
                    <Label>Card 4 Title</Label>
                    <Input value={categoriesContent.infoCard4Title} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard4Title: e.target.value })} placeholder="Easy Discovery" />
                  </div>
                  <div>
                    <Label>Card 4 Description</Label>
                    <Textarea value={categoriesContent.infoCard4Description} onChange={(e) => setCategoriesContent({ ...categoriesContent, infoCard4Description: e.target.value })} rows={2} placeholder="Find exactly what you need with powerful search and filters" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Showing Text */}
          <Card>
            <CardHeader>
              <CardTitle>Showing Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Showing Text</Label>
                <Input value={categoriesContent.showingText} onChange={(e) => setCategoriesContent({ ...categoriesContent, showingText: e.target.value })} placeholder="Showing {count} {count === 1 ? 'category' : 'categories'}" />
                <p className="text-xs text-muted-foreground mt-1">Use {"{count}"} as placeholder</p>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("categories")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Categories Page Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Header Content */}
      {activeTab === "header" && (
        <div className="space-y-6">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Name</Label>
                <Input value={headerContent.siteName} onChange={(e) => setHeaderContent({ ...headerContent, siteName: e.target.value })} placeholder="AI Tools Directory" />
              </div>
              <div>
                <Label>Site Tagline</Label>
                <Input value={headerContent.siteTagline} onChange={(e) => setHeaderContent({ ...headerContent, siteTagline: e.target.value })} placeholder="EST. 2025" />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={headerContent.logoUrl} onChange={(e) => setHeaderContent({ ...headerContent, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use default icon</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Bar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Top Bar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Top Bar Text</Label>
                <Input value={headerContent.topBarText} onChange={(e) => setHeaderContent({ ...headerContent, topBarText: e.target.value })} placeholder="Curated tools • Premium insights •" />
              </div>
              <div>
                <Label>Contact Email/Text</Label>
                <Input value={headerContent.topBarContact} onChange={(e) => setHeaderContent({ ...headerContent, topBarContact: e.target.value })} placeholder="Business inquiries: partner@mostpopularaitools.com" />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Section */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Navigation Items (JSON)</Label>
                <Textarea 
                  value={headerContent.navigationItems} 
                  onChange={(e) => setHeaderContent({ ...headerContent, navigationItems: e.target.value })} 
                  rows={8}
                  placeholder='[{"name": "Home", "href": "/"}, {"name": "Tools", "href": "/tools"}]'
                />
                <p className="text-xs text-muted-foreground mt-1">Format: Array of objects with &quot;name&quot; and &quot;href&quot; properties</p>
              </div>
            </CardContent>
          </Card>

          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Button Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Submit Tool Button</Label>
                <Input value={headerContent.submitButtonText} onChange={(e) => setHeaderContent({ ...headerContent, submitButtonText: e.target.value })} placeholder="Submit Tool" />
              </div>
              <div>
                <Label>Sign In Button</Label>
                <Input value={headerContent.signInButtonText} onChange={(e) => setHeaderContent({ ...headerContent, signInButtonText: e.target.value })} placeholder="Sign in" />
              </div>
              <div>
                <Label>Sign Up Button</Label>
                <Input value={headerContent.signUpButtonText} onChange={(e) => setHeaderContent({ ...headerContent, signUpButtonText: e.target.value })} placeholder="Sign Up" />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("header")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Header Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Footer Content */}
      {activeTab === "footer" && (
        <div className="space-y-6">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logo URL</Label>
                <Input value={footerContent.logoUrl} onChange={(e) => setFooterContent({ ...footerContent, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use default icon</p>
              </div>
              <div>
                <Label>Site Name</Label>
                <Input value={footerContent.siteName} onChange={(e) => setFooterContent({ ...footerContent, siteName: e.target.value })} placeholder="AI Tools Directory" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={footerContent.description} onChange={(e) => setFooterContent({ ...footerContent, description: e.target.value })} rows={3} placeholder="Discover the best AI tools..." />
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tools Count</Label>
                  <Input value={footerContent.statsTools} onChange={(e) => setFooterContent({ ...footerContent, statsTools: e.target.value })} placeholder="1000+" />
                </div>
                <div>
                  <Label>Users Count</Label>
                  <Input value={footerContent.statsUsers} onChange={(e) => setFooterContent({ ...footerContent, statsUsers: e.target.value })} placeholder="50K+" />
                </div>
                <div>
                  <Label>Categories Count</Label>
                  <Input value={footerContent.statsCategories} onChange={(e) => setFooterContent({ ...footerContent, statsCategories: e.target.value })} placeholder="25+" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Product Links (JSON)</Label>
                <Textarea 
                  value={footerContent.productLinks} 
                  onChange={(e) => setFooterContent({ ...footerContent, productLinks: e.target.value })} 
                  rows={4}
                  placeholder='[{"name": "All Tools", "href": "/tools"}]'
                />
              </div>
              <div>
                <Label>Company Links (JSON)</Label>
                <Textarea 
                  value={footerContent.companyLinks} 
                  onChange={(e) => setFooterContent({ ...footerContent, companyLinks: e.target.value })} 
                  rows={4}
                  placeholder='[{"name": "About", "href": "/about"}]'
                />
              </div>
              <div>
                <Label>Resources Links (JSON)</Label>
                <Textarea 
                  value={footerContent.resourcesLinks} 
                  onChange={(e) => setFooterContent({ ...footerContent, resourcesLinks: e.target.value })} 
                  rows={4}
                  placeholder='[{"name": "Documentation", "href": "/docs"}]'
                />
              </div>
              <div>
                <Label>Community Links (JSON)</Label>
                <Textarea 
                  value={footerContent.communityLinks} 
                  onChange={(e) => setFooterContent({ ...footerContent, communityLinks: e.target.value })} 
                  rows={4}
                  placeholder='[{"name": "Discord", "href": "#"}]'
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Social Links (JSON)</Label>
                <Textarea 
                  value={footerContent.socialLinks} 
                  onChange={(e) => setFooterContent({ ...footerContent, socialLinks: e.target.value })} 
                  rows={6}
                  placeholder='[{"name": "Twitter", "href": "#", "icon": "Twitter"}]'
                />
                <p className="text-xs text-muted-foreground mt-1">Icons: Twitter, Github, Linkedin, Mail, Facebook, Instagram</p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Bottom Bar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Copyright Text</Label>
                <Input value={footerContent.copyrightText} onChange={(e) => setFooterContent({ ...footerContent, copyrightText: e.target.value })} placeholder="© 2025 AI Tools Directory. All rights reserved." />
              </div>
              <div>
                <Label>Made With Text</Label>
                <Input value={footerContent.madeWithText} onChange={(e) => setFooterContent({ ...footerContent, madeWithText: e.target.value })} placeholder="Made with ❤️ by AI Enthusiasts" />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("footer")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Footer Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Compare Content */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          {/* Empty State Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Empty State
              </CardTitle>
              <CardDescription>Content shown when no tools are selected for comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={compareContent.emptyStateTitle} onChange={(e) => setCompareContent({ ...compareContent, emptyStateTitle: e.target.value })} placeholder="Compare AI Tools" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={compareContent.emptyStateDescription} onChange={(e) => setCompareContent({ ...compareContent, emptyStateDescription: e.target.value })} rows={2} placeholder="Make informed decisions by comparing features, pricing, and ratings side-by-side" />
              </div>
              <div>
                <Label>Empty State Title</Label>
                <Input value={compareContent.emptyStateHeroTitle} onChange={(e) => setCompareContent({ ...compareContent, emptyStateHeroTitle: e.target.value })} placeholder="Select Tools to Compare" />
              </div>
              <div>
                <Label>Empty State Description</Label>
                <Textarea value={compareContent.emptyStateHeroDescription} onChange={(e) => setCompareContent({ ...compareContent, emptyStateHeroDescription: e.target.value })} rows={2} placeholder="Choose two AI tools from our directory to see a detailed side-by-side comparison" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Browse All Tools Button</Label>
                  <Input value={compareContent.browseAllToolsButton} onChange={(e) => setCompareContent({ ...compareContent, browseAllToolsButton: e.target.value })} placeholder="Browse All Tools" />
                </div>
                <div>
                  <Label>Browse Categories Button</Label>
                  <Input value={compareContent.browseCategoriesButton} onChange={(e) => setCompareContent({ ...compareContent, browseCategoriesButton: e.target.value })} placeholder="Browse Categories" />
                </div>
              </div>
              <div>
                <Label>Popular Comparisons Title</Label>
                <Input value={compareContent.popularComparisonsTitle} onChange={(e) => setCompareContent({ ...compareContent, popularComparisonsTitle: e.target.value })} placeholder="Popular Comparisons" />
              </div>
            </CardContent>
          </Card>

          {/* Navigation Section */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Back to Tools Button</Label>
                <Input value={compareContent.backToToolsButton} onChange={(e) => setCompareContent({ ...compareContent, backToToolsButton: e.target.value })} placeholder="Back to Tools" />
              </div>
              <div>
                <Label>Compare Different Tools Button</Label>
                <Input value={compareContent.compareDifferentToolsButton} onChange={(e) => setCompareContent({ ...compareContent, compareDifferentToolsButton: e.target.value })} placeholder="Compare Different Tools" />
              </div>
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Hero</CardTitle>
              <CardDescription>Content shown when tools are being compared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hero Title</Label>
                <Input value={compareContent.comparisonHeroTitle} onChange={(e) => setCompareContent({ ...compareContent, comparisonHeroTitle: e.target.value })} placeholder="Tool Comparison" />
              </div>
              <div>
                <Label>Hero Description</Label>
                <Textarea value={compareContent.comparisonHeroDescription} onChange={(e) => setCompareContent({ ...compareContent, comparisonHeroDescription: e.target.value })} rows={2} placeholder="Side-by-side comparison to help you make the right choice" />
              </div>
            </CardContent>
          </Card>

          {/* Section Titles */}
          <Card>
            <CardHeader>
              <CardTitle>Section Titles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Overview Section Title</Label>
                <Input value={compareContent.overviewSectionTitle} onChange={(e) => setCompareContent({ ...compareContent, overviewSectionTitle: e.target.value })} placeholder="Overview" />
              </div>
              <div>
                <Label>Key Features Section Title</Label>
                <Input value={compareContent.keyFeaturesSectionTitle} onChange={(e) => setCompareContent({ ...compareContent, keyFeaturesSectionTitle: e.target.value })} placeholder="Key Features" />
              </div>
              <div>
                <Label>Pros & Cons Section Title</Label>
                <Input value={compareContent.prosConsSectionTitle} onChange={(e) => setCompareContent({ ...compareContent, prosConsSectionTitle: e.target.value })} placeholder="Pros & Cons" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Action Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ready to Start Text</Label>
                <Input value={compareContent.readyToStartText} onChange={(e) => setCompareContent({ ...compareContent, readyToStartText: e.target.value })} placeholder="Ready to start?" />
              </div>
              <div>
                <Label>Visit Tool Button</Label>
                <Input value={compareContent.visitToolButton} onChange={(e) => setCompareContent({ ...compareContent, visitToolButton: e.target.value })} placeholder="Visit" />
                <p className="text-xs text-muted-foreground mt-1">Tool name will be appended automatically (e.g., &quot;Visit ChatGPT&quot;)</p>
              </div>
              <div>
                <Label>View Full Details Button</Label>
                <Input value={compareContent.viewFullDetailsButton} onChange={(e) => setCompareContent({ ...compareContent, viewFullDetailsButton: e.target.value })} placeholder="View Full Details" />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          <Card>
            <CardHeader>
              <CardTitle>Loading State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Loading Text</Label>
                <Input value={compareContent.loadingText} onChange={(e) => setCompareContent({ ...compareContent, loadingText: e.target.value })} placeholder="Loading comparison..." />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border">
            <Button onClick={() => saveContent("compare")} disabled={saving} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Compare Page Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
