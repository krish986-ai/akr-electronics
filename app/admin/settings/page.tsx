'use client';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Store Settings</h2>
            <p className="text-gray-600">
              Store configuration options coming in Phase 2
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Email Templates</h2>
            <p className="text-gray-600">
              Email template management coming in Phase 2
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Tax Settings</h2>
            <p className="text-gray-600">
              Tax configuration coming in Phase 2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
