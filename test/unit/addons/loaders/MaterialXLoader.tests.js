import { ClampToEdgeWrapping, CompressedTexture, DataTexture, HalfFloatType, LinearFilter, LinearSRGBColorSpace, LoadingManager, NearestFilter, RedFormat, RepeatWrapping, RGB_S3TC_DXT1_Format, SRGBColorSpace } from 'three';
import { mul, vec3 } from 'three/tsl';
import { MaterialXLoader } from '../../../../examples/jsm/loaders/MaterialXLoader.js';
import { MtlXLibrary } from '../../../../examples/jsm/loaders/materialx/MaterialXNodeLibrary.js';
import { createMaterialXCompileRegistry } from '../../../../examples/jsm/loaders/materialx/compile/MaterialXCompileRegistry.js';
import registryData from '../../../../examples/jsm/loaders/materialx/MaterialXNodeInterfaceRegistry.js';
import { getNodeDefNames } from '../../../../examples/jsm/loaders/materialx/MaterialXNodeDefs.js';
import { createStrictInterfaceValidator } from '../../../../examples/jsm/loaders/materialx/MaterialXInterfaceValidation.js';

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

const MATERIAL_X_DISPLACEMENT = `<?xml version="1.0"?>
<materialx version="1.39">
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
		<input name="displacementshader" type="displacementshader" nodename="test_displacement" />
	</surfacematerial>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" value="0.5, 0.5, 0.5" />
	</standard_surface>
	<displacement name="test_displacement" type="displacementshader">
		<input name="displacement" type="float" value="0.25" />
		<input name="scale" type="float" value="2.0" />
	</displacement>
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

function createDocumentURL( text = MATERIAL_X ) {

	return URL.createObjectURL( new Blob( [ text ], { type: 'application/xml' } ) );

}

function findTexture( object, image, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 10 ) return null;
	if ( object.isTextureNode === true ) return findTexture( object.value, image, visited, depth + 1 );
	if ( object.isTexture === true && object.image === image ) return object;
	if ( visited.has( object ) ) return null;

	visited.add( object );

	for ( const key of Object.keys( object ) ) {

		const found = findTexture( object[ key ], image, visited, depth + 1 );
		if ( found ) return found;

	}

	return null;

}

function collectConstValues( object, values = [], visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 24 || visited.has( object ) ) return values;

	visited.add( object );
	if ( object.isConstNode === true ) values.push( object.value );

	for ( const key of Object.keys( object ) ) collectConstValues( object[ key ], values, visited, depth + 1 );

	return values;

}

function hasNode( object, predicate, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 24 || visited.has( object ) ) return false;

	visited.add( object );
	if ( object.isNode === true && predicate( object ) ) return true;

	return Object.keys( object ).some( ( key ) => hasNode( object[ key ], predicate, visited, depth + 1 ) );

}

function collectFunctionLayouts( object, layouts = new Set(), visited = new WeakSet(), depth = 0 ) {

	// TSL functions (Fn) are function objects that carry their layout.
	if ( object === null || ( typeof object !== 'object' && typeof object !== 'function' ) || depth > 24 || visited.has( object ) ) return layouts;

	visited.add( object );
	if ( typeof object.layout?.type === 'string' ) layouts.add( object.layout );
	if ( typeof object === 'function' ) collectFunctionLayouts( object.shaderNode, layouts, visited, depth + 1 );

	for ( const key of Object.keys( object ) ) collectFunctionLayouts( object[ key ], layouts, visited, depth + 1 );

	return layouts;

}

function parseNodeGraph( body, type ) {

	const text = `<?xml version="1.0"?>
<materialx version="1.39">
	<nodegraph name="test_graph">
		${ body }
		<output name="out" type="${ type }" nodename="test_node" />
	</nodegraph>
</materialx>`;

	return new MaterialXLoader().parse( text, { throwOnErrors: false } );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'MaterialXLoader', () => {

			QUnit.test( 'builds nodes of a host node library through the node resolver', ( assert ) => {

				const text = `<?xml version="1.0"?>
<materialx version="1.39">
	<nodegraph name="test_graph">
		<custom_double name="doubled" type="float">
			<input name="in" type="float" value="0.25" />
		</custom_double>
		<add name="sum" type="float">
			<input name="in1" type="float" nodename="doubled" />
			<input name="in2" type="float" value="0.5" />
		</add>
		<output name="out" type="float" nodename="sum" />
	</nodegraph>
