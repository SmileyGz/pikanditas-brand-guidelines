import pg from 'pg';
import fs from 'fs';

// Direct connection via pooler (port 6543)
const connectionString = 'postgresql://postgres.nggmaelmanlxdpattdid:Smileygonla1%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const sql = `
CREATE OR REPLACE FUNCTION process_store_visit(
  p_store_id UUID,
  p_seller_id UUID,
  p_visit_type TEXT,
  p_left_qty INT,
  p_sold_qty INT,
  p_restock_qty INT,
  p_cash_collected NUMERIC,
  p_seller_rating INT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'efectivo'
) RETURNS JSONB AS $$
DECLARE
  v_consignment_id UUID;
  v_sale_id UUID;
  v_result JSONB;
  v_payment_status TEXT;
BEGIN
  -- Determine payment status
  IF p_payment_method = 'mercado_pago_qr' THEN
    v_payment_status := 'pending';
  ELSE
    v_payment_status := 'paid';
  END IF;

  -- Insertar el registro de la visita general INCLUYENDO la calificación
  INSERT INTO visits (store_id, seller_id, visit_type, left_qty, sold_qty, restocked_qty, cash_collected, seller_rating, payment_method)
  VALUES (p_store_id, p_seller_id, p_visit_type, p_left_qty, p_sold_qty, p_restock_qty, p_cash_collected, p_seller_rating, p_payment_method);

  -- Actualizar la Agenda Global (CRM)
  UPDATE stores 
  SET 
    last_visit_date = NOW(),
    next_visit_date = NOW() + INTERVAL '7 days'
  WHERE id = p_store_id;

  IF p_visit_type = 'consignacion' THEN
    -- A) Lógica de Consignación
    IF p_sold_qty > 0 THEN
      INSERT INTO sales (store_id, seller_id, sale_type, quantity, unit_price, total_mxn, payment_method, payment_status, amount_collected)
      VALUES (p_store_id, p_seller_id, 'consignment_collection', p_sold_qty, p_cash_collected / p_sold_qty, p_cash_collected, p_payment_method, v_payment_status, p_cash_collected)
      RETURNING id INTO v_sale_id;
    END IF;

    UPDATE consignments 
    SET 
      delivered_qty = p_left_qty + p_restock_qty,
      last_review_date = NOW(),
      next_review_date = NOW() + INTERVAL '7 days'
    WHERE store_id = p_store_id AND status = 'active'
    RETURNING id INTO v_consignment_id;

    v_result := jsonb_build_object('status', 'success', 'consignment_updated', v_consignment_id, 'sale_id', v_sale_id);

  ELSIF p_visit_type = 'venta_directa' THEN
    -- B) Lógica de Venta Directa
    IF p_restock_qty > 0 THEN
      INSERT INTO sales (store_id, seller_id, sale_type, quantity, unit_price, total_mxn, payment_method, payment_status, amount_collected)
      VALUES (p_store_id, p_seller_id, 'b2b_12', p_restock_qty, p_cash_collected / p_restock_qty, p_cash_collected, p_payment_method, v_payment_status, p_cash_collected)
      RETURNING id INTO v_sale_id;
    END IF;

    v_result := jsonb_build_object('status', 'success', 'message', 'Venta y rotación registrada', 'sale_id', v_sale_id);

  ELSE
    RAISE EXCEPTION 'Tipo de visita inválido: %', p_visit_type;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
