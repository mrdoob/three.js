/**
 * @author Temdog007 / https://github.com/Temdog007
 */

QUnit.module( "SetTextureValueCommand" );

QUnit.test( "Test for SetTextureValueCommand (Undo and Redo)", function ( assert ) {

	// setup scene
	var editor = new Editor();
	var box = aBox();
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	// every attribute gets three test values
	var testData = {

		uuid: [ THREE.Math.generateUUID(), THREE.Math.generateUUID(), THREE.Math.generateUUID() ],
		name: [ 'Alpha', 'Bravo', 'Charlie' ],
		wrapS: [ THREE.RepeatWrapping, THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping ],
		wrapT: [ THREE.RepeatWrapping, THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping ],
		anisotropy: [ 1, 8, 16 ],
		rotation: [ 0, Math.PI * 0.5, Math.PI ]

	};

	var testDataKeys = Object.keys( testData );

	testDataKeys.map( function ( attributeName ) {

		testData[ attributeName ].map( function ( value ) {

			var cmd = new SetTextureValueCommand( box.material.map, attributeName, value );
			cmd.updatable = false;
			editor.execute( cmd );

		} );

		var length = testData[ attributeName ].length;
		assert.ok( box.material.map[ attributeName ] == testData[ attributeName ][ length - 1 ],
			"OK, " + attributeName + " was set correctly to the last value (expected: '" + testData[ attributeName ][ length - 1 ] + "', actual: '" + box.material.map[ attributeName ] + "')" );

		editor.undo();
		assert.ok( box.material.map[ attributeName ] == testData[ attributeName ][ length - 2 ],
			"OK, " + attributeName + " was set correctly to the second to the last value after undo (expected: '" + testData[ attributeName ][ length - 2 ] + "', actual: '" + box.material.map[ attributeName ] + "')" );

		editor.redo();
		assert.ok( box.material.map[ attributeName ] == testData[ attributeName ][ length - 1 ],
			"OK, " + attributeName + " was set correctly to the last value again after redo (expected: '" + testData[ attributeName ][ length - 1 ] + "', actual: '" + box.material.map[ attributeName ] + "')" );

	} );


} );
