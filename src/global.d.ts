// src/global.d.ts
interface Window {
  lamejs?: {
    Mp3Encoder: new (channels: number, sampleRate: number, bitrate: number) => {
      encodeBuffer: (left: Int16Array, right?: Int16Array) => ArrayBuffer;
      flush: () => ArrayBuffer;
    };
  };
}