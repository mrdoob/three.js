/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLObjects = function ( gl, properties, info ) {

	var objects = {};

	var geometries = new THREE.WebGLGeometries( gl, properties, info );

	//

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

		}

		delete object._modelViewMatrix;
		delete object._normalMatrix;

		properties.delete( object );

	}

	//

	this.objects = objects;
	this.geometries = geometries;

	this.init = function ( object ) {

		var objectProperties = properties.get( object );

		if ( objectProperties.__webglInit === undefined ) {

			objectProperties.__webglInit = true;
			object._modelViewMatrix = new THREE.Matrix4();
			object._normalMatrix = new THREE.Matrix3();

			object.addEventListener( 'removed', onObjectRemoved );

		}

		if ( objectProperties.__webglActive === undefined ) {

			objectProperties.__webglActive = true;

			if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.PointCloud ) {

				objects[ object.id ] = {
					id: object.id,
					object: object,
					z: 0
				};

			}

		}

	};

	function updateObject( object ) {

		var geometry = geometries.get( object );

		if ( object.geometry instanceof THREE.Geometry ) {

			geometry.updateFromObject( object );

		}

		var attributes = geometry.attributes;

		for ( var name in attributes ) {

			updateAttribute( attributes[ name ], name );

		}

		// morph targets

		var morphAttributes = geometry.morphAttributes;

		for ( var name in morphAttributes ) {

			var array = morphAttributes[ name ];

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				updateAttribute( array[ i ], i );

			}

		}

	}

	function updateAttribute( attribute, name ) {

		var bufferType = ( name === 'index' ) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

		var data = ( attribute instanceof THREE.InterleavedBufferAttribute ) ? attribute.data : attribute;

		var attributeProperties = properties.get( data );

		if ( attributeProperties.__webglBuffer === undefined ) {

			createBuffer( attributeProperties, data, bufferType );

		} else if ( attributeProperties.version !== data.version ) {

			updateBuffer( attributeProperties, data, bufferType );

		}

	}

	function createBuffer( attributeProperties, data, bufferType ) {

		attributeProperties.__webglBuffer = gl.createBuffer();
		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		var usage = gl.STATIC_DRAW;

		if ( data instanceof THREE.DynamicBufferAttribute
			 || ( data instanceof THREE.InstancedBufferAttribute && data.dynamic === true )
			 || ( data instanceof THREE.InterleavedBuffer && data.dynamic === true ) ) {

			usage = gl.DYNAMIC_DRAW;

		}

		gl.bufferData( bufferType, data.array, usage );

		attributeProperties.version = data.version;

	}

	function updateBuffer( attributeProperties, data, bufferType ) {

		gl.bindBuffer( bufferType, attributeProperties.__webglBuffer );

		if ( data.updateRange === undefined || data.updateRange.count === - 1 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, data.array );

		} else if ( data.updateRange.count === 0 ) {

			console.error( 'THREE.WebGLObjects.updateBuffer: using updateRange for THREE.DynamicBufferAttribute and marked as needsUpdate but count is 0, ensure you are using set methods or updating manually.' );

		} else {

			gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
							  data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

			data.updateRange.count = 0; // reset range

		}

		attributeProperties.version = data.version;

	}

	// returns the webgl buffer for a specified attribute
	this.getAttributeBuffer = function ( attribute ) {

		if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

			return properties.get( attribute.data ).__webglBuffer;

		}

		return properties.get( attribute ).__webglBuffer;

	};

	this.update = function ( renderList ) {

		for ( var i = 0, ul = renderList.length; i < ul; i ++ ) {

			updateObject( renderList[ i ].object );

		}

	};

	this.clear = function () {

		objects = {};

	};

};
