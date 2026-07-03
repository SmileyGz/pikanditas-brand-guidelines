-- ====================================================================================
-- PIKANDITAS MIGRATION: Update Constraints for Deleting Test Stores
-- Copy and paste this into your Supabase SQL Editor and hit "RUN"
-- ====================================================================================

-- 1. Drop existing constraints that block deletion
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_store_id_fkey;
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_seller_id_fkey;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_store_id_fkey;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_seller_id_fkey;

-- 2. Add them back with ON DELETE CASCADE
ALTER TABLE sales ADD CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE sales ADD CONSTRAINT sales_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE visits ADD CONSTRAINT visits_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE visits ADD CONSTRAINT visits_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
