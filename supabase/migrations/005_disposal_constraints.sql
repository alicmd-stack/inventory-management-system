-- =====================================================
-- DISPOSAL BUSINESS RULES - DATABASE CONSTRAINTS
-- =====================================================
-- Prevents disposal of already-disposed assets at the database level

-- 1. Add function to check if asset is active before disposal
CREATE OR REPLACE FUNCTION inventory.check_asset_active_for_disposal()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the asset being disposed is actually active
  IF EXISTS (
    SELECT 1 FROM inventory.asset 
    WHERE id = NEW.asset_id 
    AND asset_status != 'active'
  ) THEN
    RAISE EXCEPTION 'Cannot create disposal request for non-active asset (asset_id: %)', NEW.asset_id
      USING HINT = 'Only assets with status "active" can be disposed',
            ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS prevent_disposal_of_inactive_assets ON inventory.disposal_history;

CREATE TRIGGER prevent_disposal_of_inactive_assets
  BEFORE INSERT ON inventory.disposal_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_disposal();

-- 3. Add comment
COMMENT ON FUNCTION inventory.check_asset_active_for_disposal() IS 
  'Prevents disposal requests for assets that are not in active status';

-- =====================================================
-- TRANSFER BUSINESS RULES - DATABASE CONSTRAINTS  
-- =====================================================
-- Similarly, prevent transfers of disposed assets

-- 1. Add function to check if asset is active before transfer
CREATE OR REPLACE FUNCTION inventory.check_asset_active_for_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the asset being transferred is actually active
  IF EXISTS (
    SELECT 1 FROM inventory.asset 
    WHERE id = NEW.asset_id 
    AND asset_status != 'active'
  ) THEN
    RAISE EXCEPTION 'Cannot create transfer request for non-active asset (asset_id: %)', NEW.asset_id
      USING HINT = 'Only assets with status "active" can be transferred',
            ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS prevent_transfer_of_inactive_assets ON inventory.transfer_history;

CREATE TRIGGER prevent_transfer_of_inactive_assets
  BEFORE INSERT ON inventory.transfer_history
  FOR EACH ROW
  EXECUTE FUNCTION inventory.check_asset_active_for_transfer();

-- 3. Add comment
COMMENT ON FUNCTION inventory.check_asset_active_for_transfer() IS 
  'Prevents transfer requests for assets that are not in active status';

-- =====================================================
-- ASSET UPDATE PROTECTION - DATABASE CONSTRAINTS
-- =====================================================
-- Prevent editing of disposed assets

-- 1. Add function to prevent updates to disposed assets
CREATE OR REPLACE FUNCTION inventory.prevent_disposed_asset_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the asset being updated is disposed
  IF OLD.asset_status = 'disposed' AND NEW.asset_status = 'disposed' THEN
    RAISE EXCEPTION 'Cannot update disposed asset (asset_id: %, asset_tag: %)', OLD.id, OLD.asset_tag_number
      USING HINT = 'Disposed assets are read-only and cannot be modified',
            ERRCODE = 'check_violation';
  END IF;
  
  -- Allow status change from disposed to active (for recovery scenarios)
  -- But this should be rare and explicitly authorized
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS prevent_update_of_disposed_assets ON inventory.asset;

CREATE TRIGGER prevent_update_of_disposed_assets
  BEFORE UPDATE ON inventory.asset
  FOR EACH ROW
  EXECUTE FUNCTION inventory.prevent_disposed_asset_update();

-- 3. Add comment
COMMENT ON FUNCTION inventory.prevent_disposed_asset_update() IS 
  'Prevents updates to assets that are in disposed status (read-only)';

-- =====================================================
-- SUMMARY OF PROTECTIONS
-- =====================================================
-- 
-- 1. Cannot create disposal request for non-active assets
-- 2. Cannot create transfer request for non-active assets  
-- 3. Cannot update disposed assets (they are read-only)
-- 
-- These constraints work at the database level and cannot be bypassed
-- by UI manipulation or API calls.

