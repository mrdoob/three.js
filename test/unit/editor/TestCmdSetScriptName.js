module("CmdSetScriptName");

test( "Test CmdSetScriptValue for names", function() {

	var editor = new Editor();

	var box    = aBox( "The scripted box" );
	var xMove  = { name: "", source: "function update( event ) { this.position.x = this.position.x + 1; }" };

	var names = [ "name 1", "name 2" ];

	editor.execute( new CmdAddObject( box ) );

	var cmd = new CmdAddScript( box, xMove );
	editor.execute( cmd );

	ok( Object.keys( editor.scripts ).length == 1, "OK, script has been added" );

	names.map( function( name ) {

		cmd = new CmdSetScriptValue( box, xMove, 'name', name );
		cmd.updatable = false;
		editor.execute( cmd );

	});
	var scriptName = editor.scripts[ box.uuid ][0][ "name" ];
	ok( scriptName == names[ names.length - 1 ], "OK, the script name corresponds to the last script name that was assigned" );

	editor.undo();
	scriptName = editor.scripts[ box.uuid ][0][ "name" ];
	ok( scriptName == names[ names.length - 2 ], "OK, the script name corresponds to the second last script name that was assigned" );

	editor.redo();
	var scriptName = editor.scripts[ box.uuid ][0][ "name" ];
	ok( scriptName == names[ names.length - 1 ], "OK, the script name corresponds to the last script name that was assigned, again" );

});