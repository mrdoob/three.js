import {
	ClampToEdgeWrapping,
	DataTexture,
	DataUtils,
	HalfFloatType,
	Light,
	LinearFilter,
	RGBAFormat,
	RGFormat,
	UVMapping
} from 'three';
import shader from './RectAreaLightShader.js';

let _ltcTextures = null;

// Degree-five Chebyshev fit to four conditioned LTC matrix parameters.
// Rows are [ roughness degree ][ view degree ], with four channels per row.
// The view coordinate used for the fit is atan2( alpha, N.V ).
// The fields correct width, rotation, shear, and height; LTC_DecodeMatrix
// reconstructs the inverse matrix after filtering. The fit was derived from
// the GGX matrices at https://github.com/selfshadow/ltc_code/tree/master/fit/results.
const _coefficients = [
	0.09287287, - 0.8723644, 0.04440988, - 0.1659892,
	- 0.1257902, - 0.8893892, 0.01900267, - 0.003565195,
	- 0.2149712, - 0.1190478, - 0.01341123, 0.05684938,
	- 0.08028743, 0.001877317, 0.00598588, - 0.1026004,
	0.05829235, - 0.02405805, - 0.004423615, 0.03930667,
	0.03495295, 0.02190838, 0.001594852, 0.02222095,
	0.4592336, 0.03858897, 0.02637976, - 0.1487379,
	0.3690477, 0.2957594, 0.01152618, 0.1418197,
	0.1448468, 0.2130954, - 0.001602693, 0.2438275,
	0.1197042, 0.1152331, 0.008055037, - 0.03939859,
	- 0.06036885, - 0.04020091, - 0.001288459, - 0.01253094,
	- 0.07480288, 0.01545243, - 0.001084004, - 0.02108012,
	- 0.2730997, - 0.1714615, - 0.04045315, - 0.1990581,
	- 0.2012329, - 0.1609927, - 0.01746759, - 0.08541539,
	- 0.04608306, - 0.1478976, 0.01336634, 0.08238445,
	- 0.1119338, - 0.08665037, - 0.009484556, - 0.0246486,
	0.04906838, - 0.01994244, 0.004390933, 0.01171335,
	0.04616626, - 0.00157161, - 0.001590255, 0.0392026,
	0.05804262, 0.1279031, - 0.03687795, 0.001823102,
	0.1379226, 0.1223349, - 0.01557628, - 0.01477064,
	0.07189586, 0.08961224, 0.007899989, 0.03186425,
	0.03047522, 0.07488051, - 0.003565135, 0.04088651,
	0.01602782, 0.01670337, 0.002207827, - 0.03140813,
	- 0.01378466, 0.02137774, - 0.001249338, 0.00999564,
	- 0.07254682, - 0.008418916, - 0.001158438, - 0.002127278,
	- 0.05216256, - 0.07400435, 0.0001493712, - 0.03778612,
	0.00975425, - 0.02129349, - 0.007933463, - 0.01255254,
	- 0.072776, - 0.04337226, 0.002901734, 0.00608935,
	- 0.0006401428, - 0.03240272, - 0.0002226738, - 0.01641851,
	- 0.009071147, - 0.01961639, - 0.0003187947, 0.0104101,
	0.05219947, 0.02458631, 0.008667499, 0.01444682,
	- 0.0281031, - 0.04058745, 0.007467084, - 0.01654244,
	- 0.01743741, 0.008544204, - 0.00828599, - 0.01157857,
	0.02524217, 0.01871597, 2.007132e-5, 0.01438961,
	0.005148598, 0.01142116, 0.0002626581, - 0.007968476,
	0.005444536, 0.009399962, - 0.001412142, 0.0004071666
];

/**
 * This class emits light uniformly across the face a rectangular plane.
 * This light type can be used to simulate light sources such as bright
 * windows or strip lighting.
 *
 * The renderer automatically generates the shared LTC textures on first use.
 *
 * Important Notes:
 *
 * - There is no shadow support.
 * - Only PBR materials are supported.
 * - Deserialization with ObjectLoader is not supported.
 *
 * ```js
 * const intensity = 1; const width = 10; const height = 10;
 * const rectLight = new RectAreaLight( 0xffffff, intensity, width, height );
 * rectLight.position.set( 5, 5, 0 );
 * rectLight.lookAt( 0, 0, 0 );
 * scene.add( rectLight );
 * ```
 *
 * When used with `WebGPURenderer`, the light must be registered with the
 * renderer's node library first:
 * ```js
 * renderer.library.addLight( RectAreaLightNode, RectAreaLight );
 * ```
 *
 * @augments Light
 * @three_import import { RectAreaLight } from 'three/addons/lights/RectAreaLight.js';
 */
