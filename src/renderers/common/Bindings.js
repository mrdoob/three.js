import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';

class Bindings extends DataMap {

	constructor( backend, nodes, textures, attributes, pipelines, info ) {

		super();

		this.backend = backend;
		this.textures = textures;
		this.pipelines = pipelines;
		this.attributes = attributes;
		this.nodes = nodes;
		this.info = info;

		this.pipelines.bindings = this; // assign bindings to pipelines

	}

	getForRender( renderObject ) {

		const bindings = renderObject.getBindings();

		for ( const bindGroup of bindings ) {

			const groupData = this.get( bindGroup );

			if ( groupData.bindGroup === undefined ) {

				// each object defines an array of bindings (ubos, textures, samplers etc.)

				this._init( bindGroup );

				this.backend.createBindings( bindGroup, bindings, 0 );

				groupData.bindGroup = bindGroup;

			}

		}

		return bindings;

	}

	getForCompute( computeNode ) {

		const bindings = this.nodes.getForCompute( computeNode ).bindings;

		for ( const bindGroup of bindings ) {

			const groupData = this.get( bindGroup );

			if ( groupData.bindGroup === undefined ) {

				this._init( bindGroup );

				this.backend.createBindings( bindGroup, bindings, 0 );

				groupData.bindGroup = bindGroup;

			}

		}

		return bindings;

	}

	updateForCompute( computeNode ) {

		this._updateBindings( this.getForCompute( computeNode ) );

	}

	updateForRender( renderObject ) {

		this._updateBindings( this.getForRender( renderObject ) );

	}

	_updateBindings( bindings ) {

		for ( const bindGroup of bindings ) {

			this._update( bindGroup, bindings );

		}

	}

	_init( bindGroup ) {

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isSampledTexture ) {

				this.textures.updateTexture( binding.texture );

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;
				const attributeType = attribute.isIndirectStorageBufferAttribute ? AttributeType.INDIRECT : AttributeType.STORAGE;

				this.attributes.update( attribute, attributeType );

			}

		}

	}

	_update( bindGroup, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;
		let cacheBindings = true;
		let cacheIndex = 0;
		let version = 0;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isNodeUniformsGroup ) {

				const updated = this.nodes.updateGroup( binding );

				if ( ! updated ) continue;

			}

			if ( binding.isUniformBuffer ) {

				const updated = binding.update();

				if ( updated ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampler ) {

				binding.update();

			} else if ( binding.isSampledTexture ) {

				const texturesTextureData = this.textures.get( binding.texture );

				if ( binding.needsBindingsUpdate( texturesTextureData.generation ) ) needsBindingsUpdate = true;

				const updated = binding.update();

				const texture = binding.texture;

				if ( updated ) {

					this.textures.updateTexture( texture );

				}

				const textureData = backend.get( texture );

				if ( textureData.externalTexture !== undefined || texturesTextureData.isDefaultTexture ) {

					cacheBindings = false;

				} else {

					cacheIndex = cacheIndex * 10 + texture.id;
					version += texture.version;

				}

				if ( backend.isWebGPUBackend === true && textureData.texture === undefined && textureData.externalTexture === undefined ) {

					// TODO: Remove this once we found why updated === false isn't bound to a texture in the WebGPU backend
					console.error( 'Bindings._update: binding should be available:', binding, updated, texture, binding.textureNode.value, needsBindingsUpdate );

					this.textures.updateTexture( texture );
					needsBindingsUpdate = true;

				}

				if ( texture.isStorageTexture === true ) {

					const textureData = this.get( texture );

					if ( binding.store === true ) {

						textureData.needsMipmap = true;

					} else if ( this.textures.needsMipmaps( texture ) && textureData.needsMipmap === true ) {

						this.backend.generateMipmaps( texture );

						textureData.needsMipmap = false;

					}

				}

			}

		}

		if ( needsBindingsUpdate === true ) {

			this.backend.updateBindings( bindGroup, bindings, cacheBindings ? cacheIndex : 0, version );

		}

	}

}

export default Bindings;
