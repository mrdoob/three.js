import ContextNode from '../core/ContextNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy, float, vec3 } from '../shadernode/ShaderNode.js';

class LightingContextNode extends ContextNode {

	constructor( node, lightingModel = null, backdropNode = null, backdropAlphaNode = null ) {

		super( node );

		this.lightingModel = lightingModel;
		this.backdropNode = backdropNode;
		this.backdropAlphaNode = backdropAlphaNode;

		this._context = null;

	}

	getContext() {

		const { backdropNode, backdropAlphaNode } = this;

		const directDiffuse = vec3().temp( 'directDiffuse' ),
			directSpecular = vec3().temp( 'directSpecular' ),
			indirectDiffuse = vec3().temp( 'indirectDiffuse' ),
			indirectSpecular = vec3().temp( 'indirectSpecular' );

		const reflectedLight = {
			directDiffuse,
			directSpecular,
			indirectDiffuse,
			indirectSpecular
		};

		const context = {
			radiance: vec3().temp( 'radiance' ),
			irradiance: vec3().temp( 'irradiance' ),
			iblIrradiance: vec3().temp( 'iblIrradiance' ),
			ambientOcclusion: float( 1 ).temp( 'ambientOcclusion' ),
			reflectedLight,
			backdrop: backdropNode,
			backdropAlpha : backdropAlphaNode
		};

		return context;

	}

	setup( builder ) {

		this.context = this._context || ( this._context = this.getContext() );
		this.context.lightingModel = this.lightingModel || builder.context.lightingModel;

		return super.setup( builder );

	}

}

export default LightingContextNode;

export const lightingContext = nodeProxy( LightingContextNode );

addNodeElement( 'lightingContext', lightingContext );

addNodeClass( 'LightingContextNode', LightingContextNode );
