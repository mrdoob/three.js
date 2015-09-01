module( "CmdAddObject" );

test( "Test CmdAddObject (Undo and Redo)", function() {

	var editor = new Editor();

	var theName = "This awesome box";

	var mesh = aBox( theName );

	editor.execute( new CmdAddObject( mesh ) );
	ok( editor.scene.children.length == 1, "OK, adding object was successful " );

	editor.undo();
	ok( editor.scene.children.length == 0, "OK, adding object is undone (was removed)" );

	editor.redo();
	ok( editor.scene.children[0].name == theName , "OK, removed object was added again (redo)" );

});