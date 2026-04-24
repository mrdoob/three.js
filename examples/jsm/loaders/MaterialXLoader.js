import {
	FileLoader, Loader, ImageBitmapLoader, Texture, RepeatWrapping, MeshBasicNodeMaterial,
	MeshPhysicalNodeMaterial, DoubleSide,
} from 'three/webgpu';

import {
	float, bool, int, vec2, vec3, vec4, color, texture,
	positionLocal, positionWorld, uv, vertexColor,
	normalLocal, normalWorld, tangentLocal, tangentWorld,
	mul, abs, sign, floor, ceil, round, sin, cos, tan,
	asin, acos, sqrt, exp, clamp, min, max, normalize, length, dot, cross, normalMap,
	remap, smoothstep, luminance, mx_rgbtohsv, mx_hsvtorgb,
	mix, saturation, transpose, determinant, inverse, log, reflect, refract, element,
	mx_ramplr, mx_ramptb, mx_splitlr, mx_splittb,
	mx_fractal_noise_float, mx_noise_float, mx_cell_noise_float, mx_worley_noise_float,
	mx_transform_uv,
	mx_safepower, mx_contrast,
	mx_srgb_texture_to_lin_rec709,
	mx_add, mx_atan2, mx_divide, mx_modulo, mx_multiply, mx_power, mx_subtract,
	mx_timer, mx_frame, mat3, mx_ramp4,
	mx_invert, mx_ifgreater, mx_ifgreatereq, mx_ifequal, distance,
	mx_separate, mx_place2d, mx_rotate2d, mx_rotate3d, mx_heighttonormal,
	mx_unifiednoise2d, mx_unifiednoise3d
} from 'three/tsl';

const colorSpaceLib = {
	mx_srgb_texture_to_lin_rec709
};

class MXElement {

	constructor( name, nodeFunc, params = [] ) {

		this.name = name;
		this.nodeFunc = nodeFunc;
		this.params = params;

	}

}

// Ref: https://github.com/mrdoob/three.js/issues/24674

// Enhanced separate node to support multi-output referencing (outx, outy, outz, outw)

// Type/arity-aware MaterialX node wrappers

