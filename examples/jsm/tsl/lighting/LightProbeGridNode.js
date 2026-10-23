import { AnalyticLightNode, NodeUpdateType, Vector3 } from 'three/webgpu';
import { array, cameraPosition, float, Fn, getShIrradianceAt, If, int, Loop, normalWorld, positionWorld, renderGroup, select, texture, texture3D, uniform, vec2, vec3, vec4 } from 'three/tsl';

// Padding texels at each boundary of every atlas sub-volume.
export const ATLAS_PADDING = 1;

// Distance tiles have a one-texel mirrored border and follow bake order.
export const DISTANCE_RESOLUTION = 8;
export const DISTANCE_COLUMNS = 32;

// Negative mean distance excludes hidden probes from lighting.
export const HIDDEN_DISTANCE = - 1;

// Irradiance tiles use the same layout, with one bilinear sample per probe.
export const IRRADIANCE_RESOLUTION = 8;
export const IRRADIANCE_TILE = IRRADIANCE_RESOLUTION + 2;

const signNotZero = ( value ) => select( value.greaterThanEqual( 0.0 ), float( 1.0 ), float( - 1.0 ) );

/**
 * Maps a direction to octahedral coordinates in [0, 1]².
 *
 * @private
 */
export const octEncode = /*@__PURE__*/ Fn( ( [ direction ] ) => {

	const p = direction.div( direction.abs().dot( vec3( 1.0 ) ).max( 1e-6 ) ).toConst();
	const folded = vec2( p.y.abs().oneMinus().mul( signNotZero( p.x ) ), p.x.abs().oneMinus().mul( signNotZero( p.y ) ) );

	return select( p.z.lessThan( 0.0 ), folded, p.xy ).mul( 0.5 ).add( 0.5 );

} ).setLayout( {
	name: 'lightProbeOctEncode',
	type: 'vec2',
	inputs: [ { name: 'direction', type: 'vec3' } ]
} );

/**
 * Returns the probe index and tile texel, mirroring borders across octahedral seams.
 *
 * @private
 */
export function octTileTexel( texel, resolution ) {

	const tileSize = resolution + 2;
	const probeIndex = texel.y.div( tileSize ).mul( DISTANCE_COLUMNS ).add( texel.x.div( tileSize ) );

	const x0 = texel.x.mod( tileSize ).sub( 1 );
	const y0 = texel.y.mod( tileSize ).sub( 1 );
	const x1 = x0.clamp( 0, resolution - 1 );
	const y1 = select( x0.lessThan( 0 ).or( x0.greaterThanEqual( resolution ) ), int( resolution - 1 ).sub( y0 ), y0 );
	const x = select( y1.lessThan( 0 ).or( y1.greaterThanEqual( resolution ) ), int( resolution - 1 ).sub( x1 ), x1 );
	const y = y1.clamp( 0, resolution - 1 );

	return { probeIndex, x, y };

}

/**
 * Returns the atlas UV for a direction in a probe’s octahedral tile.
 *
 * @private
 */
const octTileUV = /*@__PURE__*/ Fn( ( [ probeIndex, direction, resolution, atlasSize ] ) => {

	const tile = vec2( float( probeIndex.mod( DISTANCE_COLUMNS ) ), float( probeIndex.div( DISTANCE_COLUMNS ) ) );

	return tile.mul( resolution.add( 2.0 ) ).add( 1.0 ).add( octEncode( direction ).mul( resolution ) ).div( atlasSize );

} ).setLayout( {
	name: 'lightProbeOctTileUV',
	type: 'vec2',
	inputs: [
		{ name: 'probeIndex', type: 'int' },
		{ name: 'direction', type: 'vec3' },
		{ name: 'resolution', type: 'float' },
		{ name: 'atlasSize', type: 'vec2' }
	]
} );

/**
 * Maps octahedral coordinates in [-1, 1]² to a unit direction.
 *
 * @private
 */
export const octDecode = /*@__PURE__*/ Fn( ( [ e ] ) => {

	const z = float( 1.0 ).sub( e.x.abs() ).sub( e.y.abs() ).toConst();
	const folded = vec2( e.y.abs().oneMinus().mul( signNotZero( e.x ) ), e.x.abs().oneMinus().mul( signNotZero( e.y ) ) );

	return vec3( select( z.lessThan( 0.0 ), folded, e ), z ).normalize();

} ).setLayout( {
	name: 'lightProbeOctDecode',
	type: 'vec3',
	inputs: [ { name: 'e', type: 'vec2' } ]
} );

/**
 * Packs nine RGB SH coefficients into seven RGBA texels, requesting only the required coefficients.
 *
 * @private
 */
