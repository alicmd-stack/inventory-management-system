export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Assets</h2>
          <p className="text-muted-foreground">Manage all fixed assets in your church branch</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Add New Asset
        </button>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No assets found. Click "Add New Asset" to create your first asset record.
        </p>
      </div>
    </div>
  );
}

