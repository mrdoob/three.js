/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "SetGeometryCommand" );

test( "Test SetGeometryCommand (Undo and Redo)", function() {

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

		ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry" + ( i + 1 ) );
		ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );

	}

	editor.undo();
	var actualParams = box.geometry.parameters;
	var expectedParams = geometryParams[ 0 ].geometry.parameters;
	ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry1 (after undo)" );
	ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry1 (after undo)" );
	ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry1 (after undo)" );
	ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry1 (after undo)" );
	ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry1 (after undo)" );
	ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry1 (after undo)" );

	editor.redo();
	var actualParams = box.geometry.parameters;
	var expectedParams = geometryParams[ 1 ].geometry.parameters;
	ok( actualParams.width == expectedParams.width, "OK, box width matches the corresponding value from boxGeometry2 (after redo)" );
	ok( actualParams.height == expectedParams.height, "OK, box height matches the corresponding value from boxGeometry2 (after redo)" );
	ok( actualParams.depth == expectedParams.depth, "OK, box depth matches the corresponding value from boxGeometry2 (after redo)" );
	ok( actualParams.widthSegments == expectedParams.widthSegments, "OK, box widthSegments matches the corresponding value from boxGeometry2 (after redo)" );
	ok( actualParams.heightSegments == expectedParams.heightSegments, "OK, box heightSegments matches the corresponding value from boxGeometry2 (after redo)" );
	ok( actualParams.depthSegments == expectedParams.depthSegments, "OK, box depthSegments matches the corresponding value from boxGeometry2 (after redo)" );


} );
