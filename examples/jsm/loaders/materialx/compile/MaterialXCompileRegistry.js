import {
	element,
	float,
	int,
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
	bitangentLocal,
	bitangentWorld,
	clamp,
	add,
	abs,
	min,
	sub,
	floor,
	mix,
	dot,
	div,
	max,
	normalize,
	mx_atan2,
	pow,
	sqrt,
} from 'three/tsl';
import {
	getComponentCountForType,
	normalizeSpaceName,
	toBooleanNode,
	toVec3Channels,
} from '../MaterialXUtils.js';

const register = ( registry, categories, handler ) => {

	for ( const category of categories ) {

		registry.set( category, handler );

	}

};

const UV_FALLBACK_CATEGORIES = new Set( [ 'checkerboard', 'noise2d', 'fractal2d', 'cellnoise2d', 'worleynoise2d', 'unifiednoise2d', 'heighttonormal' ] );
const SCALAR_TYPES = new Set( [ 'boolean', 'integer', 'float' ] );
const THREE_COMPONENT_TYPES = new Set( [ 'vector2', 'vector3', 'vector4', 'color3', 'color4' ] );
const TEXTURE_ADDRESS_MODES = new Set( [ 'constant', 'clamp', 'periodic', 'mirror' ] );
const SWITCH_MIN_INDEX = 1;
const SWITCH_MAX_INDEX = 10;

const getDefaultUvNode = ( compileContext ) => compileContext.mxToBottomLeftUvSpace( uv( 0 ) );

const toBooleanMaskNode = ( node ) => toBooleanNode( node ).select( float( 1 ), float( 0 ) );

const getTextureAddressMode = ( nodeX, inputName ) => {

	const value = nodeX.getInputValueByName( inputName );
	if ( value === null || value === undefined || value === '' ) return 'periodic';

	const mode = value.trim().toLowerCase();
	return TEXTURE_ADDRESS_MODES.has( mode ) ? mode : 'periodic';

};

const getTextureAddressModes = ( nodeX ) => ( {
	u: getTextureAddressMode( nodeX, 'uaddressmode' ),
	v: getTextureAddressMode( nodeX, 'vaddressmode' ),
} );

const getZeroNodeForType = ( type ) => {

	if ( type === 'vector2' ) return vec2( 0, 0 );
	if ( type === 'vector3' || type === 'color3' ) return vec3( 0, 0, 0 );
	if ( type === 'vector4' || type === 'color4' ) return vec4( 0, 0, 0, 0 );
	return float( 0 );

};

const toTextureDefaultNode = ( node, type ) => {

	if ( type === 'vector2' ) return vec4( node, 0, 1 );
	if ( type === 'vector3' || type === 'color3' ) return vec4( node, 1 );
	if ( type === 'vector4' || type === 'color4' ) return vec4( node );
	return vec4( node, 0, 0, 1 );

};

const getTextureInputs = ( nodeX, compileContext ) => {

	const file = nodeX.getChildByName( 'file' );
	const uvNode = nodeX.getNodeByName( 'texcoord' ) || getDefaultUvNode( compileContext );
	const textureFile = file ? file.getTexture() : null;
	const defaultNode = nodeX.getNodeByName( 'default' ) || getZeroNodeForType( nodeX.type );
	const addressModes = getTextureAddressModes( nodeX );
	return { file, uvNode, textureFile, defaultNode, addressModes };

};

const applyTextureAddressModeDefault = ( node, uvNode, addressModes, defaultNode ) => {

	let outsideBounds = null;

	if ( addressModes.u === 'constant' ) {

		const u = element( uvNode, 0 );
		outsideBounds = u.lessThan( 0 ).or( u.greaterThan( 1 ) );

	}

	if ( addressModes.v === 'constant' ) {

		const v = element( uvNode, 1 );
		const vOutsideBounds = v.lessThan( 0 ).or( v.greaterThan( 1 ) );
		outsideBounds = outsideBounds ? outsideBounds.or( vOutsideBounds ) : vOutsideBounds;

	}

	return outsideBounds ? outsideBounds.select( defaultNode, node ) : node;

};

