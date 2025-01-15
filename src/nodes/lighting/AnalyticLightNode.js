import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Color } from '../../math/Color.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { hash } from '../core/NodeUtils.js';
import { shadow } from './ShadowNode.js';
import { nodeObject } from '../tsl/TSLCore.js';

/**
 * Base class for analytic light nodes.
 *
 * @augments LightingNode
 */
class AnalyticLightNode extends LightingNode {

	static get type() {

		return 'AnalyticLightNode';

	}

	/**
	 * Constructs a new analytic light node.
	 *
	 * @param {Light?} [light=null] - The light source.
	 */
	constructor( light = null ) {

		super();

		/**
		 * The light source.
		 *
		 * @type {Light?}
		 * @default null
		 */
		this.light = light;

		/**
		 * The light's color value.
		 *
		 * @type {Color}
		 */
		this.color = new Color();

		/**
		 * The light's color node. Points to `colorNode` of the light source, if set. Otherwise
		 * it creates a uniform node based on {@link AnalyticLightNode#color}.
		 *
		 * @type {Node}
		 */
		this.colorNode = ( light && light.colorNode ) || uniform( this.color ).setGroup( renderGroup );

		/**
		 * This property is used to retain a reference to the original value of {@link AnalyticLightNode#colorNode}.
		 * The final color node is represented by a different node when using shadows.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.baseColorNode = null;

		/**
		 * Represents the light's shadow.
		 *
		 * @type {ShadowNode?}
   		 * @default null
		 */
		this.shadowNode = null;

		/**
		 * Represents the light's shadow color.
		 *
		 * @type {Node?}
   		 * @default null
		 */
		this.shadowColorNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isAnalyticLightNode = true;

		/**
		 * Overwritten since analytic light nodes are updated
		 * once per frame.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateType = NodeUpdateType.FRAME;

	}

	/**
	 * Overwrites the default {@link Node#customCacheKey} implementation by including the
	 * `light.id` and `light.castShadow` into the cache key.
	 *
	 * @return {Number} The custom cache key.
	 */
	customCacheKey() {

		return hash( this.light.id, this.light.castShadow ? 1 : 0 );

	}

	getHash() {

		return this.light.uuid;

	}

	/**
	 * Setups the shadow node for this light. The method exists so concrete light classes
	 * can setup different types of shadow nodes.
	 *
	 * @return {ShadowNode} The created shadow node.
	 */
	setupShadowNode() {

		return shadow( this.light );

	}

	/**
	 * Setups the shadow for this light. This method is only executed if the light
	 * cast shadows and the current build object receives shadows. It incorporates
	 * shadows into the lighting computation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
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

				shadowNode = this.setupShadowNode( builder );

			}

			this.shadowNode = shadowNode;

			this.shadowColorNode = shadowColorNode = this.colorNode.mul( shadowNode );

			this.baseColorNode = this.colorNode;

		}

		//

		this.colorNode = shadowColorNode;

	}

	/**
	 * Unlike most other nodes, lighting nodes do not return a output node in {@link Node#setup}.
	 * The main purpose of lighting nodes is to configure the current {@link LightingModel} and/or
	 * invocate the respective interface methods.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		this.colorNode = this.baseColorNode || this.colorNode;

		if ( this.light.castShadow ) {

			if ( builder.object.receiveShadow ) {

				this.setupShadow( builder );

			}

		} else if ( this.shadowNode !== null ) {

			this.shadowNode.dispose();
			this.shadowNode = null;
			this.shadowColorNode = null;

		}

	}

	/**
	 * The update method is used to update light uniforms per frame.
	 * Potentially overwritten in concrete light nodes to update light
	 * specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;
