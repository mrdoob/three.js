/**
 * HDR environment importance sampling (CDF tables + MIS) for screen-space effects.
 *
 * CDF precomputation and the MIS env-miss estimator are adapted from
 * [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer).
 *
 * @see {@link https://github.com/gkjohnson/three-gpu-pathtracer}
 */

import { If, dot, equirectUV, float, luminance, max, normalize, texture, uniform, vec2, vec4 } from 'three/tsl';
import { ClampToEdgeWrapping, DataTexture, DataUtils, FloatType, HalfFloatType, LinearFilter, RedFormat, RepeatWrapping, Source, Vector2 } from 'three/webgpu';
import { D_GTR, F_Schlick, GeometryTerm, SmithG, equirectDirPdf, misPowerHeuristic } from '../utils/SpecularHelpers.js';

function colorToLuminance( r, g, b ) {

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;

}

function binarySearchFindClosestIndexOf( array, targetValue, offset = 0, count = array.length ) {

	let lower = offset;
	let upper = offset + count - 1;

	while ( lower < upper ) {

		const mid = ( lower + upper ) >> 1;

		if ( array[ mid ] < targetValue ) {

			lower = mid + 1;

		} else {

			upper = mid;

		}

	}

	return lower - offset;

}

function preprocessEnvMap( envMap ) {

	const map = envMap.clone();
	map.source = new Source( { ...map.image } );
	const { width, height, data } = map.image;

	let newData = data;

	if ( map.type !== HalfFloatType ) {

		newData = new Uint16Array( data.length );

		let maxIntValue;
		if ( data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array ) {

			maxIntValue = 2 ** ( 8 * data.BYTES_PER_ELEMENT - 1 ) - 1;

		} else {

			maxIntValue = 2 ** ( 8 * data.BYTES_PER_ELEMENT ) - 1;

		}

		for ( let i = 0, l = data.length; i < l; i ++ ) {

			let v = data[ i ];

			if ( map.type === HalfFloatType ) {

				v = DataUtils.fromHalfFloat( data[ i ] );

			}

			if ( map.type !== FloatType && map.type !== HalfFloatType ) {

				v /= maxIntValue;

			}

			newData[ i ] = DataUtils.toHalfFloat( v );

		}

		map.image.data = newData;
		map.type = HalfFloatType;

	}

	if ( map.flipY ) {

		const ogData = newData;
		newData = newData.slice();

		for ( let y = 0; y < height; y ++ ) {

			for ( let x = 0; x < width; x ++ ) {

				const newY = height - y - 1;
				const ogIndex = 4 * ( y * width + x );
				const newIndex = 4 * ( newY * width + x );

				newData[ newIndex + 0 ] = ogData[ ogIndex + 0 ];
				newData[ newIndex + 1 ] = ogData[ ogIndex + 1 ];
				newData[ newIndex + 2 ] = ogData[ ogIndex + 2 ];
				newData[ newIndex + 3 ] = ogData[ ogIndex + 3 ];

			}

		}

		map.flipY = false;
		map.image.data = newData;

	}

	return map;

}

/**
 * Precomputes marginal and conditional CDF textures from an equirectangular HDR environment map
 * for luminance importance sampling.
 */
class EnvMapCDFGenerator {

	constructor() {

		this.map = null;
		this.marginalWeights = null;
		this.conditionalWeights = null;
		this.totalSum = 0;

	}

