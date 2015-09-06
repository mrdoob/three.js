module( "CmdSetGeometry" );

test( "Test CmdSetGeometry", function() {

	var editor = new Editor();

	// initialize objects and geometries
	var box = aBox( 'Guinea Pig' ); // default ( 100, 100, 100, 1, 1, 1 )
	var boxGeometry1 = { width: 200, height: 201, depth: 202, widthSegments: 2, heightSegments: 3, depthSegments: 4 };
	var boxGeometry2 = { width:  50, height:  51, depth:  52, widthSegments: 7, heightSegments: 8, depthSegments: 9 };
	var geometryParams = [ boxGeometry1, boxGeometry2 ];

	// add the object
	var cmd = new CmdAddObject( box );
	cmd.updatable = false;
	editor.execute( cmd );

	for ( var i = 0; i < geometryParams.length; i++ ) {

		var cmd = new CmdSetGeometry( box, new THREE.BoxGeometry(
			geometryParams[i]['width'],
			geometryParams[i]['height'],
			geometryParams[i]['depth'],
			geometryParams[i]['widthSegments'],
			geometryParams[i]['heightSegments'],
			geometryParams[i]['depthSegments']
		) );
		cmd.updatable = false;
		editor.execute( cmd );

		var params = box.geometry.parameters;

		ok( params.width == geometryParams[i]['width'], "OK, box width matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( params.height == geometryParams[i]['height'], "OK, box height matches the corresponding value from boxGeometry" + ( i + 1 ) );
		ok( params.depth == geometryParams[i]['depth'], "OK, box depth matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( params.widthSegments == geometryParams[i]['widthSegments'], "OK, box widthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( params.heightSegments == geometryParams[i]['heightSegments'], "OK, box heightSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );
		ok( params.depthSegments == geometryParams[i]['depthSegments'], "OK, box depthSegments matches the corresponding value from boxGeometry"  + ( i + 1 ) );

	}

	editor.undo();
	var params = box.geometry.parameters;
	ok( params.width == geometryParams[0]['width'], "OK, box width matches the corresponding value from boxGeometry1 (after undo)");
	ok( params.height == geometryParams[0]['height'], "OK, box height matches the corresponding value from boxGeometry1 (after undo)");
	ok( params.depth == geometryParams[0]['depth'], "OK, box depth matches the corresponding value from boxGeometry1 (after undo)");
	ok( params.widthSegments == geometryParams[0]['widthSegments'], "OK, box widthSegments matches the corresponding value from boxGeometry1 (after undo)");
	ok( params.heightSegments == geometryParams[0]['heightSegments'], "OK, box heightSegments matches the corresponding value from boxGeometry1 (after undo)");
	ok( params.depthSegments == geometryParams[0]['depthSegments'], "OK, box depthSegments matches the corresponding value from boxGeometry1 (after undo)");

	editor.redo();
	var params = box.geometry.parameters;
	ok( params.width == geometryParams[1]['width'], "OK, box width matches the corresponding value from boxGeometry2 (after redo)");
	ok( params.height == geometryParams[1]['height'], "OK, box height matches the corresponding value from boxGeometry2 (after redo)");
	ok( params.depth == geometryParams[1]['depth'], "OK, box depth matches the corresponding value from boxGeometry2 (after redo)");
	ok( params.widthSegments == geometryParams[1]['widthSegments'], "OK, box widthSegments matches the corresponding value from boxGeometry2 (after redo)");
	ok( params.heightSegments == geometryParams[1]['heightSegments'], "OK, box heightSegments matches the corresponding value from boxGeometry2 (after redo)");
	ok( params.depthSegments == geometryParams[1]['depthSegments'], "OK, box depthSegments matches the corresponding value from boxGeometry2 (after redo)");


});