// src/hooks/useWaveSurfer.ts

import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface UseWaveSurferOptions {
  container: HTMLElement | null;
  onReady?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onRegionCreated?: (start: number, end: number) => void;
  onRegionUpdated?: (start: number, end: number) => void;

  cursorWidth: number;
  height: number;
  responsive: boolean;
  hideScrollbar: boolean;
}

interface UseWaveSurferReturn {
  wavesurfer: WaveSurfer | null;
  isReady: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  regions: any;
  activeRegion: any;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  loadAudio: (file: File) => void;
  clearRegions: () => void;
}

export const useWaveSurfer = (options: UseWaveSurferOptions): UseWaveSurferReturn => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const regionsRef = useRef<any>(null);
  const activeRegionRef = useRef<any>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!options.container) return;

    const ws = WaveSurfer.create({
      container: options.container,
      waveColor: '#A8DBA8',
      progressColor: '#3B8686',
      cursorColor: '#0B0C0C',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 200
    });

    // Initialize regions plugin
    regionsRef.current = RegionsPlugin.create();
    ws.registerPlugin(regionsRef.current);

    // Set up event listeners
    ws.on('ready', () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      regionsRef.current.enableDragSelection({ color: 'rgba(0,255,0,0.3)' });
      if (options.onReady) options.onReady(ws.getDuration());
    });

    ws.on('play', () => {
      setIsPlaying(true);
      if (options.onPlay) options.onPlay();
    });

    ws.on('pause', () => {
      setIsPlaying(false);
      if (options.onPause) options.onPause();
    });

    ws.on('timeupdate', (time) => {
      setCurrentTime(time);
      if (options.onTimeUpdate) options.onTimeUpdate(time);
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [options.container]);

  // Load audio file
  const loadAudio = (file: File) => {
    if (!wavesurfer) return;

    const url = URL.createObjectURL(file);
    wavesurfer.load(url);
  };

  // Clear all regions
  const clearRegions = () => {
    if (!regionsRef.current) return;

    const regions = regionsRef.current.getRegions();
    regions.forEach((region: any) => region.remove());
    activeRegionRef.current = null;
  };

  return {
    wavesurfer,
    isReady,
    currentTime,
    duration,
    isPlaying,
    regions: regionsRef.current,
    activeRegion: activeRegionRef.current,
    play: () => wavesurfer?.play(),
    pause: () => wavesurfer?.pause(),
    stop: () => wavesurfer?.stop(),
    seek: (time: number) => wavesurfer?.seekTo(time / duration),
    loadAudio,
    clearRegions,
  };
};