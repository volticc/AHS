'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Tickets', href: '/admin/tickets' },
  { name: 'Projects', href: '/admin/projects' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Settings', href: '/admin/settings' },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-base-charcoal border-r border-white/10 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-accent-crimson mb-8">AHS Admin</h1>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={`block px-4 py-2 rounded-md text-secondary-text transition-colors duration-200 ${isActive
                    ? 'bg-accent-crimson/80 text-primary-text'
                    : 'hover:bg-white/10 hover:text-primary-text'
                  }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
