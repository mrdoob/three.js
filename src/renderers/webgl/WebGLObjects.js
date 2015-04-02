/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLObjects = function ( gl, info, extensions, getBufferMaterial ) {

	var buffers = new THREE.WebGLBuffers( gl, info, extensions, getBufferMaterial );

	var objects = {};
	var objectsImmediate = [];

	var geometryGroups = {};
	var geometryGroupCounter = 0;

	function makeGroups( geometry, usesFaceMaterial ) {

		var maxVerticesInGroup = extensions.get( 'OES_element_index_uint' ) ? 4294967296 : 65535;

		var groupHash, hash_map = {};

		var numMorphTargets = geometry.morphTargets.length;
		var numMorphNormals = geometry.morphNormals.length;

		var group;
		var groups = {};
		var groupsList = [];

		for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			var face = geometry.faces[ f ];
			var materialIndex = usesFaceMaterial ? face.materialIndex : 0;

			if ( ! ( materialIndex in hash_map ) ) {

				hash_map[ materialIndex ] = { hash: materialIndex, counter: 0 };

			}

			groupHash = hash_map[ materialIndex ].hash + '_' + hash_map[ materialIndex ].counter;

			if ( ! ( groupHash in groups ) ) {

				group = {
					id: geometryGroupCounter ++,
					faces3: [],
					materialIndex: materialIndex,
					vertices: 0,
					numMorphTargets: numMorphTargets,
					numMorphNormals: numMorphNormals
				};

				groups[ groupHash ] = group;
				groupsList.push( group );

			}

			if ( groups[ groupHash ].vertices + 3 > maxVerticesInGroup ) {

				hash_map[ materialIndex ].counter += 1;
				groupHash = hash_map[ materialIndex ].hash + '_' + hash_map[ materialIndex ].counter;

				if ( ! ( groupHash in groups ) ) {

					group = {
						id: geometryGroupCounter ++,
						faces3: [],
						materialIndex: materialIndex,
						vertices: 0,
						numMorphTargets: numMorphTargets,
						numMorphNormals: numMorphNormals
					};

					groups[ groupHash ] = group;
					groupsList.push( group );

				}

			}

			groups[ groupHash ].faces3.push( f );
			groups[ groupHash ].vertices += 3;

		}

		return groupsList;

	}

	function initGeometryGroups( object, geometry ) {

		var material = object.material, addBuffers = false;

		if ( geometryGroups[ geometry.id ] === undefined || geometry.groupsNeedUpdate === true ) {

			delete objects[ object.id ];

			geometryGroups[ geometry.id ] = makeGroups( geometry, material instanceof THREE.MeshFaceMaterial );

			geometry.groupsNeedUpdate = false;

		}

		var geometryGroupsList = geometryGroups[ geometry.id ];

		// create separate VBOs per geometry chunk

		for ( var i = 0, il = geometryGroupsList.length; i < il; i ++ ) {

			var geometryGroup = geometryGroupsList[ i ];

			// initialise VBO on the first access

			if ( geometryGroup.__webglVertexBuffer === undefined ) {

				buffers.initMeshBuffers( geometryGroup, object );

				geometry.verticesNeedUpdate = true;
				geometry.morphTargetsNeedUpdate = true;
				geometry.elementsNeedUpdate = true;
				geometry.uvsNeedUpdate = true;
				geometry.normalsNeedUpdate = true;
				geometry.tangentsNeedUpdate = true;
				geometry.colorsNeedUpdate = true;

				addBuffers = true;

			} else {

				addBuffers = false;

			}

			if ( addBuffers || object.__webglActive === undefined ) {

				addBuffer( objects, geometryGroup, object );

			}

		}

		object.__webglActive = true;

	}

	function addBuffer( objlist, buffer, object ) {

		var id = object.id;
		objlist[id] = objlist[id] || [];
		objlist[id].push(
			{
				id: id,
				buffer: buffer,
				object: object,
				material: null,
				z: 0
			}
		);

	};

	function addBufferImmediate( objlist, object ) {

		objlist.push(
			{
				id: null,
				object: object,
				opaque: null,
				transparent: null,
				z: 0
			}
		);

	};

	//

	// Objects updates - custom attributes check

	function areCustomAttributesDirty( material ) {

		for ( var name in material.attributes ) {

			if ( material.attributes[ name ].needsUpdate ) return true;

		}

		return false;

	}

	function clearCustomAttributes( material ) {

		for ( var name in material.attributes ) {

			material.attributes[ name ].needsUpdate = false;

		}

	}

	//

	function onObjectRemoved ( event ) {

		var object = event.target;

		object.traverse( function ( child ) {

			child.removeEventListener( 'remove', onObjectRemoved );

			removeObject( child );

		} );

	};

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

	function onGeometryDispose ( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		deallocateGeometry( geometry );

	};

	function deallocateGeometry ( geometry ) {

		delete geometry.__webglInit;

		if ( geometry instanceof THREE.BufferGeometry ) {

			for ( var name in geometry.attributes ) {

				var attribute = geometry.attributes[ name ];

				if ( attribute.buffer !== undefined ) {

					gl.deleteBuffer( attribute.buffer );

					delete attribute.buffer;

				}

			}

			info.memory.geometries --;

		} else {

			var geometryGroupsList = geometryGroups[ geometry.id ];

			if ( geometryGroupsList !== undefined ) {

				for ( var i = 0, l = geometryGroupsList.length; i < l; i ++ ) {

					var geometryGroup = geometryGroupsList[ i ];

					if ( geometryGroup.numMorphTargets !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {

							gl.deleteBuffer( geometryGroup.__webglMorphTargetsBuffers[ m ] );

						}

						delete geometryGroup.__webglMorphTargetsBuffers;

					}

					if ( geometryGroup.numMorphNormals !== undefined ) {

						for ( var m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {

							gl.deleteBuffer( geometryGroup.__webglMorphNormalsBuffers[ m ] );

						}

						delete geometryGroup.__webglMorphNormalsBuffers;

					}

					buffers.delete( geometryGroup );

				}

				delete geometryGroups[ geometry.id ];

			} else {

				buffers.delete( geometry );

			}

		}

		// TOFIX: Workaround for deleted geometry being currently bound

		_currentGeometryProgram = '';

	};

	//

	this.objects = objects;
	this.objectsImmediate = objectsImmediate;

	this.init = function ( object ) {

		if ( object.__webglInit === undefined ) {

			object.__webglInit = true;
			object._modelViewMatrix = new THREE.Matrix4();
			object._normalMatrix = new THREE.Matrix3();

			object.addEventListener( 'removed', onObjectRemoved );

		}

		var geometry = object.geometry;

		if ( geometry === undefined ) {

			// ImmediateRenderObject

		} else if ( geometry.__webglInit === undefined ) {

			geometry.__webglInit = true;
			geometry.addEventListener( 'dispose', onGeometryDispose );

			if ( geometry instanceof THREE.BufferGeometry ) {

				info.memory.geometries ++;

			} else if ( object instanceof THREE.Mesh ) {

				initGeometryGroups( object, geometry );

			} else if ( object instanceof THREE.Line ) {

				buffers.initLineBuffers( geometry, object );

			} else if ( object instanceof THREE.PointCloud ) {

				buffers.initPointCloudBuffers( geometry, object );

			}

		}

		if ( object.__webglActive === undefined) {

			object.__webglActive = true;

			if ( object instanceof THREE.Mesh ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					addBuffer( objects, geometry, object );

				} else if ( geometry instanceof THREE.Geometry ) {

					var geometryGroupsList = geometryGroups[ geometry.id ];

					for ( var i = 0,l = geometryGroupsList.length; i < l; i ++ ) {

						addBuffer( objects, geometryGroupsList[ i ], object );

					}

				}

			} else if ( object instanceof THREE.Line || object instanceof THREE.PointCloud ) {

				addBuffer( objects, geometry, object );

			} else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback ) {

				addBufferImmediate( objectsImmediate, object );

			}

		}

	};

	this.update = function ( object ) {

		var geometry = object.geometry;

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

		} else if ( object instanceof THREE.Mesh ) {

			// check all geometry groups

			if ( geometry.groupsNeedUpdate === true ) {

				initGeometryGroups( object, geometry );

			}

			var geometryGroupsList = geometryGroups[ geometry.id ];

			for ( var i = 0, il = geometryGroupsList.length; i < il; i ++ ) {

				var geometryGroup = geometryGroupsList[ i ];
				var material = getBufferMaterial( object, geometryGroup );

				var customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

				if ( geometry.verticesNeedUpdate || geometry.morphTargetsNeedUpdate || geometry.elementsNeedUpdate ||
					 geometry.uvsNeedUpdate || geometry.normalsNeedUpdate ||
					 geometry.colorsNeedUpdate || geometry.tangentsNeedUpdate || customAttributesDirty ) {

					buffers.setMeshBuffers( geometryGroup, object, gl.DYNAMIC_DRAW, ! geometry.dynamic, material );

				}

			}

			geometry.verticesNeedUpdate = false;
			geometry.morphTargetsNeedUpdate = false;
			geometry.elementsNeedUpdate = false;
			geometry.uvsNeedUpdate = false;
			geometry.normalsNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.tangentsNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		} else if ( object instanceof THREE.Line ) {

			var material = getBufferMaterial( object, geometry );
			var customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

			if ( geometry.verticesNeedUpdate || geometry.colorsNeedUpdate || geometry.lineDistancesNeedUpdate || customAttributesDirty ) {

				buffers.setLineBuffers( geometry, gl.DYNAMIC_DRAW );

			}

			geometry.verticesNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.lineDistancesNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		} else if ( object instanceof THREE.PointCloud ) {

			var material = getBufferMaterial( object, geometry );
			var customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

			if ( geometry.verticesNeedUpdate || geometry.colorsNeedUpdate || customAttributesDirty ) {

				buffers.setPointCloudBuffers( geometry, gl.DYNAMIC_DRAW, object );

			}

			geometry.verticesNeedUpdate = false;
			geometry.colorsNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		}

	};

};
