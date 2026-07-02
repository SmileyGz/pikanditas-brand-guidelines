-- Script para inicializar la tabla de ventas y la función de cortes

-- 1. Tabla de Recibos de Venta (si no existe)
CREATE TABLE IF NOT EXISTS sales_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sale_type TEXT NOT NULL, /* consignacion_corte, compra_directa_12, compra_directa_10 */
  quantity INT NOT NULL,
  total_mxn NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'efectivo',
  payment_status TEXT DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS para sales_receipts
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users can read sales" ON sales_receipts;
DROP POLICY IF EXISTS "Sellers can insert sales" ON sales_receipts;
CREATE POLICY "Auth users can read sales" ON sales_receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sellers can insert sales" ON sales_receipts FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Añadir columnas a visits para un mejor reporte
ALTER TABLE visits ADD COLUMN IF NOT EXISTS left_qty INT DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS sold_qty INT DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS restocked_qty INT DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS cash_collected NUMERIC DEFAULT 0;

-- 4. Función RPC Atómica para procesar el corte
CREATE OR REPLACE FUNCTION process_store_visit(
  p_store_id UUID,
  p_seller_id UUID,
  p_visit_type TEXT, -- 'consignacion' o 'venta_directa'
  p_left_qty INT,
  p_sold_qty INT,
  p_restock_qty INT,
  p_cash_collected NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_consignment_id UUID;
  v_sale_type TEXT;
  v_result JSONB;
BEGIN
  -- Insertar el registro de la visita general
  INSERT INTO visits (store_id, seller_id, visit_type, left_qty, sold_qty, restocked_qty, cash_collected)
  VALUES (p_store_id, p_seller_id, p_visit_type, p_left_qty, p_sold_qty, p_restock_qty, p_cash_collected);

  IF p_visit_type = 'consignacion' THEN
    -- A) Lógica de Consignación
    
    -- Si se vendió algo, crear un recibo de venta
    IF p_sold_qty > 0 THEN
      INSERT INTO sales_receipts (store_id, seller_id, sale_type, quantity, total_mxn, payment_status)
      VALUES (p_store_id, p_seller_id, 'consignacion_corte', p_sold_qty, p_cash_collected, 'paid');
    END IF;

    -- Actualizar la cuenta corriente de la tienda
    UPDATE consignments 
    SET 
      delivered_qty = p_left_qty + p_restock_qty,
      last_review_date = NOW(),
      next_review_date = NOW() + INTERVAL '7 days'
    WHERE store_id = p_store_id AND status = 'active'
    RETURNING id INTO v_consignment_id;

    v_result := jsonb_build_object('status', 'success', 'consignment_updated', v_consignment_id);

  ELSIF p_visit_type = 'venta_directa' THEN
    -- B) Lógica de Venta Directa (Rotación + Resurtido)
    
    -- En Venta Directa, el p_sold_qty es 0 para nuestro inventario (porque ya eran suyas), 
    -- pero el p_restock_qty es la NUEVA venta que el cliente nos está comprando.
    IF p_restock_qty > 0 THEN
      -- Determinar el precio basado en la tienda (asumimos $12 por defecto o extraemos de agreements)
      -- Para hacerlo simple, confiamos en el p_cash_collected calculado por la app basado en su tier.
      
      INSERT INTO sales_receipts (store_id, seller_id, sale_type, quantity, total_mxn, payment_status)
      VALUES (p_store_id, p_seller_id, 'compra_directa_corte', p_restock_qty, p_cash_collected, 'paid');
    END IF;

    -- Las ventas directas no usan la tabla consignments, así que solo registramos la venta y visita.
    v_result := jsonb_build_object('status', 'success', 'message', 'Venta y rotación registrada');

  ELSE
    RAISE EXCEPTION 'Tipo de visita inválido: %', p_visit_type;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
