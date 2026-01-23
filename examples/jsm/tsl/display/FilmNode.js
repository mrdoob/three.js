import { TempNode } from 'three/webgpu';
import { rand, Fn, fract, time, uv, clamp, mix, vec4, nodeProxy } from 'three/tsl';

/**
 * Post processing node for creating a film grain effect.
 *
 * @augments TempNode
 * @three_import import { film } from 'three/addons/tsl/display/FilmNode.js';
 */
class FilmNode extends TempNode {

	static get type() {

		return 'FilmNode';

	}

	/**
	 * Constructs a new film node.
	 *
	 * @param {Node} inputNode - The node that represents the input of the effect.
	 * @param {?Node<float>} [intensityNode=null] - A node that represents the effect's intensity.
	 * @param {?Node<vec2>} [uvNode=null] - A node that allows to pass custom (e.g. animated) uv data.
	 */
	constructor( inputNode, intensityNode = null, uvNode = null ) {

		super( 'vec4' );

		/**
		 * The node that represents the input of the effect.
		 *
		 * @type {Node}
		 */
		this.inputNode = inputNode;

		/**
		 * A node that represents the effect's intensity.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.intensityNode = intensityNode;

		/**
		 * A node that allows to pass custom (e.g. animated) uv data.
		 *
		 * @type {?Node<vec2>}
		 * @default null
		 */
		this.uvNode = uvNode;

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const uvNode = this.uvNode || uv();

		const film = Fn( () => {

			const base = this.inputNode.rgb;
			const noise = rand( fract( uvNode.add( time ) ) );

			let color = base.add( base.mul( clamp( noise.add( 0.1 ), 0, 1 ) ) );

			if ( this.intensityNode !== null ) {

				color = mix( base, color, this.intensityNode );

			}

			return vec4( color, this.inputNode.a );

		} );

		const outputNode = film();

		return outputNode;

	}

}

export default FilmNode;

/**
 * TSL function for creating a film node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The node that represents the input of the effect.
 * @param {?Node<float>} [intensityNode=null] - A node that represents the effect's intensity.
 * @param {?Node<vec2>} [uvNode=null] - A node that allows to pass custom (e.g. animated) uv data.
 * @returns {FilmNode}
 */
export const film = /*@__PURE__*/ nodeProxy( FilmNode );
