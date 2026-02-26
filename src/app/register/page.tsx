import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-primary">Create an Account</h1>
      <p className="mt-4 text-lg text-secondary">Registration is coming soon. <Link href="/" className="text-accent-red hover:underline">Go back home</Link>.</p>
    </div>
  );
}
