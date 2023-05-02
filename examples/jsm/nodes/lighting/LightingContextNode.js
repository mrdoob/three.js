import ContextNode from '../core/ContextNode.js';
import { temp } from '../core/VarNode.js';
import { add } from '../math/OperatorNode.js';
import { mix } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, float, vec3 } from '../shadernode/ShaderNode.js';

class LightingContextNode extends ContextNode {

	constructor( node, lightingModelNode = null, backdropNode = null, backdropAlphaNode = null ) {

		super( node );

		this.lightingModelNode = lightingModelNode;
		this.backdropNode = backdropNode;
		this.backdropAlphaNode = backdropAlphaNode;

	}

	getNodeType( /*builder*/ ) {

		return 'vec3';

	}

	construct( builder ) {

		const { lightingModelNode, backdropNode, backdropAlphaNode } = this;

		const context = this.context = {}; // reset context
		const properties = builder.getNodeProperties( this );

		const directDiffuse = temp( vec3() ),
			directSpecular = temp( vec3() ),
			indirectDiffuse = temp( vec3() ),
			indirectSpecular = temp( vec3() );

		let totalDiffuse = add( directDiffuse, indirectDiffuse );

		if ( backdropNode !== null ) {

			totalDiffuse = vec3( backdropAlphaNode !== null ? mix( totalDiffuse, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		const totalSpecular = add( directSpecular, indirectSpecular );
		const total = add( totalDiffuse, totalSpecular );

		const reflectedLight = {
			directDiffuse,
			directSpecular,
			indirectDiffuse,
			indirectSpecular,
			total
		};

		const lighting = {
			radiance: temp( vec3() ),
			irradiance: temp( vec3() ),
			iblIrradiance: temp( vec3() ),
			ambientOcclusion: temp( float( 1 ) )
		};

		Object.assign( properties, reflectedLight, lighting );
		Object.assign( context, lighting );

		context.reflectedLight = reflectedLight;
		context.lightingModelNode = lightingModelNode || context.lightingModelNode;

		if ( lightingModelNode && lightingModelNode.indirectDiffuse ) lightingModelNode.indirectDiffuse.call( context );
		if ( lightingModelNode && lightingModelNode.indirectSpecular ) lightingModelNode.indirectSpecular.call( context );
		if ( lightingModelNode && lightingModelNode.ambientOcclusion ) lightingModelNode.ambientOcclusion.call( context );

		return super.construct( builder );

	}

	generate( builder ) {

		const { context } = this;
		const type = this.getNodeType( builder );

		super.generate( builder, type );

		return context.reflectedLight.total.build( builder, type );

	}

}

export default LightingContextNode;

export const lightingContext = nodeProxy( LightingContextNode );

addNodeElement( 'lightingContext', lightingContext );

addNodeClass( LightingContextNode );
