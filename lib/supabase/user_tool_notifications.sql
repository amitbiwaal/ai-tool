-- =====================================================
-- USER TOOL INTERACTIONS & NOTIFICATIONS
-- Table to track user interactions with tools for personalized notifications
-- =====================================================

-- Create user_tool_interactions table
CREATE TABLE IF NOT EXISTS public.user_tool_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'review', 'visit')),
  last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per user-tool-interaction_type combination
  UNIQUE(user_id, tool_id, interaction_type)
);

-- Create user_notification_preferences table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_tool_updates BOOLEAN DEFAULT TRUE,
  email_favorite_updates BOOLEAN DEFAULT TRUE,
  email_visited_updates BOOLEAN DEFAULT FALSE,
  email_newsletter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_user_id ON public.user_tool_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_tool_id ON public.user_tool_interactions(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_type ON public.user_tool_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_last_interacted ON public.user_tool_interactions(last_interacted_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_tool_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can insert own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can update own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can delete own tool interactions" ON public.user_tool_interactions;

DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.user_notification_preferences;

-- Create RLS policies for user_tool_interactions
CREATE POLICY "user_tool_interactions_select" ON public.user_tool_interactions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_tool_interactions_insert" ON public.user_tool_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_tool_interactions_update" ON public.user_tool_interactions FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_tool_interactions_delete" ON public.user_tool_interactions FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- Create RLS policies for user_notification_preferences
CREATE POLICY "notification_preferences_select" ON public.user_notification_preferences FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notification_preferences_insert" ON public.user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update" ON public.user_notification_preferences FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Function to track tool interactions
CREATE OR REPLACE FUNCTION track_tool_interaction(
  p_user_id UUID,
  p_tool_id UUID,
  p_interaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_tool_interactions (
    user_id,
    tool_id,
    interaction_type,
    last_interacted_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_tool_id,
    p_interaction_type,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, tool_id, interaction_type)
  DO UPDATE SET
    last_interacted_at = NOW(),
    updated_at = NOW(),
    visit_count = CASE
      WHEN user_tool_interactions.interaction_type = 'view' OR user_tool_interactions.interaction_type = 'visit'
      THEN user_tool_interactions.visit_count + 1
      ELSE user_tool_interactions.visit_count
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users who should receive notifications for a tool update
CREATE OR REPLACE FUNCTION get_tool_notification_recipients(p_tool_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  notification_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Users who favorited the tool and want favorite notifications
  SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    'favorite'::TEXT as notification_reason
  FROM public.profiles p
  JOIN public.favorites f ON f.user_id = p.id
  LEFT JOIN public.user_notification_preferences unp ON unp.user_id = p.id
  WHERE f.tool_id = p_tool_id
    AND (unp.email_favorite_updates IS NULL OR unp.email_favorite_updates = TRUE)
    AND p.status = 'active'

  UNION

  -- Users who recently visited the tool (last 30 days) and want visit notifications
  SELECT
    p.id as user_id,
    p.email,
    p.full_name,
    'visited'::TEXT as notification_reason
  FROM public.profiles p
  JOIN public.user_tool_interactions uti ON uti.user_id = p.id
  LEFT JOIN public.user_notification_preferences unp ON unp.user_id = p.id
  WHERE uti.tool_id = p_tool_id
    AND uti.interaction_type IN ('view', 'visit')
    AND uti.last_interacted_at >= NOW() - INTERVAL '30 days'
    AND (unp.email_visited_updates IS NULL OR unp.email_visited_updates = TRUE)
    AND p.status = 'active'

  -- Exclude duplicates (users who both favorited and visited)
  GROUP BY p.id, p.email, p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize user notification preferences
CREATE OR REPLACE FUNCTION initialize_user_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notification_preferences (
    user_id,
    email_tool_updates,
    email_favorite_updates,
    email_visited_updates,
    email_newsletter
  ) VALUES (
    NEW.id,
    TRUE,  -- Default: receive tool updates
    TRUE,  -- Default: receive favorite updates
    FALSE, -- Default: don't receive visited updates
    TRUE   -- Default: receive newsletter
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create notification preferences for new users
DROP TRIGGER IF EXISTS initialize_user_notification_preferences_trigger ON public.profiles;
CREATE TRIGGER initialize_user_notification_preferences_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_notification_preferences();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_tool_interactions TO anon, authenticated;
GRANT ALL ON public.user_notification_preferences TO anon, authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION track_tool_interaction(UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tool_notification_recipients(UUID) TO anon, authenticated;
