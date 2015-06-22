/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLObjects = function ( gl, info ) {

	var objects = {};
	var objectsImmediate = [];

	var morphInfluences = new Float32Array( 8 );

	var geometries = new THREE.WebGLGeometries( gl, info );

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

		if ( object.__webglActive === undefined ) {

			object.__webglActive = true;

			if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.PointCloud ) {

				objects[ object.id ] = {
					id: object.id,
					object: object,
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

	function numericalSort ( a, b ) {

		return b[ 0 ] - a[ 0 ];

	}

	function updateObject( object ) {

		var geometry = geometries.get( object );

		if ( object.geometry.dynamic === true ) {

			geometry.updateFromObject( object );

		}

		// morph targets

		if ( object.morphTargetInfluences !== undefined ) {

			var activeInfluences = [];
			var morphTargetInfluences = object.morphTargetInfluences;

			for ( var i = 0, l = morphTargetInfluences.length; i < l; i ++ ) {

				var influence = morphTargetInfluences[ i ];
				activeInfluences.push( [ influence, i ] );

			}

			activeInfluences.sort( numericalSort );

			if ( activeInfluences.length > 8 ) {

				activeInfluences.length = 8;

			}

			for ( var i = 0, l = activeInfluences.length; i < l; i ++ ) {

				morphInfluences[ i ] = activeInfluences[ i ][ 0 ];

				var attribute = geometry.morphAttributes[ activeInfluences[ i ][ 1 ] ];
				geometry.addAttribute( 'morphTarget' + i, attribute );

			}

			var material = object.material;

			if ( material.program !== undefined ) {

				var uniforms = material.program.getUniforms();

				if ( uniforms.morphTargetInfluences !== null ) {

					gl.uniform1fv( uniforms.morphTargetInfluences, morphInfluences );

				}

			} else {

				console.warn( 'TOFIX: material.program is undefined' );

			}

		}

		//

		var attributes = geometry.attributes;

		for ( var name in attributes ) {

			var attribute = attributes[ name ];

			var bufferType = ( name === 'index' ) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

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

					console.error( 'THREE.WebGLRenderer.updateObject: using updateRange for THREE.DynamicBufferAttribute and marked as needsUpdate but count is 0, ensure you are using set methods or updating manually.' );

				} else {

					gl.bufferSubData( bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
									 data.array.subarray( data.updateRange.offset, data.updateRange.offset + data.updateRange.count ) );

					data.updateRange.count = 0; // reset range

				}

				data.needsUpdate = false;

			}

		}

	};

	this.update = function ( renderList ) {

		for ( var i = 0, ul = renderList.length; i < ul; i++ ) {

			var object = renderList[i].object;

			if ( object.material.visible !== false ) {

				updateObject( object );

			}

		}

	};

};