const sampleTexture = ( textureFile, uvNode, compileContext, fallback, addressModes = null, defaultNode = fallback ) => {

	if ( ! textureFile ) return fallback;

	const textureUvNode = compileContext.mxFromBottomLeftUvSpace( uvNode );
	const sampled = texture( textureFile, textureUvNode );
	return addressModes ? applyTextureAddressModeDefault( sampled, textureUvNode, addressModes, defaultNode ) : sampled;

};

const applyTextureColorSpace = ( node, file ) => {

	const colorSpaceNode = file ? file.getColorSpaceNode() : null;
	return colorSpaceNode ? colorSpaceNode( node ) : node;

};

const compileConvertNode = ( nodeX ) => {

	const input = nodeX.getNodeByName( 'in' );
	const inputElement = nodeX.getChildByName( 'in' );
	const inputType = inputElement ? inputElement.type : null;
	const nodeClass = nodeX.getClassFromType( nodeX.type ) || float;

	if ( nodeX.type === 'boolean' ) {

		return toBooleanNode( input );

	}

	if ( inputType === 'boolean' ) {

		const inputMask = toBooleanMaskNode( input );
		if ( THREE_COMPONENT_TYPES.has( nodeX.type ) ) {

			const componentCount = getComponentCountForType( nodeX.type );
			return nodeClass( ...Array( componentCount ).fill( inputMask ) );

		}

		return nodeClass( inputMask );

	}

	if ( SCALAR_TYPES.has( inputType ) && THREE_COMPONENT_TYPES.has( nodeX.type ) ) {

		const componentCount = getComponentCountForType( nodeX.type );
		return nodeClass( ...Array( componentCount ).fill( input ) );

	}

	if ( THREE_COMPONENT_TYPES.has( inputType ) && SCALAR_TYPES.has( nodeX.type ) ) {

		return nodeClass( element( input, 0 ) );

	}

	return nodeClass( input );

};

const compileConstantNode = ( nodeX ) => nodeX.getNodeByName( 'value' );

const compileArtisticIorNode = ( nodeX, out ) => {

	const reflectivity = clamp(
		nodeX.getNodeByName( 'reflectivity' ) || vec3( 0.944, 0.776, 0.373 ),
		vec3( 0, 0, 0 ),
		vec3( 0.99, 0.99, 0.99 ),
	);
	const edgeColor = nodeX.getNodeByName( 'edge_color' ) || vec3( 0.998, 0.981, 0.751 );
	const one = vec3( 1, 1, 1 );
	const nMin = div( sub( one, reflectivity ), add( one, reflectivity ) );
	const nMax = div( add( one, sqrt( reflectivity ) ), sub( one, sqrt( reflectivity ) ) );
	const ior = mix( nMax, nMin, edgeColor );
	const iorPlusOne = add( ior, one );
	const iorMinusOne = sub( ior, one );
	const k2 = max(
		div(
			sub(
				mul( mul( iorPlusOne, iorPlusOne ), reflectivity ),
				mul( iorMinusOne, iorMinusOne ),
			),
			sub( one, reflectivity ),
		),
		vec3( 0, 0, 0 ),
	);
	const extinction = sqrt( k2 );
	return out === 'extinction' ? extinction : ior;

};

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

const compileClampNode = ( nodeX ) => {

	const inNode = nodeX.getNodeByName( 'in' ) || float( 0 );
	const low = nodeX.getNodeByName( 'low' ) || float( 0 );
	const high = nodeX.getNodeByName( 'high' ) || float( 1 );
	return min( max( inNode, low ), high );

};

const compileNormalizeNode = ( nodeX ) => {

	const inNode = nodeX.getNodeByName( 'in' ) || getZeroNodeForType( nodeX.type );
	const zeroNode = getZeroNodeForType( nodeX.type );
	const lengthSquared = dot( inNode, inNode );
	const safeLengthSquared = max( lengthSquared, float( 1e-8 ) );
	const normalized = mul( inNode, div( float( 1 ), sqrt( safeLengthSquared ) ) );
	return abs( lengthSquared ).lessThan( float( 1e-8 ) ).select( zeroNode, normalized );

};

