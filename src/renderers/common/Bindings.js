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

				this.backend.createBindings( bindGroup, bindings );

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

				this.backend.createBindings( bindGroup, bindings );

				groupData.bindGroup = bindGroup;

			}

		}

		return bindings;

	}

	updateForCompute( computeNode ) {

		this._updateBindings( computeNode, this.getForCompute( computeNode ) );

	}

	updateForRender( renderObject ) {

		this._updateBindings( renderObject, this.getForRender( renderObject ) );

	}

	_updateBindings( object, bindings ) {

		for ( const bindGroup of bindings ) {

			this._update( object, bindGroup, bindings );

		}

	}

	_init( bindGroup ) {

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isSampledTexture ) {

				this.textures.updateTexture( binding.texture );

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;

				this.attributes.update( attribute, AttributeType.STORAGE );

			}

		}

	}

	_update( object, bindGroup, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;

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

				const texture = binding.texture;

				if ( binding.needsBindingsUpdate ) needsBindingsUpdate = true;

				const updated = binding.update();

				if ( updated ) {

					this.textures.updateTexture( binding.texture );

				}

				const textureData = backend.get( binding.texture );

				if ( backend.isWebGPUBackend === true && textureData.texture === undefined && textureData.externalTexture === undefined ) {

					// TODO: Remove this once we found why updated === false isn't bound to a texture in the WebGPU backend
					console.error( 'Bindings._update: binding should be available:', binding, updated, binding.texture, binding.textureNode.value );

					this.textures.updateTexture( binding.texture );
					needsBindingsUpdate = true;

				}

				if ( texture.isStorageTexture === true ) {

					const textureData = this.get( texture );

					if ( binding.store === true ) {

						textureData.needsMipmap = true;

					} else if ( texture.generateMipmaps === true && this.textures.needsMipmaps( texture ) && textureData.needsMipmap === true ) {

						this.backend.generateMipmaps( texture );

						textureData.needsMipmap = false;

					}

				}

			}

		}

		if ( needsBindingsUpdate === true ) {

			const pipeline = this.pipelines.getForRender( object );

			this.backend.updateBindings( bindGroup, bindings, pipeline );

		}

	}

}

export default Bindings;
