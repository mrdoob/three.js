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

			QUnit.test( 'clippingPlanes are normalized to a local include volume when clipIntersection is false', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], undefined, true );
				clipping.setGlobalState( [], undefined, camera );

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
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 0, 'No global volumes are active.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 0, 'No global include volumes are active.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Synthetic local include volume is tracked.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 0, 'Synthetic volume uses include mode.' );

			} );

			QUnit.test( 'clipIntersection true is normalized to one local exclude volume with inverted planes', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], undefined, true );
				clipping.setGlobalState( [], undefined, camera );

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
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 0, 'No global volumes are active.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are present.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 1, 'Synthetic volume uses exclude mode.' );

			} );

			QUnit.test( 'local clippingVolumes and clippingPlanes are combined in the same volume path', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], undefined, true );
				clipping.setGlobalState( [], undefined, camera );

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
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 0, 'No global volumes are active.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Local include-volume count is tracked.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 1, 'Synthetic clipIntersection volume uses exclude mode.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 1 ], 0, 'User-provided include mode is encoded as 0.' );

			} );

			QUnit.test( 'empty local clippingVolumes still include clippingPlanes synthetic volume', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], undefined, true );
				clipping.setGlobalState( [], undefined, camera );

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

			QUnit.test( 'renderer clippingPlanes are normalized to a global include volume', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];

				clipping.init( rendererPlanes, undefined, false );
				clipping.setGlobalState( rendererPlanes, undefined, camera );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Global clipping uses the unified volume path.' );
				assert.strictEqual( clipping.numVolumes, 1, 'A synthetic global volume is generated.' );
				assert.strictEqual( clipping.numPlanes, 1, 'Global plane count is preserved.' );
				assert.strictEqual( clipping.numVolumesUniform.value, 1, 'Global volume count uniform is updated.' );
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 1, 'Synthetic volume is marked global.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Synthetic global include volume is tracked.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are present.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 0, 'Synthetic global volume uses include mode.' );

			} );

			QUnit.test( 'renderer clippingPlanes and clippingVolumes are combined in global scope', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];
				const rendererVolumes = [ {
					mode: 'exclude',
					planes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ]
				} ];

				clipping.init( rendererPlanes, rendererVolumes, false );
				clipping.setGlobalState( rendererPlanes, rendererVolumes, camera );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Global clipping uses the unified volume path.' );
				assert.strictEqual( clipping.numVolumes, 2, 'Synthetic clippingPlanes volume is prepended to renderer clippingVolumes.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Both renderer clippingPlanes and clippingVolumes contribute planes.' );
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 2, 'All active global volumes are marked global.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Global include-volume count tracks only include volumes.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 0 ], 0, 'Synthetic clippingPlanes global volume uses include mode.' );
				assert.strictEqual( clipping.volumeModeUniform.value[ 1 ], 1, 'User-provided global exclude mode is encoded as 1.' );

			} );

			QUnit.test( 'global and local clipping volumes are tracked in separate scopes', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];

				clipping.init( rendererPlanes, undefined, true );
				clipping.setGlobalState( rendererPlanes, undefined, camera );

				clipping.setState( {
					clippingPlanes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ],
					clipIntersection: false,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.numVolumes, 2, 'One global and one local volume are active.' );
				assert.strictEqual( clipping.numPlanes, 2, 'Global and local planes are packed into the same uniform array.' );
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 1, 'The first volume is global.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Global include count is tracked independently.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Local include count is tracked independently.' );

			} );

			QUnit.test( 'localClippingEnabled false ignores local clipping but preserves global clipping', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];

				clipping.init( rendererPlanes, undefined, false );
				clipping.setGlobalState( rendererPlanes, undefined, camera );

				clipping.setState( {
					clippingPlanes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ],
					clippingVolumes: [ {
						mode: 'exclude',
						planes: [ new Plane( new Vector3( 0, 0, 1 ), 0.5 ) ]
					} ],
					clipIntersection: true,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.numVolumes, 1, 'Only global clipping remains active.' );
				assert.strictEqual( clipping.numPlanes, 1, 'Only global plane data remains active.' );
				assert.strictEqual( clipping.numGlobalVolumesUniform.value, 1, 'Global volume metadata is preserved.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are active.' );

			} );

			QUnit.test( 'localClippingEnabled false with no global clipping disables clipping state', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();

				clipping.init( [], undefined, false );
				clipping.setGlobalState( [], undefined, camera );

				clipping.setState( {
					clippingPlanes: [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ],
					clippingVolumes: [ {
						mode: 'include',
						planes: [ new Plane( new Vector3( 0, 1, 0 ), 1 ) ]
					} ],
					clipIntersection: false,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, false, 'No clipping volumes remain active.' );
				assert.strictEqual( clipping.numVolumes, 0, 'No volumes are active.' );
				assert.strictEqual( clipping.numPlanes, 0, 'No clipping planes are active.' );

			} );

		} );

	} );

} );
