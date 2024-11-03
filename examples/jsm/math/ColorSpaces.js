import { LinearTransfer, Matrix3, SRGBTransfer } from 'three';

// Reference: http://www.russellcottrell.com/photo/matrixCalculator.htm

const P3_PRIMARIES = [ 0.680, 0.320, 0.265, 0.690, 0.150, 0.060 ];
const P3_LUMINANCE_COEFFICIENTS = [ 0.2289, 0.6917, 0.0793 ];
const REC2020_PRIMARIES = [ 0.708, 0.292, 0.170, 0.797, 0.131, 0.046 ];
const REC2020_LUMINANCE_COEFFICIENTS = [ 0.2627, 0.6780, 0.0593 ];
const D65 = [ 0.3127, 0.3290 ];

/******************************************************************************
 * Display P3 definitions
 */

const LINEAR_DISPLAY_P3_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
	0.4865709, 0.2656677, 0.1982173,
	0.2289746, 0.6917385, 0.0792869,
	0.0000000, 0.0451134, 1.0439444
);

const XYZ_TO_LINEAR_DISPLAY_P3 = /*@__PURE__*/ new Matrix3().set(
	2.4934969, - 0.9313836, - 0.4027108,
	- 0.8294890, 1.7626641, 0.0236247,
	0.0358458, - 0.0761724, 0.9568845
);

export const DisplayP3ColorSpace = 'display-p3';
export const LinearDisplayP3ColorSpace = 'display-p3-linear';

export const DisplayP3ColorSpaceImpl = {
	primaries: P3_PRIMARIES,
	whitePoint: D65,
	transfer: SRGBTransfer,
	toXYZ: LINEAR_DISPLAY_P3_TO_XYZ,
	fromXYZ: XYZ_TO_LINEAR_DISPLAY_P3,
	luminanceCoefficients: P3_LUMINANCE_COEFFICIENTS,
	outputColorSpaceConfig: { drawingBufferColorSpace: DisplayP3ColorSpace }
};

export const LinearDisplayP3ColorSpaceImpl = {
	primaries: P3_PRIMARIES,
	whitePoint: D65,
	transfer: LinearTransfer,
	toXYZ: LINEAR_DISPLAY_P3_TO_XYZ,
	fromXYZ: XYZ_TO_LINEAR_DISPLAY_P3,
	luminanceCoefficients: P3_LUMINANCE_COEFFICIENTS,
	workingColorSpaceConfig: { unpackColorSpace: DisplayP3ColorSpace },
	outputColorSpaceConfig: { drawingBufferColorSpace: DisplayP3ColorSpace }
};

/******************************************************************************
 * Rec. 2020 definitions
 */

const LINEAR_REC2020_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
	0.6369580, 0.1446169, 0.1688810,
	0.2627002, 0.6779981, 0.0593017,
	0.0000000, 0.0280727, 1.0609851
);

const XYZ_TO_LINEAR_REC2020 = /*@__PURE__*/ new Matrix3().set(
	1.7166512, - 0.3556708, - 0.2533663,
	- 0.6666844, 1.6164812, 0.0157685,
	0.0176399, - 0.0427706, 0.9421031
);

export const LinearRec2020ColorSpace = 'rec2020-linear';

export const LinearRec2020ColorSpaceImpl = {
	primaries: REC2020_PRIMARIES,
	whitePoint: D65,
	transfer: LinearTransfer,
	toXYZ: LINEAR_REC2020_TO_XYZ,
	fromXYZ: XYZ_TO_LINEAR_REC2020,
	luminanceCoefficients: REC2020_LUMINANCE_COEFFICIENTS,
};
