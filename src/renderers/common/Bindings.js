import DataMap from './DataMap.js';
import BindGroup from './BindGroup.js';
import { AttributeType } from './Constants.js';
import { hashString } from '../../nodes/core/NodeUtils.js';

/**
 * This renderer module manages the bindings of the renderer.
 *
 * @private
 * @augments DataMap
 */
class Bindings extends DataMap {

	/**
	 * Constructs a new bindings management component.
	 *
	 * @param {Backend} backend - The renderer's backend.
	 * @param {NodeManager} nodes - Renderer component for managing nodes related logic.
	 * @param {Textures} textures - Renderer component for managing textures.
	 * @param {Attributes} attributes - Renderer component for managing attributes.
	 * @param {Pipelines} pipelines - Renderer component for managing pipelines.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( backend, nodes, textures, attributes, pipelines, info ) {

		super();

		/**
		 * The renderer's backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * Renderer component for managing textures.
		 *
		 * @type {Textures}
		 */
		this.textures = textures;

		/**
		 * Renderer component for managing pipelines.
		 *
		 * @type {Pipelines}
		 */
		this.pipelines = pipelines;

		/**
		 * Renderer component for managing attributes.
		 *
		 * @type {Attributes}
		 */
		this.attributes = attributes;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {NodeManager}
		 */
		this.nodes = nodes;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

		/**
		 * Shared bind groups per render context.
		 *
		 * @private
		 * @type {WeakMap<RenderContext|Renderer,Map<number,BindGroup>>}
		 */
		this._sharedBindGroups = new WeakMap();

