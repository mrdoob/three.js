import { Fn, vec4 } from '../tsl/TSLBase.js';
import { mix, min, step } from '../math/MathNode.js';

export const blendBurn = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return min( 1.0, base.oneMinus().div( blend ) ).oneMinus();

} ).setLayout( {
	name: 'blendBurn',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendDodge = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return min( base.div( blend.oneMinus() ), 1.0 );

} ).setLayout( {
	name: 'blendDodge',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendScreen = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return base.oneMinus().mul( blend.oneMinus() ).oneMinus();

} ).setLayout( {
	name: 'blendScreen',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendOverlay = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return mix( base.mul( 2.0 ).mul( blend ), base.oneMinus().mul( 2.0 ).mul( blend.oneMinus() ).oneMinus(), step( 0.5, base ) );

} ).setLayout( {
	name: 'blendOverlay',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendNormal = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return vec4( base.rgb.mul( blend.a.oneMinus() ).add( blend.rgb.mul( blend.a ) ), base.a );

} ).setLayout( {
	name: 'blendNormal',
	type: 'vec4',
	inputs: [
		{ name: 'base', type: 'vec4' },
		{ name: 'blend', type: 'vec4' }
	]
} );

// deprecated

export const burn = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "burn" has been deprecated. Use "blendBurn" instead.' );
	return blendBurn( params );

};

export const dodge = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "dodge" has been deprecated. Use "blendDodge" instead.' );
	return blendDodge( params );

};

export const screen = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "screen" has been deprecated. Use "blendScreen" instead.' );
	return blendScreen( params );

};

export const overlay = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "overlay" has been deprecated. Use "blendOverlay" instead.' );
	return blendOverlay( params );

};
