'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Roles & Permissions', href: '/admin/roles' },
  { name: 'Tickets', href: '/admin/tickets' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Suggestions', href: '/admin/suggestions' },
  { name: 'Audit Log', href: '/admin/settings/audit-log' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900/50 p-4 space-y-4">
      <div className="text-center py-4">
        {/* Logo will go here */}
        <h1 className="text-xl font-bold text-primary">After Hours</h1>
        <p className="text-sm text-secondary">Admin Panel</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-accent-red text-white'
                : 'text-secondary hover:bg-gray-700/50 hover:text-primary'
            }`}>
            {/* Icon placeholder */}
            <span className="w-6 h-6 mr-3"></span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
