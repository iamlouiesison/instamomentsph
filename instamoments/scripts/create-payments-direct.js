const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPaymentsTable() {
  console.log('🚀 Creating payments table...');

  try {
    // Create the payments table using raw SQL
    const { error } = await supabase
      .from('payments')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ payments table already exists');
      return;
    }

    // If we get here, the table doesn't exist, so we need to create it
    console.log('❌ payments table does not exist, but we cannot create it via Supabase client');
    console.log('Please create the payments table manually in Supabase dashboard or via SQL editor');
    console.log('SQL to create:');
    console.log(`
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'PHP' NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'paymaya', 'card', 'bank_transfer')),
  external_payment_id TEXT,
  payment_intent_id TEXT,
  client_secret TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT payments_amount_check CHECK (amount_cents > 0)
);

-- Create indexes
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_external_id ON payments(external_payment_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event hosts can view payments for their events" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = payments.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createPaymentsTable();
