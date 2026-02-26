export default function AdminDashboardPage() {
  // Placeholder data - we will fetch real data later
  const stats = [
    { name: 'Total Users', value: '0' },
    { name: 'Open Tickets', value: '0' },
    { name: 'Total Suggestions', value: '0' },
    { name: 'Projects', value: '0' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800/30 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-secondary">{stat.name}</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
        <div className="bg-gray-800/30 p-6 rounded-lg shadow-md">
          {/* Activity feed will go here */}
          <p className="text-secondary">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}
