// src/app/Footer.tsx
"use client";

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { footerLinks } from './links';

export default function Footer() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Check localStorage first, then fall back to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

return (
    <footer className="bg-white dark:bg-gray-900 py-4 pb-[calc(1rem+var(--spacing-safe-bottom,0px))] mt-auto border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-mono">© {new Date().getFullYear()} LouisVolant.com. All rights reserved.</span>

        {footerLinks.map((link) => (
          <Fragment key={link.href}>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href={link.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {link.label}
            </Link>
          </Fragment>
        ))}

        <button
          onClick={toggleTheme}
          className="ml-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium border border-gray-200 dark:border-gray-700"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
        </button>
      </div>
    </footer>
  );
}