const MXElements = [

	// << Math >>
	new MXElement( 'add', mx_add, [ 'in1', 'in2' ] ),
	new MXElement( 'subtract', mx_subtract, [ 'in1', 'in2' ] ),
	new MXElement( 'multiply', mx_multiply, [ 'in1', 'in2' ] ),
	new MXElement( 'divide', mx_divide, [ 'in1', 'in2' ] ),
	new MXElement( 'modulo', mx_modulo, [ 'in1', 'in2' ] ),
	new MXElement( 'absval', abs, [ 'in1', 'in2' ] ),
	new MXElement( 'sign', sign, [ 'in1', 'in2' ] ),
	new MXElement( 'floor', floor, [ 'in1', 'in2' ] ),
	new MXElement( 'ceil', ceil, [ 'in1', 'in2' ] ),
	new MXElement( 'round', round, [ 'in1', 'in2' ] ),
	new MXElement( 'power', mx_power, [ 'in1', 'in2' ] ),
	new MXElement( 'sin', sin, [ 'in' ] ),
	new MXElement( 'cos', cos, [ 'in' ] ),
	new MXElement( 'tan', tan, [ 'in' ] ),
	new MXElement( 'asin', asin, [ 'in' ] ),
	new MXElement( 'acos', acos, [ 'in' ] ),
	new MXElement( 'atan2', mx_atan2, [ 'in1', 'in2' ] ),
	new MXElement( 'sqrt', sqrt, [ 'in' ] ),
	new MXElement( 'ln', log, [ 'in' ] ),
	new MXElement( 'exp', exp, [ 'in' ] ),
	new MXElement( 'clamp', clamp, [ 'in', 'low', 'high' ] ),
	new MXElement( 'min', min, [ 'in1', 'in2' ] ),
	new MXElement( 'max', max, [ 'in1', 'in2' ] ),
	new MXElement( 'normalize', normalize, [ 'in' ] ),
	new MXElement( 'magnitude', length, [ 'in1', 'in2' ] ),
	new MXElement( 'dotproduct', dot, [ 'in1', 'in2' ] ),
	new MXElement( 'crossproduct', cross, [ 'in' ] ),
	new MXElement( 'distance', distance, [ 'in1', 'in2' ] ),
	new MXElement( 'invert', mx_invert, [ 'in', 'amount' ] ),
	//new MtlXElement( 'transformpoint', ... ),
	//new MtlXElement( 'transformvector', ... ),
	//new MtlXElement( 'transformnormal', ... ),
	new MXElement( 'transformmatrix', mul, [ 'in1', 'in2' ] ),
	new MXElement( 'normalmap', normalMap, [ 'in', 'scale' ] ),
	new MXElement( 'transpose', transpose, [ 'in' ] ),
	new MXElement( 'determinant', determinant, [ 'in' ] ),
	new MXElement( 'invertmatrix', inverse, [ 'in' ] ),
	new MXElement( 'creatematrix', mat3, [ 'in1', 'in2', 'in3' ] ),
	//new MtlXElement( 'rotate2d', rotateUV, [ 'in', radians( 'amount' )** ] ),
	//new MtlXElement( 'rotate3d', ... ),
	//new MtlXElement( 'arrayappend', ... ),
	//new MtlXElement( 'dot', ... ),

	new MXElement( 'length', length, [ 'in' ] ),
	new MXElement( 'crossproduct', cross, [ 'in1', 'in2' ] ),
	new MXElement( 'floor', floor, [ 'in' ] ),
	new MXElement( 'ceil', ceil, [ 'in' ] ),

	// << Adjustment >>
	new MXElement( 'remap', remap, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh' ] ),
	new MXElement( 'smoothstep', smoothstep, [ 'in', 'low', 'high' ] ),
	//new MtlXElement( 'curveadjust', ... ),
	//new MtlXElement( 'curvelookup', ... ),
	new MXElement( 'luminance', luminance, [ 'in', 'lumacoeffs' ] ),
	new MXElement( 'rgbtohsv', mx_rgbtohsv, [ 'in' ] ),
	new MXElement( 'hsvtorgb', mx_hsvtorgb, [ 'in' ] ),

	// << Mix >>
	new MXElement( 'mix', mix, [ 'bg', 'fg', 'mix' ] ),

	// << Channel >>
	new MXElement( 'combine2', vec2, [ 'in1', 'in2' ] ),
	new MXElement( 'combine3', vec3, [ 'in1', 'in2', 'in3' ] ),
	new MXElement( 'combine4', vec4, [ 'in1', 'in2', 'in3', 'in4' ] ),

	// << Procedural >>
	new MXElement( 'ramplr', mx_ramplr, [ 'valuel', 'valuer', 'texcoord' ] ),
	new MXElement( 'ramptb', mx_ramptb, [ 'valuet', 'valueb', 'texcoord' ] ),
	new MXElement( 'ramp4', mx_ramp4, [ 'valuetl', 'valuetr', 'valuebl', 'valuebr', 'texcoord' ] ),
	new MXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'texcoord' ] ),
	new MXElement( 'splittb', mx_splittb, [ 'valuet', 'valueb', 'texcoord' ] ),
	new MXElement( 'noise2d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	new MXElement( 'noise3d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	new MXElement( 'fractal3d', mx_fractal_noise_float, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ] ),
	new MXElement( 'cellnoise2d', mx_cell_noise_float, [ 'texcoord' ] ),
	new MXElement( 'cellnoise3d', mx_cell_noise_float, [ 'texcoord' ] ),
	new MXElement( 'worleynoise2d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),
	new MXElement( 'worleynoise3d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),
	new MXElement( 'unifiednoise2d', mx_unifiednoise2d, [ 'type', 'texcoord', 'freq', 'offset', 'jitter', 'outmin', 'outmax', 'clampoutput', 'octaves', 'lacunarity', 'diminish' ] ),
	new MXElement( 'unifiednoise3d', mx_unifiednoise3d, [ 'type', 'texcoord', 'freq', 'offset', 'jitter', 'outmin', 'outmax', 'clampoutput', 'octaves', 'lacunarity', 'diminish' ] ),
	// << Supplemental >>
	//new MtlXElement( 'tiledimage', ... ),
	//new MtlXElement( 'triplanarprojection', triplanarTextures, [ 'filex', 'filey', 'filez' ] ),
	//new MtlXElement( 'ramp4', ... ),
	new MXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset', 'operationorder' ] ),
	new MXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ] ),
	new MXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ] ),
	//new MtlXElement( 'hsvadjust', ... ),
	new MXElement( 'saturate', saturation, [ 'in', 'amount' ] ),
	new MXElement( 'extract', element, [ 'in', 'index' ] ),
	new MXElement( 'separate2', mx_separate, [ 'in' ] ),
	new MXElement( 'separate3', mx_separate, [ 'in' ] ),
	new MXElement( 'separate4', mx_separate, [ 'in' ] ),
	new MXElement( 'reflect', reflect, [ 'in', 'normal' ] ),
	new MXElement( 'refract', refract, [ 'in', 'normal', 'ior' ] ),

	new MXElement( 'time', mx_timer ),
	new MXElement( 'frame', mx_frame ),
	new MXElement( 'ifgreater', mx_ifgreater, [ 'value1', 'value2', 'in1', 'in2' ] ),
	new MXElement( 'ifgreatereq', mx_ifgreatereq, [ 'value1', 'value2', 'in1', 'in2' ] ),
	new MXElement( 'ifequal', mx_ifequal, [ 'value1', 'value2', 'in1', 'in2' ] ),

	// Placeholder implementations for unsupported nodes
	new MXElement( 'rotate2d', mx_rotate2d, [ 'in', 'amount' ] ),
	new MXElement( 'rotate3d', mx_rotate3d, [ 'in', 'amount', 'axis' ] ),
	new MXElement( 'heighttonormal', mx_heighttonormal, [ 'in', 'scale', 'texcoord' ] ),

];

