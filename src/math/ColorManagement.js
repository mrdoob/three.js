import { SRGBColorSpace, LinearSRGBColorSpace, DisplayP3ColorSpace, LinearP3ColorSpace } from '../constants.js';
import { Matrix3 } from './Matrix3.js';
import { Vector3 } from './Vector3.js';

export function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

export function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}


/**
 * Matrices converting P3 <-> Rec. 709 primaries, without gamut mapping
 * or clipping. Based on W3C specifications for sRGB and Display P3,
 * and ICC specifications for the D50 connection space. Values in/out
 * are _linear_ sRGB and _linear_ Display P3.
 *
 * Note that both sRGB and Display P3 use the sRGB transfer functions.
 *
 * Reference:
 * - http://www.russellcottrell.com/photo/matrixCalculator.htm
 */

const LINEAR_REC709_TO_LINEAR_P3 = new Matrix3().fromArray( [
	0.8224621, 0.0331941, 0.0170827,
	0.1775380, 0.9668058, 0.0723974,
	- 0.0000001, 0.0000001, 0.9105199
] );

const LINEAR_P3_TO_LINEAR_REC709 = new Matrix3().fromArray( [
	1.2249401, - 0.0420569, - 0.0196376,
	- 0.2249404, 1.0420571, - 0.0786361,
	0.0000001, 0.0000000, 1.0982735
] );

const _vector = new Vector3();

function LinearP3ToLinearRec709( color ) {

	_vector.set( color.r, color.g, color.b ).applyMatrix3( LINEAR_P3_TO_LINEAR_REC709 );

	return color.setRGB( _vector.x, _vector.y, _vector.z );

}

function LinearRec709ToLinearP3( color ) {

	_vector.set( color.r, color.g, color.b ).applyMatrix3( LINEAR_REC709_TO_LINEAR_P3 );

	return color.setRGB( _vector.x, _vector.y, _vector.z );

}

// Conversions from <source> to Linear-sRGB reference space.
const TO_REFERENCE = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertSRGBToLinear(),
	[ LinearP3ColorSpace ]: ( color ) => LinearP3ToLinearRec709( color ),
	[ DisplayP3ColorSpace ]: ( color ) => LinearP3ToLinearRec709( color.convertSRGBToLinear() ),
};

// Conversions from Linear-sRGB reference space to <target>.
const FROM_REFERENCE = {
	[ LinearSRGBColorSpace ]: ( color ) => color,
	[ SRGBColorSpace ]: ( color ) => color.convertLinearToSRGB(),
	[ LinearP3ColorSpace ]: ( color ) => LinearRec709ToLinearP3( color ),
	[ DisplayP3ColorSpace ]: ( color ) => LinearRec709ToLinearP3( color ).convertLinearToSRGB(),
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

		const sourceToReference = TO_REFERENCE[ sourceColorSpace ];
		const referenceToTarget = FROM_REFERENCE[ targetColorSpace ];

		if ( sourceToReference === undefined || referenceToTarget === undefined ) {

			throw new Error( `Unsupported color space conversion, "${ sourceColorSpace }" to "${ targetColorSpace }".` );

		}

		return referenceToTarget( sourceToReference( color ) );

	},

	fromWorkingColorSpace: function ( color, targetColorSpace ) {

		return this.convert( color, this.workingColorSpace, targetColorSpace );

	},

	toWorkingColorSpace: function ( color, sourceColorSpace ) {

		return this.convert( color, sourceColorSpace, this.workingColorSpace );

	},

};
