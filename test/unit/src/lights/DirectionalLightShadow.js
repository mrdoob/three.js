
QUnit.module( "DirectionalLightShadow" );

QUnit.test( "clone/copy", function ( assert ) {

	var a = new THREE.DirectionalLightShadow();
	var b = new THREE.DirectionalLightShadow();
	var c;

	assert.notDeepEqual( a, b, "Newly instanced shadows are not equal" );

	c = a.clone();
	assert.smartEqual( a, c, "Shadows are identical after clone()" );

	c.mapSize.set( 1024, 1024 );
	assert.notDeepEqual( a, c, "Shadows are different again after change" );

	b.copy( a );
	assert.smartEqual( a, b, "Shadows are identical after copy()" );

	b.mapSize.set( 512, 512 );
	assert.notDeepEqual( a, b, "Shadows are different again after change" );

} );

QUnit.test( "toJSON", function ( assert ) {

	var light = new THREE.DirectionalLight();
	var shadow = new THREE.DirectionalLightShadow();

	shadow.bias = 10;
	shadow.radius = 5;
	shadow.mapSize.set( 1024, 1024 );
	light.shadow = shadow;

	var json = light.toJSON();
	var newLight = new THREE.ObjectLoader().parse( json );

	assert.smartEqual( newLight.shadow, light.shadow, "Reloaded shadow is identical to the original one" );

} );
