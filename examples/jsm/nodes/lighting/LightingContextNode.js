import ContextNode from '../core/ContextNode.js';
import { float, vec3, add, temp } from '../shadernode/ShaderNodeBaseElements.js';

class LightingContextNode extends ContextNode {

	constructor( node, lightingModelNode = null ) {

		super( node );

		this.lightingModelNode = lightingModelNode;

	}

	getNodeType( /*builder*/ ) {

		return 'vec3';

	}

	generate( builder ) {

		const { context, lightingModelNode } = this;

		if ( context.reflectedLight === undefined ) {

			const directDiffuse = temp( vec3() ),
				directSpecular = temp( vec3() ),
				indirectDiffuse = temp( vec3() ),
				indirectSpecular = temp( vec3() );

			context.reflectedLight = {
				directDiffuse,
				directSpecular,
				indirectDiffuse,
				indirectSpecular,
				total: add( directDiffuse, directSpecular, indirectDiffuse, indirectSpecular )
			};

			context.radiance = temp( vec3() );
			context.irradiance = temp( vec3() );
			context.iblIrradiance = temp( vec3() );
			context.ambientOcclusion = temp( float( 1 ) );

		}

		context.lightingModelNode = lightingModelNode || context.lightingModelNode;

		const type = this.getNodeType( builder );

		super.generate( builder, type );

		if ( lightingModelNode?.indirectDiffuse ) lightingModelNode.indirectDiffuse.call( context );
		if ( lightingModelNode?.indirectSpecular ) lightingModelNode.indirectSpecular.call( context );
		if ( lightingModelNode?.ambientOcclusion ) lightingModelNode.ambientOcclusion.call( context );

		return context.reflectedLight.total.build( builder, type );

	}

}

export default LightingContextNode;