</materialx>`;

				const resolved = [];
				const nodeResolver = ( nodeX, output ) => {

					resolved.push( nodeX.element );
					if ( nodeX.element !== 'custom_double' ) return null;

					assert.strictEqual( output, null, 'The resolver receives the requested output.' );
					assert.strictEqual( nodeX.getChildByName( 'in' ).value, '0.25', 'The resolver reads the inputs.' );
					return mul( nodeX.getNodeByName( 'in' ), 2 );

				};

				const loader = new MaterialXLoader();
				const result = loader.parse( text, { nodeResolver } );
				const values = collectConstValues( result.materials.test_graph.colorNode );

				assert.strictEqual( result.errors.length, 0, 'The custom node is not unsupported.' );
				assert.true( resolved.includes( 'add' ), 'The resolver is asked about every node.' );
				assert.true( values.includes( 2 ) && values.includes( 0.5 ), 'The resolved node and the loader-built node are both part of the graph.' );

				// A channel output takes the channel of the resolved node, as for the loader's own nodes.
				const channelText = text.replace( '<input name="in1" type="float" nodename="doubled" />', '<input name="in1" type="float" nodename="doubled" output="outy" />' ).replace( 'name="doubled" type="float"', 'name="doubled" type="vector3"' );
				const outputs = [];
				const channelResult = loader.parse( channelText, { nodeResolver: ( nodeX, output ) => {

					if ( nodeX.element !== 'custom_double' ) return null;
					outputs.push( output );
					const inNode = nodeX.getNodeByName( 'in' );
					return vec3( inNode, mul( inNode, 2 ), mul( inNode, 3 ) );

				} } );
				assert.deepEqual( outputs, [ 'outy' ], 'The resolver receives the channel output.' );
				assert.true( hasNode( channelResult.materials.test_graph.colorNode, ( node ) => node.isArrayElementNode === true && node.indexNode.value === 1 ), 'The loader takes the y channel of the resolved node.' );

				assert.true( loader.parse( text, { throwOnErrors: false } ).errors.length > 0, 'Without the resolver the custom node is unsupported.' );

			} );

			QUnit.test( 'reads the first output of a separate node connected without an output', ( assert ) => {

				const text = `<?xml version="1.0"?>
<materialx version="1.39">
	<nodegraph name="test_graph">
		<separate3 name="channels" type="multioutput">
			<input name="in" type="vector3" value="0.25, 0.5, 0.75" />
		</separate3>
		<multiply name="test_node" type="float">
			<input name="in1" type="float" nodename="channels" />
			<input name="in2" type="float" value="2" />
		</multiply>
		<output name="out" type="float" nodename="test_node" />
	</nodegraph>
