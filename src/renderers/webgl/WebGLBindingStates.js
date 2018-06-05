/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function WebGLBindingStates( gl, extensions, state, attributes ) {

	var bindingStates = {};
	var extension = extensions.get( 'OES_vertex_array_object' );
	var currentGeometryProgram = '';

	function setup( material, program, geometry, index, hasMorphTarget ) {

		var geometryProgram = geometry.id + '_' + geometry.version + '_' + program.id + '_' + ( material.wireframe === true );

		// only use VAO if extension is available
		// if morph targets are present we render it the old way

		if ( extension && hasMorphTarget === false ) {

			state.enableVAO();

			var bindingState = bindingStates[ geometryProgram ];

			if ( bindingState === undefined ) {

				bindingState = createBindingState( material, program, geometry, index );
				bindingStates[ geometryProgram ] = bindingState;

			}

			extension.bindVertexArrayOES( bindingState );

		} else {

			state.disableVAO();

			if ( geometryProgram !== currentGeometryProgram ) {

				currentGeometryProgram = geometryProgram;

				setupVertexAttributes( material, program, geometry );
				setupElementArrayBuffer( index );

			}

		}

	}

	function createBindingState( material, program, geometry, index ) {

		var vao = extension.createVertexArrayOES();
		extension.bindVertexArrayOES( vao );

		setupVertexAttributes( material, program, geometry );
		setupElementArrayBuffer( index );

		extension.bindVertexArrayOES( null );

		return vao;

	}

	function setupVertexAttributes( material, program, geometry ) {

		if ( geometry && geometry.isInstancedBufferGeometry ) {

			if ( extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

				console.error( 'THREE.WebGLBindingStates.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		state.initAttributes();

		var geometryAttributes = geometry.attributes;

		var programAttributes = program.getAttributes();

		var materialDefaultAttributeValues = material.defaultAttributeValues;

		for ( var name in programAttributes ) {

			var programAttribute = programAttributes[ name ];

			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ name ];

				if ( geometryAttribute !== undefined ) {

					var normalized = geometryAttribute.normalized;
					var size = geometryAttribute.itemSize;

					var attribute = attributes.get( geometryAttribute );

					// TODO Attribute may not be available on context restore

					if ( attribute === undefined ) continue;

					var buffer = attribute.buffer;
					var type = attribute.type;
					var bytesPerElement = attribute.bytesPerElement;

					if ( geometryAttribute.isInterleavedBufferAttribute ) {

						var data = geometryAttribute.data;
						var stride = data.stride;
						var offset = geometryAttribute.offset;

						if ( data && data.isInstancedInterleavedBuffer ) {

							state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							state.enableAttribute( programAttribute );

						}

						gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
						gl.vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, offset * bytesPerElement );

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							state.enableAttribute( programAttribute );

						}

						gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
						gl.vertexAttribPointer( programAttribute, size, type, normalized, 0, 0 );

					}

				} else if ( materialDefaultAttributeValues !== undefined ) {

					var value = materialDefaultAttributeValues[ name ];

					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								gl.vertexAttrib2fv( programAttribute, value );
								break;

							case 3:
								gl.vertexAttrib3fv( programAttribute, value );
								break;

							case 4:
								gl.vertexAttrib4fv( programAttribute, value );
								break;

							default:
								gl.vertexAttrib1fv( programAttribute, value );

						}

					}

				}

			}

		}

		state.disableUnusedAttributes();

	}

	function setupElementArrayBuffer( index ) {

		if ( index !== null ) {

			var attribute = attributes.get( index );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, attribute.buffer );

		}

	}

	function resetBindingState() {

		if ( extension ) {

			extension.bindVertexArrayOES( null );

		}

	}

	function resetGeometryProgram() {

		currentGeometryProgram = '';

	}

	function dispose() {

		bindingStates = {};

	}

	return {
		setup: setup,
		dispose: dispose,

		resetBindingState: resetBindingState,
		resetGeometryProgram: resetGeometryProgram
	};

}


export { WebGLBindingStates };
