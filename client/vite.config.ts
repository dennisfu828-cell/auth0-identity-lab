import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // If 5173 is taken, fail instead of silently moving to 5174.
    // 5174 is not in Auth0's Allowed Callback URLs, so login would break.
    strictPort: true,
  },
});