</materialx>`;

				const messages = [];
				const consoleError = console.error;
				console.error = ( ...args ) => messages.push( args.join( ' ' ) );

				try {

					const result = new MaterialXLoader().parse( text );
					assert.strictEqual( result.errors.length, 0, 'The connection is valid MaterialX.' );

				} finally {

					console.error = consoleError;

				}

				assert.deepEqual( messages, [], 'The separate node builds a channel instead of an incomplete element node.' );

			} );

			QUnit.test( 'gives vector and color noise one noise per channel', ( assert ) => {

				// Function layouts are matched by return type; the TSL noise functions have generated names.
				const usesFunction = ( category, type, returnType ) => {

					const { materials } = parseNodeGraph( `<${ category } name="test_node" type="${ type }" />`, type );
					return [ ...collectFunctionLayouts( materials.test_graph.colorNode ) ].some( layout => layout.type === returnType );

				};

				// MaterialX builds these variants from vec3 noise (plus an offset scalar for a fourth channel);
				// they used to repeat the scalar noise in every channel.
				assert.true( usesFunction( 'noise2d', 'vector2', 'vec3' ), 'noise2d vector2 samples vec3 noise.' );
				assert.true( usesFunction( 'noise2d', 'vector4', 'vec4' ), 'noise2d vector4 samples vec4 noise.' );
				assert.true( usesFunction( 'noise2d', 'color4', 'vec4' ), 'noise2d color4 samples vec4 noise.' );
				assert.true( usesFunction( 'noise3d', 'vector4', 'vec4' ), 'noise3d vector4 samples vec4 noise.' );
				assert.true( usesFunction( 'fractal3d', 'vector2', 'vec2' ), 'fractal3d vector2 uses vec2 fractal noise.' );
				assert.true( usesFunction( 'fractal3d', 'vector4', 'vec4' ), 'fractal3d vector4 uses vec4 fractal noise.' );
				assert.false( usesFunction( 'noise2d', 'float', 'vec3' ), 'Scalar noise stays scalar.' );

			} );

			QUnit.test( 'randomfloat and randomcolor', ( assert ) => {

				const floatResult = parseNodeGraph( '<randomfloat name="test_node" type="float"><input name="in" type="float" value="0.5" /><input name="seed" type="integer" value="3" /></randomfloat>', 'float' );
				assert.strictEqual( floatResult.errors.length, 0, 'randomfloat float: no errors.' );
				assert.true( collectConstValues( floatResult.materials.test_graph.colorNode ).includes( 4096 ), 'randomfloat float: input scaled by 4096.' );

				const integerResult = parseNodeGraph( '<randomfloat name="test_node" type="float"><input name="in" type="integer" value="3" /></randomfloat>', 'float' );
				assert.strictEqual( integerResult.errors.length, 0, 'randomfloat integer: no errors.' );
				const integerValues = collectConstValues( integerResult.materials.test_graph.colorNode );
				assert.true( integerValues.includes( 3 ), 'randomfloat integer: input found.' );
				assert.false( integerValues.includes( 4096 ), 'randomfloat integer: input not scaled.' );

				const colorResult = parseNodeGraph( '<randomcolor name="test_node" type="color3"><input name="in" type="float" value="0.5" /></randomcolor>', 'color3' );
				assert.strictEqual( colorResult.errors.length, 0, 'randomcolor: no errors.' );

			} );

			QUnit.test( 'maps <displacement> onto vertex displacement instead of failing', ( assert ) => {

				const result = new MaterialXLoader().parse( MATERIAL_X_DISPLACEMENT );
				const material = result.materials.test_material;

				assert.strictEqual( result.errors.length, 0, 'A displacement shader is not an unsupported node.' );
				assert.ok( material.positionNode, 'The material receives a positionNode.' );
				assert.ok( material.colorNode, 'The surface shader still applies.' );

				const zero = new MaterialXLoader().parse( MATERIAL_X_DISPLACEMENT.replace( 'value="0.25"', 'value="0"' ) );
				assert.strictEqual( zero.materials.test_material.positionNode, null, 'Zero displacement leaves the position untouched.' );

			} );

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

				const expectedURL = documentURL.slice( 0, documentURL.lastIndexOf( '/' ) + 1 ) + 'texture.test';
				assert.strictEqual( textureLoader.pending[ 0 ].url, expectedURL, 'Handler URLs are resolved against the document path.' );

				const image = { width: 1, height: 1 };
				textureLoader.succeed( image );
				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;

				assert.ok( findTexture( material, image ), 'The texture image is assigned before the load resolves.' );
				assert.ok( progressURLs.includes( expectedURL ), 'LoadingManager reports dependent texture progress.' );

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

				for ( const category of supported ) {

					const nodedefNames = getNodeDefNames( category );

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
	<nodegraph name="test_graph">
		<input name="graph_normal" type="vector3" defaultgeomprop="Nworld" />
		<input name="graph_uv" type="vector2" defaultgeomprop="UV1" />
		<multiply name="graph_scaled" type="vector3">
			<input name="in1" type="vector3" interfacename="graph_normal" />
		</multiply>
		<output name="out" type="vector3" nodename="graph_scaled" />
	</nodegraph>
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

			QUnit.test( 'resolves default nodedef versions and document nodedefs like MaterialX', ( assert ) => {

				// Maps node names to the names of their resolved nodedefs.
				const resolveNodeDefs = ( body ) => {

					const nodeDefs = {};
					const interfaceValidator = ( rootNode ) => {

						for ( const nodeX of rootNode.children ) nodeDefs[ nodeX.name ] = nodeX.nodeDef ? nodeX.nodeDef.name : null;

					};

					new MaterialXLoader().parse( `<?xml version="1.0"?>\n<materialx version="1.39">${ body }</materialx>`, { throwOnErrors: false, interfaceValidator } );
					return nodeDefs;

				};

				const versions = resolveNodeDefs( `
	<UsdUVTexture name="texture" type="multioutput" />
	<standard_surface name="default_surface" type="surfaceshader" />
	<standard_surface name="surface_100" type="surfaceshader" version="1.0.0" />` );

				assert.strictEqual( versions.texture, 'ND_UsdUVTexture_23', 'An unversioned node resolves to the default version.' );
				assert.strictEqual( versions.default_surface, 'ND_standard_surface_surfaceshader', 'standard_surface resolves to 1.0.1.' );
				assert.strictEqual( versions.surface_100, 'ND_standard_surface_surfaceshader_100', 'An explicit version resolves to that version.' );

				const documentNodeDefs = resolveNodeDefs( `
	<nodedef name="ND_tinted_checker" node="tinted_checker">
		<input name="tint" type="color3" value="1, 0.45, 0.1" />
		<output name="color" type="color3" />
		<output name="mask" type="float" />
	</nodedef>
	<tinted_checker name="checker" type="multioutput" />` );

				assert.strictEqual( documentNodeDefs.checker, 'ND_tinted_checker', 'Nodedefs declared in the document resolve.' );

				const result = new MaterialXLoader().parse( `<?xml version="1.0"?>
