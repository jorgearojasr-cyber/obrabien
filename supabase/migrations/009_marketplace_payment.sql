-- Add payment_status to marketplace_items for paid plan tracking
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'gratis';

-- Index for admin pending-payment query
CREATE INDEX IF NOT EXISTS marketplace_items_payment_status
  ON marketplace_items (payment_status, created_at DESC);
