import {
	FileLoader,
	Loader,
	TextureLoader,
	RepeatWrapping
} from 'three';

import {
	MeshPhysicalNodeMaterial,
	float, bool, int, vec2, vec3, vec4, color, texture,
	positionLocal,
	add, sub, mul, div, mod, abs, sign, floor, ceil, round, pow, sin, cos, tan,
	asin, acos, atan2, sqrt, exp, clamp, min, max, normalize, length, dot, cross, normalMap,
	remap, smoothstep, luminance, mx_rgbtohsv, mx_hsvtorgb,
	mix,
	mx_ramplr, mx_ramptb, mx_splitlr, mx_splittb,
	mx_fractal_noise_float, mx_noise_float, mx_cell_noise_float, mx_worley_noise_float,
	mx_transform_uv,
	mx_safepower, mx_contrast,
	mx_srgb_texture_to_lin_rec709,
	saturation
} from 'three/nodes';

const colorSpaceLib = {
	mx_srgb_texture_to_lin_rec709
};

class MtlXElement {

	constructor( name, nodeFunc, params = null ) {

		this.name = name;
		this.nodeFunc = nodeFunc;
		this.params = params;

	}

}

// Ref: https://github.com/mrdoob/three.js/issues/24674

const MtlXElements = [

	// << Math >>
	/* @__PURE__ */ new MtlXElement( 'add', add, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'subtract', sub, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'multiply', mul, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'divide', div, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'modulo', mod, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'absval', abs, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'sign', sign, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'floor', floor, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'ceil', ceil, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'round', round, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'power', pow, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'sin', sin, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'cos', cos, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'tan', tan, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'asin', asin, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'acos', acos, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'atan2', atan2, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'sqrt', sqrt, [ 'in' ] ),
	// /* @__PURE__ */ new MtlXElement( 'ln', ... ),
	/* @__PURE__ */ new MtlXElement( 'exp', exp, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'clamp', clamp, [ 'in', 'low', 'high' ] ),
	/* @__PURE__ */ new MtlXElement( 'min', min, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'max', max, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'normalize', normalize, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'magnitude', length, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'dotproduct', dot, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'crossproduct', cross, [ 'in' ] ),
	// /* @__PURE__ */ new MtlXElement( 'transformpoint', ... ),
	// /* @__PURE__ */ new MtlXElement( 'transformvector', ... ),
	// /* @__PURE__ */ new MtlXElement( 'transformnormal', ... ),
	// /* @__PURE__ */ new MtlXElement( 'transformmatrix', ... ),
	/* @__PURE__ */ new MtlXElement( 'normalmap', normalMap, [ 'in', 'scale' ] ),
	// /* @__PURE__ */ new MtlXElement( 'transpose', ... ),
	// /* @__PURE__ */ new MtlXElement( 'determinant', ... ),
	// /* @__PURE__ */ new MtlXElement( 'invertmatrix', ... ),
	// /* @__PURE__ */ new MtlXElement( 'rotate2d', rotateUV, [ 'in', radians( 'amount' )** ] ),
	// /* @__PURE__ */ new MtlXElement( 'rotate3d', ... ),
	// /* @__PURE__ */ new MtlXElement( 'arrayappend', ... ),
	// /* @__PURE__ */ new MtlXElement( 'dot', ... ),

	// << Adjustment >>
	/* @__PURE__ */ new MtlXElement( 'remap', remap, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh' ] ),
	/* @__PURE__ */ new MtlXElement( 'smoothstep', smoothstep, [ 'in', 'low', 'high' ] ),
	// /* @__PURE__ */ new MtlXElement( 'curveadjust', ... ),
	// /* @__PURE__ */ new MtlXElement( 'curvelookup', ... ),
	/* @__PURE__ */ new MtlXElement( 'luminance', luminance, [ 'in', 'lumacoeffs' ] ),
	/* @__PURE__ */ new MtlXElement( 'rgbtohsv', mx_rgbtohsv, [ 'in' ] ),
	/* @__PURE__ */ new MtlXElement( 'hsvtorgb', mx_hsvtorgb, [ 'in' ] ),

	// << Mix >>
	/* @__PURE__ */ new MtlXElement( 'mix', mix, [ 'bg', 'fg', 'mix' ] ),

	// << Channel >>
	/* @__PURE__ */ new MtlXElement( 'combine2', vec2, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'combine3', vec3, [ 'in1', 'in2', 'in3' ] ),
	/* @__PURE__ */ new MtlXElement( 'combine4', vec4, [ 'in1', 'in2', 'in3', 'in4' ] ),

	// << Procedural >>
	/* @__PURE__ */ new MtlXElement( 'ramplr', mx_ramplr, [ 'valuel', 'valuer', 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'ramptb', mx_ramptb, [ 'valuet', 'valueb', 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'splittb', mx_splittb, [ 'valuet', 'valueb', 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'noise2d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	/* @__PURE__ */ new MtlXElement( 'noise3d', mx_noise_float, [ 'texcoord', 'amplitude', 'pivot' ] ),
	/* @__PURE__ */ new MtlXElement( 'fractal3d', mx_fractal_noise_float, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ] ),
	/* @__PURE__ */ new MtlXElement( 'cellnoise2d', mx_cell_noise_float, [ 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'cellnoise3d', mx_cell_noise_float, [ 'texcoord' ] ),
	/* @__PURE__ */ new MtlXElement( 'worleynoise2d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),
	/* @__PURE__ */ new MtlXElement( 'worleynoise3d', mx_worley_noise_float, [ 'texcoord', 'jitter' ] ),

	// << Supplemental >>
	// /* @__PURE__ */ new MtlXElement( 'tiledimage', ... ),
	// /* @__PURE__ */ new MtlXElement( 'triplanarprojection', triplanarTextures, [ 'filex', 'filey', 'filez' ] ),
	// /* @__PURE__ */ new MtlXElement( 'ramp4', ... ),
	// /* @__PURE__ */ new MtlXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset' ] ),
	/* @__PURE__ */ new MtlXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ] ),
	/* @__PURE__ */ new MtlXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ] ),
	// /* @__PURE__ */ new MtlXElement( 'hsvadjust', ... ),
	/* @__PURE__ */ new MtlXElement( 'saturate', saturation, [ 'in', 'amount' ] ),
	// /* @__PURE__ */ new MtlXElement( 'extract', ... ),
	// /* @__PURE__ */ new MtlXElement( 'separate2', ... ),
	// /* @__PURE__ */ new MtlXElement( 'separate3', ... ),
	// /* @__PURE__ */ new MtlXElement( 'separate4', ... )

];

const MtlXLibrary = {};
MtlXElements.forEach( element => MtlXLibrary[ element.name ] = element );

class MaterialXLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		new FileLoader( this.manager )
			.setPath( this.path )
			.load( url, async ( text ) => {

				try {

					onLoad( this.parse( text ) );

				} catch ( e ) {

					onError( e );

				}

			}, onProgress, onError );

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

		const texture = this.materialX.textureLoader.load( filePrefix + this.value );
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

	getNode() {

		let node = this.node;

		if ( node !== null ) {

			return node;

		}

		//

		const type = this.type;

		if ( this.isConst ) {

			const nodeClass = this.getClassFromType( type );

			node = nodeClass( ...this.getVector() );

		} else if ( this.hasReference ) {

			node = this.materialX.getMaterialXNode( this.referencePath ).getNode();

		} else {

			const element = this.element;

			if ( element === 'convert' ) {

				const nodeClass = this.getClassFromType( type );

				node = nodeClass( this.getNodeByName( 'in' ) );

			} else if ( element === 'constant' ) {

				node = this.getNodeByName( 'value' );

			} else if ( element === 'position' ) {

				node = positionLocal;

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

				node = nodeElement.nodeFunc( ...this.getNodesByNames( ...nodeElement.params ) );

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

		return child ? child.getNode() : undefined;

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

		material.colorNode = colorNode || color( 0.8, 0.8, 0.8 );
		material.roughnessNode = roughnessNode || float( 0.2 );
		material.metalnessNode = metalnessNode || float( 0 );
		material.clearcoatNode = clearcoatNode || float( 0 );
		material.clearcoatRoughnessNode = clearcoatRoughnessNode || float( 0 );

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

	toMaterial() {

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

		for ( const nodeX of this.children ) {

			if ( nodeX.element === 'surfacematerial' ) {

				const material = nodeX.toMaterial();

				materials[ material.name ] = material;

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
