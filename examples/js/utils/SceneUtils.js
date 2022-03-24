( function () {

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
		object.copy( mesh ); // merge groups (which automatically sorts them)

		const geometry = THREE.mergeGroups( mesh.geometry );
		const index = geometry.index;
		const groups = geometry.groups;
		const attributeNames = Object.keys( geometry.attributes ); // create a mesh for each group by extracting the buffer data into a new geometry

		for ( let i = 0; i < groups.length; i ++ ) {

			const group = groups[ i ];
			const start = group.start;
			const end = start + group.count;
			const newGeometry = new THREE.BufferGeometry();
			const newMaterial = mesh.material[ group.materialIndex ]; // process all buffer attributes

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

	function detach( child, parent, scene ) {

		console.warn( 'THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.' );
		scene.attach( child );

	}

	function attach( child, scene, parent ) {

		console.warn( 'THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.' );
		parent.attach( child );

	}

	THREE.SceneUtils = {};
	THREE.SceneUtils.attach = attach;
	THREE.SceneUtils.createMeshesFromInstancedMesh = createMeshesFromInstancedMesh;
	THREE.SceneUtils.createMeshesFromMultiMaterialMesh = createMeshesFromMultiMaterialMesh;
	THREE.SceneUtils.createMultiMaterialObject = createMultiMaterialObject;
	THREE.SceneUtils.detach = detach;

} )();
