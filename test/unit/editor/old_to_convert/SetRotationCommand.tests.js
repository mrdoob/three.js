
QUnit.module( "SetRotationCommand" );

QUnit.test( "Test SetRotationCommand (Undo and Redo)", function( assert ) {

	// setup
	var editor = new Editor();
	var box = aBox();
	editor.execute( new AddObjectCommand( box ) );


	var rotations = [

		{ x: 1.1, y:   0.4, z: - 2.0 },
		{ x: 2.2, y: - 1.3, z:   1.3 },
		{ x: 0.3, y: - 0.1, z: - 1.9 }

	];


	rotations.map( function( rotation ) {

		var newRotation = new THREE.Euler( rotation.x, rotation.y, rotation.z );
		var cmd = new SetRotationCommand( box, newRotation );
		cmd.updatable = false;
		editor.execute ( cmd );

	} );


	assert.ok( box.rotation.x == rotations[ rotations.length - 1 ].x, "OK, changing X rotation was successful" );
	assert.ok( box.rotation.y == rotations[ rotations.length - 1 ].y, "OK, changing Y rotation was successful" );
	assert.ok( box.rotation.z == rotations[ rotations.length - 1 ].z, "OK, changing Z rotation was successful" );

	editor.undo();
	assert.ok( box.rotation.x == rotations[ rotations.length - 2 ].x, "OK, changing X rotation was successful (after undo)" );
	assert.ok( box.rotation.y == rotations[ rotations.length - 2 ].y, "OK, changing Y rotation was successful (after undo)" );
	assert.ok( box.rotation.z == rotations[ rotations.length - 2 ].z, "OK, changing Z rotation was successful (after undo)" );

	editor.redo();
	assert.ok( box.rotation.x == rotations[ rotations.length - 1 ].x, "OK, changing X rotation was successful (after redo)" );
	assert.ok( box.rotation.y == rotations[ rotations.length - 1 ].y, "OK, changing Y rotation was successful (after redo)" );
	assert.ok( box.rotation.z == rotations[ rotations.length - 1 ].z, "OK, changing Z rotation was successful (after redo)" );



} );
