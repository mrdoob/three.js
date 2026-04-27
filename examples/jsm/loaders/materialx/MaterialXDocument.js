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
	abs,
	add,
	clamp,
	cos,
	div,
	dot,
	float,
	floor,
	fract,
	int,
	max,
	mix,
	mul,
	pow,
	sin,
	step,
	sub,
	vec2,
	vec3,
	vec4,
	color,
	dFdx,
	dFdy,
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
import { getSurfaceMapper, getSupportedSurfaceCategories } from './MaterialXSurfaceRegistry.js';
import { MtlXLibrary } from './MaterialXNodeLibrary.js';
import { validateCategoryCoverage } from './MaterialXNodeRegistry.js';

const colorSpaceLib = {
	mx_srgb_texture_to_lin_rec709,
};

const IDENTITY_MAT3_VALUES = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
const IDENTITY_MAT4_VALUES = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
const MATRIX_INVERSE_EPSILON = 1e-8;
const HEXTILE_SQRT3_2 = Math.sqrt( 3 ) * 2;
const HEXTILE_EPSILON = 1e-6;
const HEXTILE_PI_OVER_180 = Math.PI / 180;
const COMPILE_REGISTRY = createMaterialXCompileRegistry();
const ALLOWED_NON_STANDARD_COMPILE_CATEGORIES = [ 'hextiledimage', 'hextilednormalmap', 'gltf_anisotropy_image' ];
let translatorRegistryValidated = false;

function toRadians( degrees ) {

	return mul( degrees, HEXTILE_PI_OVER_180 );

}

function mxToUvSpace( uvNode ) {

	return vec2( element( uvNode, 0 ), sub( 1, element( uvNode, 1 ) ) );

}

function mxFromUvSpace( uvNode ) {

	return vec2( element( uvNode, 0 ), sub( 1, element( uvNode, 1 ) ) );

}

function mxHextileHash( point ) {

	const x = element( point, 0 );
	const y = element( point, 1 );
	const p3Base = vec3( x, y, x );
	const p3Scaled = mul( p3Base, vec3( 0.1031, 0.103, 0.0973 ) );
	const p3Fract = fract( p3Scaled );
	const p3YZX = vec3( element( p3Fract, 1 ), element( p3Fract, 2 ), element( p3Fract, 0 ) );
	const p3Offset = add( p3YZX, 33.33 );
	const p3 = add( p3Fract, dot( p3Fract, p3Offset ) );
	const lhs = add( vec2( element( p3, 0 ), element( p3, 0 ) ), vec2( element( p3, 1 ), element( p3, 2 ) ) );
	const rhs = vec2( element( p3, 2 ), element( p3, 1 ) );
	return fract( mul( lhs, rhs ) );

}

function mxSchlickGain( x, r ) {

	const rr = clamp( r, 0.001, 0.999 );
	const a = mul( sub( div( 1, rr ), 2 ), sub( 1, mul( 2, x ) ) );
	const low = div( x, add( a, 1 ) );
	const high = div( sub( a, x ), sub( a, 1 ) );
	return mix( low, high, step( 0.5, x ) );

}

function normalizeBlendWeights( weights ) {

	const wx = element( weights, 0 );
	const wy = element( weights, 1 );
	const wz = element( weights, 2 );
	const sum = max( add( add( wx, wy ), wz ), HEXTILE_EPSILON );
	return div( weights, sum );

}

function mxHextileComputeBlendWeights( luminanceWeights, tileWeights, falloff ) {

	const weighted = mul( luminanceWeights, pow( max( tileWeights, vec3( HEXTILE_EPSILON, HEXTILE_EPSILON, HEXTILE_EPSILON ) ), vec3( 7, 7, 7 ) ) );
	const normalized = normalizeBlendWeights( weighted );
	const gained = vec3(
		mxSchlickGain( element( normalized, 0 ), falloff ),
		mxSchlickGain( element( normalized, 1 ), falloff ),
		mxSchlickGain( element( normalized, 2 ), falloff ),
	);
	const gainedNormalized = normalizeBlendWeights( gained );
	const applyFalloff = step( HEXTILE_EPSILON, abs( sub( falloff, 0.5 ) ) );
	return mix( normalized, gainedNormalized, applyFalloff );

}

