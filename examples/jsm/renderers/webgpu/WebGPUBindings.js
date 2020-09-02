import WebGPUUniformsGroup from './WebGPUUniformsGroup.js';
import WebGPUSampler from './WebGPUSampler.js';
import WebGPUSampledTexture from './WebGPUSampledTexture.js';
import { Matrix4 } from '../../../../build/three.module.js';

class WebGPUBindings {

	constructor( device, info, properties, textures ) {

		this.device = device;
		this.info = info;
		this.properties = properties;
		this.textures = textures;

		this.uniformsData = new WeakMap();

		this.sharedUniformsGroups = new Map();

		this.updateMap = new WeakMap();

		this._setupSharedUniformsGroups();

	}

	get( object ) {

		let data = this.uniformsData.get( object );

		if ( data === undefined ) {

			const material = object.material;
			let bindings;

			// each material defines an array of bindings (ubos, textures, samplers etc.)

			if ( material.isMeshBasicMaterial ) {

				bindings = this._getMeshBasicBindings();

			} else if ( material.isPointsMaterial ) {

				bindings = this._getPointsBasicBindings();

			} else if ( material.isLineBasicMaterial ) {

				bindings = this._getLinesBasicBindings();

			} else {

				console.error( 'WebGPURenderer: Unknwon shader type' );

			}

			// setup (static) binding layout and (dynamic) binding group

			const bindLayout = this._createBindLayout( bindings );
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

	update( object, camera ) {

		const data = this.get( object );
		const bindings = data.bindings;

		const updateMap = this.updateMap;
		const frame = this.info.render.frame;
		const sharedUniformsGroups = this.sharedUniformsGroups;

		let needsBindGroupRefresh = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup ) {

				const isShared = sharedUniformsGroups.has( binding.name );
				const isUpdated = updateMap.get( binding ) === frame;

				if ( isShared && isUpdated ) continue;

				const array = binding.array;
				const bufferGPU = binding.bufferGPU;

				const needsBufferWrite = binding.update( array, object, camera );

				if ( needsBufferWrite === true ) {

					this.device.defaultQueue.writeBuffer(
						bufferGPU,
						0,
						array,
						0
					);

				}

				updateMap.set( binding, frame );

			} else if ( binding.isSampler ) {

				const material = object.material;
				const texture = material[ binding.name ];

				needsBindGroupRefresh = this.textures.updateSampler( texture );

				if ( needsBindGroupRefresh === true ) {

					binding.samplerGPU = this.textures.getSampler( texture );

				}

			} else if ( binding.isSampledTexture ) {

				const material = object.material;
				const texture = material[ binding.name ];

				needsBindGroupRefresh = this.textures.updateTexture( texture );

				if ( needsBindGroupRefresh === true ) {

					binding.textureGPU = this.textures.getTextureGPU( texture );

				}

			}

		}

		if ( needsBindGroupRefresh === true ) {

			data.group = this._createBindGroup( bindings, data.layout );

		}

	}

	dispose() {

		this.uniformsData = new WeakMap();
		this.updateMap = new WeakMap();

	}

	_createBindLayout( bindings ) {

		let bindingPoint = 0;
		const entries = [];

		for ( const binding of bindings ) {

			entries.push( { binding: bindingPoint, visibility: binding.visibility, type: binding.type } );

			bindingPoint ++;

		}

		return this.device.createBindGroupLayout( { entries: entries } );

	}

	_createBindGroup( bindings, layout ) {

		let bindingPoint = 0;
		const entries = [];

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup ) {

				if ( binding.bufferGPU === null ) {

					const byteLength = binding.getByteLength();

					binding.array = new Float32Array( new ArrayBuffer( byteLength ) );

					binding.bufferGPU = this.device.createBuffer( {
						size: byteLength,
						usage: binding.usage,
					} );

				}

				entries.push( { binding: bindingPoint, resource: { buffer: binding.bufferGPU } } );

			} else if ( binding.isSampler ) {

				if ( binding.samplerGPU === null ) {

					binding.samplerGPU = this.textures.getDefaultSampler();

				}

				entries.push( { binding: bindingPoint, resource: binding.samplerGPU } );

			} else if ( binding.isSampledTexture ) {

				if ( binding.textureGPU === null ) {

					binding.textureGPU = this.textures.getDefaultTexture();

				}

				entries.push( { binding: bindingPoint, resource: binding.textureGPU.createView() } );

			}

