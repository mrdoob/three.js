module( "CmdRemoveObject" );

test( "Test CmdRemoveObject (Undo and Redo)", function() {

	var editor = new Editor();

	var theName = "Come back!" ;

	var mesh = aBox( theName );

	editor.execute( new CmdAddObject( mesh ) );
	editor.select( mesh );

	// var object = editor.selected;
	var parent = mesh.parent;

	editor.execute( new CmdRemoveObject( mesh ) );
	editor.select( parent );
	ok( editor.scene.children.length == 0, "OK, object removal was successful" );

	editor.undo();
	ok( editor.scene.children[0].name == theName, "OK, removal was undone successfully, object exists again" );

	editor.redo();
	ok( editor.scene.children.length == 0, "OK, object was removed again (redo removal)" );

});