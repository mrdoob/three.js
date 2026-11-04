import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const angleBackend = { win32: 'd3d11', darwin: 'metal' }[ process.platform ];

// Ubuntu CI has no GPU; match the legacy runner's Mesa lavapipe setup the thumbnails were made with.
const linux = process.platform === 'linux';
const linuxArgs = [ '--enable-features=Vulkan', '--disable-vulkan-surface', '--ignore-gpu-blocklist', '--disable-gpu-driver-bug-workarounds', '--disable-gpu-watchdog' ];

export default defineConfig( {

	testDir: '.',
	testMatch: 'examples.spec.js',
	globalSetup: './setup.js',
	fullyParallel: true,
	workers: 1,
	retries: 2,
	timeout: 360000,
	outputDir: 'results',
	reporter: 'list',
	use: {
		browserName: 'chromium',
		channel: process.env.THREE_BROWSER_CHANNEL,
		headless: ! process.env.VISIBLE,
		viewport: { width: 800, height: 500 },
		baseURL: 'http://localhost:1234',
		launchOptions: {
			args: [ '--hide-scrollbars', '--enable-unsafe-webgpu', ...( angleBackend ? [ `--use-angle=${ angleBackend }` ] : [] ), ...( linux ? linuxArgs : [] ) ],
			env: linux ? { ...process.env, VK_DRIVER_FILES: '/usr/share/vulkan/icd.d/lvp_icd.x86_64.json' } : undefined
		},
		trace: 'off'
	},
	webServer: {
		command: 'node utils/server.js -p 1234',
		url: 'http://localhost:1234',
		reuseExistingServer: ! process.env.CI,
		cwd: fileURLToPath( new URL( '../../', import.meta.url ) )
	}

} );
