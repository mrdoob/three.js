
QUnit.module( "MassUndoAndRedo" );

QUnit.test( "MassUndoAndRedo (stress test)", function( assert ) {

	var editor = new Editor();

	var MAX_OBJECTS = 100;

	// add objects
	var i = 0;
	while ( i < MAX_OBJECTS ) {

		var object = aSphere( 'Sphere #' + i );
		var cmd = new AddObjectCommand( object );
		cmd.updatable = false;
		editor.execute( cmd );

		i ++;

	}

	assert.ok( editor.scene.children.lenght = MAX_OBJECTS,
		"OK, " + MAX_OBJECTS + " objects have been added" );

	// remove all objects
	i = 0;
	while ( i < MAX_OBJECTS ) {

		editor.undo();
		i ++;

	}


	assert.ok( editor.scene.children.length == 0,
		"OK, all objects have been removed by undos" );


	i = 0;
	while ( i < MAX_OBJECTS ) {

		editor.redo();
		i ++;

	}

	assert.ok( editor.scene.children.lenght = MAX_OBJECTS,
		"OK, " + MAX_OBJECTS + " objects have been added again by redos" );

} );