		this.pipelines.bindings = this; // assign bindings to pipelines

	}

	/**
	 * Returns the bind groups for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Array<BindGroup>} The bind groups.
	 */
	getForRender( renderObject ) {

		const bindings = renderObject.getBindings();

		const renderObjectData = this.get( renderObject );

		if ( renderObjectData.initialized !== true ) {

			// bind groups are created once per object

			this._createBindings( bindings );

			renderObjectData.initialized = true;

		}

		return bindings;

	}

	/**
	 * Returns the bind groups for the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 * @return {Array<BindGroup>} The bind groups.
	 */
	getForCompute( computeNode ) {

		const bindings = this.nodes.getForCompute( computeNode ).bindings;
		const computeNodeData = this.get( computeNode );

		if ( computeNodeData.initialized !== true || computeNodeData.bindings !== bindings ) {

			// bind groups are created once per compute node version

			if ( computeNodeData.bindings !== undefined ) {

				this._destroyBindings( computeNodeData.bindings );

			}

			this._createBindings( bindings );

			computeNodeData.initialized = true;
			computeNodeData.bindings = bindings;

		}

		return bindings;

	}

	/**
	 * Returns the shared bind group for the given bindings and the current render context.
	 * If it does not exist yet, it is created with the given name and bindings.
	 *
	 * @param {string} name - The bind group's name.
	 * @param {Array<Binding>} bindings - An array of bindings.
	 * @return {BindGroup} The shared bind group.
	 */
	getSharedBindGroup( name, bindings ) {

		// build cache key

		let cacheKeyString = '';

		for ( const binding of bindings ) {

			if ( binding.isNodeUniformsGroup ) {

				binding.uniforms.sort( ( a, b ) => a.nodeUniform.node.id - b.nodeUniform.node.id );

				for ( const uniform of binding.uniforms ) {

					cacheKeyString += uniform.nodeUniform.node.id;

				}

			} else {

				cacheKeyString += binding.nodeUniform.id;

			}

		}

		const cacheKey = hashString( cacheKeyString );

		// lookup bind group cache

		const renderer = this.backend.renderer;
		const renderContext = renderer._currentRenderContext || renderer; // use renderer as fallback until we have a compute context

		let bindGroupsCache = this._sharedBindGroups.get( renderContext );

		if ( bindGroupsCache === undefined ) {

			bindGroupsCache = new Map();

			this._sharedBindGroups.set( renderContext, bindGroupsCache );

		}

		// lookup bind group

		let bindGroup = bindGroupsCache.get( cacheKey );

		if ( bindGroup === undefined ) {

			bindGroup = new BindGroup( name, bindings );

			bindGroupsCache.set( cacheKey, bindGroup );

			const groupData = this.get( bindGroup );
			groupData.renderContext = renderContext;
			groupData.cacheKey = cacheKey;

		}

		return bindGroup;

	}

	/**
	 * Updates the bindings for the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 */
	updateForCompute( computeNode ) {

		this._updateBindings( this.getForCompute( computeNode ) );

	}

	/**
	 * Updates the bindings for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateForRender( renderObject ) {

		this._updateBindings( this.getForRender( renderObject ) );

	}

	/**
	 * Updates only the shared uniform buffers of the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 */
	updateSharedForRender( renderObject ) {

		const bindings = this.getForRender( renderObject );

		for ( const bindGroup of bindings ) {

			for ( const binding of bindGroup.bindings ) {

				if ( ( binding.isNodeUniformsGroup === true || binding.isNodeUniformBuffer === true ) && binding.groupNode.shared === true ) {

					const updatedGroup = this.nodes.updateGroup( binding );

					if ( updatedGroup === false ) continue;

					const updated = binding.update();

					if ( updated ) {

						this.backend.updateBinding( binding );

					}

					if ( binding.updateRanges.length > 0 ) binding.clearUpdateRanges();

				}

			}

		}

	}

	/**
	 * Deletes the bindings for the given compute node.
	 *
	 * @param {Node} computeNode - The compute node.
	 */
	deleteForCompute( computeNode ) {

		const computeNodeData = this.get( computeNode );
		const bindings = computeNodeData.bindings || this.nodes.getForCompute( computeNode ).bindings;

		this._destroyBindings( bindings );

		this.delete( computeNode );

	}

	/**
	 * Deletes the bindings for the given renderObject node.
	 *
	 * @param {RenderObject} renderObject - The renderObject.
	 */
	deleteForRender( renderObject ) {

		const bindings = renderObject.getBindings();

		this._destroyBindings( bindings );

		this.delete( renderObject );

	}

	/**
	 * Creates the bindings for the given array of bindings.
	 *
	 * @param {Array<BindGroup>} bindings - The bind groups.
	 */
	_createBindings( bindings ) {

		for ( const bindGroup of bindings ) {

			// binding group

			const groupData = this.get( bindGroup );

			if ( groupData.bindGroup === undefined ) {

				// initialize

				for ( const binding of bindGroup.bindings ) {

					if ( binding.isUniformBuffer ) {

						// uniform buffers can be shared by multiple bind groups so they are reference counted

						const bindingData = this.get( binding );

						if ( bindingData.usedTimes === undefined ) {

							this.backend.createUniformBuffer( binding );
							this.info.createUniformBuffer( binding );

							bindingData.usedTimes = 0;

						}

						bindingData.usedTimes ++;

					} else if ( binding.isSampledTexture ) {

						binding.generation = this.textures.updateTexture( binding.texture );

					} else if ( binding.isSampler ) {

						binding.samplerKey = this.textures.updateSampler( binding );

					} else if ( binding.isStorageBuffer ) {

						const attribute = binding.attribute;
						const attributeType = attribute.isIndirectStorageBufferAttribute ? AttributeType.INDIRECT : AttributeType.STORAGE;

						this.attributes.update( attribute, attributeType );

					}

				}

				// each object defines an array of bindings (ubos, textures, samplers etc.)

				this.backend.createBindings( bindGroup, bindings, '' );

				groupData.bindGroup = bindGroup;
				groupData.usedTimes = 1;

			} else {

				groupData.usedTimes ++;

			}

		}

	}

	/**
	 * Deletes the given array of bindings.
	 *
	 * @param {Array<BindGroup>} bindings - The bind groups.
	 */
	_destroyBindings( bindings ) {

		for ( const bindGroup of bindings ) {

			const groupData = this.get( bindGroup );
			groupData.usedTimes --;

			if ( groupData.usedTimes === 0 ) {

				for ( const binding of bindGroup.bindings ) {

					if ( binding.isUniformBuffer ) {

						const bindingData = this.get( binding );
						bindingData.usedTimes --;

						if ( bindingData.usedTimes === 0 ) {

							this.backend.destroyUniformBuffer( binding );
							this.info.destroyUniformBuffer( binding );

							// release arrays

							binding.release();

							// shared bindings can be used again, so make sure a recreated buffer is updated

							this.nodes.groupsData.delete( [ binding.groupNode, binding ] );

							this.delete( binding );

						}

					} else if ( binding.isSampler ) {

						if ( binding.isSampledTexture !== true ) {

							this.backend.destroySampler( binding );

						} else if ( binding.texture !== null ) {

							// untrack destroyed bind group from its texture

							const textureData = this.textures.get( binding.texture );
							if ( textureData.bindGroups !== undefined ) textureData.bindGroups.delete( bindGroup );

						}

						binding.release();

					}

				}

				if ( groupData.cacheKey !== undefined ) {

					const bindGroupsCache = this._sharedBindGroups.get( groupData.renderContext );
					bindGroupsCache.delete( groupData.cacheKey );

				}

				this.backend.deleteBindGroupData( bindGroup );
				this.delete( bindGroup );

			}

		}

	}

	/**
	 * Updates the given array of bindings.
	 *
	 * @param {Array<BindGroup>} bindings - The bind groups.
	 */
	_updateBindings( bindings ) {

		for ( const bindGroup of bindings ) {

			this._update( bindGroup, bindings );

		}

	}

	/**
	 * Updates the given bind group.
	 *
	 * @param {BindGroup} bindGroup - The bind group to update.
	 * @param {Array<BindGroup>} bindings - The bind groups.
	 */
	_update( bindGroup, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;
		let cacheBindings = true;
		let cacheKey = '';
		let version = 0;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindGroup.bindings ) {

			const updatedGroup = this.nodes.updateGroup( binding );

			// every uniforms group is a uniform buffer. So if no update is required,
			// we move one with the next binding. Otherwise the next if block will update the group.

			if ( updatedGroup === false ) continue;

			//

			if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;
				const attributeType = attribute.isIndirectStorageBufferAttribute ? AttributeType.INDIRECT : AttributeType.STORAGE;

				const bindingData = backend.get( binding );

				this.attributes.update( attribute, attributeType );

				if ( bindingData.attribute !== attribute ) {

					bindingData.attribute = attribute;

					needsBindingsUpdate = true;

				}

				cacheKey += attribute.id + ',';

			}

			if ( binding.isUniformBuffer ) {

				const updated = binding.update();

				if ( updated ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampledTexture ) {

				const updated = binding.update();

				// get the texture data after the update, to sync the texture reference from node

				const texture = binding.texture;
				const texturesTextureData = this.textures.get( texture );

				if ( updated ) {

					// version: update the texture data or create a new one

					const generation = this.textures.updateTexture( texture );

					// generation: update the bindings if the binding refers to a different texture object

					if ( binding.generation !== generation ) {

						binding.generation = generation;

						needsBindingsUpdate = true;

					}

					// keep track which bind groups refer to the current texture (this is needed for dispose)

					texturesTextureData.bindGroups.add( bindGroup );

				}

				const textureData = backend.get( texture );

				if ( textureData.externalTexture !== undefined || texturesTextureData.isDefaultTexture ) {

					cacheBindings = false;

				} else {

					cacheKey += texture.id + ',';
					version += texture.version;

				}

				if ( texture.isStorageTexture === true && texture.mipmapsAutoUpdate === true ) {

					const textureData = this.get( texture );

					if ( binding.store === true ) {

						textureData.needsMipmap = true;

					} else if ( this.textures.needsMipmaps( texture ) && textureData.needsMipmap === true ) {

						this.backend.generateMipmaps( texture );

						textureData.needsMipmap = false;

					}

				}

			} else if ( binding.isSampler ) {

				const updated = binding.update();

				if ( updated ) {

					const samplerKey = this.textures.updateSampler( binding );

					if ( binding.samplerKey !== samplerKey ) {

						binding.samplerKey = samplerKey;

						needsBindingsUpdate = true;

					}

				}

			}

			if ( binding.isBuffer && binding.updateRanges.length > 0 ) {

				binding.clearUpdateRanges();

			}

		}

		if ( needsBindingsUpdate === true ) {

			this.backend.updateBindings( bindGroup, bindings, cacheBindings ? cacheKey : '', version );

		}

	}

}

export default Bindings;
