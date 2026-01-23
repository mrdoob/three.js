import { IntType } from '../../constants.js';

function WebGLBindingStates( gl, attributes ) {

	const maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );

	const bindingStates = {};

	const defaultState = createBindingState( null );
	let currentState = defaultState;
	let forceUpdate = false;

	function setup( object, material, program, geometry, index ) {

		let updateBuffers = false;

		const state = getBindingState( object, geometry, program, material );

		if ( currentState !== state ) {

			currentState = state;
			bindVertexArrayObject( currentState.object );

		}

		updateBuffers = needsUpdate( object, geometry, program, index );

		if ( updateBuffers ) saveCache( object, geometry, program, index );

		if ( index !== null ) {

			attributes.update( index, gl.ELEMENT_ARRAY_BUFFER );

		}

		if ( updateBuffers || forceUpdate ) {

			forceUpdate = false;

			setupVertexAttributes( object, material, program, geometry );

			if ( index !== null ) {

				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, attributes.get( index ).buffer );

			}

		}

	}

	function createVertexArrayObject() {

		return gl.createVertexArray();

	}

	function bindVertexArrayObject( vao ) {

		return gl.bindVertexArray( vao );

	}

	function deleteVertexArrayObject( vao ) {

		return gl.deleteVertexArray( vao );

	}

	function getBindingState( object, geometry, program, material ) {

		const wireframe = ( material.wireframe === true );

		let objectMap = bindingStates[ geometry.id ];

		if ( objectMap === undefined ) {

			objectMap = {};
			bindingStates[ geometry.id ] = objectMap;

		}

		// Each InstancedMesh requires unique binding states because it contains instanced attributes.
		const objectId = ( object.isInstancedMesh === true ) ? object.id : 0;

		let programMap = objectMap[ objectId ];

		if ( programMap === undefined ) {

			programMap = {};
			objectMap[ objectId ] = programMap;

		}

		let stateMap = programMap[ program.id ];

		if ( stateMap === undefined ) {

			stateMap = {};
			programMap[ program.id ] = stateMap;

		}

		let state = stateMap[ wireframe ];

		if ( state === undefined ) {

			state = createBindingState( createVertexArrayObject() );
			stateMap[ wireframe ] = state;

		}

		return state;

	}

	function createBindingState( vao ) {

		const newAttributes = [];
		const enabledAttributes = [];
		const attributeDivisors = [];

		for ( let i = 0; i < maxVertexAttributes; i ++ ) {

			newAttributes[ i ] = 0;
			enabledAttributes[ i ] = 0;
			attributeDivisors[ i ] = 0;

		}

		return {

			// for backward compatibility on non-VAO support browser
			geometry: null,
			program: null,
			wireframe: false,

			newAttributes: newAttributes,
			enabledAttributes: enabledAttributes,
			attributeDivisors: attributeDivisors,
			object: vao,
			attributes: {},
			index: null

		};

	}

	function needsUpdate( object, geometry, program, index ) {

		const cachedAttributes = currentState.attributes;
		const geometryAttributes = geometry.attributes;

		let attributesNum = 0;

		const programAttributes = program.getAttributes();

		for ( const name in programAttributes ) {

			const programAttribute = programAttributes[ name ];

			if ( programAttribute.location >= 0 ) {

				const cachedAttribute = cachedAttributes[ name ];
				let geometryAttribute = geometryAttributes[ name ];

				if ( geometryAttribute === undefined ) {

					if ( name === 'instanceMatrix' && object.instanceMatrix ) geometryAttribute = object.instanceMatrix;
					if ( name === 'instanceColor' && object.instanceColor ) geometryAttribute = object.instanceColor;

				}

				if ( cachedAttribute === undefined ) return true;

				if ( cachedAttribute.attribute !== geometryAttribute ) return true;

				if ( geometryAttribute && cachedAttribute.data !== geometryAttribute.data ) return true;

				attributesNum ++;

			}

		}

		if ( currentState.attributesNum !== attributesNum ) return true;

		if ( currentState.index !== index ) return true;

		return false;

	}

	function saveCache( object, geometry, program, index ) {

		const cache = {};
		const attributes = geometry.attributes;
		let attributesNum = 0;

		const programAttributes = program.getAttributes();

		for ( const name in programAttributes ) {

			const programAttribute = programAttributes[ name ];

			if ( programAttribute.location >= 0 ) {

				let attribute = attributes[ name ];

				if ( attribute === undefined ) {

					if ( name === 'instanceMatrix' && object.instanceMatrix ) attribute = object.instanceMatrix;
					if ( name === 'instanceColor' && object.instanceColor ) attribute = object.instanceColor;

				}

				const data = {};
				data.attribute = attribute;

				if ( attribute && attribute.data ) {

					data.data = attribute.data;

				}

				cache[ name ] = data;

				attributesNum ++;

			}

		}

		currentState.attributes = cache;
		currentState.attributesNum = attributesNum;

		currentState.index = index;

	}

	function initAttributes() {

		const newAttributes = currentState.newAttributes;

		for ( let i = 0, il = newAttributes.length; i < il; i ++ ) {

			newAttributes[ i ] = 0;

		}

	}

	function enableAttribute( attribute ) {

		enableAttributeAndDivisor( attribute, 0 );

	}

	function enableAttributeAndDivisor( attribute, meshPerAttribute ) {

		const newAttributes = currentState.newAttributes;
		const enabledAttributes = currentState.enabledAttributes;
		const attributeDivisors = currentState.attributeDivisors;

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

		if ( attributeDivisors[ attribute ] !== meshPerAttribute ) {

			gl.vertexAttribDivisor( attribute, meshPerAttribute );
			attributeDivisors[ attribute ] = meshPerAttribute;

		}

	}

	function disableUnusedAttributes() {

		const newAttributes = currentState.newAttributes;
		const enabledAttributes = currentState.enabledAttributes;

		for ( let i = 0, il = enabledAttributes.length; i < il; i ++ ) {

			if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

	}

	function vertexAttribPointer( index, size, type, normalized, stride, offset, integer ) {

		if ( integer === true ) {

			gl.vertexAttribIPointer( index, size, type, stride, offset );

		} else {

			gl.vertexAttribPointer( index, size, type, normalized, stride, offset );

		}

	}

	function setupVertexAttributes( object, material, program, geometry ) {

		initAttributes();

		const geometryAttributes = geometry.attributes;

		const programAttributes = program.getAttributes();

		const materialDefaultAttributeValues = material.defaultAttributeValues;

		for ( const name in programAttributes ) {

			const programAttribute = programAttributes[ name ];

			if ( programAttribute.location >= 0 ) {

				let geometryAttribute = geometryAttributes[ name ];

				if ( geometryAttribute === undefined ) {

					if ( name === 'instanceMatrix' && object.instanceMatrix ) geometryAttribute = object.instanceMatrix;
					if ( name === 'instanceColor' && object.instanceColor ) geometryAttribute = object.instanceColor;

				}

				if ( geometryAttribute !== undefined ) {

					const normalized = geometryAttribute.normalized;
					const size = geometryAttribute.itemSize;

					const attribute = attributes.get( geometryAttribute );

					// TODO Attribute may not be available on context restore

					if ( attribute === undefined ) continue;

					const buffer = attribute.buffer;
					const type = attribute.type;
					const bytesPerElement = attribute.bytesPerElement;

					// check for integer attributes

					const integer = ( type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType );

					if ( geometryAttribute.isInterleavedBufferAttribute ) {

						const data = geometryAttribute.data;
						const stride = data.stride;
						const offset = geometryAttribute.offset;

						if ( data.isInstancedInterleavedBuffer ) {

							for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

								enableAttributeAndDivisor( programAttribute.location + i, data.meshPerAttribute );

							}

							if ( object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined ) {

								geometry._maxInstanceCount = data.meshPerAttribute * data.count;

							}

						} else {

							for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

								enableAttribute( programAttribute.location + i );

							}

						}

						gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

						for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

							vertexAttribPointer(
								programAttribute.location + i,
								size / programAttribute.locationSize,
								type,
								normalized,
								stride * bytesPerElement,
								( offset + ( size / programAttribute.locationSize ) * i ) * bytesPerElement,
								integer
							);

						}

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

								enableAttributeAndDivisor( programAttribute.location + i, geometryAttribute.meshPerAttribute );

							}

							if ( object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined ) {

								geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

								enableAttribute( programAttribute.location + i );

							}

						}

						gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

						for ( let i = 0; i < programAttribute.locationSize; i ++ ) {

							vertexAttribPointer(
								programAttribute.location + i,
								size / programAttribute.locationSize,
								type,
								normalized,
								size * bytesPerElement,
								( size / programAttribute.locationSize ) * i * bytesPerElement,
								integer
							);

						}

					}

				} else if ( materialDefaultAttributeValues !== undefined ) {

					const value = materialDefaultAttributeValues[ name ];

					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								gl.vertexAttrib2fv( programAttribute.location, value );
								break;

							case 3:
								gl.vertexAttrib3fv( programAttribute.location, value );
								break;

							case 4:
								gl.vertexAttrib4fv( programAttribute.location, value );
								break;

							default:
								gl.vertexAttrib1fv( programAttribute.location, value );

						}

					}

				}

			}

		}

		disableUnusedAttributes();

	}

	function dispose() {

		reset();

		for ( const geometryId in bindingStates ) {

			const objectMap = bindingStates[ geometryId ];

			for ( const objectId in objectMap ) {

				const programMap = objectMap[ objectId ];

				for ( const programId in programMap ) {

					const stateMap = programMap[ programId ];

					for ( const wireframe in stateMap ) {

						deleteVertexArrayObject( stateMap[ wireframe ].object );

						delete stateMap[ wireframe ];

					}

					delete programMap[ programId ];

				}

			}

			delete bindingStates[ geometryId ];

		}

	}

	function releaseStatesOfGeometry( geometry ) {

		if ( bindingStates[ geometry.id ] === undefined ) return;

		const objectMap = bindingStates[ geometry.id ];

		for ( const objectId in objectMap ) {

			const programMap = objectMap[ objectId ];

			for ( const programId in programMap ) {

				const stateMap = programMap[ programId ];

				for ( const wireframe in stateMap ) {

					deleteVertexArrayObject( stateMap[ wireframe ].object );

					delete stateMap[ wireframe ];

				}

				delete programMap[ programId ];

			}

		}

		delete bindingStates[ geometry.id ];

	}

	function releaseStatesOfProgram( program ) {

		for ( const geometryId in bindingStates ) {

			const objectMap = bindingStates[ geometryId ];

			for ( const objectId in objectMap ) {

				const programMap = objectMap[ objectId ];

				if ( programMap[ program.id ] === undefined ) continue;

				const stateMap = programMap[ program.id ];

				for ( const wireframe in stateMap ) {

					deleteVertexArrayObject( stateMap[ wireframe ].object );

					delete stateMap[ wireframe ];

				}

				delete programMap[ program.id ];

			}

		}

	}

	function releaseStatesOfObject( object ) {

		for ( const geometryId in bindingStates ) {

			const objectMap = bindingStates[ geometryId ];

			const objectId = ( object.isInstancedMesh === true ) ? object.id : 0;

			const programMap = objectMap[ objectId ];

			if ( programMap === undefined ) continue;

			for ( const programId in programMap ) {

				const stateMap = programMap[ programId ];

				for ( const wireframe in stateMap ) {

					deleteVertexArrayObject( stateMap[ wireframe ].object );

					delete stateMap[ wireframe ];

				}

				delete programMap[ programId ];

			}

			delete objectMap[ objectId ];

			if ( Object.keys( objectMap ).length === 0 ) {

				delete bindingStates[ geometryId ];

			}

		}

	}


	function reset() {

		resetDefaultState();
		forceUpdate = true;

		if ( currentState === defaultState ) return;

		currentState = defaultState;
		bindVertexArrayObject( currentState.object );

	}

	// for backward-compatibility

	function resetDefaultState() {

		defaultState.geometry = null;
		defaultState.program = null;
		defaultState.wireframe = false;

	}

	return {

		setup: setup,
		reset: reset,
		resetDefaultState: resetDefaultState,
		dispose: dispose,
		releaseStatesOfGeometry: releaseStatesOfGeometry,
		releaseStatesOfObject: releaseStatesOfObject,
		releaseStatesOfProgram: releaseStatesOfProgram,

		initAttributes: initAttributes,
		enableAttribute: enableAttribute,
		disableUnusedAttributes: disableUnusedAttributes

	};

}


export { WebGLBindingStates };
