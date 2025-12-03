-- =====================================================
-- CREATE ADDITIONAL STORAGE BUCKETS
-- Run this in Supabase SQL Editor to create new buckets
-- =====================================================

-- Create site-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create content-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Optional: Create logos bucket (if you want separate bucket for logos)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('logos', 'logos', true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- BUCKET USAGE GUIDE
-- =====================================================

/*
site-assets bucket structure:
site-assets/
├── logos/
│   ├── header-logo.png
│   ├── footer-logo.png
│   └── favicon.ico
├── hero/
│   ├── hero-background.jpg
│   └── hero-overlay.png
├── sections/
│   ├── about-bg.jpg
│   └── features-bg.png
└── icons/
    ├── social-icons/
    └── ui-icons/

content-images bucket structure:
content-images/
├── testimonials/
│   ├── testimonial-1.jpg
│   └── testimonial-2.jpg
├── banners/
│   ├── promo-banner.jpg
│   └── seasonal-banner.png
└── general/
    ├── illustration-1.png
    └── graphic-1.jpg
*/

-- =====================================================
-- NOTE: After creating buckets, run storage_policies.sql
-- =====================================================
