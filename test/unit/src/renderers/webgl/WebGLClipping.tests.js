import { WebGLClipping } from '../../../../../src/renderers/webgl/WebGLClipping.js';
import { WebGLProperties } from '../../../../../src/renderers/webgl/WebGLProperties.js';
import { Plane } from '../../../../../src/math/Plane.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';

// A camera at the origin, so matrixWorldInverse is the identity and planes
// survive the world -> view projection unchanged.
function identityCamera() {

	const camera = new PerspectiveCamera();
	camera.updateMatrixWorld( true );
	return camera;

}

// Stands in for a Material; setState() only reads these three properties.
function material( { clippingPlanes = null, clipIntersection = false, clipShadows = false } = {} ) {

	return { clippingPlanes, clipIntersection, clipShadows };

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLClipping', () => {

			// INSTANCING
			QUnit.test( 'Instancing - starts with no planes and an empty uniform', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );

				assert.strictEqual( clipping.numPlanes, 0, 'numPlanes starts at 0' );
				assert.strictEqual( clipping.numIntersection, 0, 'numIntersection starts at 0' );
				assert.strictEqual( clipping.uniform.value, null, 'the uniform holds no data yet' );
				assert.strictEqual( clipping.uniform.needsUpdate, false, 'the uniform does not need an upload yet' );

			} );

			// init
			QUnit.test( 'init - is disabled when there is nothing to clip', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );

				assert.strictEqual( clipping.init( [], false ), false, 'no global planes and no local clipping means disabled' );

			} );

			QUnit.test( 'init - is enabled by global planes', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );

				assert.strictEqual( clipping.init( [ new Plane() ], false ), true, 'a global plane enables clipping' );

			} );

			QUnit.test( 'init - is enabled by local clipping', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );

				assert.strictEqual( clipping.init( [], true ), true, 'the local clipping flag enables clipping' );

			} );

			QUnit.test( 'init - stays enabled for one more frame after global planes are removed', ( assert ) => {

				// The clipping code has to run once more to reset the shader
				// state, so the frame that drops the planes still reports true.
				const clipping = new WebGLClipping( new WebGLProperties() );

				clipping.init( [ new Plane() ], false );

				assert.strictEqual( clipping.init( [], false ), true, 'the frame that removes the planes is still enabled' );
				assert.strictEqual( clipping.init( [], false ), false, 'the frame after that is disabled' );

			} );

			QUnit.test( 'init - stays enabled for one more frame after local clipping is turned off', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );

				clipping.init( [], true );

				assert.strictEqual( clipping.init( [], false ), true, 'the frame that turns local clipping off is still enabled' );
				assert.strictEqual( clipping.init( [], false ), false, 'the frame after that is disabled' );

			} );

			// setGlobalState
			QUnit.test( 'setGlobalState - packs each plane into four floats', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane(), new Plane() ], false );
				clipping.setGlobalState( [
					new Plane( new Vector3( 1, 0, 0 ), 2 ),
					new Plane( new Vector3( 0, 1, 0 ), 3 )
				], camera );

				assert.ok( clipping.uniform.value instanceof Float32Array, 'the uniform holds a Float32Array' );
				assert.strictEqual( clipping.uniform.value.length, 8, 'two planes take eight floats' );
				assert.deepEqual(
					Array.from( clipping.uniform.value ),
					[ 1, 0, 0, 2, 0, 1, 0, 3 ],
					'each plane is stored as normal.xyz followed by its constant'
				);
				assert.strictEqual( clipping.numPlanes, 2, 'numPlanes reflects the global planes' );
				assert.strictEqual( clipping.uniform.needsUpdate, true, 'the uniform is flagged for upload' );

			} );

			QUnit.test( 'setGlobalState - transforms planes into view space', ( assert ) => {

				// A camera pushed back along +z moves the world z = 0 plane to
				// z = -5 in view space, which shows up as the plane constant.
				const clipping = new WebGLClipping( new WebGLProperties() );

				const camera = new PerspectiveCamera();
				camera.position.set( 0, 0, 5 );
				camera.updateMatrixWorld( true );

				clipping.init( [ new Plane() ], false );
				clipping.setGlobalState( [ new Plane( new Vector3( 0, 0, 1 ), 0 ) ], camera );

				const [ x, y, z, constant ] = Array.from( clipping.uniform.value );

				assert.numEqual( x, 0, 'the normal x component is unchanged' );
				assert.numEqual( y, 0, 'the normal y component is unchanged' );
				assert.numEqual( z, 1, 'the normal z component is unchanged' );
				assert.numEqual( constant, 5, 'the constant absorbs the camera translation' );

			} );

			QUnit.test( 'setGlobalState - clears the plane count when given no planes', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], false );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 0 ) ], camera );
				clipping.setGlobalState( [], camera );

				assert.strictEqual( clipping.numPlanes, 0, 'numPlanes drops back to 0' );

			} );

			// setState - global only
			QUnit.test( 'setState - falls back to the global planes when local clipping is off', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], false );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );

				// The material has local planes, but local clipping was never
				// enabled, so they are ignored.
				clipping.setState( material( { clippingPlanes: [ new Plane() ] } ), camera, false );

				assert.strictEqual( clipping.numPlanes, 1, 'only the global plane counts' );
				assert.strictEqual( clipping.numIntersection, 0, 'no intersection planes' );
				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 1 ], 'the uniform holds the global state' );

			} );

			QUnit.test( 'setState - falls back to the global planes for a material with none', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], true );
				clipping.setGlobalState( [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ], camera );

				clipping.setState( material( { clippingPlanes: null } ), camera, false );

				assert.strictEqual( clipping.numPlanes, 1, 'the global plane still applies' );
				assert.deepEqual( Array.from( clipping.uniform.value ), [ 0, 1, 0, 2 ], 'the uniform holds the global state' );

			} );

			QUnit.test( 'setState - treats an empty local plane list like none at all', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], true );
				clipping.setGlobalState( [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ], camera );

				clipping.setState( material( { clippingPlanes: [] } ), camera, false );

				assert.strictEqual( clipping.numPlanes, 1, 'the global plane still applies' );

			} );

			// setState - local clipping
			QUnit.test( 'setState - uses the material planes when local clipping is on', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( material( { clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 4 ) ] } ), camera, false );

				assert.strictEqual( clipping.numPlanes, 1, 'the material plane is counted' );
				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 4 ], 'the uniform holds the material plane' );

			} );

			QUnit.test( 'setState - places global planes before the material planes', ( assert ) => {

				// The shader reads one flat array, with the global planes first
				// and the material's own appended after them.
				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], true );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );

				clipping.setState( material( { clippingPlanes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ] } ), camera, false );

				assert.strictEqual( clipping.uniform.value.length, 8, 'both planes fit in the array' );
				assert.deepEqual(
					Array.from( clipping.uniform.value ),
					[ 1, 0, 0, 1, 0, 1, 0, 2 ],
					'the global plane occupies the first slot'
				);
				assert.strictEqual( clipping.numPlanes, 2, 'both planes are counted' );

			} );

			QUnit.test( 'setState - reports intersection planes only when the material asks for it', ( assert ) => {

				const camera = identityCamera();
				const localPlanes = [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ];

				const withIntersection = new WebGLClipping( new WebGLProperties() );
				withIntersection.init( [ new Plane() ], true );
				withIntersection.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );
				withIntersection.setState( material( { clippingPlanes: localPlanes, clipIntersection: true } ), camera, false );

				assert.strictEqual( withIntersection.numIntersection, 1, 'the material planes become intersection planes' );
				assert.strictEqual( withIntersection.numPlanes, 2, 'the global plane is still added to the total' );

				const withoutIntersection = new WebGLClipping( new WebGLProperties() );
				withoutIntersection.init( [ new Plane() ], true );
				withoutIntersection.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );
				withoutIntersection.setState( material( { clippingPlanes: localPlanes, clipIntersection: false } ), camera, false );

				assert.strictEqual( withoutIntersection.numIntersection, 0, 'clipIntersection = false reports no intersection planes' );

			} );

			QUnit.test( 'setState - caches the packed planes on the material properties', ( assert ) => {

				// Reusing the array across frames is what makes the `useCache`
				// fast path possible, so the buffer must be stashed and reused.
				const properties = new WebGLProperties();
				const clipping = new WebGLClipping( properties );
				const camera = identityCamera();

				const mat = material( { clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ] } );

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );
				clipping.setState( mat, camera, false );

				const cached = properties.get( mat ).clippingState;

				assert.ok( cached instanceof Float32Array, 'the packed planes are cached on the material' );

				clipping.setState( mat, camera, false );

				assert.strictEqual( properties.get( mat ).clippingState, cached, 'the same buffer is reused on the next frame' );

			} );

			QUnit.test( 'setState - skips the transform when useCache is set', ( assert ) => {

				// With useCache the cached buffer is taken as-is, so a plane
				// that moved since the last call is not re-projected.
				const properties = new WebGLProperties();
				const clipping = new WebGLClipping( properties );
				const camera = identityCamera();

				const plane = new Plane( new Vector3( 1, 0, 0 ), 1 );
				const mat = material( { clippingPlanes: [ plane ] } );

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );
				clipping.setState( mat, camera, false );

				plane.constant = 99;
				clipping.setState( mat, camera, true );

				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 1 ], 'the cached values are kept' );

				clipping.setState( mat, camera, false );

				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 99 ], 'without the cache the plane is re-projected' );

			} );

			QUnit.test( 'setState - keeps separate materials independent', ( assert ) => {

				const properties = new WebGLProperties();
				const clipping = new WebGLClipping( properties );
				const camera = identityCamera();

				const a = material( { clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ] } );
				const b = material( { clippingPlanes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ] } );

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( a, camera, false );
				clipping.setState( b, camera, false );

				assert.notStrictEqual(
					properties.get( a ).clippingState,
					properties.get( b ).clippingState,
					'each material gets its own buffer'
				);
				assert.deepEqual( Array.from( properties.get( a ).clippingState ), [ 1, 0, 0, 1 ], 'the first material keeps its plane' );
				assert.deepEqual( Array.from( properties.get( b ).clippingState ), [ 0, 1, 0, 2 ], 'the second material keeps its plane' );

			} );

			// shadows
			QUnit.test( 'beginShadows - clears the active planes', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], false );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );

				clipping.beginShadows();

				assert.strictEqual( clipping.numPlanes, 0, 'the shadow pass starts unclipped' );
				assert.strictEqual( clipping.numIntersection, 0, 'no intersection planes during shadows' );

			} );

			QUnit.test( 'setState - ignores material planes during shadows unless clipShadows is set', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );
				clipping.beginShadows();

				clipping.setState( material( { clippingPlanes: [ new Plane() ], clipShadows: false } ), camera, false );

				assert.strictEqual( clipping.numPlanes, 0, 'a material that does not clip shadows contributes nothing' );

			} );

			QUnit.test( 'setState - applies material planes during shadows when clipShadows is set', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );
				clipping.beginShadows();

				clipping.setState(
					material( { clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 3 ) ], clipShadows: true } ),
					camera,
					false
				);

				assert.strictEqual( clipping.numPlanes, 1, 'the material plane clips the shadow pass' );
				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 3 ], 'the uniform holds the material plane' );

			} );

			QUnit.test( 'setState - excludes global planes from the shadow pass', ( assert ) => {

				// Global planes are not applied while rendering shadows, so a
				// clipShadows material sees only its own planes.
				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], true );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );
				clipping.beginShadows();

				clipping.setState(
					material( { clippingPlanes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ], clipShadows: true } ),
					camera,
					false
				);

				assert.strictEqual( clipping.numPlanes, 1, 'the global plane is not added during shadows' );
				assert.deepEqual( Array.from( clipping.uniform.value ).slice( 0, 4 ), [ 0, 1, 0, 2 ], 'only the material plane is packed' );

			} );

			QUnit.test( 'endShadows - restores the global planes on the next setState', ( assert ) => {

				const clipping = new WebGLClipping( new WebGLProperties() );
				const camera = identityCamera();

				clipping.init( [ new Plane() ], false );
				clipping.setGlobalState( [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ], camera );

				clipping.beginShadows();
				clipping.setState( material(), camera, false );
				clipping.endShadows();
				clipping.setState( material(), camera, false );

				assert.strictEqual( clipping.numPlanes, 1, 'the global plane applies again' );
				assert.deepEqual( Array.from( clipping.uniform.value ), [ 1, 0, 0, 1 ], 'the uniform holds the global state again' );

			} );

		} );

	} );

} );