	updateFrom( hdr ) {

		this.updateMapOnly( hdr );

		const { width, height, data } = this.map.image;

		const pdfConditional = new Float32Array( width * height );
		const cdfConditional = new Float32Array( width * height );
		const pdfMarginal = new Float32Array( height );
		const cdfMarginal = new Float32Array( height );

		let totalSumValue = 0.0;
		let cumulativeWeightMarginal = 0.0;

		for ( let y = 0; y < height; y ++ ) {

			let cumulativeRowWeight = 0.0;

			for ( let x = 0; x < width; x ++ ) {

				const i = y * width + x;
				const r = DataUtils.fromHalfFloat( data[ 4 * i + 0 ] );
				const g = DataUtils.fromHalfFloat( data[ 4 * i + 1 ] );
				const b = DataUtils.fromHalfFloat( data[ 4 * i + 2 ] );

				const weight = colorToLuminance( r, g, b );
				cumulativeRowWeight += weight;
				totalSumValue += weight;

				pdfConditional[ i ] = weight;
				cdfConditional[ i ] = cumulativeRowWeight;

			}

			if ( cumulativeRowWeight !== 0 ) {

				for ( let i = y * width, l = y * width + width; i < l; i ++ ) {

					pdfConditional[ i ] /= cumulativeRowWeight;
					cdfConditional[ i ] /= cumulativeRowWeight;

				}

			}

			cumulativeWeightMarginal += cumulativeRowWeight;
			pdfMarginal[ y ] = cumulativeRowWeight;
			cdfMarginal[ y ] = cumulativeWeightMarginal;

		}

		if ( cumulativeWeightMarginal !== 0 ) {

			for ( let i = 0, l = pdfMarginal.length; i < l; i ++ ) {

				pdfMarginal[ i ] /= cumulativeWeightMarginal;
				cdfMarginal[ i ] /= cumulativeWeightMarginal;

			}

		}

		const marginalDataArray = new Uint16Array( height );
		const conditionalDataArray = new Uint16Array( width * height );

		for ( let i = 0; i < height; i ++ ) {

			const dist = ( i + 1 ) / height;
			const row = binarySearchFindClosestIndexOf( cdfMarginal, dist );
			marginalDataArray[ i ] = DataUtils.toHalfFloat( ( row + 0.5 ) / height );

		}

		for ( let y = 0; y < height; y ++ ) {

			for ( let x = 0; x < width; x ++ ) {

				const i = y * width + x;
				const dist = ( x + 1 ) / width;
				const col = binarySearchFindClosestIndexOf( cdfConditional, dist, y * width, width );
				conditionalDataArray[ i ] = DataUtils.toHalfFloat( ( col + 0.5 ) / width );

			}

		}

		if ( this.marginalWeights ) {

			this.marginalWeights.dispose();

		}

		if ( this.conditionalWeights ) {

			this.conditionalWeights.dispose();

		}

		this.marginalWeights = new DataTexture( marginalDataArray, height, 1 );
		this.marginalWeights.type = HalfFloatType;
		this.marginalWeights.format = RedFormat;
		this.marginalWeights.minFilter = LinearFilter;
		this.marginalWeights.magFilter = LinearFilter;
		this.marginalWeights.wrapS = ClampToEdgeWrapping;
		this.marginalWeights.wrapT = ClampToEdgeWrapping;
		this.marginalWeights.generateMipmaps = false;
		this.marginalWeights.needsUpdate = true;

		this.conditionalWeights = new DataTexture( conditionalDataArray, width, height );
		this.conditionalWeights.type = HalfFloatType;
		this.conditionalWeights.format = RedFormat;
		this.conditionalWeights.minFilter = LinearFilter;
		this.conditionalWeights.magFilter = LinearFilter;
		this.conditionalWeights.wrapS = ClampToEdgeWrapping;
		this.conditionalWeights.wrapT = ClampToEdgeWrapping;
		this.conditionalWeights.generateMipmaps = false;
		this.conditionalWeights.needsUpdate = true;

		this.totalSum = totalSumValue;

	}

	updateMapOnly( hdr ) {

		if ( this.map ) {

			this.map.dispose();

		}

		const map = preprocessEnvMap( hdr );
		map.wrapS = RepeatWrapping;
		map.wrapT = ClampToEdgeWrapping;

		this.map = map;
		this.totalSum = 0;

	}

	dispose() {

		if ( this.marginalWeights ) {

			this.marginalWeights.dispose();
			this.marginalWeights = null;

		}

		if ( this.conditionalWeights ) {

			this.conditionalWeights.dispose();
			this.conditionalWeights = null;

		}

		if ( this.map ) {

			this.map.dispose();
			this.map = null;

		}

	}

}

