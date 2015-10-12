module( "CmdMoveObject" );

test( "Test CmdMoveObject (Undo and Redo)", function() {

	var editor = new Editor();

	// create some objects
	var anakinsName = 'Anakin Skywalker';
	var lukesName   = 'Luke Skywalker';
	var anakinSkywalker = aSphere( anakinsName );
	var lukeSkywalker   = aBox( lukesName );

	editor.execute( new CmdAddObject( anakinSkywalker ) );
	editor.execute( new CmdAddObject( lukeSkywalker ) );


	ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is 'Scene' " );
	ok( lukeSkywalker.parent.name   == "Scene", "OK, Luke's parent is 'Scene' " );

	// Tell Luke, Anakin is his father
	editor.execute( new CmdMoveObject( lukeSkywalker, anakinSkywalker ) );

	ok( true === true, "(Luke has been told who his father is)" );
	ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	ok( lukeSkywalker.parent.name   == anakinsName, "OK, Luke's parent is '" + anakinsName + "' " );

	editor.undo();
	ok( true === true, "(Statement undone)" );
	ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	ok( lukeSkywalker.parent.name   == "Scene", "OK, Luke's parent is 'Scene' again " );

	editor.redo();
	ok( true === true, "(Statement redone)" );
	ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	ok( lukeSkywalker.parent.name   == anakinsName, "OK, Luke's parent is '" + anakinsName + "' again " );

} );
