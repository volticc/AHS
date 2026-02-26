import Link from 'next/link';

async function getDevLog(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/devlogs/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dev log');
  }

  return res.json();
}

interface DevLog {
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default async function DevLogPage({ params }: { params: { id: string } }) {
  const log: DevLog = await getDevLog(params.id);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/devlogs" className="text-accent-red hover:underline mb-8 inline-block">← All Dev Logs</Link>
      <article>
        <h1 className="text-5xl font-black tracking-tighter text-primary">{log.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-secondary">
          <span>{new Date(log.createdAt).toLocaleDateString()}</span>
          <span className="font-semibold text-yellow-400">{log.category}</span>
        </div>
        <div className="prose prose-invert prose-lg mt-12 leading-relaxed whitespace-pre-wrap">
          {log.content}
        </div>
      </article>
    </div>
  );
}
