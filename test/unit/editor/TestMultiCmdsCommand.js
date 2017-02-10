/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

QUnit.module( "MultiCmdsCommand" );

QUnit.test( "Test MultiCmdsCommand (Undo and Redo)", function( assert ) {

	var editor = new Editor();
	var box = aBox( 'Multi Command Box' );
	var boxGeometry1 = { geometry: { parameters: { width: 200, height: 201, depth: 202, widthSegments: 2, heightSegments: 3, depthSegments: 4 } } };
	var boxGeometry2 = { geometry: { parameters: { width:  50, height:  51, depth:  52, widthSegments: 7, heightSegments: 8, depthSegments: 9 } } };
	var boxGeometries = [ getGeometry( "BoxGeometry", boxGeometry1 ), getGeometry( "BoxGeometry", boxGeometry2 ) ];

	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	// setup first multi commands
	var firstMultiCmds = [

		new SetGeometryCommand( box, boxGeometries[ 0 ] ),
		new SetPositionCommand( box, new THREE.Vector3( 1, 2, 3 ) ),
		new SetRotationCommand( box, new THREE.Euler( 0.1, 0.2, 0.2 ) ),
		new SetScaleCommand( box, new THREE.Vector3( 1.1, 1.2, 1.3 ) )

	];

	firstMultiCmds.map( function( cmd ) {

		cmd.updatable = false;

	} );

	var firstMultiCmd = new MultiCmdsCommand( firstMultiCmds );
	firstMultiCmd.updatable = false;
	editor.execute( firstMultiCmd );


	// setup second multi commands
	var secondMultiCmds = [

		new SetGeometryCommand( box, boxGeometries[ 1 ] ),
		new SetPositionCommand( box, new THREE.Vector3( 4, 5, 6 ) ),
		new SetRotationCommand( box, new THREE.Euler( 0.4, 0.5, 0.6 ) ),
		new SetScaleCommand( box, new THREE.Vector3( 1.4, 1.5, 1.6 ) )

	];

	secondMultiCmds.map( function( cmd ) {

		cmd.updatable = false;

	} );

	var secondMultiCmd = new MultiCmdsCommand( secondMultiCmds );
	secondMultiCmd.updatable = false;
	editor.execute( secondMultiCmd );


	// test one modified value for each command
	assert.ok( box.geometry.parameters.widthSegments == 7, "OK, widthSegments has been modified accordingly after two multi executes (expected: 7, actual: " + box.geometry.parameters.widthSegments + ")" );
	assert.ok( box.position.y == 5, "OK, y position has been modified accordingly after two multi executes (expected: 5, actual: " + box.position.y + ")" );
	assert.ok( box.rotation.x == 0.4, "OK, x rotation has been modified accordingly after two multi executes (expected: 0.4, actual: " + box.rotation.x + ") " );
	assert.ok( box.scale.z == 1.6, "OK, z scale has been modified accordingly after two multi executes (expected: 1.6, actual: " + box.scale.z + ")" );

	editor.undo();
	assert.ok( box.geometry.parameters.widthSegments == 2, "OK, widthSegments has been modified accordingly after undo (expected: 2, actual: " + box.geometry.parameters.widthSegments + ")" );
	assert.ok( box.position.y == 2, "OK, y position has been modified accordingly after undo (expected: 2, actual: " + box.position.y + ")" );
	assert.ok( box.rotation.x == 0.1, "OK, x rotation has been modified accordingly after undo (expected: 0.1, actual: " + box.rotation.x + ")" );
	assert.ok( box.scale.z == 1.3, "OK, z scale has been modified accordingly after undo (expected: 1.3, actual: " + box.scale.z + ")" );

	editor.redo();
	assert.ok( box.geometry.parameters.widthSegments == 7, "OK, widthSegments has been modified accordingly after two multi executes (expected: 7, actual: " + box.geometry.parameters.widthSegments + ")" );
	assert.ok( box.position.y == 5, "OK, y position has been modified accordingly after two multi executes (expected: 5, actual: " + box.position.y + ")" );
	assert.ok( box.rotation.x == 0.4, "OK, x rotation has been modified accordingly after two multi executes (expected: 0.4, actual: " + box.rotation.x + ") " );
	assert.ok( box.scale.z == 1.6, "OK, z scale has been modified accordingly after two multi executes (expected: 1.6, actual: " + box.scale.z + ")" );

} );
