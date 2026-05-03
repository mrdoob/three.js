import {
	element,
	float,
	mat3,
	mat4,
	mul,
	normalMap,
	texture,
	uv,
	vec2,
	vec3,
	vec4,
	vertexColor,
	positionLocal,
	positionWorld,
	normalLocal,
	normalWorld,
	tangentLocal,
	tangentWorld,
	clamp,
	add,
	sub,
	mix,
	dot,
	div,
	normalize,
	mx_atan2,
} from 'three/tsl';
import { normalizeSpaceName } from '../MaterialXUtils.js';

const register = ( registry, categories, handler ) => {

	for ( const category of categories ) {

		registry.set( category, handler );

	}

};

const UV_FALLBACK_CATEGORIES = new Set( [ 'noise2d', 'fractal2d', 'cellnoise2d', 'worleynoise2d', 'unifiednoise2d' ] );
const SCALAR_TYPES = new Set( [ 'boolean', 'integer', 'float' ] );
const THREE_COMPONENT_TYPES = new Set( [ 'vector2', 'vector3', 'vector4', 'color3', 'color4' ] );

const getDefaultUvNode = ( compileContext ) => compileContext.mxToUvSpace( uv( 0 ) );

const getTextureInputs = ( nodeX, compileContext ) => {

	const file = nodeX.getChildByName( 'file' );
	const uvNode = nodeX.getNodeByName( 'texcoord' ) || getDefaultUvNode( compileContext );
	const textureFile = file ? file.getTexture() : null;
	return { file, uvNode, textureFile };

};

const sampleTexture = ( textureFile, uvNode, compileContext, fallback ) =>
	textureFile ? texture( textureFile, compileContext.mxFromUvSpace( uvNode ) ) : fallback;

const applyTextureColorSpace = ( node, file ) => {

	const colorSpaceNode = file ? file.getColorSpaceNode() : null;
	return colorSpaceNode ? colorSpaceNode( node ) : node;

};

const compileConvertNode = ( nodeX ) => {

	const input = nodeX.getNodeByName( 'in' );
	const inputElement = nodeX.getChildByName( 'in' );
	const inputType = inputElement ? inputElement.type : null;
	const nodeClass = nodeX.getClassFromType( nodeX.type ) || float;

	if ( SCALAR_TYPES.has( inputType ) && THREE_COMPONENT_TYPES.has( nodeX.type ) ) {

		const componentCount = nodeX.type === 'vector2' ? 2 : nodeX.type === 'vector3' || nodeX.type === 'color3' ? 3 : 4;
		return nodeClass( ...Array( componentCount ).fill( input ) );

	}

	if ( THREE_COMPONENT_TYPES.has( inputType ) && SCALAR_TYPES.has( nodeX.type ) ) {

		return nodeClass( element( input, 0 ) );

	}

	return nodeClass( input );

};

const compileConstantNode = ( nodeX ) => nodeX.getNodeByName( 'value' );

const compileBooleanConditionalNode = ( nodeX ) => {

	if ( nodeX.type !== 'boolean' ) return null;

	const value1Default = nodeX.element === 'ifequal' ? float( 0 ) : float( 1 );
	const value2Default = float( 0 );
	const value1 = nodeX.getNodeByName( 'value1' ) || value1Default;
	const value2 = nodeX.getNodeByName( 'value2' ) || value2Default;

	if ( nodeX.element === 'ifgreater' ) return value1.greaterThan( value2 );
	if ( nodeX.element === 'ifgreatereq' ) return value1.greaterThanEqual( value2 );
	if ( nodeX.element === 'ifequal' ) return value1.equal( value2 );

	return null;

};

const compileSpaceInputNode = ( nodeX, objectNode, worldNode ) => {

	const rawSpace = nodeX.getInputValueByName( 'space' ) ?? nodeX.getAttribute( 'space' );
	const space = normalizeSpaceName( rawSpace, 'object' );
	return space === 'world' ? worldNode : objectNode;

};

const compileTexcoordNode = ( nodeX, compileContext ) => {

	const indexNode = nodeX.getChildByName( 'index' );
	const index = indexNode ? parseInt( indexNode.value, 10 ) : 0;
	return compileContext.mxToUvSpace( uv( index ) );

};

const compileGeomColorNode = ( nodeX ) => {

	const indexNode = nodeX.getChildByName( 'index' );
	const index = indexNode ? parseInt( indexNode.value, 10 ) : 0;
	return vertexColor( index );

};

