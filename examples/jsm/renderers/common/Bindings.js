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

		this.updateMap = new WeakMap();

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

		const updateMap = this.updateMap;
		const frame = this.info.render.frame;

		let needsBindingsUpdate = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindings ) {

			const isUpdated = updateMap.get( binding ) === frame;

			if ( isUpdated ) continue;

			if ( binding.isUniformBuffer ) {

				const needsUpdate = binding.update();

				if ( needsUpdate ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampledTexture ) {

				if ( binding.needsBindingsUpdate ) needsBindingsUpdate = true;

				const needsUpdate = binding.update();

				if ( needsUpdate ) {

					this.textures.updateTexture( binding.texture );

				}

			}

			updateMap.set( binding, frame );

		}

		if ( needsBindingsUpdate === true ) {

			const pipeline = this.pipelines.getForRender( object );

			this.backend.updateBindings( bindings, pipeline );

		}

	}

	dispose() {

		super.dispose();

		this.updateMap = new WeakMap();

	}

}

export default Bindings;
