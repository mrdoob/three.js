/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetPositionCommand" );

test( "Test SetPositionCommand (Undo and Redo)", function() {

	var editor = new Editor();
	var box = aBox();
	var cmd = new AddObjectCommand( box );
	editor.execute( cmd );

	var positions = [

		{ x:   50, y: - 80, z: 30 },
		{ x: - 10, y:  100, z:  0 },
		{ x:   44, y: - 20, z: 90 }

	];

	positions.map( function( position ) {

		var newPosition = new THREE.Vector3( position.x, position.y, position.z );
		var cmd = new SetPositionCommand( box, newPosition );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	ok( box.position.x == positions[ positions.length - 1 ].x, "OK, changing X position was successful" );
	ok( box.position.y == positions[ positions.length - 1 ].y, "OK, changing Y position was successful" );
	ok( box.position.z == positions[ positions.length - 1 ].z, "OK, changing Z position was successful" );


	editor.undo();
	ok( box.position.x == positions[ positions.length - 2 ].x, "OK, changing X position was successful (after undo)" );
	ok( box.position.y == positions[ positions.length - 2 ].y, "OK, changing Y position was successful (after undo)" );
	ok( box.position.z == positions[ positions.length - 2 ].z, "OK, changing Z position was successful (after undo)" );

	editor.redo();
	ok( box.position.x == positions[ positions.length - 1 ].x, "OK, changing X position was successful (after redo)" );
	ok( box.position.y == positions[ positions.length - 1 ].y, "OK, changing Y position was successful (after redo)" );
	ok( box.position.z == positions[ positions.length - 1 ].z, "OK, changing Z position was successful (after redo)" );


} );
