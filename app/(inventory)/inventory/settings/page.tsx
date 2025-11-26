export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage branches, ministries, and user permissions
        </p>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Church Branches</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage church branch information and locations
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Manage Branches
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Ministries</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add and manage ministries within your branch
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Manage Ministries
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">User Roles</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assign roles and permissions to users
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Manage Roles
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Asset Categories</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure asset categories and types
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  );
}

