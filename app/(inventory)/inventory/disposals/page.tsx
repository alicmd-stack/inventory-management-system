export default function DisposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Asset Disposals</h2>
          <p className="text-muted-foreground">
            Handle asset disposal requests and approvals
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Request Disposal
        </button>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No disposal requests found. Click "Request Disposal" to initiate asset disposal.
        </p>
      </div>
    </div>
  );
}

