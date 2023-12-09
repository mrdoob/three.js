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

		const data = this.get( renderObject );

		if ( data.bindings !== bindings ) {

			// each object defines an array of bindings (ubos, textures, samplers etc.)

			data.bindings = bindings;

			this._init( bindings );

			this.backend.createBindings( bindings );

		}

		return data.bindings;

	}

	getForCompute( computeNode ) {

		const data = this.get( computeNode );

		if ( data.bindings === undefined ) {

			const nodeBuilderState = this.nodes.getForCompute( computeNode );

			const bindings = nodeBuilderState.bindings.compute;

			data.bindings = bindings;

			this._init( bindings );

			this.backend.createBindings( bindings );

		}

		return data.bindings;

	}

	updateForCompute( computeNode ) {

		this._update( computeNode, this.getForCompute( computeNode ) );

	}

	updateForRender( renderObject ) {

		this._update( renderObject, this.getForRender( renderObject ) );

	}

	_init( bindings ) {

		for ( const binding of bindings ) {

			if ( binding.isSampledTexture ) {

				this.textures.updateTexture( binding.texture );

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;

				this.attributes.update( attribute, AttributeType.STORAGE );

			}

		}

	}

	_update( object, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindings ) {

			if ( binding.isNodeUniformsGroup ) {

				const updated = this.nodes.updateGroup( binding );

				if ( ! updated ) continue;

			}

			if ( binding.isUniformBuffer ) {

				const updated = binding.update();

				if ( updated ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampledTexture ) {

				const texture = binding.texture;

				if ( binding.needsBindingsUpdate ) needsBindingsUpdate = true;

				const updated = binding.update();

				if ( updated ) {

					this.textures.updateTexture( binding.texture );

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

			this.backend.updateBindings( bindings, pipeline );

		}

	}

}

export default Bindings;
