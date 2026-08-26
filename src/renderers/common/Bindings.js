import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';

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

						this.backend.createUniformBuffer( binding );
						this.info.createUniformBuffer( binding );

					} else if ( binding.isSampledTexture ) {

						this.textures.updateTexture( binding.texture );

					} else if ( binding.isSampler ) {

						this.textures.updateSampler( binding );

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

						this.backend.destroyUniformBuffer( binding );
						this.info.destroyUniformBuffer( binding );

						// release arrays

						binding.release();

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

			// A storage node's `.value` can be repointed to a different attribute without the
			// enclosing render/frame group ever being invalidated (the group tracks per-frame
			// invalidation, not the node's own attribute identity). So the attribute-sync/cache-key
			// logic below has to run unconditionally, independent of `updateGroup()`'s result -- unlike
			// the uniform-buffer/texture/sampler branches further down, which are fine being skipped
			// when their group hasn't changed.

			if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;
				const attributeType = attribute.isIndirectStorageBufferAttribute ? AttributeType.INDIRECT : AttributeType.STORAGE;

				const bindingData = backend.get( binding );

				this.attributes.update( attribute, attributeType );

				if ( bindingData.attribute !== attribute ) {

					bindingData.attribute = attribute;

					needsBindingsUpdate = true;

				}

				// Fold the attribute's identity/version into the cache key, mirroring the
				// isSampledTexture branch below.

				cacheKey += attribute.id + ',';
				version += attribute.version;

				// keep track which bind groups refer to the current attribute so cached bind
				// groups can be evicted when the attribute is disposed (mirrors the texture
				// bind group tracking below, which exists for the same reason)

				const attributeData = this.attributes.get( attribute );

				if ( attributeData.bindGroups === undefined ) {

					attributeData.bindGroups = new Set();

					const onDispose = () => this._destroyStorageBufferBindGroups( attribute );

					attribute.addEventListener( 'dispose', onDispose );

				}

				attributeData.bindGroups.add( bindGroup );

			}

			const updatedGroup = this.nodes.updateGroup( binding );

			// every uniforms group is a uniform buffer. So if no update is required,
			// we move one with the next binding. Otherwise the next if block will update the group.

			if ( updatedGroup === false ) continue;

			//

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

					this.textures.updateTexture( texture );

					// generation: update the bindings if the binding refers to a different texture object

					if ( binding.generation !== texturesTextureData.generation ) {

						binding.generation = texturesTextureData.generation;

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

				// `binding.update()` only reports a change when the bound texture's `version`
				// bumps, but sampler settings (wrap/filter/anisotropy) don't bump that version.
				// So the sampler key has to be recomputed and compared unconditionally -- gating
				// it behind `update()` would mean a sampler-only settings change is never even
				// detected, let alone folded into the cache key below.

				binding.update();

				const samplerKey = this.textures.updateSampler( binding );

				if ( binding.samplerKey !== samplerKey ) {

					binding.samplerKey = samplerKey;

					needsBindingsUpdate = true;

				}

				// Fold the sampler's key into the cache key, mirroring the isSampledTexture
				// branch above, so a bind group isn't reused after only the sampler's own
				// settings changed.

				cacheKey += binding.samplerKey + ',';

			}

			if ( binding.isBuffer && binding.updateRanges.length > 0 ) {

				binding.clearUpdateRanges();

			}

		}

		if ( needsBindingsUpdate === true ) {

			this.backend.updateBindings( bindGroup, bindings, cacheBindings ? cacheKey : '', version );

		}

	}

	/**
	 * Evicts every cached bind group entry tied to the given storage attribute. Called when
	 * the attribute is disposed, so a bind group's per-cache-key GPU objects (keyed in part by
	 * `attribute.id`, see `_update()`) don't keep accumulating for an attribute id that will
	 * never be referenced again. Mirrors the cleanup `Textures.js` performs for disposed textures.
	 *
	 * @param {BufferAttribute} attribute - The disposed storage attribute.
	 */
	_destroyStorageBufferBindGroups( attribute ) {

		const attributeData = this.attributes.get( attribute );

		if ( attributeData.bindGroups ) {

			for ( const bindGroup of attributeData.bindGroups ) {

				const bindingsData = this.backend.get( bindGroup );

				bindingsData.groups = undefined;
				bindingsData.versions = undefined;

			}

			attributeData.bindGroups.clear();

		}

	}

}

export default Bindings;
