import type { CapacitorConfig } from '@capacitor/cli';

// Live-reload (dev only): set CAP_SERVER_URL to load the app from the Vite dev
// server instead of the bundled dist/, so frontend edits hot-reload in the
// simulator with no rebuild+copy. The iOS Simulator shares the host loopback,
// so http://localhost:5173 reaches `pnpm dev`. Leave CAP_SERVER_URL unset for
// bundled builds — NEVER set it for a production/release archive.
const liveReloadUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.mammacare.app',
  appName: 'MammaCare',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    ...(liveReloadUrl ? { url: liveReloadUrl, cleartext: true } : {}),
  },
};

export default config;
