module( "CmdSetUuid" );

test( "Test CmdSetUuid (Undo and Redo)", function(){

	var editor = new Editor();
	var object = aBox( 'UUID test box' );
	editor.execute( new CmdAddObject( object ) );


	var uuids = [ THREE.Math.generateUUID(), THREE.Math.generateUUID(), THREE.Math.generateUUID() ];

	uuids.map( function( uuid ) {

		var cmd = new CmdSetUuid( object, uuid );
		cmd.updatable = false;
		editor.execute( cmd );

	});

	ok( object.uuid == uuids[ uuids.length - 1 ],
		"OK, UUID on actual object matches last UUID in the test data array " );

	editor.undo();
	ok( object.uuid == uuids[ uuids.length - 2 ],
		"OK, UUID on actual object matches second to the last UUID in the test data array (after undo)" );

	editor.redo();
	ok( object.uuid == uuids[ uuids.length - 1 ],
		"OK, UUID on actual object matches last UUID in the test data array again (after redo) " );


});