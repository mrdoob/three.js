/**
 * @author tschw
 */

module( "Interpolant" );

// Since this is an abstract base class, we have to make it concrete in order
// to test its functionality...

function Mock( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

	THREE.Interpolant.call(
			this, parameterPositions, sampleValues, sampleSize, resultBuffer );

}

Mock.prototype = Object.create( THREE.Interpolant.prototype );

Mock.prototype.intervalChanged_ = function intervalChanged( i1, t0, t1 ) {

	Mock.captureCall( arguments );

};

Mock.prototype.interpolate_ = function interpolate( i1, t0, t, t1 ) {

	Mock.captureCall( arguments );
	return this.copySampleValue_( i1 - 1 );

};

Mock.prototype.beforeStart_ = function beforeStart( i, t, t0 ) {

	Mock.captureCall( arguments );
	return this.copySampleValue_( i );

};

Mock.prototype.afterEnd_ = function afterEnd( i, tN, t ) {

	Mock.captureCall( arguments );
	return this.copySampleValue_( i );

};

// Call capturing facility

Mock.calls = null;

Mock.captureCall = function( args ) {

	if ( Mock.calls !== null ) {

		Mock.calls.push( {
			func: Mock.captureCall.caller.name,
			args: Array.prototype.slice.call( args )
		} );

	}

};

// Tests

test( "copySampleValue_", function() {

	var interpolant = new Mock( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );

	deepEqual( interpolant.copySampleValue_( 0 ), [ 1, 11 ], "sample fetch (0)" );
	deepEqual( interpolant.copySampleValue_( 1 ), [ 2, 22 ], "sample fetch (1)" );
	deepEqual( interpolant.copySampleValue_( 2 ), [ 3, 33 ], "first sample (2)" );

} );

test( "evaluate -> intervalChanged_ / interpolate_", function() {

	var actual, expect;

	var interpolant = new Mock( [ 11, 22, 33, 44, 55, 66, 77, 88, 99 ], null, 0, null );

	Mock.calls = [];
	interpolant.evaluate( 11 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 12 ); // same interval

	actual = Mock.calls[ 0 ];
	expect = { func: 'interpolate', args: [ 1, 11, 12, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 22 ); // step forward

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 2, 22, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 2, 22, 22, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2 );

	Mock.calls = [];
	interpolant.evaluate( 21 ); // step back

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 21, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 20 ); // same interval

	actual = Mock.calls[ 0 ];
	expect = { func: 'interpolate', args: [ 1, 11, 20, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 43 ); // two steps forward

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 3, 33, 44 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 3, 33, 43, 44 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 12 ); // two steps back

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 12, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 77 ); // random access

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 7, 77, 88 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 7, 77, 77, 88 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 80 ); // same interval

	actual = Mock.calls[ 0 ];
	expect = { func: 'interpolate', args: [ 7, 77, 80, 88 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 36 ); // random access

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 3, 33, 44 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 3, 33, 36, 44 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 24 ); // fast reset / loop (2nd)

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 2, 22, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 2, 22, 24, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	Mock.calls = [];
	interpolant.evaluate( 16 ); // fast reset / loop (2nd)

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 16, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

} );

test( "evaulate -> beforeStart_ [once]", function() {

	var actual, expect;

	var interpolant = new Mock( [ 11, 22, 33 ], null, 0, null );

	Mock.calls = [];
	interpolant.evaluate( 10 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'beforeStart', args: [ 0, 10, 11 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	// Check operation resumes normally and intervalChanged gets called
	Mock.calls = [];
	interpolant.evaluate( 11 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	// Back off-bounds
	Mock.calls = [];
	interpolant.evaluate( 10 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'beforeStart', args: [ 0, 10, 11 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

} );

test( "evaluate -> beforeStart_ [twice]", function() {

	var actual, expect;

	var interpolant = new Mock( [ 11, 22, 33 ], null, 0, null );

	Mock.calls = [];
	interpolant.evaluate( 10 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'beforeStart', args: [ 0, 10, 11 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	Mock.calls = []; // again - consider changed state
	interpolant.evaluate( 10 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'beforeStart', args: [ 0, 10, 11 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	// Check operation resumes normally and intervalChanged gets called
	Mock.calls = [];
	interpolant.evaluate( 11 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 1, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 1, 11, 11, 22 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

} );

test( "evaluate -> afterEnd_ [once]", function() {

	var actual, expect;

	var interpolant = new Mock( [ 11, 22, 33 ], null, 0, null );

	Mock.calls = [];
	interpolant.evaluate( 33 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'afterEnd', args: [ 2, 33, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	// Check operation resumes normally and intervalChanged gets called
	Mock.calls = [];
	interpolant.evaluate( 32 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 2, 22, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 2, 22, 32, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

	// Back off-bounds
	Mock.calls = [];
	interpolant.evaluate( 33 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'afterEnd', args: [ 2, 33, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

} );

test( "evaluate -> afterEnd_ [twice]", function() {

	var actual, expect;

	var interpolant = new Mock( [ 11, 22, 33 ], null, 0, null );

	Mock.calls = [];
	interpolant.evaluate( 33 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'afterEnd', args: [ 2, 33, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	Mock.calls = []; // again - consider changed state
	interpolant.evaluate( 33 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'afterEnd', args: [ 2, 33, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 1, "no further calls" );

	// Check operation resumes normally and intervalChanged gets called
	Mock.calls = [];
	interpolant.evaluate( 32 );

	actual = Mock.calls[ 0 ];
	expect = { func: 'intervalChanged', args: [ 2, 22, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	actual = Mock.calls[ 1 ];
	expect = { func: 'interpolate', args: [ 2, 22, 32, 33 ] };
	deepEqual( actual, expect, JSON.stringify( expect ) );

	ok( Mock.calls.length === 2, "no further calls" );

} );
