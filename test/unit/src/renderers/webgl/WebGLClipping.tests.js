import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { Plane } from '../../../../../src/math/Plane.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import { WebGLClipping } from '../../../../../src/renderers/webgl/WebGLClipping.js';

const CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE_END = 4;
const CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE_END = 5;
const CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE = 2;
const CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE_END = 6;
const CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE = 3;
const CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE_END = 7;

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

			QUnit.test( 'maps clippingPlanes to one local include volume when clipIntersection is false', ( assert ) => {

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
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 0, 'No global include volumes are active.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Synthetic local include volume is tracked.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE, 'First plane is local include mid-state.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 1 ], CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE_END, 'Last plane is local include end-state.' );

			} );

			QUnit.test( 'maps clipIntersection=true to one local exclude volume with inverted planes', ( assert ) => {

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
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are present.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE, 'First plane is local exclude mid-state.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 1 ], CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE_END, 'Last plane is local exclude end-state.' );

				assert.strictEqual( clipping.uniform.value[ 0 ], - 1, 'First inverted plane normal.x is negated.' );
				assert.strictEqual( clipping.uniform.value[ 3 ], - 1, 'First inverted plane constant is negated.' );

			} );

			QUnit.test( 'combines local clippingPlanes and clippingVolumes in one path', ( assert ) => {

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
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Local include-volume count is tracked.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE_END, 'Synthetic clipIntersection volume uses exclude mode.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 1 ], CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE_END, 'User-provided include volume follows synthetic volume.' );

			} );

			QUnit.test( 'maps renderer clippingPlanes to one global include volume', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];

				clipping.init( rendererPlanes, undefined, false );
				clipping.setGlobalState( rendererPlanes, undefined, camera );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Global clipping uses the unified volume path.' );
				assert.strictEqual( clipping.numVolumes, 1, 'A synthetic global volume is generated.' );
				assert.strictEqual( clipping.numPlanes, 1, 'Global plane count is preserved.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Synthetic global include volume is tracked.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are present.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE_END, 'Synthetic global volume uses include mode.' );

			} );

			QUnit.test( 'combines renderer clippingPlanes + clippingVolumes with local clippingVolumes', ( assert ) => {

				const clipping = new WebGLClipping( createProperties() );
				const camera = createCamera();
				const rendererPlanes = [ new Plane( new Vector3( 1, 0, 0 ), 1 ) ];
				const rendererVolumes = [ {
					mode: 'exclude',
					planes: [ new Plane( new Vector3( 0, 1, 0 ), 2 ) ]
				} ];

				clipping.init( rendererPlanes, rendererVolumes, true );
				clipping.setGlobalState( rendererPlanes, rendererVolumes, camera );

				clipping.setState( {
					clippingPlanes: null,
					clippingVolumes: [ {
						mode: 'include',
						planes: [ new Plane( new Vector3( 0, 0, 1 ), 0.5 ) ]
					} ],
					clipIntersection: false,
					clipShadows: false
				}, camera, false );

				assert.strictEqual( clipping.useClippingVolumes, true, 'Global and local clipping share one packed path.' );
				assert.strictEqual( clipping.numVolumes, 3, 'Two global volumes plus one local volume are active.' );
				assert.strictEqual( clipping.numPlanes, 3, 'Global and local planes are packed together.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Global include count stays separate.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 1, 'Local include count stays separate.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE_END, 'Synthetic global include is first.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 1 ], CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE_END, 'User global exclude follows.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 2 ], CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE_END, 'Local include is appended after global data.' );

			} );

			QUnit.test( 'localClippingEnabled=false ignores local clipping but preserves global clipping', ( assert ) => {

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
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 1, 'Global include metadata is preserved.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are active.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value[ 0 ], CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE_END, 'Only global state remains in packed data.' );

			} );

			QUnit.test( 'localClippingEnabled=false with no global clipping disables clipping state', ( assert ) => {

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
				assert.strictEqual( clipping.uniform.value, null, 'No plane uniform data is bound.' );
				assert.strictEqual( clipping.planeVolumeStateUniform.value, null, 'No per-plane state data is bound.' );
				assert.strictEqual( clipping.numGlobalIncludeVolumesUniform.value, 0, 'No global include volumes are tracked.' );
				assert.strictEqual( clipping.numLocalIncludeVolumesUniform.value, 0, 'No local include volumes are tracked.' );

			} );

		} );

	} );

} );
