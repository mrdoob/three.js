/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

QUnit.module( "SetGeometryValueCommand" );

QUnit.test( "Test SetGeometryValueCommand (Undo and Redo)", function( assert ) {

	var editor = new Editor();
	var box = aBox( 'The Box' );

	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	var testData = [
		{ uuid: THREE.Math.generateUUID(), name: 'Bruno' },
		{ uuid: THREE.Math.generateUUID(), name: 'Jack' }
	];

	for ( var i = 0; i < testData.length; i ++ ) {

		var keys = Object.keys( testData[ i ] );

		keys.map( function( key ) {

			cmd = new SetGeometryValueCommand( box, key, testData[ i ][ key ] );
			cmd.updatable = false;
			editor.execute( cmd );

		} );

	}

	assert.ok( box.geometry.name == testData[ 1 ].name, "OK, box.geometry.name is correct after executes" );
	assert.ok( box.geometry.uuid == testData[ 1 ].uuid, "OK, box.geometry.uuid is correct after executes" );

	editor.undo();
	editor.undo();

	assert.ok( box.geometry.name == testData[ 0 ].name, "OK, box.geometry.name is correct after undos" );
	assert.ok( box.geometry.uuid == testData[ 0 ].uuid, "OK, box.geometry.uuid is correct after undos" );

	editor.redo();
	editor.redo();

	assert.ok( box.geometry.name == testData[ 1 ].name, "OK, box.geometry.name is correct after executes" );
	assert.ok( box.geometry.uuid == testData[ 1 ].uuid, "OK, box.geometry.uuid is correct after executes" );

} );