/**
 * Manages a preprocessed HDR environment map (CDF textures, uniforms) and exposes
 * TSL helpers for BRDF-direction lookups and MIS importance sampling.
 *
 * @see {@link https://github.com/gkjohnson/three-gpu-pathtracer}
 */
class ImportanceSampledEnvironment {

	/**
	 * @param {boolean} [importanceSampling=false] - When `true`, builds luminance CDF tables and enables MIS env sampling.
	 */
	constructor( importanceSampling = false ) {

		this._importanceSampling = importanceSampling;
		this._cdf = new EnvMapCDFGenerator();

		this._totalSum = uniform( 0.0, 'float' );
		this._size = uniform( new Vector2( 1, 1 ) );
		this.intensity = uniform( 1.0, 'float' );

		this._mapNode = null;
		this._marginalNode = null;
		this._conditionalNode = null;

	}

	/**
	 * @param {Texture} hdr - Equirectangular HDR environment map.
	 */
	updateFrom( hdr ) {

		if ( this._importanceSampling ) {

			this._cdf.updateFrom( hdr );
			this._totalSum.value = this._cdf.totalSum;

		} else {

			this._cdf.updateMapOnly( hdr );

		}

		this._size.value.set( this._cdf.map.image.width, this._cdf.map.image.height );

		if ( this._mapNode === null ) {

			this._mapNode = texture( this._cdf.map );

			if ( this._importanceSampling ) {

				this._marginalNode = texture( this._cdf.marginalWeights );
				this._conditionalNode = texture( this._cdf.conditionalWeights );

			}

		} else {

			this._mapNode.value = this._cdf.map;

			if ( this._importanceSampling ) {

				this._marginalNode.value = this._cdf.marginalWeights;
				this._conditionalNode.value = this._cdf.conditionalWeights;

			}

		}

	}

	clear() {

		this.dispose();
		this._cdf = new EnvMapCDFGenerator();
		this._mapNode = null;
		this._marginalNode = null;
		this._conditionalNode = null;
		this._totalSum.value = 0;
		this._size.value.set( 1, 1 );

	}

	/**
	 * Simple environment lookup along the reflected direction (no MIS).
	 *
	 * @param {Object} params
	 * @param {UniformNode<Matrix4>} params.cameraWorldMatrix
	 * @param {Node<vec3>} params.viewReflectDir
	 * @param {Node<float>} [params.sampleWeight] - Optional radiance scale (defaults to 1).
	 * @return {Node<vec3>}
	 */
	sampleReflect( { cameraWorldMatrix, viewReflectDir, sampleWeight = float( 1 ) } ) {

		const worldReflectDir = cameraWorldMatrix.mul( vec4( viewReflectDir, float( 0 ) ) ).xyz.normalize();
		const envUV = equirectUV( worldReflectDir );

		// Explicit LOD 0: the per-pixel reflected direction is discontinuous at the equirect pole/seam
		// (atan is undefined at the poles), so derivative-driven mip selection collapses to the coarsest
		// (near-average) mip there and produces a bright streak. Roughness is handled via direction sampling.
		return texture( this._mapNode, envUV ).level( 0 ).rgb.mul( this.intensity ).mul( sampleWeight );

	}

