import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { Plane } from '../../../../../src/math/Plane.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import { WebGLClipping } from '../../../../../src/renderers/webgl/WebGLClipping.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLClipping', () => {

			function createProperties() {

				const map = new WeakMap();

				return {
					get: ( material ) => {

						let entry = map.get( material );

						if ( entry === undefined ) {

							entry = {};
							map.set( material, entry );

						}

						return entry;

					}
				};

			}

			function createCamera() {

				const camera = new PerspectiveCamera();
				camera.updateMatrixWorld();

				return camera;

			}

			QUnit.test( 'legacy clipping remains active when clippingVolumes is undefined', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( {
					clippingPlanes: [
						new Plane( new Vector3( 1, 0, 0 ), 1 ),
						new Plane( new Vector3( 0, 1, 0 ), 2 )
					],
					clipIntersection: true,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, false, 'Legacy clipping path is used.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Legacy clipping plane count is preserved.' );
				assert.strictEqual( clipping.numIntersection, 2, 'Legacy clipIntersection behavior remains active.' );

			} );

			QUnit.test( 'clippingVolumes activates the volume clipping path', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( {
					clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ],
					clippingVolumes: [ {
						mode: 'include',
						planes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ]
					} ],
					clipIntersection: true,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Volume clipping path is enabled.' );
				assert.strictEqual( clipping.numVolumes, 1, 'Volume count is tracked.' );
				assert.strictEqual( clipping.numPlanes, 1, 'Only volume planes are used in volume mode.' );
				assert.strictEqual( clipping.numIntersection, 0, 'Legacy intersection count is ignored in volume mode.' );
				assert.strictEqual( clipping.numVolumesUniform.value, 1, 'Volume uniforms are updated.' );
				assert.strictEqual( clipping.numIncludeVolumesUniform.value, 1, 'Include-volume count is tracked.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 0, 'Include mode is encoded as 0.' );

			} );

			QUnit.test( 'empty clippingVolumes still override legacy local clipping semantics', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( {
					clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ],
					clippingVolumes: [],
					clipIntersection: true,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Volume path remains selected when clippingVolumes is set.' );
				assert.strictEqual( clipping.numVolumes, 0, 'Zero volumes are supported.' );
				assert.strictEqual( clipping.numPlanes, 0, 'Legacy clipping planes are ignored when clippingVolumes is set.' );

			} );

		} );

	} );

} );
