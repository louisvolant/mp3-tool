# MP3 Audio Editor

## Description

MP3 Audio Editor is a web application built with Next.js that allows users to upload, trim, and enhance audio files. It provides an intuitive interface for visualizing waveforms, selecting specific timeframes, and applying various audio effects.

## Features

- Audio Upload: Upload MP3 files for editing.
- Waveform Visualization: Display and interact with audio waveforms.
- Audio Trimming: Select and trim specific sections of the audio.
- Volume Control: Adjust the volume of the audio.
- Fade Effects: Apply fade-in and fade-out effects.
- Bitrate Selection: Choose the bitrate for exporting audio files.
- Responsive Design: Works seamlessly on desktop and mobile devices.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- WaveSurfer.js (for waveform visualization)
- LameJS (for MP3 encoding)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/louisvolant/mp3-tool.git
   ```

2. Navigate to the project directory:
   ```bash
   cd mp3-tool
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- Upload an MP3 file by dragging and dropping it into the designated area or by clicking to browse.
- Use the waveform display to select the portion of the audio you want to trim.
- Adjust the volume, apply fade effects, and select the desired bitrate.
- Save the modified audio file by clicking the "Save Modified MP3" button.

## Building for Production

To create a production build, run:
```bash
npm run build
```

## Type Checking

Before pushing your changes, it's recommended to run type checking to catch any TypeScript errors:
```bash
npm run build
# then
npx tsc --noEmit
# or
node --no-warnings node_modules/.bin/tsc --noEmit
# or
npx --no-warnings tsc --noEmit
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- WaveSurfer.js
- LameJS
