import ContextNode from '../core/ContextNode.js';
import { nodeProxy, float, vec3 } from '../tsl/TSLBase.js';

/**
 * `LightingContextNode` represents an extension of the {@link ContextNode} module
 * by adding lighting specific context data. It represents the runtime context of
 * {@link LightsNode}.
 *
 * @augments ContextNode
 */
class LightingContextNode extends ContextNode {

	static get type() {

		return 'LightingContextNode';

	}

	/**
	 * Constructs a new lighting context node.
	 *
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {?LightingModel} [lightingModel=null] - The current lighting model.
	 * @param {?Node<vec3>} [backdropNode=null] - A backdrop node.
	 * @param {?Node<float>} [backdropAlphaNode=null] - A backdrop alpha node.
	 */
	constructor( lightsNode, lightingModel = null, backdropNode = null, backdropAlphaNode = null ) {

		super( lightsNode );

		/**
		 * The current lighting model.
		 *
		 * @type {?LightingModel}
		 * @default null
		 */
		this.lightingModel = lightingModel;

		/**
		 * A backdrop node.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.backdropNode = backdropNode;

		/**
		 * A backdrop alpha node.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.backdropAlphaNode = backdropAlphaNode;

		this._value = null;

	}

	/**
	 * Returns a lighting context object.
	 *
	 * @return {{
	 * radiance: Node<vec3>,
	 * irradiance: Node<vec3>,
	 * iblIrradiance: Node<vec3>,
	 * ambientOcclusion: Node<float>,
	 * reflectedLight: {directDiffuse: Node<vec3>, directSpecular: Node<vec3>, indirectDiffuse: Node<vec3>, indirectSpecular: Node<vec3>},
	 * backdrop: Node<vec3>,
	 * backdropAlpha: Node<float>
	 * }} The lighting context object.
	 */
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
