import WebGPUBinding from './WebGPUBinding.js';

class WebGPUUniformsGroup extends WebGPUBinding {

	constructor() {

		super();

		this.name = '';
		this.uniforms = new Map();

		this.update = function () {};

		this.type = 'uniform-buffer';
		this.visibility = GPUShaderStage.VERTEX;

		this.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

		this.array = null; // set by the renderer
		this.bufferGPU = null; // set by the renderer

		Object.defineProperty( this, 'isUniformsGroup', { value: true } );

	}

	setName( name ) {

		this.name = name;

	}

	setUniform( name, uniform ) {

		this.uniforms.set( name, uniform );

		return this;

	}

	removeUniform( name ) {

		this.uniforms.delete( name );

		return this;

	}

	setUpdateCallback( callback ) {

		this.update = callback;

		return this;

	}

	copy( source ) {

		this.name = source.name;

		const uniformsSource = source.uniforms;

		this.uniforms.clear();

		for ( const entry of uniformsSource ) {

			this.uniforms.set( ...entry );

		}

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	getByteLength() {

		let size = 0;

		for ( const uniform of this.uniforms.values() ) {

			size += this.getUniformByteLength( uniform );

		}

		return size;

	}

	getUniformByteLength( uniform ) {

		let size;

		if ( typeof uniform === 'number' ) {

			size = 4;

		} else if ( uniform.isVector2 ) {

			size = 8;

		} else if ( uniform.isVector3 || uniform.isColor ) {

			size = 12;

		} else if ( uniform.isVector4 ) {

			size = 16;

		} else if ( uniform.isMatrix3 ) {

			size = 36;

		} else if ( uniform.isMatrix4 ) {

			size = 64;

		} else if ( uniform.isTexture ) {

			console.warn( 'THREE.UniformsGroup: Texture samplers can not be part of an uniforms group.' );

		} else {

			console.warn( 'THREE.UniformsGroup: Unsupported uniform value type.', uniform );

		}

		return size;

	}

}

export default WebGPUUniformsGroup;
