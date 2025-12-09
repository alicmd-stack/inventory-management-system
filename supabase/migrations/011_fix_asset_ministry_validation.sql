-- Fix the ministry validation function to handle both user_profile.ministry_id and asset.ministry_assigned
-- 
-- The issue: validate_ministry_active() was checking new.ministry_id, but assets use ministry_assigned
-- This was causing "record 'new' has no field 'ministry_id'" error

-- Drop the existing triggers first (before dropping the function they depend on)
drop trigger if exists validate_asset_ministry_active on inventory.asset;
drop trigger if exists validate_user_profile_ministry_active on public.user_profile;

-- Now we can safely drop the function
drop function if exists public.validate_ministry_active();

-- Create separate validation functions for clarity

-- Function to validate ministry for user_profile (uses ministry_id)
create or replace function public.validate_user_profile_ministry_active()
returns trigger as $$
begin
  if new.ministry_id is not null and not exists (
    select 1 from public.ministry
    where id = new.ministry_id and is_active = true
  ) then
    raise exception 'Cannot assign to inactive ministry';
  end if;
  return new;
end;
$$ language plpgsql;

-- Function to validate ministry for assets (uses ministry_assigned)
create or replace function public.validate_asset_ministry_active()
returns trigger as $$
begin
  if new.ministry_assigned is not null and not exists (
    select 1 from public.ministry
    where id = new.ministry_assigned and is_active = true
  ) then
    raise exception 'Cannot assign asset to inactive ministry';
  end if;
  return new;
end;
$$ language plpgsql;

-- Update the trigger for user_profile to use the specific function
drop trigger if exists validate_user_profile_ministry_active on public.user_profile;
create trigger validate_user_profile_ministry_active
  before insert or update on public.user_profile
  for each row
  when (new.ministry_id is not null)
  execute function public.validate_user_profile_ministry_active();

-- Recreate the trigger for assets to use the specific function
create trigger validate_asset_ministry_active
  before insert or update on inventory.asset
  for each row
  when (new.ministry_assigned is not null)
  execute function public.validate_asset_ministry_active();

-- Add comment explaining the fix
comment on function public.validate_user_profile_ministry_active() is 'Validates that ministry_id references an active ministry for user_profile table';
comment on function public.validate_asset_ministry_active() is 'Validates that ministry_assigned references an active ministry for asset table';