const compileImageLikeNode = ( nodeX, compileContext ) => {

	const { file, uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	const node = sampleTexture( textureFile, uvNode, compileContext, vec4( 0, 0, 0, 1 ) );
	return applyTextureColorSpace( node, file );

};

const compileTiledImageNode = ( nodeX, compileContext ) => {

	const { file, uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	if ( ! textureFile ) {

		return vec4( 0, 0, 0, 1 );

	}

	const uvTiling = nodeX.getNodeByName( 'uvtiling' );
	const uvOffset = nodeX.getNodeByName( 'uvoffset' );
	const transformedUv = compileContext.mxTransformUv( uvTiling, uvOffset, uvNode );
	const node = sampleTexture( textureFile, transformedUv, compileContext, vec4( 0, 0, 0, 1 ) );
	return applyTextureColorSpace( node, file );

};

const compileHexTiledTextureNode = ( nodeX, compileContext, category ) => {

	const file = nodeX.getChildByName( 'file' );
	if ( ! file ) {

		nodeX.materialX.issueCollector.addInvalidValue(
			nodeX.name,
			`Texture node "${nodeX.name || nodeX.element}" is missing required input "file".`,
		);
		return vec4( 0, 0, 0, 1 );

	}

	const textureFile = file.getTexture();
	const uvNode = nodeX.getNodeByName( 'texcoord' ) || getDefaultUvNode( compileContext );
	const tiling = nodeX.getNodeByName( 'tiling' ) || vec2( 1, 1 );
	const rotation = nodeX.getNodeByName( 'rotation' ) || float( 1 );
	const rotationRange = nodeX.getNodeByName( 'rotationrange' ) || vec2( 0, 360 );
	const scale = nodeX.getNodeByName( 'scale' ) || float( 1 );
	const scaleRange = nodeX.getNodeByName( 'scalerange' ) || vec2( 0.5, 2 );
	const offset = nodeX.getNodeByName( 'offset' ) || float( 1 );
	const offsetRange = nodeX.getNodeByName( 'offsetrange' ) || vec2( 0, 1 );
	const falloff = nodeX.getNodeByName( 'falloff' ) || float( 0.5 );
	const falloffContrast = nodeX.getNodeByName( 'falloffcontrast' ) || float( 0.5 );
	const lumaCoeffs = nodeX.getNodeByName( 'lumacoeffs' ) || vec3( 0.2722287, 0.6740818, 0.0536895 );
	const transformedUv = mul( uvNode, tiling );
	const tileData = compileContext.mxHextileCoord( transformedUv, rotation, rotationRange, scale, scaleRange, offset, offsetRange );

	const invertY = ( v ) => vec2( element( v, 0 ), mul( element( v, 1 ), - 1 ) );
	let sample0 = texture( textureFile, compileContext.mxFromUvSpace( tileData.coords[ 0 ] ) ).grad(
		invertY( tileData.ddx[ 0 ] ),
		invertY( tileData.ddy[ 0 ] ),
	);
	let sample1 = texture( textureFile, compileContext.mxFromUvSpace( tileData.coords[ 1 ] ) ).grad(
		invertY( tileData.ddx[ 1 ] ),
		invertY( tileData.ddy[ 1 ] ),
	);
	let sample2 = texture( textureFile, compileContext.mxFromUvSpace( tileData.coords[ 2 ] ) ).grad(
		invertY( tileData.ddx[ 2 ] ),
		invertY( tileData.ddy[ 2 ] ),
	);
	const sample0Raw = sample0;
	const sample1Raw = sample1;
	const sample2Raw = sample2;

	const colorSpaceNode = file.getColorSpaceNode();
	if ( colorSpaceNode ) {

		sample0 = colorSpaceNode( sample0 );
		sample1 = colorSpaceNode( sample1 );
		sample2 = colorSpaceNode( sample2 );

	}

	const c0 = vec3( element( sample0, 0 ), element( sample0, 1 ), element( sample0, 2 ) );
	const c1 = vec3( element( sample1, 0 ), element( sample1, 1 ), element( sample1, 2 ) );
	const c2 = vec3( element( sample2, 0 ), element( sample2, 1 ), element( sample2, 2 ) );
	const cw = mix(
		vec3( 1, 1, 1 ),
		vec3( dot( c0, lumaCoeffs ), dot( c1, lumaCoeffs ), dot( c2, lumaCoeffs ) ),
		vec3( falloffContrast, falloffContrast, falloffContrast ),
	);
	const blendWeights = compileContext.mxHextileComputeBlendWeights( cw, tileData.weights, falloff );
	const alphaWeights = compileContext.mxHextileComputeBlendWeights( vec3( 1, 1, 1 ), tileData.weights, falloff );
	const blendedRgb = add( add( mul( element( blendWeights, 0 ), c0 ), mul( element( blendWeights, 1 ), c1 ) ), mul( element( blendWeights, 2 ), c2 ) );
	const blendedAlpha = add(
		add( mul( element( alphaWeights, 0 ), element( sample0Raw, 3 ) ), mul( element( alphaWeights, 1 ), element( sample1Raw, 3 ) ) ),
		mul( element( alphaWeights, 2 ), element( sample2Raw, 3 ) ),
	);
	const blended = vec4( blendedRgb, blendedAlpha );

	if ( category === 'hextilednormalmap' ) {

		const normalScale = nodeX.getNodeByName( 'scale' ) || float( 1 );
		return normalMap( blended, normalScale );

	}

	return blended;

};

const compileGltfTextureNode = ( nodeX, compileContext, category ) => {

	const { file, uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	const node = applyTextureColorSpace( sampleTexture( textureFile, uvNode, compileContext, float( 0 ) ), file );

	if ( category === 'gltf_normalmap' ) {

		const normalScale = nodeX.getNodeByName( 'scale' ) || float( 1 );
		return normalMap( node, normalScale );

	}

	return node;

};

const compileGltfColorImageNode = ( nodeX, out, compileContext ) => {

	const { file, uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	const sampled = sampleTexture( textureFile, uvNode, compileContext, vec4( 0, 0, 0, 1 ) );

	if ( out === 'outa' || out === 'a' ) {

		return element( sampled, 3 );

	}

	const converted = applyTextureColorSpace( sampled, file );
	return vec3( element( converted, 0 ), element( converted, 1 ), element( converted, 2 ) );

};

const compileGltfAnisotropyImageNode = ( nodeX, out, compileContext ) => {

	const { uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	const defaultInput = nodeX.getNodeByName( 'default' ) || vec3( 1, 0.5, 1 );
	const sampled = sampleTexture( textureFile, uvNode, compileContext, vec4( element( defaultInput, 0 ), element( defaultInput, 1 ), element( defaultInput, 2 ), 1 ) );
	const anisotropyStrengthFactor = nodeX.getNodeByName( 'anisotropy_strength' ) || float( 1 );
	const anisotropyRotationFactor = nodeX.getNodeByName( 'anisotropy_rotation' ) || float( 0 );
	const encodedDirection = vec2( sub( mul( element( sampled, 0 ), 2 ), 1 ), sub( mul( element( sampled, 1 ), 2 ), 1 ) );
	const textureRotation = mx_atan2( element( encodedDirection, 1 ), element( encodedDirection, 0 ) );
	const anisotropyStrengthOut = clamp( mul( anisotropyStrengthFactor, element( sampled, 2 ) ), 0, 1 );
	const anisotropyRotationOut = add( anisotropyRotationFactor, textureRotation );

	if ( out === 'anisotropy_rotation_out' ) {

		return anisotropyRotationOut;

	}

	return anisotropyStrengthOut;

};

const compileGltfIridescenceThicknessNode = ( nodeX, compileContext ) => {

	const { uvNode, textureFile } = getTextureInputs( nodeX, compileContext );
	const sampled = sampleTexture( textureFile, uvNode, compileContext, vec4( 0, 0, 0, 1 ) );
	const sampledThickness = element( sampled, 0 );
	const thicknessMin = nodeX.getNodeByName( 'thicknessMin' ) || float( 100 );
	const thicknessMax = nodeX.getNodeByName( 'thicknessMax' ) || float( 400 );
	return add( thicknessMin, mul( sampledThickness, sub( thicknessMax, thicknessMin ) ) );

};

const compileTransformMatrixNode = ( nodeX, compileContext ) => {

	const nodeDefName = nodeX.getAttribute( 'nodedef' );
	const inNode = nodeX.getNodeByName( 'in' ) || float( 0 );
	const matrixNode =
    nodeX.getNodeByName( 'mat' ) ||
    ( nodeDefName === 'ND_transformmatrix_vector2M3' || nodeDefName === 'ND_transformmatrix_vector3'
    	? mat3( ...compileContext.IDENTITY_MAT3_VALUES )
    	: mat4( ...compileContext.IDENTITY_MAT4_VALUES ) );

	if ( nodeDefName === 'ND_transformmatrix_vector2M3' ) {

		const transformed = mul( matrixNode, vec3( element( inNode, 0 ), element( inNode, 1 ), 1 ) );
		return vec2( element( transformed, 0 ), element( transformed, 1 ) );

	}

	if ( nodeDefName === 'ND_transformmatrix_vector3' ) {

		return mul( matrixNode, vec3( element( inNode, 0 ), element( inNode, 1 ), element( inNode, 2 ) ) );

	}

	if ( nodeDefName === 'ND_transformmatrix_vector3M4' ) {

		const transformed = mul( matrixNode, vec4( element( inNode, 0 ), element( inNode, 1 ), element( inNode, 2 ), 1 ) );
		return vec3( element( transformed, 0 ), element( transformed, 1 ), element( transformed, 2 ) );

	}

	return mul( matrixNode, vec4( element( inNode, 0 ), element( inNode, 1 ), element( inNode, 2 ), element( inNode, 3 ) ) );

};

const compileCreateMatrixNode = ( nodeX ) => {

	if ( nodeX.type === 'matrix44' ) {

		const vector3Input = nodeX.getAttribute( 'nodedef' ) === 'ND_creatematrix_vector3_matrix44';
		const toVec4Input = ( name, fallback, w ) => {

			const input = nodeX.getNodeByName( name ) || fallback;
			return vector3Input ? vec4( element( input, 0 ), element( input, 1 ), element( input, 2 ), w ) : input;

		};
		const in1 = toVec4Input( 'in1', vector3Input ? vec3( 1, 0, 0 ) : vec4( 1, 0, 0, 0 ), 0 );
		const in2 = toVec4Input( 'in2', vector3Input ? vec3( 0, 1, 0 ) : vec4( 0, 1, 0, 0 ), 0 );
		const in3 = toVec4Input( 'in3', vector3Input ? vec3( 0, 0, 1 ) : vec4( 0, 0, 1, 0 ), 0 );
		const in4 = toVec4Input( 'in4', vector3Input ? vec3( 0, 0, 0 ) : vec4( 0, 0, 0, 1 ), 1 );
		return mat4( in1, in2, in3, in4 );

	}

	const in1 = nodeX.getNodeByName( 'in1' ) || vec3( 1, 0, 0 );
	const in2 = nodeX.getNodeByName( 'in2' ) || vec3( 0, 1, 0 );
	const in3 = nodeX.getNodeByName( 'in3' ) || vec3( 0, 0, 1 );
	return mat3( in1, in2, in3 );

};

const getMatrixElement = ( matrixNode, row, column ) => element( element( matrixNode, column ), row );

const determinant2 = ( a, b, c, d ) => sub( mul( a, d ), mul( b, c ) );

const determinant3 = ( m00, m01, m02, m10, m11, m12, m20, m21, m22 ) =>
	add(
		sub( mul( m00, determinant2( m11, m12, m21, m22 ) ), mul( m01, determinant2( m10, m12, m20, m22 ) ) ),
		mul( m02, determinant2( m10, m11, m20, m21 ) ),
	);

const compileInvertMatrix3Node = ( matrixNode ) => {

	const m00 = getMatrixElement( matrixNode, 0, 0 );
	const m01 = getMatrixElement( matrixNode, 0, 1 );
	const m02 = getMatrixElement( matrixNode, 0, 2 );
	const m10 = getMatrixElement( matrixNode, 1, 0 );
	const m11 = getMatrixElement( matrixNode, 1, 1 );
	const m12 = getMatrixElement( matrixNode, 1, 2 );
	const m20 = getMatrixElement( matrixNode, 2, 0 );
	const m21 = getMatrixElement( matrixNode, 2, 1 );
	const m22 = getMatrixElement( matrixNode, 2, 2 );

	const inv00 = determinant2( m11, m12, m21, m22 );
	const inv01 = determinant2( m02, m01, m22, m21 );
	const inv02 = determinant2( m01, m02, m11, m12 );
	const inv10 = determinant2( m12, m10, m22, m20 );
	const inv11 = determinant2( m00, m02, m20, m22 );
	const inv12 = determinant2( m02, m00, m12, m10 );
	const inv20 = determinant2( m10, m11, m20, m21 );
	const inv21 = determinant2( m01, m00, m21, m20 );
	const inv22 = determinant2( m00, m01, m10, m11 );
	const determinant = add( add( mul( m00, inv00 ), mul( m01, inv10 ) ), mul( m02, inv20 ) );

	return mat3(
		div( inv00, determinant ), div( inv10, determinant ), div( inv20, determinant ),
		div( inv01, determinant ), div( inv11, determinant ), div( inv21, determinant ),
		div( inv02, determinant ), div( inv12, determinant ), div( inv22, determinant ),
	);

};

const compileInvertMatrix4Node = ( matrixNode ) => {

	const m = [];
	for ( let row = 0; row < 4; row ++ ) {

		m[ row ] = [];
		for ( let column = 0; column < 4; column ++ ) {

			m[ row ][ column ] = getMatrixElement( matrixNode, row, column );

		}

	}

	const getMinor3 = ( skipRow, skipColumn ) => {

		const rows = [ 0, 1, 2, 3 ].filter( ( row ) => row !== skipRow );
		const columns = [ 0, 1, 2, 3 ].filter( ( column ) => column !== skipColumn );
		return determinant3(
			m[ rows[ 0 ] ][ columns[ 0 ] ], m[ rows[ 0 ] ][ columns[ 1 ] ], m[ rows[ 0 ] ][ columns[ 2 ] ],
			m[ rows[ 1 ] ][ columns[ 0 ] ], m[ rows[ 1 ] ][ columns[ 1 ] ], m[ rows[ 1 ] ][ columns[ 2 ] ],
			m[ rows[ 2 ] ][ columns[ 0 ] ], m[ rows[ 2 ] ][ columns[ 1 ] ], m[ rows[ 2 ] ][ columns[ 2 ] ],
		);

	};

	const cofactors = [];
	for ( let row = 0; row < 4; row ++ ) {

		cofactors[ row ] = [];
		for ( let column = 0; column < 4; column ++ ) {

			const minor = getMinor3( row, column );
			cofactors[ row ][ column ] = ( row + column ) % 2 === 0 ? minor : mul( minor, - 1 );

		}

	}

	const determinant = add(
		add( mul( m[ 0 ][ 0 ], cofactors[ 0 ][ 0 ] ), mul( m[ 0 ][ 1 ], cofactors[ 0 ][ 1 ] ) ),
		add( mul( m[ 0 ][ 2 ], cofactors[ 0 ][ 2 ] ), mul( m[ 0 ][ 3 ], cofactors[ 0 ][ 3 ] ) ),
	);
	const values = [];
	for ( let column = 0; column < 4; column ++ ) {

		for ( let row = 0; row < 4; row ++ ) {

			values.push( div( cofactors[ column ][ row ], determinant ) );

		}

	}

	return mat4( ...values );

};

const compileInvertMatrixNode = ( nodeX, compileContext ) => {

	const inInput = nodeX.getChildByName( 'in' );
	const matrixType = inInput ? inInput.type : null;
	const isMatrixType = matrixType === 'matrix33' || matrixType === 'matrix44';

	if ( inInput && inInput.isConst && isMatrixType ) {

		const size = matrixType === 'matrix33' ? 3 : 4;
		const identityValues = size === 3 ? compileContext.IDENTITY_MAT3_VALUES : compileContext.IDENTITY_MAT4_VALUES;
		const matrixValues = inInput.getVector();
		const invertedValues = compileContext.invertConstantMatrixValues( matrixValues, size );

		if ( invertedValues === null ) {

			nodeX.materialX.issueCollector.addInvalidValue(
				nodeX.name,
				`Matrix input for "${nodeX.name || nodeX.element}" is singular; using identity fallback.`,
			);
			return size === 3 ? mat3( ...identityValues ) : mat4( ...identityValues );

		}

		return size === 3 ? mat3( ...invertedValues ) : mat4( ...invertedValues );

	}

	const inNode = nodeX.getNodeByName( 'in' );
	if ( isMatrixType ) {

		const size = matrixType === 'matrix33' ? 3 : 4;
		const fallback = size === 3 ? mat3( ...compileContext.IDENTITY_MAT3_VALUES ) : mat4( ...compileContext.IDENTITY_MAT4_VALUES );
		const matrixNode = inNode === undefined || inNode === null ? fallback : inNode;
		return size === 3 ? compileInvertMatrix3Node( matrixNode ) : compileInvertMatrix4Node( matrixNode );

	}

	return inNode === undefined || inNode === null ? float( 0 ) : inNode;

};

function createMaterialXCompileRegistry() {

	const registry = new Map();
	register( registry, [ 'convert' ], ( nodeX ) => compileConvertNode( nodeX ) );
	register( registry, [ 'constant' ], ( nodeX ) => compileConstantNode( nodeX ) );
	register( registry, [ 'position' ], ( nodeX ) => compileSpaceInputNode( nodeX, positionLocal, positionWorld ) );
	register( registry, [ 'normal' ], ( nodeX ) => normalize( compileSpaceInputNode( nodeX, normalLocal, normalWorld ) ) );
	register( registry, [ 'tangent' ], ( nodeX ) => compileSpaceInputNode( nodeX, tangentLocal, tangentWorld ) );
	register( registry, [ 'texcoord' ], ( nodeX, out, compileContext ) => compileTexcoordNode( nodeX, compileContext ) );
	register( registry, [ 'geomcolor' ], ( nodeX ) => compileGeomColorNode( nodeX ) );
	register( registry, [ 'tiledimage' ], ( nodeX, out, compileContext ) => compileTiledImageNode( nodeX, compileContext ) );
	register( registry, [ 'image' ], ( nodeX, out, compileContext ) => compileImageLikeNode( nodeX, compileContext ) );
	register( registry, [ 'hextiledimage', 'hextilednormalmap' ], ( nodeX, out, compileContext ) =>
		compileHexTiledTextureNode( nodeX, compileContext, nodeX.element ) );
	register( registry, [ 'gltf_image', 'gltf_normalmap' ], ( nodeX, out, compileContext ) =>
		compileGltfTextureNode( nodeX, compileContext, nodeX.element ) );
	register( registry, [ 'gltf_colorimage' ], ( nodeX, out, compileContext ) => compileGltfColorImageNode( nodeX, out, compileContext ) );
	register( registry, [ 'gltf_anisotropy_image' ], ( nodeX, out, compileContext ) =>
		compileGltfAnisotropyImageNode( nodeX, out, compileContext ) );
	register( registry, [ 'gltf_iridescence_thickness' ], ( nodeX, out, compileContext ) =>
		compileGltfIridescenceThicknessNode( nodeX, compileContext ) );
	register( registry, [ 'transformmatrix' ], ( nodeX, out, compileContext ) => compileTransformMatrixNode( nodeX, compileContext ) );
	register( registry, [ 'creatematrix' ], ( nodeX ) => compileCreateMatrixNode( nodeX ) );
	register( registry, [ 'invertmatrix' ], ( nodeX, out, compileContext ) => compileInvertMatrixNode( nodeX, compileContext ) );
	return registry;

}

function compileNodeFromRegistry( nodeX, out, compileContext ) {

	const handler = compileContext.compileRegistry.get( nodeX.element );
	if ( handler ) {

		return handler( nodeX, out, compileContext );

	}

	const booleanConditional = compileBooleanConditionalNode( nodeX );
	if ( booleanConditional ) {

		return booleanConditional;

	}

	const nodeElement = compileContext.nodeLibrary[ nodeX.element ];
	if ( ! nodeElement ) {

		return undefined;

	}

	const args = nodeX.getNodesByNames( ...nodeElement.params );
	for ( let i = 0; i < nodeElement.params.length; i += 1 ) {

		if ( args[ i ] !== undefined && args[ i ] !== null ) {

			continue;

		}

		const paramName = nodeElement.params[ i ];
		if ( paramName === 'texcoord' && UV_FALLBACK_CATEGORIES.has( nodeX.element ) ) {

			args[ i ] = getDefaultUvNode( compileContext );
			continue;

		}

		const defaultValue = nodeElement.defaults ? nodeElement.defaults[ paramName ] : undefined;
		if ( defaultValue !== undefined ) {

			args[ i ] = typeof defaultValue === 'function' ? defaultValue() : float( defaultValue );
			continue;

		}

		nodeX.materialX.issueCollector.addInvalidValue(
			nodeX.name,
			`Missing input "${paramName}" for node "${nodeX.name || nodeX.element}" (${nodeX.element}). Using fallback 0.`,
		);
		args[ i ] = float( 0 );

	}

	return nodeElement.usesNode ? nodeElement.nodeFunc( ...args, nodeX ) : nodeElement.nodeFunc( ...args );

}

export { createMaterialXCompileRegistry, compileNodeFromRegistry };
