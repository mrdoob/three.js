import Node from '../core/Node.js';
import { nodeObject, property, vec3 } from '../tsl/TSLBase.js';
import { hashArray, hashString } from '../core/NodeUtils.js';
import { warn } from '../../utils.js';

import AmbientLightDataNode from './data/AmbientLightDataNode.js';
import DirectionalLightDataNode from './data/DirectionalLightDataNode.js';
import PointLightDataNode from './data/PointLightDataNode.js';
import SpotLightDataNode from './data/SpotLightDataNode.js';
import HemisphereLightDataNode from './data/HemisphereLightDataNode.js';

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

/**
 * Maps light constructor names to their data node classes.
 */
const _lightTypeToDataNode = {
	'AmbientLight': AmbientLightDataNode,
	'DirectionalLight': DirectionalLightDataNode,
	'PointLight': PointLightDataNode,
	'SpotLight': SpotLightDataNode,
	'HemisphereLight': HemisphereLightDataNode
};

/**
 * Maps light constructor names to renderer max count property names.
 */
const _lightTypeToMaxProp = {
	'DirectionalLight': 'maxDirectionalLights',
	'PointLight': 'maxPointLights',
	'SpotLight': 'maxSpotLights',
	'HemisphereLight': 'maxHemisphereLights'
};

const _lightsNodeRef = /*@__PURE__*/ new WeakMap();
const _hashData = [];

/**
 * Returns true if a spot light is "special" (has map or colorNode) and should
 * use the per-light inline path even in dynamic mode.
 */
