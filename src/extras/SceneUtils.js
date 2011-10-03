/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {
	
	showAxis : function ( root ) {
		
		var  cylinder = new THREE.CylinderGeometry(30, .5, .5, 200);
		
		var xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		var yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		var zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		
		var xMesh     = new THREE.Mesh(cylinder, xMaterial);
		var yMesh     = new THREE.Mesh(cylinder, yMaterial);
		var zMesh     = new THREE.Mesh(cylinder, zMaterial);
		
		xMesh.rotation.y = Math.PI / 2;
		xMesh.position.x = 100;
		
		yMesh.rotation.x = Math.PI / 2;
		yMesh.position.y = 100;
		
		zMesh.position.z = 100;
		
		root.addObject(xMesh);
		root.addObject(yMesh);
		root.addObject(zMesh);
		
	},

	showHierarchy : function ( root, visible ) {

		THREE.SceneUtils.traverseHierarchy( root, function( node ) { node.visible = visible; } );

	},

	traverseHierarchy : function ( root, callback ) {

		var n, i, l = root.children.length;

		for ( i = 0; i < l; i ++ ) {

			n = root.children[ i ];

			callback( n );

			THREE.SceneUtils.traverseHierarchy( n, callback );

		}

	}

};
