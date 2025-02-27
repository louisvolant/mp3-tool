// src/utils/audioProcessing.ts

  // Audio processing functions
export const processAudio = async (
  processType: string,
  audioFile: File,
  volume: number,
  fadeInDuration: number,
  fadeOutDuration: number,
  startTime: number,
  endTime: number
) => {
  if (!audioFile) return;

  const audioContext = new AudioContext();
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  let processedBuffer = audioBuffer;

  if (volume !== 0) {
    processedBuffer = await applyVolume(audioBuffer, volume);
  }

  if (processType === 'fadeIn' && fadeInDuration > 0) {
    processedBuffer = await applyFade(processedBuffer, true, fadeInDuration);
  } else if (processType === 'fadeOut' && fadeOutDuration > 0) {
    processedBuffer = await applyFade(processedBuffer, false, fadeOutDuration);
  }

  if (processType === 'trim' && startTime !== endTime) {
    processedBuffer = trimAudio(processedBuffer, startTime, endTime);
  }

  return processedBuffer;
};

export const applyVolume = async (buffer: AudioBuffer, volumePercentage: number) => {
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: buffer.numberOfChannels,
      length: buffer.length,
      sampleRate: buffer.sampleRate
    });

    const source = offlineCtx.createBufferSource();
    const gainNode = offlineCtx.createGain(); // Create gain node in the same context
    source.buffer = buffer;
    gainNode.gain.value = 1 + (volumePercentage / 100); // Convert -100% to +100% to gain (0 to 2)

    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    source.start();
    return await offlineCtx.startRendering();
  };

export const applyFade = async (buffer: AudioBuffer, isFadeIn: boolean, duration: number) => {
    const offlineCtx = new OfflineAudioContext({
      numberOfChannels: buffer.numberOfChannels,
      length: buffer.length,
      sampleRate: buffer.sampleRate
    });

    const source = offlineCtx.createBufferSource();
    const gain = offlineCtx.createGain();
    source.buffer = buffer;

    if (isFadeIn) {
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(1, duration);
    } else {
      gain.gain.setValueAtTime(1, 0);
      gain.gain.linearRampToValueAtTime(0, buffer.duration - duration);
    }

    source.connect(gain);
    gain.connect(offlineCtx.destination);
    source.start();
    return await offlineCtx.startRendering();
  };

export const trimAudio = (buffer: AudioBuffer, start: number, end: number) => {
  const clampedStart = Math.max(0, Math.min(start, buffer.duration));
  const clampedEnd = Math.max(clampedStart, Math.min(end, buffer.duration));
  const startSample = Math.floor(clampedStart * buffer.sampleRate);
  const endSample = Math.floor(clampedEnd * buffer.sampleRate);
  const frameCount = endSample - startSample;

  console.log('Trimming - start:', clampedStart, 'end:', clampedEnd, 'frameCount:', frameCount);

  if (frameCount <= 0) {
    console.warn('Invalid trim range, returning original buffer');
    return buffer; // Return original if no valid trim range
  }

  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    frameCount,
    buffer.sampleRate
  );

  const newBuffer = offlineCtx.createBuffer(
    buffer.numberOfChannels,
    frameCount,
    buffer.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const oldData = buffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      newData[i] = oldData[startSample + i];
    }
  }

  return newBuffer;
};