import Node from '../core/Node.js';
import { nodeObject, vec3 } from '../tsl/TSLBase.js';
import { hashArray } from '../core/NodeUtils.js';

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

const getLightNodeById = ( id, lightNodes ) => {

	for ( const lightNode of lightNodes ) {

		if ( lightNode.isAnalyticLightNode && lightNode.light.id === id ) {

			return lightNode;

		}

	}

	return null;

};

const _lightsNodeRef = /*@__PURE__*/ new WeakMap();

/**
 * This node represents the scene's lighting and manages the lighting model's life cycle
 * for the current build 3D object. It is responsible for computing the total outgoing
 * light in a given lighting context.
 *
 * @augments Node
 */
class LightsNode extends Node {

	static get type() {

		return 'LightsNode';

	}

	/**
	 * Constructs a new lights node.
	 */
	constructor() {

		super( 'vec3' );

		/**
		 * A node representing the total diffuse light.
		 *
		 * @type {Node<vec3>}
		 */
		this.totalDiffuseNode = vec3().toVar();

		/**
		 * A node representing the total specular light.
		 *
		 * @type {Node<vec3>}
		 */
		this.totalSpecularNode = vec3().toVar();

		/**
		 * A node representing the outgoing light.
		 *
		 * @type {Node<vec3>}
		 */
		this.outgoingLightNode = vec3().toVar();

		/**
		 * An array representing the lights in the scene.
		 *
		 * @private
		 * @type {Array<Light>}
		 */
		this._lights = [];

		/**
		 * For each light in the scene, this node will create a
		 * corresponding light node.
		 *
		 * @private
		 * @type {?Array<LightingNode>}
		 * @default null
		 */
		this._lightNodes = null;

		/**
		 * A hash for identifying the current light nodes setup.
		 *
		 * @private
		 * @type {?string}
		 * @default null
		 */
		this._lightNodesHash = null;

		/**
		 * `LightsNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

	}

	/**
	 * Overwrites the default {@link Node#customCacheKey} implementation by including the
	 * light IDs into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		const lightIDs = [];
		const lights = this._lights;

		for ( let i = 0; i < lights.length; i ++ ) {

			lightIDs.push( lights[ i ].id );

		}

		return hashArray( lightIDs );

	}

	/**
	 * Computes a hash value for identifying the current light nodes setup.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {string} The computed hash.
	 */
	getHash( builder ) {

		if ( this._lightNodesHash === null ) {

			if ( this._lightNodes === null ) this.setupLightsNode( builder );

			const hash = [];

			for ( const lightNode of this._lightNodes ) {

				hash.push( lightNode.getSelf().getHash() );

			}

			this._lightNodesHash = 'lights-' + hash.join( ',' );

		}

		return this._lightNodesHash;

	}

	analyze( builder ) {

		const properties = builder.getDataFromNode( this );

		for ( const node of properties.nodes ) {

			node.build( builder );

		}

	}

	/**
	 * Creates lighting nodes for each scene light. This makes it possible to further
	 * process lights in the node system.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 */
	setupLightsNode( builder ) {

		const lightNodes = [];

		const previousLightNodes = this._lightNodes;

		const lights = sortLights( this._lights );
		const nodeLibrary = builder.renderer.library;

		for ( const light of lights ) {

			if ( light.isNode ) {

				lightNodes.push( nodeObject( light ) );

			} else {

				let lightNode = null;

				if ( previousLightNodes !== null ) {

					lightNode = getLightNodeById( light.id, previousLightNodes ); // reuse existing light node

				}

				if ( lightNode === null ) {

					// find the corresponding node type for a given light

					const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

					if ( lightNodeClass === null ) {

						console.warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					let lightNode = null;

					if ( ! _lightsNodeRef.has( light ) ) {

						lightNode = nodeObject( new lightNodeClass( light ) );
						_lightsNodeRef.set( light, lightNode );

					} else {

						lightNode = _lightsNodeRef.get( light );

					}

					lightNodes.push( lightNode );

				}

			}

		}

		this._lightNodes = lightNodes;

	}

	/**
	 * Sets up a direct light in the lighting model.
	 *
	 * @param {Object} builder - The builder object containing the context and stack.
	 * @param {Object} lightNode - The light node.
	 * @param {Object} lightData - The light object containing color and direction properties.
	 */
	setupDirectLight( builder, lightNode, lightData ) {

		const { lightingModel, reflectedLight } = builder.context;

		lightingModel.direct( {
			...lightData,
			lightNode,
			reflectedLight
		}, builder );

	}

	setupDirectRectAreaLight( builder, lightNode, lightData ) {

		const { lightingModel, reflectedLight } = builder.context;

		lightingModel.directRectArea( {
			...lightData,
			lightNode,
			reflectedLight
		}, builder );

	}

	/**
	 * Setups the internal lights by building all respective
	 * light nodes.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Array<LightingNode>} lightNodes - An array of lighting nodes.
	 */
	setupLights( builder, lightNodes ) {

		for ( const lightNode of lightNodes ) {

			lightNode.build( builder );

		}

	}

	getLightNodes( builder ) {

		if ( this._lightNodes === null ) this.setupLightsNode( builder );

		return this._lightNodes;

	}

	/**
	 * The implementation makes sure that for each light in the scene
	 * there is a corresponding light node. By building the light nodes
	 * and evaluating the lighting model the outgoing light is computed.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Node<vec3>} A node representing the outgoing light.
	 */
	setup( builder ) {

		const currentLightsNode = builder.lightsNode;

		builder.lightsNode = this;

		//

		let outgoingLightNode = this.outgoingLightNode;

		const context = builder.context;
		const lightingModel = context.lightingModel;

		const properties = builder.getDataFromNode( this );

		if ( lightingModel ) {

			const { totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			//

			properties.nodes = stack.nodes;

			//

			lightingModel.start( builder );

			//

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				if ( backdropAlpha !== null ) {

					totalDiffuse = vec3( backdropAlpha.mix( totalDiffuse, backdrop ) );

				} else {

					totalDiffuse = vec3( backdrop );

				}

				context.material.transparent = true;

			}

			totalDiffuseNode.assign( totalDiffuse );
			totalSpecularNode.assign( directSpecular.add( indirectSpecular ) );

			outgoingLightNode.assign( totalDiffuseNode.add( totalSpecularNode ) );

			//

			lightingModel.finish( builder );

			//

			outgoingLightNode = outgoingLightNode.bypass( builder.removeStack() );

		} else {

			properties.nodes = [];

		}

		//

		builder.lightsNode = currentLightsNode;

		return outgoingLightNode;

	}

	/**
	 * Configures this node with an array of lights.
	 *
	 * @param {Array<Light>} lights - An array of lights.
	 * @return {LightsNode} A reference to this node.
	 */
	setLights( lights ) {

		this._lights = lights;

		this._lightNodes = null;
		this._lightNodesHash = null;

		return this;

	}

	/**
	 * Returns an array of the scene's lights.
	 *
	 * @return {Array<Light>} The scene's lights.
	 */
	getLights() {

		return this._lights;

	}

	/**
	 * Whether the scene has lights or not.
	 *
	 * @type {boolean}
	 */
	get hasLights() {

		return this._lights.length > 0;

	}

}

export default LightsNode;

/**
 * TSL function for creating an instance of `LightsNode` and configuring
 * it with the given array of lights.
 *
 * @tsl
 * @function
 * @param {Array<Light>} lights - An array of lights.
 * @return {LightsNode} The created lights node.
 */
export const lights = ( lights = [] ) => nodeObject( new LightsNode() ).setLights( lights );
