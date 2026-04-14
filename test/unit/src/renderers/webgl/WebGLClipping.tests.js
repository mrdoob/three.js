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

			QUnit.test( 'clippingPlanes are normalized to an include volume when clipIntersection is false', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], true );
				clipping.setGlobalState( [], camera );

				clipping.setState( {
					clippingPlanes: [
						new Plane( new Vector3( 1, 0, 0 ), 1 ),
						new Plane( new Vector3( 0, 1, 0 ), 2 )
					],
					clipIntersection: false,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Volume clipping path is used.' );
				assert.strictEqual( clipping.numVolumes, 1, 'A synthetic volume is generated.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Plane count is preserved.' );
				assert.strictEqual( clipping.numIntersection, 0, 'Intersection counter is no longer used.' );
				assert.strictEqual( clipping.numVolumesUniform.value, 1, 'Volume uniforms are updated.' );
				assert.strictEqual( clipping.numIncludeVolumesUniform.value, 1, 'Synthetic include volume is tracked.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 0, 'Synthetic volume uses include mode.' );

			} );

			QUnit.test( 'clipIntersection true is normalized to one exclude volume with inverted planes', ( assert ) => {

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

				assert.strictEqual( clipping.useClippingVolumes, true, 'Volume clipping path is used.' );
				assert.strictEqual( clipping.numVolumes, 1, 'A synthetic volume is generated.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Plane count is preserved.' );
				assert.strictEqual( clipping.numIncludeVolumesUniform.value, 0, 'No include volumes are present.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 1, 'Synthetic volume uses exclude mode.' );

			} );

			QUnit.test( 'clippingVolumes and clippingPlanes are combined in the same volume path', ( assert ) => {

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
				assert.strictEqual( clipping.numVolumes, 2, 'Synthetic clippingPlanes volume is prepended.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Both clippingPlanes and clippingVolumes contribute planes.' );
				assert.strictEqual( clipping.numIntersection, 0, 'Intersection counter is no longer used.' );
				assert.strictEqual( clipping.numVolumesUniform.value, 2, 'Volume uniforms are updated.' );
				assert.strictEqual( clipping.numIncludeVolumesUniform.value, 1, 'Include-volume count is tracked.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 1, 'Synthetic clipIntersection volume uses exclude mode.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 1 ], 0, 'User-provided include mode is encoded as 0.' );

			} );

			QUnit.test( 'empty clippingVolumes still include clippingPlanes synthetic volume', ( assert ) => {

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
				assert.strictEqual( clipping.numVolumes, 1, 'Synthetic clippingPlanes volume remains active.' );
				assert.strictEqual( clipping.numPlanes, 1, 'Synthetic clippingPlanes volume contributes planes.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 1, 'Synthetic volume uses exclude mode.' );

			} );

		} );

	} );

} );
