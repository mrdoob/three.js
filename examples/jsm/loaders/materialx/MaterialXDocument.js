import {
	Texture,
	RepeatWrapping,
	ImageLoader,
	ImageBitmapLoader,
	Matrix3,
	Matrix4,
	MeshBasicNodeMaterial,
	MeshPhysicalNodeMaterial,
} from 'three/webgpu';

import {
	float,
	int,
	sub,
	vec2,
	vec3,
	vec4,
	color,
	uv,
	mat3,
	mat4,
	inverse,
	element,
	mx_transform_uv,
	mx_srgb_texture_to_lin_rec709,
} from 'three/tsl';

import { createMaterialXCompileRegistry, compileNodeFromRegistry } from './compile/MaterialXCompileRegistry.js';
import { parseMaterialXNodeTree, parseMaterialXText } from './parse/MaterialXParser.js';
import { getSurfaceMapper } from './MaterialXSurfaceMappings.js';
import { MtlXLibrary } from './MaterialXNodeLibrary.js';
import { mxHextileCoord, mxHextileComputeBlendWeights } from './MaterialXHextile.js';

const colorSpaceLib = {
	mx_srgb_texture_to_lin_rec709,
};

const DEFAULT_DOCUMENT_COLOR_SPACE = 'lin_rec709';
const IDENTITY_MAT3_VALUES = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
const IDENTITY_MAT4_VALUES = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
const MATRIX_INVERSE_EPSILON = 1e-8;
const COMPILE_REGISTRY = createMaterialXCompileRegistry();
const NODE_CLASS_BY_TYPE = {
	integer: int,
	float,
	vector2: vec2,
	vector3: vec3,
	vector4: vec4,
	color4: vec4,
	color3: color,
	boolean: null,
	matrix33: mat3,
	matrix44: mat4,
};
const OUTPUT_CHANNELS = {
	outx: 0,
	outr: 0,
	r: 0,
	outy: 1,
	outg: 1,
	g: 1,
	outz: 2,
	outb: 2,
	b: 2,
	outw: 3,
	outa: 3,
	a: 3,
};

function mxFlipUvY( uvNode ) {

	return vec2( element( uvNode, 0 ), sub( 1, element( uvNode, 1 ) ) );

}

const mxToUvSpace = mxFlipUvY;
const mxFromUvSpace = mxFlipUvY;

