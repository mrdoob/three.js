import { Color, Node } from 'three/webgpu';
import { NodeUpdateType, renderGroup, uniform } from 'three/tsl';

/**
 * Batched data node for ambient lights in dynamic lighting mode.
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
		this._lights = [];

		this.colorNode = uniform( this._color ).setGroup( renderGroup );
		this.updateType = NodeUpdateType.RENDER;

	}

	setLights( lights ) {

		this._lights = lights;

		return this;

	}

	update() {

		this._color.setScalar( 0 );

		for ( let i = 0; i < this._lights.length; i ++ ) {

			const light = this._lights[ i ];

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
