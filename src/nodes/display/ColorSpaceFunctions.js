import { mix } from '../math/MathNode.js';
import { Fn } from '../tsl/TSLBase.js';

export const sRGBToLinear = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.mul( 0.9478672986 ).add( 0.0521327014 ).pow( 2.4 );
	const b = color.mul( 0.0773993808 );
	const factor = color.lessThanEqual( 0.04045 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

} ).setLayout( {
	name: 'sRGBToLinear',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

export const LinearTosRGB = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = color.mul( 12.92 );
	const factor = color.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

} ).setLayout( {
	name: 'LinearTosRGB',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );
