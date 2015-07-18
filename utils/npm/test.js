/**
 * For testing whether the node modules for three and three-math work properly.
 *
 * To test the node modules:
 *  1. First build them, but don't submit them to npm, see README.md for instructions
 *  2. Run "node test.js"
 *  3. You should see a list of all of the types exposed by the two THREE modules.
 *
 * @author bhouston / http://exocortex.com
 */

var threemath = function () {
	var THREE = require( "three-math" );

	var a = new THREE.Vector3( 1, 1, 1 );
	console.log( a );

	for( var i in THREE ) {
		console.log( i );
	}
};

var three = function () {
	var THREE = require( "three" );

	var a = new THREE.Vector3( 1, 1, 1 );
	console.log( a );

	for( var i in THREE ) {
		console.log( i );
	}
};

threemath();
three();