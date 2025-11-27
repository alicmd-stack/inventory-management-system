-- Add fields to support disposal review workflow
-- This enables: Pending → Reviewed → Approved/Rejected flow

ALTER TABLE inventory.disposal_history 
ADD COLUMN IF NOT EXISTS reviewed_by uuid references auth.users(id) on delete set null,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_by uuid references auth.users(id) on delete set null,
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Add comment explaining the workflow
COMMENT ON TABLE inventory.disposal_history IS 'Asset disposal workflow: Pending → Reviewed → Approved/Rejected';
COMMENT ON COLUMN inventory.disposal_history.reviewed_by IS 'User who reviewed the disposal request';
COMMENT ON COLUMN inventory.disposal_history.approved_by IS 'User who approved the disposal';
COMMENT ON COLUMN inventory.disposal_history.rejected_by IS 'User who rejected the disposal';