	/**
	 * Environment reflection for a screen-space miss using only the BRDF / reflected-ray direction.
	 *
	 * @param {Object} params
	 * @param {UniformNode<Matrix4>} params.cameraWorldMatrix
	 * @param {Node<vec3>} params.viewReflectDir - View-space GGX-sampled reflected ray.
	 * @param {Node<vec3>} params.N - View-space shading normal.
	 * @param {Node<vec3>} params.V - View-space direction to camera.
	 * @param {Node<float>} params.alpha - GGX roughness (alpha).
	 * @param {Node<vec3>} params.f0
	 * @return {Node<vec3>}
	 */
	sampleEnvironmentBRDF( {
		cameraWorldMatrix,
		viewReflectDir,
		N,
		V,
		alpha,
		f0
	} ) {

		const worldNormal = cameraWorldMatrix.mul( vec4( N, 0 ) ).xyz.normalize().toVar();
		const worldV = cameraWorldMatrix.mul( vec4( V, 0 ) ).xyz.normalize().toVar();
		const NdotV = max( float( 0 ), dot( worldNormal, worldV ) ).toVar();

		const L1 = cameraWorldMatrix.mul( vec4( viewReflectDir, float( 0 ) ) ).xyz.normalize().toVar();
		// Explicit LOD 0: the equirect mapping is singular at the poles (atan undefined when the reflected
		// ray points straight up/down, e.g. a flat floor under a top-down camera), so derivative-driven mip
		// selection picks the coarsest, near-average mip and yields a bright streak. Sample full-res instead.
		const brdfEnvColor = texture( this._mapNode, equirectUV( L1 ) ).level( 0 ).rgb;

		const H1 = normalize( worldV.add( L1 ) ).toVar();
		const NdotL1 = max( float( 0 ), dot( worldNormal, L1 ) ).toVar();
		const VdotH1 = max( float( 0 ), dot( worldV, H1 ) ).toVar();

		const W1 = F_Schlick( f0, VdotH1 ).mul( GeometryTerm( NdotL1, NdotV, alpha ) ).div( SmithG( NdotV, alpha ).max( float( 1e-4 ) ) );

		return brdfEnvColor.mul( W1 ).mul( this.intensity );

	}

