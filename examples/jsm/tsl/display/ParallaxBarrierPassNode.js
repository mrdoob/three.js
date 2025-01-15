import { NodeMaterial } from 'three/webgpu';
import { nodeObject, Fn, vec4, uv, If, mod, screenCoordinate } from 'three/tsl';
import StereoCompositePassNode from './StereoCompositePassNode.js';

/** @module ParallaxBarrierPassNode **/

/**
 * A render pass node that creates a parallax barrier effect.
 *
 * @augments StereoCompositePassNode
 */
class ParallaxBarrierPassNode extends StereoCompositePassNode {

	static get type() {

		return 'ParallaxBarrierPassNode';

	}

	/**
	 * Constructs a new parallax barrier pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 */
	constructor( scene, camera ) {

		super( scene, camera );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isParallaxBarrierPassNode = true;

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();

		const parallaxBarrier = Fn( () => {

			const color = vec4().toVar();

			If( mod( screenCoordinate.y, 2 ).greaterThan( 1 ), () => {

				color.assign( this._mapLeft.sample( uvNode ) );

			} ).Else( () => {

				color.assign( this._mapRight.sample( uvNode ) );

			} );

			return color;

		} );

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default ParallaxBarrierPassNode;

/**
 * TSL function for creating an parallax barrier pass node.
 *
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @returns {ParallaxBarrierPassNode}
 */
export const parallaxBarrierPass = ( scene, camera ) => nodeObject( new ParallaxBarrierPassNode( scene, camera ) );
