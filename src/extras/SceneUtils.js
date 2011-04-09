/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {

	addMesh : function ( scene, geometry, scale, x, y, z, rx, ry, rz, material ) {

		var mesh = new THREE.Mesh( geometry, material );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
		mesh.position.x = x;
		mesh.position.y = y;
		mesh.position.z = z;
		mesh.rotation.x = rx;
		mesh.rotation.y = ry;
		mesh.rotation.z = rz;
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubeWebGL : function ( scene, size, textureCube ) {

		var shader = THREE.ShaderUtils.lib["cube"];
		shader.uniforms["tCube"].texture = textureCube;

		var material = new THREE.MeshShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms

		} ),

		mesh = new THREE.Mesh( new THREE.Cube( size, size, size, 1, 1, 1, null, true ), material );
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCube : function( scene, size, images ) {

		var materials = [], mesh;

		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 0 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 1 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 2 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 3 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 4 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 5 ] ) } ) );

		mesh = new THREE.Mesh( new THREE.Cube( size, size, size, 1, 1, materials, true ), new THREE.MeshFaceMaterial() );
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubePlanes : function ( scene, size, images ) {


		var hsize = size / 2, plane = new THREE.Plane( size, size ), pi = Math.PI, pi2 = Math.PI / 2;

		THREE.SceneUtils.addMesh( scene, plane, 1,      0,     0,  -hsize,  0,      0,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[5] ) } ) );
		THREE.SceneUtils.addMesh( scene, plane, 1, -hsize,     0,       0,  0,    pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[0] ) } ) );
		THREE.SceneUtils.addMesh( scene, plane, 1,  hsize,     0,       0,  0,   -pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[1] ) } ) );
		THREE.SceneUtils.addMesh( scene, plane, 1,     0,  hsize,       0,  pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[2] ) } ) );
		THREE.SceneUtils.addMesh( scene, plane, 1,     0, -hsize,       0, -pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[3] ) } ) );

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
