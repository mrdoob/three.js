/**
 * @author zz85 / http://joshuakoo.com
 */

module( "ClosedSplineCurve3" );

var threshold = 0.000001;

function vectorsAreEqual( check, that ) {

	if ( check.length !== that.length ) return 'Length not equal';

	for ( var i = 0; i < check.length; i ++ ) {

		var a = check[ i ], b = that[ i ];
		if ( a.distanceToSquared( b ) > threshold ) {

			return 'Vector differs at index ' + i +
				'. Should be ' + [ a.x, a.y, a.z ] +
				' instead of ' + [ b.x, b.y, b.z ];
		}
	}

	return;
}

test( "basic check", function() {

	var closedSpline = new THREE.ClosedSplineCurve3( [
		new THREE.Vector3( -60, -100,  60 ),
		new THREE.Vector3( -60,   20,  60 ),
		new THREE.Vector3( -60,  120,  60 ),
		new THREE.Vector3(  60,   20, -60 ),
		new THREE.Vector3(  60, -100, -60 )
	] );

	var closedSplinePoints = [
		new THREE.Vector3(-60,-100,60),
		new THREE.Vector3(-67.5,-46.25,67.5),
		new THREE.Vector3(-60,20,60),
		new THREE.Vector3(-67.5,83.75,67.5),
		new THREE.Vector3(-60,120,60),
		new THREE.Vector3(0,83.75,0),
		new THREE.Vector3(60,20,-60),
		new THREE.Vector3(75,-46.25,-75),
		new THREE.Vector3(60,-100,-60),
		new THREE.Vector3(0,-115,0),
		new THREE.Vector3(-60,-100,60),
	];

	var getPoints = closedSpline.getPoints(10);
	var error = vectorsAreEqual( getPoints , closedSplinePoints );
	ok( getPoints.length == 11, 'getPoints should be equal.');
	var desc = error ? ' ' + error : '';
	ok( !error, 'Lists of Vectors3 should be equal.' + desc );

});