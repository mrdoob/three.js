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
const maxWorkers = Math.max( 1, Math.floor( availableParallelism() * 0.75 ) );
const provider = playwright( { launchOptions: { args: process.platform === 'win32' ? [ '--use-angle=d3d11' ] : process.platform === 'darwin' ? [ '--use-angle=metal' ] : [] } } );
const browser = () => ( { enabled: true, headless: true, provider, instances: [ { browser: 'chromium' } ] } );
const gpuProjects = [ 'webgl', 'webgpu' ].map( backend => ( {
	extends: true,
	test: {
		name: backend,
		include: [ 'test/gpu/suite.tests.js' ],
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
					exclude: [ ...browserTests, 'test/unit/src/nodes/tsl/!(TSLCore).tests.js', 'test/unit/src/nodes/lighting/EnvironmentNode.tests.js' ],
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
