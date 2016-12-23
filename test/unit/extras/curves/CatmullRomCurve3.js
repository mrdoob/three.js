/**
 * @author zz85 / http://joshuakoo.com
 */

module( "CatmullRomCurve3" );

var positions = [
	new THREE.Vector3( - 60, - 100,  60 ),
	new THREE.Vector3( - 60,   20,  60 ),
	new THREE.Vector3( - 60,  120,  60 ),
	new THREE.Vector3(  60,   20, - 60 ),
	new THREE.Vector3(  60, - 100, - 60 )
];

test( "catmullrom check", function() {

	var curve = new THREE.CatmullRomCurve3( positions );
	curve.type = 'catmullrom';

	var catmullPoints = [

		new THREE.Vector3( - 60, - 100, 60 ),
		new THREE.Vector3( - 60, - 51.04, 60 ),
		new THREE.Vector3( - 60, - 2.7199999999999998, 60 ),
		new THREE.Vector3( - 61.92, 44.48, 61.92 ),
		new THREE.Vector3( - 68.64, 95.36000000000001, 68.64 ),
		new THREE.Vector3( - 60, 120, 60 ),
		new THREE.Vector3( - 14.880000000000017, 95.36000000000001, 14.880000000000017 ),
		new THREE.Vector3( 41.75999999999997, 44.48000000000003, - 41.75999999999997 ),
		new THREE.Vector3( 67.68, - 4.640000000000025, - 67.68 ),
		new THREE.Vector3( 65.75999999999999, - 59.68000000000002, - 65.75999999999999 ),
		new THREE.Vector3( 60, - 100, - 60 )

	];

	var getPoints = curve.getPoints( 10 );
	var error = vectorsAreEqual( getPoints, catmullPoints );
	ok( getPoints.length == 11, 'getPoints should be equal.' );
	var desc = error ? ' ' + error : '';
	ok( ! error, 'Lists of Vectors3 should be equal.' + desc );

} );

test( "chordal basic check", function() {

	var curve = new THREE.CatmullRomCurve3( positions );

	curve.type = 'chordal';

	var chordalPoints = [
		new THREE.Vector3( - 60, - 100, 60 ),
		new THREE.Vector3( - 60, - 52, 60 ),
		new THREE.Vector3( - 60, - 4, 60 ),
		new THREE.Vector3( - 60.656435889910924, 41.62455386421379, 60.656435889910924 ),
		new THREE.Vector3( - 62.95396150459915, 87.31049238896205, 62.95396150459915 ),
		new THREE.Vector3( - 60, 120, 60 ),
		new THREE.Vector3( - 16.302568199486444, 114.1500463116312, 16.302568199486444 ),
		new THREE.Vector3( 42.998098664956586, 54.017050116427455, - 42.998098664956586 ),
		new THREE.Vector3( 63.542500175682434, - 3.0571533975463856, - 63.542500175682434 ),
		new THREE.Vector3( 62.65687513176183, - 58.49286504815978, - 62.65687513176183 ),
		new THREE.Vector3( 60.00000000000001, - 100, - 60.00000000000001 )
	];

	var getPoints = curve.getPoints( 10 );
	var error = vectorsAreEqual( getPoints, chordalPoints );
	ok( getPoints.length == 11, 'getPoints should be equal.' );
	var desc = error ? ' ' + error : '';
	ok( ! error, 'Lists of Vectors3 should be equal.' + desc );

} );

test( "centripetal basic check", function() {

	var curve = new THREE.CatmullRomCurve3( positions );
	curve.type = 'centripetal';

	var centripetalPoints = [
		new THREE.Vector3( - 60, - 100, 60 ),
		new THREE.Vector3( - 60, - 51.47527724919028, 60 ),
		new THREE.Vector3( - 60, - 3.300369665587032, 60 ),
		new THREE.Vector3( - 61.13836565863938, 42.86306307781241, 61.13836565863938 ),
		new THREE.Vector3( - 65.1226454638772, 90.69743905511538, 65.1226454638772 ),
		new THREE.Vector3( - 60, 120, 60 ),
		new THREE.Vector3( - 15.620412575504497, 103.10790870179872, 15.620412575504497 ),
		new THREE.Vector3( 42.384384731047874, 48.35477686933143, - 42.384384731047874 ),
		new THREE.Vector3( 65.25545512241153, - 3.5662509660683424, - 65.25545512241153 ),
		new THREE.Vector3( 63.94159134180865, - 58.87468822455125, - 63.94159134180865 ),
		new THREE.Vector3( 59.99999999999999, - 100, - 59.99999999999999 ),
	];

	var getPoints = curve.getPoints( 10 );
	var error = vectorsAreEqual( getPoints, centripetalPoints );
	ok( getPoints.length == 11, 'getPoints should be equal.' );
	var desc = error ? ' ' + error : '';
	ok( ! error, 'Lists of Vectors3 should be equal.' + desc );

} );

test( "closed catmullrom basic check", function() {

	var curve = new THREE.CatmullRomCurve3( positions );
	curve.type = 'catmullrom';
	curve.closed = true;

	var closedSplinePoints = [
		new THREE.Vector3( - 60, - 100, 60 ),
		new THREE.Vector3( - 67.5, - 46.25, 67.5 ),
		new THREE.Vector3( - 60, 20, 60 ),
		new THREE.Vector3( - 67.5, 83.75, 67.5 ),
		new THREE.Vector3( - 60, 120, 60 ),
		new THREE.Vector3( 0, 83.75, 0 ),
		new THREE.Vector3( 60, 20, - 60 ),
		new THREE.Vector3( 75, - 46.25, - 75 ),
		new THREE.Vector3( 60, - 100, - 60 ),
		new THREE.Vector3( 0, - 115, 0 ),
		new THREE.Vector3( - 60, - 100, 60 ),
	];

	var getPoints = curve.getPoints( 10 );
	var error = vectorsAreEqual( getPoints, closedSplinePoints );
	ok( getPoints.length == 11, 'getPoints should be equal.' );
	var desc = error ? ' ' + error : '';
	ok( ! error, 'Lists of Vectors3 should be equal.' + desc );

} );
