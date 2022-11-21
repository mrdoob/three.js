( function () {

	const _color = /*@__PURE__*/new THREE.Color();
	const _matrix = /*@__PURE__*/new THREE.Matrix4();
	function createMeshesFromInstancedMesh( instancedMesh ) {

		const group = new THREE.Group();
		const count = instancedMesh.count;
		const geometry = instancedMesh.geometry;
		const material = instancedMesh.material;
		for ( let i = 0; i < count; i ++ ) {

			const mesh = new THREE.Mesh( geometry, material );
			instancedMesh.getMatrixAt( i, mesh.matrix );
			mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );
			group.add( mesh );

		}

		group.copy( instancedMesh );
		group.updateMatrixWorld(); // ensure correct world matrices of meshes

		return group;

	}

	function createMeshesFromMultiMaterialMesh( mesh ) {

		if ( Array.isArray( mesh.material ) === false ) {

			console.warn( 'THREE.SceneUtils.createMeshesFromMultiMaterialMesh(): The given mesh has no multiple materials.' );
			return mesh;

		}

		const object = new THREE.Group();
		object.copy( mesh );

		// merge groups (which automatically sorts them)

		const geometry = THREE.mergeGroups( mesh.geometry );
		const index = geometry.index;
		const groups = geometry.groups;
		const attributeNames = Object.keys( geometry.attributes );

		// create a mesh for each group by extracting the buffer data into a new geometry

		for ( let i = 0; i < groups.length; i ++ ) {

			const group = groups[ i ];
			const start = group.start;
			const end = start + group.count;
			const newGeometry = new THREE.BufferGeometry();
			const newMaterial = mesh.material[ group.materialIndex ];

			// process all buffer attributes

			for ( let j = 0; j < attributeNames.length; j ++ ) {

				const name = attributeNames[ j ];
				const attribute = geometry.attributes[ name ];
				const itemSize = attribute.itemSize;
				const newLength = group.count * itemSize;
				const type = attribute.array.constructor;
				const newArray = new type( newLength );
				const newAttribute = new THREE.BufferAttribute( newArray, itemSize );
				for ( let k = start, n = 0; k < end; k ++, n ++ ) {

					const ind = index.getX( k );
					if ( itemSize >= 1 ) newAttribute.setX( n, attribute.getX( ind ) );
					if ( itemSize >= 2 ) newAttribute.setY( n, attribute.getY( ind ) );
					if ( itemSize >= 3 ) newAttribute.setZ( n, attribute.getZ( ind ) );
					if ( itemSize >= 4 ) newAttribute.setW( n, attribute.getW( ind ) );

				}

				newGeometry.setAttribute( name, newAttribute );

			}

			const newMesh = new THREE.Mesh( newGeometry, newMaterial );
			object.add( newMesh );

		}

		return object;

	}

	function createMultiMaterialObject( geometry, materials ) {

		const group = new THREE.Group();
		for ( let i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	}

	function reduceVertices( object, func, initialValue ) {

		let value = initialValue;
		const vertex = new THREE.Vector3();
		object.updateWorldMatrix( true, true );
		object.traverseVisible( child => {

			const {
				geometry
			} = child;
			if ( geometry !== undefined ) {

				const {
					position
				} = geometry.attributes;
				if ( position !== undefined ) {

					for ( let i = 0, l = position.count; i < l; i ++ ) {

						vertex.fromBufferAttribute( position, i );
						if ( child.isSkinnedMesh ) {

							child.boneTransform( i, vertex );

						} else {

							vertex.applyMatrix4( child.matrixWorld );

						}

						value = func( value, vertex );

					}

				}

			}

		} );
		return value;

	}

	/**
 * @param {InstancedMesh}
 * @param {function(int, int):int}
 */
	function sortInstancedMesh( mesh, compareFn ) {

		// store copy of instanced attributes for lookups

		const instanceMatrixRef = THREE.deepCloneAttribute( mesh.instanceMatrix );
		const instanceColorRef = mesh.instanceColor ? THREE.deepCloneAttribute( mesh.instanceColor ) : null;
		const attributeRefs = new Map();
		for ( const name in mesh.geometry.attributes ) {

			const attribute = mesh.geometry.attributes[ name ];
			if ( attribute.isInstancedBufferAttribute ) {

				attributeRefs.set( attribute, THREE.deepCloneAttribute( attribute ) );

			}

		}

		// compute sort order

		const tokens = [];
		for ( let i = 0; i < mesh.count; i ++ ) tokens.push( i );
		tokens.sort( compareFn );

		// apply sort order

		for ( let i = 0; i < tokens.length; i ++ ) {

			const refIndex = tokens[ i ];
			_matrix.fromArray( instanceMatrixRef.array, refIndex * mesh.instanceMatrix.itemSize );
			_matrix.toArray( mesh.instanceMatrix.array, i * mesh.instanceMatrix.itemSize );
			if ( mesh.instanceColor ) {

				_color.fromArray( instanceColorRef.array, refIndex * mesh.instanceColor.itemSize );
				_color.toArray( mesh.instanceColor.array, i * mesh.instanceColor.itemSize );

			}

			for ( const name in mesh.geometry.attributes ) {

				const attribute = mesh.geometry.attributes[ name ];
				if ( attribute.isInstancedBufferAttribute ) {

					const attributeRef = attributeRefs.get( attribute );
					attribute.setX( i, attributeRef.getX( refIndex ) );
					if ( attribute.itemSize > 1 ) attribute.setY( i, attributeRef.getY( refIndex ) );
					if ( attribute.itemSize > 2 ) attribute.setZ( i, attributeRef.getZ( refIndex ) );
					if ( attribute.itemSize > 3 ) attribute.setW( i, attributeRef.getW( refIndex ) );

				}

			}

		}

	}

	THREE.SceneUtils = {};
	THREE.SceneUtils.createMeshesFromInstancedMesh = createMeshesFromInstancedMesh;
	THREE.SceneUtils.createMeshesFromMultiMaterialMesh = createMeshesFromMultiMaterialMesh;
	THREE.SceneUtils.createMultiMaterialObject = createMultiMaterialObject;
	THREE.SceneUtils.reduceVertices = reduceVertices;
	THREE.SceneUtils.sortInstancedMesh = sortInstancedMesh;

} )();
