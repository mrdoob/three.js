module( "CmdSetColor" );

test("Test CmdSetColor (Undo and Redo)", function() {

	var editor = new Editor();

	var object = aPointlight( "The light Light" );

	var green   = 12581843; // bffbd3
	var blue    = 14152447; // d7f2ff
	var yellow  = 16775383; // fff8d7

	editor.execute( new CmdAddObject( object ) );

	// set color to green
	var cmd = new CmdSetColor( object, 'color', green );
	cmd.updatable = false;	// Because otherwise the commands are merged into one command
	editor.execute( cmd );
	ok( object.color.getHex() == green , "OK, color has been set successfully, Expected: '" + green + "', Actual: '" + object.color.getHex() + "'" );

	// set color to blue
	var cmd = new CmdSetColor( object, 'color', blue );
	cmd.updatable = false;	// Because otherwise the commands are merged into one command
	editor.execute( cmd );
	ok( object.color.getHex() == blue , "OK, color has been set successfully, Expected: '" + blue + "', Actual: '" + object.color.getHex() + "'" );

	// set color to yellow
	var cmd = new CmdSetColor( object, 'color', yellow );
	cmd.updatable = false;	// Because otherwise the commands are merged into one command
	editor.execute( cmd );
	ok( object.color.getHex() == yellow , "OK, color has been set successfully, Expected: '" + yellow + "', Actual: '" + object.color.getHex() + "'" );


	editor.undo();
	ok( object.color.getHex() == blue, "OK, changing color has been undone, Expected: '" + blue + "', Actual: '" + object.color.getHex() + "'" );

	editor.redo();
	ok( object.color.getHex() == yellow , "OK, changing color has been redone, Expected: '" + yellow + "', Actual: '" + object.color.getHex() + "'" );

});