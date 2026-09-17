import { LoadingManager } from 'three';
import { MaterialXLoader } from '../../../../examples/jsm/loaders/MaterialXLoader.js';
import { MtlXLibrary } from '../../../../examples/jsm/loaders/materialx/MaterialXNodeLibrary.js';
import { createMaterialXCompileRegistry } from '../../../../examples/jsm/loaders/materialx/compile/MaterialXCompileRegistry.js';
import registryData from '../../../../examples/jsm/loaders/materialx/MaterialXNodeInterfaceRegistry.js';

const MATERIAL_X = `<?xml version="1.0"?>
<materialx version="1.39">
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" output="out" nodegraph="test_graph" />
	</standard_surface>
	<nodegraph name="test_graph">
		<image name="test_image" type="color3">
			<input name="file" type="filename" value="texture.test" />
		</image>
		<output name="out" type="color3" nodename="test_image" />
	</nodegraph>
</materialx>`;

class ControlledTextureLoader {

	constructor( manager ) {

		this.manager = manager;
		this.pending = [];
		this.started = new Promise( ( resolve ) => {

			this.resolveStarted = resolve;

		} );

	}

	load( url, onLoad, onProgress, onError ) {

		this.manager.itemStart( url );
		this.pending.push( { url, onLoad, onError } );
		this.resolveStarted();
		return this;

	}

	succeed( image ) {

		const { url, onLoad } = this.pending.shift();
		onLoad( image );
		this.manager.itemEnd( url );

	}

	fail( error ) {

		const { url, onError } = this.pending.shift();
		onError( error );
		this.manager.itemError( url );
		this.manager.itemEnd( url );

	}

}

function createDocumentURL() {

	return URL.createObjectURL( new Blob( [ MATERIAL_X ], { type: 'application/xml' } ) );

}

