import { BackSide, BufferAttribute, BufferGeometry, DoubleSide, FloatType, HalfFloatType, InstancedBufferAttribute, InstancedMesh, Mesh, NodeMaterial, NoBlending, OrthographicCamera, QuadMesh, RendererUtils, RenderTarget, Scene, Vector2 } from 'three/webgpu';
import { Fn, If, abs, attribute, dot, exp, float, ivec2, length, luminance, max, mrt, normalWorldGeometry, positionWorld, pow, round, screenCoordinate, sqrt, texture, uniform, vec2, vec3, vec4 } from 'three/tsl';

import { lightMapUV } from '../tsl/lighting/DirectionalLightMapNode.js';

// the surface buffer is rasterized with these jitters, so that it covers the texels that
// the first samples of the light mapper cover

const SURFACE_JITTERS = 16;

// weights of the 5x5 B3 spline kernel of the à-trous wavelet transform

const KERNEL = [ 1 / 16, 1 / 4, 3 / 8, 1 / 4, 1 / 16 ];

let _rendererState;

/**
 * Denoises the light map of a {@link LightMapper} with an edge-aware à-trous wavelet filter in
 * light map space, like SVGF. Each texel is guided by the world-space position and normal of its
 * surface and the chart it belongs to, so the filter does not blur across geometric edges or
 * chart boundaries, and the luminance of the texels is compared to their noise, so the filter
 * keeps shadows and other details that rise above the noise. The noise of each texel is estimated
 * from the variance of its samples if the light mapper has the `moments` option, else from
 * {@link LightMapDenoiser#relativeNoise}, e.g. the estimate of {@link LightMapper#estimateNoise}. Each
 * pass fits a plane to the weighted texels around a texel instead of averaging them, so gradients
 * stay unbiased where the neighborhood is one-sided, e.g. at chart borders and in contact shadows.
 *
 * The filter removes the fine grain of the noise, so a denoised light map can be baked to a higher
 * noise tolerance. The noise that is correlated between texels, e.g. from directions shared by
 * all texels of a sample, is blotchy and stays.
 *
 * ```js
 * const lightMapper = new LightMapper( renderer, size, irradiance, { moments: true } );
 * const denoiser = new LightMapDenoiser( renderer, lightMapper );
 *
 * lightMapper.update( samples );
 * denoiser.update();
 *
 * material.lightMap = denoiser.texture;
 * ```
 *
 * The light maps of multi-page atlases are denoised per page, with one denoiser per page.
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { LightMapDenoiser } from 'three/addons/lighting/LightMapDenoiser.js';
 */
class LightMapDenoiser {

