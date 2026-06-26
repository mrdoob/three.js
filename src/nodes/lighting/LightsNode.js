import Node from '../core/Node.js';
import { property, vec3 } from '../tsl/TSLBase.js';
import { hashArray } from '../core/NodeUtils.js';
import { warn } from '../../utils.js';

/**
 * A node representing the total diffuse light.
 *
 * @type {Node<vec3>}
 */
const totalDiffuse = property( 'vec3', 'totalDiffuse' );

/**
 * A node representing the total specular light.
 *
 * @type {Node<vec3>}
 */
const totalSpecular = property( 'vec3', 'totalSpecular' );

/**
 * A node representing the outgoing light.
 *
 * @type {Node<vec3>}
 */
const outgoingLight = property( 'vec3', 'outgoingLight' );

/**
 * Sorts an array of lights in ascending order by their IDs.
 *
 * @private
 * @param {Array<Light>} lights - The array of lights to sort.
 * @return {Array<Light>} The sorted array of lights.
 */
const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

/**
 * Finds and returns a lighting node associated with a specific light ID.
 *
 * @private
 * @param {number} id - The ID of the light to search for.
 * @param {Array<LightingNode>} lightNodes - The array of lighting nodes to search within.
 * @return {?LightingNode} The matching lighting node, or null if not found.
 */
const getLightNodeById = ( id, lightNodes ) => {

	for ( const lightNode of lightNodes ) {

		if ( lightNode.isAnalyticLightNode && lightNode.light.id === id ) {

			return lightNode;

		}

	}

	return null;

};

/**
 * WeakMap cache mapping light objects to their corresponding lighting node instances.
 *
 * @private
 * @type {WeakMap<Light, LightingNode>}
 */
const _lightsNodeRef = /*@__PURE__*/ new WeakMap();

/**
 * Array used to temporarily store light IDs and shadow casting states for hashing.
 *
 * @private
 * @type {Array<number>}
 */
const _hashData = [];

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
		this.totalDiffuseNode = totalDiffuse;

		/**
		 * A node representing the total specular light.
		 *
		 * @type {Node<vec3>}
		 */
		this.totalSpecularNode = totalSpecular;

		/**
		 * A node representing the outgoing light.
		 *
		 * @type {Node<vec3>}
		 */
		this.outgoingLightNode = outgoingLight;

		/**
		 * An array representing the lights in the scene.
		 *
		 * @private
		 * @type {Array<Light>}
		 */
		this._lights = [];

		/**
		 * `LightsNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

	}

	/**
	 * Overwrites the default {@link Node#customCacheKey} implementation by including
	 * light data into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		const lights = this._lights;

		for ( let i = 0; i < lights.length; i ++ ) {

			const light = lights[ i ];

			_hashData.push( light.id );
			_hashData.push( light.castShadow ? 1 : 0 );

			if ( light.isSpotLight === true ) {

				const hashMap = ( light.map !== null ) ? light.map.id : - 1;
				const hashColorNode = ( light.colorNode ) ? light.colorNode.getCacheKey() : - 1;

				_hashData.push( hashMap, hashColorNode );

			}

		}

		const cacheKey = hashArray( _hashData );

		_hashData.length = 0;

		return cacheKey;

	}

	/**
	 * Computes a hash value for identifying the current light nodes setup.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {string} The computed hash.
	 */
	getHash( builder ) {

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.lightNodesHash === undefined ) {

			const lightNodes = this.setupLightsNode( builder );

			nodeData.lightNodes = lightNodes;

			const hash = [];

			for ( const lightNode of lightNodes ) {

				hash.push( lightNode.getHash() );

			}

			nodeData.lightNodesHash = 'lights-' + hash.join( ',' );

		}

		return nodeData.lightNodesHash;

	}

	/**
	 * Analyzes the node's dependencies by building all nested light nodes
	 * and the output node.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 */
	analyze( builder ) {

		const properties = builder.getNodeProperties( this );

		for ( const node of properties.nodes ) {

			node.build( builder );

		}

		properties.outputNode.build( builder );

	}

	/**
	 * Creates lighting nodes for each scene light. This makes it possible to further
	 * process lights in the node system.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Array<LightingNode>} The array of lighting nodes.
	 */
	setupLightsNode( builder ) {

		const nodeData = builder.getDataFromNode( this );
		const lightNodes = [];

		const previousLightNodes = nodeData.lightNodes || null;
		const materialLightings = builder.context.materialLightings;

		const lights = sortLights( [ ...materialLightings, ...this._lights ] );
		const nodeLibrary = builder.renderer.library;

		for ( const light of lights ) {

			if ( light.isNode ) {

				lightNodes.push( light );

			} else {

				let lightNode = null;

				if ( previousLightNodes !== null ) {

					lightNode = getLightNodeById( light.id, previousLightNodes );

				}

				if ( lightNode === null ) {

					const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

					if ( lightNodeClass === null ) {

						warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					if ( _lightsNodeRef.has( light ) === false ) {

						_lightsNodeRef.set( light, new lightNodeClass( light ) );

					}

					lightNode = _lightsNodeRef.get( light );

				}

				lightNodes.push( lightNode );

			}

		}

		return lightNodes;

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

	/**
	 * Sets up a direct rect area light in the lighting model.
	 *
	 * @param {Object} builder - The builder object containing the context and stack.
	 * @param {Object} lightNode - The light node.
	 * @param {Object} lightData - The light object containing color and area light properties.
	 */
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

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.lightNodes === undefined ) {

			nodeData.lightNodes = this.setupLightsNode( builder );

		}

		return nodeData.lightNodes;

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

		let outgoingLightNode = this.outgoingLightNode;

		const context = builder.context;
		const lightingModel = context.lightingModel;

		const properties = builder.getNodeProperties( this );

		if ( lightingModel ) {

			const { totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			properties.nodes = stack.nodes;

			lightingModel.start( builder );

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				if ( backdropAlpha !== null ) {

					totalDiffuse = vec3( backdropAlpha.mix( totalDiffuse, backdrop ) );

				} else {

					totalDiffuse = vec3( backdrop );

				}

			}

			totalDiffuseNode.assign( totalDiffuse );
			totalSpecularNode.assign( directSpecular.add( indirectSpecular ) );

			outgoingLightNode.assign( totalDiffuseNode.add( totalSpecularNode ) );

			lightingModel.finish( builder );

			outgoingLightNode = outgoingLightNode.bypass( builder.removeStack() );

		} else {

			properties.nodes = [];

		}

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
export const lights = ( lights = [] ) => new LightsNode().setLights( lights );
