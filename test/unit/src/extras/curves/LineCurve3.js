/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "LineCurve3", {

	before: function () {

		this.points = [
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 10, 10, 10 ),
			new THREE.Vector3( - 10, 10, - 10 ),
			new THREE.Vector3( - 8, 5, - 7 )
		];

		this.curve = new THREE.LineCurve3( this.points[ 0 ], this.points[ 1 ] );

	}

} );

QUnit.test( "Simple curve", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 2, 2, 2 ),
		new THREE.Vector3( 4, 4, 4 ),
		new THREE.Vector3( 6, 6, 6 ),
		new THREE.Vector3( 8, 8, 8 ),
		new THREE.Vector3( 10, 10, 10 )
	];

	var points = curve.getPoints();

	assert.deepEqual( points, expectedPoints, "Correct points for first curve" );

	//

	curve = new THREE.LineCurve3( this.points[ 1 ], this.points[ 2 ] );

	expectedPoints = [
		new THREE.Vector3( 10, 10, 10 ),
		new THREE.Vector3( 6, 10, 6 ),
		new THREE.Vector3( 2, 10, 2 ),
		new THREE.Vector3( - 2, 10, - 2 ),
		new THREE.Vector3( - 6, 10, - 6 ),
		new THREE.Vector3( - 10, 10, - 10 )
	];

	points = curve.getPoints();

	assert.deepEqual( points, expectedPoints, "Correct points for second curve" );

} );

QUnit.test( "getLength/getLengths", function ( assert ) {

	var curve = this.curve;

	var length = curve.getLength();
	var expectedLength = Math.sqrt( 300 );

	assert.numEqual( length, expectedLength, "Correct length of curve" );

	var lengths = curve.getLengths( 5 );
	var expectedLengths = [
		0.0,
		Math.sqrt( 12 ),
		Math.sqrt( 48 ),
		Math.sqrt( 108 ),
		Math.sqrt( 192 ),
		Math.sqrt( 300 )
	];

	assert.strictEqual( lengths.length, expectedLengths.length, "Correct number of segments" );

	lengths.forEach( function ( segment, i ) {

		assert.numEqual( segment, expectedLengths[ i ], "segment[" + i + "] correct" );

	} );

} );

QUnit.test( "getPointAt", function ( assert ) {

	var curve = new THREE.LineCurve3( this.points[ 0 ], this.points[ 3 ] );

	var expectedPoints = [
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( - 2.4, 1.5, - 2.1 ),
		new THREE.Vector3( - 4, 2.5, - 3.5 ),
		new THREE.Vector3( - 8, 5, - 7 )
	];

	var points = [
		curve.getPointAt( 0 ),
		curve.getPointAt( 0.3 ),
		curve.getPointAt( 0.5 ),
		curve.getPointAt( 1 )
	];

	assert.deepEqual( points, expectedPoints, "Correct getPointAt points" );

} );

QUnit.test( "getTangent/getTangentAt", function ( assert ) {

	var curve = this.curve;

	var tangent = curve.getTangent( 0.5 );
	var expectedTangent = Math.sqrt( 1 / 3 );

	assert.numEqual( tangent.x, expectedTangent, "tangent.x correct" );
	assert.numEqual( tangent.y, expectedTangent, "tangent.y correct" );
	assert.numEqual( tangent.z, expectedTangent, "tangent.z correct" );

	tangent = curve.getTangentAt( 0.5 );

	assert.numEqual( tangent.x, expectedTangent, "tangentAt.x correct" );
	assert.numEqual( tangent.y, expectedTangent, "tangentAt.y correct" );
	assert.numEqual( tangent.z, expectedTangent, "tangentAt.z correct" );

} );

QUnit.test( "computeFrenetFrames", function ( assert ) {

	var curve = this.curve;

	var expected = {
		binormals: new THREE.Vector3( - 0.5 * Math.sqrt( 2 ), 0.5 * Math.sqrt( 2 ), 0 ),
		normals: new THREE.Vector3( Math.sqrt( 1 / 6 ), Math.sqrt( 1 / 6 ), - Math.sqrt( 2 / 3 ) ),
		tangents: new THREE.Vector3( Math.sqrt( 1 / 3 ), Math.sqrt( 1 / 3 ), Math.sqrt( 1 / 3 ) )
	};

	var frames = curve.computeFrenetFrames( 1, false );

	for ( var val in expected ) {

		assert.numEqual( frames[ val ][ 0 ].x, expected[ val ].x, "Frenet frames " + val + ".x correct" );
		assert.numEqual( frames[ val ][ 0 ].y, expected[ val ].y, "Frenet frames " + val + ".y correct" );
		assert.numEqual( frames[ val ][ 0 ].z, expected[ val ].z, "Frenet frames " + val + ".z correct" );

	}

} );

QUnit.test( "getUtoTmapping", function ( assert ) {

	var curve = this.curve;

	var start = curve.getUtoTmapping( 0, 0 );
	var end = curve.getUtoTmapping( 0, curve.getLength() );
	var somewhere = curve.getUtoTmapping( 0.7, 0 );

	assert.strictEqual( start, 0, "getUtoTmapping( 0, 0 ) is the starting point" );
	assert.strictEqual( end, 1, "getUtoTmapping( 0, length ) is the ending point" );
	assert.numEqual( somewhere, 0.7, "getUtoTmapping( 0.7, 0 ) is correct" );

} );

QUnit.test( "getSpacedPoints", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 2.5, 2.5, 2.5 ),
		new THREE.Vector3( 5, 5, 5 ),
		new THREE.Vector3( 7.5, 7.5, 7.5 ),
		new THREE.Vector3( 10, 10, 10 )
	];

	var points = curve.getSpacedPoints( 4 );

	assert.strictEqual( points.length, expectedPoints.length, "Correct number of points" );
	assert.deepEqual( points, expectedPoints, "Correct points calculated" );

} );
