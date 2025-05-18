// src/app/page.tsx
'use client';

import AudioEditor from '../components/AudioEditor';
import { useState, useEffect } from 'react';

export default function Home() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  return (
    <div className={theme}>
      <AudioEditor theme={theme} />
    </div>
  );
}