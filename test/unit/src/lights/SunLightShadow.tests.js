import { SunLightShadow } from '../../../../src/lights/SunLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';
import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';
import { SunLight } from '../../../../src/lights/SunLight.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SunLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new SunLightShadow();
			assert.strictEqual(
				object instanceof LightShadow, true,
				'SunLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SunLightShadow();
			assert.ok( object, 'Can instantiate a SunLightShadow.' );

		} );

		// PUBLIC
		QUnit.test( 'isSunLightShadow', ( assert ) => {

			const object = new SunLightShadow();
			assert.ok(
				object.isSunLightShadow,
				'SunLightShadow.isSunLightShadow should be true'
			);

		} );

		QUnit.test( 'cascades', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 0.1, 100 );
			const shadow = light.shadow;
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.9, 0.7 );
			light.updateMatrixWorld();
			camera.updateMatrixWorld();

			shadow.camera.far = 80;
			shadow.updateMatrices( light, camera );

			assert.strictEqual( shadow.getViewportCount(), 4, 'Creates four cascade viewports' );
			assert.deepEqual( shadow.getFrameExtents().toArray(), [ 2, 2 ], 'Uses a compact atlas layout' );
			assert.strictEqual( shadow._cascadeSplits.length, 5, 'Creates all cascade split boundaries' );
			assert.strictEqual( shadow._cascadeSplits[ 0 ], camera.near, 'Starts at the view camera near plane' );
			assert.strictEqual( shadow._cascadeSplits[ 4 ], shadow.camera.far, 'Ends at the shadow camera far plane' );

			const orthographicCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 100 );
			orthographicCamera.updateMatrixWorld();
			shadow.updateMatrices( light, orthographicCamera );
			assert.ok( shadow._cascadeSplits.every( Number.isFinite ), 'Supports an orthographic view camera with a zero near plane' );

			const infiniteCamera = new PerspectiveCamera( 60, 1, 0.1, 100 );
			infiniteCamera.projectionMatrix.elements[ 10 ] = - 1;
			infiniteCamera.projectionMatrix.elements[ 14 ] = - 2 * infiniteCamera.near;
			infiniteCamera.projectionMatrixInverse.copy( infiniteCamera.projectionMatrix ).invert();
			infiniteCamera.far = Infinity;
			infiniteCamera.updateMatrixWorld();
			shadow.camera.far = 80;
			shadow.updateMatrices( light, infiniteCamera );
			assert.ok( shadow._matrices.every( matrix => matrix.elements.every( Number.isFinite ) ), 'Supports an infinite-far projection matrix' );
			assert.strictEqual( shadow._cascadeSplits[ 4 ], shadow.camera.far, 'Falls back to the shadow camera for a non-finite view far plane' );

		} );

		QUnit.test( 'cascade fade', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 0.1, 100 );
			const shadow = light.shadow;
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.9, 0.7 );
			light.updateMatrixWorld();
			camera.updateMatrixWorld();

			shadow.camera.far = 80;
			shadow.updateMatrices( light, camera );

			for ( let i = 0; i < 4; i ++ ) {

				const cascade = shadow._cascadeData[ i ];

				assert.strictEqual( cascade.y, shadow._cascadeSplits[ i + 1 ], `Cascade ${i} ends at its split` );
				assert.ok( cascade.z < cascade.y && cascade.z >= shadow._cascadeSplits[ i ], `Cascade ${i} fades out within its own range` );

				if ( i === 0 ) assert.ok( cascade.x < 0, 'First cascade is open below the near plane' );
				else assert.strictEqual( cascade.x, shadow._cascadeData[ i - 1 ].z, `Cascade ${i} begins where the previous fade starts` );

			}

		} );

		QUnit.test( 'cascade caster margin', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 0.1, 100 );
			const shadow = light.shadow;
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.9, 0.7 );
			light.updateMatrixWorld();
			camera.updateMatrixWorld();
			shadow.camera.far = 100;
			shadow.updateMatrices( light, camera );

			const lightDirection = light.position.clone().normalize().negate();

			for ( let i = 0; i < 4; i ++ ) {

				const depth = ( shadow._cascadeSplits[ i ] + shadow._cascadeSplits[ i + 1 ] ) * 0.5;
				const caster = new Vector3( 0, 0, - depth ).addScaledVector( lightDirection, - 90 );
				assert.ok( shadow.getFrustum( i ).containsPoint( caster ), `Cascade ${i} covers casters above the view frustum` );

			}

		} );

		QUnit.test( 'cascade containment', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 0.01, 0.1 );
			const shadow = light.shadow;
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.9, 0.7 );
			light.updateMatrixWorld();
			camera.updateMatrixWorld();
			shadow.camera.far = 1;
			shadow.updateMatrices( light, camera );

			for ( let i = 0; i < 4; i ++ ) {

				let containsSlice = true;

				for ( const depth of shadow._cascadeSplits.slice( i, i + 2 ) ) {

					const halfHeight = Math.tan( camera.fov * Math.PI / 360 ) * depth;

					for ( const x of [ - 1, 1 ] ) {

						for ( const y of [ - 1, 1 ] ) {

							containsSlice = containsSlice && shadow.getFrustum( i ).containsPoint( new Vector3( x * halfHeight, y * halfHeight, - depth ) );

						}

					}

				}

				assert.ok( containsSlice, `Cascade ${i} contains its view slice` );

			}

		} );

		QUnit.test( 'cascade stabilization containment', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 1, 10 );
			const shadow = light.shadow;
			camera.updateMatrixWorld();
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.6, Math.PI / 4 );
			light.updateMatrixWorld();

			shadow.mapSize.set( 16, 16 );
			shadow.updateMatrices( light, camera );

			for ( const depth of shadow._cascadeSplits.slice( 0, 2 ) ) {

				const halfHeight = Math.tan( camera.fov * Math.PI / 360 ) * depth;

				for ( const x of [ - 1, 1 ] ) {

					for ( const y of [ - 1, 1 ] ) {

						const corner = new Vector3( x * halfHeight * camera.aspect, y * halfHeight, - depth ).applyMatrix4( camera.matrixWorld );
						assert.ok( shadow.getFrustum( 0 ).containsPoint( corner ), 'Texel stabilization keeps the slice corner inside its cascade' );

					}

				}

			}

		} );

		QUnit.test( 'reversed depth cascade containment', ( assert ) => {

			const light = new SunLight();
			const camera = new PerspectiveCamera( 60, 1, 0.1, 100 );
			const shadow = light.shadow;
			light.position.setFromSphericalCoords( 1, Math.PI / 2 - 0.9, 0.7 );
			light.updateMatrixWorld();
			camera.updateMatrixWorld();

			for ( const [ viewReversedDepth, shadowReversedDepth ] of [[ false, false ], [ false, true ], [ true, true ]] ) {

				camera._reversedDepth = viewReversedDepth;
				camera.updateProjectionMatrix();
				shadow.camera._reversedDepth = shadowReversedDepth;
				shadow.updateMatrices( light, camera );

				for ( let i = 0; i < 4; i ++ ) {

					const cascadeCamera = shadow.getCamera( i );
					const depth = ( shadow._cascadeSplits[ i ] + shadow._cascadeSplits[ i + 1 ] ) * 0.5;
					assert.strictEqual( cascadeCamera.reversedDepth, shadowReversedDepth, `Cascade ${i} uses the shadow map depth convention` );
					assert.ok( shadow.getMatrix( i ).elements.every( Number.isFinite ), `Cascade ${i} has a finite shadow matrix` );
					assert.ok( shadow.getFrustum( i ).containsPoint( new Vector3( 0, 0, - depth ) ), `Cascade ${i} contains its view slice` );

				}

			}

		} );

		// OTHERS
		QUnit.test( 'clone/copy', ( assert ) => {

			const a = new SunLightShadow();
			const b = new SunLightShadow();

			assert.notDeepEqual( a, b, 'Newly instanced shadows are not equal' );

			const c = a.clone();
			assert.smartEqual( a, c, 'Shadows are identical after clone()' );

			c.mapSize.set( 1024, 1024 );
			assert.notDeepEqual( a, c, 'Shadows are different again after change' );

			b.copy( a );
			assert.smartEqual( a, b, 'Shadows are identical after copy()' );

			b.mapSize.set( 512, 512 );
			assert.notDeepEqual( a, b, 'Shadows are different again after change' );

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			const light = new SunLight();
			const shadow = light.shadow;

			shadow.bias = 10;
			shadow.radius = 5;
			shadow.mapSize.set( 1024, 1024 );

			const json = light.toJSON();
			const newLight = new ObjectLoader().parse( json );

			assert.ok( newLight.shadow.isSunLightShadow, 'Reloaded shadow is a SunLightShadow' );
			assert.smartEqual(
				newLight.shadow, light.shadow,
				'Reloaded shadow is identical to the original one'
			);

		} );

	} );

} );
