import AnalyticLightNode from './AnalyticLightNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
import { normalView } from '../accessors/Normal.js';
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

		const dotNL = normalView.dot( lightDirectionNode );
		const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

		const irradiance = mix( groundColorNode, colorNode, hemiDiffuseWeight );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export default HemisphereLightNode;
