export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Generate inventory reports and analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Asset Summary Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Overview of all assets by category and status
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Generate Report
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Verification Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Asset verification history and compliance
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Generate Report
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Transfer History</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete history of asset transfers
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Generate Report
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Disposal Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Records of disposed assets
          </p>
          <button className="px-4 py-2 border rounded-md hover:bg-accent">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