class RectAreaLight extends Light {

	/**
	 * Constructs a new area light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 * @param {number} [width=10] - The width of the light.
	 * @param {number} [height=10] - The height of the light.
	 */
	constructor( color, intensity, width = 10, height = 10 ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRectAreaLight = true;

		this.type = 'RectAreaLight';

		/**
		 * The width of the light.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.width = width;

		/**
		 * The height of the light.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.height = height;

	}

	/**
	 * The light's power. Power is the luminous power of the light measured in lumens (lm).
	 * Changing the power will also change the light's intensity.
	 *
	 * @type {number}
	 */
	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in nits)
		return this.intensity * this.width * this.height * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in nits) from the desired luminous power (in lumens)
		this.intensity = power / ( this.width * this.height * Math.PI );

	}

	/**
	 * Returns the shared LTC textures used to render rectangular area lights.
	 * The textures are generated on first use.
	 *
	 * @return {Object<string,DataTexture>} The shared half-float LTC textures.
	 */
	getLTCTextures() {

		if ( _ltcTextures === null ) {

			_ltcTextures = generateTextures();

		}

		return _ltcTextures;

	}

	/**
	 * Returns the LTC shader used by WebGLRenderer.
	 *
	 * @return {string} The rectangular area light shader.
	 */
	getLTCShader() {

		return shader;

	}

	copy( source ) {

		super.copy( source );

		this.width = source.width;
		this.height = source.height;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.width = this.width;
		data.object.height = this.height;

		return data;

	}

}

function generateTextures() {

	const matrixData = Uint16Array.from( generateMatrixData(), DataUtils.toHalfFloat );
	const amplitudeData = Uint16Array.from( generateAmplitudeData(), DataUtils.toHalfFloat );

	const ltc1 = new DataTexture( matrixData, 64, 64, RGBAFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter, 1 );
	const ltc2 = new DataTexture( amplitudeData, 32, 32, RGFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter, 1 );

	ltc1.needsUpdate = true;
	ltc2.needsUpdate = true;

	return { ltc1, ltc2 };

}

function generateMatrixData() {

	// X = roughness, Y = sqrt( 1 - N.V ). The shader applies the analytic
	// normal-view and smooth-surface limits after filtering these residuals.
	const size = 64;
	const data = new Float32Array( size * size * 4 );
	const basisX = new Float64Array( 6 );
	const basisY = new Float64Array( 6 );
	const parameters = [ 0, 0, 0, 0 ];
	// Preserve the fitted domain's grazing endpoint; the shader uses actual N.V.
	const minViewCosine = Math.cos( 1.57 );

	for ( let y = 0; y < size; y ++ ) {

		const nv = Math.max( 1 - ( y / ( size - 1 ) ) ** 2, minViewCosine );

		for ( let x = 0; x < size; x ++ ) {

			const roughness = x / ( size - 1 );
			const alpha = Math.max( roughness * roughness, 1e-5 );
			const u = 2 * roughness - 1;
			const v = 4 * Math.atan2( alpha, nv ) / Math.PI - 1;

			basisX[ 0 ] = basisY[ 0 ] = 1;
			basisX[ 1 ] = u;
			basisY[ 1 ] = v;

			for ( let i = 2; i < 6; i ++ ) {

				basisX[ i ] = 2 * u * basisX[ i - 1 ] - basisX[ i - 2 ];
				basisY[ i ] = 2 * v * basisY[ i - 1 ] - basisY[ i - 2 ];

			}

			parameters.fill( 0 );

			for ( let i = 0; i < 6; i ++ ) {

				for ( let j = 0; j < 6; j ++ ) {

					const weight = basisX[ i ] * basisY[ j ];
					const offset = ( i * 6 + j ) * 4;

					for ( let c = 0; c < 4; c ++ ) {

						parameters[ c ] += weight * _coefficients[ offset + c ];

					}

				}

			}

			data.set( parameters, ( y * size + x ) * 4 );

		}

	}

	return data;

}

