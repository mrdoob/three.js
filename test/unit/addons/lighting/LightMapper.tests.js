import { Group, HalfFloatType, InstancedMesh, Mesh, MeshBasicMaterial, PlaneGeometry, RedFormat } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';

function createRenderer( { setRenderTarget = () => {}, render = () => {} } = {} ) {

	return {
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
		setRenderTarget,
		setRenderObjectFunction: () => {},
		setPixelRatio: () => {},
		setMRT: () => {},
		setClearColor: () => {},
		setScissorTest: () => {},
		clear: () => {},
		render
	};

}

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
				const renderer = createRenderer( {
					render: scene => {

						if ( scene.isScene ) bakedPosition = scene.children[ 0 ].matrix.elements.slice( 12, 15 );

					}
				} );
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
				assert.strictEqual( plain._pages[ 0 ].accumulation.textures.length, 1, 'and accumulate one target' );
				plain.dispose();

				const mapper = new LightMapper( renderer, 8, irradiance, { directional: true } );
				assert.true( mapper.directionTexture.isTexture );
				assert.strictEqual( mapper.directionTexture.channel, mapper.texture.channel, 'The direction texture shares the light map UVs' );
				assert.strictEqual( mapper.directionTexture.type, HalfFloatType );
				assert.deepEqual( mapper._pages[ 0 ].accumulation.textures.map( texture => texture.name ), [ 'output', 'direction' ] );
				mapper.dispose();

				floatBlendable = true;
				const separate = new LightMapper( renderer, 8, irradiance, { moments: true } );
				assert.strictEqual( separate.momentTexture.format, RedFormat, 'Without directions the moments have their own target' );
				assert.strictEqual( separate.momentChannel, 'r' );
				separate.dispose();

				const moments = new LightMapper( renderer, 8, irradiance, { directional: true, moments: true } );
				assert.deepEqual( moments._pages[ 0 ].accumulation.textures.map( texture => texture.name ), [ 'output', 'direction' ], 'Moments share the direction target, two RGBA32F targets fit the 32 bytes per sample WebGPU guarantees' );
				assert.strictEqual( moments.momentTexture, moments._pages[ 0 ].accumulation.textures[ 1 ], 'The moments are in the direction sums' );
				assert.strictEqual( moments.momentChannel, 'a', 'in their alpha channel' );
				assert.strictEqual( moments.momentTexture.format, moments.pages[ 0 ].sampleTexture.format );
				moments.dispose();

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
				const targets = [];
				const rendered = [];
				const renderer = createRenderer( {
					setRenderTarget: target => targets.push( target ),
					render: scene => scene.isScene && rendered.push( { target: targets.at( - 1 ), children: scene.children } )
				} );
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ), { pages: 2 } );
				mapper.addObjects( [ ...meshes, instanced ] );
				mapper.addObjects( [ meshes[ 0 ] ], { page: 1 } );
				assert.strictEqual( mapper.pages.length, 2 );
				assert.strictEqual( mapper.texture, mapper.pages[ 0 ].texture, 'The textures of the light mapper are the ones of the first page' );
				assert.deepEqual( mapper.pages[ 0 ].objects, [ meshes[ 0 ], meshes[ 3 ] ], 'Meshes without a page bake into the first one' );
				assert.deepEqual( mapper.pages[ 1 ].objects, [ meshes[ 1 ], meshes[ 2 ], instanced, meshes[ 0 ] ], 'The page option overrides lightMapPage' );
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