	/**
	 * Constructs a new light map denoiser.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {LightMapper} lightMapper - The light mapper to denoise. Add its meshes before the first update.
	 * @param {Object} [options] - The filter options.
	 * @param {number} [options.iterations=4] - The number of à-trous passes, the filter spans `4 * 2^iterations - 3` texels.
	 * @param {number} [options.luminancePhi=3] - How many standard deviations of the noise luminance differences may span before texels stop being averaged.
	 * @param {number} [options.normalPhi=64] - The exponent of the normal similarity weight.
	 * @param {number} [options.planePhi=0.2] - The sine of the angle to the tangent plane at which neighbors lose most of their weight.
	 * @param {number} [options.page=0] - The page of the light mapper to denoise, see {@link LightMapper#pages}.
	 */
	constructor( renderer, lightMapper, { iterations = 4, luminancePhi = 3, normalPhi = 64, planePhi = 0.2, page = 0 } = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The light mapper to denoise.
		 *
		 * @type {LightMapper}
		 */
		this.lightMapper = lightMapper;

		/**
		 * The page of the light mapper to denoise.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.page = page;

		/**
		 * The number of à-trous passes.
		 *
		 * @type {number}
		 * @default 4
		 */
		this.iterations = iterations;

		/**
		 * How many standard deviations of the noise luminance differences may span before
		 * texels stop being averaged. Higher values remove more noise and blur more detail.
		 *
		 * @type {UniformNode<float>}
		 */
		this.luminancePhi = uniform( luminancePhi );

		/**
		 * The exponent of the normal similarity weight.
		 *
		 * @type {UniformNode<float>}
		 */
		this.normalPhi = uniform( normalPhi );

		/**
		 * The sine of the angle to the tangent plane at which neighbors lose most of their weight.
		 *
		 * @type {UniformNode<float>}
		 */
		this.planePhi = uniform( planePhi );

		/**
		 * The relative noise of the light map, e.g. from {@link LightMapper#estimateNoise}. It is only
		 * used if the light mapper has no {@link LightMapper#momentTexture}.
		 *
		 * @type {UniformNode<float>}
		 */
		this.relativeNoise = uniform( 0.05 );

		const size = lightMapper.size;

		// world-space position with the chart index + 1 in alpha (0 without surface), and normal

		this._surface = new RenderTarget( size, size, { type: FloatType, depthBuffer: false, count: 2 } );
		this._surface.textures[ 0 ].name = 'position';
		this._surface.textures[ 1 ].name = 'normal';
		this._surface.textures[ 1 ].type = HalfFloatType;
		this._surfaceNeedsUpdate = true;

		// the filter passes ping-pong between these, they store the irradiance and the standard
		// deviation of its noise in alpha, or -1 in alpha for texels without samples

		this._targets = [ 0, 1 ].map( () => new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false } ) );

		this._renderTarget = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false } );
		this._renderTarget.texture.channel = 1;

		/**
		 * The denoised light map, with the conventions of {@link LightMapper#texture}.
		 *
		 * @type {Texture}
		 */
		this.texture = this._renderTarget.texture;

		this._scene = new Scene();
		this._camera = new OrthographicCamera();
		this._jitter = uniform( new Vector2() );
		this._step = uniform( 1, 'int' );
		this._input = texture( this._targets[ 0 ].texture );

		this._frontMaterial = this._createSurfaceMaterial( false );
		this._backMaterial = this._createSurfaceMaterial( true );

		this._prepareQuad = new QuadMesh( this._createPrepareMaterial() );
		this._filterQuad = new QuadMesh( this._createFilterMaterial() );
		this._resolveQuad = new QuadMesh( this._createResolveMaterial() );

	}

	/**
	 * Denoises the samples that the light mapper has accumulated so far into {@link LightMapDenoiser#texture}.
	 */
	update() {

		const renderer = this.renderer;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		if ( this._surfaceNeedsUpdate ) this._renderSurface();

		renderer.setRenderTarget( this._targets[ 0 ] );
		this._prepareQuad.render( renderer );

		for ( let i = 0; i < this.iterations; i ++ ) {

			this._input.value = this._targets[ i % 2 ].texture;
			this._step.value = 1 << i;

			renderer.setRenderTarget( this._targets[ ( i + 1 ) % 2 ] );
			this._filterQuad.render( renderer );

		}

		this._input.value = this._targets[ this.iterations % 2 ].texture;

		renderer.setRenderTarget( this._renderTarget );
		this._resolveQuad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._surface.dispose();
		this._renderTarget.dispose();
		for ( const target of this._targets ) target.dispose();

		this._frontMaterial.dispose();
		this._backMaterial.dispose();
		this._prepareQuad.material.dispose();
		this._filterQuad.material.dispose();
		this._resolveQuad.material.dispose();

		// the proxies share the attributes of the meshes, only their chart attributes are freed. The
		// materials go first, with them the render objects that would free all attributes they used

		for ( const proxy of this._scene.children ) {

			const geometry = proxy.geometry;

			for ( const name of Object.keys( geometry.attributes ) ) {

				if ( name !== 'lightMapChart' && name !== 'lightMapChartOffset' ) geometry.deleteAttribute( name );

			}

			geometry.setIndex( null );
			geometry.dispose();

		}

	}

	/**
	 * Rasterizes the world-space positions, normals and chart indices of the meshes into the surface buffer.
	 *
	 * @private
	 */
	_renderSurface() {

		const renderer = this.renderer;
		const size = this.lightMapper.size;

		// a chart is a set of triangles that are connected in light map space, each instance of an
		// instanced mesh has its own charts in its atlas region

		let charts = 0;

		for ( const object of this.lightMapper.pages[ this.page ].objects ) {

			const source = object.geometry;
			const geometry = new BufferGeometry();

			for ( const name of [ 'position', 'normal', 'uv1', 'instanceLightMapScale', 'instanceLightMapOffset' ] ) {

				if ( source.attributes[ name ] !== undefined ) geometry.setAttribute( name, source.attributes[ name ] );

			}

			geometry.setIndex( source.index );
			geometry.setDrawRange( source.drawRange.start, source.drawRange.count );
			for ( const group of source.groups ) geometry.addGroup( group.start, group.count, group.materialIndex );

			const chart = computeCharts( source );
			for ( let i = 0; i < chart.array.length; i ++ ) chart.array[ i ] += charts;
			charts += chart.count;
			geometry.setAttribute( 'lightMapChart', new BufferAttribute( chart.array, 1 ) );

			if ( object.isInstancedMesh ) {

				const offsets = new Float32Array( object.count );
				for ( let i = 0; i < object.count; i ++ ) offsets[ i ] = i * chart.count;
				charts += chart.count * ( object.count - 1 );
				geometry.setAttribute( 'lightMapChartOffset', new InstancedBufferAttribute( offsets, 1 ) );

			}

			const surfaceMaterial = ( material ) => material.side === BackSide ? this._backMaterial : this._frontMaterial;
			const material = Array.isArray( object.material ) ? object.material.map( surfaceMaterial ) : surfaceMaterial( object.material );

			const proxy = object.isInstancedMesh ? new InstancedMesh( geometry, material, object.count ) : new Mesh( geometry, material );
			if ( object.isInstancedMesh ) proxy.instanceMatrix = object.instanceMatrix;
			proxy.matrixAutoUpdate = false;
			proxy.frustumCulled = false;
			object.updateWorldMatrix( true, false );
			proxy.matrix.copy( object.matrixWorld );

			this._scene.add( proxy );

		}

		renderer.autoClear = false;
		renderer.setClearColor( 0x000000, 0 );
		renderer.setRenderTarget( this._surface );
		renderer.clear();

		// the jittered rasterizations cover the texels of the chart borders, the last one writes the texel centers

		for ( let i = SURFACE_JITTERS; i >= 0; i -- ) {

			if ( i > 0 ) this._jitter.value.set( halton( i, 2 ) - 0.5, halton( i, 3 ) - 0.5 ).multiplyScalar( 2 / size );
			else this._jitter.value.set( 0, 0 );

			renderer.render( this._scene, this._camera );

		}

		this._surfaceNeedsUpdate = false;

	}

	/**
	 * Creates the material that rasterizes the surface buffer in light map space.
	 *
	 * @private
	 * @param {boolean} flipNormal - Whether to flip the normal, for back-sided meshes.
	 * @return {NodeMaterial} The material.
	 */
	_createSurfaceMaterial( flipNormal ) {

		const material = new NodeMaterial();
		material.side = DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;
		material.blending = NoBlending;

		material.vertexNode = vec4( lightMapUV().flipY().mul( 2 ).sub( 1 ).add( this._jitter ), 0, 1 );

		const normal = flipNormal ? normalWorldGeometry.negate() : normalWorldGeometry;
		const chartOffset = Fn( ( builder ) => builder.geometry.hasAttribute( 'lightMapChartOffset' ) ? attribute( 'lightMapChartOffset', 'float' ) : float( 0 ), 'float' )();
		const chart = round( attribute( 'lightMapChart', 'float' ).add( chartOffset ) ).add( 1 );

		material.fragmentNode = mrt( { position: vec4( positionWorld, chart ), normal: vec4( normal.normalize(), 1 ) } );

		return material;

	}

	/**
	 * Creates the material that normalizes the samples and estimates the noise of each texel.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createPrepareMaterial() {

		const lightMapper = this.lightMapper;
		const page = lightMapper.pages[ this.page ];
		const samples = texture( page.sampleTexture );
		const moments = page.momentTexture !== null ? texture( page.momentTexture ) : null;

		const prepare = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const sum = samples.load( coord );
			const count = sum.a;
			const mean = sum.rgb.div( count.max( 1 ) );

			// the standard deviation of the mean from the variance of the samples

			let deviation = luminance( mean ).mul( this.relativeNoise );

			if ( moments !== null ) {

				const variance = moments.load( coord )[ lightMapper.momentChannel ].div( count.max( 1 ) ).sub( luminance( mean ).pow2() ).max( 0 );
				deviation = sqrt( variance.div( count.sub( 1 ).max( 1 ) ) );

			}

			return count.greaterThan( 0 ).select( vec4( mean, deviation ), vec4( 0, 0, 0, - 1 ) );

		} );

		const material = new NodeMaterial();
		material.fragmentNode = prepare();

		return material;

	}

	/**
	 * Creates the material of an à-trous pass, which filters `_input` with holes of `_step` texels.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createFilterMaterial() {

		const size = this.lightMapper.size;
		const input = this._input;
		const step = this._step;
		const positions = texture( this._surface.textures[ 0 ] );
		const normals = texture( this._surface.textures[ 1 ] );
		const luminancePhi = this.luminancePhi;
		const normalPhi = this.normalPhi;
		const planePhi = this.planePhi;

		const filter = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = input.load( coord ).toVar();
			const surface = positions.load( coord ).toVar();
			const result = center.toVar();

			If( surface.w.greaterThan( 0 ).and( center.a.greaterThanEqual( 0 ) ), () => {

				const normal = normals.load( coord ).xyz.toVar();
				const centerLuminance = luminance( center.rgb ).toVar();

				// a tap counts if it has samples and lies on the same chart

				const tap = ( offset, callback ) => {

					const q = coord.add( offset );

					If( q.x.greaterThanEqual( 0 ).and( q.y.greaterThanEqual( 0 ) ).and( q.x.lessThan( size ) ).and( q.y.lessThan( size ) ), () => {

						const other = positions.load( q );
						const value = input.load( q );

						If( other.w.equal( surface.w ).and( value.a.greaterThanEqual( 0 ) ), () => {

							callback( q, other, value );

						} );

					} );

				};

				// the noise of the center, blurred over 3x3 texels like in SVGF so that a single
				// lucky sample does not stop the filter

				const variance = vec2( 0 ).toVar();

				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						const weight = [ 0.25, 0.5, 0.25 ][ x + 1 ] * [ 0.25, 0.5, 0.25 ][ y + 1 ];

						tap( ivec2( x, y ), ( q, other, value ) => {

							variance.addAssign( vec2( value.a.pow2().mul( weight ), weight ) );

						} );

					}

				}

				const deviation = sqrt( variance.x.div( variance.y ) );
				const luminanceScale = float( 1 ).div( luminancePhi.mul( deviation ).add( 1e-6 ) ).toVar();

				// a weighted linear fit over the taps, in units of the step, reproduces gradients, so the
				// one-sided neighborhoods at chart borders and next to shadows are not biased

				const moments = vec3( 0 ).toVar(); // sums of w, w x, w y
				const spread = vec3( 0 ).toVar(); // sums of w x x, w x y, w y y
				const sum = vec3( 0 ).toVar();
				const sumX = vec3( 0 ).toVar();
				const sumY = vec3( 0 ).toVar();
				const noise = vec3( 0 ).toVar(); // sums of w w s s, times 1, x, y
				const noiseSpread = vec3( 0 ).toVar(); // times x x, x y, y y

				for ( let y = - 2; y <= 2; y ++ ) {

					for ( let x = - 2; x <= 2; x ++ ) {

						tap( ivec2( x, y ).mul( step ), ( q, other, value ) => {

							const offset = other.xyz.sub( surface.xyz );
							const plane = abs( dot( normal, offset ) ).div( length( offset ).add( 1e-9 ) );
							const similarity = pow( max( dot( normal, normals.load( q ).xyz ), 0 ), normalPhi );
							const difference = abs( luminance( value.rgb ).sub( centerLuminance ) ).mul( luminanceScale );
							const weight = similarity.mul( exp( plane.div( planePhi ).add( difference ).negate() ) ).mul( KERNEL[ x + 2 ] * KERNEL[ y + 2 ] ).toVar();
							const deviation2 = weight.pow2().mul( value.a.pow2() );

							moments.addAssign( vec3( weight, weight.mul( x ), weight.mul( y ) ) );
							spread.addAssign( vec3( weight.mul( x * x ), weight.mul( x * y ), weight.mul( y * y ) ) );
							sum.addAssign( value.rgb.mul( weight ) );
							sumX.addAssign( value.rgb.mul( weight.mul( x ) ) );
							sumY.addAssign( value.rgb.mul( weight.mul( y ) ) );
							noise.addAssign( vec3( deviation2, deviation2.mul( x ), deviation2.mul( y ) ) );
							noiseSpread.addAssign( vec3( deviation2.mul( x * x ), deviation2.mul( x * y ), deviation2.mul( y * y ) ) );

						} );

					}

				}

				// the first row of the inverse of the regularized normal matrix

				const ridge = moments.x.mul( 0.1 );
				const a = moments.x, b = moments.y, c = moments.z;
				const d = spread.x.add( ridge ), e = spread.y, f = spread.z.add( ridge );
				const row = vec3( d.mul( f ).sub( e.pow2() ), c.mul( e ).sub( b.mul( f ) ), b.mul( e ).sub( c.mul( d ) ) ).toVar();
				const determinant = a.mul( row.x ).add( b.mul( row.y ) ).add( c.mul( row.z ) );
				row.assign( row.div( determinant ) );

				const fit = sum.mul( row.x ).add( sumX.mul( row.y ) ).add( sumY.mul( row.z ) ).max( 0 );
				const fitNoise = row.x.pow2().mul( noise.x ).add( row.y.pow2().mul( noiseSpread.x ) ).add( row.z.pow2().mul( noiseSpread.z ) )
					.add( row.x.mul( row.y ).mul( noise.y ).mul( 2 ) ).add( row.x.mul( row.z ).mul( noise.z ).mul( 2 ) ).add( row.y.mul( row.z ).mul( noiseSpread.y ).mul( 2 ) );

				result.assign( vec4( fit, sqrt( fitNoise.max( 0 ) ) ) );

			} );

			return result;

		} );

		const material = new NodeMaterial();
		material.fragmentNode = filter();

		return material;

	}

	/**
	 * Creates the material that writes the denoised light map and fills the chart padding like
	 * {@link LightMapper} does.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createResolveMaterial() {

		const size = this.lightMapper.size;
		const input = this._input;
		const maxCoord = ivec2( size - 1 );

		const resolve = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = input.load( coord ).toVar();
			const result = vec4( center.rgb, 1 ).toVar();

			If( center.a.lessThan( 0 ), () => {

				const sum = vec4( 0 ).toVar();

				for ( let y = - 2; y <= 2; y ++ ) {

					for ( let x = - 2; x <= 2; x ++ ) {

						const value = input.load( coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxCoord ) );

						If( value.a.greaterThanEqual( 0 ), () => {

							sum.addAssign( vec4( value.rgb, 1 ) );

						} );

					}

				}

				result.assign( vec4( sum.rgb.div( sum.a.max( 1e-4 ) ), 1 ) );

			} );

			return result;

		} );

		const material = new NodeMaterial();
		material.fragmentNode = resolve();

		return material;

	}

}

/**
 * Finds the charts of a geometry: the sets of triangles that share light map vertices.
 *
 * @private
 * @param {BufferGeometry} geometry - A geometry with `uv1`.
 * @return {{array: Float32Array, count: number}} The chart index of each vertex and the number of charts.
 */
