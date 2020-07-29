
QUnit.module( "MoveObjectCommand" );

QUnit.test( "Test MoveObjectCommand (Undo and Redo)", function( assert ) {

	var editor = new Editor();

	// create some objects
	var anakinsName = 'Anakin Skywalker';
	var lukesName   = 'Luke Skywalker';
	var anakinSkywalker = aSphere( anakinsName );
	var lukeSkywalker   = aBox( lukesName );

	editor.execute( new AddObjectCommand( anakinSkywalker ) );
	editor.execute( new AddObjectCommand( lukeSkywalker ) );


	assert.ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is 'Scene' " );
	assert.ok( lukeSkywalker.parent.name   == "Scene", "OK, Luke's parent is 'Scene' " );

	// Tell Luke, Anakin is his father
	editor.execute( new MoveObjectCommand( lukeSkywalker, anakinSkywalker ) );

	assert.ok( true === true, "(Luke has been told who his father is)" );
	assert.ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	assert.ok( lukeSkywalker.parent.name   == anakinsName, "OK, Luke's parent is '" + anakinsName + "' " );

	editor.undo();
	assert.ok( true === true, "(Statement undone)" );
	assert.ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	assert.ok( lukeSkywalker.parent.name   == "Scene", "OK, Luke's parent is 'Scene' again " );

	editor.redo();
	assert.ok( true === true, "(Statement redone)" );
	assert.ok( anakinSkywalker.parent.name == "Scene", "OK, Anakin's parent is still 'Scene' " );
	assert.ok( lukeSkywalker.parent.name   == anakinsName, "OK, Luke's parent is '" + anakinsName + "' again " );

} );
