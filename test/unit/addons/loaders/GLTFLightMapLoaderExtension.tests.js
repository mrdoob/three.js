import { LinearSRGBColorSpace, SRGBColorSpace } from '../../../../src/Three.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { GLTFLightMapLoaderExtension } from '../../../../examples/jsm/loaders/GLTFLightMapLoaderExtension.js';

function createAsset( extension, unlit = false ) {

	const vertices = new Float32Array( [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ] );
	const canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 2;
	canvas.getContext( '2d' ).fillRect( 0, 0, 2, 2 );
	const material = { pbrMetallicRoughness: { baseColorTexture: { index: 0 } }, extensions: {} };
	if ( extension ) material.extensions.MOZ_lightmap = extension;
	if ( unlit ) material.extensions.KHR_materials_unlit = {};
	return {
		asset: { version: '2.0' },
		extensionsUsed: [ 'MOZ_lightmap', 'KHR_texture_transform', ...( unlit ? [ 'KHR_materials_unlit' ] : [] ) ],
		scenes: [ { nodes: [ 0 ] } ], scene: 0,
		nodes: [ { mesh: 0 } ],
		meshes: [ { primitives: [ { attributes: { POSITION: 0, TEXCOORD_0: 1, TEXCOORD_1: 2 }, material: 0 } ] } ],
		materials: [ material ],
		textures: [ { source: 0 } ], images: [ { uri: canvas.toDataURL() } ],
		buffers: [ { uri: 'data:application/octet-stream;base64,' + btoa( String.fromCharCode( ...new Uint8Array( vertices.buffer ) ) ), byteLength: vertices.byteLength } ],
		bufferViews: [ { buffer: 0, byteOffset: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 24 }, { buffer: 0, byteOffset: 60, byteLength: 24 } ],
		accessors: [ { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [ 0, 0, 0 ], max: [ 1, 1, 0 ] }, { bufferView: 1, componentType: 5126, count: 3, type: 'VEC2' }, { bufferView: 2, componentType: 5126, count: 3, type: 'VEC2' } ]
	};

}

async function loadMaterial( extension, unlit = false ) {

	const loader = new GLTFLoader();
	loader.register( parser => new GLTFLightMapLoaderExtension( parser ) );
	const gltf = await loader.parseAsync( JSON.stringify( createAsset( extension, unlit ) ), '' );
	return gltf.scene.children[ 0 ].material;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GLTFLightMapLoaderExtension', () => {

			QUnit.test( 'PBR and unlit light maps', async assert => {

				for ( const unlit of [ false, true ] ) {

					const material = await loadMaterial( { index: 0, texCoord: 1, intensity: 2.5 }, unlit );
					assert.ok( material.lightMap, 'Loads the light map' );
					assert.strictEqual( material.lightMapIntensity, 2.5 );
					assert.strictEqual( material.lightMap.channel, 1 );
					assert.strictEqual( material.lightMap.flipY, false );
					assert.strictEqual( material.lightMap.colorSpace, LinearSRGBColorSpace );
					assert.strictEqual( material.map.colorSpace, SRGBColorSpace, 'Shared base color stays sRGB' );
					assert.notStrictEqual( material.lightMap, material.map );
					assert.strictEqual( material.isMeshBasicMaterial === true, unlit );

				}

			} );

			QUnit.test( 'Defaults, explicit zero values and texture transforms', async assert => {

				const defaults = await loadMaterial( { index: 0 } );
				assert.strictEqual( defaults.lightMap.channel, 1 );
				assert.strictEqual( defaults.lightMapIntensity, 1 );

				const transformed = await loadMaterial( { index: 0, texCoord: 0, intensity: 0, extensions: { KHR_texture_transform: { offset: [ 0.25, 0.5 ], scale: [ 0.5, 0.75 ], rotation: 0.3 } } } );
				assert.strictEqual( transformed.lightMap.channel, 0 );
				assert.strictEqual( transformed.lightMapIntensity, 0 );
				assert.deepEqual( transformed.lightMap.offset.toArray(), [ 0.25, 0.5 ] );
				assert.deepEqual( transformed.lightMap.repeat.toArray(), [ 0.5, 0.75 ] );
				assert.strictEqual( transformed.lightMap.rotation, 0.3 );
				assert.strictEqual( transformed.map.colorSpace, SRGBColorSpace );

			} );

			QUnit.test( 'Materials without the extension', async assert => {

				const material = await loadMaterial();
				assert.strictEqual( material.lightMap, null );
				assert.strictEqual( material.map.colorSpace, SRGBColorSpace );

			} );

		} );

	} );

} );
