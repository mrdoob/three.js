import { SRGBColorSpace, LinearSRGBColorSpace, Rec709Primaries, SRGBTransfer, LinearTransfer, NoColorSpace, } from '../constants.js';
import { Matrix3 } from './Matrix3.js';

// Reference: https://www.russellcottrell.com/photo/matrixCalculator.htm

const LINEAR_REC709_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
	0.4123908, 0.3575843, 0.1804808,
	0.2126390, 0.7151687, 0.0721923,
	0.0193308, 0.1191948, 0.9505322
);

const XYZ_TO_LINEAR_REC709 = /*@__PURE__*/ new Matrix3().set(
	3.2409699, - 1.5373832, - 0.4986108,
	- 0.9692436, 1.8759675, 0.0415551,
	0.0556301, - 0.2039770, 1.0569715
);

/**
 * Defines supported color spaces by transfer function and primaries,
 * and provides conversions to/from the XYZ reference space.
 */
const COLOR_SPACES = {
	[ LinearSRGBColorSpace ]: {
		transfer: LinearTransfer,
		primaries: Rec709Primaries,
		toReference: LINEAR_REC709_TO_XYZ,
		fromReference: XYZ_TO_LINEAR_REC709,
		luminanceCoefficients: [ 0.2126, 0.7152, 0.0722 ],
	},
	[ SRGBColorSpace ]: {
		transfer: SRGBTransfer,
		primaries: Rec709Primaries,
		toReference: LINEAR_REC709_TO_XYZ,
		fromReference: XYZ_TO_LINEAR_REC709,
		luminanceCoefficients: [ 0.2126, 0.7152, 0.0722 ],
	},
};

export const ColorManagement = {

	enabled: true,

	workingColorSpace: LinearSRGBColorSpace,

	convert: function ( color, sourceColorSpace, targetColorSpace ) {

		if ( this.enabled === false || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

			return color;

		}

		if ( COLOR_SPACES[ sourceColorSpace ].transfer === SRGBTransfer ) {

			SRGBToLinear( color );

		}

		color.applyMatrix3( COLOR_SPACES[ sourceColorSpace ].toReference );
		color.applyMatrix3( COLOR_SPACES[ targetColorSpace ].fromReference );

		if ( COLOR_SPACES[ targetColorSpace ].transfer === SRGBTransfer ) {

			LinearToSRGB( color );

		}

		return color;

	},

	fromWorkingColorSpace: function ( color, targetColorSpace ) {

		return this.convert( color, this.workingColorSpace, targetColorSpace );

	},

	toWorkingColorSpace: function ( color, sourceColorSpace ) {

		return this.convert( color, sourceColorSpace, this.workingColorSpace );

	},

	getPrimaries: function ( colorSpace ) {

		return COLOR_SPACES[ colorSpace ].primaries;

	},

	getTransfer: function ( colorSpace ) {

		if ( colorSpace === NoColorSpace ) return LinearTransfer;

		return COLOR_SPACES[ colorSpace ].transfer;

	},

	getLuminanceCoefficients: function ( target, colorSpace = this.workingColorSpace ) {

		return target.fromArray( COLOR_SPACES[ colorSpace ].luminanceCoefficients );

	},

	getMatrix: function ( sourceColorSpace, targetColorSpace, targetMatrix ) {

		return targetMatrix
			.copy( COLOR_SPACES[ sourceColorSpace ].toReference )
			.multiply( COLOR_SPACES[ targetColorSpace ].fromReference );

	},

	define: function ( colorSpaces ) {

		Object.assign( COLOR_SPACES, colorSpaces );

	},

};


export function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

export function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}
