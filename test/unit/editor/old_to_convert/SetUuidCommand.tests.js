/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

QUnit.module( "SetUuidCommand" );

QUnit.test( "Test SetUuidCommand (Undo and Redo)", function( assert ) {

	var editor = new Editor();
	var object = aBox( 'UUID test box' );
	editor.execute( new AddObjectCommand( object ) );


	var uuids = [ THREE.Math.generateUUID(), THREE.Math.generateUUID(), THREE.Math.generateUUID() ];

	uuids.map( function( uuid ) {

		var cmd = new SetUuidCommand( object, uuid );
		cmd.updatable = false;
		editor.execute( cmd );

	} );

	assert.ok( object.uuid == uuids[ uuids.length - 1 ],
		"OK, UUID on actual object matches last UUID in the test data array " );

	editor.undo();
	assert.ok( object.uuid == uuids[ uuids.length - 2 ],
		"OK, UUID on actual object matches second to the last UUID in the test data array (after undo)" );

	editor.redo();
	assert.ok( object.uuid == uuids[ uuids.length - 1 ],
		"OK, UUID on actual object matches last UUID in the test data array again (after redo) " );


} );
