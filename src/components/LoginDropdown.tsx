'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const LoginDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-secondary-text hover:text-primary-text transition-colors duration-300"
      >
        Login
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-base-charcoal/80 backdrop-blur-sm border border-white/10 rounded-md shadow-lg">
          <ul className="py-1">
            <li>
              <Link href="/login/user">
                <span className="block px-4 py-2 text-secondary-text hover:bg-accent-crimson/50 hover:text-primary-text transition-colors duration-200 cursor-pointer">
                  User Login
                </span>
              </Link>
            </li>
            <li>
              <Link href="/login/admin">
                <span className="block px-4 py-2 text-secondary-text hover:bg-accent-crimson/50 hover:text-primary-text transition-colors duration-200 cursor-pointer">
                  Admin Login
                </span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoginDropdown;
