/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "Layers" );

QUnit.test( "set", function ( assert ) {

	var a = new THREE.Layers();

	a.set( 0 );
	assert.strictEqual( a.mask, 1, "Set channel 0" );

	a.set( 1 );
	assert.strictEqual( a.mask, 2, "Set channel 1" );

	a.set( 2 );
	assert.strictEqual( a.mask, 4, "Set channel 2" );

} );

QUnit.test( "enable", function ( assert ) {

	var a = new THREE.Layers();

	a.set( 0 );
	a.enable( 0 );
	assert.strictEqual( a.mask, 1, "Enable channel 0 with mask 0" );

	a.set( 0 );
	a.enable( 1 );
	assert.strictEqual( a.mask, 3, "Enable channel 1 with mask 0" );

	a.set( 1 );
	a.enable( 0 );
	assert.strictEqual( a.mask, 3, "Enable channel 0 with mask 1" );

	a.set( 1 );
	a.enable( 1 );
	assert.strictEqual( a.mask, 2, "Enable channel 1 with mask 1" );

} );

QUnit.test( "disable", function ( assert ) {

	var a = new THREE.Layers();

	a.set( 0 );
	a.disable( 0 );
	assert.strictEqual( a.mask, 0, "Disable channel 0 with mask 0" );

	a.set( 0 );
	a.disable( 1 );
	assert.strictEqual( a.mask, 1, "Disable channel 1 with mask 0" );

	a.set( 1 );
	a.disable( 0 );
	assert.strictEqual( a.mask, 2, "Disable channel 0 with mask 1" );

	a.set( 1 );
	a.disable( 1 );
	assert.strictEqual( a.mask, 0, "Disable channel 1 with mask 1" );

} );

QUnit.test( "toggle", function ( assert ) {

	var a = new THREE.Layers();

	a.set( 0 );
	a.toggle( 0 );
	assert.strictEqual( a.mask, 0, "Toggle channel 0 with mask 0" );

	a.set( 0 );
	a.toggle( 1 );
	assert.strictEqual( a.mask, 3, "Toggle channel 1 with mask 0" );

	a.set( 1 );
	a.toggle( 0 );
	assert.strictEqual( a.mask, 3, "Toggle channel 0 with mask 1" );

	a.set( 1 );
	a.toggle( 1 );
	assert.strictEqual( a.mask, 0, "Toggle channel 1 with mask 1" );

} );

QUnit.test( "test", function ( assert ) {

	var a = new THREE.Layers();
	var b = new THREE.Layers();

	assert.ok( a.test( b ), "Start out true" );

	a.set( 1 );
	assert.notOk( a.test( b ), "Set channel 1 in a and fail the test" );

	b.toggle( 1 );
	assert.ok( a.test( b ), "Toggle channel 1 in b and pass again" );

} );