function mxRotate2d( point, sine, cosine ) {

	return vec2( sub( mul( cosine, element( point, 0 ) ), mul( sine, element( point, 1 ) ) ), add( mul( sine, element( point, 0 ) ), mul( cosine, element( point, 1 ) ) ) );

}

function mxHextileCoord( coord, rotation, rotationRange, scale, scaleRange, offset, offsetRange ) {

	const st = mul( coord, HEXTILE_SQRT3_2 );
	const stSkewed = vec2( add( element( st, 0 ), mul( - 0.57735027, element( st, 1 ) ) ), mul( 1.15470054, element( st, 1 ) ) );
	const stFrac = fract( stSkewed );
	const tx = element( stFrac, 0 );
	const ty = element( stFrac, 1 );
	const tz = sub( sub( 1, tx ), ty );
	const s = step( 0, sub( 0, tz ) );
	const s2 = sub( mul( 2, s ), 1 );
	const w1 = mul( sub( 0, tz ), s2 );
	const w2 = sub( s, mul( ty, s2 ) );
	const w3 = sub( s, mul( tx, s2 ) );
	const baseId = floor( stSkewed );
	const oneMinusS = sub( 1, s );
	const id1 = add( baseId, vec2( s, s ) );
	const id2 = add( baseId, vec2( s, oneMinusS ) );
	const id3 = add( baseId, vec2( oneMinusS, s ) );

	const toTileCenter = ( tileId ) => {

		const scaled = div( tileId, HEXTILE_SQRT3_2 );
		const sx = element( scaled, 0 );
		const sy = element( scaled, 1 );
		return vec2( add( sx, mul( 0.5, sy ) ), mul( 0.8660254, sy ) );

	};

	const ctr1 = toTileCenter( id1 );
	const ctr2 = toTileCenter( id2 );
	const ctr3 = toTileCenter( id3 );

	const seedOffset = vec2( 0.12345, 0.12345 );
	const rand1 = mxHextileHash( add( id1, seedOffset ) );
	const rand2 = mxHextileHash( add( id2, seedOffset ) );
	const rand3 = mxHextileHash( add( id3, seedOffset ) );

	const rr = vec2( toRadians( element( rotationRange, 0 ) ), toRadians( element( rotationRange, 1 ) ) );
	const rrMin = element( rr, 0 );
	const rrMax = element( rr, 1 );
	const randX = vec3( element( rand1, 0 ), element( rand2, 0 ), element( rand3, 0 ) );
	const rotations = mix( vec3( rrMin, rrMin, rrMin ), vec3( rrMax, rrMax, rrMax ), mul( randX, rotation ) );
	const randY = vec3( element( rand1, 1 ), element( rand2, 1 ), element( rand3, 1 ) );
	const scaleMin = element( scaleRange, 0 );
	const scaleMax = element( scaleRange, 1 );
	const randomScale = mix( vec3( scaleMin, scaleMin, scaleMin ), vec3( scaleMax, scaleMax, scaleMax ), randY );
	const scales = mix( vec3( 1, 1, 1 ), randomScale, scale );
	const offsetMin = element( offsetRange, 0 );
	const offsetMax = element( offsetRange, 1 );
	const offset1 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand1, offset ) );
	const offset2 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand2, offset ) );
	const offset3 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand3, offset ) );

	const sampleCoord = ( center, randomOffset, rotationValue, sampleScale ) => {

		const delta = sub( coord, center );
		const rotated = mxRotate2d( delta, sin( rotationValue ), cos( rotationValue ) );
		const safeScale = max( sampleScale, HEXTILE_EPSILON );
		return add( add( div( rotated, vec2( safeScale, safeScale ) ), center ), randomOffset );

	};

	const sampleDerivative = ( derivative, rotationValue, sampleScale ) => {

		const rotated = mxRotate2d( derivative, sin( rotationValue ), cos( rotationValue ) );
		const safeScale = max( sampleScale, HEXTILE_EPSILON );
		return div( rotated, vec2( safeScale, safeScale ) );

	};

	const ddx = dFdx( coord );
	const ddy = dFdy( coord );

	return {
		coords: [
			sampleCoord( ctr1, offset1, element( rotations, 0 ), element( scales, 0 ) ),
			sampleCoord( ctr2, offset2, element( rotations, 1 ), element( scales, 1 ) ),
			sampleCoord( ctr3, offset3, element( rotations, 2 ), element( scales, 2 ) ),
		],
		ddx: [
			sampleDerivative( ddx, element( rotations, 0 ), element( scales, 0 ) ),
			sampleDerivative( ddx, element( rotations, 1 ), element( scales, 1 ) ),
			sampleDerivative( ddx, element( rotations, 2 ), element( scales, 2 ) ),
		],
		ddy: [
			sampleDerivative( ddy, element( rotations, 0 ), element( scales, 0 ) ),
			sampleDerivative( ddy, element( rotations, 1 ), element( scales, 1 ) ),
			sampleDerivative( ddy, element( rotations, 2 ), element( scales, 2 ) ),
		],
		weights: vec3( w1, w2, w3 ),
	};

}

