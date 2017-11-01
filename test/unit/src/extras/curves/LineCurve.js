/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "LineCurve", {

	before: function () {

		this.points = [
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 10, 10 ),
			new THREE.Vector2( - 10, 10 ),
			new THREE.Vector2( - 8, 5 )
		];

		this.curve = new THREE.LineCurve( this.points[ 0 ], this.points[ 1 ] );

	}

} );

QUnit.test( "Simple curve", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( 2, 2 ),
		new THREE.Vector2( 4, 4 ),
		new THREE.Vector2( 6, 6 ),
		new THREE.Vector2( 8, 8 ),
		new THREE.Vector2( 10, 10 )
	];

	var points = curve.getPoints();

	assert.deepEqual( points, expectedPoints, "Correct points for first curve" );

	//

	curve = new THREE.LineCurve( this.points[ 1 ], this.points[ 2 ] );

	expectedPoints = [
		new THREE.Vector2( 10, 10 ),
		new THREE.Vector2( 6, 10 ),
		new THREE.Vector2( 2, 10 ),
		new THREE.Vector2( - 2, 10 ),
		new THREE.Vector2( - 6, 10 ),
		new THREE.Vector2( - 10, 10 )
	];

	points = curve.getPoints();

	assert.deepEqual( points, expectedPoints, "Correct points for second curve" );

} );

QUnit.test( "getLength/getLengths", function ( assert ) {

	var curve = this.curve;

	var length = curve.getLength();
	var expectedLength = Math.sqrt( 200 );

	assert.numEqual( length, expectedLength, "Correct length of curve" );

	var lengths = curve.getLengths( 5 );
	var expectedLengths = [
		0.0,
		Math.sqrt( 8 ),
		Math.sqrt( 32 ),
		Math.sqrt( 72 ),
		Math.sqrt( 128 ),
		Math.sqrt( 200 )
	];

	assert.strictEqual( lengths.length, expectedLengths.length, "Correct number of segments" );

	lengths.forEach( function ( segment, i ) {

		assert.numEqual( segment, expectedLengths[ i ], "segment[" + i + "] correct" );

	} );

} );

QUnit.test( "getPointAt", function ( assert ) {

	var curve = new THREE.LineCurve( this.points[ 0 ], this.points[ 3 ] );

	var expectedPoints = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( - 2.4, 1.5 ),
		new THREE.Vector2( - 4, 2.5 ),
		new THREE.Vector2( - 8, 5 )
	];

	var points = [
		curve.getPointAt( 0 ),
		curve.getPointAt( 0.3 ),
		curve.getPointAt( 0.5 ),
		curve.getPointAt( 1 )
	];

	assert.deepEqual( points, expectedPoints, "Correct points" );

} );

QUnit.test( "getTangent", function ( assert ) {

	var curve = this.curve;

	var tangent = curve.getTangent( 0 );
	var expectedTangent = Math.sqrt( 0.5 );

	assert.numEqual( tangent.x, expectedTangent, "tangent.x correct" );
	assert.numEqual( tangent.y, expectedTangent, "tangent.y correct" );

} );

QUnit.test( "getUtoTmapping", function ( assert ) {

	var curve = this.curve;

	var start = curve.getUtoTmapping( 0, 0 );
	var end = curve.getUtoTmapping( 0, curve.getLength() );
	var somewhere = curve.getUtoTmapping( 0.3, 0 );

	assert.strictEqual( start, 0, "getUtoTmapping( 0, 0 ) is the starting point" );
	assert.strictEqual( end, 1, "getUtoTmapping( 0, length ) is the ending point" );
	assert.numEqual( somewhere, 0.3, "getUtoTmapping( 0.3, 0 ) is correct" );

} );

QUnit.test( "getSpacedPoints", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( 2.5, 2.5 ),
		new THREE.Vector2( 5, 5 ),
		new THREE.Vector2( 7.5, 7.5 ),
		new THREE.Vector2( 10, 10 )
	];

	var points = curve.getSpacedPoints( 4 );

	assert.strictEqual( points.length, expectedPoints.length, "Correct number of points" );
	assert.deepEqual( points, expectedPoints, "Correct points calculated" );

} );
