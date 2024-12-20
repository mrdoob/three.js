import { positionView } from '../accessors/Position.js';
import { smoothstep } from '../math/MathNode.js';
import { Fn, output, vec4 } from '../tsl/TSLBase.js';

/** @module Fog **/

/**
 * Returns a node that represents the `z` coordinate in view space
 * for the current fragment. It's a different representation of the
 * default depth value.
 *
 * This value can be part of a computation that defines how the fog
 * density increases when moving away from the camera.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @return {Node} The viewZ node.
 */
function getViewZNode( builder ) {

	let viewZ;

	const getViewZ = builder.context.getViewZ;

	if ( getViewZ !== undefined ) {

		viewZ = getViewZ( this );

	}

	return ( viewZ || positionView.z ).negate();

}

/**
 * Constructs a new range factor node.
 *
 * @function
 * @param {Node} near - Defines the near value.
 * @param {Node} far - Defines the far value.
 */
export const rangeFogFactor = Fn( ( [ near, far ], builder ) => {

	const viewZ = getViewZNode( builder );

	return smoothstep( near, far, viewZ );

} );

/**
 * Represents an exponential squared fog. This type of fog gives
 * a clear view near the camera and a faster than exponentially
 * densening fog farther from the camera.
 *
 * @function
 * @param {Node} density - Defines the fog density.
 */
export const densityFogFactor = Fn( ( [ density ], builder ) => {

	const viewZ = getViewZNode( builder );

	return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

} );

/**
 * This class can be used to configure a fog for the scene.
 * Nodes of this type are assigned to `Scene.fogNode`.
 *
 * @function
 * @param {Node} color - Defines the color of the fog.
 * @param {Node} factor - Defines how the fog is factored in the scene.
 */
export const fog = Fn( ( [ color, factor ] ) => {

	return vec4( factor.toFloat().mix( output.rgb, color.toVec3() ), output.a );

} );

// Deprecated

export function rangeFog( color, near, far ) { // @deprecated, r171

	console.warn( 'THREE.TSL: "rangeFog( color, near, far )" is deprecated. Use "fog( color, rangeFogFactor( near, far ) )" instead.' );
	return fog( color, rangeFogFactor( near, far ) );

}

export function densityFog( color, density ) { // @deprecated, r171

	console.warn( 'THREE.TSL: "densityFog( color, density )" is deprecated. Use "fog( color, densityFogFactor( density ) )" instead.' );
	return fog( color, densityFogFactor( density ) );

}
