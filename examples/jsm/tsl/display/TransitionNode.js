import { Node } from 'three/webgpu';
import { nodeObject, Fn, float, uv, convertToTexture, vec4, If, int, clamp, sub, mix } from 'three/tsl';

/**
 * Post processing node for creating a transition effect between scenes.
 *
 * @augments Node
 * @three_import import { transition } from 'three/addons/tsl/display/TransitionNode.js';
 */
class TransitionNode extends Node {

	static get type() {

		return 'TransitionNode';

	}

	/**
	 * Constructs a new transition node.
	 *
	 * @param {TextureNode} textureNodeA - A texture node that represents the beauty pass of the first scene.
	 * @param {TextureNode} textureNodeB - A texture node that represents the beauty pass of the second scene.
	 * @param {TextureNode} mixTextureNode - A texture node that defines how the transition effect should look like.
	 * @param {Node<float>} mixRatioNode - The interpolation factor that controls the mix.
	 * @param {Node<float>} thresholdNode - Can be used to tweak the linear interpolation.
	 * @param {Node<float>} useTextureNode - Whether `mixTextureNode` should influence the transition or not.
	 */
	constructor( textureNodeA, textureNodeB, mixTextureNode, mixRatioNode, thresholdNode, useTextureNode ) {

		super( 'vec4' );

		/**
		 * A texture node that represents the beauty pass of the first scene.
		 *
		 * @type {TextureNode}
		 */
		this.textureNodeA = textureNodeA;

		/**
		 * Whether `textureNodeA` is owned by this effect, i.e. it was created
		 * by `convertToTexture()` in the factory function. Owned nodes are
		 * disposed in `dispose()`, caller-owned nodes are not.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._ownsTextureNodeA = false;

		/**
		 * A texture node that represents the beauty pass of the second scene.
		 *
		 * @type {TextureNode}
		 */
		this.textureNodeB = textureNodeB;

		/**
		 * Whether `textureNodeB` is owned by this effect, i.e. it was created
		 * by `convertToTexture()` in the factory function. Owned nodes are
		 * disposed in `dispose()`, caller-owned nodes are not.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._ownsTextureNodeB = false;

		/**
		 * A texture that defines how the transition effect should look like.
		 *
		 * @type {TextureNode}
		 */
		this.mixTextureNode = mixTextureNode;

		/**
		 * Whether `mixTextureNode` is owned by this effect, i.e. it was created
		 * by `convertToTexture()` in the factory function. Owned nodes are
		 * disposed in `dispose()`, caller-owned nodes are not.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._ownsMixTextureNode = false;

		/**
		 * The interpolation factor that controls the mix.
		 *
		 * @type {Node<float>}
		 */
		this.mixRatioNode = mixRatioNode;

		/**
		 * Can be used to tweak the linear interpolation.
		 *
		 * @type {Node<float>}
		 */
		this.thresholdNode = thresholdNode;

		/**
		 * Whether `mixTextureNode` should influence the transition or not.
		 *
		 * @type {Node<float>}
		 */
		this.useTextureNode = useTextureNode;

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup() {

		const { textureNodeA, textureNodeB, mixTextureNode, mixRatioNode, thresholdNode, useTextureNode } = this;

		const sampleTexture = ( textureNode ) => {

			const uvNodeTexture = textureNode.uvNode || uv();
			return textureNode.sample( uvNodeTexture );

		};

		const transition = Fn( () => {

			const texelOne = sampleTexture( textureNodeA );
			const texelTwo = sampleTexture( textureNodeB );

			const color = vec4().toVar();

			If( useTextureNode.equal( int( 1 ) ), () => {

				const transitionTexel = sampleTexture( mixTextureNode );
				const r = mixRatioNode.mul( thresholdNode.mul( 2.0 ).add( 1.0 ) ).sub( thresholdNode );
				const mixf = clamp( sub( transitionTexel.r, r ).mul( float( 1.0 ).div( thresholdNode ) ), 0.0, 1.0 );

				color.assign( mix( texelOne, texelTwo, mixf ) );

			} ).Else( () => {

				color.assign( mix( texelTwo, texelOne, mixRatioNode ) );

			} );

			return color;

		} );

		const outputNode = transition();

		return outputNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		if ( this._ownsTextureNodeA === true ) this.textureNodeA.dispose();
		if ( this._ownsTextureNodeB === true ) this.textureNodeB.dispose();
		if ( this._ownsMixTextureNode === true ) this.mixTextureNode.dispose();

	}

}

export default TransitionNode;

/**
 * TSL function for creating a transition node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} nodeA - A texture node that represents the beauty pass of the first scene.
 * @param {Node<vec4>} nodeB - A texture node that represents the beauty pass of the second scene.
 * @param {Node<vec4>} mixTextureNode - A texture that defines how the transition effect should look like.
 * @param {Node<float> | number} mixRatio - The interpolation factor that controls the mix.
 * @param {Node<float> | number} threshold - Can be used to tweak the linear interpolation.
 * @param {Node<float> | number} useTexture - Whether `mixTextureNode` should influence the transition or not.
 * @returns {TransitionNode}
 */
export const transition = ( nodeA, nodeB, mixTextureNode, mixRatio, threshold, useTexture ) => {

	const textureNodeA = convertToTexture( nodeA );
	const textureNodeB = convertToTexture( nodeB );
	const convertedMixTextureNode = convertToTexture( mixTextureNode );
	const effect = new TransitionNode( textureNodeA, textureNodeB, convertedMixTextureNode, nodeObject( mixRatio ), nodeObject( threshold ), nodeObject( useTexture ) );

	effect._ownsTextureNodeA = textureNodeA.isRTTNode === true && textureNodeA !== nodeA;
	effect._ownsTextureNodeB = textureNodeB.isRTTNode === true && textureNodeB !== nodeB;
	effect._ownsMixTextureNode = convertedMixTextureNode.isRTTNode === true && convertedMixTextureNode !== mixTextureNode;

	return effect;

};
