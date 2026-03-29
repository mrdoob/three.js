import { positionView, positionWorld } from '../accessors/Position.js';
import { smoothstep } from '../math/MathNode.js';
import { Fn, output, vec4 } from '../tsl/TSLBase.js';

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
 * @tsl
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
 * @tsl
 * @function
 * @param {Node} density - Defines the fog density.
 */
export const densityFogFactor = Fn( ( [ density ], builder ) => {

	const viewZ = getViewZNode( builder );

	return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

} );

/**
 * Constructs a new height fog factor node. This fog factor requires a Y-up coordinate system.
 *
 * @tsl
 * @function
 * @param {Node} density - Defines the fog density.
 * @param {Node} height - The height threshold in world space. Everything below this y-coordinate is affected by fog.
 */
export const exponentialHeightFogFactor = Fn( ( [ density, height ], builder ) => {

	const viewZ = getViewZNode( builder );

	const distance = height.sub( positionWorld.y ).max( 0 ).toConst();
	const m = distance.mul( viewZ ).toConst();

	return density.mul( density, m, m ).negate().exp().oneMinus();

} );

/**
 * This class can be used to configure a fog for the scene.
 * Nodes of this type are assigned to `Scene.fogNode`.
 *
 * @tsl
 * @function
 * @param {Node} color - Defines the color of the fog.
 * @param {Node} factor - Defines how the fog is factored in the scene.
 */
export const fog = Fn( ( [ color, factor ] ) => {

	return vec4( factor.toFloat().mix( output.rgb, color.toVec3() ), output.a );

} );
