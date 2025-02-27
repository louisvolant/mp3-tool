// src/components/audio/WaveformDisplay.tsx
import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';

interface WaveformDisplayProps {
  audioFile: File | null;
  waveform: WaveSurfer | null;
  setWaveform: (waveform: WaveSurfer | null) => void;
  setDuration: (duration: number) => void;
  setShowTimingMarkers: (show: boolean) => void;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  showTimingMarkers: boolean;
  clearRegions: () => void;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audioFile,
  waveform,
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
  const regionsPluginRef = useRef<any>(null); // Store RegionsPlugin instance

  // Initialize WaveSurfer and RegionsPlugin
  useEffect(() => {
    console.log('WaveformDisplay useEffect - initialization');
    if (!waveformContainerRef.current) {
      console.error('Waveform container not found in DOM');
      return;
    }

    if (wavesurferRef.current) {
      console.log('WaveSurfer instance already exists, skipping creation');
      return;
    }

    console.log('Creating WaveSurfer instance');
    console.log('Container:', waveformContainerRef.current);

    const wavesurfer = WaveSurfer.create({
      container: waveformContainerRef.current,
        waveColor: '#A8DBA8',
        progressColor: '#3B8686',
        cursorColor: '#0B0C0C',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        responsive: true,
        hideScrollbar: false,
        fillParent: true
    });

  const regions = wavesurfer.registerPlugin(RegionsPlugin.create());
  regionsPluginRef.current = regions;

  console.log('RegionsPlugin registered:', regions); // Confirm plugin instance

  regions.enableDragSelection({ color: 'rgba(0,255,0,0.3)' }); // Enable immediately
  console.log('Drag selection enabled on init');

  wavesurfer.on('ready', () => {
    console.log('WaveSurfer ready');
    setDuration(wavesurfer.getDuration());
    setShowTimingMarkers(true);
    console.log('Regions drag selection active:', regions.isDraggingEnabled); // Debug
  });

  wavesurfer.on('region-created', (region) => {
    console.log('Region created:', region.start, region.end);
    regions.getRegions().forEach((r: any) => {
      if (r.id !== region.id) r.remove(); // Ensure only one region
    });
    setStartTime(region.start); // Sync with AudioEditor
    setEndTime(region.end);     // Sync with AudioEditor
  });

  wavesurfer.on('region-update-end', (region) => {
    console.log('Region updated:', region.start, region.end);
    setStartTime(region.start); // Sync with AudioEditor
    setEndTime(region.end);     // Sync with AudioEditor
  });

    wavesurfer.on('interaction', () => {
      console.log('User interacted with waveform'); // Log any interaction
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time); // Update currentTime during playback
    });

    wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
    });

    wavesurferRef.current = wavesurfer;
    setWaveform(wavesurfer);

  // Expose clearRegions to parent
  clearRegions.current = () => {
    if (regionsPluginRef.current) {
      console.log('Regions cleared');
      const regions = regionsPluginRef.current.getRegions();
      console.log('RegionList to clear:', JSON.stringify(regions));
      regions.forEach((region: any) => {
        console.log('Region to clear:', JSON.stringify(region));
        region.remove();
      });
      setStartTime(0);
      setEndTime(0);
      console.log('Regions cleared');
    }
  };

    return () => {
      console.log('Cleaning up WaveSurfer');
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
        regionsPluginRef.current = null; // Clear plugin ref
        setWaveform(null);
      }
    };
  }, [setWaveform, setDuration, setShowTimingMarkers, setStartTime, setEndTime]);

  // Load audio file
  useEffect(() => {
    console.log('WaveformDisplay useEffect - audio file load', audioFile);
    if (audioFile && wavesurferRef.current) {
      const url = URL.createObjectURL(audioFile);
      console.log('Loading audio:', url);
      wavesurferRef.current.load(url);

      wavesurferRef.current.on('ready', () => {
        console.log('Audio loaded and waveform rendered');
      });

      wavesurferRef.current.on('error', (error) => {
        console.error('Audio load error:', error);
      });

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  // Clear regions when no audio file
  useEffect(() => {
    if (!audioFile && wavesurferRef.current && regionsPluginRef.current) {
      const regions = regionsPluginRef.current.getRegions();
      regions.forEach((region: any) => region.remove());
      setShowTimingMarkers(false);
      console.log('Cleared regions due to no audio file');
    }
  }, [audioFile, setShowTimingMarkers]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
       <div className="relative mb-8 w-full">
          <div ref={waveformContainerRef} className="mb-4 h-24 bg-gray-50 rounded-lg"></div>
          {showTimingMarkers && (
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <div>{formatTime(0)}</div>
              <div>{formatTime(currentTime)}</div>
              <div>{formatTime(duration)}</div>
            </div>
          )}
          <button onClick={() => regionsPluginRef.current?.addRegion({ start: 10, end: 20, color: 'rgba(0,255,0,0.3)' })}>
            Add Test Region
          </button>
        </div>
  );
};

export default WaveformDisplay;