function computeCharts( geometry ) {

	const uv = geometry.getAttribute( 'uv1' );
	const index = geometry.getIndex();
	const parent = new Int32Array( uv.count );

	for ( let i = 0; i < parent.length; i ++ ) parent[ i ] = i;

	const find = ( i ) => {

		while ( parent[ i ] !== i ) i = parent[ i ] = parent[ parent[ i ] ];
		return i;

	};

	const union = ( a, b ) => {

		a = find( a );
		b = find( b );
		if ( a !== b ) parent[ Math.max( a, b ) ] = Math.min( a, b );

	};

	// vertices at the same light map position, and the vertices of each triangle

	const vertices = new Map();

	for ( let i = 0; i < uv.count; i ++ ) {

		const key = `${ uv.getX( i ) },${ uv.getY( i ) }`;
		const other = vertices.get( key );

		if ( other === undefined ) vertices.set( key, i );
		else union( i, other );

	}

	const count = index !== null ? index.count : uv.count;
	const vertex = ( i ) => index !== null ? index.getX( i ) : i;

	for ( let i = 0; i + 2 < count; i += 3 ) {

		union( vertex( i ), vertex( i + 1 ) );
		union( vertex( i ), vertex( i + 2 ) );

	}

	const array = new Float32Array( uv.count );
	const ids = new Map();

	for ( let i = 0; i < array.length; i ++ ) {

		const root = find( i );
		if ( ids.has( root ) === false ) ids.set( root, ids.size );
		array[ i ] = ids.get( root );

	}

	return { array, count: ids.size };

}

function halton( index, base ) {

	let result = 0;
	let f = 1;

	while ( index > 0 ) {

		f /= base;
		result += f * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}

export { LightMapDenoiser };
