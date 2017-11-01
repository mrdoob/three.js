/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "CubicBezierCurve", {

	before: function () {

		// from the docs
		this.curve = new THREE.CubicBezierCurve(
			new THREE.Vector2( - 10, 0 ),
			new THREE.Vector2( - 5, 15 ),
			new THREE.Vector2( 20, 15 ),
			new THREE.Vector2( 10, 0 )
		);

	}

} );

QUnit.test( "Simple curve", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector2( - 10, 0 ),
		new THREE.Vector2( - 3.359375, 8.4375 ),
		new THREE.Vector2( 5.625, 11.25 ),
		new THREE.Vector2( 11.796875, 8.4375 ),
		new THREE.Vector2( 10, 0 )
	];

	var points = curve.getPoints( expectedPoints.length - 1 );

	assert.strictEqual( points.length, expectedPoints.length, "Correct number of points" );
	assert.deepEqual( points, expectedPoints, "Correct points calculated" );

	// symmetry
	var curveRev = new THREE.CubicBezierCurve(
		curve.v3, curve.v2, curve.v1, curve.v0
	);

	points = curveRev.getPoints( expectedPoints.length - 1 );

	assert.strictEqual( points.length, expectedPoints.length, "Reversed: Correct number of points" );
	assert.deepEqual( points, expectedPoints.reverse(), "Reversed: Correct points curve" );

} );

QUnit.test( "getLength/getLengths", function ( assert ) {

	var curve = this.curve;

	var length = curve.getLength();
	var expectedLength = 36.64630888504102;

	assert.numEqual( length, expectedLength, "Correct length of curve" );

	var expectedLengths = [
		0,
		10.737285813492393,
		20.15159143794633,
		26.93408340370825,
		35.56079575637337
	];
	var lengths = curve.getLengths( expectedLengths.length - 1 );

	assert.strictEqual( lengths.length, expectedLengths.length, "Correct number of segments" );

	lengths.forEach( function ( segment, i ) {

		assert.numEqual( segment, expectedLengths[ i ], "segment[" + i + "] correct" );

	} );

} );

QUnit.test( "getPointAt", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector2( - 10, 0 ),
		new THREE.Vector2( - 3.3188282598022596, 8.463722639089221 ),
		new THREE.Vector2( 3.4718554735926617, 11.07899406116314 ),
		new THREE.Vector2( 10, 0 )
	];

	var points = [
		curve.getPointAt( 0 ),
		curve.getPointAt( 0.3 ),
		curve.getPointAt( 0.5 ),
		curve.getPointAt( 1 )
	];

	assert.deepEqual( points, expectedPoints, "Correct points" );

} );

QUnit.test( "getTangent/getTangentAt", function ( assert ) {

	var curve = this.curve;

	var expectedTangents = [
		new THREE.Vector2( 0.316370061632252, 0.9486358543207215 ),
		new THREE.Vector2( 0.838961283088303, 0.5441911111721949 ),
		new THREE.Vector2( 1, 0 ),
		new THREE.Vector2( 0.47628313192245453, - 0.8792919755383518 ),
		new THREE.Vector2( - 0.5546041767829665, - 0.8321142992972107 )
	];

	var tangents = [
		curve.getTangent( 0 ),
		curve.getTangent( 0.25 ),
		curve.getTangent( 0.5 ),
		curve.getTangent( 0.75 ),
		curve.getTangent( 1 )
	];

	expectedTangents.forEach( function ( exp, i ) {

		var tangent = tangents[ i ];

		assert.numEqual( tangent.x, exp.x, "getTangent #" + i + ": x correct" );
		assert.numEqual( tangent.y, exp.y, "getTangent #" + i + ": y correct" );

	} );

	//

	expectedTangents = [
		new THREE.Vector2( 0.316370061632252, 0.9486358543207215 ),
		new THREE.Vector2( 0.7794223085548987, 0.6264988945935596 ),
		new THREE.Vector2( 0.988266153082452, 0.15274164681452052 ),
		new THREE.Vector2( 0.5004110404199416, - 0.8657879593906534 ),
		new THREE.Vector2( - 0.5546041767829665, - 0.8321142992972107 )
	];

	tangents = [
		curve.getTangentAt( 0 ),
		curve.getTangentAt( 0.25 ),
		curve.getTangentAt( 0.5 ),
		curve.getTangentAt( 0.75 ),
		curve.getTangentAt( 1 )
	];

	expectedTangents.forEach( function ( exp, i ) {

		var tangent = tangents[ i ];

		assert.numEqual( tangent.x, exp.x, "getTangentAt #" + i + ": x correct" );
		assert.numEqual( tangent.y, exp.y, "getTangentAt #" + i + ": y correct" );

	} );

} );

QUnit.test( "getUtoTmapping", function ( assert ) {

	var curve = this.curve;

	var start = curve.getUtoTmapping( 0, 0 );
	var end = curve.getUtoTmapping( 0, curve.getLength() );
	var somewhere = curve.getUtoTmapping( 0.5, 1 );

	var expectedSomewhere = 0.02130029182257093;

	assert.strictEqual( start, 0, "getUtoTmapping( 0, 0 ) is the starting point" );
	assert.strictEqual( end, 1, "getUtoTmapping( 0, length ) is the ending point" );
	assert.numEqual( somewhere, expectedSomewhere, "getUtoTmapping( 0.5, 1 ) is correct" );

} );

QUnit.test( "getSpacedPoints", function ( assert ) {

	var curve = this.curve;

	var expectedPoints = [
		new THREE.Vector2( - 10, 0 ),
		new THREE.Vector2( - 6.16826457740703, 6.17025727295411 ),
		new THREE.Vector2( - 0.058874033259857184, 10.1240558653185 ),
		new THREE.Vector2( 7.123523032625162, 11.154913869041575 ),
		new THREE.Vector2( 12.301846885754463, 6.808865855469985 ),
		new THREE.Vector2( 10, 0 )
	];

	var points = curve.getSpacedPoints();

	assert.strictEqual( points.length, expectedPoints.length, "Correct number of points" );
	assert.deepEqual( points, expectedPoints, "Correct points calculated" );

} );
