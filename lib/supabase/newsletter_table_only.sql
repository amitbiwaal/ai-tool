-- Newsletter Subscribers Table Fix
-- Run this in Supabase SQL Editor if newsletter subscription is failing

-- First, check if table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
        -- Create table if it doesn't exist
        CREATE TABLE public.newsletter_subscribers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'unsubscribed')),
          verification_token TEXT,
          verified_at TIMESTAMP WITH TIME ZONE,
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
        CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
        CREATE INDEX idx_newsletter_subscribers_verification_token ON public.newsletter_subscribers(verification_token);

        -- Enable RLS
        ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "newsletter_subscribers_select" ON public.newsletter_subscribers FOR SELECT USING (true);
        CREATE POLICY "newsletter_subscribers_insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
        CREATE POLICY "newsletter_subscribers_update" ON public.newsletter_subscribers FOR UPDATE USING (true);

        RAISE NOTICE 'Newsletter subscribers table created successfully';
    ELSE
        RAISE NOTICE 'Newsletter subscribers table already exists';
    END IF;
END $$;