function isSvgUri( uri ) {

	if ( typeof uri !== 'string' ) return false;
	return /\.svg(?:$|[?#])/i.test( uri );

}

function invertConstantMatrixValues( values, size ) {

	if ( ! Array.isArray( values ) || values.length !== size * size ) return null;

	if ( size === 3 ) {

		const matrix = new Matrix3().setFromArray( values );
		if ( Math.abs( matrix.determinant() ) < MATRIX_INVERSE_EPSILON ) return null;
		matrix.invert();
		// Convert Three.js internal column-major storage back to row-major literal order.
		return matrix.transpose().elements;

	}

	if ( size === 4 ) {

		const matrix = new Matrix4().setFromArray( values );
		if ( Math.abs( matrix.determinant() ) < MATRIX_INVERSE_EPSILON ) return null;
		matrix.invert();
		// Convert Three.js internal column-major storage back to row-major literal order.
		return matrix.transpose().elements;

	}

	return null;

}

function getOutputChannel( outputName ) {

	return OUTPUT_CHANNELS[ outputName ] || 0;

}

function isChannelOutput( outputName ) {

	return outputName in OUTPUT_CHANNELS;

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

			if ( nodeX.element === 'nodegraph' ) break;
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

			const graphNode = this.getNodeGraph();
			const scopedReference = this.nodeName || this.interfaceName;
			if ( graphNode && scopedReference ) {

				referencePath = graphNode.nodePath + '/' + scopedReference;

			} else if ( this.nodeName !== null ) {

				// Surface-level nodename links can legitimately target top-level siblings.
				referencePath = this.nodeName;

			}

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
		if ( ! csSource || ! csTarget ) return null;
		const nodeName = `mx_${csSource}_to_${csTarget}`;
		return colorSpaceLib[ nodeName ] || null;

	}

	getTexture() {

		const filePrefix = this.getRecursiveAttribute( 'fileprefix' ) || '';
		const sourceURI = filePrefix + this.value;
		const resolvedURI = this.materialX.resolveTextureURI( sourceURI );
		const svgTexture = isSvgUri( resolvedURI );

		if ( this.materialX.textureCache.has( resolvedURI ) ) {

			return this.materialX.textureCache.get( resolvedURI );

		}

		let loader = svgTexture ? this.materialX.imageLoader : this.materialX.textureLoader;
		if ( resolvedURI && ! svgTexture ) {

			const handler = this.materialX.manager.getHandler( resolvedURI );
			if ( handler !== null ) loader = handler;

		}

		const textureNode = new Texture();
		textureNode.wrapS = textureNode.wrapT = RepeatWrapping;
		textureNode.flipY = false;
		this.materialX.textureCache.set( resolvedURI, textureNode );

		loader.load( resolvedURI, ( imageData ) => {

			textureNode.image = imageData;
			textureNode.needsUpdate = true;

		}, undefined, () => {

			throw new Error( `Failed to load texture "${resolvedURI}".` );

		} );

		return textureNode;

	}

	getClassFromType( type ) {

		return NODE_CLASS_BY_TYPE[ type ] || null;

	}

	toBooleanMaskNode( node ) {

		if ( node && node.nodeType === 'bool' && typeof node.select === 'function' ) {

			return node.select( float( 1 ), float( 0 ) );

		}

		if ( typeof node === 'boolean' ) {

			return float( node ? 1 : 0 );

		}

		return node;

	}

	getNode( out = null ) {

		let node = this.node;
		if ( node !== null && out === null ) return node;

		if ( this.element === 'input' && this.name === 'texcoord' && this.type === 'vector2' ) {

			let index = 0;
			const defaultGeomProp = this.getAttribute( 'defaultgeomprop' );
			if ( defaultGeomProp && /^UV(\d+)$/.test( defaultGeomProp ) ) {

				index = parseInt( defaultGeomProp.match( /^UV(\d+)$/ )[ 1 ], 10 );

			}

			node = mxToUvSpace( uv( index ) );

		}

		if ( ( this.element === 'separate2' || this.element === 'separate3' || this.element === 'separate4' ) && out ) {

			const inNode = this.getNodeByName( 'in' );
			return element( inNode, getOutputChannel( out ) );

		}

		const type = this.type;
		const channelRequested = this.element !== 'input' && this.element !== 'gltf_colorimage' && isChannelOutput( out );

		if ( this.isConst ) {

			if ( type === 'boolean' ) {

				const normalized = this.getValue().trim().toLowerCase();
				node = float( normalized === 'true' || normalized === '1' ? 1 : 0 );

			} else if ( type === 'matrix33' ) {

				node = this.getMatrix( 3 ) || mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 );

			} else if ( type === 'matrix44' ) {

				node = this.getMatrix( 4 ) || mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );

			} else if ( type === 'string' ) {

				node = this.getValue();

			} else {

				const nodeClass = this.getClassFromType( type );
				node = nodeClass ? nodeClass( ...this.getVector() ) : float( 0 );

			}

		} else if ( this.hasReference ) {

			if ( this.element === 'output' && this.output && out === null ) out = this.output;
			let requestedOutput = out;
			// For nodegraph references, this input's `output` attribute selects the graph output
			// itself and should not be forwarded as an output selector on the resolved node.
			if ( this.element === 'input' && this.nodeGraph !== null && this.output !== null ) {

				requestedOutput = null;

			}

			const referenceNode = this.materialX.getMaterialXNode( this.referencePath );

			if ( referenceNode ) {

				node = referenceNode.getNode( requestedOutput );

			} else {

				this.materialX.issueCollector.addMissingReference( this.name, this.referencePath );
				node = float( 0 );

			}

		} else {

			node = compileNodeFromRegistry( this, out, this.materialX.compileContext );

		}

		if ( node === null || node === undefined ) {

			this.materialX.issueCollector.addUnsupportedNode( this.element, this.name );
			node = float( 0 );

		}

		if ( channelRequested ) {

			node = element( node, getOutputChannel( out ) );

		}

		const resolvedType = channelRequested ? 'float' : type;
		if ( resolvedType === 'boolean' ) {

			node = this.toBooleanMaskNode( node );

		} else if ( resolvedType === 'string' ) {

			// String-typed inputs (for example transform* fromspace/tospace) are
			// valid scalar parameters and should pass through without numeric casting.
			node = typeof node === 'string' ? node : this.getValue();

		} else {

			const nodeToTypeClass = this.getClassFromType( resolvedType );
			if ( nodeToTypeClass !== null ) {

				node = nodeToTypeClass( node );

			} else if ( resolvedType !== null && resolvedType !== undefined && resolvedType !== 'multioutput' ) {

				this.materialX.issueCollector.addInvalidValue( this.name, `Unexpected type "${resolvedType}" on node "${this.name}".` );
				node = float( 0 );

			}

		}

		if ( node && typeof node === 'object' ) {

			node.name = this.name;

		}

		this.node = node;
		return node;

	}

	getChildByName( name ) {

		for ( const input of this.children ) {

			if ( input.name === name ) return input;

		}

	}

	getNodes() {

		const nodes = {};
		for ( const input of this.children ) {

			const value = input.getNode( input.output );
			nodes[ input.name ] = value;

		}

		return nodes;

	}

	getNodeByName( name ) {

		const child = this.getChildByName( name );
		return child ? child.getNode( child.output ) : undefined;

	}

	getInputValueByName( name ) {

		const child = this.getChildByName( name );
		return child ? child.value : null;

	}

	getNodesByNames( ...names ) {

		const nodes = [];
		for ( const name of names ) {

			const nodeValue = this.getNodeByName( name );
			nodes.push( nodeValue );

		}

		return nodes;

	}

	getValue() {

		return this.value ? this.value.trim() : '';

	}

	getVector() {

		const vector = [];
		for ( const val of this.getValue().split( /[,|\s]/ ) ) {

			if ( val !== '' ) vector.push( Number( val.trim() ) );

		}

		return vector;

	}

	getMatrix( size ) {

		const vector = this.getVector();
		const expectedLength = size * size;
		if ( vector.length !== expectedLength ) return null;
		// MaterialX matrix values are serialized in column-major order.
		// Reorder to row-major before constructing TSL matrix nodes so
		// transformmatrix semantics match MaterialXJS and MaterialXView.
		const reordered = [];
		for ( let row = 0; row < size; row += 1 ) {

			for ( let column = 0; column < size; column += 1 ) {

				reordered.push( vector[ column * size + row ] );

			}

		}

		return size === 3 ? mat3( ...reordered ) : mat4( ...reordered );

	}

	getAttribute( name ) {

		const value = this.nodeXML.getAttribute( name );
		if ( value === null && this.element === 'materialx' && name === 'colorspace' ) {

			return DEFAULT_DOCUMENT_COLOR_SPACE;

		}

		return value;

	}

	getRecursiveAttribute( name ) {

		let attribute = this.nodeXML.getAttribute( name );
		if ( attribute === null && this.parent !== null ) {

			attribute = this.parent.getRecursiveAttribute( name );

		}

		return attribute;

	}

	setMaterial( material ) {

		const mapper = getSurfaceMapper( this.element );
		if ( mapper ) {

			mapper.apply( material, this.getNodes(), this.materialX.issueCollector, this.name );

		} else {

			this.materialX.issueCollector.addUnsupportedNode( this.element, this.name );

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

	resolveSurfaceShaderNode( nodeX ) {

		if ( nodeX.hasReference ) {

			return this.materialX.getMaterialXNode( nodeX.referencePath ) || null;

		}

		if ( nodeX.nodeName ) {

			return this.materialX.getMaterialXNode( nodeX.nodeName ) || null;

		}

		return null;

	}

	toPhysicalMaterial() {

		const material = new MeshPhysicalNodeMaterial();
		material.name = this.name;

		for ( const nodeX of this.children ) {

			const shaderProperties = this.resolveSurfaceShaderNode( nodeX );
			if ( shaderProperties === null ) {

				this.materialX.issueCollector.addMissingReference(
					nodeX.name,
					nodeX.referencePath || nodeX.nodeName || '(unknown)',
				);
				continue;

			}

			shaderProperties.setMaterial( material );

		}

		return material;

	}

	toMaterials( materialName = null ) {

		const materials = {};
		const surfaceMaterials = this.children.filter( ( nodeX ) => nodeX.element === 'surfacematerial' );

		let selectedSurfaceMaterials = surfaceMaterials;
		if ( materialName ) {

			selectedSurfaceMaterials = surfaceMaterials.filter( ( nodeX ) => nodeX.name === materialName );

			if ( selectedSurfaceMaterials.length === 0 ) {

				this.materialX.issueCollector.addMissingMaterial( materialName );

			}

		}

		for ( const nodeX of selectedSurfaceMaterials ) {

			const material = nodeX.toPhysicalMaterial();
			materials[ material.name ] = material;

		}

		if ( Object.keys( materials ).length === 0 ) {

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

class MaterialXDocument {

	constructor( manager, path, issueCollector, archiveResolver = null ) {

		this.manager = manager;
		this.path = path;
		this.issueCollector = issueCollector;
		this.archiveResolver = archiveResolver;

		this.nodesXLib = new Map();
		this.imageLoader = new ImageLoader( manager );
		this.imageLoader.setPath( path );
		this.textureLoader = new ImageBitmapLoader( manager );
		this.textureLoader.setOptions( { imageOrientation: 'none' } );
		this.textureLoader.setPath( path );
		this.textureCache = new Map();

		this.compileContext = {
			compileRegistry: COMPILE_REGISTRY,
			nodeLibrary: MtlXLibrary,
			mxToUvSpace,
			mxFromUvSpace,
			mxTransformUv: mx_transform_uv,
			mxHextileCoord,
			mxHextileComputeBlendWeights,
			invertConstantMatrixValues,
			invertMatrixNode: inverse,
			IDENTITY_MAT3_VALUES,
			IDENTITY_MAT4_VALUES,
		};

	}

	resolveTextureURI( uri ) {

		if ( this.archiveResolver ) {

			const archiveURI = this.archiveResolver( uri );
			if ( archiveURI ) return archiveURI;

		}

		return uri;

	}

	addMaterialXNode( materialXNode ) {

		this.nodesXLib.set( materialXNode.nodePath, materialXNode );

	}

	getMaterialXNode( ...names ) {

		return this.nodesXLib.get( names.join( '/' ) );

	}

	parseNode( nodeXML, nodePath = '' ) {

		return parseMaterialXNodeTree(
			nodeXML,
			( childNodeXML, childNodePath ) => new MaterialXNode( this, childNodeXML, childNodePath ),
			( materialXNode ) => this.addMaterialXNode( materialXNode ),
			nodePath,
		);

	}

	parse( text, materialName = null ) {

		const rootNode = parseMaterialXText(
			text,
			( childNodeXML, childNodePath ) => new MaterialXNode( this, childNodeXML, childNodePath ),
			( materialXNode ) => this.addMaterialXNode( materialXNode ),
		);
		const materials = rootNode.toMaterials( materialName );
		const report = this.issueCollector.buildReport();
		return { materials, report };

	}

}

export { MaterialXDocument };
