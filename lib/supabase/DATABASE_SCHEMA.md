# Complete Database Schema Documentation

## Overview
This document describes all database tables in the AI Tools Directory website. All tables are separate (alg alg tables) as per requirement.

## Total Tables: 25

---

## 1. USER MANAGEMENT TABLES (2 tables)

### `profiles`
User profiles extending Supabase auth.users
- **Columns**: id, email, full_name, avatar_url, role, bio, website, created_at, updated_at
- **Purpose**: Stores user profile information
- **Relationships**: Referenced by tools, reviews, favorites, blog_posts, etc.

### `user_sessions`
User session tracking
- **Columns**: id, user_id, session_token, ip_address, user_agent, expires_at, created_at
- **Purpose**: Tracks user sessions for analytics and security
- **Relationships**: References profiles

---

## 2. CATEGORY & TAG MANAGEMENT TABLES (2 tables)

### `categories`
Tool and blog categories
- **Columns**: id, name, slug, description, icon, color, parent_id, tools_count, created_at, updated_at
- **Purpose**: Organizes tools and blog posts into categories
- **Relationships**: Self-referencing (parent_id), referenced by tools and blog_posts

### `tags`
Tags for tools and blog posts
- **Columns**: id, name, slug, created_at
- **Purpose**: Flexible tagging system for tools and blog posts
- **Relationships**: Many-to-many with tools and blog_posts

---

## 3. TOOLS MANAGEMENT TABLES (4 tables)

### `tools`
Main AI tools directory
- **Columns**: id, name, slug, tagline, description, long_description, logo_url, cover_image_url, website_url, pricing_type, pricing_details, features, pros, cons, screenshots, video_url, rating_avg, rating_count, views_count, favorites_count, status, is_featured, is_trending, listing_type, submitted_by, approved_by, approved_at, created_at, updated_at
- **Purpose**: Core table storing all AI tool information
- **Relationships**: Referenced by tool_categories, tool_tags, reviews, favorites, submissions, payments

### `tool_categories`
Junction table for tools and categories (Many-to-Many)
- **Columns**: tool_id, category_id
- **Purpose**: Links tools to multiple categories
- **Relationships**: References tools and categories

### `tool_tags`
Junction table for tools and tags (Many-to-Many)
- **Columns**: tool_id, tag_id
- **Purpose**: Links tools to multiple tags
- **Relationships**: References tools and tags

### `tool_views`
Detailed tool view tracking for analytics
- **Columns**: id, tool_id, user_id, ip_address, user_agent, viewed_at
- **Purpose**: Tracks individual tool views for analytics
- **Relationships**: References tools and profiles

---

## 4. REVIEWS & RATINGS TABLES (2 tables)

### `reviews`
User reviews for tools
- **Columns**: id, tool_id, user_id, rating, title, comment, pros, cons, helpful_count, status, created_at, updated_at
- **Purpose**: Stores user reviews and ratings for tools
- **Relationships**: References tools and profiles

### `review_helpful`
Helpful votes on reviews
- **Columns**: id, review_id, user_id, created_at
- **Purpose**: Tracks which users found reviews helpful
- **Relationships**: References reviews and profiles

---

## 5. USER INTERACTIONS TABLES (1 table)

### `favorites`
User favorite tools
- **Columns**: id, user_id, tool_id, created_at
- **Purpose**: Stores user's favorite tools
- **Relationships**: References profiles and tools

---

## 6. SUBMISSIONS & PAYMENTS TABLES (2 tables)

### `submissions`
Tool submission tracking
- **Columns**: id, tool_id, submitted_by, status, reviewer_notes, reviewed_by, reviewed_at, created_at
- **Purpose**: Tracks tool submission workflow
- **Relationships**: References tools and profiles

### `payments`
Payment records for paid tool listings
- **Columns**: id, tool_id, user_id, amount, currency, payment_method, payment_provider, payment_provider_id, payment_status, transaction_id, listing_type, metadata, created_at, updated_at
- **Purpose**: Stores payment information for paid tool listings
- **Relationships**: References tools and profiles

---

## 7. BLOG MANAGEMENT TABLES (5 tables)

### `blog_posts`
Blog articles
- **Columns**: id, title, slug, excerpt, content, cover_image, author_id, category_id, status, views_count, likes_count, comments_count, reading_time, published_at, created_at, updated_at
- **Purpose**: Stores blog posts/articles
- **Relationships**: References profiles and categories

### `blog_tags`
Junction table for blog posts and tags (Many-to-Many)
- **Columns**: blog_id, tag_id
- **Purpose**: Links blog posts to multiple tags
- **Relationships**: References blog_posts and tags

