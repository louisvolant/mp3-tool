// src/global.d.ts
interface Window {
  lamejs?: {
    Mp3Encoder: any; // Constructor function for Mp3Encoder
  };
  Mp3Encoder?: any; // Optional fallback (remove if not needed)
}