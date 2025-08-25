import { Vector2, TempNode } from 'three/webgpu';
import {
	nodeObject,
	Fn,
	uniform,
	convertToTexture,
	float,
	vec4,
	uv,
	NodeUpdateType,
} from 'three/tsl';

/**
 * Post processing node for applying chromatic aberration effect.
 * This effect simulates the color fringing that occurs in real camera lenses
 * by separating and offsetting the red, green, and blue channels.
 *
 * @augments TempNode
 * @three_import import { chromaticAberration } from 'three/addons/tsl/display/ChromaticAberrationNode.js';
 */
class ChromaticAberrationNode extends TempNode {

	static get type() {

		return 'ChromaticAberrationNode';

	}

	/**
	 * Constructs a new chromatic aberration node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node} strengthNode - The strength of the chromatic aberration effect as a node.
	 * @param {Node} centerNode - The center point of the effect as a node.
	 * @param {Node} scaleNode - The scale factor for stepped scaling from center as a node.
	 */
	constructor( textureNode, strengthNode, centerNode, scaleNode ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {texture}
		 */
		this.textureNode = textureNode;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * A node holding the strength of the effect.
		 *
		 * @type {Node}
		 */
		this.strengthNode = strengthNode;

		/**
		 * A node holding the center point of the effect.
		 *
		 * @type {Node}
		 */
		this.centerNode = centerNode;

		/**
		 * A node holding the scale factor for stepped scaling.
		 *
		 * @type {Node}
		 */
		this.scaleNode = scaleNode;

		/**
		 * A uniform node holding the inverse resolution value.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

	}

	/**
	 * This method is used to update the effect's uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( /* frame */ ) {

		const map = this.textureNode.value;
		this._invSize.value.set( 1 / map.image.width, 1 / map.image.height );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const textureNode = this.textureNode;
		const uvNode = textureNode.uvNode || uv();

		const ApplyChromaticAberration = Fn( ( [ uv, strength, center, scale ] ) => {

			// Calculate distance from center
			const offset = uv.sub( center );
			const distance = offset.length();

			// Create stepped scaling zones based on distance
			// Each channel gets different scaling steps
			const redScale = float( 1.0 ).add( scale.mul( 0.02 ).mul( strength ) ); // Red channel scaled outward
			const greenScale = float( 1.0 ); // Green stays at original scale
			const blueScale = float( 1.0 ).sub( scale.mul( 0.02 ).mul( strength ) ); // Blue channel scaled inward

			// Create radial distortion based on distance from center
			const aberrationStrength = strength.mul( distance );

			// Calculate scaled UV coordinates for each channel
			const redUV = center.add( offset.mul( redScale ) );
			const greenUV = center.add( offset.mul( greenScale ) );
			const blueUV = center.add( offset.mul( blueScale ) );

			// Apply additional chromatic offset based on aberration strength
			const rOffset = offset.mul( aberrationStrength ).mul( float( 0.01 ) );
			const gOffset = offset.mul( aberrationStrength ).mul( float( 0.0 ) );
			const bOffset = offset.mul( aberrationStrength ).mul( float( - 0.01 ) );

			// Final UV coordinates combining scale and chromatic aberration
			const finalRedUV = redUV.add( rOffset );
			const finalGreenUV = greenUV.add( gOffset );
			const finalBlueUV = blueUV.add( bOffset );

			// Sample texture for each channel
			const r = textureNode.sample( finalRedUV ).r;
			const g = textureNode.sample( finalGreenUV ).g;
			const b = textureNode.sample( finalBlueUV ).b;

			// Get original alpha
			const a = textureNode.sample( uv ).a;

			return vec4( r, g, b, a );

		} ).setLayout( {
			name: 'ChromaticAberrationShader',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' },
				{ name: 'strength', type: 'float' },
				{ name: 'center', type: 'vec2' },
				{ name: 'scale', type: 'float' },
				{ name: 'invSize', type: 'vec2' }
			]
		} );

		const chromaticAberrationFn = Fn( () => {

			return ApplyChromaticAberration(
				uvNode,
				this.strengthNode,
				this.centerNode,
				this.scaleNode,
				this._invSize
			);

		} );

		const outputNode = chromaticAberrationFn();

		return outputNode;

	}

}

export default ChromaticAberrationNode;

/**
 * TSL function for creating a chromatic aberration node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node|number} [strength=1.0] - The strength of the chromatic aberration effect as a node or value.
 * @param {?(Node|Vector2)} [center=null] - The center point of the effect as a node or value. If null, uses screen center (0.5, 0.5).
 * @param {Node|number} [scale=1.1] - The scale factor for stepped scaling from center as a node or value.
 * @returns {ChromaticAberrationNode}
 */
export const chromaticAberration = ( node, strength = 1.0, center = null, scale = 1.1 ) => {

	return nodeObject(
		new ChromaticAberrationNode(
			convertToTexture( node ),
			nodeObject( strength ),
			nodeObject( center ),
			nodeObject( scale )
		)
	);

};