const MtlXLibrary = {};
MXElements.forEach( element => MtlXLibrary[ element.name ] = element );

/**
 * A loader for the MaterialX format.
 *
 * The node materials loaded with this loader can only be used with {@link WebGPURenderer}.
 *
 * ```js
 * const loader = new MaterialXLoader().setPath( SAMPLE_PATH );
 * const materials = await loader.loadAsync( 'standard_surface_brass_tiled.mtlx' );
 * ```
 *
 * @augments Loader
 * @three_import import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';
 */
class MaterialXLoader extends Loader {

	/**
	 * Constructs a new MaterialX loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded MaterialX asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Object<string,NodeMaterial>)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {MaterialXLoader} A reference to this loader.
	 */
	load( url, onLoad, onProgress, onError ) {

		const _onError = function ( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

		};

		new FileLoader( this.manager )
			.setPath( this.path )
			.load( url, async ( text ) => {

				try {

					onLoad( this.parse( text ) );

				} catch ( e ) {

					_onError( e );

				}

			}, onProgress, _onError );

		return this;

	}

	/**
	 * Parses the given MaterialX data and returns the resulting materials.
	 *
	 * Supported standard_surface inputs:
	 * - base, base_color: Base color/albedo
	 * - opacity: Alpha/transparency
	 * - specular_roughness: Surface roughness
	 * - metalness: Metallic property
	 * - specular: Specular reflection intensity
	 * - specular_color: Specular reflection color
	 * - ior: Index of refraction
	 * - specular_anisotropy, specular_rotation: Anisotropic reflection
	 * - transmission, transmission_color: Transmission properties
	 * - thin_film_thickness, thin_film_ior: Thin film interference
	 * - sheen, sheen_color, sheen_roughness: Sheen properties
	 * - normal: Normal map
	 * - coat, coat_roughness, coat_color: Clearcoat properties
	 * - emission, emissionColor: Emission properties
	 *
	 * @param {string} text - The raw MaterialX data as a string.
	 * @return {Object<string,NodeMaterial>} A dictionary holding the parse node materials.
	 */
	parse( text ) {

		return new MaterialX( this.manager, this.path ).parse( text );

	}

}

class MaterialXNode {

	constructor( materialX, nodeXML, nodePath = '' ) {

		if ( ! materialX || typeof materialX !== 'object' ) {

			console.warn( 'MaterialXNode: materialX argument is not an object!', { materialX, nodeXML, nodePath } );

		}

		this.materialX = materialX;
		this.nodeXML = nodeXML;
		this.nodePath = nodePath ? nodePath + '/' + this.name : this.name;

		this.parent = null;

		this.node = null;

		this.children = [];

	}

