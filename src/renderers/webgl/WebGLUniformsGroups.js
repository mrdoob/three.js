function WebGLUniformsGroups( gl, info, capabilities, state ) {

	let buffers = {};
	let updateList = {};
	let allocatedBindingPoints = [];

	const maxBindingPoints = ( capabilities.isWebGL2 ) ? gl.getParameter( gl.MAX_UNIFORM_BUFFER_BINDINGS ) : 0; // binding points are global whereas block indices are per shader program

	function bind( uniformsGroup, program ) {

		const webglProgram = program.program;
		state.uniformBlockBinding( uniformsGroup, webglProgram );

	}

	function update( uniformsGroup, program ) {

		let buffer = buffers[ uniformsGroup.id ];

		if ( buffer === undefined ) {

			prepareUniformsGroup( uniformsGroup );

			buffer = createBuffer( uniformsGroup );
			buffers[ uniformsGroup.id ] = buffer;

			uniformsGroup.addEventListener( 'dispose', onUniformsGroupsDispose );

		}

		// ensure to update the binding points/block indices mapping for this program

		const webglProgram = program.program;
		state.updateUBOMapping( uniformsGroup, webglProgram );

		// update UBO once per frame

		const frame = info.render.frame;

		if ( updateList[ uniformsGroup.id ] !== frame ) {

			updateBufferData( uniformsGroup );

			updateList[ uniformsGroup.id ] = frame;

		}

	}

	function createBuffer( uniformsGroup ) {

		// the setup of an UBO is independent of a particular shader program but global

		const bindingPointIndex = allocateBindingPointIndex();
		uniformsGroup.__bindingPointIndex = bindingPointIndex;

		const buffer = gl.createBuffer();
		const size = uniformsGroup.__size;
		const usage = uniformsGroup.usage;

		gl.bindBuffer( gl.UNIFORM_BUFFER, buffer );
		gl.bufferData( gl.UNIFORM_BUFFER, size, usage );
		gl.bindBuffer( gl.UNIFORM_BUFFER, null );
		gl.bindBufferBase( gl.UNIFORM_BUFFER, bindingPointIndex, buffer );

		return buffer;

	}

	function allocateBindingPointIndex() {

		for ( let i = 0; i < maxBindingPoints; i ++ ) {

			if ( allocatedBindingPoints.indexOf( i ) === - 1 ) {

				allocatedBindingPoints.push( i );
				return i;

			}

		}

		console.error( 'THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.' );

		return 0;

	}

	function updateBufferData( uniformsGroup ) {

		const buffer = buffers[ uniformsGroup.id ];
		const uniforms = uniformsGroup.uniforms;
		const cache = uniformsGroup.__cache;

		gl.bindBuffer( gl.UNIFORM_BUFFER, buffer );

		for ( let i = 0, il = uniforms.length; i < il; i ++ ) {

			const uniform = uniforms[ i ];

			// partly update the buffer if necessary

			if ( hasUniformChanged( uniform, i, cache ) === true ) {

				const value = uniform.value;
				const offset = uniform.__offset;

				if ( typeof value === 'number' ) {

					uniform.__data[ 0 ] = value;
					gl.bufferSubData( gl.UNIFORM_BUFFER, offset, uniform.__data );

				} else {

					if ( uniform.value.isMatrix3 ) {

						// manually converting 3x3 to 3x4

						uniform.__data[ 0 ] = uniform.value.elements[ 0 ];
						uniform.__data[ 1 ] = uniform.value.elements[ 1 ];
						uniform.__data[ 2 ] = uniform.value.elements[ 2 ];
						uniform.__data[ 3 ] = uniform.value.elements[ 0 ];
						uniform.__data[ 4 ] = uniform.value.elements[ 3 ];
						uniform.__data[ 5 ] = uniform.value.elements[ 4 ];
						uniform.__data[ 6 ] = uniform.value.elements[ 5 ];
						uniform.__data[ 7 ] = uniform.value.elements[ 0 ];
						uniform.__data[ 8 ] = uniform.value.elements[ 6 ];
						uniform.__data[ 9 ] = uniform.value.elements[ 7 ];
						uniform.__data[ 10 ] = uniform.value.elements[ 8 ];
						uniform.__data[ 11 ] = uniform.value.elements[ 0 ];

					} else {

						value.toArray( uniform.__data );

					}

					gl.bufferSubData( gl.UNIFORM_BUFFER, offset, uniform.__data );

				}

			}

		}

		gl.bindBuffer( gl.UNIFORM_BUFFER, null );

	}

	function hasUniformChanged( uniform, index, cache ) {

		const value = uniform.value;

		if ( cache[ index ] === undefined ) {

			// cache entry does not exist so far

			if ( typeof value === 'number' ) {

				cache[ index ] = value;

			} else {

				cache[ index ] = value.clone();

			}

			return true;

		} else {

			// compare current value with cached entry

			if ( typeof value === 'number' ) {

				if ( cache[ index ] !== value ) {

					cache[ index ] = value;
					return true;

				}

			} else {

				const cachedObject = cache[ index ];

				if ( cachedObject.equals( value ) === false ) {

					cachedObject.copy( value );
					return true;

				}

			}

		}

		return false;

	}

	function prepareUniformsGroup( uniformsGroup ) {

		// determine total buffer size according to the STD140 layout
		// Hint: STD140 is the only supported layout in WebGL 2

		const uniforms = uniformsGroup.uniforms;

		let offset = 0; // global buffer offset in bytes
		const chunkSize = 16; // size of a chunk in bytes
		let chunkOffset = 0; // offset within a single chunk in bytes

		for ( let i = 0, l = uniforms.length; i < l; i ++ ) {

			const uniform = uniforms[ i ];
			const info = getUniformSize( uniform );

			// the following two properties will be used for partial buffer updates

			uniform.__data = new Float32Array( info.storage / Float32Array.BYTES_PER_ELEMENT );
			uniform.__offset = offset;

			//

			if ( i > 0 ) {

				chunkOffset = offset % chunkSize;

				const remainingSizeInChunk = chunkSize - chunkOffset;

				// check for chunk overflow

				if ( chunkOffset !== 0 && ( remainingSizeInChunk - info.boundary ) < 0 ) {

					// add padding and adjust offset

					offset += ( chunkSize - chunkOffset );
					uniform.__offset = offset;

				}

			}

			offset += info.storage;

		}

		// ensure correct final padding

		chunkOffset = offset % chunkSize;

		if ( chunkOffset > 0 ) offset += ( chunkSize - chunkOffset );

		//

		uniformsGroup.__size = offset;
		uniformsGroup.__cache = {};

		return this;

	}

	function getUniformSize( uniform ) {

		const value = uniform.value;

		const info = {
			boundary: 0, // bytes
			storage: 0 // bytes
		};

		// determine sizes according to STD140

		if ( typeof value === 'number' ) {

			// float/int

			info.boundary = 4;
			info.storage = 4;

		} else if ( value.isVector2 ) {

			// vec2

			info.boundary = 8;
			info.storage = 8;

		} else if ( value.isVector3 || value.isColor ) {

			// vec3

			info.boundary = 16;
			info.storage = 12; // evil: vec3 must start on a 16-byte boundary but it only consumes 12 bytes

		} else if ( value.isVector4 ) {

			// vec4

			info.boundary = 16;
			info.storage = 16;

		} else if ( value.isMatrix3 ) {

			// mat3 (in STD140 a 3x3 matrix is represented as 3x4)

			info.boundary = 48;
			info.storage = 48;

		} else if ( value.isMatrix4 ) {

			// mat4

			info.boundary = 64;
			info.storage = 64;

		} else if ( value.isTexture ) {

			console.warn( 'THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.' );

		} else {

			console.warn( 'THREE.WebGLRenderer: Unsupported uniform value type.', value );

		}

		return info;

	}

	function onUniformsGroupsDispose( event ) {

		const uniformsGroup = event.target;

		uniformsGroup.removeEventListener( 'dispose', onUniformsGroupsDispose );

		const index = allocatedBindingPoints.indexOf( uniformsGroup.__bindingPointIndex );
		allocatedBindingPoints.splice( index, 1 );

		gl.deleteBuffer( buffers[ uniformsGroup.id ] );

		delete buffers[ uniformsGroup.id ];
		delete updateList[ uniformsGroup.id ];

	}

	function dispose() {

		for ( const id in buffers ) {

			gl.deleteBuffer( buffers[ id ] );

		}

		allocatedBindingPoints = [];
		buffers = {};
		updateList = {};

	}

	return {

		bind: bind,
		update: update,

		dispose: dispose

	};

}


export { WebGLUniformsGroups };
