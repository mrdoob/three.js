import Node from '../core/Node.js';
import { property, vec3 } from '../tsl/TSLBase.js';
import { hashArray } from '../core/NodeUtils.js';
import { warn } from '../../utils.js';
import PointLightNode from './PointLightNode.js';
import SpotLightNode from './SpotLightNode.js';
import StaticLightsNode from './StaticLightsNode.js';
import { buildStaticLightGrid } from './StaticLightGrid.js';

const canBatchStaticLight = ( light ) => {

	return light.static === true && light.castShadow === false && light.colorNode == null &&
		Number.isFinite( light.distance ) && light.distance > 0 && (
		( light.isPointLight === true && light._lightNode === PointLightNode ) ||
			( light.isSpotLight === true && light._lightNode === SpotLightNode && light.map === null )
	);

};

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

		// Immutable batches can be shared by material builders and by cameras with
		// the same light set. Keep a bounded cache; additional sets use normal lights.
		this._staticLightsNodes = new Map();
		this._staticLightsBytes = 0;
		this._staticLightsVersion = 0;
		this._staticLightStates = new WeakMap();

		/**
		 * `LightsNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * Overwrites the default {@link Node#customCacheKey} implementation by including
	 * light data into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		const builtinLights = this.getBuiltinLights();
		_hashData.push( this._staticLightsVersion );

		for ( let i = 0; i < builtinLights.length; i ++ ) {

			const light = builtinLights[ i ];

			_hashData.push( light.id );
			_hashData.push( light.castShadow ? 1 : 0 );
			_hashData.push( canBatchStaticLight( light ) ? 1 : 0 );

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

		const builtinLights = this.getBuiltinLights();

		const lights = sortLights( [ ...materialLightings, ...builtinLights ] );
		const staticLights = StaticLightsNode.supports( builder ) ? lights.filter( canBatchStaticLight ) : [];
		const staticLightsNode = this._getStaticLightsNode( staticLights );

		for ( const light of lights ) {

			if ( staticLightsNode !== null && canBatchStaticLight( light ) ) continue;

			if ( light.isNode ) {

				lightNodes.push( light );

			} else {

				let lightNode = null;

				if ( previousLightNodes !== null ) {

					lightNode = getLightNodeById( light.id, previousLightNodes );

				}

				if ( lightNode === null ) {

					const lightNodeClass = light._lightNode;

					if ( lightNodeClass === undefined ) {

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

		if ( staticLightsNode !== null ) lightNodes.push( staticLightsNode );

		return lightNodes;

	}

	/**
	 * Gets an immutable grid for an already sorted set of static lights.
	 *
	 * @private
	 * @param {Array<Light>} lights - The eligible lights.
	 * @return {?StaticLightsNode} The batch, or null to use ordinary lights.
	 */
	_getStaticLightsNode( lights ) {

		if ( lights.length === 0 ) return null;

		const key = this._staticLightsVersion + ':' + lights.map( light => light.id ).join( ',' );
		const nodes = this._staticLightsNodes;

		if ( nodes.has( key ) ) return nodes.get( key );
		if ( nodes.size >= 8 ) return null;

		const grid = buildStaticLightGrid( lights );
		let node = null;

		if ( grid !== null ) {

			const bytes = grid.cells.byteLength + grid.indices.byteLength + grid.data.byteLength;

			if ( this._staticLightsBytes + bytes <= 16 * 1024 * 1024 ) {

				node = new StaticLightsNode( grid );
				this._staticLightsBytes += bytes;

			}

		}

		// Cache failed builds too, so each material does not repeat the work.
		nodes.set( key, node );

		return node;

	}

	/**
	 * Releases cached static light grids.
	 */
	dispose() {

		for ( const node of this._staticLightsNodes.values() ) {

			if ( node !== null ) node.dispose();

		}

		this._staticLightsNodes.clear();
		this._staticLightsBytes = 0;
		this._staticLightsVersion ++;

		super.dispose();

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

		if ( lightingModel ) {

			const { totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			builder.addStack();

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

		for ( const light of lights ) {

			const eligible = canBatchStaticLight( light );
			const previous = this._staticLightStates.get( light );

			if ( previous !== undefined && previous !== eligible ) this._staticLightsVersion ++;
			this._staticLightStates.set( light, eligible );

		}

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
	 * Returns an array of the scene's lights.
	 *
	 * The light variations are shader-dependent;
	 * if this array changes, the shader needs to be recreated.
	 *
	 * @return {Array<Light>} The scene's lights.
	 */
	getBuiltinLights() {

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
