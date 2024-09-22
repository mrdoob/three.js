import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Color } from '../../math/Color.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { hash } from '../core/NodeUtils.js';
import { shadow } from './ShadowNode.js';
import { nodeObject } from '../tsl/TSLCore.js';

class AnalyticLightNode extends LightingNode {

	static get type() {

		return 'AnalyticLightNode';

	}

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.color = new Color();
		this.colorNode = uniform( this.color ).setGroup( renderGroup );

		this.baseColorNode = null;

		this.shadowNode = null;
		this.shadowColorNode = null;

		this.isAnalyticLightNode = true;

	}

	getCacheKey() {

		return hash( super.getCacheKey(), this.light.id, this.light.castShadow ? 1 : 0 );

	}

	getHash() {

		return this.light.uuid;

	}

	setupShadow( builder ) {

		const { renderer } = builder;

		if ( renderer.shadowMap.enabled === false ) return;

		let shadowColorNode = this.shadowColorNode;

		if ( shadowColorNode === null ) {

			const customShadowNode = this.light.shadow.shadowNode;

			let shadowNode;

			if ( customShadowNode !== undefined ) {

				shadowNode = nodeObject( customShadowNode );

			} else {

				shadowNode = shadow( this.light );

			}

			this.shadowNode = shadowNode;

			this.shadowColorNode = shadowColorNode = this.colorNode.mul( shadowNode );

			this.baseColorNode = this.colorNode;

		}

		//

		this.colorNode = shadowColorNode;

	}

	setup( builder ) {

		this.colorNode = this.baseColorNode || this.colorNode;

		if ( this.light.castShadow ) {

			if ( builder.object.receiveShadow ) {

				this.setupShadow( builder );

			}

		} else if ( this.shadowNode !== null ) {

			this.shadowNode.dispose();

		}

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;
