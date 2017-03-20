/**
 * @author alemures / https://github.com/alemures
 */

QUnit.module( 'utils' );

QUnit.test( 'arrayMax' , function( assert ) {

	assert.equal( THREE.arrayMax( [] ), - Infinity );
	assert.equal( THREE.arrayMax( [ 5 ] ), 5 );
	assert.equal( THREE.arrayMax( [ 1, 5, 10 ] ), 10 );
	assert.equal( THREE.arrayMax( [ 1, 10, 5 ] ), 10 );
	assert.equal( THREE.arrayMax( [ 10, 5, 1 ] ), 10 );

});

QUnit.test( 'arrayMin' , function( assert ) {

	assert.equal( THREE.arrayMin( [] ), Infinity );
	assert.equal( THREE.arrayMin( [ 5 ] ), 5 );
	assert.equal( THREE.arrayMin( [ 1, 5, 10 ] ), 1 );
	assert.equal( THREE.arrayMin( [ 5, 1, 10 ] ), 1 );
	assert.equal( THREE.arrayMin( [ 10, 5, 1 ] ), 1 );

});
