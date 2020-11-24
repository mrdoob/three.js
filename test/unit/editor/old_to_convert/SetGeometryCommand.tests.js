
QUnit.module( "SetGeometryCommand" );

QUnit.test( "Test SetGeometryCommand (Undo and Redo)", function( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var box = aBox( 'Guinea Pig' ); // default ( 100, 100, 100, 1, 1, 1 )
	var boxGeometry1 = { geometry: { parameters: { width: 200, height: 201, depth: 202, widthSegments: 2, heightSegments: 3, depthSegments: 4 } } };
	var boxGeometry2 = { geometry: { parameters: { width:  50, height:  51, depth:  52, widthSegments: 7, heightSegments: 8, depthSegments: 9 } } };
	var geometryParams = [ boxGeometry1, boxGeometry2 ];


	// add the object
	var cmd = new AddObjectCommand( box );
	cmd.updatable = false;
	editor.execute( cmd );

	for ( var i = 0; i < geometryParams.length; i ++ ) {

		var cmd = new SetGeometryCommand( box, getGeometry( "BoxGeometry", geometryParams[ i ] ) );
		cmd.updatable = false;
		editor.execute( cmd );

		var actualParams = box.geometry.parameters;
		var expectedParams = geometryParams[ i ].geometry.parameters;

		assert.ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		assert.ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry" + ( i + 1 ) );
		assert.ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		assert.ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		assert.ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		assert.ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );

	}

	editor.undo();
	var actualParams = box.geometry.parameters;
	var expectedParams = geometryParams[ 0 ].geometry.parameters;
	assert.ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry1 (after undo)" );
	assert.ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry1 (after undo)" );
	assert.ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry1 (after undo)" );
	assert.ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry1 (after undo)" );
	assert.ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry1 (after undo)" );
	assert.ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry1 (after undo)" );

	editor.redo();
	var actualParams = box.geometry.parameters;
	var expectedParams = geometryParams[ 1 ].geometry.parameters;
	assert.ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry2 (after redo)" );
	assert.ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry2 (after redo)" );
	assert.ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry2 (after redo)" );
	assert.ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry2 (after redo)" );
	assert.ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry2 (after redo)" );
	assert.ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry2 (after redo)" );


} );
