// src/components/audio/ExportPanels.tsx

import React from 'react';

interface ExportPanelsProps {
  isProcessing: boolean;
  onSave: () => void;
}

export const ExportPanels: React.FC<ExportPanelsProps> = ({ isProcessing, onSave }) => {
  return (
    <button
      onClick={onSave}
      disabled={isProcessing}
      className={`px-4 py-2 bg-purple-600 text-white rounded ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isProcessing ? 'Processing...' : 'Save Modified MP3'}
    </button>
  );
};

export default ExportPanels;