function generateAmplitudeData() {

	// X = roughness, Y = alpha * ( 1 - N.V ) / ( N.V + alpha ).
	// Store [ R, G - R * ( 1 - N.V )^5 ] so the shader reconstructs the
	// sharp Fresnel variation from the actual view direction after filtering.
	const size = 32;
	const sampleCount = 256;
	const samples = generateSamples( sampleCount );
	const data = new Float32Array( size * size * 2 );

	for ( let x = 0; x < size; x ++ ) {

		const roughness = x / ( size - 1 );
		const alpha = Math.max( roughness * roughness, 1e-5 );

		for ( let y = 0; y < size; y ++ ) {

			const v = y / ( size - 1 );
			const nv = alpha * ( 1 - v ) / ( alpha + v );
			const value = integrateAmplitude( roughness, nv, samples );
			const f = 1 - nv;
			const f2 = f * f;
			const offset = ( y * size + x ) * 2;

			data[ offset ] = value[ 0 ];
			data[ offset + 1 ] = value[ 1 ] - value[ 0 ] * f2 * f2 * f;

		}

	}

	return data;

}

function generateSamples( count ) {

	const samples = new Float64Array( count * 3 );

	for ( let i = 0; i < count; i ++ ) {

		// Hammersley points, with a half-sample offset to avoid endpoints.
		let bits = i >>> 0;
		bits = ( ( bits << 16 ) | ( bits >>> 16 ) ) >>> 0;
		bits = ( ( ( bits & 0x00ff00ff ) << 8 ) | ( ( bits & 0xff00ff00 ) >>> 8 ) ) >>> 0;
		bits = ( ( ( bits & 0x0f0f0f0f ) << 4 ) | ( ( bits & 0xf0f0f0f0 ) >>> 4 ) ) >>> 0;
		bits = ( ( ( bits & 0x33333333 ) << 2 ) | ( ( bits & 0xcccccccc ) >>> 2 ) ) >>> 0;
		bits = ( ( ( bits & 0x55555555 ) << 1 ) | ( ( bits & 0xaaaaaaaa ) >>> 1 ) ) >>> 0;

		const radius = Math.sqrt( ( i + 0.5 ) / count );
		const phi = 2 * Math.PI * ( bits / 4294967296 + 0.5 / count );
		const t1 = radius * Math.cos( phi );

		samples[ i * 3 ] = t1;
		samples[ i * 3 + 1 ] = radius * Math.sin( phi );
		samples[ i * 3 + 2 ] = Math.sqrt( Math.max( 1 - t1 * t1, 0 ) );

	}

	return samples;

}

function integrateAmplitude( roughness, nv, samples ) {

	// GGX visible-normal sampling (Heitz 2018):
	// https://jcgt.org/published/0007/04/01/paper.pdf
	// Dividing the cosine-weighted BRDF by the sampling PDF leaves G2 / G1.
	// Correlated Smith masking gives the bounded weight used below, including
	// its grazing-view limit at N.V = 0.
	const count = samples.length / 3;
	const alpha = Math.max( roughness * roughness, 1e-5 );
	const alphaSquared = alpha * alpha;
	const vx = Math.sqrt( Math.max( 1 - nv * nv, 0 ) );
	const rootV = Math.sqrt( nv * nv + alphaSquared * ( 1 - nv * nv ) );
	const vhx = alpha * vx / rootV;
	const vhz = nv / rootV;
	const blend = 0.5 * ( 1 + vhz );
	let magnitude = 0;
	let fresnel = 0;

	for ( let i = 0; i < count; i ++ ) {

		const t1 = samples[ i * 3 ];
		const t2 = ( 1 - blend ) * samples[ i * 3 + 2 ] + blend * samples[ i * 3 + 1 ];
		const z = Math.sqrt( Math.max( 1 - t1 * t1 - t2 * t2, 0 ) );
		const nx = alpha * ( - t2 * vhz + z * vhx );
		const ny = alpha * t1;
		const nz = Math.max( t2 * vhx + z * vhz, 0 );
		const invLength = 1 / Math.sqrt( nx * nx + ny * ny + nz * nz );
		const hz = nz * invLength;
		const vh = vx * nx * invLength + nv * hz;
		const nl = 2 * hz * vh - nv;

		if ( nl <= 0 ) continue;

		const rootL = Math.sqrt( nl * nl + alphaSquared * Math.max( 1 - nl * nl, 0 ) );
		const weight = ( nv + rootV ) * nl / ( rootV * nl + nv * rootL );
		const f = 1 - Math.min( Math.max( vh, 0 ), 1 );
		const f2 = f * f;

		magnitude += weight;
		fresnel += weight * f2 * f2 * f;

	}

	return [ magnitude / count, fresnel / count ];

}

export { RectAreaLight };
