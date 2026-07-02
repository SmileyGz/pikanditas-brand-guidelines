import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: prod } = await supabase.from('production_logs').select('bags_yield');
  const { data: cons } = await supabase.from('consignments').select('stock_delivered');
  const { data: sales } = await supabase.from('sales_receipts').select('quantity');
  const { data: online } = await supabase.from('online_orders').select('quantity').eq('payment_status', 'success');
  const { data: prof } = await supabase.from('profiles').select('mobile_inventory');

  const totalProduced = (prod || []).reduce((sum, log) => sum + (log.bags_yield || 0), 0);
  const totalConsigned = (cons || []).reduce((sum, c) => sum + (c.stock_delivered || 0), 0);
  const totalSalesB2B = (sales || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalSalesOnline = (online || []).reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalInhouse = (prof || []).reduce((sum, p) => sum + (p.mobile_inventory || 0), 0);

  console.log({ totalProduced, totalConsigned, totalSalesB2B, totalSalesOnline, totalInhouse });
}
check();
