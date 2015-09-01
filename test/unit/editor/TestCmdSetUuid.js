module( "CmdSetUuid" );

test( "Test CmdSetUuid (Undo and Redo)", function(){

	var editor = new Editor();
	var theName = "Initial name";
	var object = aBox( theName );

	var uuidBefore = THREE.Math.generateUUID();
	var uuidAfter  = THREE.Math.generateUUID();

	editor.execute( new CmdAddObject( object ) );

	var cmd = new CmdSetUuid( object, uuidBefore );
	cmd.updatable = false;
	editor.execute( cmd );
	ok( object[ 'uuid' ] == uuidBefore, "OK, UUID is correct after first execute ");

	var cmd = new CmdSetUuid( object, uuidAfter );
	cmd.updatable = false;
	editor.execute( cmd );
	ok( object[ 'uuid' ] == uuidAfter, "OK, UUID is correct after second execute ");

	editor.undo();
	ok( object[ 'uuid' ] == uuidBefore, "OK, UUID is correct after undo ");

	editor.redo();
	ok( object[ 'uuid' ] == uuidAfter, "OK, UUID is correct after redo ");

});