const compileRemapNode = ( nodeX ) => {

	const inNode = nodeX.getNodeByName( 'in' ) || float( 0 );
	const inLow = nodeX.getNodeByName( 'inlow' ) || float( 0 );
	const inHigh = nodeX.getNodeByName( 'inhigh' ) || float( 1 );
	const outLow = nodeX.getNodeByName( 'outlow' ) || float( 0 );
	const outHigh = nodeX.getNodeByName( 'outhigh' ) || float( 1 );
	const denominator = sub( inHigh, inLow );
	const isDegenerate = abs( denominator ).lessThan( float( 1e-8 ) );
	const safeDenominator = isDegenerate.select( float( 1 ), denominator );
	const remapped = add(
		mul( div( sub( inNode, inLow ), safeDenominator ), sub( outHigh, outLow ) ),
		outLow,
	);
	return isDegenerate.select( outLow, remapped );

};

const compileRangeNode = ( nodeX ) => {

	const inNode = nodeX.getNodeByName( 'in' ) || float( 0 );
	const inLow = nodeX.getNodeByName( 'inlow' ) || float( 0 );
	const inHigh = nodeX.getNodeByName( 'inhigh' ) || float( 1 );
	const outLow = nodeX.getNodeByName( 'outlow' ) || float( 0 );
	const outHigh = nodeX.getNodeByName( 'outhigh' ) || float( 1 );
	const gamma = nodeX.getNodeByName( 'gamma' ) || float( 1 );
	const doClamp = nodeX.getNodeByName( 'doclamp' ) || int( 0 );

	const denominator = sub( inHigh, inLow );
	const isDegenerate = abs( denominator ).lessThan( float( 1e-8 ) );
	const safeDenominator = isDegenerate.select( float( 1 ), denominator );
	const normalized = div( sub( inNode, inLow ), safeDenominator );
	const safeGamma = max( abs( gamma ), float( 1e-8 ) );
	const gammaApplied = pow( normalized, div( float( 1 ), safeGamma ) );
	const remapped = add( mul( gammaApplied, sub( outHigh, outLow ) ), outLow );
	const result = isDegenerate.select( outLow, remapped );
	const clamped = min( max( result, outLow ), outHigh );

	return toBooleanNode( doClamp ).select( clamped, result );

};

const compileRamplrNode = ( nodeX, compileContext ) => {

	const texcoord = nodeX.getNodeByName( 'texcoord' ) || getDefaultUvNode( compileContext );
	const valuel = nodeX.getNodeByName( 'valuel' ) || float( 0 );
	const valuer = nodeX.getNodeByName( 'valuer' ) || float( 1 );
	const t = min( max( element( texcoord, 0 ), float( 0 ) ), float( 1 ) );
	return mix( valuel, valuer, t );

};

const compileRamptbNode = ( nodeX, compileContext ) => {

	const texcoord = nodeX.getNodeByName( 'texcoord' ) || getDefaultUvNode( compileContext );
	const valueb = nodeX.getNodeByName( 'valueb' ) || float( 0 );
	const valuet = nodeX.getNodeByName( 'valuet' ) || float( 1 );
	const t = min( max( element( texcoord, 1 ), float( 0 ) ), float( 1 ) );
	return mix( valueb, valuet, t );

};

const getSwitchBranchNode = ( nodeX, index ) => nodeX.getNodeByName( `in${index}` ) || getZeroNodeForType( nodeX.type );

const compileSwitchNode = ( nodeX ) => {

	const fallbackNode = getSwitchBranchNode( nodeX, SWITCH_MIN_INDEX );
	const whichInput = nodeX.getNodeByName( 'which' );
	const switchIndex = add( floor( float( whichInput === undefined || whichInput === null ? 0 : whichInput ) ), 1 );
	const whichNode = clamp(
		float( switchIndex ),
		float( SWITCH_MIN_INDEX ),
		float( SWITCH_MAX_INDEX ),
	);

	let result = fallbackNode;
	for ( let branchIndex = SWITCH_MIN_INDEX + 1; branchIndex <= SWITCH_MAX_INDEX; branchIndex += 1 ) {

		const branchNode = getSwitchBranchNode( nodeX, branchIndex );
		result = whichNode.equal( float( branchIndex ) ).select( branchNode, result );

	}

	return result;

};

const compileSpaceInputNode = ( nodeX, objectNode, worldNode ) => {

	const rawSpace = nodeX.getInputValueByName( 'space' ) ?? nodeX.getAttribute( 'space' );
	const space = normalizeSpaceName( rawSpace, 'object' );
	return space === 'world' ? worldNode : objectNode;

};

