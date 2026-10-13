import { Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightMapper', () => {

			QUnit.test( 'Restores renderer state after a failed bake', assert => {

				const originalTarget = {};
				const originalColor = new Color( 0x123456 );
				const color = originalColor.clone();
				let target = originalTarget, alpha = 0.25;
				const renderer = {
					autoClear: true,
					getRenderTarget: () => target,
					setRenderTarget: value => {

						target = value;

					},
					getClearAlpha: () => alpha,
					getClearColor: value => value.copy( color ),
					setClearColor: ( value, opacity ) => {

						color.set( value ); alpha = opacity;

					},
					clear: () => {},
					render: () => {

						throw new Error( 'GPU failure' );

					}
				};
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ) );

				assert.throws( () => mapper.update(), /GPU failure/ );
				assert.strictEqual( target, originalTarget );
				assert.true( color.equals( originalColor ) );
				assert.strictEqual( alpha, 0.25 );
				assert.true( renderer.autoClear );
				assert.strictEqual( mapper.samples, 0 );
				mapper.dispose();

			} );

			QUnit.test( 'Uses current world transforms without rendering the source scene first', assert => {

				const parent = new Group();
				parent.position.set( 2, 3, 4 );
				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const material = new MeshBasicMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.position.set( 5, 6, 7 );
				parent.add( mesh );
				let target = null;
				let bakedPosition;
				const renderer = {
					autoClear: true,
					getRenderTarget: () => target,
					setRenderTarget: value => {

						target = value;

					},
					getClearAlpha: () => 1,
					getClearColor: value => value.set( 0 ),
					setClearColor: () => {},
					clear: () => {},
					render: scene => {

						if ( scene.isScene ) bakedPosition = scene.children[ 0 ].matrix.elements.slice( 12, 15 );

					}
				};
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ) );
				mapper.addObjects( [ mesh ] );
				mapper.update();
				assert.deepEqual( bakedPosition, [ 7, 9, 11 ] );
				mapper.dispose();
				geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
