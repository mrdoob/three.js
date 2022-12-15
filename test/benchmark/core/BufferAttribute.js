( function () {

	const input = new THREE.BufferAttribute( new Float32Array( 10000 * 3 ), 3 );

	const vector = new THREE.Vector3();

	for ( let i = 0, il = input.count; i < il; i ++ ) {

		input.setItem( i, Math.random(), Math.random(), Math.random() );

	}

	const s = Bench.newSuite( 'BufferAttribute' );

	s.add( 'getItem', function () {

		let maxX = Infinity;
		let maxY = Infinity;
		let maxZ = Infinity;

		for ( let i = 0, il = input.count; i < il; i ++ ) {

			const [ x, y, z ] = input.getItem( i );

			maxX = Math.max( x, maxX );
			maxY = Math.max( y, maxY );
			maxZ = Math.max( z, maxZ );

		}

	} );

	s.add( 'getX-getY-getZ', function () {

		let maxX = Infinity;
		let maxY = Infinity;
		let maxZ = Infinity;

		for ( let i = 0, il = input.count; i < il; i ++ ) {

			const x = input.getX( i );
			const y = input.getY( i );
			const z = input.getZ( i );

			maxX = Math.max( x, maxX );
			maxY = Math.max( y, maxY );
			maxZ = Math.max( z, maxZ );

		}

	} );

	s.add( 'fromBufferAttribute', function () {

		let maxX = Infinity;
		let maxY = Infinity;
		let maxZ = Infinity;

		for ( let i = 0, il = input.count; i < il; i ++ ) {

			vector.fromBufferAttribute( input, i );

			maxX = Math.max( vector.x, maxX );
			maxY = Math.max( vector.y, maxY );
			maxZ = Math.max( vector.z, maxZ );

		}

	} );

} )();
