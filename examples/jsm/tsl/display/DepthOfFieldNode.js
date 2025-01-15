import { TempNode, NodeUpdateType } from 'three/webgpu';
import { convertToTexture, nodeObject, Fn, uv, uniform, vec2, vec4, clamp } from 'three/tsl';

/** @module DepthOfFieldNode **/

/**
 * Post processing node for creating depth of field (DOF) effect.
 *
 * @augments TempNode
 */
class DepthOfFieldNode extends TempNode {

	static get type() {

		return 'DepthOfFieldNode';

	}

	/**
	 * Constructs a new DOF node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} viewZNode - Represents the viewZ depth values of the scene.
	 * @param {Node<float>} focusNode - Defines the effect's focus which is the distance along the camera's look direction in world units.
	 * @param {Node<float>} apertureNode - Defines the effect's aperture.
	 * @param {Node<float>} maxblurNode - Defines the effect's maximum blur.
	 */
	constructor( textureNode, viewZNode, focusNode, apertureNode, maxblurNode ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * Represents the viewZ depth values of the scene.
		 *
		 * @type {Node<float>}
		 */
		this.viewZNode = viewZNode;

		/**
		 * Defines the effect's focus which is the distance along the camera's look direction in world units.
		 *
		 * @type {Node<float>}
		 */
		this.focusNode = focusNode;

		/**
		 * Defines the effect's aperture.
		 *
		 * @type {Node<float>}
		 */
		this.apertureNode = apertureNode;

		/**
		 * Defines the effect's maximum blur.
		 *
		 * @type {Node<float>}
		 */
		this.maxblurNode = maxblurNode;

		/**
		 * Represents the input's aspect ratio.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._aspect = uniform( 0 );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * This method is used to update the effect's uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore() {

		const map = this.textureNode.value;

		this._aspect.value = map.image.width / map.image.height;

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup() {

		const textureNode = this.textureNode;
		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.sample( uv );

		const dof = Fn( () => {

			const aspectcorrect = vec2( 1.0, this._aspect );

			const factor = this.focusNode.add( this.viewZNode );

			const dofblur = vec2( clamp( factor.mul( this.apertureNode ), this.maxblurNode.negate(), this.maxblurNode ) );

			const dofblur9 = dofblur.mul( 0.9 );
			const dofblur7 = dofblur.mul( 0.7 );
			const dofblur4 = dofblur.mul( 0.4 );

			let col = vec4( 0.0 );

			col = col.add( sampleTexture( uvNode ) );

			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.40, 0.0 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.15, 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.37, 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.37, - 0.15 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.15, - 0.37 ).mul( aspectcorrect ).mul( dofblur9 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.40, 0.0 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur7 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, - 0.4 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.4, 0.0 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( - 0.29, - 0.29 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );
			col = col.add( sampleTexture( uvNode.add( vec2( 0.0, 0.4 ).mul( aspectcorrect ).mul( dofblur4 ) ) ) );

			col = col.div( 41 );
			col.a = 1;

			return vec4( col );


		} );

		const outputNode = dof();

		return outputNode;

	}

}

export default DepthOfFieldNode;

/**
 * TSL function for creating a depth-of-field effect (DOF) for post processing.
 *
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<float>} viewZNode - Represents the viewZ depth values of the scene.
 * @param {Node<float> | Number} focus - Defines the effect's focus which is the distance along the camera's look direction in world units.
 * @param {Node<float> | Number} aperture - Defines the effect's aperture.
 * @param {Node<float> | Number} maxblur - Defines the effect's maximum blur.
 * @returns {DepthOfFieldNode}
 */
export const dof = ( node, viewZNode, focus = 1, aperture = 0.025, maxblur = 1 ) => nodeObject( new DepthOfFieldNode( convertToTexture( node ), nodeObject( viewZNode ), nodeObject( focus ), nodeObject( aperture ), nodeObject( maxblur ) ) );
