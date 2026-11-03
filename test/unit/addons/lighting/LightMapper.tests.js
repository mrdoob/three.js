import { FloatType, Group, HalfFloatType, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightMapper', () => {

			QUnit.test( 'Uses current world transforms without rendering the source scene first', assert => {

				const parent = new Group();
				parent.position.set( 2, 3, 4 );
				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const material = new MeshBasicMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.position.set( 5, 6, 7 );
				parent.add( mesh );
				let bakedPosition;
				const renderer = {
					autoClear: true,
					getRenderTarget: () => null,
					getActiveCubeFace: () => 0,
					getActiveMipmapLevel: () => 0,
					getRenderObjectFunction: () => null,
					getPixelRatio: () => 1,
					getMRT: () => null,
					getClearColor: value => value.set( 0 ),
					getClearAlpha: () => 1,
					getScissorTest: () => false,
					setRenderTarget: () => {},
					setRenderObjectFunction: () => {},
					setPixelRatio: () => {},
					setMRT: () => {},
					setClearColor: () => {},
					setScissorTest: () => {},
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

			QUnit.test( 'Bakes the variance with float32-blendable, and the guides', assert => {

				for ( const blendable of [ false, true ] ) {

					const renderer = { hasFeature: name => name === 'float32-blendable' && blendable };
					const mapper = new LightMapper( renderer, 32, () => vec3( 1 ), { variance: true, guides: true } );

					assert.strictEqual( mapper.varianceTexture !== null, blendable, 'variance texture' );
					if ( blendable ) assert.strictEqual( mapper.varianceTexture.type, FloatType, 'variance type' );
					assert.strictEqual( mapper.texture.type, HalfFloatType, 'light map type' );
					assert.strictEqual( mapper.texture.channel, 1, 'light map channel' );
					assert.strictEqual( mapper.positionTexture.type, FloatType, 'position type' );
					assert.strictEqual( mapper.normalTexture.type, HalfFloatType, 'normal type' );
					mapper.dispose();

				}

				const mapper = new LightMapper( {}, 32, () => vec3( 1 ) );
				assert.strictEqual( mapper.varianceTexture, null, 'no variance by default' );
				assert.strictEqual( mapper.positionTexture, null, 'no guides by default' );
				assert.strictEqual( mapper.normalTexture, null, 'no normal guide by default' );
				mapper.dispose();

			} );

			QUnit.test( 'Numbers the charts of the guides across meshes', assert => {

				const geometries = [ new PlaneGeometry(), new PlaneGeometry( 1, 1, 2, 1 ) ];
				const material = new MeshBasicMaterial();
				const meshes = geometries.map( geometry => {

					geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
					return new Mesh( geometry, material );

				} );

				const charts = [];
				const renderer = {
					hasFeature: () => false,
					getRenderTarget: () => null,
					getActiveCubeFace: () => 0,
					getActiveMipmapLevel: () => 0,
					getRenderObjectFunction: () => null,
					getPixelRatio: () => 1,
					getMRT: () => null,
					getClearColor: value => value.set( 0 ),
					getClearAlpha: () => 1,
					getScissorTest: () => false,
					setRenderTarget: () => {},
					setRenderObjectFunction: () => {},
					setPixelRatio: () => {},
					setMRT: () => {},
					setClearColor: () => {},
					setScissorTest: () => {},
					clear: () => {},
					render: scene => {

						const attribute = scene.children[ 0 ]?.geometry.getAttribute( 'lightMapChart' );
						if ( attribute !== undefined && charts.length === 0 ) for ( const proxy of scene.children ) charts.push( Array.from( new Set( proxy.geometry.getAttribute( 'lightMapChart' ).array ) ) );

					}
				};

				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ), { guides: true } );
				mapper.addObjects( meshes );
				mapper.update();

				assert.deepEqual( charts, [[ 0 ], [ 1 ]], 'one chart per plane, numbered across the meshes' );
				assert.ok( geometries.every( geometry => geometry.getAttribute( 'lightMapChart' ) === undefined ), 'source geometries keep their attributes' );

				mapper.dispose();
				assert.ok( geometries.every( geometry => geometry.getAttribute( 'position' ) !== undefined ), 'disposing keeps the shared attributes' );

				for ( const geometry of geometries ) geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
