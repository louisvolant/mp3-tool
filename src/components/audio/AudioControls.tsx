// src/components/audio/AudioControls.tsx
import React from 'react';

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ isPlaying, onPlayPause, onStop }) => {
  return (
    <div className="flex gap-2 items-center">
      <button onClick={onPlayPause} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
        <span>{isPlaying ? '⏸️' : '▶️'}</span> {/* Pause: ⏸️, Play: ▶️ */}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
      <button onClick={onStop} className="px-4 py-2 bg-gray-600 text-white rounded flex items-center gap-2">
        <span>⏹️</span> {/* Stop: ⏹️ */}
        <span>Stop</span>
      </button>
    </div>
  );
};

export default AudioControls;
