// src/components/audio/EffectPanels.tsx

import React from 'react';

interface EffectPanelsProps {
  volume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  bitrate: string;
  onVolumeChange: (value: number) => void;
  onFadeInChange: (value: number) => void;
  onFadeOutChange: (value: number) => void;
  onBitrateChange: (value: string) => void;
}

export const EffectPanels: React.FC<EffectPanelsProps> = ({
  volume,
  fadeInDuration,
  fadeOutDuration,
  bitrate,
  onVolumeChange,
  onFadeInChange,
  onFadeOutChange,
  onBitrateChange,
}) => {
  // Shared classes for select inputs
  const selectClasses = `
    block w-full px-3 py-2 
    bg-white dark:bg-gray-800 
    border border-gray-300 dark:border-gray-700 
    rounded-md shadow-sm 
    focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent
    text-sm transition-colors
  `;

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      
      {/* Volume Control Section */}
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
          <span>Volume Intensity</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">{volume}%</span>
        </label>
        <input
          type="range"
          min="-100"
          max="200"
          step="10"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          /* Tailwind 4 'accent' utility handles the slider thumb color */
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
          <span>Mute</span>
          <span>Normal</span>
          <span>Double</span>
        </div>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Fade In Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Fade In</label>
          <select
            value={fadeInDuration}
            onChange={(e) => onFadeInChange(Number(e.target.value))}
            className={selectClasses}
          >
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>{t} seconds</option>
            ))}
          </select>
        </div>

        {/* Fade Out Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Fade Out</label>
          <select
            value={fadeOutDuration}
            onChange={(e) => onFadeOutChange(Number(e.target.value))}
            className={selectClasses}
          >
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>{t} seconds</option>
            ))}
          </select>
        </div>

        {/* Bitrate Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">MP3 Bitrate</label>
          <select
            value={bitrate}
            onChange={(e) => onBitrateChange(e.target.value)}
            className={selectClasses}
          >
            {['96', '128', '192', '256', '320'].map((b) => (
              <option key={b} value={b}>{b} kbps</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};

export default EffectPanels;