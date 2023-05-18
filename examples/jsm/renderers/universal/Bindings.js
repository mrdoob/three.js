import DataMap from './DataMap.js';

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

		let data = this.get( renderObject );

		if ( data.bindings !== bindings ) {

			// each object defines an array of bindings (ubos, textures, samplers etc.)

			data.bindings = bindings;

			this._init( bindings );

			const pipline = this.pipelines.getForRender( renderObject );

			this.backend.createBindings( bindings, pipline );

		}

		return data.bindings;

	}

	getForCompute( computeNode ) {

		let data = this.get( computeNode );

		if ( data.bindings === undefined ) {

			const nodeBuilder = this.nodes.getForCompute( computeNode );

			data.bindings = nodeBuilder.getBindings();

			this._init( data );

			const pipeline = this.pipelines.getForCompute( computeNode );

			this.backend.createBindings( data, pipeline );

			this.uniformBindings.set( computeNode, data );

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

			if ( binding.isSampler || binding.isSampledTexture ) {

				this.textures.initTexture( binding.texture );

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

			const isShared = binding.isShared;
			const isUpdated = updateMap.get( binding ) === frame;

			if ( isShared && isUpdated ) continue;

			if ( binding.isUniformBuffer ) {

				const needsBufferWrite = binding.update();

				if ( needsBufferWrite ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampledTexture ) {

				const needsTextureUpdate = binding.update();

				if ( needsTextureUpdate ) {

					this.textures.updateTexture( binding.texture );

					needsBindingsUpdate = true;

				}

			} else if ( binding.isStorageBuffer ) {

				//const attribute = binding.attribute;

			} else if ( binding.isSampler ) {
/*
				const texture = binding.getTexture();

				textures.updateSampler( texture );

				const samplerGPU = textures.getSampler( texture );

				if ( binding.samplerGPU !== samplerGPU ) {

					binding.samplerGPU = samplerGPU;
					needsBindGroupRefresh = true;

				}
*/
			} 

			updateMap.set( binding, frame );

		}

		if ( needsBindingsUpdate === true ) {

			//this.pipelines.getPipeline( object )
			const pipline = this.pipelines.getForRender( object );
			
			this.backend.updateBindings( bindings, pipline );

		}

	}

	dispose() {

		super.dispose();

		this.updateMap = new WeakMap();

	}

}

export default Bindings;
