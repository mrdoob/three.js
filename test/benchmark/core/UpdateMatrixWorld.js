( function () {

	THREE = Bench.THREE;

	var position = new THREE.Vector3( 1, 1, 1 );
	var scale = new THREE.Vector3( 2, 1, 0.5 );
	var rotation = new THREE.Quaternion();
	rotation.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 8 );
	var createLocallyOffsetChild = function (type) {

		let child;
		let choice;

		switch (type) {
			case "Object3D":
				child = new THREE.Object3D();
				break; 

			case "Polymorphic":
				child = new THREE.Object3D();
				choice = Math.random();
				if (choice < 0.2) {
					child.extra1 = "test-polymorphism";
				}
				else if (choice < 0.4) {
					child.extra2 = "test-polymorphism";
				}
				else if (choice < 0.6) {
					child.extra3 = "test-polymorphism";
				}
				else if (choice < 0.8) {
					child.extra4 = "test-polymorphism";
				}
				break;

			case "Mesh":
				child = new THREE.Mesh();
				break; 

			case "Skinned":
				child = new THREE.SkinnedMesh();
				break; 

			case "Realistic":
				choice = Math.random();
				if (choice < 0.05) {
					child = new THREE.InstancedMesh();
				}
				else if (choice < 0.1) {
					child = new THREE.SkinnedMesh();
				}
				else if (choice < 0.6) {
					child = new THREE.Mesh();
				}
				else {
					child = new THREE.Group();
				}
				break; 

			default:
				console.error("Unexpected test type:", type)
				break;
		}

		child.position.copy( position );
		child.scale.copy( scale );
		child.rotation.copy( rotation );
		return child;

	};

	var generateSceneGraph = function ( root, depth, breadth, initObject, type ) {

		if ( depth > 0 ) {

			for ( var i = 0; i < breadth; i ++ ) {

				var child = initObject(type);
				root.add( child );
				generateSceneGraph( child, depth - 1, breadth, initObject, type );

			}

		}

		return root;

	};

	var nodeCount = function ( root ) {

		return root.children.reduce( function ( acc, x ) {

			return acc + nodeCount( x );

		}, 1 );

	};

	var rootA = generateSceneGraph( new THREE.Object3D(), 100, 1, createLocallyOffsetChild, "Object3D" );
	var rootB = generateSceneGraph( new THREE.Object3D(), 3, 10, createLocallyOffsetChild, "Object3D" );
	var rootC = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild, "Object3D" );
	var rootD = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild, "Polymorphic" );
	var rootE = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild, "Mesh" );
	var rootF = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild, "Skinned" );
	var rootG = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild, "Realistic" );

	var s = Bench.newSuite( 'Update world transforms' );

	s.add( 'Update graph depth=100, breadth=1, monomorphic Object3D (' + nodeCount( rootA ) + ' nodes)', function () {

		rootA.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=3, breadth=10, monomorphic Object3D (' + nodeCount( rootB ) + ' nodes)', function () {

		rootB.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=9, breadth=3, monomorphic Object3D (' + nodeCount( rootC ) + ' nodes)', function () {

		rootC.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=9, breadth=3, polymorphic (' + nodeCount( rootD ) + ' nodes)', function () {

		rootD.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=9, breadth=3, monomorphic Mesh (' + nodeCount( rootE ) + ' nodes)', function () {

		rootE.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=9, breadth=3, monomorphic SkinnedMesh (' + nodeCount( rootF ) + ' nodes)', function () {

		rootF.updateMatrixWorld( true );

	} );
	s.add( 'Update graph depth=9, breadth=3, realistic blend (' + nodeCount( rootG ) + ' nodes)', function () {

		rootG.updateMatrixWorld( true );

	} );

} )();
