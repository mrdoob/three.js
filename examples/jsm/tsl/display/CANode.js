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
	 * @param {number} [strength=1.0] - The strength of the chromatic aberration effect.
	 * @param {Vector2} [center=null] - The center point of the effect. If null, uses screen center (0.5, 0.5).
	 * @param {number} [scale=1.0] - The scale factor for stepped scaling from center.
	 */
	constructor( textureNode, strength = 1.0, center = null, scale = 1.0 ) {

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
		 * A uniform node holding the strength of the effect.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._strength = uniform( strength );

		/**
		 * A uniform node holding the center point of the effect.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._center = uniform( center || new Vector2( 0.5, 0.5 ) );

		/**
		 * A uniform node holding the scale factor for stepped scaling.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._scale = uniform( scale );

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
				this._strength,
				this._center,
				this._scale,
				this._invSize
			);

		} );

		const outputNode = chromaticAberrationFn();

		return outputNode;

	}

	/**
	 * Sets the strength of the chromatic aberration effect.
	 *
	 * @param {number} value - The strength value.
	 * @return {ChromaticAberrationNode}
	 */
	setStrength( value ) {

		this._strength.value = value;
		return this;

	}

	/**
	 * Sets the center point of the chromatic aberration effect.
	 *
	 * @param {Vector2} value - The center point.
	 * @return {ChromaticAberrationNode}
	 */
	setCenter( value ) {

		this._center.value.copy( value );
		return this;

	}

	/**
	 * Sets the scale factor for the chromatic aberration effect.
	 *
	 * @param {number} value - The scale value.
	 * @return {ChromaticAberrationNode}
	 */
	setScale( value ) {

		this._scale.value = value;
		return this;

	}

	/**
	 * Gets the strength of the chromatic aberration effect.
	 *
	 * @return {number}
	 */
	get strength() {

		return this._strength.value;

	}

	/**
	 * Sets the strength of the chromatic aberration effect.
	 *
	 * @param {number} value - The strength value.
	 */
	set strength( value ) {

		this._strength.value = value;

	}

	/**
	 * Gets the center point of the chromatic aberration effect.
	 *
	 * @return {Vector2}
	 */
	get center() {

		return this._center.value;

	}

	/**
	 * Sets the center point of the chromatic aberration effect.
	 *
	 * @param {Vector2} value - The center point.
	 */
	set center( value ) {

		this._center.value.copy( value );

	}

	/**
	 * Gets the scale factor of the chromatic aberration effect.
	 *
	 * @return {number}
	 */
	get scale() {

		return this._scale.value;

	}

	/**
	 * Sets the scale factor of the chromatic aberration effect.
	 *
	 * @param {number} value - The scale value.
	 */
	set scale( value ) {

		this._scale.value = value;

	}

}

export default ChromaticAberrationNode;

/**
 * TSL function for creating a chromatic aberration node for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {number} [strength=1.0] - The strength of the chromatic aberration effect.
 * @param {Vector2} [center=null] - The center point of the effect. If null, uses screen center (0.5, 0.5).
 * @param {number} [scale=1.0] - The scale factor for stepped scaling from center.
 * @returns {ChromaticAberrationNode}
 */
export const chromaticAberration = ( node, strength = 1.0, center = null, scale = 1.1 ) =>
	nodeObject(
		new ChromaticAberrationNode(
			convertToTexture( node ),
			strength, center, scale
		)
	);
