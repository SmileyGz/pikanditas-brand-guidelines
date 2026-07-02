import pg from 'pg';
import fs from 'fs';

// Direct connection (port 5432) instead of pooler
const connectionString = 'postgresql://postgres:Smileygonla1%23@db.nggmaelmanlxdpattdid.supabase.co:5432/postgres';

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const sql = `
-- 1. Create the sales table for B2B direct and B2C
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  store_id UUID REFERENCES stores(id),
  sale_type TEXT NOT NULL CHECK (sale_type IN ('b2c_20', 'b2b_12', 'b2b_10', 'consignment_collection')),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_mxn NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'efectivo',
  payment_status TEXT DEFAULT 'paid',
  amount_collected NUMERIC(10,2) DEFAULT 0,
  amount_pending NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users can read sales" ON sales;
CREATE POLICY "Auth users can read sales" ON sales FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth users can insert sales" ON sales;
CREATE POLICY "Auth users can insert sales" ON sales FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Consignments updates
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE consignments RENAME COLUMN stock_delivered TO delivered_qty;
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END;
  BEGIN
    ALTER TABLE consignments RENAME COLUMN stock_remaining TO remaining_qty;
  EXCEPTION
    WHEN undefined_column THEN NULL;
  END;
END $$;

ALTER TABLE consignments ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS precio_tienda_mxn NUMERIC(10,2) DEFAULT 12.00;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS precio_sugerido_mxn NUMERIC(10,2) DEFAULT 20.00;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS amount_collected_mxn NUMERIC(10,2) DEFAULT 0;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS amount_pending_mxn NUMERIC(10,2) DEFAULT 0;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS revision_day_of_week TEXT;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS hoja_pdf_url TEXT;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS nota_venta_pdf_url TEXT;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS signer_name TEXT;

-- 3. Stores updates
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS giro TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS visit_day TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMPTZ;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS next_visit_date TIMESTAMPTZ;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 4. Visits updates
ALTER TABLE visits ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS bags_delivered INT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS amount_collected NUMERIC(10,2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS amount_pending NUMERIC(10,2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS next_visit_date DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS location JSONB;

-- 5. Agreements updates
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS signer_name TEXT;
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2);
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS quantity INT;
-- 6. Profiles updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seller_type TEXT DEFAULT 'inhouse';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile_inventory INT DEFAULT 0;
`;

async function run() {
  try {
    console.log("Connecting to Supabase (Direct)...");
    const client = await pool.connect();
    console.log("Connected! Running migration...");
    await client.query(sql);
    console.log("Migration successful!");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
