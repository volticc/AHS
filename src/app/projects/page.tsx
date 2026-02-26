import Link from 'next/link';

// This is a server component, so we can fetch data directly.
async function getProjects() {
  // In a real app, you'd want to use an absolute URL here, especially if the API is hosted separately.
  // For Vercel deployments, relative URLs can sometimes work if the API is part of the same deployment.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`, {
    cache: 'no-store', // Don't cache project data
  });

  if (!res.ok) {
    // This will be caught by the error boundary
    throw new Error('Failed to fetch projects');
  }

  return res.json();
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default async function ProjectsPage() {
  const projects: Project[] = await getProjects();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-5xl font-black tracking-tighter text-primary mb-12">Our Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project._id} className="bg-gray-800/30 p-6 rounded-lg shadow-lg hover:shadow-accent-red/20 transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-primary">{project.title}</h2>
            <p className="text-sm font-semibold text-yellow-400 mt-1">{project.status}</p>
            <p className="text-secondary mt-4">{project.description}</p>
            {/* You could add a link to a detailed project page here */}
            {/* <Link href={`/projects/${project._id}`} className="text-accent-red hover:underline mt-4 inline-block">View Details</Link> */}
          </div>
        ))}
      </div>
    </div>
  );
}
