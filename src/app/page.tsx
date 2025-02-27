// src/app/page.tsx
'use client';

import AudioEditor from '../components/AudioEditor';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AudioEditor />
    </div>
  );
}