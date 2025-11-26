export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Asset Transfers</h2>
          <p className="text-muted-foreground">
            Manage asset transfers between ministries
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Request Transfer
        </button>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No transfer requests found. Click "Request Transfer" to initiate an asset transfer.
        </p>
      </div>
    </div>
  );
}

