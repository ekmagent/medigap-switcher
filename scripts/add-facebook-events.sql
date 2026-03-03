-- Facebook CAPI events audit log
-- Run against Neon DB: psql $DATABASE_URL -f scripts/add-facebook-events.sql

CREATE TABLE IF NOT EXISTS facebook_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_id VARCHAR(255),
  event_time BIGINT,
  event_source_url TEXT,
  action_source VARCHAR(50) DEFAULT 'website',
  user_email_hash VARCHAR(64),
  user_phone_hash VARCHAR(64),
  user_fbp VARCHAR(255),
  user_fbc VARCHAR(255),
  user_ip VARCHAR(45),
  user_agent TEXT,
  event_value DECIMAL(10,2),
  event_currency VARCHAR(10),
  content_name VARCHAR(255),
  content_category VARCHAR(255),
  custom_data JSONB,
  full_payload JSONB,
  fb_response_status INTEGER,
  fb_response_body JSONB,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  lead_id VARCHAR(255),
  application_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facebook_events_event_name ON facebook_events(event_name);
CREATE INDEX IF NOT EXISTS idx_facebook_events_lead_id ON facebook_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_facebook_events_created_at ON facebook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_facebook_events_success ON facebook_events(success);
