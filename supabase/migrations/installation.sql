-- =============================================
-- RedCMS Installation
-- Version: 0.2.0 - Schema-based content system
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PAGE CONTENT (nouveau système schema-based)
-- =============================================
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  seo JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_content_slug ON page_content(page_slug);

-- =============================================
-- AUTHORS
-- =============================================
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  avatar VARCHAR(500),
  email VARCHAR(255),
  socials JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_authors_slug ON authors(slug);

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================
-- ARTICLES (Blog)
-- =============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  seo JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- =============================================
-- MEDIA
-- =============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- =============================================
-- SITE SETTINGS (Header, Footer, etc.)
-- =============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Page content
CREATE POLICY "page_content_select" ON page_content FOR SELECT USING (true);
CREATE POLICY "page_content_all" ON page_content FOR ALL USING (true);

-- Articles
CREATE POLICY "articles_select" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_all" ON articles FOR ALL USING (true);

-- Categories
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_all" ON categories FOR ALL USING (true);

-- Authors
CREATE POLICY "authors_select" ON authors FOR SELECT USING (true);
CREATE POLICY "authors_all" ON authors FOR ALL USING (true);

-- Media
CREATE POLICY "media_select" ON media FOR SELECT USING (true);
CREATE POLICY "media_all" ON media FOR ALL USING (true);

-- Site settings
CREATE POLICY "site_settings_select" ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_all" ON site_settings FOR ALL USING (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- INITIAL DATA (optional)
-- =============================================

-- Default header settings
INSERT INTO site_settings (key, value) VALUES 
('header', '{
  "logo": {"type": "text", "text": "RedCMS"},
  "navigation": [],
  "showCta": false,
  "ctaText": "Contact",
  "ctaLink": "/contact"
}'::jsonb),
('footer', '{
  "logo": {"type": "text", "text": "RedCMS"},
  "copyright": "© 2025 RedCMS. Tous droits réservés.",
  "columns": [],
  "socials": []
}'::jsonb);

-- Message de confirmation
SELECT 'RedCMS installation complete!' AS status;
