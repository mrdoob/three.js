import { TempNode } from 'three/webgpu';
import { Fn, uv, uniform, vec2, sin, cos, vec4, convertToTexture } from 'three/tsl';

/**
 * Post processing node for shifting/splitting RGB color channels. The effect
 * separates color channels and offsets them from each other.
 *
 * @augments TempNode
 * @three_import import { rgbShift } from 'three/addons/tsl/display/RGBShiftNode.js';
 */
class RGBShiftNode extends TempNode {

	static get type() {

		return 'RGBShiftNode';

	}

	/**
	 * Constructs a new RGB shift node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {number} [amount=0.005] - The amount of the RGB shift.
	 * @param {number} [angle=0] - Defines the orientation in which colors are shifted.
	 */
	constructor( textureNode, amount = 0.005, angle = 0 ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The amount of the RGB shift.
		 *
		 * @type {UniformNode<float>}
		 */
		this.amount = uniform( amount );

		/**
		 * Defines in which direction colors are shifted.
		 *
		 * @type {UniformNode<float>}
		 */
		this.angle = uniform( angle );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.sample( uv );

		const rgbShift = Fn( () => {

			const offset = vec2( cos( this.angle ), sin( this.angle ) ).mul( this.amount );
			const cr = sampleTexture( uvNode.add( offset ) );
			const cga = sampleTexture( uvNode );
			const cb = sampleTexture( uvNode.sub( offset ) );

			return vec4( cr.r, cga.g, cb.b, cga.a );

		} );

		return rgbShift();

	}

}

export default RGBShiftNode;

/**
 * TSL function for creating a RGB shift or split effect for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {number} [amount=0.005] - The amount of the RGB shift.
 * @param {number} [angle=0] - Defines in which direction colors are shifted.
 * @returns {RGBShiftNode}
 */
export const rgbShift = ( node, amount, angle ) => new RGBShiftNode( convertToTexture( node ), amount, angle );
