import AnalyticLightNode from './AnalyticLightNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix, atan, cross } from '../math/MathNode.js';
import { vec2 } from '../tsl/TSLBase.js';
import { normalWorld } from '../accessors/Normal.js';
import { lightPosition } from '../accessors/Lights.js';
import { renderGroup } from '../core/UniformGroupNode.js';

import { Color } from '../../math/Color.js';

/**
 * Module for representing hemisphere lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class HemisphereLightNode extends AnalyticLightNode {

	static get type() {

		return 'HemisphereLightNode';

	}

	/**
	 * Constructs a new hemisphere light node.
	 *
	 * @param {?HemisphereLight} [light=null] - The hemisphere light source.
	 */
	constructor( light = null ) {

		super( light );

		/**
		 * Uniform node representing the light's position.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.lightPositionNode = lightPosition( light );

		/**
		 * A node representing the light's direction.
		 *
		 * @type {Node<vec3>}
		 */
		this.lightDirectionNode = this.lightPositionNode.normalize();

		/**
		 * Uniform node representing the light's ground color.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.groundColorNode = uniform( new Color() ).setGroup( renderGroup );

	}

	/**
	 * Overwritten to updated hemisphere light specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.lightPositionNode.object3d = light;

		this.groundColorNode.value.copy( light.groundColor ).multiplyScalar( light.intensity );

	}

	setup( builder ) {

		const { colorNode, groundColorNode, lightDirectionNode } = this;

		const dotNL = normalWorld.dot( lightDirectionNode );
		const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

		const irradiance = mix( groundColorNode, colorNode, hemiDiffuseWeight );

		builder.context.irradiance.addAssign( irradiance );

		const radianceAt = ( direction, roughness, normal ) => {

			// GGX prefiltering of a sharp sky/ground horizon: Student-t marginal at low roughness, cosine irradiance at roughness = 1
			const alpha = roughness.pow2();
			const t = alpha.mul( 2.0 ).div( alpha.add( 1.0 ) );
			const dotRL = direction.dot( lightDirectionNode );

			// Box filtered over the pixel footprint, so the horizon doesn't alias on smooth surfaces
			const pixelHalfWidth = vec2( dotRL.dFdx(), dotRL.dFdy() ).length().mul( 0.5 );
			const lobeWidth2 = t.pow2().mul( dotRL.pow2().oneMinus() );
			const skyWeight = dotRL.div( dotRL.add( pixelHalfWidth ).pow2().add( lobeWidth2 ).sqrt().add( dotRL.sub( pixelHalfWidth ).pow2().add( lobeWidth2 ).sqrt() ).max( 2e-4 ) ).add( 0.5 ).saturate();

			// That lobe is a cosine lobe around the direction stretched by t. Remove the sky it reaches behind the surface, which the surface can't see,
			// and renormalize to the visible part. Lambert's polygon formula gives the lobe over both half spaces in closed form
			const skyAxis = lightDirectionNode.mul( t ).add( direction.mul( t.oneMinus().mul( dotRL ) ) ).normalize();
			const behindAxis = normal.mul( t ).add( direction.mul( t.oneMinus().mul( direction.dot( normal ) ) ) ).normalize().negate();
			const a = skyAxis.dot( direction );
			const b = behindAxis.dot( direction );
			const ab = skyAxis.dot( behindAxis );
			const det = direction.dot( cross( skyAxis, behindAxis ) ).abs().max( 1e-4 );
			const skyFraction = a.mul( 0.5 ).add( 0.5 );
			const behindFraction = b.mul( 0.5 ).add( 0.5 );
			const behindSky = atan( det, a.mul( b ).sub( ab ) ).add( a.mul( atan( det, ab.mul( a ).sub( b ) ) ) ).add( b.mul( atan( det, ab.mul( b ).sub( a ) ) ) ).div( 2 * Math.PI )
				.clamp( skyFraction.add( behindFraction ).sub( 1.0 ).max( 0.0 ), skyFraction.min( behindFraction ) );

			const hemiSpecularWeight = skyWeight.sub( behindSky ).div( behindFraction.oneMinus().max( 1e-4 ) ).saturate();

			return mix( groundColorNode, colorNode, hemiSpecularWeight ).div( Math.PI );

		};

		builder.context.lightingModel.indirectRadiance( radianceAt, builder );

	}

}

export default HemisphereLightNode;
