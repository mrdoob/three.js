class WebGPUBindings {

	constructor( device, info, properties, textures, renderPipelines, computePipelines, attributes, nodes ) {

		this.device = device;
		this.info = info;
		this.properties = properties;
		this.textures = textures;
		this.renderPipelines = renderPipelines;
		this.computePipelines = computePipelines;
		this.attributes = attributes;
		this.nodes = nodes;

		this.uniformsData = new WeakMap();

		this.updateMap = new WeakMap();

	}

	get( object ) {

		let data = this.uniformsData.get( object );

		if ( data === undefined ) {

			// each object defines an array of bindings (ubos, textures, samplers etc.)

			const nodeBuilder = this.nodes.get( object );
			const bindings = nodeBuilder.getBindings();

			// setup (static) binding layout and (dynamic) binding group

			const renderPipeline = this.renderPipelines.get( object );

			const bindLayout = renderPipeline.pipeline.getBindGroupLayout( 0 );
			const bindGroup = this._createBindGroup( bindings, bindLayout );

			data = {
				layout: bindLayout,
				group: bindGroup,
				bindings: bindings
			};

			this.uniformsData.set( object, data );

		}

		return data;

	}

	getForCompute( param ) {

		let data = this.uniformsData.get( param );

		if ( data === undefined ) {

			// bindings are not yet retrieved via node material

			const bindings = param.bindings !== undefined ? param.bindings.slice() : [];

			const computePipeline = this.computePipelines.get( param );

			const bindLayout = computePipeline.getBindGroupLayout( 0 );
			const bindGroup = this._createBindGroup( bindings, bindLayout );

			data = {
				layout: bindLayout,
				group: bindGroup,
				bindings: bindings
			};

			this.uniformsData.set( param, data );

		}

		return data;

	}

	update( object, camera ) {

		const textures = this.textures;

		const data = this.get( object );
		const bindings = data.bindings;

		const updateMap = this.updateMap;
		const frame = this.info.render.frame;

		let needsBindGroupRefresh = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindings ) {

			const isShared = binding.isShared;
			const isUpdated = updateMap.get( binding ) === frame;

			if ( isShared && isUpdated ) continue;

			if ( binding.isUniformBuffer ) {

				const buffer = binding.getBuffer();
				const bufferGPU = binding.bufferGPU;

				const needsBufferWrite = binding.update();

				if ( needsBufferWrite === true ) {

					this.device.queue.writeBuffer(
						bufferGPU,
						0,
						buffer,
						0
					);

				}

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;
				this.attributes.update( attribute, false, binding.usage );

			} else if ( binding.isSampler ) {

				const texture = binding.getTexture();

				textures.updateSampler( texture );

				const samplerGPU = textures.getSampler( texture );

				if ( binding.samplerGPU !== samplerGPU ) {

					binding.samplerGPU = samplerGPU;
					needsBindGroupRefresh = true;

				}

			} else if ( binding.isSampledTexture ) {

				const texture = binding.getTexture();

				const forceUpdate = textures.updateTexture( texture );
				const textureGPU = textures.getTextureGPU( texture );

				if ( binding.textureGPU !== textureGPU || forceUpdate === true ) {

					binding.textureGPU = textureGPU;
					needsBindGroupRefresh = true;

				}

			}

			updateMap.set( binding, frame );

		}

		if ( needsBindGroupRefresh === true ) {

			data.group = this._createBindGroup( bindings, data.layout );

		}

	}

	dispose() {

		this.uniformsData = new WeakMap();
		this.updateMap = new WeakMap();

	}

	_createBindGroup( bindings, layout ) {

		let bindingPoint = 0;
		const entries = [];

		for ( const binding of bindings ) {

			if ( binding.isUniformBuffer ) {

				if ( binding.bufferGPU === null ) {

					const byteLength = binding.getByteLength();

					binding.bufferGPU = this.device.createBuffer( {
						size: byteLength,
						usage: binding.usage,
					} );

				}

				entries.push( { binding: bindingPoint, resource: { buffer: binding.bufferGPU } } );

			} else if ( binding.isStorageBuffer ) {

				if ( binding.bufferGPU === null ) {

					const attribute = binding.attribute;

					this.attributes.update( attribute, false, binding.usage );
					binding.bufferGPU = this.attributes.get( attribute ).buffer;

				}

				entries.push( { binding: bindingPoint, resource: { buffer: binding.bufferGPU } } );

			} else if ( binding.isSampler ) {

				if ( binding.samplerGPU === null ) {

					binding.samplerGPU = this.textures.getDefaultSampler();

				}

				entries.push( { binding: bindingPoint, resource: binding.samplerGPU } );

			} else if ( binding.isSampledTexture ) {

				if ( binding.textureGPU === null ) {

					if ( binding.isSampledCubeTexture ) {

						binding.textureGPU = this.textures.getDefaultCubeTexture();

					} else {

						binding.textureGPU = this.textures.getDefaultTexture();

					}

				}

				entries.push( { binding: bindingPoint, resource: binding.textureGPU.createView( { dimension: binding.dimension } ) } );

			}

			bindingPoint ++;

		}

		return this.device.createBindGroup( {
			layout: layout,
			entries: entries
		} );

	}

}

export default WebGPUBindings;
