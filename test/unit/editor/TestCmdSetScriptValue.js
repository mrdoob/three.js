module( "CmdSetScriptValue" );

test( "Test CmdSetScriptValue for source (Undo and Redo)", function() {

	var editor = new Editor();

	var box    = aBox( "The scripted box" );
	var xMove  = { name: "", source: "function update( event ) { this.position.x = this.position.x + 1; }" };
	var yMove  = { name: "", source: "function update( event ) { this.position.y = this.position.y + 1; }" };
	var scripts = [ xMove, yMove ];

	editor.execute( new CmdAddObject( box ) );

 	var cmd = new CmdAddScript( box, scripts[0] );
 	cmd.updatable = false;
 	editor.execute( cmd );

 	cmd = new CmdSetScriptValue( box, xMove, 'source', yMove['source'], 0 );
 	cmd.updatable = false;
 	editor.execute( cmd );
	ok( editor.scripts[ box.uuid ][0][ 'source' ] == yMove[ 'source' ], "OK, script source has been set successfully");

 	console.log(  editor.scripts );

	editor.undo();
	ok( editor.scripts[ box.uuid ][0][ 'source' ] == xMove[ 'source' ], "OK, script source has been set to previous state");

	editor.redo();
	ok( editor.scripts[ box.uuid ][0][ 'source' ] == yMove[ 'source' ], "OK, script source has been reverted successfully");

});