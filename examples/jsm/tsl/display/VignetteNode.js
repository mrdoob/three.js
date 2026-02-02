import { TempNode } from 'three/webgpu';
import {
	nodeObject,
	Fn,
	convertToTexture,
	vec2,
	vec4,
	uv,
	distance,
	smoothstep,
} from 'three/tsl';

/**
 * Post processing node for applying a vignette effect.
 *
 * @augments TempNode
 * @three_import import { vignette } from 'three/addons/tsl/display/VignetteNode.js';
 */
class VignetteNode extends TempNode {

	static get type() {

		return 'VignetteNode';

	}

	/**
	 * Constructs a new vignette node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node} sizeNode - The size of the vignette effect as a node.
	 * @param {Node} smoothnessNode - The smoothness of the vignette effect as a node.
	 */
	constructor( textureNode, sizeNode, smoothnessNode ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {texture}
		 */
		this.textureNode = textureNode;

		/**
		 * A node holding the size of the effect.
		 *
		 * @type {Node}
		 */
		this.sizeNode = sizeNode;

		/**
		 * A node holding the smoothness of the effect.
		 *
		 * @type {Node}
		 */
		this.smoothnessNode = smoothnessNode;

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

		const ApplyVignette = Fn( ( [ uv, size, smoothness ] ) => {

			const diffuse = textureNode.sample( uv );

			const distanceToCenter = distance( uv, vec2( 0.5 ) ).mul( size );

			const smoothnessStep = vec2( 0.5, 0.5 );

			smoothnessStep.x = smoothnessStep.x.add( smoothness );
			smoothnessStep.y = smoothnessStep.y.sub( smoothness );

			// Add small epsilon to prevent smoothstep(0.5, 0.5, distanceToCenter) when smoothness is 0
			const finalColor = vec4(
				diffuse.rgb.mul(
					smoothstep(
						smoothnessStep.x.add( 0.001 ),
						smoothnessStep.y.sub( 0.001 ),
						distanceToCenter,
					),
				),
				diffuse.a,
			);

			return finalColor;

		} ).setLayout( {
			name: 'VignetteShader',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' },
				{ name: 'size', type: 'float' },
				{ name: 'smoothness', type: 'float' },
			],
		} );

		const vignetteFn = Fn( () => {

			return ApplyVignette( uvNode, this.sizeNode, this.smoothnessNode );

		} );

		const outputNode = vignetteFn();

		return outputNode;

	}

}

export default VignetteNode;

/**
 * TSL function for creating a vignette node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node|number} [size=1.0] - The size of the vignette effect as a node or value.
 * @param {Node|number} [smoothness=0.2] - The smoothness of the vignette effect as a node or value.
 * @returns {VignetteNode}
 */
export const vignette = ( node, size = 1, smoothness = 0.2 ) => {

	return nodeObject(
		new VignetteNode(
			convertToTexture( node ),
			nodeObject( size ),
			nodeObject( smoothness ),
		),
	);

};
