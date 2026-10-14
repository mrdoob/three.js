import { BoxGeometry, DataTexture, Float32BufferAttribute, FloatType, InstancedBufferAttribute, InstancedMesh, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, MeshStandardMaterial, Scene, SRGBColorSpace, Vector2 } from '../../../../src/Three.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';
import { GLTFLightMapLoaderExtension } from '../../../../examples/jsm/loaders/GLTFLightMapLoaderExtension.js';
import { GLTFLightMapExporterExtension } from '../../../../examples/jsm/exporters/GLTFLightMapExporterExtension.js';

function fixture() {

	const canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 1;
	const context = canvas.getContext( '2d' );
	context.fillStyle = 'rgb(128, 64, 32)';
	context.fillRect( 0, 0, 1, 1 );
	const json = {
		asset: { version: '2.1', minVersion: '2.1' },
		extensionsUsed: [ 'KHR_lightmap', 'KHR_texture_transform', 'EXT_mesh_gpu_instancing', 'KHR_materials_unlit' ],
		scene: 0,
		scenes: [ { nodes: [ 0 ] } ],
		nodes: [ { mesh: 0 } ],
		meshes: [ { primitives: [ { attributes: {}, material: 0 } ] } ],
		materials: [ { extensions: { KHR_lightmap: { lightmapTexture: { index: 0 } } } } ],
		textures: [ { source: 0 } ],
		images: [ { uri: canvas.toDataURL() } ],
		buffers: [], bufferViews: [], accessors: []
	};

	function accessor( values, type, size ) {

		const data = new Float32Array( values );
		let binary = '';
		for ( const byte of new Uint8Array( data.buffer ) ) binary += String.fromCharCode( byte );
		const buffer = json.buffers.push( { byteLength: data.byteLength, uri: 'data:application/octet-stream;base64,' + btoa( binary ) } ) - 1;
		const bufferView = json.bufferViews.push( { buffer, byteLength: data.byteLength } ) - 1;
		const entry = { bufferView, type, componentType: 5126, count: values.length / size };
		if ( type === 'VEC3' ) {

			entry.min = [ 0, 0, 0 ];
			entry.max = [ 1, 1, 1 ];

		}

		return json.accessors.push( entry ) - 1;

	}

	json.meshes[ 0 ].primitives[ 0 ].attributes = {
		POSITION: accessor( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 'VEC3', 3 ),
		TEXCOORD_0: accessor( [ 0.2, 0.4, 1, 0, 0, 1 ], 'VEC2', 2 ),
		TEXCOORD_1: accessor( [ 0.2, 0.4, 1, 0, 0, 1 ], 'VEC2', 2 )
	};
	return { json, accessor };

}

