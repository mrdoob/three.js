
QUnit.module( "SpotLightShadow" );

QUnit.test( "clone/copy", function ( assert ) {

	var a = new THREE.SpotLightShadow();
	var b = new THREE.SpotLightShadow();
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

QUnit.test( "toJSON", function ( assert ) {

	var light = new THREE.SpotLight();
	var shadow = new THREE.SpotLightShadow();

	shadow.bias = 10;
	shadow.radius = 5;
	shadow.mapSize.set( 128, 128 );
	light.shadow = shadow;

	var json = light.toJSON();
	var newLight = new THREE.ObjectLoader().parse( json );

	assert.smartEqual( newLight.shadow, light.shadow, "Reloaded shadow is equal to the original one" );

} );