export function packGridSH( c, textureIndex ) {

	switch ( textureIndex ) {

		case 0: return vec4( c( 0 ).xyz, c( 1 ).x );
		case 1: return vec4( c( 1 ).yz, c( 2 ).xy );
		case 2: return vec4( c( 2 ).z, c( 3 ).xyz );
		case 3: return vec4( c( 4 ).xyz, c( 5 ).x );
		case 4: return vec4( c( 5 ).yz, c( 6 ).xy );
		case 5: return vec4( c( 6 ).z, c( 7 ).xyz );
		default: return vec4( c( 8 ).xyz, 0.0 );

	}

}

/**
 * Unpacks nine RGB SH coefficients from seven RGBA texels.
 *
 * @private
 */
export function unpackGridSH( s ) {

	return array( [
		s[ 0 ].xyz,
		vec3( s[ 0 ].w, s[ 1 ].xy ),
		vec3( s[ 1 ].zw, s[ 2 ].x ),
		s[ 2 ].yzw,
		s[ 3 ].xyz,
		vec3( s[ 3 ].w, s[ 4 ].xy ),
		vec3( s[ 4 ].zw, s[ 5 ].x ),
		s[ 5 ].yzw,
		s[ 6 ].xyz
	] );

}

/**
 * Samples SH coefficients at texel-center coordinates, with padded Z slices for trilinear filtering.
 *
 * @private
 */
export function sampleGridSH( atlas, uvw, nz ) {

	const paddedSlices = nz.add( 2.0 * ATLAS_PADDING );
	const atlasDepth = paddedSlices.mul( 7.0 );
	const uvZBase = uvw.z.mul( nz ).add( ATLAS_PADDING );

	const s = [];
	for ( let t = 0; t < 7; t ++ ) s.push( atlas.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( t ) ).div( atlasDepth ) ) ) );

	return unpackGridSH( s );

}

/**
 * Returns the cubed Chebyshev visibility bound from distance moments (Majercik et al., 2019).
 *
 * @private
 */
function chebyshevVisibility( moments, distance ) {

	const variance = moments.y.sub( moments.x.mul( moments.x ) ).max( 1e-6 );
	const delta = distance.sub( moments.x ).max( 0.0 );

	return variance.div( variance.add( delta.mul( delta ) ) ).pow( 3.0 );

}

// Share the visibility and interpolation math across grids. Texture bindings
// remain per grid, so each volume still performs its own atlas lookups.
const probeInterpolationWeight = /*@__PURE__*/ Fn( ( [ moments, distance, normal, toProbe, offset, alpha ] ) => {

	const visibility = chebyshevVisibility( moments, distance );
	const direction = toProbe.div( toProbe.length().max( 1e-6 ) ).toConst();
	const wrap = normal.dot( direction ).mul( 0.5 ).add( 0.5 ).pow( 2.0 ).add( 0.2 );
	const weight = wrap.mul( visibility.max( 0.05 ) ).max( 1e-6 ).toVar();

	If( weight.lessThan( 0.2 ), () => {

		weight.mulAssign( weight.mul( weight ).div( 0.04 ) );

	} );

	const blend = offset.mul( alpha ).add( offset.oneMinus().mul( alpha.oneMinus() ) ).max( vec3( 0.001 ) ).toConst();

	return weight.mul( blend.x.mul( blend.y ).mul( blend.z ) );

} ).setLayout( {
	name: 'lightProbeInterpolationWeight',
	type: 'float',
	inputs: [
		{ name: 'moments', type: 'vec2' },
		{ name: 'distance', type: 'float' },
		{ name: 'normal', type: 'vec3' },
		{ name: 'toProbe', type: 'vec3' },
		{ name: 'offset', type: 'vec3' },
		{ name: 'alpha', type: 'vec3' }
	]
} );

/**
 * Blends eight probes with trilinear, wrapped-normal and Chebyshev visibility weights.
 *
 * @private
 * @see {@link https://github.com/NVIDIAGameWorks/RTXGI-DDGI/blob/main/rtxgi-sdk/shaders/ddgi/Irradiance.hlsl}
 */
