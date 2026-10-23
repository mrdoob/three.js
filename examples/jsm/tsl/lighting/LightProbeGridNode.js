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
	for ( let t = 0; t < 7; t ++ ) s.push( atlas.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( t ) ).div( atlasDepth ) ) ).level( 0 ) );

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
const probeInterpolationWeight = /*@__PURE__*/ Fn( ( [ moments, distance, normal, toProbe ] ) => {

	const visibility = chebyshevVisibility( moments, distance );
	const direction = toProbe.div( toProbe.length().max( 1e-6 ) ).toConst();
	const wrap = normal.dot( direction ).mul( 0.5 ).add( 0.5 ).pow( 2.0 ).add( 0.2 );
	const weight = wrap.mul( visibility.max( 0.05 ) ).max( 1e-6 ).toVar();

	If( weight.lessThan( 0.2 ), () => {

		weight.mulAssign( weight.mul( weight ).div( 0.04 ) );

	} );

	return weight;

} ).setLayout( {
	name: 'lightProbeInterpolationWeight',
	type: 'float',
	inputs: [
		{ name: 'moments', type: 'vec2' },
		{ name: 'distance', type: 'float' },
		{ name: 'normal', type: 'vec3' },
		{ name: 'toProbe', type: 'vec3' }
	]
} );

/**
 * Blends four probes with tetrahedral, wrapped-normal and Chebyshev visibility weights.
 *
 * @private
 * @see {@link https://github.com/NVIDIAGameWorks/RTXGI-DDGI/blob/main/rtxgi-sdk/shaders/ddgi/Irradiance.hlsl}
 * @see {@link https://diglib.eg.org/items/1059265a-b11c-41ce-b1f0-4953c34a5105}
 */
