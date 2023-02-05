( function () {

	THREE = Bench.THREE;

	const position = new THREE.Vector3( 1, 1, 1 );
	const scale = new THREE.Vector3( 2, 1, 0.5 );
	const quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 8 );

	const createLocallyOffsetChild = function () {

		const child = new THREE.Object3D();
		child.position.copy( position );
		child.scale.copy( scale );
		child.quaternion.copy( quaternion );

		return child;

	};

	const generateSceneGraph = function ( root, depth, breadth, initObject ) {

		if ( depth > 0 ) {

			for ( let i = 0; i < breadth; i ++ ) {

				const child = initObject();
				root.add( child );
				generateSceneGraph( child, depth - 1, breadth, initObject );

			}

		}

		return root;

	};

	const nodeCount = function ( root ) {

		return root.children.reduce( function ( acc, x ) {

			return acc + nodeCount( x );

		}, 1 );

	};

	const rootA = generateSceneGraph( new THREE.Object3D(), 100, 1, createLocallyOffsetChild );
	const rootB = generateSceneGraph( new THREE.Object3D(), 3, 10, createLocallyOffsetChild );
	const rootC = generateSceneGraph( new THREE.Object3D(), 9, 3, createLocallyOffsetChild );

	const s = Bench.newSuite( 'Update world transforms' );

	s.add( 'Update graph depth=100, breadth=1 (' + nodeCount( rootA ) + ' nodes)', function () {

		rootA.updateMatrixWorld( true );

	} );

	s.add( 'Update graph depth=3, breadth=10 (' + nodeCount( rootB ) + ' nodes)', function () {

		rootB.updateMatrixWorld( true );

	} );

	s.add( 'Update graph depth=9, breadth=3 (' + nodeCount( rootC ) + ' nodes)', function () {

		rootC.updateMatrixWorld( true );

	} );

} )();