function isSvgUri( uri ) {

	if ( typeof uri !== 'string' ) return false;
	return /\.svg(?:$|[?#])/i.test( uri );

}

function invertConstantMatrixValues( values, size ) {

	if ( ! Array.isArray( values ) || values.length !== size * size ) return null;

	if ( size === 3 ) {

		const matrix = new Matrix3().setFromArray(values);
		if ( Math.abs( matrix.determinant() ) < MATRIX_INVERSE_EPSILON ) return null;
		matrix.invert();
		// Convert Three.js internal column-major storage back to row-major literal order.
		return matrix.transpose().elements;
	}

	if ( size === 4 ) {

		const matrix = new Matrix4().setFromArray(values);
		if ( Math.abs( matrix.determinant() ) < MATRIX_INVERSE_EPSILON ) return null;
		matrix.invert();
		// Convert Three.js internal column-major storage back to row-major literal order.
		return matrix.transpose().elements;

	}

	return null;

}

function getOutputChannel( outputName ) {

	if ( outputName === 'outx' || outputName === 'outr' || outputName === 'r' ) return 0;
	if ( outputName === 'outy' || outputName === 'outg' || outputName === 'g' ) return 1;
	if ( outputName === 'outz' || outputName === 'outb' || outputName === 'b' ) return 2;
	if ( outputName === 'outw' || outputName === 'outa' || outputName === 'a' ) return 3;
	return 0;

}

function isChannelOutput( outputName ) {

	return outputName === 'outx' || outputName === 'outr' || outputName === 'r' ||
    outputName === 'outy' || outputName === 'outg' || outputName === 'g' ||
    outputName === 'outz' || outputName === 'outb' || outputName === 'b' ||
    outputName === 'outw' || outputName === 'outa' || outputName === 'a';

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

		if ( type === 'integer' ) return int;
		if ( type === 'float' ) return float;
		if ( type === 'vector2' ) return vec2;
		if ( type === 'vector3' ) return vec3;
		if ( type === 'vector4' || type === 'color4' ) return vec4;
		if ( type === 'color3' ) return color;
		if ( type === 'boolean' ) return null;
		if ( type === 'matrix33' ) return mat3;
		if ( type === 'matrix44' ) return mat4;
		return null;

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

		return this.nodeXML.getAttribute( name );

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

		if ( ! translatorRegistryValidated ) {

			validateCategoryCoverage( {
				compileCategories: [ ...COMPILE_REGISTRY.keys() ],
				surfaceCategories: getSupportedSurfaceCategories(),
				allowUnknownCompileCategories: ALLOWED_NON_STANDARD_COMPILE_CATEGORIES,
			} );
			translatorRegistryValidated = true;

		}

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