			bindingPoint ++;

		}

		return this.device.createBindGroup( {
			layout: layout,
			entries: entries
		} );

	}

	_getMeshBasicBindings() {

		const bindings = [];

		// ubos

		const modelGroup = new WebGPUUniformsGroup();
		modelGroup.setName( 'modelUniforms' );
		modelGroup.setUniform( 'modelMatrix', new Matrix4() );
		modelGroup.setUniform( 'modelViewMatrix', new Matrix4() );
		modelGroup.setUpdateCallback( function ( array, object/*, camera */ ) {

			array.set( object.matrixWorld.elements, 0 );
			array.set( object.modelViewMatrix.elements, 16 );

			return true; // TODO: implement caching (return false when cache hits occurs)

		} );

		const cameraGroup = this.sharedUniformsGroups.get( 'cameraUniforms' );

		// samplers

		const diffuseSampler = new WebGPUSampler();
		diffuseSampler.setName( 'map' );

		// textures

		const diffuseTexture = new WebGPUSampledTexture();
		diffuseTexture.setName( 'map' );

		//

		bindings.push( modelGroup );
		bindings.push( cameraGroup );
		bindings.push( diffuseSampler );
		bindings.push( diffuseTexture );

		return bindings;

	}

	_getPointsBasicBindings() {

		const bindings = [];

		// ubos

		const modelGroup = new WebGPUUniformsGroup();
		modelGroup.setName( 'modelUniforms' );
		modelGroup.setUniform( 'modelMatrix', new Matrix4() );
		modelGroup.setUniform( 'modelViewMatrix', new Matrix4() );
		modelGroup.setUpdateCallback( function ( array, object/*, camera */ ) {

			array.set( object.matrixWorld.elements, 0 );
			array.set( object.modelViewMatrix.elements, 16 );

			return true; // TODO: implement caching (return false when cache hits occurs)

		} );

		const cameraGroup = this.sharedUniformsGroups.get( 'cameraUniforms' );

		//

		bindings.push( modelGroup );
		bindings.push( cameraGroup );

		return bindings;

	}

	_getLinesBasicBindings() {

		const bindings = [];

		// ubos

		const modelGroup = new WebGPUUniformsGroup();
		modelGroup.setName( 'modelUniforms' );
		modelGroup.setUniform( 'modelMatrix', new Matrix4() );
		modelGroup.setUniform( 'modelViewMatrix', new Matrix4() );
		modelGroup.setUpdateCallback( function ( array, object/*, camera */ ) {

			array.set( object.matrixWorld.elements, 0 );
			array.set( object.modelViewMatrix.elements, 16 );

			return true; // TODO: implement caching (return false when cache hits occurs)

		} );

		const cameraGroup = this.sharedUniformsGroups.get( 'cameraUniforms' );

		//

		bindings.push( modelGroup );
		bindings.push( cameraGroup );

		return bindings;

	}

	_setupSharedUniformsGroups() {

		const cameraGroup = new WebGPUUniformsGroup();
		cameraGroup.setName( 'cameraUniforms' );
		cameraGroup.setUniform( 'projectionMatrix', new Matrix4() );
		cameraGroup.setUniform( 'viewMatrix', new Matrix4() );
		cameraGroup.setUpdateCallback( function ( array, object, camera ) {

			array.set( camera.projectionMatrix.elements, 0 );
			array.set( camera.matrixWorldInverse.elements, 16 );

			return true; // TODO: implement caching (return false when cache hits occurs)

		} );

		this.sharedUniformsGroups.set( cameraGroup.name, cameraGroup );

	}

}

export default WebGPUBindings;
