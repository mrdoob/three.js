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
	THREE.SceneUtils.createMultiMaterialObject = createMultiMaterialObject;
	THREE.SceneUtils.detach = detach;

} )();