function hasTextureImage( object, image, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 10 ) return false;
	if ( object.isTexture === true && object.image === image ) return true;
	if ( visited.has( object ) ) return false;

	visited.add( object );

	for ( const key of Object.keys( object ) ) {

		if ( hasTextureImage( object[ key ], image, visited, depth + 1 ) ) return true;

	}

	return false;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'MaterialXLoader', () => {

			QUnit.test( 'waits for dependent textures before resolving', async ( assert ) => {

				const progressURLs = [];
				const manager = new LoadingManager( undefined, ( url ) => progressURLs.push( url ) );
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				let resolved = false;
				loadPromise.then( () => {

					resolved = true;

				} );

				await textureLoader.started;
				await Promise.resolve();
				assert.false( resolved, 'The MaterialX load remains pending while its texture is pending.' );

				const image = { width: 1, height: 1 };
				textureLoader.succeed( image );
				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;

				assert.true( hasTextureImage( material, image ), 'The texture image is assigned before the load resolves.' );
				assert.ok( progressURLs.includes( 'texture.test' ), 'LoadingManager reports dependent texture progress.' );

			} );

			QUnit.test( 'reports failed dependent textures as warnings, matching GLTFLoader', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;
				textureLoader.fail( new Error( 'Texture unavailable.' ) );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				assert.strictEqual( result.errors.length, 0, 'A failed texture does not fail the load by default.' );
				assert.strictEqual( result.warnings.length, 1, 'The texture failure is reported as a warning.' );
				assert.strictEqual( result.warnings[ 0 ].code, 'texture-load-failed', 'The warning uses the structured MaterialX log code.' );

			} );

			QUnit.test( 'keeps LoadingManager active through the loader callback', async ( assert ) => {

				let managerComplete = false;
				const manager = new LoadingManager( () => {

					managerComplete = true;

				} );
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new Promise( ( resolve, reject ) => {

					new MaterialXLoader( manager ).load( documentURL, ( result ) => {

						assert.false( managerComplete, 'LoadingManager remains active while the loader callback runs.' );
						resolve( result );

					}, undefined, reject );

				} );

				await textureLoader.started;
				textureLoader.succeed( { width: 1, height: 1 } );
				await loadPromise;
				URL.revokeObjectURL( documentURL );

				assert.true( managerComplete, 'LoadingManager completes after the loader callback.' );

			} );


			QUnit.test( 'applies nodedef defaults to inputs the document omits', ( assert ) => {

				const document = `<?xml version="1.0"?>
<materialx version="1.39">
	<constant name="test_constant" type="color3" />
	<convert name="test_convert" type="vector3" />
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" nodename="test_constant" />
		<input name="normal" type="vector3" nodename="test_convert" />
	</standard_surface>
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
</materialx>`;

				const result = new MaterialXLoader().parse( document );

				assert.strictEqual( result.errors.length, 0, 'Omitted inputs on constant and convert do not produce errors.' );
				assert.strictEqual( result.warnings.length, 0, 'Omitted inputs do not produce warnings.' );
				assert.ok( result.materials.test_material, 'The material is translated.' );

			} );

			QUnit.test( 'has a nodedef default for every input of every supported node', ( assert ) => {

				const supported = new Set( [ ...Object.keys( MtlXLibrary ), ...createMaterialXCompileRegistry().keys(), 'ifgreater', 'ifgreatereq', 'ifequal' ] );
				const convertible = new Set( [ 'float', 'integer', 'boolean', 'vector2', 'vector3', 'vector4', 'color3', 'color4' ] );
				const problems = [];
				let count = 0;

				for ( const [ category, nodedefNames ] of Object.entries( registryData.byNode ) ) {

					if ( supported.has( category ) === false ) continue;

					const outputTypes = new Set( nodedefNames.map( ( name ) => registryData.nodedefs[ name ].outputs.out ).filter( ( type ) => convertible.has( type ) ) );

					for ( const type of outputTypes ) {

						const document = `<?xml version="1.0"?>
<materialx version="1.39">
	<${category} name="test_node" type="${type}" />
	<convert name="test_convert" type="color3">
		<input name="in" type="${type}" nodename="test_node" />
	</convert>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" nodename="test_convert" />
	</standard_surface>
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
</materialx>`;

						const result = new MaterialXLoader().parse( document, { throwOnErrors: false } );
						const messages = [ ...result.errors, ...result.warnings ].map( ( entry ) => entry.message ).filter( ( message ) => /texture|file/i.test( message ) === false );
						if ( messages.length > 0 ) problems.push( `${category} (${type}): ${messages.join( ' ' )}` );
						count ++;

					}

				}

				assert.ok( count > 300, `Checked ${count} node and output type combinations.` );
				assert.deepEqual( problems, [], 'Every supported node translates with all inputs omitted.' );

			} );

			QUnit.test( 'surface shaders use nodedef defaults for omitted inputs', ( assert ) => {

				const translate = ( shader ) => new MaterialXLoader().parse( `<?xml version="1.0"?>
<materialx version="1.39">
	${shader}
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
</materialx>` ).materials.test_material;

				const standardSurface = translate( `<standard_surface name="test_surface" type="surfaceshader">
		<input name="emission_color" type="color3" value="1, 0, 0" />
		<input name="coat" type="float" value="1" />
	</standard_surface>` );

				assert.strictEqual( standardSurface.emissiveNode, null, 'standard_surface: emission_color without emission (default 0) does not emit.' );
				assert.ok( standardSurface.clearcoatRoughnessNode, 'standard_surface: coat without coat_roughness uses the nodedef default.' );

				const openPbrSurface = translate( `<open_pbr_surface name="test_surface" type="surfaceshader">
		<input name="fuzz_weight" type="float" value="1" />
		<input name="thin_film_weight" type="float" value="1" />
	</open_pbr_surface>` );

				assert.ok( openPbrSurface.sheenRoughnessNode, 'open_pbr_surface: fuzz without fuzz_roughness uses the nodedef default.' );
				assert.ok( openPbrSurface.iridescenceThicknessNode, 'open_pbr_surface: thin film without thickness uses the nodedef default.' );
				assert.ok( openPbrSurface.iridescenceIORNode, 'open_pbr_surface: thin film without ior uses the nodedef default.' );

				const gltfOpaque = translate( `<gltf_pbr name="test_surface" type="surfaceshader">
		<input name="alpha" type="float" value="0.5" />
	</gltf_pbr>` );

				assert.false( gltfOpaque.transparent, 'gltf_pbr: alpha without alpha_mode (default OPAQUE) is not transparent.' );

				const gltfBlend = translate( `<gltf_pbr name="test_surface" type="surfaceshader">
		<input name="alpha" type="float" value="0.5" />
		<input name="alpha_mode" type="integer" value="2" />
	</gltf_pbr>` );

				assert.true( gltfBlend.transparent, 'gltf_pbr: alpha with alpha_mode BLEND is transparent.' );

			} );


			QUnit.test( 'resolves nodedef overloads without a nodedef attribute', ( assert ) => {

				const document = `<?xml version="1.0"?>
<materialx version="1.39">
	<texcoord name="test_uv" type="vector2" />
	<transformmatrix name="test_transform" type="vector2">
		<input name="in" type="vector2" nodename="test_uv" />
		<input name="mat" type="matrix33" value="2,0,0, 0,2,0, 0.5,0.5,1" />
	</transformmatrix>
	<creatematrix name="test_matrix" type="matrix44">
		<input name="in1" type="vector3" value="1,0,0" />
	</creatematrix>
	<transformpoint name="test_point" type="vector3" />
	<convert name="test_convert" type="color3">
		<input name="in" type="vector2" nodename="test_transform" />
	</convert>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" nodename="test_convert" />
	</standard_surface>
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
</materialx>`;

				const result = new MaterialXLoader().parse( document );

				assert.strictEqual( result.errors.length, 0, 'Overloads selected by input types translate without errors.' );
				assert.strictEqual( result.warnings.length, 0, 'Overloads selected by input types translate without warnings.' );

			} );

		} );

	} );

} );
