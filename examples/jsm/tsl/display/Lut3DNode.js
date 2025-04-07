import { TempNode } from 'three/webgpu';
import { nodeObject, Fn, float, uniform, vec3, vec4, mix } from 'three/tsl';

/**
 * A post processing node for color grading via lookup tables.
 *
 * @augments TempNode
 * @three_import import { lut3D } from 'three/addons/tsl/display/Lut3DNode.js';
 */
class Lut3DNode extends TempNode {

	static get type() {

		return 'Lut3DNode';

	}

	/**
	 * Constructs a new LUT node.
	 *
	 * @param {Node} inputNode - The node that represents the input of the effect.
	 * @param {TextureNode} lutNode - A texture node that represents the lookup table.
	 * @param {number} size - The size of the lookup table.
	 * @param {Node<float>} intensityNode - Controls the intensity of the effect.
	 */
	constructor( inputNode, lutNode, size, intensityNode ) {

		super( 'vec4' );

		/**
		 * The node that represents the input of the effect.
		 *
		 * @type {Node}
		 */
		this.inputNode = inputNode;

		/**
		 * A texture node that represents the lookup table.
		 *
		 * @type {TextureNode}
		 */
		this.lutNode = lutNode;

		/**
		 * The size of the lookup table.
		 *
		 * @type {UniformNode<float>}
		 */
		this.size = uniform( size );

		/**
		 * Controls the intensity of the effect.
		 *
		 * @type {Node<float>}
		 */
		this.intensityNode = intensityNode;

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup() {

		const { inputNode, lutNode } = this;

		const sampleLut = ( uv ) => lutNode.sample( uv );

		const lut3D = Fn( () => {

			const base = inputNode;

			// pull the sample in by half a pixel so the sample begins at the center of the edge pixels.

			const pixelWidth = float( 1.0 ).div( this.size );
			const halfPixelWidth = float( 0.5 ).div( this.size );
			const uvw = vec3( halfPixelWidth ).add( base.rgb.mul( float( 1.0 ).sub( pixelWidth ) ) );

			const lutValue = vec4( sampleLut( uvw ).rgb, base.a );

			return vec4( mix( base, lutValue, this.intensityNode ) );

		} );

		const outputNode = lut3D();

		return outputNode;

	}

}

export default Lut3DNode;

/**
 * TSL function for creating a LUT node for color grading via post processing.
 *
 * @tsl
 * @function
 * @param {Node} node - The node that represents the input of the effect.
 * @param {TextureNode} lut - A texture node that represents the lookup table.
 * @param {number} size - The size of the lookup table.
 * @param {Node<float> | number} intensity - Controls the intensity of the effect.
 * @returns {Lut3DNode}
 */
export const lut3D = ( node, lut, size, intensity ) => nodeObject( new Lut3DNode( nodeObject( node ), nodeObject( lut ), size, nodeObject( intensity ) ) );
