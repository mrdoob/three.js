import DataMap from '../DataMap.js';
import ChainMap from '../ChainMap.js';
import NodeBuilderState from './NodeBuilderState.js';
import { cubeMapNode } from '../../../nodes/utils/CubeMapNode.js';
import { NodeFrame } from '../../../nodes/Nodes.js';
import { objectGroup, renderGroup, frameGroup, cubeTexture, texture, fog, rangeFogFactor, densityFogFactor, reference, pmremTexture, screenUV } from '../../../nodes/TSL.js';

import { CubeUVReflectionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from '../../../constants.js';
import { hashArray } from '../../../nodes/core/NodeUtils.js';

const _outputNodeMap = new WeakMap();

/**
 * This renderer module manages node-related objects and is the
 * primary interface between the renderer and the node system.
 *
 * @private
 * @augments DataMap
 */
class Nodes extends DataMap {

	/**
	 * Constructs a new nodes management component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Backend} backend - The renderer's backend.
	 */
	constructor( renderer, backend ) {

		super();

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * The renderer's backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * The node frame.
		 *
		 * @type {Renderer}
		 */
		this.nodeFrame = new NodeFrame();

		/**
		 * A cache for managing node builder states.
		 *
		 * @type {Map<Number,NodeBuilderState>}
		 */
		this.nodeBuilderCache = new Map();

		/**
		 * A cache for managing data cache key data.
		 *
		 * @type {ChainMap}
		 */
		this.callHashCache = new ChainMap();

		/**
		 * A cache for managing node uniforms group data.
		 *
		 * @type {ChainMap}
		 */
		this.groupsData = new ChainMap();

		/**
		 * A cache for managing node objects of
		 * scene properties like fog or environments.
		 *
		 * @type {Object<String,WeakMap>}
		 */
		this.cacheLib = {};

	}

	/**
	 * Returns `true` if the given node uniforms group must be updated or not.
	 *
	 * @param {NodeUniformsGroup} nodeUniformsGroup - The node uniforms group.
	 * @return {Boolean} Whether the node uniforms group requires an update or not.
	 */
	updateGroup( nodeUniformsGroup ) {

		const groupNode = nodeUniformsGroup.groupNode;
		const name = groupNode.name;

		// objectGroup is always updated

		if ( name === objectGroup.name ) return true;

		// renderGroup is updated once per render/compute call

		if ( name === renderGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const renderId = this.nodeFrame.renderId;

			if ( uniformsGroupData.renderId !== renderId ) {

				uniformsGroupData.renderId = renderId;

				return true;

			}

			return false;

		}

		// frameGroup is updated once per frame

		if ( name === frameGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const frameId = this.nodeFrame.frameId;

			if ( uniformsGroupData.frameId !== frameId ) {

				uniformsGroupData.frameId = frameId;

				return true;

			}

			return false;

		}

		// other groups are updated just when groupNode.needsUpdate is true

		const groupChain = [ groupNode, nodeUniformsGroup ];

		let groupData = this.groupsData.get( groupChain );
		if ( groupData === undefined ) this.groupsData.set( groupChain, groupData = {} );

		if ( groupData.version !== groupNode.version ) {

			groupData.version = groupNode.version;

			return true;

		}

		return false;

	}

	/**
	 * Returns the cache key for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Number} The cache key.
	 */
	getForRenderCacheKey( renderObject ) {

		return renderObject.initialCacheKey;

	}

	/**
	 * Returns a node builder state for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {NodeBuilderState} The node builder state.
	 */
	getForRender( renderObject ) {

		const renderObjectData = this.get( renderObject );

		let nodeBuilderState = renderObjectData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const { nodeBuilderCache } = this;

			const cacheKey = this.getForRenderCacheKey( renderObject );

			nodeBuilderState = nodeBuilderCache.get( cacheKey );

			if ( nodeBuilderState === undefined ) {

				const nodeBuilder = this.backend.createNodeBuilder( renderObject.object, this.renderer );
				nodeBuilder.scene = renderObject.scene;
				nodeBuilder.material = renderObject.material;
				nodeBuilder.camera = renderObject.camera;
				nodeBuilder.context.material = renderObject.material;
				nodeBuilder.lightsNode = renderObject.lightsNode;
				nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
				nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
				nodeBuilder.clippingContext = renderObject.clippingContext;
				nodeBuilder.build();

				nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

				nodeBuilderCache.set( cacheKey, nodeBuilderState );

			}

			nodeBuilderState.usedTimes ++;

			renderObjectData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	/**
	 * Deletes the given object from the internal data map
	 *
	 * @param {Any} object - The object to delete.
	 * @return {Object?} The deleted dictionary.
	 */
	delete( object ) {

		if ( object.isRenderObject ) {

			const nodeBuilderState = this.get( object ).nodeBuilderState;
			nodeBuilderState.usedTimes --;

			if ( nodeBuilderState.usedTimes === 0 ) {

				this.nodeBuilderCache.delete( this.getForRenderCacheKey( object ) );

			}

		}

		return super.delete( object );

	}

	/**
	 * Returns a node builder state for the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 * @return {NodeBuilderState} The node builder state.
	 */
	getForCompute( computeNode ) {

		const computeData = this.get( computeNode );

		let nodeBuilderState = computeData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const nodeBuilder = this.backend.createNodeBuilder( computeNode, this.renderer );
			nodeBuilder.build();

			nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

			computeData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	/**
	 * Creates a node builder state for the given node builder.
	 *
	 * @private
	 * @param {NodeBuilder} nodeBuilder - The node builder.
	 * @return {NodeBuilderState} The node builder state.
	 */
	_createNodeBuilderState( nodeBuilder ) {

		return new NodeBuilderState(
			nodeBuilder.vertexShader,
			nodeBuilder.fragmentShader,
			nodeBuilder.computeShader,
			nodeBuilder.getAttributesArray(),
			nodeBuilder.getBindings(),
			nodeBuilder.updateNodes,
			nodeBuilder.updateBeforeNodes,
			nodeBuilder.updateAfterNodes,
			nodeBuilder.monitor,
			nodeBuilder.transforms
		);

	}

	/**
	 * Returns an environment node for the current configured
	 * scene environment.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {Node} A node representing the current scene environment.
	 */
	getEnvironmentNode( scene ) {

		this.updateEnvironment( scene );

		let environmentNode = null;

		if ( scene.environmentNode && scene.environmentNode.isNode ) {

			environmentNode = scene.environmentNode;

		} else {

			const sceneData = this.get( scene );

			if ( sceneData.environmentNode ) {

				environmentNode = sceneData.environmentNode;

			}

		}

		return environmentNode;

	}

	/**
	 * Returns a background node for the current configured
	 * scene background.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {Node} A node representing the current scene background.
	 */
	getBackgroundNode( scene ) {

		this.updateBackground( scene );

		let backgroundNode = null;

		if ( scene.backgroundNode && scene.backgroundNode.isNode ) {

			backgroundNode = scene.backgroundNode;

		} else {

			const sceneData = this.get( scene );

			if ( sceneData.backgroundNode ) {

				backgroundNode = sceneData.backgroundNode;

			}

		}

		return backgroundNode;

	}

	/**
	 * Returns a fog node for the current configured scene fog.
	 *
	 * @param {Scene} scene - The scene.
	 * @return {Node} A node representing the current scene fog.
	 */
	getFogNode( scene ) {

		this.updateFog( scene );

		return scene.fogNode || this.get( scene ).fogNode || null;

	}

	/**
	 * Returns a cache key for the given scene and lights node.
	 * This key is used by `RenderObject` as a part of the dynamic
	 * cache key (a key that must be checked every time the render
	 * objects is drawn).
	 *
	 * @param {Scene} scene - The scene.
	 * @param {LightsNode} lightsNode - The lights node.
	 * @return {Number} The cache key.
	 */
	getCacheKey( scene, lightsNode ) {

		const chain = [ scene, lightsNode ];
		const callId = this.renderer.info.calls;

		let cacheKeyData = this.callHashCache.get( chain );

		if ( cacheKeyData === undefined || cacheKeyData.callId !== callId ) {

			const environmentNode = this.getEnvironmentNode( scene );
			const fogNode = this.getFogNode( scene );

			const values = [];

			if ( lightsNode ) values.push( lightsNode.getCacheKey( true ) );
			if ( environmentNode ) values.push( environmentNode.getCacheKey() );
			if ( fogNode ) values.push( fogNode.getCacheKey() );

			values.push( this.renderer.shadowMap.enabled ? 1 : 0 );

			cacheKeyData = {
				callId,
				cacheKey: hashArray( values )
			};

			this.callHashCache.set( chain, cacheKeyData );

		}

		return cacheKeyData.cacheKey;

	}

	/**
	 * A boolean that indicates whether tone mapping should be enabled
	 * or not.
	 *
	 * @type {Boolean}
	 */
	get isToneMappingState() {

		return this.renderer.getRenderTarget() ? false : true;

	}

	/**
	 * If a scene background is configured, this method makes sure to
	 * represent the background with a corresponding node-based implementation.
	 *
	 * @param {Scene} scene - The scene.
	 */
	updateBackground( scene ) {

		const sceneData = this.get( scene );
		const background = scene.background;

		if ( background ) {

			const forceUpdate = ( scene.backgroundBlurriness === 0 && sceneData.backgroundBlurriness > 0 ) || ( scene.backgroundBlurriness > 0 && sceneData.backgroundBlurriness === 0 );

			if ( sceneData.background !== background || forceUpdate ) {

				const backgroundNode = this.getCacheNode( 'background', background, () => {

					if ( background.isCubeTexture === true || ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping || background.mapping === CubeUVReflectionMapping ) ) {

						if ( scene.backgroundBlurriness > 0 || background.mapping === CubeUVReflectionMapping ) {

							return pmremTexture( background );

						} else {

							let envMap;

							if ( background.isCubeTexture === true ) {

								envMap = cubeTexture( background );

							} else {

								envMap = texture( background );

							}

							return cubeMapNode( envMap );

						}

					} else if ( background.isTexture === true ) {

						return texture( background, screenUV.flipY() ).setUpdateMatrix( true );

					} else if ( background.isColor !== true ) {

						console.error( 'WebGPUNodes: Unsupported background configuration.', background );

					}

				}, forceUpdate );

				sceneData.backgroundNode = backgroundNode;
				sceneData.background = background;
				sceneData.backgroundBlurriness = scene.backgroundBlurriness;

			}

		} else if ( sceneData.backgroundNode ) {

			delete sceneData.backgroundNode;
			delete sceneData.background;

		}

	}

	/**
	 * This method is part of the caching of nodes which are used to represents the
	 * scene's background, fog or environment.
	 *
	 * @param {String} type - The type of object to cache.
	 * @param {Object} object - The object.
	 * @param {Function} callback - A callback that produces a node representation for the given object.
	 * @param {Boolean} [forceUpdate=false] - Whether an update should be enforced or not.
	 * @return {Node} The node representation.
	 */
	getCacheNode( type, object, callback, forceUpdate = false ) {

		const nodeCache = this.cacheLib[ type ] || ( this.cacheLib[ type ] = new WeakMap() );

		let node = nodeCache.get( object );

		if ( node === undefined || forceUpdate ) {

			node = callback();
			nodeCache.set( object, node );

		}

		return node;

	}

	/**
	 * If a scene fog is configured, this method makes sure to
	 * represent the fog with a corresponding node-based implementation.
	 *
	 * @param {Scene} scene - The scene.
	 */
	updateFog( scene ) {

		const sceneData = this.get( scene );
		const sceneFog = scene.fog;

		if ( sceneFog ) {

			if ( sceneData.fog !== sceneFog ) {

				const fogNode = this.getCacheNode( 'fog', sceneFog, () => {

					if ( sceneFog.isFogExp2 ) {

						const color = reference( 'color', 'color', sceneFog ).setGroup( renderGroup );
						const density = reference( 'density', 'float', sceneFog ).setGroup( renderGroup );

						return fog( color, densityFogFactor( density ) );

					} else if ( sceneFog.isFog ) {

						const color = reference( 'color', 'color', sceneFog ).setGroup( renderGroup );
						const near = reference( 'near', 'float', sceneFog ).setGroup( renderGroup );
						const far = reference( 'far', 'float', sceneFog ).setGroup( renderGroup );

						return fog( color, rangeFogFactor( near, far ) );

					} else {

						console.error( 'THREE.Renderer: Unsupported fog configuration.', sceneFog );

					}

				} );

				sceneData.fogNode = fogNode;
				sceneData.fog = sceneFog;

			}

		} else {

			delete sceneData.fogNode;
			delete sceneData.fog;

		}

	}

	/**
	 * If a scene environment is configured, this method makes sure to
	 * represent the environment with a corresponding node-based implementation.
	 *
	 * @param {Scene} scene - The scene.
	 */
	updateEnvironment( scene ) {

		const sceneData = this.get( scene );
		const environment = scene.environment;

		if ( environment ) {

			if ( sceneData.environment !== environment ) {

				const environmentNode = this.getCacheNode( 'environment', environment, () => {

					if ( environment.isCubeTexture === true ) {

						return cubeTexture( environment );

					} else if ( environment.isTexture === true ) {

						return texture( environment );

					} else {

						console.error( 'Nodes: Unsupported environment configuration.', environment );

					}

				} );

				sceneData.environmentNode = environmentNode;
				sceneData.environment = environment;

			}

		} else if ( sceneData.environmentNode ) {

			delete sceneData.environmentNode;
			delete sceneData.environment;

		}

	}

	getNodeFrame( renderer = this.renderer, scene = null, object = null, camera = null, material = null ) {

		const nodeFrame = this.nodeFrame;
		nodeFrame.renderer = renderer;
		nodeFrame.scene = scene;
		nodeFrame.object = object;
		nodeFrame.camera = camera;
		nodeFrame.material = material;

		return nodeFrame;

	}

	getNodeFrameForRender( renderObject ) {

		return this.getNodeFrame( renderObject.renderer, renderObject.scene, renderObject.object, renderObject.camera, renderObject.material );

	}

	/**
	 * Returns the current output cache key.
	 *
	 * @return {String} The output cache key.
	 */
	getOutputCacheKey() {

		const renderer = this.renderer;

		return renderer.toneMapping + ',' + renderer.currentColorSpace;

	}

	/**
	 * Checks if the output configuration (tone mapping and color space) for
	 * the given target has changed.
	 *
	 * @param {Texture} outputTarget - The output target.
	 * @return {Boolean} Whether the output configuration has changed or not.
	 */
	hasOutputChange( outputTarget ) {

		const cacheKey = _outputNodeMap.get( outputTarget );

		return cacheKey !== this.getOutputCacheKey();

	}

	/**
	 * Returns a node that represents the output configuration (tone mapping and
	 * color space) for the current target.
	 *
	 * @param {Texture} outputTarget - The output target.
	 * @return {Node} The output node.
	 */
	getOutputNode( outputTarget ) {

		const renderer = this.renderer;
		const cacheKey = this.getOutputCacheKey();

		const output = texture( outputTarget, screenUV ).renderOutput( renderer.toneMapping, renderer.currentColorSpace );

		_outputNodeMap.set( outputTarget, cacheKey );

		return output;

	}

	/**
	 * Triggers the call of `updateBefore()` methods
	 * for all nodes of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateBefore( renderObject ) {

		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			// update frame state for each node

			this.getNodeFrameForRender( renderObject ).updateBeforeNode( node );

		}

	}

	/**
	 * Triggers the call of `updateAfter()` methods
	 * for all nodes of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateAfter( renderObject ) {

		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateAfterNodes ) {

			// update frame state for each node

			this.getNodeFrameForRender( renderObject ).updateAfterNode( node );

		}

	}

	/**
	 * Triggers the call of `update()` methods
	 * for all nodes of the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 */
	updateForCompute( computeNode ) {

		const nodeFrame = this.getNodeFrame();
		const nodeBuilder = this.getForCompute( computeNode );

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	/**
	 * Triggers the call of `update()` methods
	 * for all nodes of the given compute node.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateForRender( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	/**
	 * Returns `true` if the given render object requires a refresh.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Boolean} Whether the given render object requires a refresh or not.
	 */
	needsRefresh( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const monitor = renderObject.getMonitor();

		return monitor.needsRefresh( renderObject, nodeFrame );

	}

	/**
	 * Frees the intenral resources.
	 */
	dispose() {

		super.dispose();

		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();
		this.cacheLib = {};

	}

}

export default Nodes;
