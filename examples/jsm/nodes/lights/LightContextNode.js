import ContextNode from '../core/ContextNode.js';
import { reflectedLight } from '../shadernode/ShaderNodeBaseElements.js';

class LightContextNode extends ContextNode {

	constructor( node, lightingModelNode = null ) {

		super( node );

		this.lightingModelNode = lightingModelNode;

	}

	getNodeType( /*builder*/ ) {

		return 'vec3';

	}

	generate( builder ) {

		const { lightingModelNode } = this;

		this.context.reflectedLight = reflectedLight();

		if ( lightingModelNode !== null ) {

			this.context.lightingModelNode = lightingModelNode;

		}

		const type = this.getNodeType( builder );

		super.generate( builder, type );

		return this.context.reflectedLight.build( builder, type );

	}

}

export default LightContextNode;
