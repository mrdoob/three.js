import { HalfFloatType, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, Vector2 } from 'three/webgpu';
import { Fn, If, Loop, abs, dot, exp, float, ivec2, length, luminance, max, pow, screenCoordinate, sqrt, texture, uniform, vec2, vec3, vec4 } from 'three/tsl';

let _rendererState;

/**
 * Denoises an image with an edge-aware à-trous wavelet filter, like SVGF, e.g. the light map of a
 * {@link LightMapper} or a path traced frame. The filter is guided by the world-space position and normal
 * of the surface of each texel and an id of the surface, e.g. the light map chart that it belongs to, so it
 * does not blur across geometric edges or chart boundaries, and the luminance of the texels is compared to
 * their noise, so it keeps shadows and other details that rise above the noise. The noise of each texel is
 * estimated from its variance, else from {@link LightMapDenoiser#relativeNoise}. Each pass fits a plane to
 * the weighted texels around a texel instead of averaging them, so gradients stay unbiased where the
 * neighborhood is one-sided, e.g. at chart borders and in contact shadows.
 *
 * The inputs are textures of the same size:
 *
 * - `colorTexture`: the noisy color.
 * - `positionTexture`: the world-space position of the surface of each texel, with the id of the surface
 * in alpha, or 0 for texels without a surface, which are not filtered.
 * - `normalTexture`: the world-space normal of the surface of each texel.
 * - `varianceTexture`: optional, the variance of the luminance of each texel in red, e.g. the variance of
 * the mean of its samples. Texels with a negative variance have no data, they are filled with the mean
 * of the denoised texels around them, like the padding of a light map.
 *
 * The filter removes the fine grain of independent noise, e.g. of the rays of each texel, so a denoised
 * image needs fewer samples. Call `update()` once the samples have accumulated. With variance, the noise
 * estimate needs at least two samples.
 *
 * ```js
 * const lightMapper = new LightMapper( renderer, size, irradiance, { variance: true, guides: true } );
 * lightMapper.addObjects( meshes );
 * lightMapper.update( samples );
 *
 * const denoiser = new LightMapDenoiser( renderer, {
 * 	colorTexture: lightMapper.texture,
 * 	varianceTexture: lightMapper.varianceTexture,
 * 	positionTexture: lightMapper.positionTexture,
 * 	normalTexture: lightMapper.normalTexture
 * } );
 * denoiser.update();
 *
 * material.lightMap = denoiser.texture;
 * ```
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { LightMapDenoiser } from 'three/addons/lighting/LightMapDenoiser.js';
 */
class LightMapDenoiser {

