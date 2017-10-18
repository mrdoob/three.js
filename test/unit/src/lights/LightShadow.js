
QUnit.module( "LightShadow" );

QUnit.test( "clone/copy", function ( assert ) {

	var a = new THREE.LightShadow( new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );
	var b = new THREE.LightShadow( new THREE.OrthographicCamera( - 3, 3, 3, - 3, 0.3, 300 ) );
	var c;

	assert.notDeepEqual( a, b, "Newly instanced shadows are not equal" );

	c = a.clone();
	assert.smartEqual( a, c, "Shadows are identical after clone()" );

	c.mapSize.set( 256, 256 );
	assert.notDeepEqual( a, c, "Shadows are different again after change" );

	b.copy( a );
	assert.smartEqual( a, b, "Shadows are identical after copy()" );

	b.mapSize.set( 512, 512 );
	assert.notDeepEqual( a, b, "Shadows are different again after change" );

} );
