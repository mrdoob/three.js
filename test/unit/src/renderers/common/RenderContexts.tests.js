import { OrthographicCamera } from '../../../../../src/cameras/OrthographicCamera.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { HalfFloatType, RGFormat } from '../../../../../src/constants.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import RenderContexts from '../../../../../src/renderers/common/RenderContexts.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'RenderContexts', () => {

			QUnit.test( 'get: shares the node build key between targets that only differ in sample count', ( assert ) => {

				const renderer = { getClearDepth: () => 1, getClearStencil: () => 1 };
				const contexts = new RenderContexts( renderer );
				const camera = new PerspectiveCamera();

				const msaa = new RenderTarget( 256, 256, { samples: 4, type: HalfFloatType } );
				const plain = new RenderTarget( 256, 256, { samples: 1, type: HalfFloatType } );

				const msaaContext = contexts.get( msaa, null, 0, camera );
				const plainContext = contexts.get( plain, null, 0, camera );

				// A node build only reads the output types, the MRT layout and
				// whether the target has a depth buffer, so targets that only
				// differ in sample count must share the node build (see #35388).

				assert.strictEqual( msaaContext.stateKey, plainContext.stateKey, 'MSAA and single-sample targets share the node build key' );

				// ... but they still get separate render contexts, since the
				// sample count is pipeline state.

				assert.notStrictEqual( msaaContext, plainContext, 'MSAA and single-sample targets keep separate render contexts' );
				assert.strictEqual( msaaContext.sampleCount, 4, 'MSAA context keeps its sample count' );
				assert.strictEqual( plainContext.sampleCount, 1, 'single-sample context keeps its sample count' );

			} );

			QUnit.test( 'get: keeps separate contexts when a secondary MRT output type differs', ( assert ) => {

				const renderer = { getClearDepth: () => 1, getClearStencil: () => 1 };
				const contexts = new RenderContexts( renderer );
				const camera = new PerspectiveCamera();

				const rgTarget = new RenderTarget( 256, 256, { count: 2, samples: 1, type: HalfFloatType } );
				rgTarget.textures[ 1 ].format = RGFormat;

				const rgbaTarget = new RenderTarget( 256, 256, { count: 2, samples: 1, type: HalfFloatType } );

				const rgContext = contexts.get( rgTarget, null, 0, camera );
				const rgbaContext = contexts.get( rgbaTarget, null, 0, camera );

				assert.notStrictEqual( rgContext, rgbaContext, 'MRT targets with different secondary output types keep separate render contexts' );
				assert.notStrictEqual( rgContext.stateKey, rgbaContext.stateKey, 'secondary attachment output type affects the node build key' );

			} );

			QUnit.test( 'get: splits the node build key when the build inputs differ', ( assert ) => {

				const renderer = { getClearDepth: () => 1, getClearStencil: () => 1 };
				const contexts = new RenderContexts( renderer );
				const camera = new PerspectiveCamera();

				const base = new RenderTarget( 256, 256, { samples: 1, type: HalfFloatType } );
				const baseKey = contexts.get( base, null, 0, camera ).stateKey;

				const noDepth = new RenderTarget( 256, 256, { samples: 1, type: HalfFloatType, depthBuffer: false } );
				assert.notStrictEqual( contexts.get( noDepth, null, 0, camera ).stateKey, baseKey, 'depth buffer affects the node build key' );

				const rg = new RenderTarget( 256, 256, { samples: 1, type: HalfFloatType, format: RGFormat } );
				assert.notStrictEqual( contexts.get( rg, null, 0, camera ).stateKey, baseKey, 'output format affects the node build key' );

				const ortho = new OrthographicCamera();
				assert.notStrictEqual( contexts.get( base, null, 0, ortho ).stateKey, baseKey, 'camera type affects the node build key' );

				assert.notStrictEqual( contexts.get( base, { id: 'mrt' }, 0, camera ).stateKey, baseKey, 'MRT configuration affects the node build key' );

			} );

		} );

	} );

} );