	/**
	 * Constructs a new denoiser.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {Object} parameters - The input textures and filter options.
	 * @param {Texture} parameters.colorTexture - The noisy color.
	 * @param {Texture} parameters.positionTexture - The world-space position of each texel, with the id of its surface in alpha, 0 without a surface.
	 * @param {Texture} parameters.normalTexture - The world-space normal of each texel.
	 * @param {?Texture} [parameters.varianceTexture=null] - The variance of the luminance of each texel in red, negative without data.
	 * @param {number} [parameters.iterations=4] - The number of à-trous passes, the filter spans `4 * 2^iterations - 3` texels.
	 * @param {number} [parameters.luminancePhi=3] - How many standard deviations of the noise luminance differences may span before texels stop being averaged.
	 * @param {number} [parameters.normalPhi=64] - The exponent of the normal similarity weight.
	 * @param {number} [parameters.planePhi=0.2] - The sine of the angle to the tangent plane at which neighbors lose most of their weight.
	 */
	constructor( renderer, { colorTexture, positionTexture, normalTexture, varianceTexture = null, iterations = 4, luminancePhi = 3, normalPhi = 64, planePhi = 0.2 } ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The noisy color.
		 *
		 * @type {Texture}
		 * @readonly
		 */
		this.colorTexture = colorTexture;

		/**
		 * The world-space position of each texel, with the id of its surface in alpha.
		 *
		 * @type {Texture}
		 * @readonly
		 */
		this.positionTexture = positionTexture;

		/**
		 * The world-space normal of each texel.
		 *
		 * @type {Texture}
		 * @readonly
		 */
		this.normalTexture = normalTexture;

		/**
		 * The variance of the luminance of each texel, or `null`.
		 *
		 * @type {?Texture}
		 * @readonly
		 */
		this.varianceTexture = varianceTexture;

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
		 * The relative noise of the image, the standard deviation of the texels over their luminance.
		 * It is only used without a variance texture.
		 *
		 * @type {UniformNode<float>}
		 */
		this.relativeNoise = uniform( 0.05 );

		// the filter passes ping-pong between these, they store the color and the standard
		// deviation of its noise in alpha, or -1 in alpha for texels without data

		this._targets = [ 0, 1 ].map( () => new RenderTarget( 1, 1, { type: HalfFloatType, depthBuffer: false } ) );

		this._renderTarget = new RenderTarget( 1, 1, { type: HalfFloatType, depthBuffer: false } );
		this._renderTarget.texture.channel = colorTexture.channel;

		/**
		 * The denoised image, with the size and UV channel of the color texture.
		 *
		 * @type {Texture}
		 */
		this.texture = this._renderTarget.texture;

		this._size = uniform( new Vector2() );
		this._step = uniform( 1, 'int' );
		this._input = texture( this._targets[ 0 ].texture );

		this._prepareQuad = new QuadMesh( this._createPrepareMaterial() );
		this._filterQuad = new QuadMesh( this._createFilterMaterial() );
		this._resolveQuad = new QuadMesh( this._createResolveMaterial() );

	}

	/**
	 * Denoises the color texture into {@link LightMapDenoiser#texture}.
	 */
	update() {

		const renderer = this.renderer;
		const { width, height } = this.colorTexture.image;

		if ( width !== this._renderTarget.width || height !== this._renderTarget.height ) {

			for ( const target of this._targets ) target.setSize( width, height );
			this._renderTarget.setSize( width, height );
			this._size.value.set( width, height );

		}

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

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

		this._renderTarget.dispose();
		for ( const target of this._targets ) target.dispose();

		this._prepareQuad.material.dispose();
		this._filterQuad.material.dispose();
		this._resolveQuad.material.dispose();

	}

