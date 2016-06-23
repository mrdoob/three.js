/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "MoveObjectCommand" );

test( "Test MoveObjectCommand (Undo and Redo)", function() {

	var editor = new Editor();

	// create some objects
	var anakinsName = 'Anakin Skywalker';
	var lukesName   = 'Luke Skywalker';
	var anakinSkywalker = aSphere( anakinsName );
	var lukeSkywalker   = aBox( lukesName );

	editor.execute( new AddObjectCommand( anakinSkywalker ) );
	editor.execute( new AddObjectCommand( lukeSkywalker ) );


	ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is 'Scene' " );
	ok( lukeSkywalker.parent.name   == "Scene", "OK, Luke's parent is 'Scene' " );

	// Tell Luke, Anakin is his father
	editor.execute( new MoveObjectCommand( lukeSkywalker, anakinSkywalker ) );

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