	get element() {

		return this.nodeXML.nodeName;

	}

	get nodeGraph() {

		return this.getAttribute( 'nodegraph' );

	}

	get nodeName() {

		return this.getAttribute( 'nodename' );

	}

	get interfaceName() {

		return this.getAttribute( 'interfacename' );

	}

	get output() {

		return this.getAttribute( 'output' );

	}

	get name() {

		return this.getAttribute( 'name' );

	}

	get type() {

		return this.getAttribute( 'type' );

	}

	get value() {

		return this.getAttribute( 'value' );

	}

	getNodeGraph() {

		let nodeX = this;

		while ( nodeX !== null ) {

			if ( nodeX.element === 'nodegraph' ) {

				break;

			}

			nodeX = nodeX.parent;

		}

		return nodeX;

	}

	getRoot() {

		let nodeX = this;

		while ( nodeX.parent !== null ) {

			nodeX = nodeX.parent;

		}

		return nodeX;

	}

	get referencePath() {

		let referencePath = null;

		if ( this.nodeGraph !== null && this.output !== null ) {

			referencePath = this.nodeGraph + '/' + this.output;

		} else if ( this.nodeName !== null || this.interfaceName !== null ) {

			referencePath = this.getNodeGraph().nodePath + '/' + ( this.nodeName || this.interfaceName );

		}

		return referencePath;

	}

	get hasReference() {

		return this.referencePath !== null;

	}

	get isConst() {

		return this.element === 'input' && this.value !== null && this.type !== 'filename';

	}

	getColorSpaceNode() {

		const csSource = this.getAttribute( 'colorspace' );
		const csTarget = this.getRoot().getAttribute( 'colorspace' );

		const nodeName = `mx_${ csSource }_to_${ csTarget }`;

		return colorSpaceLib[ nodeName ];

	}

	getTexture() {

		const filePrefix = this.getRecursiveAttribute( 'fileprefix' ) || '';
		const uri = filePrefix + this.value;

		if ( this.materialX.textureCache.has( uri ) ) {

			return this.materialX.textureCache.get( uri );

		}

		let loader = this.materialX.textureLoader;

		if ( uri ) {

			const handler = this.materialX.manager.getHandler( uri );
			if ( handler !== null ) loader = handler;

		}

		const texture = new Texture();
		texture.wrapS = texture.wrapT = RepeatWrapping;

		this.materialX.textureCache.set( uri, texture );

		loader.load( uri, function ( imageBitmap ) {

			texture.image = imageBitmap;
			texture.needsUpdate = true;

		} );

		return texture;

	}

	getClassFromType( type ) {

		let nodeClass = null;

		if ( type === 'integer' ) nodeClass = int;
		else if ( type === 'float' ) nodeClass = float;
		else if ( type === 'vector2' ) nodeClass = vec2;
		else if ( type === 'vector3' ) nodeClass = vec3;
		else if ( type === 'vector4' || type === 'color4' ) nodeClass = vec4;
		else if ( type === 'color3' ) nodeClass = color;
		else if ( type === 'boolean' ) nodeClass = bool;

		return nodeClass;

	}

