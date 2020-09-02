
QUnit.module( "SetScaleCommand" );

QUnit.test( "Test SetScaleCommand (Undo and Redo)", function( assert ) {

	// setup
	var editor = new Editor();
	var box = aBox();
	editor.execute( new AddObjectCommand( box ) );


	// scales
	var scales = [

		{ x: 1.4, y: 2.7, z: 0.4 },
		{ x: 0.1, y: 1.3, z: 2.9 },
		{ x: 3.2, y: 0.3, z: 2.0 }

	];

	scales.map( function( scale ) {

		var newScale = new THREE.Vector3( scale.x, scale.y, scale.z );
		var cmd = new SetScaleCommand( box, newScale );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	assert.ok( box.scale.x == scales[ scales.length - 1 ].x, "OK, setting X scale value was successful" );
	assert.ok( box.scale.y == scales[ scales.length - 1 ].y, "OK, setting Y scale value was successful" );
	assert.ok( box.scale.z == scales[ scales.length - 1 ].z, "OK, setting Z scale value was successful" );


	editor.undo();
	assert.ok( box.scale.x == scales[ scales.length - 2 ].x, "OK, X scale is correct after undo" );
	assert.ok( box.scale.y == scales[ scales.length - 2 ].y, "OK, Y scale is correct after undo" );
	assert.ok( box.scale.z == scales[ scales.length - 2 ].z, "OK, Z scale is correct after undo" );


	editor.redo();
	assert.ok( box.scale.x == scales[ scales.length - 1 ].x, "OK, X scale is correct after redo" );
	assert.ok( box.scale.y == scales[ scales.length - 1 ].y, "OK, Y scale is correct after redo" );
	assert.ok( box.scale.z == scales[ scales.length - 1 ].z, "OK, Z scale is correct after redo" );


} );
