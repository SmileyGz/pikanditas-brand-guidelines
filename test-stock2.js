import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const [r1, r2, r3, r4, r5] = await Promise.all([
    supabase.from('production_logs').select('bags_yield'),
    supabase.from('consignments').select('stock_delivered'),
    supabase.from('sales_receipts').select('quantity'),
    supabase.from('online_orders').select('quantity').eq('payment_status', 'success'),
    supabase.from('profiles').select('mobile_inventory')
  ]);
  
  console.log("prod:", r1.error);
  console.log("cons:", r2.error);
  console.log("sales:", r3.error);
  console.log("online:", r4.error);
  console.log("prof:", r5.error);
}
check();
