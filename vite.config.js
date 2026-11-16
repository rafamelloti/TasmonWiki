import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' = the built site works from any folder or domain (HashRouter, no server rewrites needed)
export default defineConfig({ plugins: [react()], base: './' });
