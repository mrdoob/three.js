import WebGPUUniformsGroup from './WebGPUUniformsGroup.js';
import WebGPUSampler from './WebGPUSampler.js';
import WebGPUSampledTexture from './WebGPUSampledTexture.js';
import { Matrix3, Matrix4, Vector2, Vector3, Vector4 } from '../../../../build/three.module.js';

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

	// Here taking shaderUniforms is what I don't really like.
	// To set up bindings, uniforms information in shader is necessary.
	// But just getting existing bindings doesn't need uniforms information.
	// I moved bindings.update() in WebGPURenderer after render pipeline get/creation
	// (See _renderObject() in WebGPURenderer), and bindings.get() in WebGPURenderPipelines
	// is only the place where bindings setup can cause now.
	// So passing bindings.get() call in WebGPURenderPipelines passes shaderUniforms
	// and other bindings.get() doesn't pass.
	// I don't think this is a good design and want to simplify...

	get( object, shaderUniforms ) {

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

			} else if ( material.isShaderMaterial ) {

				bindings = this._getShaderBindings( material, shaderUniforms );

			} else {

				console.error( 'THREE.WebGPURenderer: Unknwon shader type.' );

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

		const textures = this.textures;

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

				const needsBufferWrite = binding.update( object, camera );

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

				// Here may be tricky.
				// Needs to search texture.
				// Assuming binding name has path from material to texture
				// separated by '.', like "map" or "uniforms.mySampler.value".
				// I want to simplify.

				const names = binding.name.split( '.' );
				let target = material;

				for ( const name of names ) {

					target = target[ name ];

				}

				const texture = target;

				textures.updateSampler( texture );

				const samplerGPU = textures.getSampler( texture );

				if ( binding.samplerGPU !== samplerGPU ) {

					binding.samplerGPU = samplerGPU;
					needsBindGroupRefresh = true;

				}

			} else if ( binding.isSampledTexture ) {

				const material = object.material;

				const names = binding.name.split( '.' );
				let target = material;

				for ( const name of names ) {

					target = target[ name ];

				}

				const texture = target;

				const forceUpdate = textures.updateTexture( texture );
				const textureGPU = textures.getTextureGPU( texture );

				if ( binding.textureGPU !== textureGPU || forceUpdate === true ) {

					binding.textureGPU = textureGPU;
					needsBindGroupRefresh = true;

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
		modelGroup.setUpdateCallback( function ( object/*, camera */ ) {

			let updated = false;

			if ( modelGroup.updateMatrix4( object.matrixWorld, 0 ) ) updated = true;
			if ( modelGroup.updateMatrix4( object.modelViewMatrix, 16 ) ) updated = true;

			return updated;

		} );

		const cameraGroup = this.sharedUniformsGroups.get( 'cameraUniforms' );

		const opacityGroup = new WebGPUUniformsGroup();
		opacityGroup.setName( 'opacityUniforms' );
		opacityGroup.setUniform( 'opacity', 1.0 );
		opacityGroup.visibility = GPUShaderStage.FRAGMENT;
		opacityGroup.setUpdateCallback( function ( object/*, camera */ ) {

			const material = object.material;
			const opacity = ( material.transparent === true ) ? material.opacity : 1.0;

			return opacityGroup.updateNumber( opacity, 0 );

		} );

		// samplers

		const diffuseSampler = new WebGPUSampler();
		diffuseSampler.setName( 'map' );

		// textures

		const diffuseTexture = new WebGPUSampledTexture();
		diffuseTexture.setName( 'map' );

		//

		bindings.push( modelGroup );
		bindings.push( cameraGroup );
		bindings.push( opacityGroup );
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
		modelGroup.setUpdateCallback( function ( object/*, camera */ ) {

			let updated = false;

			if ( modelGroup.updateMatrix4( object.matrixWorld, 0 ) ) updated = true;
			if ( modelGroup.updateMatrix4( object.modelViewMatrix, 16 ) ) updated = true;

			return updated;

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
		modelGroup.setUpdateCallback( function ( object/*, camera */ ) {

			let updated = false;

			if ( modelGroup.updateMatrix4( object.matrixWorld, 0 ) ) updated = true;
			if ( modelGroup.updateMatrix4( object.modelViewMatrix, 16 ) ) updated = true;

			return updated;

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
		cameraGroup.setUpdateCallback( function ( object, camera ) {

			let updated = false;

			if ( cameraGroup.updateMatrix4( camera.projectionMatrix, 0 ) ) updated = true;
			if ( cameraGroup.updateMatrix4( camera.matrixWorldInverse, 16 ) ) updated = true;

			return updated;

		} );

		this.sharedUniformsGroups.set( cameraGroup.name, cameraGroup );

	}

	_getShaderBindings( material, shaderUniforms ) {

		// Creates bindings from shader uniforms information

		const bindings = [];

		for ( const shaderUniform of shaderUniforms ) {

			const name = shaderUniform.name;
			const type = shaderUniform.type;
			const groupType = shaderUniform.groupType;
			const visibility = shaderUniform.visibility === 'vertex|fragment' ? GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT :
				shaderUniform.visibility === 'vertex' ? GPUShaderStage.VERTEX : GPUShaderStage.FRAGMENT;
			let group;

			if ( name === 'modelUniforms' ) {

				// Reserved name 'modelUniforms'

				group = new WebGPUUniformsGroup();
				group.setName( name );
				group.visibility = visibility;
				group.setUniform( 'modelMatrix', new Matrix4() );
				group.setUniform( 'modelViewMatrix', new Matrix4() );

				group.setUpdateCallback( function ( object/*, camera */ ) {

					let updated = false;

					if ( this.updateMatrix4( object.matrixWorld, 0 ) ) updated = true;
					if ( this.updateMatrix4( object.modelViewMatrix, 16 ) ) updated = true;

					return updated;

				} );

			} else if ( name === 'cameraUniforms' ) {

				// Reserved name 'cameraUniforms'

				group = this.sharedUniformsGroups.get( 'cameraUniforms' );

			} else if ( groupType === 'uniform-buffer' ) {

				group = new WebGPUUniformsGroup();
				group.setName( name );
				group.visibility = visibility;

				const entries = shaderUniform.entries;

				for ( const entry of entries ) {

					group.setUniform( entry.name, getInitialValue( entry.type ) );

				}

				group.setUpdateCallback( function ( array, object/*, camera */ ) {

					const values = material.uniforms[ name ].value;
					let offset = 0;
					let updated = false;

					for ( let i = 0; i < entries.length; i ++ ) {

						const entry = entries[ i ];
						const value = values[ i ];
						if ( this.updateByType( value, offset ) ) updated = true;
						offset += this.getUniformByteLength( value ) / 4; // Assuming array is Float32 so far

					}

					return updated;

				} );

			} else if ( groupType === 'sampler' ) {

				group = new WebGPUSampler();
				group.setName( 'uniforms.' + name + '.value' );
				group.visibility = visibility;

			} else if ( groupType === 'sampled-texture' ) {

				group = new WebGPUSampledTexture();
				group.setName( 'uniforms.' + name + '.value' );
				group.visibility = visibility;

			} else {

				console.error( 'THREE.WebGPURenderer: Unknown uniform type ' + type );

			}

			bindings.push( group );

		}

		return bindings;

	}

}

function getInitialValue( type ) {

	switch ( type ) {
		case 'float':
			return 0.0;
		case 'vec2':
			return new Vector2();
		case 'vec3':
			return new Vector3();
		case 'vec4':
			return new Vector4();
		case 'mat3':
			return new Matrix3();
		case 'mat4':
			return new Matrix4();
	}

	console.error( 'THREE.WebGPURenderer: Unknown uniform type ' + type );

}

export default WebGPUBindings;
