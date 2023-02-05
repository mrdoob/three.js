( function () {

	const input = new Float32Array( 10000 * 3 );
	const output = new Float32Array( 10000 * 3 );

	for ( let j = 0, jl = input.length; j < jl; j ++ ) {

		input[ j ] = j;

	}

	const s = Bench.newSuite( 'Float 32 Arrays' );

	s.add( 'Float32Array-Float32Array', function () {

		const value3 = new Float32Array( 3 );
		for ( let i = 0, il = input.length / 3; i < il; i += 3 ) {

			value3[ 0 ] = input[ i + 0 ];
			value3[ 1 ] = input[ i + 1 ];
			value3[ 2 ] = input[ i + 2 ];
			value3[ 0 ] *= 1.01;
			value3[ 1 ] *= 1.03;
			value3[ 2 ] *= 0.98;
			output[ i + 0 ] = value3[ 0 ];
			output[ i + 1 ] = value3[ 1 ];
			output[ i + 2 ] = value3[ 2 ];

		}

	} );

	s.add( 'Float32Array-Array', function () {

		const value2 = [ 0, 0, 0 ];
		for ( let i = 0, il = input.length / 3; i < il; i += 3 ) {

			value2[ 0 ] = input[ i + 0 ];
			value2[ 1 ] = input[ i + 1 ];
			value2[ 2 ] = input[ i + 2 ];
			value2[ 0 ] *= 1.01;
			value2[ 1 ] *= 1.03;
			value2[ 2 ] *= 0.98;
			output[ i + 0 ] = value2[ 0 ];
			output[ i + 1 ] = value2[ 1 ];
			output[ i + 2 ] = value2[ 2 ];

		}

	} );

	s.add( 'Float32Array-Literal', function () {

		let x, y, z;
		for ( let i = 0, il = input.length / 3; i < il; i += 3 ) {

			x = input[ i + 0 ];
			y = input[ i + 1 ];
			z = input[ i + 2 ];
			x *= 1.01;
			y *= 1.03;
			z *= 0.98;
			output[ i + 0 ] = x;
			output[ i + 1 ] = y;
			output[ i + 2 ] = z;

		}

	} );

	s.add( 'Float32Array-Vector3', function () {

		const value = new THREE.Vector3();
		for ( let i = 0, il = input.length / 3; i < il; i += 3 ) {

			value.x = input[ i + 0 ];
			value.y = input[ i + 1 ];
			value.z = input[ i + 2 ];
			value.x *= 1.01;
			value.y *= 1.03;
			value.z *= 0.98;
			output[ i + 0 ] = value.x;
			output[ i + 1 ] = value.y;
			output[ i + 2 ] = value.z;

		}

	} );

} )();
