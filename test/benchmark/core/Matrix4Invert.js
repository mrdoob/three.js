( function () {

	THREE = Bench.THREE;

  const mat4 = new THREE.Matrix4( 4 );
  mat4.makeRotationX( Math.PI / 2 );
  mat4.setPosition( 1, 2, 3 );
  mat4.scale( new THREE.Vector3( 1, 2, 3 ) );

	var suite = Bench.newSuite( 'Matrix 4 Invert' );

  const t0 = performance.now();

  for ( var i = 0; i < 1000000; i ++ ) {

    mat4.invert();
    
  }

  const t1 = performance.now();

  for ( var i = 0; i < 1000000; i ++ ) {

    mat4.invertTransform();

  }

  const t2 = performance.now();

  console.log( 'invert 1000000 cost:', ( t1 - t0 ).toFixed( 2 ) );
  console.log( 'invertTransform 1000000 cost:', ( t2 - t1 ).toFixed( 2 ) );

	suite.add( 'Invert', function () {

		for ( var i = 0; i < 1000000; i ++ ) {

      mat4.invert();
			
		}

	} );

	suite.add( 'InvertTransform', function () {

		for ( var i = 0; i < 1000000; i ++ ) {

      mat4.invertTransform();

		}

	} );

} )();
