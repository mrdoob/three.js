import { SRGBColorSpace, LinearSRGBColorSpace, SRGBTransfer, LinearTransfer, NoColorSpace } from '../constants.js';
import { Matrix3 } from './Matrix3.js';
import { warnOnce } from '../utils.js';

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

function createColorManagement() {

	const ColorManagement = {

		enabled: true,

		workingColorSpace: LinearSRGBColorSpace,

		/**
		 * Implementations of supported color spaces.
		 *
		 * Required:
		 *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
		 *	- whitePoint: reference white [ x y ]
		 *	- transfer: transfer function (pre-defined)
		 *	- toXYZ: Matrix3 RGB to XYZ transform
		 *	- fromXYZ: Matrix3 XYZ to RGB transform
		 *	- luminanceCoefficients: RGB luminance coefficients
		 *
		 * Optional:
		 *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace }
		 *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
		 *
		 * Reference:
		 * - https://www.russellcottrell.com/photo/matrixCalculator.htm
		 */
		spaces: {},

		convert: function ( color, sourceColorSpace, targetColorSpace ) {

			if ( this.enabled === false || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

				return color;

			}

			if ( this.spaces[ sourceColorSpace ].transfer === SRGBTransfer ) {

				color.r = SRGBToLinear( color.r );
				color.g = SRGBToLinear( color.g );
				color.b = SRGBToLinear( color.b );

			}

			if ( this.spaces[ sourceColorSpace ].primaries !== this.spaces[ targetColorSpace ].primaries ) {

				color.applyMatrix3( this.spaces[ sourceColorSpace ].toXYZ );
				color.applyMatrix3( this.spaces[ targetColorSpace ].fromXYZ );

			}

			if ( this.spaces[ targetColorSpace ].transfer === SRGBTransfer ) {

				color.r = LinearToSRGB( color.r );
				color.g = LinearToSRGB( color.g );
				color.b = LinearToSRGB( color.b );

			}

			return color;

		},

		workingToColorSpace: function ( color, targetColorSpace ) {

			return this.convert( color, this.workingColorSpace, targetColorSpace );

		},

		colorSpaceToWorking: function ( color, sourceColorSpace ) {

			return this.convert( color, sourceColorSpace, this.workingColorSpace );

		},

		getPrimaries: function ( colorSpace ) {

			return this.spaces[ colorSpace ].primaries;

		},

		getTransfer: function ( colorSpace ) {

			if ( colorSpace === NoColorSpace ) return LinearTransfer;

			return this.spaces[ colorSpace ].transfer;

		},

		getLuminanceCoefficients: function ( target, colorSpace = this.workingColorSpace ) {

			return target.fromArray( this.spaces[ colorSpace ].luminanceCoefficients );

		},

		define: function ( colorSpaces ) {

			Object.assign( this.spaces, colorSpaces );

		},

		// Internal APIs

		_getMatrix: function ( targetMatrix, sourceColorSpace, targetColorSpace ) {

			return targetMatrix
				.copy( this.spaces[ sourceColorSpace ].toXYZ )
				.multiply( this.spaces[ targetColorSpace ].fromXYZ );

		},

		_getDrawingBufferColorSpace: function ( colorSpace ) {

			return this.spaces[ colorSpace ].outputColorSpaceConfig.drawingBufferColorSpace;

		},

		_getUnpackColorSpace: function ( colorSpace = this.workingColorSpace ) {

			return this.spaces[ colorSpace ].workingColorSpaceConfig.unpackColorSpace;

		},

		// Deprecated

		fromWorkingColorSpace: function ( color, targetColorSpace ) {

			warnOnce( 'THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().' ); // @deprecated, r177

			return ColorManagement.workingToColorSpace( color, targetColorSpace );

		},

		toWorkingColorSpace: function ( color, sourceColorSpace ) {

			warnOnce( 'THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().' ); // @deprecated, r177

			return ColorManagement.colorSpaceToWorking( color, sourceColorSpace );

		},

	};

	/******************************************************************************
	 * sRGB definitions
	 */

	const REC709_PRIMARIES = [ 0.640, 0.330, 0.300, 0.600, 0.150, 0.060 ];
	const REC709_LUMINANCE_COEFFICIENTS = [ 0.2126, 0.7152, 0.0722 ];
	const D65 = [ 0.3127, 0.3290 ];

	ColorManagement.define( {

		[ LinearSRGBColorSpace ]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: LinearTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		},

		[ SRGBColorSpace ]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: SRGBTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		},

	} );

	return ColorManagement;

}

export const ColorManagement = /*@__PURE__*/ createColorManagement();

export function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

export function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}
