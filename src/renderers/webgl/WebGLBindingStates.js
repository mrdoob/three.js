/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author Takahiro / https://github.com/takahirox
 */

function WebGLBindingStates( gl, extensions, state, attributes, capabilities ) {

	var maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );

	var extension = extensions.get( 'OES_vertex_array_object' );
	var vaoAvailable = capabilities.isWebGL2 || extension !== null;

	var bindingStates = new Map();

	var defaultState = createBindingState( null );
	var currentState = defaultState;

	function setup( material, program, geometry, hasMorphTarget ) {

		var state = getBindingState( geometry, program, material );

		if ( currentState !== state ) {

			currentState = state;
			bindVertexArrayObject( currentState.object );

		}

		var updateBuffers = hasMorphTarget;

		if ( vaoAvailable ) {

			if ( geometry.version > currentState.version ) {

				currentState.version = geometry.version;

				updateBuffers = true;

			}

		} else {

			var wireframe = material.wireframe === true;

			if ( currentState.geometry !== geometry.id ||
				currentState.program !== program.id ||
				currentState.wireframe !== wireframe ) {

				currentState.geometry = geometry.id;
				currentState.program = program.id;
				currentState.wireframe = wireframe;

				updateBuffers = true;

			}

		}

		if ( updateBuffers ) {

			setupVertexAttributes( material, program, geometry );

			if ( geometry.index !== null ) {

				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, attributes.get( geometry.index ).buffer );

			}

		}

	}

	function createVertexArrayObject() {

		if ( capabilities.isWebGL2 ) return gl.createVertexArray();

		return extension.createVertexArrayOES();

	}

	function bindVertexArrayObject( vao ) {

		if ( capabilities.isWebGL2 ) return gl.bindVertexArray( vao );

		return extension.bindVertexArrayOES( vao );

	}

	function deleteVertexArrayObject( vao ) {

		if ( capabilities.isWebGL2 ) return gl.deleteVertexArray( vao );

		return extension.deleteVertexArrayOES( vao );

	}

	function getBindingState( geometry, program, material ) {

		if ( ! vaoAvailable ) return defaultState;

		var wireframe = material.wireframe === true;

		if ( ! bindingStates.has( geometry ) ) {

			bindingStates.set( geometry, new Map() );

		}

		var geometryMap = bindingStates.get( geometry );

		if ( ! geometryMap.has( program ) ) {

			geometryMap.set( program, new Map() );

		}

		var programMap = geometryMap.get( program );

		if ( ! programMap.has( wireframe ) ) {

			programMap.set( wireframe, createBindingState( createVertexArrayObject() ) );

		}

		return programMap.get( wireframe );

	}

	function createBindingState( vao ) {

		return {

			// for backward compatibility on non-VAO support browser
			geometry: null,
			program: null,
			wireframe: false,

			newAttributes: new Uint8Array( maxVertexAttributes ),
			enabledAttributes: new Uint8Array( maxVertexAttributes ),
			attributeDivisors: new Uint8Array( maxVertexAttributes ),
			object: vao,
			version: - 1

		};

	}

	function initAttributes() {

		var newAttributes = currentState.newAttributes;

		for ( var i = 0, il = newAttributes.length; i < il; i ++ ) {

			newAttributes[ i ] = 0;

		}

	}

	function enableAttribute( attribute ) {

		enableAttributeAndDivisor( attribute, 0 );

	}

	function enableAttributeAndDivisor( attribute, meshPerAttribute ) {

		var newAttributes = currentState.newAttributes;
		var enabledAttributes = currentState.enabledAttributes;
		var attributeDivisors = currentState.attributeDivisors;

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

		if ( attributeDivisors[ attribute ] !== meshPerAttribute ) {

			var extension = capabilities.isWebGL2 ? gl : extensions.get( 'ANGLE_instanced_arrays' );

			extension[ capabilities.isWebGL2 ? 'vertexAttribDivisor' : 'vertexAttribDivisorANGLE' ]( attribute, meshPerAttribute );
			attributeDivisors[ attribute ] = meshPerAttribute;

		}

	}

	function disableUnusedAttributes() {

		var newAttributes = currentState.newAttributes;
		var enabledAttributes = currentState.enabledAttributes;

		for ( var i = 0, il = enabledAttributes.length; i < il; i ++ ) {

			if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

	}

	function setupVertexAttributes( material, program, geometry ) {

		if ( geometry && geometry.isInstancedBufferGeometry & ! capabilities.isWebGL2 ) {

			if ( extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

				console.error( 'THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		initAttributes();

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

							enableAttributeAndDivisor( programAttribute, data.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							enableAttribute( programAttribute );

						}

						gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
						gl.vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, offset * bytesPerElement );

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							enableAttribute( programAttribute );

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

		disableUnusedAttributes();

	}

	function dispose() {

		reset();

		bindingStates.forEach( function ( geometryMap ) {

			geometryMap.forEach( function ( programMap ) {

				programMap.forEach( function ( state ) {

					deleteVertexArrayObject( state.object );

				} );

				programMap.clear();

			} );

			geometryMap.clear();

		} );

		bindingStates.clear();

	}

	function reset() {

		defaultState.geometry = null;
		defaultState.program = null;
		defaultState.wireframe = false;

		if ( currentState === defaultState ) return;

		currentState = defaultState;
		bindVertexArrayObject( currentState.object );

	}

	return {

		setup: setup,
		reset: reset,
		dispose: dispose,

		initAttributes: initAttributes,
		enableAttribute: enableAttribute,
		disableUnusedAttributes: disableUnusedAttributes

	};

}


export { WebGLBindingStates };
