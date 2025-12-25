-- =============================================
-- Homepage Settings Table for CMS
-- =============================================

-- Create homepage_settings table
CREATE TABLE IF NOT EXISTS homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hero Section
  hero_title_line1 TEXT NOT NULL DEFAULT '探索前沿的',
  hero_title_line2 TEXT NOT NULL DEFAULT 'AI创作灵感',
  hero_subtitle TEXT NOT NULL DEFAULT 'SnapStudio 连接创作者与收藏家，让每一件数字艺术作品都能找到它的归属。公平分账，透明交易。',
  hero_button_primary_text TEXT NOT NULL DEFAULT '开始浏览',
  hero_button_primary_link TEXT NOT NULL DEFAULT '/browse',
  hero_button_secondary_text TEXT NOT NULL DEFAULT '成为创作者',
  hero_button_secondary_link TEXT NOT NULL DEFAULT '/register',
  
  -- CTA Section
  cta_title TEXT NOT NULL DEFAULT '准备好分享你的作品了吗？',
  cta_subtitle TEXT NOT NULL DEFAULT '加入 SnapStudio，与全球创作者一起，将你的数字艺术作品带给更多人。我们只收取 10% 的平台费用。',
  cta_button_text TEXT NOT NULL DEFAULT '立即注册',
  cta_button_link TEXT NOT NULL DEFAULT '/register',
  
  -- Section Titles
  section_top_rated_title TEXT NOT NULL DEFAULT '高分榜单',
  section_latest_title TEXT NOT NULL DEFAULT '最新上架',
  section_blog_title TEXT NOT NULL DEFAULT '最新动态',
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read homepage settings
CREATE POLICY "Anyone can read homepage settings"
  ON homepage_settings FOR SELECT
  USING (true);

-- Only admins can update homepage settings
CREATE POLICY "Admins can update homepage settings"
  ON homepage_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert homepage settings
CREATE POLICY "Admins can insert homepage settings"
  ON homepage_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default settings (only one row needed)
INSERT INTO homepage_settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_homepage_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS homepage_settings_timestamp ON homepage_settings;
CREATE TRIGGER homepage_settings_timestamp
  BEFORE UPDATE ON homepage_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_settings_timestamp();
