import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function InventoryPage() {
  const supabase = await createClient();

  // Get user profile to show branch info
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  let churchBranch = null;

  if (user) {
    const { data: profile } = await supabase
      .from("user_profile")
      .select("*, church_branch:church_branch_id(*)")
      .eq("id", user.id)
      .single();

    userProfile = profile;
    churchBranch = profile?.church_branch;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome to Inventory Management</h2>
        {churchBranch && (
          <p className="text-muted-foreground">
            Managing assets for <span className="font-medium">{churchBranch.name}</span>
            {churchBranch.location && ` - ${churchBranch.location}`}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Assets</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">-</p>
          <p className="text-xs text-muted-foreground mt-1">In use</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Verification</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">-</p>
          <p className="text-xs text-muted-foreground mt-1">Needs review</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-xs text-muted-foreground mt-1">Acquisition cost</p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/inventory/assets"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Assets</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all fixed assets in your church branch
          </p>
        </Link>

        <Link
          href="/inventory/verification"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Verification</h3>
          <p className="text-sm text-muted-foreground">
            Track asset verification history and schedule new verifications
          </p>
        </Link>

        <Link
          href="/inventory/transfers"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Transfers</h3>
          <p className="text-sm text-muted-foreground">
            Manage asset transfers between ministries
          </p>
        </Link>

        <Link
          href="/inventory/disposals"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Disposals</h3>
          <p className="text-sm text-muted-foreground">
            Handle asset disposal requests and approvals
          </p>
        </Link>

        <Link
          href="/inventory/reports"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate inventory reports and analytics
          </p>
        </Link>

        <Link
          href="/inventory/settings"
          className="group border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage branches, ministries, and user permissions
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          No recent activity to display. Asset activities will appear here once you start managing
          your inventory.
        </p>
      </div>
    </div>
  );
}

