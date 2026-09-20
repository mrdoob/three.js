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

let _ltcTextures = null;

// 3,078 quantized Chebyshev coefficients fitted to the original GGX LTC tables.
// Each cubic patch covers one of six fields: matrix length, angle, shear,
// height, magnitude and Fresnel amplitude. Small patches preserve sharp lobes.
// Source: https://github.com/selfshadow/ltc_code/tree/master/fit/results
//
// Patch header: channel, x0, x1, y0, y1, nx, ny, exponent + 128 (one byte each).
// Coefficients follow as signed zigzag varints, scaled by 2^exponent.
const _coefficients =
	'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';

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

	const ltc1 = new DataTexture( matrixData, 64, 64, RGBAFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter, 1 );
	const ltc2 = new DataTexture( amplitudeData, 64, 64, RGFormat, HalfFloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter, 1 );

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
