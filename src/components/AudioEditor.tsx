// src/components/AudioEditor.tsx

import React, { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useWaveSurfer } from '../hooks/useWaveSurfer';
import { processAudio, applyVolume, applyFade, trimAudio } from '../utils/audioProcessing';
import { bufferToWav } from '../utils/fileUtils';
import { AudioControls } from './audio/AudioControls';
import { ExportPanels } from './audio/ExportPanels';
import { WaveformDisplay } from './audio/WaveformDisplay';
import { EffectPanels } from './audio/EffectPanels';

const AudioEditor = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [waveform, setWaveform] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [bitrate, setBitrate] = useState('128');
  const [fadeInDuration, setFadeInDuration] = useState(0);
  const [fadeOutDuration, setFadeOutDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [showTimingMarkers, setShowTimingMarkers] = useState(false);

  const clearRegionsRef = useRef<() => void>(() => {}); // Ref to hold the function

  const clearSelections = () => {
    clearRegionsRef.current(); // Call the function from WaveformDisplay
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : e.target.files?.[0];
    if (file && file.type === 'audio/mpeg') {
      setAudioFile(file);
    }
  };

// src/components/AudioEditor.tsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = '/lame.min.js';
  script.onload = () => {
    console.log('lamejs loaded');
  };
  script.onerror = () => {
    console.error('Failed to load lamejs');
  };
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);

const saveFile = async () => {
  setIsProcessing(true);
  try {
    if (!audioFile) throw new Error('No audio file');
    const processedBuffer = await processAudio(
      'trim',
      audioFile,
      volume,
      fadeInDuration,
      fadeOutDuration,
      startTime,
      endTime
    );
    if (!processedBuffer) throw new Error('Processed buffer is null');

    const sampleRate = processedBuffer.sampleRate;
    const numChannels = processedBuffer.numberOfChannels;
    const bitrateNum = parseInt(bitrate);
    if (!window.Mp3Encoder) {
      throw new Error('Mp3Encoder not available on window');
    }
    const mp3Encoder = new window.Mp3Encoder(numChannels, sampleRate, bitrateNum); // Directly on window
    const mp3Data: ArrayBuffer[] = [];

    const samplesLeft = processedBuffer.getChannelData(0);
    const samplesRight = numChannels > 1 ? processedBuffer.getChannelData(1) : samplesLeft;
    const intSamplesLeft = new Int16Array(samplesLeft.length);
    const intSamplesRight = new Int16Array(samplesRight.length);

    for (let i = 0; i < samplesLeft.length; i++) {
      intSamplesLeft[i] = Math.max(-32768, Math.min(32767, Math.round(samplesLeft[i] * 32767)));
      intSamplesRight[i] = Math.max(-32768, Math.min(32767, Math.round(samplesRight[i] * 32767)));
    }

    const bufferSize = 1152;
    for (let i = 0; i < intSamplesLeft.length; i += bufferSize) {
      const leftChunk = intSamplesLeft.subarray(i, i + bufferSize);
      const rightChunk = intSamplesRight.subarray(i, i + bufferSize);
      const mp3buf = numChannels === 1
        ? mp3Encoder.encodeBuffer(leftChunk)
        : mp3Encoder.encodeBuffer(leftChunk, rightChunk);
      console.log('MP3 buffer length:', mp3buf.length);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const ending = mp3Encoder.flush();
    if (ending.length > 0) mp3Data.push(ending);

    const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${audioFile.name.split('.')[0]}_modified.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('MP3 file saved successfully');
  } catch (error) {
    console.error('Error saving MP3:', error);
  } finally {
    setIsProcessing(false);
  }
};


const resetEditor = () => {
  setAudioFile(null);
  setVolume(0);
  setFadeInDuration(0);
  setFadeOutDuration(0);
  setBitrate('128');
  setCurrentTime(0);
  setStartTime(0);
  setEndTime(0);
  setShowTimingMarkers(false);
  waveform?.stop(); // Stop playback
  setWaveform(null);
  clearRegionsRef.current(); // Clear regions
};

  const previewFade = async (type: 'fadeIn' | 'fadeOut') => {
    const processedBuffer = await processAudio(type);
    if (processedBuffer && waveform) {
      const blob = new Blob([bufferToWav(processedBuffer)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      waveform.load(url);
    }
  };


    const handlePlayPause = () => {
      if (isPlaying) {
        waveform?.pause();
      } else {
        waveform?.play();
      }
      setIsPlaying(!isPlaying);
    };

    const handleStop = () => {
      if (isPlaying) {
        waveform?.stop();
      }
      setIsPlaying(false);
    };

useEffect(() => {
  console.log('AudioEditor - startTime:', startTime, 'endTime:', endTime);
}, [startTime, endTime]);

useEffect(() => {
  const script = document.createElement('script');
  script.src = '/lame.min.js';
  script.onload = () => {
    console.log('lamejs loaded');
    // Now window.Mp3Encoder should be available
  };
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);

  return (
    <div className="p-4 max-w-4xl mx-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Audio Editor</h1>
        {audioFile && (
          <button onClick={resetEditor} className="px-3 py-1 bg-red-600 text-white rounded">
            Reset
          </button>
        )}
      </div>

      {!audioFile && (
        <div
          className="border-2 border-dashed p-8 mb-4 text-center"
          onDrop={handleFileUpload}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="audio/mpeg"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            Drag & drop an MP3 file here or click to browse
          </label>
        </div>
      )}
    {audioFile && (
      <div className="text-center mb-2">{audioFile.name}</div> // Add filename
    )}
      <WaveformDisplay
        audioFile={audioFile}
        waveform={waveform}
        setWaveform={setWaveform}
        setDuration={setDuration}
        setShowTimingMarkers={setShowTimingMarkers}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        showTimingMarkers={showTimingMarkers}
        clearRegions={clearRegionsRef}
      />

    {audioFile && (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
              <AudioControls isPlaying={isPlaying} onPlayPause={handlePlayPause} onStop={handleStop} />
              <div className="flex gap-2">
                <button onClick={clearSelections} className="px-4 py-2 bg-gray-500 text-white rounded">
                  Clear Selection
                </button>
                <button
                  onClick={() => {
                    if (Math.abs(startTime - endTime) > 0.001) {
                      processAudio('trim', audioFile, volume, fadeInDuration, fadeOutDuration, startTime, endTime);
                    }
                  }}
                  className={`px-4 py-2 bg-blue-600 text-white rounded ${Math.abs(startTime - endTime) <= 0.001 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={Math.abs(startTime - endTime) <= 0.001}
                >
                  Trim Selection
                </button>
                {startTime !== endTime && (
                  <span className="text-sm">
                    Selection: {formatTime(startTime)} - {formatTime(endTime)}
                  </span>
                )}
              </div>
          </div>
          <EffectPanels
            volume={volume}
            fadeInDuration={fadeInDuration}
            fadeOutDuration={fadeOutDuration}
            bitrate={bitrate}
            onVolumeChange={setVolume}
            onFadeInChange={(value) => {
              setFadeInDuration(value);
              previewFade('fadeIn');
            }}
            onFadeOutChange={(value) => {
              setFadeOutDuration(value);
              previewFade('fadeOut');
            }}
            onBitrateChange={setBitrate}
          />
          <ExportPanels isProcessing={isProcessing} onSave={saveFile} />
        </div>
      )}
    </div>
  );
};

export default AudioEditor;
