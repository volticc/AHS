import Link from 'next/link';

async function getDevLogs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/devlogs`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dev logs');
  }

  return res.json();
}

interface DevLog {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default async function DevLogsPage() {
  const devlogs: DevLog[] = await getDevLogs();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-5xl font-black tracking-tighter text-primary mb-12">Developer Logs</h1>
      <div className="space-y-12">
        {devlogs.map((log) => (
          <article key={log._id}>
            <h2 className="text-3xl font-bold text-primary hover:text-accent-red transition-colors">
              <Link href={`/devlogs/${log._id}`}>{log.title}</Link>
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-secondary">
              <span>{new Date(log.createdAt).toLocaleDateString()}</span>
              <span className="font-semibold text-yellow-400">{log.category}</span>
            </div>
            {/* This is a preview. We can truncate the content. */}
            <p className="text-secondary mt-4 leading-relaxed">
              {log.content.substring(0, 300)}...
            </p>
            <Link href={`/devlogs/${log._id}`} className="text-accent-red hover:underline mt-4 inline-block font-semibold">
              Read More →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
