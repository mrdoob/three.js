module( "CmdSetColor" );

test( "Test CmdSetColor (Undo and Redo)", function() {

	var editor = new Editor();
	var pointLight = aPointlight( "The light Light" );
	editor.execute( new CmdAddObject( pointLight ) );

	var green   = 12581843; // bffbd3
	var blue    = 14152447; // d7f2ff
	var yellow  = 16775383; // fff8d7

	var colors = [ green, blue, yellow ];

	colors.map( function( color ) {

		var cmd = new CmdSetColor( pointLight, 'color', color );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	ok( pointLight.color.getHex() == colors[ colors.length - 1 ],
		"OK, color has been set successfully (expected: '" + colors[ colors.length - 1 ] + "', actual: '" + pointLight.color.getHex() + "')" );

	editor.undo();
	ok( pointLight.color.getHex() == colors[ colors.length - 2 ],
		"OK, color has been set successfully after undo (expected: '" + colors[ colors.length - 2 ] + "', actual: '" + pointLight.color.getHex() + "')" );

	editor.redo();
	ok( pointLight.color.getHex() == colors[ colors.length - 1 ],
		"OK, color has been set successfully after redo (expected: '" + colors[ colors.length - 1 ] + "', actual: '" + pointLight.color.getHex() + "')" );


} );
