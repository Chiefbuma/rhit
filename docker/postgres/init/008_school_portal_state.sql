CREATE TABLE IF NOT EXISTS portal_state_store (
  state_key TEXT PRIMARY KEY,
  state_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO portal_state_store (state_key, state_data)
VALUES ('school_portal', '{}'::jsonb)
ON CONFLICT (state_key) DO NOTHING;
