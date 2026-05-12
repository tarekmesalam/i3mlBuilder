import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        // Increase chunk size warning limit (default is 500 kB)
        chunkSizeWarningLimit: 700,
        rollupOptions: {
            output: {
                // Use a function-based manualChunks so we can precisely
                // exclude helper packages (e.g. react-remove-scroll) that
                // are imported by both React internals and Radix UI —
                // bundling them into a single 'react-vendor' chunk created
                // a circular import between react-vendor and radix-ui and
                // produced a blank white page on first load.
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (
                        id.includes('@monaco-editor/react') ||
                        id.includes('/monaco-editor/')
                    ) {
                        return 'monaco-editor';
                    }

                    // Strict react-vendor matcher: only the core React
                    // packages, NOT helpers like react-remove-scroll,
                    // react-style-singleton, use-sidecar, etc.
                    if (
                        /node_modules\/(react|react-dom|scheduler)\//.test(id)
                    ) {
                        return 'react-vendor';
                    }

                    return undefined;
                },
            },
        },
    },
});