function load( json ) {

	return new GLTFLoader().register( parser => new GLTFLightMapLoaderExtension( parser ) ).parseAsync( JSON.stringify( json ), '' );

}

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < 1e-6, message + ': ' + actual + ' ~= ' + expected );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'KHR_lightmap', () => {

		QUnit.test( 'linear irradiance and defaults apply equally to PBR and unlit', async assert => {

			for ( const unlit of [ false, true ] ) {

				const { json } = fixture();
				if ( unlit ) json.materials[ 0 ].extensions.KHR_materials_unlit = {};
				const gltf = await load( json );
				const material = gltf.scene.children[ 0 ].material;
				assert.strictEqual( material.lightMap.colorSpace, LinearSRGBColorSpace, 'uses linear irradiance' );
				assert.strictEqual( material.lightMap.channel, 0, 'defaults to TEXCOORD_0' );
				assert.strictEqual( material.lightMapIntensity, 1, 'defaults to one without unlit PI correction' );

			}

		} );

		QUnit.test( 'node replacements isolate shared meshes and replace all binding defaults', async assert => {

			const { json } = fixture();
			json.materials[ 0 ].extensions.KHR_lightmap = { lightmapTexture: { index: 0, texCoord: 1, extensions: { KHR_texture_transform: { offset: [ 0.5, 0 ], scale: [ 0.5, 0.5 ] } } }, intensity: 3 };
			json.meshes[ 0 ].primitives.push( { ...json.meshes[ 0 ].primitives[ 0 ] } );
			json.nodes.push( { mesh: 0, extensions: { KHR_lightmap: { lightmaps: [ { primitive: 0, lightmapTexture: { index: 0 }, intensity: 0 } ] } } } );
			json.scenes[ 0 ].nodes.push( 1 );
			const gltf = await load( json );
			const original = gltf.scene.children[ 0 ].children;
			const replacement = gltf.scene.children[ 1 ].children;
			assert.strictEqual( original[ 0 ].material.lightMapIntensity, 3, 'original node retains its material binding' );
			assert.strictEqual( replacement[ 0 ].material.lightMapIntensity, 0, 'zero disables the selected primitive' );
			assert.strictEqual( replacement[ 0 ].material.lightMap.channel, 0, 'replacement does not inherit UV selection' );
			assert.deepEqual( replacement[ 0 ].material.lightMap.offset.toArray(), [ 0, 0 ], 'replacement does not inherit transform' );
			assert.strictEqual( replacement[ 1 ].material.lightMapIntensity, 3, 'unselected primitive retains binding' );
			assert.notStrictEqual( replacement[ 0 ].material, original[ 0 ].material, 'does not mutate shared material' );

		} );

		QUnit.test( 'GPU instance transforms apply after binding with rotation and identity defaults', async assert => {

			for ( const rotation of [ undefined, Math.PI / 2 ] ) {

				const { json, accessor } = fixture();
				json.materials[ 0 ].extensions.KHR_lightmap.lightmapTexture.extensions = { KHR_texture_transform: { scale: [ 0.5, 0.5 ] } };
				const attributes = { TRANSLATION: accessor( [ 0, 0, 0, 1, 0, 0 ], 'VEC3', 3 ), _LIGHTMAP_OFFSET: accessor( [ 0.5, 0, 0, 0 ], 'VEC2', 2 ) };
				if ( rotation !== undefined ) attributes._LIGHTMAP_ROTATION = accessor( [ rotation, 0 ], 'SCALAR', 1 );
				else attributes._LIGHTMAP_SCALE = accessor( [ 0.5, 1, 1, 1 ], 'VEC2', 2 );
				json.nodes[ 0 ].extensions = { EXT_mesh_gpu_instancing: { attributes } };
				const gltf = await load( json );
				const meshes = [];
				gltf.scene.traverse( object => {

					if ( object.isMesh ) meshes.push( object );

				} );
				assert.strictEqual( meshes.length, 2, 'expands both instances' );
				const map = meshes[ 0 ].material.lightMap;
				const uv = new Vector2().fromBufferAttribute( meshes[ 0 ].geometry.getAttribute( map.channel === 0 ? 'uv' : `uv${ map.channel }` ), 0 ).applyMatrix3( map.matrix );
				closeTo( assert, uv.x, rotation === undefined ? 0.55 : 0.3, 'binding precedes instance transform: x' );
				closeTo( assert, uv.y, rotation === undefined ? 0.2 : 0.1, 'binding precedes instance transform: y' );
				const identityMap = meshes[ 1 ].material.lightMap;
				const identityUV = new Vector2().fromBufferAttribute( meshes[ 1 ].geometry.getAttribute( identityMap.channel === 0 ? 'uv' : `uv${ identityMap.channel }` ), 0 ).applyMatrix3( identityMap.matrix );
				closeTo( assert, identityUV.x, 0.1, 'second instance identity x' );
				closeTo( assert, identityUV.y, 0.2, 'second instance identity y' );

			}

		} );


		QUnit.test( 'binding rotation follows glTF ordering with nonuniform scale', async assert => {

			const { json } = fixture();
			json.materials[ 0 ].extensions.KHR_lightmap.lightmapTexture.extensions = { KHR_texture_transform: { offset: [ 0.5, 0 ], scale: [ 0.5, 0.25 ], rotation: Math.PI / 2 } };
			const gltf = await load( json );
			const map = gltf.scene.children[ 0 ].material.lightMap;
			const uv = new Vector2( 0.2, 0.4 ).applyMatrix3( map.matrix );
			closeTo( assert, uv.x, 0.4, 'scale then rotate then translate x' );
			closeTo( assert, uv.y, 0.1, 'scale then rotate then translate y' );

		} );

		QUnit.test( 'node binding supplies a lightmap to the core default material', async assert => {

			const { json } = fixture();
			delete json.meshes[ 0 ].primitives[ 0 ].material;
			delete json.materials;
			json.nodes[ 0 ].extensions = { KHR_lightmap: { lightmaps: [ { primitive: 0, lightmapTexture: { index: 0 } } ] } };
			const gltf = await load( json );
			const material = gltf.scene.children[ 0 ].material;
			assert.ok( material.lightMap, 'node creates effective binding without explicit material' );
			assert.strictEqual( material.lightMapIntensity, 1, 'node intensity defaults independently' );

		} );

		QUnit.test( 'unlit lightmap retains independent ambient occlusion binding', async assert => {

			const { json } = fixture();
			json.materials[ 0 ].extensions.KHR_materials_unlit = {};
			json.materials[ 0 ].occlusionTexture = { index: 0, texCoord: 1, strength: 0.4 };
			const gltf = await load( json );
			const material = gltf.scene.children[ 0 ].material;
			assert.ok( material.aoMap, 'unlit baked preview loads AO' );
			assert.strictEqual( material.aoMap.channel, 1, 'AO keeps its own UV set' );
			assert.strictEqual( material.lightMap.channel, 0, 'lightmap keeps its own UV set' );
			assert.strictEqual( material.aoMapIntensity, 0.4, 'AO strength is retained' );
			assert.notStrictEqual( material.aoMap, material.lightMap, 'shared image does not share slot properties' );

		} );


		QUnit.test( 'node-only unlit binding retains occlusion strength and UV transform', async assert => {

			const { json } = fixture();
			delete json.materials[ 0 ].extensions.KHR_lightmap;
			json.materials[ 0 ].extensions.KHR_materials_unlit = {};
			json.materials[ 0 ].occlusionTexture = { index: 0, texCoord: 1, strength: 0.3, extensions: { KHR_texture_transform: { offset: [ 0.25, 0.5 ], scale: [ 0.5, 0.25 ] } } };
			json.nodes[ 0 ].extensions = { KHR_lightmap: { lightmaps: [ { primitive: 0, lightmapTexture: { index: 0 } } ] } };
			const gltf = await load( json );
			const material = gltf.scene.children[ 0 ].material;
			assert.ok( material.isMeshBasicMaterial, 'keeps unlit material' );
			assert.ok( material.aoMap, 'node-only lightmap enables unlit occlusion' );
			assert.strictEqual( material.aoMap.channel, 1, 'keeps AO UV set' );
			assert.strictEqual( material.aoMapIntensity, 0.3, 'keeps AO strength' );
			assert.deepEqual( material.aoMap.offset.toArray(), [ 0.25, 0.5 ], 'keeps AO offset' );
			assert.deepEqual( material.aoMap.repeat.toArray(), [ 0.5, 0.25 ], 'keeps AO scale' );
			assert.deepEqual( material.lightMap.offset.toArray(), [ 0, 0 ], 'lightmap keeps independent transform' );

		} );

		QUnit.test( 'mesh node with camera applies primitive bindings without inheritance to children', async assert => {

			const { json } = fixture();
			delete json.materials[ 0 ].extensions.KHR_lightmap;
			json.meshes[ 0 ].primitives.push( { ...json.meshes[ 0 ].primitives[ 0 ] } );
			json.cameras = [ { type: 'perspective', perspective: { yfov: 1, znear: 0.1 } } ];
			json.nodes[ 0 ].camera = 0;
			json.nodes[ 0 ].children = [ 1 ];
			json.nodes[ 0 ].extensions = { KHR_lightmap: { lightmaps: [ { primitive: 1, lightmapTexture: { index: 0 }, intensity: 2 } ] } };
			json.nodes.push( { mesh: 0, name: 'unbound_child' } );
			const gltf = await load( json );
			const parent = gltf.scene.children[ 0 ];
			const child = parent.getObjectByName( 'unbound_child' );
			const parentMeshes = [];
			parent.traverse( object => {

				if ( object.isMesh && ! child.children.includes( object ) ) parentMeshes.push( object );

			} );
			assert.strictEqual( parentMeshes.length, 2, 'discovers primitives in attached mesh group' );
			assert.notOk( parentMeshes[ 0 ].material.lightMap, 'first primitive remains unbound' );
			assert.strictEqual( parentMeshes[ 1 ].material.lightMapIntensity, 2, 'second primitive receives node replacement' );
			assert.ok( parent.children.some( object => object.isCamera ), 'retains camera attachment' );
			child.traverse( object => {

				if ( object.isMesh ) assert.notOk( object.material.lightMap, 'child node does not inherit parent binding' );

			} );

		} );

		QUnit.test( 'export round trip keeps linear samples, UVs, transforms and intensity', async assert => {

			for ( const Material of [ MeshStandardMaterial, MeshBasicMaterial ] ) {

				const texture = new DataTexture( new Uint8Array( [ 128, 64, 32, 255 ] ), 1, 1 );
				texture.colorSpace = LinearSRGBColorSpace;
				texture.channel = 1;
				texture.offset.set( 0.25, 0.5 );
				texture.repeat.set( 0.5, 0.25 );
				const geometry = new BoxGeometry();
				geometry.setAttribute( 'uv1', new Float32BufferAttribute( geometry.attributes.uv.array.slice(), 2 ) );
				const scene = new Scene();
				scene.add( new Mesh( geometry, new Material( { lightMap: texture, lightMapIntensity: 4 } ) ) );
				const exporter = new GLTFExporter().register( writer => new GLTFLightMapExporterExtension( writer ) );
				const json = await exporter.parseAsync( scene );
				assert.strictEqual( json.asset.version, '2.1', 'requires glTF 2.1' );
				assert.strictEqual( json.asset.minVersion, '2.1', 'declares minimum version' );
				const binding = json.materials[ 0 ].extensions.KHR_lightmap;
				assert.strictEqual( binding.lightmapTexture.texCoord, 1, 'uses nested textureInfo' );
				assert.strictEqual( binding.intensity, 4, 'keeps intensity for PBR and unlit' );
				assert.notOk( json.extensionsUsed.includes( 'MOZ_lightmap' ), 'does not declare MOZ_lightmap' );
				assert.deepEqual( Array.from( texture.image.data ), [ 128, 64, 32, 255 ], 'does not alter source samples' );
				const gltf = await load( json );
				const map = gltf.scene.children[ 0 ].material.lightMap;
				assert.deepEqual( map.offset.toArray(), [ 0.25, 0.5 ], 'round trips offset' );
				assert.deepEqual( map.repeat.toArray(), [ 0.5, 0.25 ], 'round trips scale' );
				const canvas = document.createElement( 'canvas' );
				canvas.width = canvas.height = 1;
				const context = canvas.getContext( '2d' );
				context.drawImage( map.image, 0, 0 );
				assert.deepEqual( Array.from( context.getImageData( 0, 0, 1, 1 ).data ), [ 128, 64, 32, 255 ], 'preserves linear encoded image bytes' );

			}

		} );


		QUnit.test( 'HDR float textures require explicit normalization without mutating source', async assert => {

			const pixels = new Float32Array( [ 4, 2, 0.5, 1 ] );
			const texture = new DataTexture( pixels, 1, 1 );
			texture.type = FloatType;
			texture.colorSpace = LinearSRGBColorSpace;
			const scene = new Scene();
			scene.add( new Mesh( new BoxGeometry(), new MeshStandardMaterial( { lightMap: texture } ) ) );
			const exporter = new GLTFExporter().register( writer => new GLTFLightMapExporterExtension( writer ) );
			await assert.rejects( exporter.parseAsync( scene ), /Normalize HDR irradiance/, 'rejects lossy float conversion with normalization guidance' );
			assert.deepEqual( Array.from( texture.image.data ), [ 4, 2, 0.5, 1 ], 'does not alter HDR source samples' );

		} );

		QUnit.test( 'export decodes sRGB samples into linear irradiance without mutating source', async assert => {

			const texture = new DataTexture( new Uint8Array( [ 128, 64, 32, 255 ] ), 1, 1 );
			texture.colorSpace = SRGBColorSpace;
			const scene = new Scene();
			scene.add( new Mesh( new BoxGeometry(), new MeshStandardMaterial( { lightMap: texture } ) ) );
			const json = await new GLTFExporter().register( writer => new GLTFLightMapExporterExtension( writer ) ).parseAsync( scene );
			const gltf = await load( json );
			const canvas = document.createElement( 'canvas' );
			canvas.width = canvas.height = 1;
			const context = canvas.getContext( '2d' );
			context.drawImage( gltf.scene.children[ 0 ].material.lightMap.image, 0, 0 );
			assert.deepEqual( Array.from( context.getImageData( 0, 0, 1, 1 ).data ), [ 55, 13, 4, 255 ], 'stores decoded linear image bytes' );
			assert.deepEqual( Array.from( texture.image.data ), [ 128, 64, 32, 255 ], 'preserves source image bytes' );
			assert.strictEqual( texture.colorSpace, SRGBColorSpace, 'preserves source color space' );

		} );

		QUnit.test( 'exports lightmap instance attributes only in EXT_mesh_gpu_instancing', async assert => {

			const geometry = new BoxGeometry();
			geometry.setAttribute( '_LIGHTMAP_OFFSET', new InstancedBufferAttribute( new Float32Array( [ 0, 0, 0.5, 0 ] ), 2 ) );
			geometry.setAttribute( '_LIGHTMAP_SCALE', new InstancedBufferAttribute( new Float32Array( [ 0.5, 1, 0.5, 1 ] ), 2 ) );
			geometry.setAttribute( '_LIGHTMAP_ROTATION', new InstancedBufferAttribute( new Float32Array( [ 0, Math.PI / 2 ] ), 1 ) );
			const texture = new DataTexture( new Uint8Array( [ 128, 64, 32, 255 ] ), 1, 1 );
			texture.colorSpace = LinearSRGBColorSpace;
			const scene = new Scene();
			scene.add( new InstancedMesh( geometry, new MeshStandardMaterial( { lightMap: texture } ), 2 ) );
			const json = await new GLTFExporter().register( writer => new GLTFLightMapExporterExtension( writer ) ).parseAsync( scene );
			const attributes = json.nodes.find( node => node.mesh !== undefined ).extensions.EXT_mesh_gpu_instancing.attributes;
			for ( const name of [ '_LIGHTMAP_OFFSET', '_LIGHTMAP_SCALE', '_LIGHTMAP_ROTATION' ] ) {

				assert.strictEqual( json.accessors[ attributes[ name ] ].count, 2, name + ' has instance count' );
				assert.notOk( name in json.meshes[ 0 ].primitives[ 0 ].attributes, name + ' is not a vertex attribute' );

			}

		} );

	} );

} );
