// src/components/AudioEditor.tsx

import React, { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { processAudio } from '../utils/audioProcessing';
import { bufferToWav } from '../utils/fileUtils';
import { AudioControls } from './audio/AudioControls';
import { ExportPanels } from './audio/ExportPanels';
import { WaveformDisplay } from './audio/WaveformDisplay';
import { EffectPanels } from './audio/EffectPanels';

interface AudioEditorProps {
  theme: string;
}

const AudioEditor: React.FC<AudioEditorProps> = ({ theme }) => {
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
  const [isTrimmed, setIsTrimmed] = useState(false); // New state to track trim changes


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const clearRegionsRef = useRef<() => void>(() => {});

  const clearSelections = () => {
    clearRegionsRef.current();
    setIsTrimmed(false); // Reset trim status
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const file = 'dataTransfer' in e ? e.dataTransfer.files[0] : e.target.files?.[0];
    if (file && file.type === 'audio/mpeg') {
      setAudioFile(file);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lamejs@1.2.1/lame.min.js';
    script.onload = () => {
      console.log('lamejs loaded', window.lamejs, window.lamejs?.Mp3Encoder);
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

      // Determine if effects should be applied
      const applyTrim = isTrimmed && startTime !== endTime;
      const applyFadeIn = fadeInDuration > 0;
      const applyFadeOut = fadeOutDuration > 0;
      const makeVolumeChange = volume !== 0;

      const processedBuffer = await processAudio(
        audioFile,
        applyTrim,
        makeVolumeChange,
        volume,
        applyFadeIn,
        fadeInDuration,
        applyFadeOut,
        fadeOutDuration,
        startTime,
        endTime
      );
      if (!processedBuffer) throw new Error('Processed buffer is null');

      const sampleRate = processedBuffer.sampleRate;
      const numChannels = processedBuffer.numberOfChannels;
      const bitrateNum = parseInt(bitrate);
      if (!window.lamejs || !window.lamejs.Mp3Encoder) {
        throw new Error('Mp3Encoder not available on window.lamejs');
      }
      const mp3Encoder = new window.lamejs.Mp3Encoder(numChannels, sampleRate, bitrateNum);
      const mp3Data: ArrayBuffer[] = [];

      const samplesLeft = processedBuffer.getChannelData(0);
      const samplesRight = numChannels > 1 ? processedBuffer.getChannelData(1) : samplesLeft;
      const intSamplesLeft = new Int16Array(samplesLeft.length);
      const intSamplesRight = new Int16Array(samplesRight.length);

      for (let i = 0; i < samplesLeft.length; i++) {
        intSamplesLeft[i] = Math.max(-32768, Math.min(32767, Math.round(samplesLeft[i] * 32767)));
        intSamplesRight[i] = Math.max(-32768, Math.min(32767, Math.round(samplesRight[i] * 32767)));
      }

      // Encode in async batches to avoid blocking the main thread (which causes
      // "page unresponsive" warnings on large files). Each batch encodes
      // CHUNKS_PER_TICK lame frames then yields back to the event loop via
      // a zero-delay setTimeout before processing the next batch.
      const bufferSize = 1152;
      const CHUNKS_PER_TICK = 100; // ~115 200 samples per tick
      const totalChunks = Math.ceil(intSamplesLeft.length / bufferSize);

      await new Promise<void>((resolve) => {
        let chunkIndex = 0;

        const processBatch = () => {
          const end = Math.min(chunkIndex + CHUNKS_PER_TICK, totalChunks);
          for (; chunkIndex < end; chunkIndex++) {
            const i = chunkIndex * bufferSize;
            const leftChunk = intSamplesLeft.subarray(i, i + bufferSize);
            const rightChunk = intSamplesRight.subarray(i, i + bufferSize);
            const mp3buf =
              numChannels === 1
                ? mp3Encoder.encodeBuffer(leftChunk)
                : mp3Encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.byteLength > 0) mp3Data.push(mp3buf);
          }

          if (chunkIndex < totalChunks) {
            // Yield to browser, then continue with the next batch
            setTimeout(processBatch, 0);
          } else {
            resolve();
          }
        };

        processBatch();
      });

      const ending = mp3Encoder.flush();
      if (ending.byteLength > 0) mp3Data.push(ending);

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
    setIsTrimmed(false);
    waveform?.destroy();
    setWaveform(null);
    clearRegionsRef.current();
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
    if (waveform) {
      waveform.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Audio Editor</h1>
        {audioFile && (
          <button onClick={resetEditor} className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer">
            Reset
          </button>
        )}
      </div>

    {/* Drag & Drop Area */}
    {!audioFile && (
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 mb-4 text-center rounded-2xl bg-gray-100/40 dark:bg-gray-800/20 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 group"
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
        <label htmlFor="audio-upload" className="cursor-pointer block">
          <div className="space-y-2">
            {/* Using text-gray-900 for maximum readability in Light Mode */}
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Drag & drop an MP3 file here
            </span>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">
              or click to browse your computer
            </p>
          </div>
        </label>
      </div>
    )}

    {/* Display the audio file name if exists */}
    { audioFile && (
      <div className="text-center mb-2">{audioFile.name}</div>
    )}

    {/* Only render the WaveformDisplay if an audio file is present */}
    { audioFile && (
      <WaveformDisplay
        theme={theme}
        audioFile={audioFile}
        setWaveform={setWaveform}
        setDuration={setDuration}
        setShowTimingMarkers={setShowTimingMarkers}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        startTime={startTime}
        endTime={endTime}
        showTimingMarkers={showTimingMarkers}
        clearRegions={clearRegionsRef}
        setIsTrimmed={setIsTrimmed}
      />
    )}

      {audioFile && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
            />
            <div className="flex gap-2 items-center">
              <button
                onClick={clearSelections}
                className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={async () => {
                  if (Math.abs(startTime - endTime) > 0.001 && audioFile) {
                    const processedBuffer = await processAudio(
                      audioFile,
                      true,
                      false,
                      volume,
                      false,
                      fadeInDuration,
                      false,
                      fadeOutDuration,
                      startTime,
                      endTime
                    );
                    if (processedBuffer && waveform) {
                      const blob = new Blob([bufferToWav(processedBuffer)], {
                        type: 'audio/wav',
                      });
                      const url = URL.createObjectURL(blob);
                      waveform.load(url);
                    }
                  }
                }}
                className={`px-4 py-2 bg-blue-600 text-white rounded ${
                  Math.abs(startTime - endTime) <= 0.001 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={Math.abs(startTime - endTime) <= 0.001}
              >
                Preview Trim
              </button>
              {startTime !== endTime && (
                <span className="text-sm">
                  Selection: {formatTime(startTime)} - {formatTime(endTime)}
                </span>
              )}
            </div>
          </div>
          {/* Fade/volume effects are applied at export time — no live preview to avoid
              blocking the UI or corrupting the waveform state */}
          <EffectPanels
            volume={volume}
            fadeInDuration={fadeInDuration}
            fadeOutDuration={fadeOutDuration}
            bitrate={bitrate}
            onVolumeChange={setVolume}
            onFadeInChange={setFadeInDuration}
            onFadeOutChange={setFadeOutDuration}
            onBitrateChange={setBitrate}
          />
          <ExportPanels isProcessing={isProcessing} onSave={saveFile} />
        </div>
      )}
    </div>
  );
};

export default AudioEditor;