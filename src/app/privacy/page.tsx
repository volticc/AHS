import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
      <p className="text-secondary mb-8">This page is under construction. The full Privacy Policy will be available here soon. <Link href="/" className="text-accent-red hover:underline">Go back home</Link>.</p>
    </div>
  );
}
