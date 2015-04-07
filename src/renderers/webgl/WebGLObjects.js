/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLObjects = function ( gl, info ) {

	var objects = {};
	var objectsImmediate = [];

	var geometries = {};

	var geometryGroups = {};
	var geometryGroupCounter = 0;

	//

	function initGeometry( object ) {

		var geometry = object.geometry;

		geometry.addEventListener( 'dispose', onGeometryDispose );

		if ( geometry instanceof THREE.BufferGeometry ) {

			geometries[ geometry.id ] = geometry;

		} else {

			geometries[ geometry.id ] = new THREE.BufferGeometry().setFromObject( object );

		}

		info.memory.geometries ++;

	}

	function onObjectRemoved( event ) {

		var object = event.target;

		object.traverse( function ( child ) {

			child.removeEventListener( 'remove', onObjectRemoved );
			removeObject( child );

		} );

	}

	function removeObject( object ) {

		if ( object instanceof THREE.Mesh ||
			 object instanceof THREE.PointCloud ||
			 object instanceof THREE.Line ) {

			delete objects[ object.id ];

		} else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback ) {

			removeInstances( objectsImmediate, object );

		}

		delete object.__webglInit;
		delete object._modelViewMatrix;
		delete object._normalMatrix;

		delete object.__webglActive;

	}

	function removeInstances( objlist, object ) {

		for ( var o = objlist.length - 1; o >= 0; o -- ) {

			if ( objlist[ o ].object === object ) {

				objlist.splice( o, 1 );

			}

		}

	}

	//

	function onGeometryDispose( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		geometry = geometries[ geometry.id ];

		for ( var name in geometry.attributes ) {

			var attribute = geometry.attributes[ name ];

			if ( attribute.buffer !== undefined ) {

				gl.deleteBuffer( attribute.buffer );

				delete attribute.buffer;

			}

		}

		info.memory.geometries --;

	}

	//

	this.objects = objects;
	this.objectsImmediate = objectsImmediate;

	this.geometries = geometries;

	this.init = function ( object ) {

		if ( object.__webglInit === undefined ) {

			object.__webglInit = true;
			object._modelViewMatrix = new THREE.Matrix4();
			object._normalMatrix = new THREE.Matrix3();

			object.addEventListener( 'removed', onObjectRemoved );

		}

		var geometry = object.geometry;

		if ( geometry !== undefined ) {

			initGeometry( object );

		}

		if ( object.__webglActive === undefined) {

			object.__webglActive = true;

			if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.PointCloud ) {

				objects[ object.id ] = {
					id: object.id,
					object: object,
					material: null,
					z: 0
				};

			} else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback ) {

				objectsImmediate.push( {
					id: null,
					object: object,
					opaque: null,
					transparent: null,
					z: 0
				} );

			}

		}

	};

	this.update = function ( object ) {

		var geometry = object.geometry;

		if ( geometry instanceof THREE.Geometry ) {

			geometry = geometries[ geometry.id ];

			if ( geometry === undefined ) {

				initGeometry( object );

				geometry = geometries[ geometry.id ];

			} else {

				geometry.updateFromObject( object );

			}

		}

		//

		if ( geometry instanceof THREE.BufferGeometry ) {

			var attributes = geometry.attributes;
			var attributesKeys = geometry.attributesKeys;

			for ( var i = 0, l = attributesKeys.length; i < l; i ++ ) {

				var key = attributesKeys[ i ];
				var attribute = attributes[ key ];
				var bufferType = ( key === 'index' ) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

				var data = ( attribute instanceof THREE.InterleavedBufferAttribute ) ? attribute.data : attribute;

				if ( data.buffer === undefined ) {

					data.buffer = gl.createBuffer();
					gl.bindBuffer( bufferType, data.buffer );

					var usage = gl.STATIC_DRAW;

					if ( data instanceof THREE.DynamicBufferAttribute
							 || ( data instanceof THREE.InstancedBufferAttribute && data.dynamic === true )
							 || ( data instanceof THREE.InterleavedBuffer && data.dynamic === true ) ) {

						usage = gl.DYNAMIC_DRAW;

					}

					gl.bufferData( bufferType, data.array, usage );

					data.needsUpdate = false;

				} else if ( data.needsUpdate === true ) {

					gl.bindBuffer( bufferType, data.buffer );

					if ( data.updateRange === undefined || data.updateRange.count === -1 ) { // Not using update ranges

						gl.bufferSubData( bufferType, 0, data.array );

					} else if ( data.updateRange.count === 0 ) {

						THREE.error( 'THREE.WebGLRenderer.updateObject: using updateRange for THREE.DynamicBufferAttribute and marked as needsUpdate but count is 0, ensure you are using set methods or updating manually.' );

					} else {

						gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
										 data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

						data.updateRange.count = 0; // reset range

					}

					data.needsUpdate = false;

				}

			}

		}

	};

};
