import ContextNode from '../core/ContextNode.js';
import { nodeProxy, float, vec3 } from '../tsl/TSLBase.js';

class LightingContextNode extends ContextNode {

	static get type() {

		return 'LightingContextNode';

	}

	constructor( node, lightingModel = null, backdropNode = null, backdropAlphaNode = null ) {

		super( node );

		this.lightingModel = lightingModel;
		this.backdropNode = backdropNode;
		this.backdropAlphaNode = backdropAlphaNode;

		this._value = null;

	}

	getContext() {

		const { backdropNode, backdropAlphaNode } = this;

		const directDiffuse = vec3().toVar( 'directDiffuse' ),
			directSpecular = vec3().toVar( 'directSpecular' ),
			indirectDiffuse = vec3().toVar( 'indirectDiffuse' ),
			indirectSpecular = vec3().toVar( 'indirectSpecular' );

		const reflectedLight = {
			directDiffuse,
			directSpecular,
			indirectDiffuse,
			indirectSpecular
		};

		const context = {
			radiance: vec3().toVar( 'radiance' ),
			irradiance: vec3().toVar( 'irradiance' ),
			iblIrradiance: vec3().toVar( 'iblIrradiance' ),
			ambientOcclusion: float( 1 ).toVar( 'ambientOcclusion' ),
			reflectedLight,
			backdrop: backdropNode,
			backdropAlpha: backdropAlphaNode
		};

		return context;

	}

	setup( builder ) {

		this.value = this._value || ( this._value = this.getContext() );
		this.value.lightingModel = this.lightingModel || builder.context.lightingModel;

		return super.setup( builder );

	}

}

export default LightingContextNode;

export const lightingContext = /*@__PURE__*/ nodeProxy( LightingContextNode );
