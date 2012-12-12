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