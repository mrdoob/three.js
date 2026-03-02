import Node from '../../core/Node.js';
import { NodeUpdateType } from '../../core/constants.js';
import { uniform } from '../../core/UniformNode.js';
import { renderGroup } from '../../core/UniformGroupNode.js';
import { Color } from '../../../math/Color.js';

/**
 * Batched data node for ambient lights in dynamic lighting mode.
 * Sums all ambient light colors into a single uniform vec3.
 *
 * @augments Node
 */
class AmbientLightDataNode extends Node {

	static get type() {

		return 'AmbientLightDataNode';

	}

	constructor() {

		super();

		this._color = new Color();

		this.colorNode = uniform( this._color ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

		this._lights = [];

	}

	setLights( lights ) {

		this._lights = lights;

	}

	update( /* frame */ ) {

		const lights = this._lights;

		this._color.setScalar( 0 );

		for ( let i = 0; i < lights.length; i ++ ) {

			const light = lights[ i ];
			this._color.r += light.color.r * light.intensity;
			this._color.g += light.color.g * light.intensity;
			this._color.b += light.color.b * light.intensity;

		}

	}

	setup( builder ) {

		builder.context.irradiance.addAssign( this.colorNode );

	}

}

export default AmbientLightDataNode;
