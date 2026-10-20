import { BasicLightMapNode, Group, HalfFloatType, InstancedBufferAttribute, InstancedMesh, IrradianceNode, Mesh, MeshBasicMaterial, MeshBasicNodeMaterial, MeshStandardMaterial, MeshStandardNodeMaterial, PlaneGeometry, RedFormat, Texture } from 'three/webgpu';
import { materialLightMap, vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';
import { DirectionalLightMapNode, directionalLightMap, instancedLightMap } from '../../../../examples/jsm/tsl/lighting/DirectionalLightMapNode.js';

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

			QUnit.test( 'Directional bakes add a direction texture with the light map UVs', assert => {

				let floatBlendable = false;
				const renderer = { hasFeature: () => floatBlendable };
				const irradiance = () => vec3( 1 );

				const plain = new LightMapper( renderer, 8, irradiance );
				assert.strictEqual( plain.directionTexture, null, 'Non-directional bakes have no direction texture' );
				assert.strictEqual( plain._accumulation.textures.length, 1, 'and accumulate one target' );
				plain.dispose();

				const mapper = new LightMapper( renderer, 8, irradiance, { directional: true } );
				assert.true( mapper.directionTexture.isTexture );
				assert.strictEqual( mapper.directionTexture.channel, mapper.texture.channel, 'The direction texture shares the light map UVs' );
				assert.strictEqual( mapper.directionTexture.type, HalfFloatType );
				assert.deepEqual( mapper._accumulation.textures.map( texture => texture.name ), [ 'output', 'direction' ] );
				mapper.dispose();

				floatBlendable = true;
				const separate = new LightMapper( renderer, 8, irradiance, { moments: true } );
				assert.strictEqual( separate.momentTexture.format, RedFormat, 'Without directions the moments have their own target' );
				assert.strictEqual( separate.momentChannel, 'r' );
				separate.dispose();

				const moments = new LightMapper( renderer, 8, irradiance, { directional: true, moments: true } );
				assert.deepEqual( moments._accumulation.textures.map( texture => texture.name ), [ 'output', 'direction' ], 'Moments share the direction target, two RGBA32F targets fit the 32 bytes per sample WebGPU guarantees' );
				assert.strictEqual( moments.momentTexture, moments._accumulation.textures[ 1 ], 'The moments are in the direction sums' );
				assert.strictEqual( moments.momentChannel, 'a', 'in their alpha channel' );
				assert.strictEqual( moments._accumulation.textures[ 1 ].format, moments.sampleTexture.format );
				moments.dispose();

			} );

			QUnit.test( 'directionalLightMap() shades lit light maps with the direction texture', assert => {

				const material = new MeshStandardMaterial( { lightMap: new Texture() } );
				const direction = new Texture();
				const builder = { material };

				directionalLightMap( material, direction, { specularIntensity: 0.5 } );
				assert.strictEqual( material.lightMapDirection, direction, 'Keeps the direction texture for exporters' );
				assert.strictEqual( material.lightMapSpecularIntensity, 0.5 );

				const node = material.setupLightMap.call( new MeshStandardNodeMaterial(), builder );
				assert.true( node instanceof DirectionalLightMapNode, 'Lit materials use the directional light map' );
				assert.notStrictEqual( node.specularIntensityNode, null, 'with a specular term' );
				assert.false( material.setupLightMap.call( new MeshBasicNodeMaterial(), builder ) instanceof DirectionalLightMapNode, 'Unlit materials keep their light map' );

				directionalLightMap( material, direction, { specularIntensity: 0 } );
				assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), builder ).specularIntensityNode, null, 'A zero intensity leaves the specular term out' );

				material.lightMap = null;
				assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), builder ), null, 'Materials without a light map get no light map node' );

				material.lightMap = new Texture();
				directionalLightMap( material, null );
				assert.false( Object.hasOwn( material, 'setupLightMap' ), 'A null direction texture restores the default light map' );
				assert.strictEqual( material.lightMapDirection, undefined );
				assert.true( new MeshStandardNodeMaterial().setupLightMap( builder ) instanceof IrradianceNode );

			} );

			QUnit.test( 'instancedLightMap() and directionalLightMap() compose in any order', assert => {

				const instanced = new PlaneGeometry();
				instanced.setAttribute( '_LIGHTMAP_OFFSET', new InstancedBufferAttribute( new Float32Array( 2 ), 2 ) );
				const plain = new PlaneGeometry();
				const direction = new Texture();

				for ( const order of [ 0, 1 ] ) {

					const material = new MeshStandardMaterial( { lightMap: new Texture() } );

					if ( order === 0 ) {

						instancedLightMap( material );
						directionalLightMap( material, direction );

					} else {

						directionalLightMap( material, direction );
						instancedLightMap( material );

					}

					const node = material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: instanced } );
					assert.true( node instanceof DirectionalLightMapNode, 'Instanced directional light maps keep their directions' );
					assert.notStrictEqual( node.lightMapNode, materialLightMap, 'and look their light map up in the instance regions' );
					assert.strictEqual( material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: plain } ).lightMapNode, materialLightMap, 'Meshes without instances use the light map UVs' );

					directionalLightMap( material, null );
					assert.true( Object.hasOwn( material, 'setupLightMap' ), 'Removing the direction keeps the instanced light map' );
					assert.true( material.setupLightMap.call( new MeshStandardNodeMaterial(), { material, geometry: instanced } ) instanceof IrradianceNode );
					assert.true( material.setupLightMap.call( new MeshBasicNodeMaterial(), { material, geometry: instanced } ) instanceof BasicLightMapNode, 'Unlit materials keep a basic light map' );

				}

				instanced.dispose();
				plain.dispose();

			} );

			QUnit.test( 'Bakes meshes into the pages of their lightMapPage', assert => {

				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const material = new MeshBasicMaterial();
				const meshes = [ 0, 1, 1, undefined ].map( page => {

					const mesh = new Mesh( geometry, material );
					if ( page !== undefined ) mesh.userData.lightMapPage = page;
					return mesh;

				} );
				const instanced = new InstancedMesh( geometry, material, 3 );
				instanced.userData.lightMapPage = 1;
				const withoutUV = new Mesh( new PlaneGeometry(), material );
				const targets = [];
				const rendered = [];
				const renderer = {
					autoClear: true,
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
					setRenderTarget: target => targets.push( target ),
					setRenderObjectFunction: () => {},
					setPixelRatio: () => {},
					setMRT: () => {},
					setClearColor: () => {},
					setScissorTest: () => {},
					clear: () => {},
					render: scene => scene.isScene && rendered.push( { target: targets.at( - 1 ), children: scene.children } )
				};
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ), { pages: 2 } );
				mapper.addObjects( [ ...meshes, instanced, withoutUV ] );
				mapper.addObjects( [ meshes[ 0 ] ], { page: 1 } );
				assert.strictEqual( mapper.pages.length, 2 );
				assert.strictEqual( mapper.texture, mapper.pages[ 0 ].texture, 'The textures of the light mapper are the ones of the first page' );
				assert.strictEqual( mapper.sampleTexture, mapper.pages[ 0 ].sampleTexture );
				assert.deepEqual( mapper.pages[ 0 ].objects, [ meshes[ 0 ], meshes[ 3 ] ], 'Meshes without a page bake into the first one' );
				assert.deepEqual( mapper.pages[ 1 ].objects, [ meshes[ 1 ], meshes[ 2 ], instanced, meshes[ 0 ] ], 'The page option overrides lightMapPage' );
				assert.strictEqual( mapper.objects.length, 6, 'Meshes without uv1 are skipped' );
				mapper.update( 2 );
				assert.strictEqual( rendered.length, 4, 'Every sample renders every page' );
				assert.notStrictEqual( rendered[ 0 ].target, rendered[ 1 ].target );
				assert.true( rendered[ 1 ].children[ 2 ].isInstancedMesh, 'Instanced meshes bake as instanced proxies' );
				assert.strictEqual( rendered[ 1 ].children[ 2 ].instanceMatrix, instanced.instanceMatrix );
				assert.strictEqual( rendered[ 1 ].children[ 2 ].instanceColor, null, 'Instance colors are no irradiance' );
				mapper.dispose();
				geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