<materialx version="1.39">
	<UsdUVTexture name="texture" type="multioutput" />
	<convert name="texture_rgb" type="color3">
		<input name="in" type="color4" nodename="texture" output="rgba" />
	</convert>
</materialx>`, { throwOnErrors: false, interfaceValidator: createStrictInterfaceValidator() } );

				assert.true( result.errors.some( ( entry ) => /rgba/.test( entry.message ) ), 'The rgba output of UsdUVTexture 2.2 is not an output of the default 2.3.' );

			} );

			QUnit.test( 'hextilednormalmap translates with only a file input', ( assert ) => {

				const manager = new LoadingManager();
				manager.addHandler( /\.test$/i, new ControlledTextureLoader( manager ) );

				const result = new MaterialXLoader( manager ).parse( `<?xml version="1.0"?>
<materialx version="1.39">
	<hextilednormalmap name="test_normal" type="vector3">
		<input name="file" type="filename" value="texture.test" />
	</hextilednormalmap>
	<convert name="test_convert" type="color3">
		<input name="in" type="vector3" nodename="test_normal" />
	</convert>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" nodename="test_convert" />
	</standard_surface>
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
</materialx>`, { throwOnErrors: false } );

				assert.deepEqual( result.errors, [], 'hextilednormalmap does not read the hextiledimage-only inputs.' );

			} );

			QUnit.test( 'node library parameter names are declared by the nodedef registry', ( assert ) => {

				const problems = [];

				for ( const [ category, entry ] of Object.entries( MtlXLibrary ) ) {

					const nodedefNames = getNodeDefNames( category );
					if ( nodedefNames.length === 0 ) {

						problems.push( `${category}: no nodedef` );
						continue;

					}

					const declared = new Set( nodedefNames.flatMap( ( name ) => Object.keys( registryData.nodedefs[ name ].inputs ) ) );
					for ( const param of entry.params ) {

						if ( declared.has( param ) === false ) problems.push( `${category}: parameter "${param}" is not a nodedef input` );

					}

				}

				assert.deepEqual( problems, [], 'Every library parameter name matches a nodedef input of its category.' );

			} );

			QUnit.test( 'propagates DataTexture-style results from handlers like EXRLoader', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				const dataTexture = new DataTexture( new Uint16Array( 6 ), 3, 2, RedFormat, HalfFloatType );
				dataTexture.minFilter = LinearFilter;
				dataTexture.magFilter = NearestFilter;
				dataTexture.colorSpace = LinearSRGBColorSpace;
				dataTexture.generateMipmaps = false;
				textureLoader.succeed( dataTexture );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;
				const textureNode = findTexture( material, dataTexture.image );

				assert.ok( textureNode, 'The texture node receives the DataTexture image data.' );
				assert.true( textureNode.isDataTexture, 'isDataTexture is propagated so the renderer uploads raw pixel data.' );
				assert.strictEqual( textureNode.type, HalfFloatType, 'The half-float texture type is propagated.' );
				assert.strictEqual( textureNode.format, RedFormat, 'The texture format is propagated.' );
				assert.strictEqual( textureNode.minFilter, LinearFilter, 'The min filter is propagated.' );
				assert.false( textureNode.generateMipmaps, 'generateMipmaps is propagated so loaders can opt out of mipmaps.' );
				assert.strictEqual( textureNode.magFilter, NearestFilter, 'The mag filter is propagated.' );
				assert.strictEqual( textureNode.colorSpace, LinearSRGBColorSpace, 'The color space is propagated.' );
				assert.true( textureNode.flipY, 'Bottom-first data textures are flipped to match the top-first MaterialX orientation.' );
				assert.strictEqual( textureNode.unpackAlignment, 1, 'Odd-width half-float rows retain their packed alignment.' );
				assert.ok( textureNode instanceof DataTexture, 'The loaded texture retains its subtype.' );

				const clone = textureNode.clone();
				assert.true( clone.isDataTexture, 'Cloning preserves raw pixel upload behavior.' );
				assert.strictEqual( clone.image, dataTexture.image, 'Cloning preserves the pixel data.' );
				assert.strictEqual( clone.unpackAlignment, 1, 'Cloning preserves row alignment.' );

			} );

			QUnit.test( 'shares loaded textures by URI and address modes without modifying handler results', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const text = `<materialx version="1.39">
					${ [ 'periodic', 'periodic', 'clamp' ].map( ( mode, index ) => `
						<surfacematerial name="material_${index}" type="material">
							<input name="surfaceshader" type="surfaceshader" nodename="surface_${index}" />
						</surfacematerial>
						<standard_surface name="surface_${index}" type="surfaceshader">
							<input name="base_color" type="color3" nodename="image_${index}" />
						</standard_surface>
						<image name="image_${index}" type="color3">
							<input name="file" type="filename" value="texture.test" />
							<input name="uaddressmode" type="string" value="${mode}" />
						</image>
					` ).join( '' ) }
				</materialx>`;
				const documentURL = createDocumentURL( text );
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				assert.strictEqual( textureLoader.pending.length, 2, 'Matching URI and address modes share one request.' );
				const source = new DataTexture( new Uint16Array( 6 ), 3, 2, RedFormat, HalfFloatType );
				source.flipY = true;
				textureLoader.succeed( source );
				textureLoader.succeed( source );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );
				const first = findTexture( result.materials.material_0, source.image );
				const second = findTexture( result.materials.material_1, source.image );
				const clamped = findTexture( result.materials.material_2, source.image );

				assert.strictEqual( first, second, 'All samples sharing a cache entry see the loaded texture.' );
				assert.notStrictEqual( first, clamped, 'Different address modes use separate textures.' );
				assert.notStrictEqual( first, source, 'MaterialX owns its texture settings.' );
				assert.strictEqual( first.wrapS, RepeatWrapping, 'Periodic addressing is applied.' );
				assert.strictEqual( clamped.wrapS, ClampToEdgeWrapping, 'Clamp addressing is applied.' );
				assert.strictEqual( clamped.wrapT, RepeatWrapping, 'The other axis keeps periodic addressing.' );
				assert.false( first.flipY, 'Top-first handler textures are not flipped again.' );
				assert.strictEqual( source.wrapS, ClampToEdgeWrapping, 'The handler texture wrapping is unchanged.' );
				assert.true( source.flipY, 'The handler texture orientation is unchanged.' );

			} );

			QUnit.test( 'preserves compressed textures and their mipmaps', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				const mipmaps = [ 4, 2, 1 ].map( size => ( { data: new Uint8Array( 8 ), width: size, height: size } ) );
				const source = new CompressedTexture( mipmaps, 4, 4, RGB_S3TC_DXT1_Format );
				source.colorSpace = SRGBColorSpace;
				textureLoader.succeed( source );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );
				const loaded = findTexture( result.materials.test_material, source.image );

				assert.ok( loaded instanceof CompressedTexture, 'The compressed texture subtype is preserved.' );
				assert.strictEqual( loaded.format, RGB_S3TC_DXT1_Format, 'The compressed format is preserved.' );
				assert.deepEqual( loaded.mipmaps, mipmaps, 'Every mip level retains its dimensions and compressed data.' );
				assert.strictEqual( loaded.minFilter, source.minFilter, 'The mipmap filter is preserved.' );
				assert.strictEqual( loaded.colorSpace, SRGBColorSpace, 'The color space is preserved.' );
				assert.false( loaded.generateMipmaps, 'Compressed mipmaps are not regenerated.' );
				assert.false( loaded.flipY, 'Compressed textures are not flipped.' );
				assert.true( loaded.clone().isCompressedTexture, 'Cloning preserves compressed upload behavior.' );

			} );

		} );

	} );

} );