const isSpecialSpotLight = ( light ) => {

	return light.isSpotLight === true && ( light.map !== null || light.colorNode !== undefined );

};

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
		this.totalDiffuseNode = property( 'vec3', 'totalDiffuse' );

		/**
		 * A node representing the total specular light.
		 *
		 * @type {Node<vec3>}
		 */
		this.totalSpecularNode = property( 'vec3', 'totalSpecular' );

		/**
		 * A node representing the outgoing light.
		 *
		 * @type {Node<vec3>}
		 */
		this.outgoingLightNode = property( 'vec3', 'outgoingLight' );

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

		/**
		 * Reference to the renderer, set by the Lighting class.
		 *
		 * @private
		 * @type {?Renderer}
		 * @default null
		 */
		this._renderer = null;

		/**
		 * Cached data nodes for dynamic mode, keyed by light type name.
		 *
		 * @private
		 * @type {Map<string, Node>}
		 */
		this._dataNodes = new Map();

	}

	/**
	 * Returns whether dynamic lighting mode is enabled.
	 *
	 * @return {boolean}
	 */
	get _dynamic() {

		return this._renderer !== null && this._renderer.lights && this._renderer.lights.dynamic === true;

	}

	/**
	 * Overwrites the default {@link Node#customCacheKey} implementation by including
	 * light data into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		const lights = this._lights;

		if ( this._dynamic ) {

			// Dynamic mode: hash light types (deduplicated) for non-shadow, non-special lights
			// Shadow and special lights are hashed individually (same as static mode)

			const typeSet = new Set();

			for ( let i = 0; i < lights.length; i ++ ) {

				const light = lights[ i ];

				if ( light.isNode ) {

					// Node lights are always per-light
					_hashData.push( light.id );

				} else if ( light.castShadow || isSpecialSpotLight( light ) ) {

					// Shadow-casting and special lights: per-light hash (same as static)
					_hashData.push( light.id );
					_hashData.push( light.castShadow ? 1 : 0 );

					if ( light.isSpotLight === true ) {

						const hashMap = ( light.map !== null ) ? light.map.id : - 1;
						const hashColorNode = ( light.colorNode ) ? light.colorNode.getCacheKey() : - 1;
						_hashData.push( hashMap, hashColorNode );

					}

				} else {

					// Non-shadow, non-special: just hash the type constructor name
					typeSet.add( light.constructor.name );

				}

			}

			// Include types from cached data nodes (keep stable even when count=0)
			for ( const typeName of this._dataNodes.keys() ) {

				typeSet.add( typeName );

			}

			// Add sorted type name hashes so order is stable
			const sortedTypes = [ ...typeSet ].sort();
			for ( let i = 0; i < sortedTypes.length; i ++ ) {

				_hashData.push( hashString( sortedTypes[ i ] ) );

			}

		} else {

			// Static mode: hash every light individually (current behavior)

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

		if ( this._lightNodesHash === null ) {

			if ( this._lightNodes === null ) this.setupLightsNode( builder );

			const hash = [];

			for ( const lightNode of this._lightNodes ) {

				hash.push( lightNode.getHash() );

			}

			this._lightNodesHash = 'lights-' + hash.join( ',' );

		}

		return this._lightNodesHash;

	}

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
	 */
	setupLightsNode( builder ) {

		if ( this._dynamic ) {

			this._setupLightsNodeDynamic( builder );

		} else {

			this._setupLightsNodeStatic( builder );

		}

	}

	/**
	 * Static mode: creates per-light AnalyticLightNode instances (original behavior).
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 */
	_setupLightsNodeStatic( builder ) {

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

						warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					let lightNode = null;

					if ( ! _lightsNodeRef.has( light ) ) {

						lightNode = new lightNodeClass( light );
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
	 * Dynamic mode: groups lights by type into data nodes.
	 * Shadow-casting lights and special lights (spot with map/colorNode, node lights)
	 * use per-light inline path.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 */
	_setupLightsNodeDynamic( builder ) {

		const lightNodes = [];
		const lights = sortLights( this._lights );
		const nodeLibrary = builder.renderer.library;
		const lightsConfig = this._renderer.lights;

		// Group non-shadow, non-special lights by type
		const lightsByType = new Map();

		for ( const light of lights ) {

			if ( light.isNode ) {

				// Node lights: per-light inline path
				lightNodes.push( nodeObject( light ) );

			} else if ( light.castShadow || isSpecialSpotLight( light ) ) {

				// Shadow-casting and special lights: per-light inline path
				let lightNode = null;

				if ( ! _lightsNodeRef.has( light ) ) {

					const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

					if ( lightNodeClass === null ) {

						warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					lightNode = new lightNodeClass( light );
					_lightsNodeRef.set( light, lightNode );

				} else {

					lightNode = _lightsNodeRef.get( light );

				}

				lightNodes.push( lightNode );

			} else {

				// Non-shadow, non-special: group by type
				const typeName = light.constructor.name;

				if ( ! lightsByType.has( typeName ) ) {

					lightsByType.set( typeName, [] );

				}

				lightsByType.get( typeName ).push( light );

			}

		}

		// Create or reuse data nodes for each type group
		for ( const [ typeName, typeLights ] of lightsByType ) {

			let dataNode = this._dataNodes.get( typeName );

			if ( dataNode === undefined ) {

				const DataNodeClass = _lightTypeToDataNode[ typeName ];

				if ( DataNodeClass === undefined ) {

					// Fallback: use per-light inline path for unknown types
					for ( const light of typeLights ) {

						let lightNode = null;

						if ( ! _lightsNodeRef.has( light ) ) {

							const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

							if ( lightNodeClass === null ) {

								warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
								continue;

							}

							lightNode = new lightNodeClass( light );
							_lightsNodeRef.set( light, lightNode );

						} else {

							lightNode = _lightsNodeRef.get( light );

						}

						lightNodes.push( lightNode );

					}

					continue;

				}

				// Create data node with the appropriate max count
				const maxProp = _lightTypeToMaxProp[ typeName ];
				const maxCount = maxProp ? ( lightsConfig[ maxProp ] || undefined ) : undefined;
				dataNode = maxCount !== undefined ? new DataNodeClass( maxCount ) : new DataNodeClass();

				this._dataNodes.set( typeName, dataNode );

			}

			dataNode.setLights( typeLights );
			lightNodes.push( dataNode );

		}

		// Keep data nodes alive with 0 lights (loop runs 0 times, avoids recompilation)
		for ( const [ typeName, dataNode ] of this._dataNodes ) {

			if ( ! lightsByType.has( typeName ) ) {

				dataNode.setLights( [] );
				lightNodes.push( dataNode );

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

		const properties = builder.getNodeProperties( this );

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

		// In dynamic mode, update data nodes' lights lists immediately
		// so uniform arrays are filled correctly even when shader is cached

		if ( this._dynamic && this._dataNodes.size > 0 ) {

			this._updateDataNodeLights( lights );

		}

		return this;

	}

	/**
	 * Groups lights by type and updates each cached data node's lights list.
	 *
	 * @private
	 * @param {Array<Light>} lights - The full array of scene lights.
	 */
	_updateDataNodeLights( lights ) {

		const lightsByType = new Map();

		for ( const light of lights ) {

			if ( light.isNode || light.castShadow || isSpecialSpotLight( light ) ) continue;

			const typeName = light.constructor.name;

			if ( ! lightsByType.has( typeName ) ) {

				lightsByType.set( typeName, [] );

			}

			lightsByType.get( typeName ).push( light );

		}

		for ( const [ typeName, dataNode ] of this._dataNodes ) {

			const typeLights = lightsByType.get( typeName );
			dataNode.setLights( typeLights || [] );

		}

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
