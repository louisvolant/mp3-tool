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
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <input
          type="range"
          min="-100"
          max="200"
          step="50"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="w-64 appearance-none bg-gray-200 h-2 rounded-full"
        />
        <div className="w-64 flex justify-between mt-2">
          <span>-100%</span>
          <span>0%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
        <div className="mt-2">
          <span>Volume: {volume}%</span>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center">
          <select
            value={fadeInDuration}
            onChange={(e) => onFadeInChange(Number(e.target.value))}
            className="px-2 py-1 border rounded"
          >
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                {t}s
              </option>
            ))}
          </select>
          <span>Fade In</span>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={fadeOutDuration}
            onChange={(e) => onFadeOutChange(Number(e.target.value))}
            className="px-2 py-1 border rounded"
          >
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>
                {t}s
              </option>
            ))}
          </select>
          <span>Fade Out</span>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <label>Bitrate:</label>
        <select
          value={bitrate}
          onChange={(e) => onBitrateChange(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          {['96', '128', '192', '256', '320'].map((b) => (
            <option key={b} value={b}>
              {b}kbps
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EffectPanels;
