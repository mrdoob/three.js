//
// Custom QUnit assertions.
//

QUnit.assert.success = function( message ) {

	// Equivalent to assert( true, message );
	QUnit.assert.push( true, undefined, undefined, message ); 

};

QUnit.assert.fail = function( message ) {

	// Equivalent to assert( false, message );
	QUnit.assert.push( false, undefined, undefined, message ); 

};
