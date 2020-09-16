import WebGPUBinding from './WebGPUBinding.js';

class WebGPUUniformsGroup extends WebGPUBinding {

	constructor() {

		super();

		this.name = '';

		 // the order of uniforms in this array must match the order of uniforms in the shader

		this.uniforms = [];

		this.onBeforeUpdate = function () {};

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

	addUniform( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	removeUniform( uniform ) {

		const index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) {

			this.uniforms.splice( index, 1 );

		}

		return this;

	}

	setOnBeforeUpdate( callback ) {

		this.onBeforeUpdate = callback;

		return this;

	}

	copy( source ) {

		this.name = source.name;

		this.uniforms.length = 0;
		this.uniforms.push( ...source.uniforms );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	getByteLength() {

		let byteLength = 0;

		for ( const uniform of this.uniforms ) {

			byteLength += uniform.byteLength;

		}

		return byteLength;

	}

	update() {

		let updated = false;
		let offset = 0;

		for ( const uniform of this.uniforms ) {

			if ( this.updateByType( uniform, offset ) === true ) {

				updated = true;

			}

			offset += uniform.itemSize;

		}

		return updated;

	}

	updateByType( uniform, offset ) {

		if ( uniform.isFloatUniform ) return this.updateNumber( uniform, offset );
		if ( uniform.isVector2Uniform ) return this.updateVector2( uniform, offset );
		if ( uniform.isVector3Uniform ) return this.updateVector3( uniform, offset );
		if ( uniform.isVector4Uniform ) return this.updateVector4( uniform, offset );
		if ( uniform.isColorUniform ) return this.updateColor( uniform, offset );
		if ( uniform.isMatrix3Uniform ) return this.updateMatrix3( uniform, offset );
		if ( uniform.isMatrix4Uniform ) return this.updateMatrix4( uniform, offset );

		console.error( 'THREE.WebGPUUniformsGroup: Unsupported uniform type.', uniform );

	}

	updateNumber( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const v = uniform.value;

		if ( a[ offset ] !== v ) {

			a[ offset ] = v;
			updated = true;

		}

		return updated;

	}

	updateVector2( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const v = uniform.value;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;

			updated = true;

		}

		return updated;

	}

	updateVector3( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const v = uniform.value;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateVector4( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const v = uniform.value;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z || a[ offset + 4 ] !== v.w ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;
			a[ offset + 3 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateColor( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const c = uniform.value;

		if ( a[ offset + 0 ] !== c.r || a[ offset + 1 ] !== c.g || a[ offset + 2 ] !== c.b ) {

			a[ offset + 0 ] = c.r;
			a[ offset + 1 ] = c.g;
			a[ offset + 2 ] = c.b;

			updated = true;

		}

		return updated;

	}

	updateMatrix3( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const e = uniform.value.elements;

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

	updateMatrix4( uniform, offset ) {

		let updated = false;

		const a = this.array;
		const e = uniform.value.elements;

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
