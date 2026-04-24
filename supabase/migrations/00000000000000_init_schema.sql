-- Supabase SQL Migration: Init Schema for 小红薯GEO (V3.0)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200),
  domain VARCHAR(200),
  keywords JSONB,
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. user_brands
CREATE TABLE IF NOT EXISTS user_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'OWNER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, brand_id)
);

-- 3. competitors
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  competitor_name VARCHAR(200),
  competitor_domain VARCHAR(200),
  keywords JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  xhs_user_id VARCHAR(64),
  nickname VARCHAR(200),
  avatar_url VARCHAR(500),
  followers_count INT,
  account_group VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id VARCHAR(64) UNIQUE NOT NULL,
  author_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  title VARCHAR(500),
  cover_url VARCHAR(500),
  published_at TIMESTAMPTZ,
  likes INT,
  collects INT,
  comments INT,
  first_cited_at TIMESTAMPTZ,
  total_citation_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. geo_metrics_daily
CREATE TABLE IF NOT EXISTS geo_metrics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  visibility FLOAT,
  citation_rate FLOAT,
  sentiment_score FLOAT,
  roi_index FLOAT,
  top3_rate FLOAT,
  cited_notes_count INT,
  cited_accounts_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, date)
);

-- 7. questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  question_text VARCHAR(500),
  question_type VARCHAR(20),
  priority VARCHAR(10),
  monitor_frequency VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ai_answers
CREATE TABLE IF NOT EXISTS ai_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  collected_at TIMESTAMPTZ,
  answer_text TEXT,
  citation_count INT,
  our_citation_count INT,
  top_position INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. citations
CREATE TABLE IF NOT EXISTS citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES ai_answers(id) ON DELETE CASCADE,
  note_id VARCHAR(64),
  citation_type VARCHAR(20),
  rank_position INT,
  brand_attribution VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  severity VARCHAR(10),
  title VARCHAR(500),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  priority VARCHAR(10),
  title VARCHAR(500),
  content TEXT,
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