	getNode( out = null ) {

		let node = this.node;

		if ( node !== null && out === null ) {

			return node;

		}

		// Handle <input name="texcoord" type="vector2" ... />
		if (
			this.element === 'input' &&
			this.name === 'texcoord' &&
			this.type === 'vector2'
		) {

			// Try to get index from defaultgeomprop (e.g., "UV0" => 0)
			let index = 0;
			const defaultGeomProp = this.getAttribute( 'defaultgeomprop' );
			if ( defaultGeomProp && /^UV(\d+)$/.test( defaultGeomProp ) ) {

				index = parseInt( defaultGeomProp.match( /^UV(\d+)$/ )[ 1 ], 10 );

			}

			node = uv( index );

		}

		// Multi-output support for separate/separate3
		if (
			( this.element === 'separate3' || this.element === 'separate2' || this.element === 'separate4' ) &&
			out && typeof out === 'string' && out.startsWith( 'out' )
		) {

			const inNode = this.getNodeByName( 'in' );
			return mx_separate( inNode, out );

		}

		//

		const type = this.type;

		if ( this.isConst ) {

			const nodeClass = this.getClassFromType( type );

			node = nodeClass( ...this.getVector() );

		} else if ( this.hasReference ) {

			if ( this.element === 'output' && this.output && out === null ) {

				out = this.output;

			}

			node = this.materialX.getMaterialXNode( this.referencePath ).getNode( out );

		} else {

			const element = this.element;

			if ( element === 'convert' ) {

				const nodeClass = this.getClassFromType( type );

				node = nodeClass( this.getNodeByName( 'in' ) );

			} else if ( element === 'constant' ) {

				node = this.getNodeByName( 'value' );

			} else if ( element === 'position' ) {

				const space = this.getAttribute( 'space' );
				node = space === 'world' ? positionWorld : positionLocal;

			} else if ( element === 'normal' ) {

				const space = this.getAttribute( 'space' );
				node = space === 'world' ? normalWorld : normalLocal;

			} else if ( element === 'tangent' ) {

				const space = this.getAttribute( 'space' );
				node = space === 'world' ? tangentWorld : tangentLocal;

			} else if ( element === 'texcoord' ) {

				const indexNode = this.getChildByName( 'index' );
				const index = indexNode ? parseInt( indexNode.value ) : 0;

				node = uv( index );

			} else if ( element === 'geomcolor' ) {

				const indexNode = this.getChildByName( 'index' );
				const index = indexNode ? parseInt( indexNode.value ) : 0;

				node = vertexColor( index );

			} else if ( element === 'tiledimage' ) {

				const file = this.getChildByName( 'file' );

				const textureFile = file.getTexture();
				const uvTiling = mx_transform_uv( ...this.getNodesByNames( [ 'uvtiling', 'uvoffset' ] ) );

				node = texture( textureFile, uvTiling );

				const colorSpaceNode = file.getColorSpaceNode();

				if ( colorSpaceNode ) {

					node = colorSpaceNode( node );

				}

			} else if ( element === 'image' ) {

				const file = this.getChildByName( 'file' );
				const uvNode = this.getNodeByName( 'texcoord' );

				const textureFile = file.getTexture();

				node = texture( textureFile, uvNode );

				const colorSpaceNode = file.getColorSpaceNode();

				if ( colorSpaceNode ) {

					node = colorSpaceNode( node );

				}

			} else if ( MtlXLibrary[ element ] !== undefined ) {

				const nodeElement = MtlXLibrary[ element ];

				if ( ! nodeElement ) {

					throw new Error( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

				}

				if ( ! nodeElement.nodeFunc ) {

					throw new Error( `THREE.MaterialXLoader: Unexpected node 2 ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

				}

				if ( out !== null ) {

					node = nodeElement.nodeFunc( ...this.getNodesByNames( ...nodeElement.params ), out );

				} else {

					node = nodeElement.nodeFunc( ...this.getNodesByNames( ...nodeElement.params ) );

				}

			}

		}

		//

		if ( node === null ) {

			console.warn( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );

			node = float( 0 );

		}

		//

		const nodeToTypeClass = this.getClassFromType( type );

		if ( nodeToTypeClass !== null ) {

			node = nodeToTypeClass( node );

		} else {

			console.warn( `THREE.MaterialXLoader: Unexpected node ${ new XMLSerializer().serializeToString( this.nodeXML ) }.` );
			node = float( 0 );

		}

		node.name = this.name;

		this.node = node;

		return node;

	}

	getChildByName( name ) {

		for ( const input of this.children ) {

			if ( input.name === name ) {

				return input;

			}

		}

	}

	getNodes() {

		const nodes = {};

		for ( const input of this.children ) {

			const node = input.getNode();

			nodes[ node.name ] = node;

		}

		return nodes;

	}

	getNodeByName( name ) {

		const child = this.getChildByName( name );

		return child ? child.getNode( child.output ) : undefined;

	}

	getNodesByNames( ...names ) {

		const nodes = [];

		for ( const name of names ) {

			const node = this.getNodeByName( name );

			if ( node ) nodes.push( node );

		}

		return nodes;

	}

	getValue() {

		return this.value.trim();

	}

	getVector() {

		const vector = [];

		for ( const val of this.getValue().split( /[,|\s]/ ) ) {

			if ( val !== '' ) {

				vector.push( Number( val.trim() ) );

			}

		}

		return vector;

	}

	getAttribute( name ) {

		return this.nodeXML.getAttribute( name );

	}

	getRecursiveAttribute( name ) {

		let attribute = this.nodeXML.getAttribute( name );

		if ( attribute === null && this.parent !== null ) {

			attribute = this.parent.getRecursiveAttribute( name );

		}

		return attribute;

	}

	setStandardSurfaceToGltfPBR( material ) {

		const inputs = this.getNodes();

		//

		let colorNode = null;

		if ( inputs.base && inputs.base_color ) colorNode = mul( inputs.base, inputs.base_color );
		else if ( inputs.base ) colorNode = inputs.base;
		else if ( inputs.base_color ) colorNode = inputs.base_color;

		//

		let opacityNode = null;

		if ( inputs.opacity ) opacityNode = inputs.opacity;

		//

		let roughnessNode = null;

		if ( inputs.specular_roughness ) roughnessNode = inputs.specular_roughness;

		//

		let metalnessNode = null;

		if ( inputs.metalness ) metalnessNode = inputs.metalness;

		//

		let specularIntensityNode = null;

		if ( inputs.specular ) specularIntensityNode = inputs.specular;

		//

		let specularColorNode = null;

		if ( inputs.specular_color ) specularColorNode = inputs.specular_color;

		//

		let iorNode = null;

		if ( inputs.ior ) iorNode = inputs.ior;

		//

		let anisotropyNode = null;
		let anisotropyRotationNode = null;

		if ( inputs.specular_anisotropy ) anisotropyNode = inputs.specular_anisotropy;
		if ( inputs.specular_rotation ) anisotropyRotationNode = inputs.specular_rotation;

		//

		let transmissionNode = null;
		let transmissionColorNode = null;

		if ( inputs.transmission ) transmissionNode = inputs.transmission;
		if ( inputs.transmission_color ) transmissionColorNode = inputs.transmission_color;

		//

		let thinFilmThicknessNode = null;
		let thinFilmIorNode = null;

		if ( inputs.thin_film_thickness ) thinFilmThicknessNode = inputs.thin_film_thickness;

		if ( inputs.thin_film_ior ) {

			// Clamp IOR to valid range for Three.js (1.0 to 2.333)
			thinFilmIorNode = clamp( inputs.thin_film_ior, float( 1.0 ), float( 2.333 ) );

		}

		//

		let sheenNode = null;
		let sheenColorNode = null;
		let sheenRoughnessNode = null;

		if ( inputs.sheen ) sheenNode = inputs.sheen;
		if ( inputs.sheen_color ) sheenColorNode = inputs.sheen_color;
		if ( inputs.sheen_roughness ) sheenRoughnessNode = inputs.sheen_roughness;

		//

		let clearcoatNode = null;
		let clearcoatRoughnessNode = null;

		if ( inputs.coat ) clearcoatNode = inputs.coat;
		if ( inputs.coat_roughness ) clearcoatRoughnessNode = inputs.coat_roughness;

		if ( inputs.coat_color ) {

			colorNode = colorNode ? mul( colorNode, inputs.coat_color ) : colorNode;

		}

		//

		let normalNode = null;

		if ( inputs.normal ) normalNode = inputs.normal;

		//

		let emissiveNode = null;

		if ( inputs.emission ) emissiveNode = inputs.emission;
		if ( inputs.emissionColor ) {

			emissiveNode = emissiveNode ? mul( emissiveNode, inputs.emissionColor ) : emissiveNode;

		}

		//

		material.colorNode = colorNode || color( 0.8, 0.8, 0.8 );
		material.opacityNode = opacityNode || float( 1.0 );
		material.roughnessNode = roughnessNode || float( 0.2 );
		material.metalnessNode = metalnessNode || float( 0 );
		material.specularIntensityNode = specularIntensityNode || float( 0.5 );
		material.specularColorNode = specularColorNode || color( 1.0, 1.0, 1.0 );
		material.iorNode = iorNode || float( 1.5 );
		material.anisotropyNode = anisotropyNode || float( 0 );
		material.anisotropyRotationNode = anisotropyRotationNode || float( 0 );
		material.transmissionNode = transmissionNode || float( 0 );
		material.transmissionColorNode = transmissionColorNode || color( 1.0, 1.0, 1.0 );
		material.thinFilmThicknessNode = thinFilmThicknessNode || float( 0 );
		material.thinFilmIorNode = thinFilmIorNode || float( 1.5 );
		material.sheenNode = sheenNode || float( 0 );
		material.sheenColorNode = sheenColorNode || color( 1.0, 1.0, 1.0 );
		material.sheenRoughnessNode = sheenRoughnessNode || float( 0.5 );
		material.clearcoatNode = clearcoatNode || float( 0 );
		material.clearcoatRoughnessNode = clearcoatRoughnessNode || float( 0 );
		if ( normalNode ) material.normalNode = normalNode;
		if ( emissiveNode ) material.emissiveNode = emissiveNode;

		// Auto-enable iridescence when thin film parameters are present
		if ( thinFilmThicknessNode && thinFilmThicknessNode.value !== undefined && thinFilmThicknessNode.value > 0 ) {

			material.iridescence = 1.0;

		}

		if ( opacityNode !== null ) {

			material.transparent = true;

		}

		if ( transmissionNode !== null ) {

			material.side = DoubleSide;
			material.transparent = true;

		}

	}

	/*setGltfPBR( material ) {

		const inputs = this.getNodes();

		console.log( inputs );

	}*/

	setMaterial( material ) {

		const element = this.element;

		if ( element === 'gltf_pbr' ) {

			//this.setGltfPBR( material );

		} else if ( element === 'standard_surface' ) {

			this.setStandardSurfaceToGltfPBR( material );

		}

	}

	toBasicMaterial() {

		const material = new MeshBasicNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children.toReversed() ) {

			if ( nodeX.name === 'out' ) {

				material.colorNode = nodeX.getNode();

				break;

			}

		}

		return material;

	}

	toPhysicalMaterial() {

		const material = new MeshPhysicalNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children ) {

			const shaderProperties = this.materialX.getMaterialXNode( nodeX.nodeName );
			shaderProperties.setMaterial( material );

		}

		return material;

	}

	toMaterials() {

		const materials = {};

		let isUnlit = true;

		for ( const nodeX of this.children ) {

			if ( nodeX.element === 'surfacematerial' ) {

				const material = nodeX.toPhysicalMaterial();

				materials[ material.name ] = material;

				isUnlit = false;

			}

		}

		if ( isUnlit ) {

			for ( const nodeX of this.children ) {

				if ( nodeX.element === 'nodegraph' ) {

					const material = nodeX.toBasicMaterial();

					materials[ material.name ] = material;

				}

			}

		}

		return materials;

	}

	add( materialXNode ) {

		materialXNode.parent = this;

		this.children.push( materialXNode );

	}

}

class MaterialX {

	constructor( manager, path ) {

		this.manager = manager;
		this.path = path;
		this.resourcePath = '';

		this.nodesXLib = new Map();
		//this.nodesXRefLib = new WeakMap();

		this.textureLoader = new ImageBitmapLoader( manager );
		this.textureLoader.setOptions( { imageOrientation: 'flipY' } );

		this.textureCache = new Map();

	}

	addMaterialXNode( materialXNode ) {

		this.nodesXLib.set( materialXNode.nodePath, materialXNode );

	}

	/*getMaterialXNodeFromXML( xmlNode ) {

        return this.nodesXRefLib.get( xmlNode );

    }*/

	getMaterialXNode( ...names ) {

		return this.nodesXLib.get( names.join( '/' ) );

	}

	parseNode( nodeXML, nodePath = '' ) {

		const materialXNode = new MaterialXNode( this, nodeXML, nodePath );
		if ( materialXNode.nodePath ) this.addMaterialXNode( materialXNode );

		for ( const childNodeXML of nodeXML.children ) {

			const childMXNode = this.parseNode( childNodeXML, materialXNode.nodePath );
			materialXNode.add( childMXNode );

		}

		return materialXNode;

	}

	parse( text ) {

		const rootXML = new DOMParser().parseFromString( text, 'application/xml' ).documentElement;

		this.textureLoader.setPath( this.path );

		//

		const materials = this.parseNode( rootXML ).toMaterials();

		return { materials };

	}

}

export { MaterialXLoader };