	/**
	 * Creates the material that estimates the noise of each texel.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createPrepareMaterial() {

		const color = texture( this.colorTexture );
		const variance = this.varianceTexture !== null ? texture( this.varianceTexture ) : null;

		const prepare = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const value = color.load( coord ).rgb;

			if ( variance === null ) return vec4( value, luminance( value ).mul( this.relativeNoise ) );

			// the standard deviation, -1 marks texels without data

			const texelVariance = variance.load( coord ).r;

			return vec4( value, texelVariance.lessThan( 0 ).select( - 1, sqrt( texelVariance.max( 0 ) ) ) );

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

		const size = ivec2( this._size );
		const input = this._input;
		const step = this._step;
		const positions = texture( this.positionTexture );
		const normals = texture( this.normalTexture );
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

				// a tap counts if it has data and lies on the same surface id, e.g. the same chart

				const tap = ( offset, callback ) => {

					const q = coord.add( offset );

					If( q.x.greaterThanEqual( 0 ).and( q.y.greaterThanEqual( 0 ) ).and( q.x.lessThan( size.x ) ).and( q.y.lessThan( size.y ) ), () => {

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

				// the taps are loops, unrolled ones would make shaders that take seconds to compile on some platforms

				Loop( { start: - 1, end: 1, condition: '<=', name: 'y' }, { start: - 1, end: 1, condition: '<=', name: 'x' }, ( { x, y } ) => {

					// the weights of the 3x3 kernel are 1/4, 1/2 and 1/4 along each axis

					const weight = float( 2 ).sub( abs( float( x ) ) ).mul( float( 2 ).sub( abs( float( y ) ) ) ).div( 16 ).toVar();

					tap( ivec2( x, y ), ( q, other, value ) => {

						variance.addAssign( vec2( value.a.pow2().mul( weight ), weight ) );

					} );

				} );

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

				// the weights of the 5x5 B3 spline kernel of the à-trous wavelet transform are 3/8, 1/4 and 1/16
				// at distances of 0, 1 and 2 along each axis

				const kernel = ( t ) => float( 12 ).sub( t.mul( 3 ) ).sub( t.mul( t ) ).div( 32 );

				Loop( { start: - 2, end: 2, condition: '<=', name: 'y' }, { start: - 2, end: 2, condition: '<=', name: 'x' }, ( { x, y } ) => {

					const fx = float( x ).toVar();
					const fy = float( y ).toVar();
					const kernelWeight = kernel( abs( fx ) ).mul( kernel( abs( fy ) ) ).toVar();

					tap( ivec2( x, y ).mul( step ), ( q, other, value ) => {

						const offset = other.xyz.sub( surface.xyz );
						const plane = abs( dot( normal, offset ) ).div( length( offset ).add( 1e-9 ) );
						const similarity = pow( max( dot( normal, normals.load( q ).xyz ), 0 ), normalPhi );
						const difference = abs( luminance( value.rgb ).sub( centerLuminance ) ).mul( luminanceScale );
						const weight = similarity.mul( exp( plane.div( planePhi ).add( difference ).negate() ) ).mul( kernelWeight ).toVar();
						const deviation2 = weight.pow2().mul( value.a.pow2() ).toVar();

						moments.addAssign( vec3( weight, weight.mul( fx ), weight.mul( fy ) ) );
						spread.addAssign( vec3( weight.mul( fx.mul( fx ) ), weight.mul( fx.mul( fy ) ), weight.mul( fy.mul( fy ) ) ) );
						sum.addAssign( value.rgb.mul( weight ) );
						sumX.addAssign( value.rgb.mul( weight.mul( fx ) ) );
						sumY.addAssign( value.rgb.mul( weight.mul( fy ) ) );
						noise.addAssign( vec3( deviation2, deviation2.mul( fx ), deviation2.mul( fy ) ) );
						noiseSpread.addAssign( vec3( deviation2.mul( fx.mul( fx ) ), deviation2.mul( fx.mul( fy ) ), deviation2.mul( fy.mul( fy ) ) ) );

					} );

				} );

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

				// the noise of the fit, with independent noise of the taps

				result.assign( vec4( fit, sqrt( fitNoise.max( 0 ) ) ) );

			} );

			return result;

		} );

		const material = new NodeMaterial();
		material.fragmentNode = filter();

		return material;

	}

	/**
	 * Creates the material that writes the denoised image and fills the texels without data with
	 * the mean of the denoised texels within two texels, like {@link LightMapper} fills the padding
	 * of the charts.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createResolveMaterial() {

		const input = this._input;
		const size = ivec2( this._size );

		const resolve = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = input.load( coord ).toVar();
			const result = vec4( center.rgb, 1 ).toVar();

			If( center.a.lessThan( 0 ), () => {

				const sum = vec4( 0 ).toVar();

				Loop( { start: - 2, end: 2, condition: '<=', name: 'y' }, { start: - 2, end: 2, condition: '<=', name: 'x' }, ( { x, y } ) => {

					const value = input.load( coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), size.sub( 1 ) ) ).toVar();

					If( value.a.greaterThanEqual( 0 ), () => {

						sum.addAssign( vec4( value.rgb, 1 ) );

					} );

				} );

				If( sum.a.greaterThan( 0 ), () => {

					result.assign( vec4( sum.rgb.div( sum.a ), 1 ) );

				} );

			} );

			return result;

		} );

		const material = new NodeMaterial();
		material.fragmentNode = resolve();

		return material;

	}

}

export { LightMapDenoiser };
