// src/components/audio/WaveformDisplay.tsx

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformDisplayProps {
  audioFile: File | null;
  setWaveform: (waveform: WaveSurfer | null) => void;
  setDuration: (duration: number) => void;
  setShowTimingMarkers: (show: boolean) => void;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  startTime: number;
  endTime: number;
  showTimingMarkers: boolean;
  clearRegions: React.MutableRefObject<() => void>;
  setIsTrimmed?: (isTrimmed: boolean) => void;
  theme: string; // 'light' or 'dark'
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audioFile,
  setWaveform,
  setDuration,
  setShowTimingMarkers,
  setStartTime,
  setEndTime,
  currentTime,
  setCurrentTime,
  duration,
  startTime,
  endTime,
  showTimingMarkers,
  clearRegions,
  setIsTrimmed,
  theme
}) => {
const waveformContainerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [startPos, setStartPos] = useState(0);
  const [endPos, setEndPos] = useState(1);

  // Constants for original positions
  const INITIAL_START_POS = 0;
  const INITIAL_END_POS = 1;

  const getCssVar = (name: string) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  useEffect(() => {
    if (!waveformContainerRef.current) return;

    // Create the instance
    const wavesurfer = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: getCssVar('--waveform-wave') || '#A8DBA8',
        progressColor: getCssVar('--waveform-progress') || '#3B8686',
        cursorColor: getCssVar('--waveform-cursor') || '#0B0C0C',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 96,
        fillParent: true,
      });

    wavesurferRef.current = wavesurfer;
    setWaveform(wavesurfer);

    // Event listeners
    const onReady = () => {
      const dur = wavesurfer.getDuration();
      setDuration(dur);
      setShowTimingMarkers(true);
      setEndPos(1);
      setEndTime(dur);
    };

    const onTimeUpdate = (time: number) => setCurrentTime(time);

    wavesurfer.on('ready', onReady);
    wavesurfer.on('timeupdate', onTimeUpdate);

    clearRegions.current = () => {
      setStartPos(0);
      setEndPos(1);
      setStartTime(0);
      if (wavesurferRef.current) {
        setEndTime(wavesurferRef.current.getDuration() || 0);
      }
      setIsTrimmed?.(false);
    };

    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      // We use a promise check or catch to ignore the AbortError during cleanup
      wavesurfer.load(url).catch((err) => {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted safely during component unmount');
        } else {
          console.error('WaveSurfer error:', err);
        }
      });

      return () => {
        URL.revokeObjectURL(url);
        // Important: Remove listeners before destroying
        wavesurfer.un('ready', onReady);
        wavesurfer.un('timeupdate', onTimeUpdate);
        wavesurfer.destroy();
        wavesurferRef.current = null;
        setWaveform(null);
      };
    }

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [audioFile, setDuration, setShowTimingMarkers, setCurrentTime, clearRegions, setStartTime, setEndTime, setWaveform, setIsTrimmed]);

  // Dynamic Theme Update
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setOptions({
        waveColor: getCssVar('--waveform-wave'),
        progressColor: getCssVar('--waveform-progress'),
        cursorColor: getCssVar('--waveform-cursor'),
      });
    }
  }, [theme]);

const handleDrag = (type: 'start' | 'end') => {
    const container = waveformContainerRef.current;
    if (!container || !duration) return;

    const rect = container.getBoundingClientRect();

    const moveHandler = (moveEvent: MouseEvent) => {
      const x = Math.max(rect.left, Math.min(rect.right, moveEvent.clientX));
      const pos = (x - rect.left) / rect.width;

      if (type === 'start') {
        const newStart = Math.min(pos, endPos - 0.01);
        setStartPos(newStart);
        setStartTime(newStart * duration);

        // English: Check if the markers moved from their initial full-track positions
        const hasMoved = newStart !== INITIAL_START_POS || endPos !== INITIAL_END_POS;
        setIsTrimmed?.(hasMoved);
      } else {
        const newEnd = Math.max(pos, startPos + 0.01);
        setEndPos(newEnd);
        setEndTime(newEnd * duration);

        // English: Check if the markers moved from their initial full-track positions
        const hasMoved = startPos !== INITIAL_START_POS || newEnd !== INITIAL_END_POS;
        setIsTrimmed?.(hasMoved);
      }
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative w-full pt-4">
      <div
        ref={waveformContainerRef}
        className="h-24 relative mb-4 rounded-lg bg-[var(--waveform-bg)] transition-all duration-300 ring-1 ring-gray-200 dark:ring-gray-700 shadow-inner"
      >
        {audioFile && (
          <>
            {/* Selection Overlay */}
            <div
              className="absolute top-0 bottom-0 bg-blue-500/15 backdrop-blur-[1px] z-5 transition-all"
              style={{
                left: `${startPos * 100}%`,
                width: `${(endPos - startPos) * 100}%`,
              }}
            />

            <div
              className="absolute top-0 bottom-0 w-4 cursor-ew-resize z-20 flex justify-center group/start"
              style={{ left: `calc(${startPos * 100}% - 8px)` }}
              onMouseDown={() => handleDrag('start')}
            >
              <div className="w-0.5 h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] group-hover/start:w-1 transition-all" />

              <div className="absolute -top-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-md transform hover:scale-125 transition-transform" />
            </div>

            {/* End Marker (Red) */}
            <div
              className="absolute top-0 bottom-0 w-4 cursor-ew-resize z-20 flex justify-center group/end"
              style={{ left: `calc(${endPos * 100}% - 8px)` }}
              onMouseDown={() => handleDrag('end')}
            >
              {/* The actual visual line */}
              <div className="w-0.5 h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] group-hover/end:w-1 transition-all" />

              {/* The handle dot */}
              <div className="absolute -top-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-md transform hover:scale-125 transition-transform" />
            </div>
          </>
        )}
      </div>

      {showTimingMarkers && (
        <div className="flex justify-between mt-4 text-xs font-mono text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-tighter text-green-600 dark:text-green-500">Start Trim</span>
            <span className="text-gray-900 dark:text-gray-100 font-bold">{formatTime(startTime)}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-tighter text-blue-500">Current</span>
            <span className="text-blue-600 dark:text-blue-400 font-black bg-blue-50 dark:bg-blue-900/30 px-2 rounded">{formatTime(currentTime)}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold uppercase tracking-tighter text-red-600 dark:text-red-500">End Trim</span>
            <span className="text-gray-900 dark:text-gray-100 font-bold">{formatTime(endTime)}</span>
          </div>
        </div>
      )}

    {/* Selection Duration Badge */}
      {audioFile && (
        <div className="mt-4 mb-8 text-center animate-in fade-in slide-in-from-top-1 duration-500">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 ring-1 ring-blue-200 dark:ring-blue-800/50 shadow-sm">
            {/* English label as requested */}
            Selected Duration: {formatTime(endTime - startTime)}
          </span>
        </div>
      )}
    </div>
  );
};

export default WaveformDisplay;