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
  showTimingMarkers: boolean;
  clearRegions: React.MutableRefObject<() => void>;
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
  showTimingMarkers,
  clearRegions,
}) => {
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [startPos, setStartPos] = useState(0);
  const [endPos, setEndPos] = useState(1);

  useEffect(() => {
    if (!waveformContainerRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const wavesurfer = WaveSurfer.create({
      container: waveformContainerRef.current,
      waveColor: '#A8DBA8',
      progressColor: '#3B8686',
      cursorColor: '#0B0C0C',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 100,
      fillParent: true,
    });

    wavesurfer.on('ready', () => {
      console.log('WaveSurfer ready');
      setDuration(wavesurfer.getDuration());
      setShowTimingMarkers(true);
      setEndPos(1);
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
    });

    wavesurferRef.current = wavesurfer;
    setWaveform(wavesurfer);

    clearRegions.current = () => {
      setStartPos(0);
      setEndPos(1);
      setStartTime(0);
      setEndTime(wavesurfer.getDuration() || 0);
    };

    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      wavesurfer.load(url);
      return () => URL.revokeObjectURL(url);
    }

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
      setWaveform(null);
    };
  }, [audioFile, setWaveform, setDuration, setShowTimingMarkers, setCurrentTime, clearRegions, setStartTime, setEndTime]);

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
      } else {
        const newEnd = Math.max(pos, startPos + 0.01);
        setEndPos(newEnd);
        setEndTime(newEnd * duration);
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
  <div className="relative w-full">
    <div ref={waveformContainerRef} className="mb-4 h-24 bg-gray-50 rounded-lg relative">
      {audioFile && (
        <>
          {/* Start Control Bar */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-green-500 cursor-ew-resize flex items-center justify-center z-10 rounded-md shadow-md hover:bg-green-600 transition-colors"
            style={{ left: `${startPos * 100}%` }}
            onMouseDown={() => handleDrag('start')}
          >
            <div className="w-4 h-full absolute" style={{ left: '-8px' }} />
          </div>
          {/* End Control Bar */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-red-500 cursor-ew-resize flex items-center justify-center z-10 rounded-md shadow-md hover:bg-red-600 transition-colors"
            style={{ left: `${endPos * 100}%` }}
            onMouseDown={() => handleDrag('end')}
          >
            <div className="w-4 h-full absolute" style={{ left: '-8px' }} />
          </div>
          {/* Progress Bar */}
          <div
            className="absolute top-0 bottom-0 bg-blue-300 opacity-50 z-5 rounded-md"
            style={{
              left: `${startPos * 100}%`,
              width: `${(endPos - startPos) * 100}%`,
            }}
          />
        </>
      )}
    </div>
    {showTimingMarkers && (
      <div className="flex justify-between mt-1 text-sm text-gray-600">
        <div>{formatTime(0)}</div>
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>
    )}
  </div>
);
};

export default WaveformDisplay;

