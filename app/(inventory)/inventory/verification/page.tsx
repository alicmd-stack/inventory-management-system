export default function VerificationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Verification History</h2>
          <p className="text-muted-foreground">
            Track asset verification records and schedule new verifications
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Create Verification
        </button>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No verification records found. Click "Create Verification" to start tracking asset
          verifications.
        </p>
      </div>
    </div>
  );
}