### `blog_comments`
Comments on blog posts
- **Columns**: id, blog_id, user_id, parent_id, content, likes_count, status, created_at, updated_at
- **Purpose**: Stores comments on blog posts (supports nested replies via parent_id)
- **Relationships**: References blog_posts, profiles, and self (parent_id)

### `blog_likes`
Likes on blog posts
- **Columns**: id, blog_id, user_id, created_at
- **Purpose**: Tracks which users liked blog posts
- **Relationships**: References blog_posts and profiles

### `blog_views`
Detailed blog view tracking for analytics
- **Columns**: id, blog_id, user_id, ip_address, user_agent, viewed_at
- **Purpose**: Tracks individual blog post views for analytics
- **Relationships**: References blog_posts and profiles

---

## 8. CONTENT MANAGEMENT TABLES (1 table)

### `frontend_content`
Dynamic frontend content management
- **Columns**: id, page, section, key, value, description, updated_by, created_at, updated_at
- **Purpose**: Stores editable content for homepage, about, contact, blog, categories, submit pages
- **Relationships**: References profiles (updated_by)

---

## 9. COMMUNICATION TABLES (2 tables)

### `newsletter_subscribers`
Newsletter subscription management
- **Columns**: id, email, subscribed_at, status, verification_token, verified_at, unsubscribed_at, created_at
- **Purpose**: Manages newsletter subscriptions with verification
- **Relationships**: None (standalone)

### `contact_messages`
Contact form submissions
- **Columns**: id, name, email, subject, message, reason, status, replied_by, replied_at, created_at
- **Purpose**: Stores contact form submissions
- **Relationships**: References profiles (replied_by)

---

## 10. NOTIFICATIONS TABLE (1 table)

### `notifications`
User notifications
- **Columns**: id, user_id, type, title, message, link, read, created_at
- **Purpose**: Stores notifications for users (tool approvals, review approvals, etc.)
- **Relationships**: References profiles

---

## Key Features

### Indexes
- All foreign keys are indexed
- Search fields have full-text search indexes (using pg_trgm)
- Frequently queried columns have indexes (status, created_at, etc.)

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies ensure:
  - Public data is viewable by everyone
  - Users can only modify their own data
  - Admins have elevated permissions

### Triggers
- **updated_at**: Automatically updates timestamp on row updates
- **update_tool_rating**: Recalculates tool rating when reviews change
- **update_category_tools_count**: Updates category tool count
- **update_tool_favorites_count**: Updates tool favorites count
- **update_review_helpful_count**: Updates review helpful count
- **update_blog_comments_count**: Updates blog comments count
- **update_blog_likes_count**: Updates blog likes count
- **update_blog_views_count**: Updates blog views count
- **update_tool_views_count**: Updates tool views count

---

## Table Relationships Summary

```
profiles (1) ──< tools
profiles (1) ──< reviews
profiles (1) ──< favorites
profiles (1) ──< blog_posts
profiles (1) ──< blog_comments
profiles (1) ──< payments
profiles (1) ──< notifications

categories (1) ──< tools (via tool_categories)
categories (1) ──< blog_posts
categories (1) ──< categories (parent_id)

tags (1) ──< tools (via tool_tags)
tags (1) ──< blog_posts (via blog_tags)

tools (1) ──< tool_categories
tools (1) ──< tool_tags
tools (1) ──< reviews
tools (1) ──< favorites
tools (1) ──< submissions
tools (1) ──< payments
tools (1) ──< tool_views

blog_posts (1) ──< blog_tags
blog_posts (1) ──< blog_comments
blog_posts (1) ──< blog_likes
blog_posts (1) ──< blog_views

reviews (1) ──< review_helpful
```

---

## Usage Instructions

1. **Run the schema**: Execute `lib/supabase/complete_schema.sql` in your Supabase SQL editor
2. **Verify tables**: Check that all 25 tables are created
3. **Check RLS**: Ensure Row Level Security is enabled on all tables
4. **Test triggers**: Insert/update data to verify triggers work correctly
5. **Set up storage**: Create Supabase Storage buckets for:
   - `tool-images` (for tool logos and cover images)
   - `blog-images` (for blog post images)
   - `user-avatars` (for user profile pictures)

---

## Notes

- All tables use UUID primary keys
- Timestamps use `TIMESTAMP WITH TIME ZONE`
- JSONB columns are used for flexible data (pricing_details, features, pros, cons, screenshots, metadata)
- Unique constraints prevent duplicate entries where needed
- Cascade deletes maintain referential integrity
- All text search uses PostgreSQL's trigram extension (pg_trgm) for better performance