const compileNormalizedSpaceInputNode = ( nodeX, objectNode, worldNode ) => normalize( compileSpaceInputNode( nodeX, objectNode, worldNode ) );

const compileTexcoordNode = ( nodeX, compileContext ) => {

	const indexNode = nodeX.getChildByName( 'index' );
	const index = indexNode ? parseInt( indexNode.value, 10 ) : 0;
	return compileContext.mxToBottomLeftUvSpace( uv( index ) );

};

const compileGeomColorNode = ( nodeX ) => {

	const indexNode = nodeX.getChildByName( 'index' );
	const index = indexNode ? parseInt( indexNode.value, 10 ) : 0;
	return vertexColor( index );

};

const compileImageLikeNode = ( nodeX, compileContext ) => {

	const { file, uvNode, textureFile, defaultNode, addressModes } = getTextureInputs( nodeX, compileContext );
	const textureDefault = toTextureDefaultNode( defaultNode, nodeX.type );
	const node = sampleTexture( textureFile, uvNode, compileContext, textureDefault, addressModes, textureDefault );
	return applyTextureColorSpace( node, file );

};

const compileTiledImageNode = ( nodeX, compileContext ) => {

	const { file, uvNode, textureFile, defaultNode, addressModes } = getTextureInputs( nodeX, compileContext );
	const textureDefault = toTextureDefaultNode( defaultNode, nodeX.type );
	if ( ! textureFile ) {

		return textureDefault;

	}

	const uvTiling = nodeX.getNodeByName( 'uvtiling' );
	const uvOffset = nodeX.getNodeByName( 'uvoffset' );
	const transformedUv = compileContext.mxTransformUv( uvTiling, uvOffset, uvNode );
	const node = sampleTexture( textureFile, transformedUv, compileContext, textureDefault, addressModes, textureDefault );
	return applyTextureColorSpace( node, file );

};

const compileHexTiledNormalMapNode = ( nodeX, compileContext, sampleNode ) => {

	const normalMapNodeElement = compileContext.nodeLibrary.normalmap;
	const strengthNode = nodeX.getNodeByName( 'strength' ) || float( 1 );

	if ( ! normalMapNodeElement || typeof normalMapNodeElement.nodeFunc !== 'function' ) {

		return normalMap( vec4( sampleNode, 1 ), strengthNode );

	}

	const args = normalMapNodeElement.params.map( ( paramName ) => {

		if ( paramName === 'in' ) return sampleNode;
		if ( paramName === 'scale' ) return strengthNode;
		return nodeX.getNodeByName( paramName );

	} );

	for ( let i = 0; i < normalMapNodeElement.params.length; i += 1 ) {

		if ( args[ i ] !== undefined && args[ i ] !== null ) {

			continue;

		}

		const paramName = normalMapNodeElement.params[ i ];
		const defaultValue = normalMapNodeElement.defaults ? normalMapNodeElement.defaults[ paramName ] : undefined;
		args[ i ] = defaultValue !== undefined ? ( typeof defaultValue === 'function' ? defaultValue() : float( defaultValue ) ) : float( 0 );

	}

	return normalMapNodeElement.nodeFunc( ...args );

};

