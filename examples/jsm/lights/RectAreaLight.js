import {
	ClampToEdgeWrapping,
	DataTexture,
	DataUtils,
	HalfFloatType,
	Light,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGFormat,
	UVMapping
} from 'three';

let _ltcTextures = null;

// 3,078 quantized Chebyshev coefficients fitted to the original GGX LTC tables.
// Each cubic patch covers one of six fields: matrix length, angle, shear,
// height, magnitude and Fresnel amplitude. Small patches preserve sharp lobes.
// Refined against interpolated lighting after conversion to half-float.
// Source: https://github.com/selfshadow/ltc_code/tree/master/fit/results
//
// Patch header: channel, x0, x1, y0, y1, nx, ny, exponent + 128 (one byte each).
// Coefficients follow as signed zigzag varints, scaled by 2^exponent.
const _coefficients =
	'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' +
	'qgJqEhpOAisE';

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

	const fields = generateFields();
	const matrixData = new Uint16Array( 64 * 64 * 4 );
	const amplitudeData = new Uint16Array( 64 * 64 * 2 );

	for ( let i = 0; i < 4096; i ++ ) {

		const alpha = Math.max( ( ( i % 64 ) / 63 ) ** 2, 1e-5 );
		const length = Math.max( fields[ i ], 1e-12 );
		const angle = fields[ 4096 + i ];
		const shear = fields[ 8192 + i ] * 2 * alpha;
		const height = Math.max( fields[ 12288 + i ], 1e-12 ) * 2 * alpha;
		const cos = Math.cos( angle );
		const sin = Math.sin( angle );

		// Store the final inverse matrix so the existing shaders can sample it directly.
		matrixData[ 4 * i ] = DataUtils.toHalfFloat( length * cos );
		matrixData[ 4 * i + 1 ] = DataUtils.toHalfFloat( shear * cos - height * sin );
		matrixData[ 4 * i + 2 ] = DataUtils.toHalfFloat( length * sin );
		matrixData[ 4 * i + 3 ] = DataUtils.toHalfFloat( shear * sin + height * cos );

		amplitudeData[ 2 * i ] = DataUtils.toHalfFloat( Math.min( 1, Math.max( 0, fields[ 16384 + i ] ) ) );
		amplitudeData[ 2 * i + 1 ] = DataUtils.toHalfFloat( Math.min( 1, Math.max( 0, fields[ 20480 + i ] ) ) );

	}

	const ltc1 = new DataTexture( matrixData, 64, 64, RGBAFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, NearestFilter, 1 );
	const ltc2 = new DataTexture( amplitudeData, 64, 64, RGFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, NearestFilter, 1 );

	ltc1.needsUpdate = true;
	ltc2.needsUpdate = true;

	return { ltc1, ltc2 };

}

function generateFields() {

	const bytes = atob( _coefficients );
	const fields = new Float64Array( 6 * 4096 );
	const coefficients = new Float64Array( 16 );
	const rows = new Float64Array( 4 * 64 );
	const basisX = new Float64Array( 4 * 64 );
	const basisY = new Float64Array( 4 * 64 );
	let offset = 0;

	while ( offset < bytes.length ) {

		const channel = bytes.charCodeAt( offset ++ );
		const x0 = bytes.charCodeAt( offset ++ );
		const x1 = bytes.charCodeAt( offset ++ );
		const y0 = bytes.charCodeAt( offset ++ );
		const y1 = bytes.charCodeAt( offset ++ );
		const nx = bytes.charCodeAt( offset ++ );
		const ny = bytes.charCodeAt( offset ++ );
		const step = 2 ** ( bytes.charCodeAt( offset ++ ) - 128 );
		const width = x1 - x0;
		const height = y1 - y0;

		for ( let i = 0; i < nx * ny; i ++ ) {

			let code = 0, factor = 1, byte;

			do {

				byte = bytes.charCodeAt( offset ++ );
				code += ( byte & 127 ) * factor;
				factor *= 128;

			} while ( byte & 128 );

			coefficients[ i ] = ( code % 2 ? - ( code + 1 ) / 2 : code / 2 ) * step;

		}

		computeBasis( basisX, width );
		computeBasis( basisY, height );

		// Evaluate each patch in two passes, reusing its horizontal polynomials.
		for ( let y = 0; y < ny; y ++ ) {

			for ( let x = 0; x < width; x ++ ) {

				let value = 0;

				for ( let j = 0; j < nx; j ++ ) {

					value += coefficients[ y * nx + j ] * basisX[ x * 4 + j ];

				}

				rows[ y * width + x ] = value;

			}

		}

		for ( let y = 0; y < height; y ++ ) {

			for ( let x = 0; x < width; x ++ ) {

				let value = 0;

				for ( let i = 0; i < ny; i ++ ) {

					value += rows[ i * width + x ] * basisY[ y * 4 + i ];

				}

				fields[ channel * 4096 + ( y + y0 ) * 64 + x + x0 ] = value;

			}

		}

	}

	return fields;

}

function computeBasis( basis, samples ) {

	for ( let i = 0; i < samples; i ++ ) {

		const x = samples === 1 ? - 1 : 2 * i / ( samples - 1 ) - 1;
		const offset = 4 * i;

		basis[ offset ] = 1;
		basis[ offset + 1 ] = x;
		basis[ offset + 2 ] = 2 * x * x - 1;
		basis[ offset + 3 ] = 2 * x * basis[ offset + 2 ] - x;

	}

}

export { RectAreaLight };
