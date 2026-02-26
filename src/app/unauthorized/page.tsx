export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-4 text-lg text-secondary">You do not have permission to view this page.</p>
    </div>
  );
}
