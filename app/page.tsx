export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          ALIC Inventory Management System
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Fixed Asset Inventory Management for Church Branches
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Assets</h2>
            <p className="text-sm text-muted-foreground">
              Manage church branch assets and inventory
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Verification</h2>
            <p className="text-sm text-muted-foreground">
              Track asset verification history
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Transfers</h2>
            <p className="text-sm text-muted-foreground">
              Manage asset transfers between ministries
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

