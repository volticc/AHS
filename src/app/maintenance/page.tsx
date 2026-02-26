import { Clock } from 'lucide-react'; // Assuming you'll add lucide-react for icons

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base text-center p-8">
      {/* You can replace this with the After Hours Studios logo */}
      <h1 className="text-5xl font-bold text-primary">Under Maintenance</h1>
      <p className="mt-4 text-lg text-secondary max-w-xl">
        We are currently performing scheduled maintenance to improve our platform. We'll be back online shortly.
      </p>
      <p className="mt-2 text-secondary">Thank you for your patience.</p>
    </div>
  );
}
