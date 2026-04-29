import SpotLightNode from './SpotLightNode.js';
import TextureNode, { texture } from '../accessors/TextureNode.js';
import { vec2 } from '../tsl/TSLBase.js';

/**
 * Internal TextureNode subclass whose uniform hash is scoped to the owning
 * light. The default hash is `value.uuid`, which would dedupe iesMap bindings
 * across lights that share the same texture and prevent per-light runtime
 * swaps from taking effect.
 *
 * @augments TextureNode
 */
class IESTextureNode extends TextureNode {

	static get type() {

		return 'IESTextureNode';

	}

	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value, uvNode, levelNode, biasNode );

		this._lightId = null;

	}

	getUniformHash( /*builder*/ ) {

		return `${ this._lightId }_${ this.value.uuid }`;

	}

	clone() {

		const cloned = super.clone();
		cloned._lightId = this._lightId;
		return cloned;

	}

}

/**
 * An IES version of the default spot light node.
 *
 * @augments SpotLightNode
 */
class IESSpotLightNode extends SpotLightNode {

	static get type() {

		return 'IESSpotLightNode';

	}

	constructor( light = null ) {

		super( light );

		/**
		 * Cached IES texture node. Its `value` is synced to `light.iesMap` in
		 * `update()` so a runtime swap rebinds the texture without recompiling
		 * the shader.
		 *
		 * @type {?IESTextureNode}
		 * @default null
		 */
		this.iesMapNode = null;

	}

	update( frame ) {

		super.update( frame );

		// Only sync when iesMap is truthy: the shader branch was selected at
		// build time, so a light built with an IES map cannot drop back to the
		// non-IES path without being recreated.
		if ( this.iesMapNode !== null && this.light.iesMap ) {

			this.iesMapNode.value = this.light.iesMap;

		}

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

			if ( this.iesMapNode === null ) {

				this.iesMapNode = new IESTextureNode( iesMap );
				this.iesMapNode._lightId = this.light.id;

			}

			const angle = angleCosine.acos().mul( 1.0 / Math.PI );
			const iesSample = texture( this.iesMapNode, vec2( angle, 0 ), 0 );

			iesSample.setUpdateMatrix( false );

			spotAttenuation = iesSample.r;

		} else {

			spotAttenuation = super.getSpotAttenuation( builder, angleCosine );

		}

		return spotAttenuation;

	}

}

export default IESSpotLightNode;
