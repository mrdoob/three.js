import SpotLightNode from './SpotLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { textureSize } from '../accessors/TextureSizeNode.js';
import { float, vec2 } from '../tsl/TSLBase.js';
import { atan } from '../math/MathNode.js';
import { remap } from '../utils/Remap.js';
import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { cameraViewMatrix } from '../accessors/Camera.js';
import { Vector3 } from '../../math/Vector3.js';

// Returns the given axis of the light's local frame in view space.
const lightViewAxis = ( light, index ) => {

	const axis = uniform( new Vector3() );
	axis.setGroup( renderGroup )
		.onRenderUpdate( () => {

			axis.value.setFromMatrixColumn( light.matrixWorld, index ).normalize();

		} );

	return cameraViewMatrix.transformDirection( axis );

};

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

			const light = this.light;

			const lightDirection = this.getLightVector( builder ).normalize();
			const lightX = lightViewAxis( light, 0 );
			const lightY = lightViewAxis( light, 1 );

			this._iesTextureNode = texture( iesMap );

			// get the width of half a texel in uv
			const texelInset = float( 0.5 ).div( vec2( textureSize( this._iesTextureNode ) ) );

			// the twist angle around the light's forward axis, mapping from [0, 359]deg texels
			// offset by half a texel so we start at the center of the first texel
			const twistAngle = remap( atan( lightDirection.dot( lightY ), lightDirection.dot( lightX ) ), - Math.PI, Math.PI ).add( texelInset.y );

			// the tilt angle off the forward axis spanning from [0, 180]deg
			// inset by half a texel on each side so we're clamping to the center of the extreme texels
			const tiltAngle = remap( angleCosine.acos(), 0, Math.PI, texelInset.x, float( 1 ).sub( texelInset.x ) );

			spotAttenuation = this._iesTextureNode.sample( vec2( tiltAngle, twistAngle ) ).level( 0 ).r;

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
