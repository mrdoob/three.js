console.warn( "THREE.SceneUtils: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	createMeshesFromInstancedMesh: function ( instancedMesh ) {

		var group = new THREE.Group();

		var count = instancedMesh.count;
		var geometry = instancedMesh.geometry;
		var material = instancedMesh.material;

		for ( var i = 0; i < count; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );

			instancedMesh.getMatrixAt( i, mesh.matrix );
			mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

			group.add( mesh );

		}

		group.copy( instancedMesh );
		group.updateMatrixWorld(); // ensure correct world matrices of meshes

		return group;

	},

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new THREE.Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach: function ( child, parent, scene ) {

		console.warn( 'THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.' );

		scene.attach( child );

	},

	attach: function ( child, scene, parent ) {

		console.warn( 'THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.' );

		parent.attach( child );

	}

};