	/**
	 * Environment reflection for a screen-space miss, estimated with multiple importance
	 * sampling (MIS) between the BRDF / reflected-ray direction and the env-luminance CDF
	 * direction. Both techniques use consistent solid-angle PDFs (`D·G1(N·V)/(4·N·V)`), so
	 * the power heuristic is unbiased. Adapted from three-gpu-pathtracer.
	 *
	 * @see {@link https://github.com/gkjohnson/three-gpu-pathtracer}
	 *
	 * @param {Object} params
	 * @param {UniformNode<Matrix4>} params.cameraWorldMatrix
	 * @param {Node<vec3>} params.viewReflectDir - View-space GGX-sampled reflected ray.
	 * @param {Node<vec3>} params.N - View-space shading normal.
	 * @param {Node<vec3>} params.V - View-space direction to camera.
	 * @param {Node<float>} params.alpha - GGX roughness (alpha).
	 * @param {Node<vec3>} params.f0
	 * @param {Node<vec4>} params.Xi2 - Second blue-noise sample (zw used for the CDF).
	 * @return {Node<vec3>}
	 */
	sampleEnvironmentMIS( {
		cameraWorldMatrix,
		viewReflectDir,
		N,
		V,
		alpha,
		f0,
		Xi2
	} ) {

		const mapNode = this._mapNode;
		const marginalNode = this._marginalNode;
		const conditionalNode = this._conditionalNode;
		const totalSum = this._totalSum;
		const envW = this._size.x;
		const envH = this._size.y;
		const envMapIntensity = this.intensity;

		const worldNormal = cameraWorldMatrix.mul( vec4( N, 0 ) ).xyz.normalize().toVar();
		const worldV = cameraWorldMatrix.mul( vec4( V, 0 ) ).xyz.normalize().toVar();
		const NdotV = max( float( 0 ), dot( worldNormal, worldV ) ).toVar();

		// MIS sample 1: the BRDF / reflected-ray direction
		const L1 = cameraWorldMatrix.mul( vec4( viewReflectDir, float( 0 ) ) ).xyz.normalize().toVar();
		const brdfEnvColor = texture( mapNode, equirectUV( L1 ) ).level( 0 ).rgb;

		const H1 = normalize( worldV.add( L1 ) ).toVar();
		const NdotL1 = max( float( 0 ), dot( worldNormal, L1 ) ).toVar();
		const NdotH1 = max( float( 0 ), dot( worldNormal, H1 ) ).toVar();
		const VdotH1 = max( float( 0 ), dot( worldV, H1 ) ).toVar();

		// Solid-angle PDF of the reflected ray for the BRDF technique: D(H)·G1(N·V)/(4·N·V).
		const pdfBrdf1 = D_GTR( alpha, NdotH1, float( 2 ) ).mul( SmithG( NdotV, alpha ) ).div( max( float( 1e-6 ), float( 4 ).mul( NdotV ) ) ).max( float( 1e-8 ) );
		// Env-luminance CDF PDF evaluated at the same direction.
		const pdfEnv1 = envW.mul( envH ).mul( luminance( brdfEnvColor ).div( totalSum ) ).mul( equirectDirPdf( L1 ) ).max( float( 1e-8 ) );
		const w1 = misPowerHeuristic( pdfBrdf1, pdfEnv1 );

		// Monte-Carlo weight f·cosθ/pdfBrdf1 = F·G1(N·L) (GGX D cancels analytically — stable at low
		// roughness). G2 and the pdf's G1 must use the same alpha for the cancellation to hold.
		const W1 = F_Schlick( f0, VdotH1 ).mul( GeometryTerm( NdotL1, NdotV, alpha ) ).div( SmithG( NdotV, alpha ).max( float( 1e-4 ) ) );
		const result = brdfEnvColor.mul( W1 ).mul( w1 ).toVar();

		// MIS sample 2: the env-luminance CDF direction
		// Mitigates noise on high-dynamic-range environments (the CDF lands samples on bright regions
		// the BRDF lobe rarely hits). Skipped for near-mirror lobes (alpha ≲ 0.01, i.e. roughness ≲ 0.1):
		// a global CDF direction almost never lands inside such a tight specular lobe.
		If( alpha.greaterThan( 0.01 ), () => {

			const r_env = vec2( Xi2.z, Xi2.w );
			const v_cdf = texture( marginalNode, vec2( r_env.x, float( 0 ) ) ).r;
			const u_cdf = texture( conditionalNode, vec2( r_env.y, v_cdf ) ).r;
			const isEnvUV = vec2( u_cdf, v_cdf );
			const envDirWS = equirectUV( isEnvUV );

			const envHalf = normalize( worldV.add( envDirWS ) );
			const envNdotL = max( float( 0 ), dot( worldNormal, envDirWS ) );
			const envNdotH = max( float( 0 ), dot( worldNormal, envHalf ) );
			const envVdotH = max( float( 0 ), dot( worldV, envHalf ) );

			If( envNdotL.greaterThan( 0.001 ), () => {

				// GGX normal-distribution term, shared by the BRDF pdf and the specular BRDF
				// (both evaluate D(envNdotH)) so the pow is computed once.
				const D = D_GTR( alpha, envNdotH, float( 2 ) ).toVar();

				const sampledColor = texture( mapNode, isEnvUV ).level( 0 ).rgb;
				const pdfEnv2 = envW.mul( envH ).mul( luminance( sampledColor ).div( totalSum ) ).mul( equirectDirPdf( envDirWS ) ).max( float( 1e-8 ) );
				// BRDF technique pdf at the env direction — same solid-angle form as pdfBrdf1 (no V·H).
				const pdfBrdf2 = D.mul( SmithG( NdotV, alpha ) ).div( max( float( 1e-6 ), float( 4 ).mul( NdotV ) ) ).max( float( 1e-8 ) );
				const w2 = misPowerHeuristic( pdfEnv2, pdfBrdf2 );

				// Specular BRDF (without Fresnel): D·G2 / (4·N·L·N·V), reusing D. Same GGX alpha as the pdf.
				const envBrdfSpec = D.mul( GeometryTerm( envNdotL, NdotV, alpha ) ).div( max( float( 1e-6 ), float( 4 ).mul( envNdotL ).mul( NdotV ) ) );
				const envFresnelWeight = F_Schlick( f0, envVdotH ); // vec3 — chromatic metal tint

				result.addAssign( sampledColor.mul( envBrdfSpec ).mul( envFresnelWeight ).mul( envNdotL ).div( pdfEnv2 ).mul( w2 ) );

			} );

		} );

		return result.mul( envMapIntensity );

	}

	dispose() {

		this._cdf.dispose();

	}

}

export default ImportanceSampledEnvironment;
