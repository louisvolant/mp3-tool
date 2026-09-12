# MP3 Audio Editor

## Description

MP3 Audio Editor is a web application built with Next.js that allows users to upload, trim, and enhance audio files directly in the browser. It provides an intuitive interface for visualizing waveforms, selecting specific timeframes, and applying various audio effects.

## Features

- **Audio Upload**: Upload MP3 files for editing.
- **Waveform Visualization**: Display and interact with audio waveforms.
- **Audio Trimming**: Select and trim specific sections of the audio.
- **Volume Control**: Adjust the volume of the audio.
- **Fade Effects**: Apply fade-in and fade-out effects.
- **Bitrate Selection**: Choose the bitrate for exporting audio files.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Static & Edge-Ready**: Built for fast static delivery on Cloudflare.

## Technologies Used

- [Next.js](https://nextjs.org/) (Static HTML Export)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WaveSurfer.js](https://wavesurfer.xyz/) (waveform visualization)
- [LameJS](https://github.com/higuma/web-audio-recorder-js) (MP3 encoding)
- [Cloudflare Workers / Pages](https://developers.cloudflare.com/) & [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Getting Started

### Prerequisites

- Node.js (v20 or later, v24 recommended)
- npm (v10 or later)

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

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Upload an MP3 file by dragging and dropping it into the designated area or by clicking to browse.
- Use the waveform display to select the portion of the audio you want to trim.
- Adjust the volume, apply fade effects, and select the desired bitrate.
- Save the modified audio file by clicking the "Save Modified MP3" button.

## Building for Production

To create a static production build exported to the `out/` directory:

```bash
npm run build
```

## Cloudflare Deployment

This project is configured for seamless deployment to Cloudflare using Cloudflare Workers (Static Assets) or Cloudflare Pages.

### Wrangler Configuration (`wrangler.toml`)

The project includes a `wrangler.toml` file configured with:
- `keep_vars = true`: Prevents Wrangler deployments from overwriting or deleting environment variables defined in the Cloudflare Dashboard.
- `[assets]`: Points directly to `./out` with automatic trailing slash and 404 page routing.

### Deploying via Wrangler (Cloudflare Workers)

1. Authenticate with your Cloudflare account (if not already logged in):
   ```bash
   npx wrangler login
   ```

2. Preview locally using Wrangler:
   ```bash
   npm run preview
   ```

3. Build and deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

### Deploying to Cloudflare Pages

#### Option A: Via CLI
```bash
npm run deploy:pages
```

#### Option B: Via Cloudflare Dashboard (Git Integration)
1. Go to **Workers & Pages** in your Cloudflare dashboard.
2. Click **Create application** > **Pages** > **Connect to Git**.
3. Select this repository.
4. Set the build configuration:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. Click **Save and Deploy**.

## Type Checking & Linting

Before pushing your changes, run type checking and linting:

```bash
# Type check and build
npm run build

# Run ESLint
npm run lint

# TypeScript check without build
npx tsc --noEmit
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [WaveSurfer.js](https://wavesurfer.xyz/)
- [Cloudflare](https://developers.cloudflare.com/)
