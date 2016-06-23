/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetMaterialValueCommand" );

test( "Test for SetMaterialValueCommand (Undo and Redo)", function() {

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
		shininess: [ 11.1, 22.2, 33.3 ],
		vertexColors: [ 'No', 'Face', 'Vertex' ],
		bumpScale: [ 1.1, 2.2, 3.3 ],
		reflectivity: [ - 1.3, 2.1, 5.0 ],
		aoMapIntensity: [ 0.1, 0.4, 0.7 ],
		side: [ 'Front', 'Back', 'Double' ],
		shading: [ 'No', 'Flat', 'Smooth' ],
		blending: [ 'No', 'Normal', 'Additive' ],
		opacity: [ 0.2, 0.5, 0.8 ],
		alphaTest: [ 0.1, 0.6, 0.9 ],
		wirefrimeLinewidth: [ 1.2, 3.4, 5.6 ]

	};

	var testDataKeys = Object.keys( testData );

	testDataKeys.map( function( attributeName ) {

		testData[ attributeName ].map( function( value ) {

			var cmd = new SetMaterialValueCommand( box, attributeName, value );
			cmd.updatable = false;
			editor.execute( cmd );

		} );

		var length = testData[ attributeName ].length;
		ok( box.material[ attributeName ] == testData[ attributeName ][ length - 1 ],
			"OK, " + attributeName + " was set correctly to the last value (expected: '" + testData[ attributeName ][ length - 1 ] + "', actual: '" + box.material[ attributeName ] + "')" );

		editor.undo();
		ok( box.material[ attributeName ] == testData[ attributeName ][ length - 2 ],
			"OK, " + attributeName + " was set correctly to the second to the last value after undo (expected: '" + testData[ attributeName ][ length - 2 ] + "', actual: '" + box.material[ attributeName ] + "')" );

		editor.redo();
		ok( box.material[ attributeName ] == testData[ attributeName ][ length - 1 ],
			"OK, " + attributeName + " was set correctly to the last value again after redo (expected: '" + testData[ attributeName ][ length - 1 ] + "', actual: '" + box.material[ attributeName ] + "')" );

	} );


} );