function evaluateGridIrradianceVisibility( grid, sampleIrradiance ) {

	const { min, res, spacing, moments, distanceScale, normalBias, viewBias, momentsSize, irradianceSize, visibilityGridSize } = grid;

	const nx = int( res.x ), nz = int( res.z );

	const clearance = spacing.x.min( spacing.y ).min( spacing.z );
	const viewDirection = cameraPosition.sub( positionWorld ).normalize();
	const biased = positionWorld.add( normalWorld.mul( clearance.mul( normalBias ) ) ).add( viewDirection.mul( clearance.mul( viewBias ) ) ).toVar();

	const gridPosition = biased.sub( min ).div( spacing ).clamp( vec3( 0.0 ), res.sub( 1.0 ) ).toVar();
	const base = gridPosition.floor().min( res.sub( 2.0 ) ).max( 0.0 ).toVar();
	const alpha = gridPosition.sub( base ).clamp( 0.0, 1.0 ).toVar();

	const total = vec3( 0.0 ).toVar();
	const weights = float( 0.0 ).toVar();

	// Every probe is sampled in the direction of the normal.
	const normalOct = octEncode( normalWorld ).mul( IRRADIANCE_RESOLUTION ).add( 1.0 ).toVar();

	// Keep the node graph small with a shader loop over the corners.

	Loop( 8, ( { i: corner } ) => {

		const offset = vec3( corner.bitAnd( 1 ), corner.shiftRight( 1 ).bitAnd( 1 ), corner.shiftRight( 2 ).bitAnd( 1 ) ).toVar();
		const cell = base.add( offset ).toVar();
		const probePosition = min.add( cell.mul( spacing ) ).toVar();

		// Chebyshev visibility from the probe's distance moments toward the receiver.

		const toReceiver = biased.sub( probePosition ).toConst();
		const distance = toReceiver.length().max( 1e-6 ).toConst();
		const direction = toReceiver.div( distance );

		const ix = int( cell.x ).toVar(), iy = int( cell.y ).toVar(), iz = int( cell.z ).toVar();
		const probeIndex = ix.add( iz.mul( nx ) ).add( iy.mul( nx ).mul( nz ) ).toVar();
		const momentsUV = octTileUV( probeIndex, direction, visibilityGridSize, momentsSize );
		const probeMoments = moments.sample( momentsUV ).xy.toVar();

		// Inactive probes are excluded before accumulating any weights.

		If( probeMoments.x.greaterThanEqual( 0.0 ), () => {

			const weight = probeInterpolationWeight( probeMoments, distance.div( distanceScale ), normalWorld, probePosition.sub( positionWorld ), offset, alpha ).toConst();

			const tile = vec2( float( probeIndex.mod( DISTANCE_COLUMNS ) ), float( probeIndex.div( DISTANCE_COLUMNS ) ) );
			const irradianceUV = tile.mul( IRRADIANCE_TILE ).add( normalOct ).div( irradianceSize );

			total.addAssign( sampleIrradiance( irradianceUV ).rgb.mul( weight ) );
			weights.addAssign( weight );

		} );

	} );

	// Normalize only the active probes. With no active neighbors, return black.

	const result = vec3( 0.0 ).toVar();

	If( weights.greaterThan( 0.0 ), () => {

		result.assign( total.div( weights ) );

	} );

	return result;

}


const gridInfluence = /*@__PURE__*/ Fn( ( [ position, probeMin, probeMax, influenceMin, influenceMax, hasInfluenceBox, falloff, intensity ] ) => {

	const inside = position.greaterThanEqual( influenceMin ).all().and( position.lessThanEqual( influenceMax ).all() );
	const outside = probeMin.sub( position ).max( 0.0 ).add( position.sub( probeMax ).max( 0.0 ) ).toConst();
	const fade = select( falloff.greaterThan( 0.0 ), outside.length().smoothstep( 0.0, falloff.max( 1e-6 ) ).oneMinus(), 1.0 );
	const influence = select( hasInfluenceBox.equal( 1 ), select( inside, 1.0, 0.0 ), fade );

	return select( intensity.greaterThan( 0.0 ), influence, 0.0 );

} ).setLayout( {
	name: 'lightProbeGridInfluence',
	type: 'float',
	inputs: [
		{ name: 'position', type: 'vec3' },
		{ name: 'probeMin', type: 'vec3' },
		{ name: 'probeMax', type: 'vec3' },
		{ name: 'influenceMin', type: 'vec3' },
		{ name: 'influenceMax', type: 'vec3' },
		{ name: 'hasInfluenceBox', type: 'int' },
		{ name: 'falloff', type: 'float' },
		{ name: 'intensity', type: 'float' }
	]
} );

/**
 * The light node that applies a {@link LightProbeGrid} to the scene. It samples
 * the baked L2 spherical-harmonic atlas at the surface position and adds the
 * resulting irradiance to the lighting context, so every standard node material
 * picks up the grid automatically (same role as the WebGL `lights_fragment_begin`
 * integration).
 *
 * @private
 * @augments AnalyticLightNode
 */
class LightProbeGridNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeGridNode';

	}

	constructor( light = null ) {

		super( light );

		// Refresh grid uniforms for every render.

		this._min = uniform( new Vector3() ).setGroup( renderGroup );
		this._max = uniform( new Vector3() ).setGroup( renderGroup );
		this._influenceMin = uniform( new Vector3() ).setGroup( renderGroup );
		this._influenceMax = uniform( new Vector3() ).setGroup( renderGroup );
		this._hasInfluenceBox = uniform( 0, 'int' ).setGroup( renderGroup );
		this._resolution = uniform( new Vector3() ).setGroup( renderGroup );
		this._intensity = uniform( 1 ).setGroup( renderGroup );
		this._falloff = uniform( 0 ).setGroup( renderGroup );
		this._distanceScale = uniform( 1 ).setGroup( renderGroup );
		this._normalBias = uniform( 0 ).setGroup( renderGroup );
		this._viewBias = uniform( 0 ).setGroup( renderGroup );
		this._visibility = uniform( 0, 'int' ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

	}

	update( /* frame */ ) {

		const light = this.light;

		this._min.value.copy( light.boundingBox.min );
		this._max.value.copy( light.boundingBox.max );
		this._influenceMin.value.copy( ( light.influenceBox || light.boundingBox ).min );
		this._influenceMax.value.copy( ( light.influenceBox || light.boundingBox ).max );
		this._hasInfluenceBox.value = light.influenceBox !== null ? 1 : 0;
		this._resolution.value.copy( light.resolution );
		this._intensity.value = light.intensity;
		this._falloff.value = light.falloff;
		this._distanceScale.value = light._distanceScale;
		this._normalBias.value = light.normalBias;
		this._viewBias.value = light.viewBias;
		this._visibility.value = light.visibility ? 1 : 0;

	}


	/**
	 * Returns spatial influence without intensity, for blending overlapping grids.
	 *
	 * @private
	 */
	getInfluenceWeight( builder ) {

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.influenceWeight === undefined ) {

			nodeData.influenceWeight = gridInfluence( positionWorld, this._min, this._max, this._influenceMin, this._influenceMax, this._hasInfluenceBox, this._falloff, this._intensity ).toVar();

		}

		return nodeData.influenceWeight;

	}

	setup( builder ) {

		const light = this.light;

		// No baked data yet: contribute nothing.

		if ( light.texture === null ) return;

		const min = this._min;
		const max = this._max;
		const res = this._resolution;

		const range = max.sub( min );
		const resMinusOne = res.sub( 1.0 );
		const spacing = range.div( resMinusOne );

		// Initialize atlases before creating texture bindings.

		builder.renderer.initRenderTarget( light._renderTarget );

		// Select visibility with a uniform to reuse the material.

		builder.renderer.initRenderTarget( light._distanceTarget );

		const distanceTarget = light._distanceTarget;
		const grid = {
			min,
			res,
			spacing,
			moments: texture( distanceTarget.texture ),
			visibilityGridSize: light.visibilityGridSize,
			distanceScale: this._distanceScale,
			normalBias: this._normalBias,
			viewBias: this._viewBias,
			momentsSize: vec2( distanceTarget.width, distanceTarget.height ),
			irradianceSize: vec2( light._irradianceTarget.width, light._irradianceTarget.height )
		};

		// Without visibility: offset along the normal by half a probe spacing, then
		// remap to texel centers for hardware trilinear filtering.

		const samplePos = positionWorld.add( normalWorld.mul( spacing ).mul( 0.5 ) );
		const uvw = samplePos.sub( min ).div( range ).clamp( 0.0, 1.0 ).mul( resMinusOne ).div( res ).add( vec3( 0.5 ).div( res ) );

		const atlas = texture3D( light.texture );
		builder.renderer.initRenderTarget( light._irradianceTarget );
		const irradianceAtlas = texture( light._irradianceTarget.texture );
		const sampleIrradiance = ( uv ) => irradianceAtlas.sample( uv );

		const lightsData = builder.getDataFromNode( builder.lightsNode );

		if ( lightsData.probeGridInfluenceSum === undefined ) {

			let totalInfluence = float( 0.0 );

			for ( const node of builder.lightsNode.getLightNodes( builder ) ) {

				if ( node.light && node.light.isLightProbeGrid && node.light.texture !== null ) {

					totalInfluence = totalInfluence.add( node.getInfluenceWeight( builder ) );

				}

			}

			// Share the normalization across grids, preserving outer boundary fades.

			lightsData.probeGridInfluenceSum = totalInfluence.max( 1.0 ).toVar();

		}

		const weight = this._intensity.mul( this.getInfluenceWeight( builder ) ).div( lightsData.probeGridInfluenceSum ).toVar();

		// Skip lookups when the grid contributes nothing.

		const result = vec3( 0.0 ).toVar();

		If( weight.greaterThan( 0.0 ), () => {

			If( this._visibility.equal( 1 ), () => {

				result.assign( evaluateGridIrradianceVisibility( grid, sampleIrradiance ) );

			} ).Else( () => {

				result.assign( getShIrradianceAt( normalWorld, sampleGridSH( atlas, uvw, res.z ) ).max( vec3( 0.0 ) ) );

			} );

		} );

		builder.context.irradiance.addAssign( result.mul( weight ) );

	}

}

export { LightProbeGridNode };
