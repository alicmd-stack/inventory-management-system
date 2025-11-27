-- Make ministry_assigned nullable to support disposed assets
-- Disposed assets should have no ministry assignment

ALTER TABLE inventory.asset 
ALTER COLUMN ministry_assigned DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN inventory.asset.ministry_assigned IS 'Ministry currently using the asset. NULL when asset is disposed.';

