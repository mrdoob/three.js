import { DirectionalLight, PointLight } from 'three/webgpu';
import ClusteredLightsNode from '../../../../examples/jsm/tsl/lighting/ClusteredLightsNode.js';

function createRenderer( width = 128, height = 128 ) {

	const target = { width, height };
	return { backend: { isWebGLBackend: false }, getRenderTarget: () => target };

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'ClusteredLightsNode', () => {

			QUnit.test( 'first grid allocation preserves the precompilation cache key', assert => {

				const node = new ClusteredLightsNode( 8, 32, 4, 8 );
				const key = node.getCacheKey( true );
				node._initGrid( createRenderer() );
				assert.ok( node._compute, 'allocates the compute and its storage' );
				assert.strictEqual( node.getCacheKey( true ), key, 'first setup does not invalidate precompiled materials' );
				assert.strictEqual( node.getCacheKey(), key, 'cached and recomputed keys agree' );
				node.dispose();

			} );

			QUnit.test( 'distinct lights nodes never share storage bindings', assert => {

				const first = new ClusteredLightsNode( 8, 32, 4, 8 );
				const second = new ClusteredLightsNode( 8, 32, 4, 8 );
				assert.notStrictEqual( first.getCacheKey( true ), second.getCacheKey( true ), 'uninitialized nodes have distinct keys' );
				first._initGrid( createRenderer() );
				second._initGrid( createRenderer() );
				assert.notStrictEqual( first.getCacheKey( true ), second.getCacheKey( true ), 'initialized nodes keep separate bindings' );
				first.dispose();
				second.dispose();

			} );

			QUnit.test( 'only storage replacement invalidates materials on resize', assert => {

				const node = new ClusteredLightsNode( 8, 32, 4, 8 );
				const renderer = createRenderer();
				node._initGrid( renderer );
				const key = node.getCacheKey( true );
				const storage = node._lightIndexes;
				renderer.getRenderTarget().width = 64;
				node.updateSize();
				assert.strictEqual( node._lightIndexes, storage, 'smaller grids reuse storage' );
				assert.strictEqual( node.getCacheKey( true ), key, 'uniform-only resize keeps the shader key' );
				renderer.getRenderTarget().width = 1024;
				node.updateSize();
				assert.notStrictEqual( node._lightIndexes, storage, 'larger grids replace storage' );
				const grownKey = node.getCacheKey( true );
				assert.notStrictEqual( grownKey, key, 'replacement invalidates the material bindings' );
				assert.strictEqual( node.getCacheKey(), grownKey, 'replacement also invalidates the memoized node key' );
				renderer.backend.isWebGLBackend = true;
				node.updateSize();
				assert.notStrictEqual( node.getCacheKey( true ), grownKey, 'backend changes invalidate the bindings' );
				node.dispose();

			} );

			QUnit.test( 'analytical light changes still invalidate materials', assert => {

				const node = new ClusteredLightsNode( 8, 32, 4, 8 );
				const key = node.getCacheKey( true );
				node.setLights( [ new DirectionalLight() ] );
				const directionalKey = node.getCacheKey( true );
				assert.notStrictEqual( directionalKey, key, 'analytical lights affect the shader' );
				node.setLights( [ new PointLight() ] );
				assert.strictEqual( node.getCacheKey( true ), key, 'clustered lights only change light data' );
				node.dispose();

			} );

		} );

	} );

} );
