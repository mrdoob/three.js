import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const source = file => fileURLToPath( new URL( `./src/${ file }`, import.meta.url ) );
const browserTests = [
	'test/unit/src/loaders/ImageBitmapLoader.tests.js',
	'test/unit/src/loaders/ImageLoader.tests.js'
];
const addonsBrowserTests = [
	'test/unit/addons/loaders/GLTFLoader.tests.js',
	'test/unit/addons/loaders/USDLoader.tests.js',
	'test/unit/addons/loaders/FBXLoader.tests.js',
	'test/unit/addons/loaders/MaterialXLoader.tests.js',
	'test/unit/addons/postprocessing/GTAOPass.tests.js'
];
const alias = {
	'three/tsl': source( 'Three.TSL.js' ),
	'three/webgpu': source( 'Three.WebGPU.js' ),
	three: source( 'Three.js' )
};
const setupFiles = [ './test/unit/utils/console-wrapper.js' ];
const gpuTests = [
	'test/unit/src/nodes/tsl/!(TSLCore).tests.js',
	'test/unit/src/nodes/lighting/EnvironmentNode.tests.js'
];
const maxWorkers = Math.max( 1, Math.floor( availableParallelism() * 0.75 ) );
// Preserve the former unit runner's Vulkan/lavapipe setup on Ubuntu.
const linux = process.platform === 'linux';
const linuxArgs = [ '--hide-scrollbars', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--disable-vulkan-surface', '--ignore-gpu-blocklist', '--disable-gpu-driver-bug-workarounds', '--no-sandbox' ];
const provider = playwright( { launchOptions: {
	// Use full Chromium, as Puppeteer did, rather than Playwright's headless shell.
	channel: linux ? 'chromium' : undefined,
	args: linux ? linuxArgs : process.platform === 'win32' ? [ '--use-angle=d3d11' ] : [ '--use-angle=metal' ],
	env: linux ? { ...process.env, VK_DRIVER_FILES: '/usr/share/vulkan/icd.d/lvp_icd.x86_64.json' } : undefined
} } );
const browser = () => ( { enabled: true, headless: true, provider, instances: [ { browser: 'chromium' } ] } );
const gpuProjects = [ 'webgl', 'webgpu' ].map( backend => ( {
	extends: true,
	test: {
		name: backend,
		include: gpuTests,
		// Reuse imports as the former aggregate suite did, with one GPU file at a time.
		isolate: false,
		maxWorkers: 1,
		sequence: { groupOrder: 1 },
		setupFiles: [ './test/gpu/setup.js' ],
		env: { THREE_GPU_BACKEND: backend },
		testTimeout: 30000,
		hookTimeout: 30000,
		browser: browser()
	}
} ) );

export default defineConfig( {
	resolve: { alias },
	test: {
		watch: false,
		maxWorkers,
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					isolate: false,
					include: [ 'test/unit/src/**/*.tests.js', 'test/unit/tsl/*.tests.js' ],
					exclude: [ ...browserTests, ...gpuTests ],
					setupFiles
				}
			},
			{
				extends: true,
				test: {
					name: 'addons',
					environment: 'node',
					isolate: false,
					include: [ 'test/unit/addons/**/*.tests.js' ],
					exclude: addonsBrowserTests,
					setupFiles
				}
			},
			{
				extends: true,
				test: {
					name: 'unit-browser',
					include: browserTests,
					setupFiles,
					browser: browser()
				}
			},
			{
				extends: true,
				test: {
					name: 'addons-browser',
					include: addonsBrowserTests,
					setupFiles,
					browser: browser()
				}
			},
			...gpuProjects
		]
	}
} );
