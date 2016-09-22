/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetRotationCommand" );

test( "Test SetRotationCommand (Undo and Redo)", function() {

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


	ok( box.rotation.x == rotations[ rotations.length - 1 ].x, "OK, changing X rotation was successful" );
	ok( box.rotation.y == rotations[ rotations.length - 1 ].y, "OK, changing Y rotation was successful" );
	ok( box.rotation.z == rotations[ rotations.length - 1 ].z, "OK, changing Z rotation was successful" );

	editor.undo();
	ok( box.rotation.x == rotations[ rotations.length - 2 ].x, "OK, changing X rotation was successful (after undo)" );
	ok( box.rotation.y == rotations[ rotations.length - 2 ].y, "OK, changing Y rotation was successful (after undo)" );
	ok( box.rotation.z == rotations[ rotations.length - 2 ].z, "OK, changing Z rotation was successful (after undo)" );

	editor.redo();
	ok( box.rotation.x == rotations[ rotations.length - 1 ].x, "OK, changing X rotation was successful (after redo)" );
	ok( box.rotation.y == rotations[ rotations.length - 1 ].y, "OK, changing Y rotation was successful (after redo)" );
	ok( box.rotation.z == rotations[ rotations.length - 1 ].z, "OK, changing Z rotation was successful (after redo)" );



} );
