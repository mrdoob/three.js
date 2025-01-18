import { Fn, vec4 } from '../tsl/TSLBase.js';
import { mix, min, step } from '../math/MathNode.js';

/** @module BlendModes **/

/**
 * Represents a "Color Burn" blend mode.
 *
 * It's designed to darken the base layer's colors based on the color of the blend layer.
 * It significantly increases the contrast of the base layer, making the colors more vibrant and saturated.
 * The darker the color in the blend layer, the stronger the darkening and contrast effect on the base layer.
 *
 * @method
 * @param {Node<vec3>} base - The base color.
 * @param {Node<vec3>} blend - The blend color. A white (#ffffff) blend color does not alter the base color.
 * @return {Node<vec3>} The result.
 */
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

/**
 * Represents a "Color Dodge" blend mode.
 *
 * It's designed to lighten the base layer's colors based on the color of the blend layer.
 * It significantly increases the brightness of the base layer, making the colors lighter and more vibrant.
 * The brighter the color in the blend layer, the stronger the lightening and contrast effect on the base layer.
 *
 * @method
 * @param {Node<vec3>} base - The base color.
 * @param {Node<vec3>} blend - The blend color. A black (#000000) blend color does not alter the base color.
 * @return {Node<vec3>} The result.
 */
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

/**
 * Represents a "Screen" blend mode.
 *
 * Similar to `blendDodge()`, this mode also lightens the base layer's colors based on the color of the blend layer.
 * The "Screen" blend mode is better for general brightening whereas the "Dodge" results in more subtle and nuanced
 * effects.
 *
 * @method
 * @param {Node<vec3>} base - The base color.
 * @param {Node<vec3>} blend - The blend color. A black (#000000) blend color does not alter the base color.
 * @return {Node<vec3>} The result.
 */
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

/**
 * Represents a "Overlay" blend mode.
 *
 * It's designed to increase the contrast of the base layer based on the color of the blend layer.
 * It amplifies the existing colors and contrast in the base layer, making lighter areas lighter and darker areas darker.
 * The color of the blend layer significantly influences the resulting contrast and color shift in the base layer.
 *
 * @method
 * @param {Node<vec3>} base - The base color.
 * @param {Node<vec3>} blend - The blend color
 * @return {Node<vec3>} The result.
 */
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

/**
 * This function blends two color based on their alpha values by replicating the behavior of `THREE.NormalBlending`.
 * It assumes both input colors have non-preumiltiplied alpha.
 *
 * @method
 * @param {Node<vec4>} base - The base color.
 * @param {Node<vec4>} blend - The blend color
 * @return {Node<vec4>} The result.
 */
export const blendColor = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	const outAlpha = blend.a.add( base.a.mul( blend.a.oneMinus() ) );

	return vec4( blend.rgb.mul( blend.a ).add( base.rgb.mul( base.a ).mul( blend.a.oneMinus() ) ).div( outAlpha ), outAlpha );

} ).setLayout( {
	name: 'blendColor',
	type: 'vec4',
	inputs: [
		{ name: 'base', type: 'vec4' },
		{ name: 'blend', type: 'vec4' }
	]
} );

// Deprecated

/**
 * @function
 * @deprecated since r171. Use {@link blendBurn} instead.
 *
 * @param  {...any} params
 * @returns {Function}
 */
export const burn = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "burn" has been renamed. Use "blendBurn" instead.' );
	return blendBurn( params );

};

/**
 * @function
 * @deprecated since r171. Use {@link blendDodge} instead.
 *
 * @param  {...any} params
 * @returns {Function}
 */
export const dodge = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "dodge" has been renamed. Use "blendDodge" instead.' );
	return blendDodge( params );

};

/**
 * @method
 * @deprecated since r171. Use {@link blendScreen} instead.
 *
 * @param  {...any} params
 * @returns {Function}
 */
export const screen = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "screen" has been renamed. Use "blendScreen" instead.' );
	return blendScreen( params );

};

/**
 * @method
 * @deprecated since r171. Use {@link blendOverlay} instead.
 *
 * @param  {...any} params
 * @returns {Function}
 */
export const overlay = ( ...params ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "overlay" has been renamed. Use "blendOverlay" instead.' );
	return blendOverlay( params );

};
