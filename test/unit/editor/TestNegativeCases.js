/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "NegativeCases" );

test( "Test unwanted situations ", function() {

	var editor = new Editor();

	// illegal
	editor.undo();
	ok( editor.history.undos.length == 0, "OK, (illegal) undo did not affect the undo history" );
	ok( editor.history.redos.length == 0, "OK, (illegal) undo did not affect the redo history" );

	// illegal
	editor.redo();
	ok( editor.history.undos.length == 0, "OK, (illegal) redo did not affect the undo history" );
	ok( editor.history.redos.length == 0, "OK, (illegal) redo did not affect the redo history" );


	var box = aBox();
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	ok( editor.history.undos.length == 1, "OK, execute changed undo history" );
	ok( editor.history.redos.length == 0, "OK, execute did not change redo history" );

	// illegal
	editor.redo();
	ok( editor.history.undos.length == 1, "OK, (illegal) redo did not affect the undo history" );
	ok( editor.history.redos.length == 0, "OK, (illegal) redo did not affect the redo history" );


	editor.undo();
	ok( editor.history.undos.length == 0, "OK, undo changed the undo history" );
	ok( editor.history.redos.length == 1, "OK, undo changed the redo history" );

	// illegal
	editor.undo();
	ok( editor.history.undos.length == 0, "OK, (illegal) undo did not affect the undo history" );
	ok( editor.history.redos.length == 1, "OK, (illegal) undo did not affect the redo history" );

	editor.redo();
	ok( editor.history.undos.length == 1, "OK, redo changed the undo history" );
	ok( editor.history.redos.length == 0, "OK, undo changed the redo history" );

	// illegal
	editor.redo();
	ok( editor.history.undos.length == 1, "OK, (illegal) did not affect the undo history" );
	ok( editor.history.redos.length == 0, "OK, (illegal) did not affect the redo history" );

} );
