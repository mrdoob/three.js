import { LinearTransfer, Matrix3, P3Primaries, Rec2020Primaries, SRGBTransfer } from 'three';

/******************************************************************************
 * Display P3
 *
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
	transfer: SRGBTransfer,
	primaries: P3Primaries,
	toReference: LINEAR_DISPLAY_P3_TO_XYZ,
	fromReference: XYZ_TO_LINEAR_DISPLAY_P3,
	luminanceCoefficients: [ 0.2289, 0.6917, 0.0793 ],
};

export const LinearDisplayP3ColorSpaceImpl = {
	transfer: LinearTransfer,
	primaries: P3Primaries,
	toReference: LINEAR_DISPLAY_P3_TO_XYZ,
	fromReference: XYZ_TO_LINEAR_DISPLAY_P3,
	luminanceCoefficients: [ 0.2289, 0.6917, 0.0793 ],
};

/******************************************************************************
 * Rec. 2020
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
	transfer: LinearTransfer,
	primaries: Rec2020Primaries,
	toReference: LINEAR_REC2020_TO_XYZ,
	fromReference: XYZ_TO_LINEAR_REC2020,
	luminanceCoefficients: [ 0.2627, 0.6780, 0.0593 ],
};

/******************************************************************************
 * Rec. 2100 Display (HDR)
 */

export const LinearRec2100DisplayColorSpace = 'rec2100-display-linear';

export const LinearRec2100DisplayColorSpaceImpl = {
	transfer: LinearTransfer,
	primaries: Rec2020Primaries,
	toReference: LINEAR_REC2020_TO_XYZ,
	fromReference: XYZ_TO_LINEAR_REC2020,
	luminanceCoefficients: [ 0.2627, 0.6780, 0.0593 ],
};
