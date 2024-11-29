import { FileLoader, Loader, TextureLoader, RepeatWrapping, MeshBasicNodeMaterial, MeshPhysicalNodeMaterial } from 'three/webgpu';

import {
	float, bool, int, vec2, vec3, vec4, color, texture,
	positionLocal, positionWorld, uv, vertexColor,
	normalLocal, normalWorld, tangentLocal, tangentWorld,
	add, sub, mul, div, mod, abs, sign, floor, ceil, round, pow, sin, cos, tan,
	asin, acos, atan2, sqrt, exp, clamp, min, max, normalize, length, dot, cross, normalMap,
	remap, smoothstep, luminance, mx_rgbtohsv, mx_hsvtorgb,
	mix, split,
	mx_ramplr, mx_ramptb, mx_splitlr, mx_splittb,
	mx_fractal_noise_float, mx_noise_float, mx_cell_noise_float, mx_worley_noise_float,
	mx_transform_uv,
	mx_safepower, mx_contrast,
	mx_srgb_texture_to_lin_rec709,
	saturation,
	timerLocal, frameId
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

const mx_add = ( in1, in2 = float( 0 ) ) => add( in1, in2 );
const mx_subtract = ( in1, in2 = float( 0 ) ) => sub( in1, in2 );
const mx_multiply = ( in1, in2 = float( 1 ) ) => mul( in1, in2 );
const mx_divide = ( in1, in2 = float( 1 ) ) => div( in1, in2 );
const mx_modulo = ( in1, in2 = float( 1 ) ) => mod( in1, in2 );
const mx_power = ( in1, in2 = float( 1 ) ) => pow( in1, in2 );
const mx_atan2 = ( in1 = float( 0 ), in2 = float( 1 ) ) => atan2( in1, in2 );
const mx_timer = () => timerLocal();
const mx_frame = () => frameId;
const mx_invert = ( in1, amount = float( 1 ) ) => sub( amount, in1 );

const separate = ( in1, channel ) => split( in1, channel.at( - 1 ) );
const extract = ( in1, index ) => in1.element( index );

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
	//new MtlXElement( 'ln', ... ),
	new MXElement( 'exp', exp, [ 'in' ] ),
	new MXElement( 'clamp', clamp, [ 'in', 'low', 'high' ] ),
	new MXElement( 'min', min, [ 'in1', 'in2' ] ),
	new MXElement( 'max', max, [ 'in1', 'in2' ] ),
	new MXElement( 'normalize', normalize, [ 'in' ] ),
	new MXElement( 'magnitude', length, [ 'in1', 'in2' ] ),
	new MXElement( 'dotproduct', dot, [ 'in1', 'in2' ] ),
	new MXElement( 'crossproduct', cross, [ 'in' ] ),
	new MXElement( 'invert', mx_invert, [ 'in', 'amount' ] ),
	//new MtlXElement( 'transformpoint', ... ),
	//new MtlXElement( 'transformvector', ... ),
	//new MtlXElement( 'transformnormal', ... ),
	//new MtlXElement( 'transformmatrix', ... ),
	new MXElement( 'normalmap', normalMap, [ 'in', 'scale' ] ),
	//new MtlXElement( 'transpose', ... ),
	//new MtlXElement( 'determinant', ... ),
	//new MtlXElement( 'invertmatrix', ... ),
	//new MtlXElement( 'rotate2d', rotateUV, [ 'in', radians( 'amount' )** ] ),
	//new MtlXElement( 'rotate3d', ... ),
	//new MtlXElement( 'arrayappend', ... ),
	//new MtlXElement( 'dot', ... ),

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
	new MXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'texcoord' ] ),
	new MXElement( 'splittb', mx_splittb, [ 'valuet', 'valueb', 'texcoord' ] ),
	new MXElement( 'noise2d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	new MXElement( 'noise3d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	new MXElement( 'fractal3d', mx_fractal_noise_float, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ] ),
	new MXElement( 'cellnoise2d', mx_cell_noise_float, [ 'texcoord' ] ),
	new MXElement( 'cellnoise3d', mx_cell_noise_float, [ 'texcoord' ] ),
	new MXElement( 'worleynoise2d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),
	new MXElement( 'worleynoise3d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),

	// << Supplemental >>
	//new MtlXElement( 'tiledimage', ... ),
	//new MtlXElement( 'triplanarprojection', triplanarTextures, [ 'filex', 'filey', 'filez' ] ),
	//new MtlXElement( 'ramp4', ... ),
	//new MtlXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset' ] ),
	new MXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ] ),
	new MXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ] ),
	//new MtlXElement( 'hsvadjust', ... ),
	new MXElement( 'saturate', saturation, [ 'in', 'amount' ] ),
	new MXElement( 'extract', extract, [ 'in', 'index' ] ),
	new MXElement( 'separate2', separate, [ 'in' ] ),
	new MXElement( 'separate3', separate, [ 'in' ] ),
	new MXElement( 'separate4', separate, [ 'in' ] ),

	new MXElement( 'time', mx_timer ),
	new MXElement( 'frame', mx_frame )

];

const MtlXLibrary = {};
MXElements.forEach( element => MtlXLibrary[ element.name ] = element );

class MaterialXLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

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

	parse( text ) {

		return new MaterialX( this.manager, this.path ).parse( text );

	}

}

class MaterialXNode {

	constructor( materialX, nodeXML, nodePath = '' ) {

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

		let loader = this.materialX.textureLoader;
		const uri = filePrefix + this.value;

		if ( uri ) {

			const handler = this.materialX.manager.getHandler( uri );
			if ( handler !== null ) loader = handler;

		}

		const texture = loader.load( uri );
		texture.wrapS = texture.wrapT = RepeatWrapping;
		texture.flipY = false;

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

		let roughnessNode = null;

		if ( inputs.specular_roughness ) roughnessNode = inputs.specular_roughness;

		//

		let metalnessNode = null;

		if ( inputs.metalness ) metalnessNode = inputs.metalness;

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
		material.roughnessNode = roughnessNode || float( 0.2 );
		material.metalnessNode = metalnessNode || float( 0 );
		material.clearcoatNode = clearcoatNode || float( 0 );
		material.clearcoatRoughnessNode = clearcoatRoughnessNode || float( 0 );
		if ( normalNode ) material.normalNode = normalNode;
		if ( emissiveNode ) material.emissiveNode = emissiveNode;

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

		this.textureLoader = new TextureLoader( manager );

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
