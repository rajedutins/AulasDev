import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    timeout: 90000,
    workers: 1,
    use: {
        channel: 'msedge',
        headless: true,
        baseURL: 'http://127.0.0.1:4173',
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce'
    },
    webServer: {
        command: 'npm.cmd run dev -- --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI
    }
});