function evaluateGridIrradianceVisibility( grid, irradianceAtlas, position = positionWorld, normal = normalWorld ) {

	const { min, res, spacing, moments, distanceScale, normalBias, viewBias, momentsSize, irradianceSize, visibilityGridSize } = grid;

	const nx = int( res.x ), nz = int( res.z );

	const clearance = spacing.x.min( spacing.y ).min( spacing.z );
	const viewDirection = cameraPosition.sub( position ).normalize();
	const biased = position.add( normal.mul( clearance.mul( normalBias ) ) ).add( viewDirection.mul( clearance.mul( viewBias ) ) ).toVar();

	const gridPosition = biased.sub( min ).div( spacing ).clamp( vec3( 0.0 ), res.sub( 1.0 ) ).toVar();
	const base = gridPosition.floor().min( res.sub( 2.0 ) ).max( 0.0 ).toVar();
	const alpha = gridPosition.sub( base ).clamp( 0.0, 1.0 ).toVar();

	const total = vec3( 0.0 ).toVar();
	const weights = float( 0.0 ).toVar();

	// Every probe is sampled in the direction of the normal.
	const normalOct = octEncode( normal ).mul( IRRADIANCE_RESOLUTION ).add( 1.0 ).toVar();

	// Split each cell into six tetrahedra along its minimum-to-maximum diagonal.
	// Resolve ties with opposite priorities to keep max/min axes distinct.
	const maxAxis = select( alpha.x.greaterThanEqual( alpha.y ).and( alpha.x.greaterThanEqual( alpha.z ) ), int( 0 ), select( alpha.y.greaterThanEqual( alpha.z ), int( 1 ), int( 2 ) ) ).toConst();
	const minAxis = select( alpha.z.lessThanEqual( alpha.x ).and( alpha.z.lessThanEqual( alpha.y ) ), int( 2 ), select( alpha.y.lessThanEqual( alpha.x ), int( 1 ), int( 0 ) ) ).toConst();
	const maxCorner = vec3( select( maxAxis.equal( 0 ), 1.0, 0.0 ), select( maxAxis.equal( 1 ), 1.0, 0.0 ), select( maxAxis.equal( 2 ), 1.0, 0.0 ) ).toConst();
	const minCorner = vec3( select( minAxis.equal( 0 ), 1.0, 0.0 ), select( minAxis.equal( 1 ), 1.0, 0.0 ), select( minAxis.equal( 2 ), 1.0, 0.0 ) ).toConst();
	const alphaMax = alpha.x.max( alpha.y ).max( alpha.z ).toConst();
	const alphaMin = alpha.x.min( alpha.y ).min( alpha.z ).toConst();
	const alphaMid = alpha.x.add( alpha.y ).add( alpha.z ).sub( alphaMax ).sub( alphaMin ).toConst();

	Loop( 4, ( { i: corner } ) => {

		const offset = select( corner.equal( 0 ), vec3( 0.0 ), select( corner.equal( 1 ), maxCorner, select( corner.equal( 2 ), minCorner.oneMinus(), vec3( 1.0 ) ) ) ).toVar();

		// Keep zero barycentric weights at shared faces to preserve continuity.

		const tetraWeight = select( corner.equal( 0 ), alphaMax.oneMinus(), select( corner.equal( 1 ), alphaMax.sub( alphaMid ), select( corner.equal( 2 ), alphaMid.sub( alphaMin ), alphaMin ) ) ).max( 0.0 ).toConst();
		const cell = base.add( offset ).toVar();
		const probePosition = min.add( cell.mul( spacing ) ).toVar();

		// Chebyshev visibility from the probe's distance moments toward the receiver.

		const toReceiver = biased.sub( probePosition ).toConst();
		const distance = toReceiver.length().max( 1e-6 ).toConst();

		// Octahedral mapping is homogeneous; retain the distance only for visibility.

		const direction = toReceiver;

		const ix = int( cell.x ).toVar(), iy = int( cell.y ).toVar(), iz = int( cell.z ).toVar();
		const probeIndex = ix.add( iz.mul( nx ) ).add( iy.mul( nx ).mul( nz ) ).toVar();
		const momentsUV = octTileUV( probeIndex, direction, visibilityGridSize, momentsSize );
		const probeMoments = moments.sample( momentsUV ).level( 0 ).setUpdateMatrix( false ).xy.toVar();

		// Inactive probes are excluded before accumulating any weights.

		If( probeMoments.x.greaterThanEqual( 0.0 ), () => {

			const weight = probeInterpolationWeight( probeMoments, distance.div( distanceScale ), normal, probePosition.sub( position ) ).mul( tetraWeight ).toConst();

			const tile = vec2( float( probeIndex.mod( DISTANCE_COLUMNS ) ), float( probeIndex.div( DISTANCE_COLUMNS ) ) );
			const irradianceUV = tile.mul( IRRADIANCE_TILE ).add( normalOct ).div( irradianceSize );

			total.addAssign( irradianceAtlas.sample( irradianceUV ).level( 0 ).setUpdateMatrix( false ).rgb.mul( weight ) );
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


/**
 * Shares atlas bindings and irradiance evaluation between live lighting and light-map baking.
 * Intensity and spatial influence are applied by the caller.
 *
 * @private
 */
function sampleGridIrradiance( light, grid, position, normal, builder ) {

	const { min, max, res } = grid;
	const range = max.sub( min );
	const resMinusOne = res.sub( 1.0 );
	const spacing = range.div( resMinusOne );

	if ( light.visibility ) {

		const distanceTarget = light._distanceTarget;
		const irradianceTarget = light._irradianceTarget;
		builder.renderer.initRenderTarget( distanceTarget );
		builder.renderer.initRenderTarget( irradianceTarget );

		return evaluateGridIrradianceVisibility( {
			...grid,
			spacing,
			moments: texture( distanceTarget.texture ),
			visibilityGridSize: light.visibilityGridSize,
			momentsSize: vec2( distanceTarget.width, distanceTarget.height ),
			irradianceSize: vec2( irradianceTarget.width, irradianceTarget.height )
		}, texture( irradianceTarget.texture ), position, normal );

	}

	// Offset along the normal by half a probe spacing, then remap to texel centers.

	const samplePos = position.add( normal.mul( spacing ).mul( 0.5 ) );
	const uvw = samplePos.sub( min ).div( range ).clamp( 0.0, 1.0 ).mul( resMinusOne ).div( res ).add( vec3( 0.5 ).div( res ) );

	builder.renderer.initRenderTarget( light._renderTarget );

	return getShIrradianceAt( normal, sampleGridSH( texture3D( light.texture ), uvw, res.z ) ).max( vec3( 0.0 ) );

}

/**
 * Applies the same influence boundary to SH and visibility-aware sampling.
 *
 * @private
 */
function getGridIrradiance( light, grid, position, normal, builder ) {

	return Fn( () => {

		const { min, max, influenceMin, influenceMax, hasInfluenceBox, falloff } = grid;
		const result = vec3( 0.0 ).toVar();
		const inside = position.greaterThanEqual( influenceMin ).all().and( position.lessThanEqual( influenceMax ).all() );

		If( hasInfluenceBox.equal( 0 ).or( inside ), () => {

			result.assign( sampleGridIrradiance( light, grid, position, normal, builder ) );

			// Explicit influence bounds replace the fade outside the probe bounds.

			if ( light.falloff > 0 ) {

				If( hasInfluenceBox.equal( 0 ), () => {

					const outside = min.sub( position ).max( 0.0 ).add( position.sub( max ).max( 0.0 ) );
					result.mulAssign( outside.length().smoothstep( 0.0, falloff ).oneMinus() );

				} );

			}

		} );

		return result;

	} )();

}

/**
 * Returns the irradiance of a baked {@link LightProbeGrid} at the given world-space
 * position and normal. Use this to evaluate the grid outside of the lighting context,
 * e.g. when baking light maps with {@link LightMapper}.
 *
 * @param {LightProbeGrid} light - The baked light probe grid.
 * @param {Node<vec3>} position - The world-space position.
 * @param {Node<vec3>} normal - The world-space normal.
 * @return {Node<vec3>} The irradiance.
 */
export function lightProbeGridIrradiance( light, position, normal ) {

	const box = light.boundingBox;
	const influence = light.influenceBox || box;

	return Fn( ( inputs, builder ) => {

		const min = uniform( box.min ), max = uniform( box.max );
		const grid = {
			min,
			max,
			influenceMin: uniform( influence.min ),
			influenceMax: uniform( influence.max ),
			hasInfluenceBox: uniform( light.influenceBox !== null ? 1 : 0, 'int' ),
			falloff: uniform( light.falloff ),
			res: uniform( light.resolution ),
			distanceScale: uniform( light._distanceScale ),
			normalBias: uniform( light.normalBias ),
			// Light maps must be independent of the camera used to bake them.
			viewBias: float( 0 )
		};

		return getGridIrradiance( light, grid, position, normal, builder ).mul( uniform( light.intensity ) );

	} )();

}

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

	}


	setup( builder ) {

		const light = this.light;

		// No baked data yet: contribute nothing.

		if ( light.texture === null ) return;

		// Skip lookups when the grid contributes nothing.

		const result = vec3( 0.0 ).toVar();

		If( this._intensity.greaterThan( 0.0 ), () => {

			const grid = {
				min: this._min,
				max: this._max,
				influenceMin: this._influenceMin,
				influenceMax: this._influenceMax,
				hasInfluenceBox: this._hasInfluenceBox,
				falloff: this._falloff,
				res: this._resolution,
				distanceScale: this._distanceScale,
				normalBias: this._normalBias,
				viewBias: this._viewBias
			};

			result.assign( getGridIrradiance( light, grid, positionWorld, normalWorld, builder ) );

		} );

		builder.context.irradiance.addAssign( result.mul( this._intensity ) );

	}

}

export { LightProbeGridNode };