const compileHexTiledTextureNode = ( nodeX, compileContext, category ) => {

	const file = nodeX.getChildByName( 'file' );
	if ( ! file ) {

		nodeX.materialX.issueCollector.addInvalidValue(
			nodeX.name,
			`Texture node "${nodeX.name || nodeX.element}" is missing required input "file".`,
		);
		if ( category === 'hextilednormalmap' ) {

			return normalize( nodeX.getNodeByName( 'normal' ) || normalLocal );

		}
		return vec4( 0, 0, 0, 1 );

	}

	const textureFile = file.getTexture();
	if ( ! textureFile ) {

		if ( category === 'hextilednormalmap' ) {

			return normalize( nodeX.getNodeByName( 'normal' ) || normalLocal );

		}
		return vec4( 0, 0, 0, 1 );

	}

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
	let lumaCoeffs = nodeX.getNodeByName( 'lumacoeffs' ) || vec3( 0.2722287, 0.6740818, 0.0536895 );
	const lumaCoeffsInput = nodeX.getChildByName( 'lumacoeffs' );
	if ( lumaCoeffsInput && lumaCoeffsInput.isConst ) {

		const lumaCoeffValues = lumaCoeffsInput.getVector();
		if ( lumaCoeffValues.length === 3 ) {

			// Treat luminance coefficients as raw numeric values, not display colors.
			lumaCoeffs = vec3( lumaCoeffValues[ 0 ], lumaCoeffValues[ 1 ], lumaCoeffValues[ 2 ] );

		}

	}
	const transformedUv = compileContext.mxFromBottomLeftUvSpace( mul( uvNode, tiling ) );
	const tileData = compileContext.mxHextileCoord( transformedUv, rotation, rotationRange, scale, scaleRange, offset, offsetRange );

	let sample0 = texture( textureFile, tileData.coords[ 0 ] ).grad(
		tileData.ddx[ 0 ],
		tileData.ddy[ 0 ],
	);
	let sample1 = texture( textureFile, tileData.coords[ 1 ] ).grad(
		tileData.ddx[ 1 ],
		tileData.ddy[ 1 ],
	);
	let sample2 = texture( textureFile, tileData.coords[ 2 ] ).grad(
		tileData.ddx[ 2 ],
		tileData.ddy[ 2 ],
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

	const c0 = toVec3Channels( sample0 );
	const c1 = toVec3Channels( sample1 );
	const c2 = toVec3Channels( sample2 );
	const falloffContrastWeight = mul( falloffContrast, 0.5 );
	const cw = mix(
		vec3( 1, 1, 1 ),
		vec3( dot( c0, lumaCoeffs ), dot( c1, lumaCoeffs ), dot( c2, lumaCoeffs ) ),
		vec3( falloffContrastWeight, falloffContrastWeight, falloffContrastWeight ),
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

		const flipGNode = nodeX.getNodeByName( 'flip_g' );
		let normalSample = blended;

		if ( flipGNode ) {

			const flippedSample = vec4(
				element( blended, 0 ),
				sub( 1, element( blended, 1 ) ),
				element( blended, 2 ),
				element( blended, 3 ),
			);
			normalSample = toBooleanNode( flipGNode ).select( flippedSample, blended );

		}

		return compileHexTiledNormalMapNode( nodeX, compileContext, toVec3Channels( normalSample ) );

	}

	return blended;

};

const compileGltfTextureNode = ( nodeX, compileContext, category ) => {

	const { file, uvNode, textureFile, addressModes } = getTextureInputs( nodeX, compileContext );
	let transformedUv = uvNode;
	const place2d = compileContext.nodeLibrary.place2d;

	if ( place2d ) {

		const pivot = nodeX.getNodeByName( 'pivot' ) || vec2( 0, 1 );
		const scale = nodeX.getNodeByName( 'scale' ) || vec2( 1, 1 );
		const rotate = nodeX.getNodeByName( 'rotate' ) || float( 0 );
		const offset = nodeX.getNodeByName( 'offset' ) || vec2( 0, 0 );
		const operationorder = nodeX.getNodeByName( 'operationorder' ) || int( 0 );
		transformedUv = place2d.nodeFunc(
			uvNode,
			pivot,
			div( vec2( 1, 1 ), scale ),
			mul( rotate, - 1 ),
			mul( offset, vec2( - 1, 1 ) ),
			operationorder,
		);

	}

	const defaultInput = nodeX.getNodeByName( 'default' );
	let fallback = float( 0 );

	if ( nodeX.type === 'color3' || nodeX.type === 'vector3' ) {

		const defaultColor = defaultInput || vec3( 0, 0, 0 );
		fallback = vec4( element( defaultColor, 0 ), element( defaultColor, 1 ), element( defaultColor, 2 ), 1 );

	} else if ( nodeX.type === 'color4' || nodeX.type === 'vector4' ) {

		fallback = defaultInput || vec4( 0, 0, 0, 1 );

	} else {

		const defaultValue = defaultInput || float( 0 );
		fallback = vec4( defaultValue, 0, 0, 1 );

	}

	const node = applyTextureColorSpace( sampleTexture( textureFile, transformedUv, compileContext, fallback, addressModes, fallback ), file );

	if ( category === 'gltf_normalmap' ) {

		const normalScale = nodeX.getNodeByName( 'scale' ) || float( 1 );
		return normalMap( node, normalScale );

	}

	const factor = nodeX.getNodeByName( 'factor' );

	if ( factor ) {

		if ( nodeX.type === 'color3' || nodeX.type === 'vector3' ) {

			return mul( factor, toVec3Channels( node ) );

		}

		return mul( factor, node );

	}

	return node;

};

const compileGltfColorImageNode = ( nodeX, out, compileContext ) => {

	const { file, uvNode, textureFile, addressModes } = getTextureInputs( nodeX, compileContext );
	let transformedUv = uvNode;
	const place2d = compileContext.nodeLibrary.place2d;

	if ( place2d ) {

		const pivot = nodeX.getNodeByName( 'pivot' ) || vec2( 0, 1 );
		const scale = nodeX.getNodeByName( 'scale' ) || vec2( 1, 1 );
		const rotate = nodeX.getNodeByName( 'rotate' ) || float( 0 );
		const offset = nodeX.getNodeByName( 'offset' ) || vec2( 0, 0 );
		// Match MaterialX's ND_gltf_colorimage graph implementation, which wires gltf_image with operationorder=0.
		const operationorder = int( 0 );
		transformedUv = place2d.nodeFunc(
			uvNode,
			pivot,
			div( vec2( 1, 1 ), scale ),
			mul( rotate, - 1 ),
			mul( offset, vec2( - 1, 1 ) ),
			operationorder,
		);

	}

	const defaultInput = nodeX.getNodeByName( 'default' ) || vec4( 0, 0, 0, 0 );
	const fallback = vec4( defaultInput );
	const sampled = sampleTexture( textureFile, transformedUv, compileContext, fallback, addressModes, fallback );
	const converted = applyTextureColorSpace( sampled, file );
	const color = nodeX.getNodeByName( 'color' ) || vec4( 1, 1, 1, 1 );
	const geomcolor = nodeX.getNodeByName( 'geomcolor' ) || vec4( 1, 1, 1, 1 );
	const modulated = mul( mul( converted, color ), geomcolor );

	if ( out === 'outa' || out === 'a' ) {

		return element( modulated, 3 );

	}

	return toVec3Channels( modulated );

};

const compileGltfAnisotropyImageNode = ( nodeX, out, compileContext ) => {

	const { uvNode, textureFile, addressModes } = getTextureInputs( nodeX, compileContext );
	const defaultInput = nodeX.getNodeByName( 'default' ) || vec3( 1, 0.5, 1 );
	const fallback = vec4( element( defaultInput, 0 ), element( defaultInput, 1 ), element( defaultInput, 2 ), 1 );
	const sampled = sampleTexture( textureFile, uvNode, compileContext, fallback, addressModes, fallback );
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

	const { uvNode, textureFile, addressModes } = getTextureInputs( nodeX, compileContext );
	const fallback = vec4( 0, 0, 0, 1 );
	const sampled = sampleTexture( textureFile, uvNode, compileContext, fallback, addressModes, fallback );
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
	register( registry, [ 'artistic_ior' ], ( nodeX, out ) => compileArtisticIorNode( nodeX, out ) );
	register( registry, [ 'clamp' ], ( nodeX ) => compileClampNode( nodeX ) );
	register( registry, [ 'normalize' ], ( nodeX ) => compileNormalizeNode( nodeX ) );
	register( registry, [ 'range' ], ( nodeX ) => compileRangeNode( nodeX ) );
	register( registry, [ 'remap' ], ( nodeX ) => compileRemapNode( nodeX ) );
	register( registry, [ 'ramplr' ], ( nodeX, out, compileContext ) => compileRamplrNode( nodeX, compileContext ) );
	register( registry, [ 'ramptb' ], ( nodeX, out, compileContext ) => compileRamptbNode( nodeX, compileContext ) );
	register( registry, [ 'position' ], ( nodeX ) => compileSpaceInputNode( nodeX, positionLocal, positionWorld ) );
	register( registry, [ 'normal' ], ( nodeX ) => compileNormalizedSpaceInputNode( nodeX, normalLocal, normalWorld ) );
	register( registry, [ 'tangent' ], ( nodeX ) => compileNormalizedSpaceInputNode( nodeX, tangentLocal, tangentWorld ) );
	register( registry, [ 'bitangent' ], ( nodeX ) => compileNormalizedSpaceInputNode( nodeX, bitangentLocal, bitangentWorld ) );
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
	register( registry, [ 'switch' ], ( nodeX ) => compileSwitchNode( nodeX ) );
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
