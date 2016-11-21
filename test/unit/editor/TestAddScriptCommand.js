/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "AddScriptCommand" );

test( "Test AddScriptCommand (Undo and Redo)", function() {

	var editor = new Editor();

	// prepare
	var box    = aBox( "The scripted box" );
	var sphere = aSphere( "The scripted sphere" );
	var objects = [ box, sphere ];

	var xMove  = { name: "", source: "function update( event ) { this.position.x = this.position.x + 1; }" };
	var yMove  = { name: "", source: "function update( event ) { this.position.y = this.position.y + 1; }" };
	var scripts = [ xMove, yMove ];

	// add objects to editor
	objects.map( function( item ) {

		editor.execute( new AddObjectCommand( item ) );

	} );
	ok( editor.scene.children.length == 2, "OK, the box and the sphere have been added" );

	// add scripts to the objects
	for ( var i = 0; i < scripts.length; i ++ ) {

		var cmd = new AddScriptCommand( objects[ i ], scripts[ i ] );
		cmd.updatable = false;
		editor.execute( cmd );

	}

	var scriptsKeys = Object.keys( editor.scripts );
	ok( getScriptCount( editor ) == scripts.length, "OK, correct number of scripts have been added" );

	for ( var i = 0; i < objects.length; i ++ ) {

		ok( objects[ i ].uuid == scriptsKeys[ i ], "OK, script key #" + i + " matches the object's UUID" );

	}

	editor.undo();
	ok( getScriptCount( editor ) == scripts.length - 1, "OK, one script has been removed by undo" );

	editor.redo();
	ok( getScriptCount( editor ) == scripts.length, "OK, one script has been added again by redo" );


	for ( var i = 0; i < scriptsKeys.length; i ++ ) {

		ok( editor.scripts[ scriptsKeys[ i ] ][ 0 ] == scripts[ i ], "OK, script #" + i + " is still assigned correctly" );

	}


} );

