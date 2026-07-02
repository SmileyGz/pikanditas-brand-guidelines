-- Script para habilitar el sistema de calificaciones "Spice Meter"

-- 1. Agregar las columnas de calificación a la tabla de visitas
ALTER TABLE visits ADD COLUMN IF NOT EXISTS seller_rating INT CHECK (seller_rating >= 1 AND seller_rating <= 5);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS store_rating INT CHECK (store_rating >= 1 AND store_rating <= 5);

-- 2. Actualizar la función RPC para recibir la calificación del vendedor (p_seller_rating)
CREATE OR REPLACE FUNCTION process_store_visit(
  p_store_id UUID,
  p_seller_id UUID,
  p_visit_type TEXT,
  p_left_qty INT,
  p_sold_qty INT,
  p_restock_qty INT,
  p_cash_collected NUMERIC,
  p_seller_rating INT DEFAULT NULL -- Nuevo parámetro opcional
) RETURNS JSONB AS $$
DECLARE
  v_consignment_id UUID;
  v_sale_type TEXT;
  v_result JSONB;
BEGIN
  -- Insertar el registro de la visita general INCLUYENDO la calificación
  INSERT INTO visits (store_id, seller_id, visit_type, left_qty, sold_qty, restocked_qty, cash_collected, seller_rating)
  VALUES (p_store_id, p_seller_id, p_visit_type, p_left_qty, p_sold_qty, p_restock_qty, p_cash_collected, p_seller_rating);

  -- Actualizar la Agenda Global (CRM)
  UPDATE stores 
  SET 
    last_visit_date = NOW(),
    next_visit_date = NOW() + INTERVAL '7 days'
  WHERE id = p_store_id;

  IF p_visit_type = 'consignacion' THEN
    -- A) Lógica de Consignación
    IF p_sold_qty > 0 THEN
      INSERT INTO sales_receipts (store_id, seller_id, sale_type, quantity, total_mxn, payment_status)
      VALUES (p_store_id, p_seller_id, 'consignacion_corte', p_sold_qty, p_cash_collected, 'paid');
    END IF;

    UPDATE consignments 
    SET 
      delivered_qty = p_left_qty + p_restock_qty,
      last_review_date = NOW(),
      next_review_date = NOW() + INTERVAL '7 days'
    WHERE store_id = p_store_id AND status = 'active'
    RETURNING id INTO v_consignment_id;

    v_result := jsonb_build_object('status', 'success', 'consignment_updated', v_consignment_id);

  ELSIF p_visit_type = 'venta_directa' THEN
    -- B) Lógica de Venta Directa
    IF p_restock_qty > 0 THEN
      INSERT INTO sales_receipts (store_id, seller_id, sale_type, quantity, total_mxn, payment_status)
      VALUES (p_store_id, p_seller_id, 'compra_directa_corte', p_restock_qty, p_cash_collected, 'paid');
    END IF;

    v_result := jsonb_build_object('status', 'success', 'message', 'Venta y rotación registrada');

  ELSE
    RAISE EXCEPTION 'Tipo de visita inválido: %', p_visit_type;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
