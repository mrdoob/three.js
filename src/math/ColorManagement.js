import { SRGBColorSpace, LinearSRGBColorSpace, DisplayP3ColorSpace, } from '../constants.js';
import { Matrix3 } from './Matrix3.js';
import { Vector3 } from './Vector3.js';

export function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

export function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}


/**
 * Matrices for sRGB and Display P3, based on the W3C specifications
 * for sRGB and Display P3, and the ICC specification for the D50
 * connection space.
 *
 * Reference:
 * - http://www.russellcottrell.com/photo/matrixCalculator.htm
 */

const SRGB_TO_DISPLAY_P3 = new Matrix3().multiplyMatrices(
	// XYZ to Display P3
	new Matrix3().set(
		2.4039840, - 0.9899069, - 0.3976415,
		- 0.8422229, 1.7988437, 0.0160354,
		0.0482059, - 0.0974068, 1.2740049,
	),
	// sRGB to XYZ
	new Matrix3().set(
		0.4360413, 0.3851129, 0.1430458,
		0.2224845, 0.7169051, 0.0606104,
		0.0139202, 0.0970672, 0.7139126,
	),
);

const DISPLAY_P3_TO_SRGB = new Matrix3().multiplyMatrices(
	// XYZ to sRGB
	new Matrix3().set(
		3.1341864, - 1.6172090, - 0.4906941,
		- 0.9787485, 1.9161301, 0.0334334,
		0.0719639, - 0.2289939, 1.4057537,
	),
	// Display P3 to XYZ
	new Matrix3().set(
		0.5151187, 0.2919778, 0.1571035,
		0.2411892, 0.6922441, 0.0665668,
		- 0.0010505, 0.0418791, 0.7840713,
	),
);

const _vector = new Vector3();

function DisplayP3ToLinearSRGB( color ) {

	color.convertSRGBToLinear();

	_vector.set( color.r, color.g, color.b ).applyMatrix3( DISPLAY_P3_TO_SRGB );

	return color.setRGB( _vector.x, _vector.y, _vector.z );

}

function LinearSRGBToDisplayP3( color ) {

	_vector.set( color.r, color.g, color.b ).applyMatrix3( SRGB_TO_DISPLAY_P3 );

	return color.setRGB( _vector.x, _vector.y, _vector.z ).convertLinearToSRGB();

}

// Conversions from <source> to Linear-sRGB reference space.
const TO_LINEAR = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertSRGBToLinear(),
	[ DisplayP3ColorSpace ]: DisplayP3ToLinearSRGB,
};

// Conversions to <target> from Linear-sRGB reference space.
const FROM_LINEAR = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertLinearToSRGB(),
	[ DisplayP3ColorSpace ]: LinearSRGBToDisplayP3,
};

export const ColorManagement = {

	enabled: false,

	get legacyMode() {

		console.warn( 'THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.' );

		return ! this.enabled;

	},

	set legacyMode( legacyMode ) {

		console.warn( 'THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150.' );

		this.enabled = ! legacyMode;

	},

	get workingColorSpace() {

		return LinearSRGBColorSpace;

	},

	set workingColorSpace( colorSpace ) {

		console.warn( 'THREE.ColorManagement: .workingColorSpace is readonly.' );

	},

	convert: function ( color, sourceColorSpace, targetColorSpace ) {

		if ( this.enabled === false || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

			return color;

		}

		const sourceToLinear = TO_LINEAR[ sourceColorSpace ];
		const targetFromLinear = FROM_LINEAR[ targetColorSpace ];

		if ( sourceToLinear === undefined || targetFromLinear === undefined ) {

			throw new Error( `Unsupported color space conversion, "${ sourceColorSpace }" to "${ targetColorSpace }".` );

		}

		return targetFromLinear( sourceToLinear( color ) );

	},

	fromWorkingColorSpace: function ( color, targetColorSpace ) {

		return this.convert( color, this.workingColorSpace, targetColorSpace );

	},

	toWorkingColorSpace: function ( color, sourceColorSpace ) {

		return this.convert( color, sourceColorSpace, this.workingColorSpace );

	},

};
