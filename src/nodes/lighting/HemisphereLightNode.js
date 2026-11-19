import AnalyticLightNode from './AnalyticLightNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
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

		const radianceAt = ( direction, roughness ) => {

			// GGX prefiltering of a sharp sky/ground horizon: Student-t marginal at low roughness, cosine irradiance at roughness = 1
			const alpha = roughness.pow2();
			const t = alpha.mul( 2.0 ).div( alpha.add( 1.0 ) );
			const dotRL = direction.dot( lightDirectionNode ).toConst();
			const hemiSpecularWeight = dotRL.mul( mix( t.pow2(), 1.0, dotRL.pow2() ).max( 1e-8 ).inverseSqrt() ).mul( 0.5 ).add( 0.5 );

			return mix( groundColorNode, colorNode, hemiSpecularWeight );

		};

		builder.context.lightingModel.indirectRadiance( radianceAt, builder );

	}

}

export default HemisphereLightNode;
