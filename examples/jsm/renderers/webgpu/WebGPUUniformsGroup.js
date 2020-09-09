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

			size = 48; // (3 * 4) * 4 bytes

		} else if ( uniform.isMatrix4 ) {

			size = 64;

		} else if ( uniform.isTexture ) {

			console.error( 'THREE.UniformsGroup: Texture samplers can not be part of an uniforms group.' );

		} else {

			console.error( 'THREE.UniformsGroup: Unsupported uniform value type.', uniform );

		}

		return size;

	}

	updateNumber( v, offset ) {

		let updated = false;

		const a = this.array;

		if ( a[ offset ] !== v ) {

			a[ offset ] = v;
			updated = true;

		}

		return updated;

	}

	updateVector2( v, offset ) {

		let updated = false;

		const a = this.array;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;

			updated = true;

		}

		return updated;

	}

	updateVector3( v, offset ) {

		let updated = false;

		const a = this.array;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateVector4( v, offset ) {

		let updated = false;

		const a = this.array;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z || a[ offset + 4 ] !== v.w ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;
			a[ offset + 3 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateColor( c, offset ) {

		let updated = false;

		const a = this.array;

		if ( a[ offset + 0 ] !== c.r || a[ offset + 1 ] !== c.g || a[ offset + 2 ] !== c.b ) {

			a[ offset + 0 ] = c.r;
			a[ offset + 1 ] = c.g;
			a[ offset + 2 ] = c.b;

			updated = true;

		}

		return updated;

	}

	updateMatrix3( m, offset ) {

		let updated = false;

		const a = this.array;
		const e = m.elements;

		if ( a[ offset + 0 ] !== e[ 0 ] || a[ offset + 1 ] !== e[ 1 ] || a[ offset + 2 ] !== e[ 2 ] ||
			a[ offset + 4 ] !== e[ 3 ] || a[ offset + 5 ] !== e[ 4 ] || a[ offset + 6 ] !== e[ 5 ] ||
			a[ offset + 8 ] !== e[ 6 ] || a[ offset + 9 ] !== e[ 7 ] || a[ offset + 10 ] !== e[ 8 ] ) {

			a[ offset + 0 ] = e[ 0 ];
			a[ offset + 1 ] = e[ 1 ];
			a[ offset + 2 ] = e[ 2 ];
			a[ offset + 4 ] = e[ 3 ];
			a[ offset + 5 ] = e[ 4 ];
			a[ offset + 6 ] = e[ 5 ];
			a[ offset + 8 ] = e[ 6 ];
			a[ offset + 9 ] = e[ 7 ];
			a[ offset + 10 ] = e[ 8 ];

			updated = true;

		}

		return updated;

	}

	updateMatrix4( m, offset ) {

		let updated = false;

		const a = this.array;
		const e = m.elements;

		if ( arraysEqual( a, e, offset ) === false ) {

			a.set( e, offset );
			updated = true;

		}

		return updated;

	}

}

function arraysEqual( a, b, offset ) {

	for ( let i = 0, l = b.length; i < l; i ++ ) {

		if ( a[ offset + i ] !== b[ i ] ) return false;

	}

	return true;

}

export default WebGPUUniformsGroup;
