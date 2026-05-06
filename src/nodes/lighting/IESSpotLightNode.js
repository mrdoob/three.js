import SpotLightNode from './SpotLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { vec2 } from '../tsl/TSLBase.js';

/**
 * An IES version of the default spot light node.
 *
 * @augments SpotLightNode
 */
class IESSpotLightNode extends SpotLightNode {

	static get type() {

		return 'IESSpotLightNode';

	}

	/**
	 * Constructs a new IES spot light node.
	 *
	 * @param {?SpotLight} [light=null] - The spot light source.
	 */
	constructor( light = null ) {

		super( light );

		/**
		 * The texture node representing the IES texture.
		 *
		 * @type {?TextureNode}
		 * @default null
		 */
		this._iesTextureNode = null;

	}

	/**
	 * Overwrites the default implementation to compute an IES conform spot attenuation.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {Node<float>} angleCosine - The angle to compute the spot attenuation for.
	 * @return {Node<float>} The spot attenuation.
	 */
	getSpotAttenuation( builder, angleCosine ) {

		const iesMap = this.light.iesMap;

		let spotAttenuation = null;

		if ( iesMap && iesMap.isTexture === true ) {

			const angle = angleCosine.acos().mul( 1.0 / Math.PI );

			this._iesTextureNode = texture( iesMap, vec2( angle, 0 ), 0 );

			spotAttenuation = this._iesTextureNode.r;

		} else {

			spotAttenuation = super.getSpotAttenuation( builder, angleCosine );

		}

		return spotAttenuation;

	}

	/**
	 * Overwritten to update the IES spot light texture.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		super.update( frame );

		if ( this._iesTextureNode !== null && this.light.iesMap ) {

			this._iesTextureNode.value = this.light.iesMap;

		}

	}

}

export default IESSpotLightNode;
