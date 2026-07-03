import pg from 'pg';
const connectionString = 'postgresql://postgres:Smileygonla1%23@db.nggmaelmanlxdpattdid.supabase.co:5432/postgres';
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const sql = `
-- Drop existing constraints if any (we don't know the exact names, so we'll have to find and drop them, or just add CASCADE by dropping the FK and recreating it)
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_store_id_fkey;
ALTER TABLE sales ADD CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_seller_id_fkey;
ALTER TABLE sales ADD CONSTRAINT sales_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_store_id_fkey;
ALTER TABLE visits ADD CONSTRAINT visits_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_seller_id_fkey;
ALTER TABLE visits ADD CONSTRAINT visits_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
`;

async function run() {
  try {
    const client = await pool.connect();
    await client.query(sql);
    console.log("Constraints updated!");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}
run();
