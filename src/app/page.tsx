import clientPromise from '@/lib/mongodb';

async function getHomepageContent() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const content = await db.collection('site_content').findOne({ _id: 'homepage_content' });

    if (!content) {
      return { headline: '[HEADLINE]', subtext: '[Your content here. Edit in the admin panel.]' };
    }
    return { headline: content.headline, subtext: content.subtext };
  } catch (error) {
    console.error('Failed to fetch homepage content:', error);
    return { headline: 'Error', subtext: 'Could not load content.' };
  }
}

export default async function HomePage() {
  const { headline, subtext } = await getHomepageContent();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 text-center">
      <div className="relative">
        <div className="absolute -inset-2 bg-crimson-gradient rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            {headline}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-secondary-text max-w-2xl mx-auto">
            {subtext}
          </p>
        </div>
      </div>
    </main>
  );
}
