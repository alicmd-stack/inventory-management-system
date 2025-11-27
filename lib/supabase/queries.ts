import { createClient } from "./client";

/**
 * Helper functions to query tables from the inventory schema
 * Supabase REST API requires schema to be exposed or use RPC functions
 */

export async function getAssets() {
  const supabase = createClient();
  // Query from inventory schema
  const { data, error } = await supabase
    .schema("inventory")
    .from("asset")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getMinistries() {
  const supabase = createClient();
  const { data, error } = await supabase.from("ministry").select("*");
  return { data, error };
}

export async function getVerifications(limit = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema("inventory")
    .from("verification_history")
    .select("*, asset:asset_id(asset_tag_number)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function getPendingTransfers() {
  const supabase = createClient();
  // Count transfers that are not yet completed (transfer_date is null)
  // This includes both "Pending Approval" and "Approved" statuses
  const { data, error } = await supabase
    .schema("inventory")
    .from("transfer_history")
    .select("*")
    .is("transfer_date", null);
  return { data, error };
}

export async function getPendingDisposals() {
  const supabase = createClient();
  // Count disposals that are not yet completed (disposal_date is in the future or pending)
  // This includes both "Pending" and "Approved" disposals
  const { data, error } = await supabase
    .schema("inventory")
    .from("disposal_history")
    .select("*")
    .is("approved_by", null);
  return { data, error };
}

export async function getRecentTransfers(limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema("inventory")
    .from("transfer_history")
    .select("*, asset:asset_id(asset_tag_number)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function getRecentDisposals(limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema("inventory")
    .from("disposal_history")
    .select("*, asset:asset_id(asset_tag_number)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
}

