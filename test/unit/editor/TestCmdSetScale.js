module( "CmdSetScale" );

test( "Test CmdSetScale (Undo and Redo)", function() {

	var editor = new Editor();

	var mesh = aBox();
	var initScaleX =  1.4 ;
	var initScaleY =  2.7 ;
	var initScaleZ =  0.4 ;
	mesh.scale.x = initScaleX ;
	mesh.scale.y = initScaleY ;
	mesh.scale.z = initScaleZ ;

	editor.execute( new CmdAddObject( mesh ) );
	editor.select( mesh );

	// (re)scale the object
	var newScaleX = 0.1 ;
	var newScaleY = 5.3 ;
	var newScaleZ = 1.0 ;
	var newScale = new THREE.Vector3( newScaleX, newScaleY, newScaleZ );
	editor.execute ( new CmdSetScale( mesh, newScale ) );

	ok( mesh.scale.x != initScaleX, "OK, changing X scale was successful" );
	ok( mesh.scale.y != initScaleY, "OK, changing Y scale was successful" );
	ok( mesh.scale.z != initScaleZ, "OK, changing Z scale was successful" );

	editor.undo();
	ok( mesh.scale.x == initScaleX, "OK, changing X scale value is undone" );
	ok( mesh.scale.y == initScaleY, "OK, changing Y scale value is undone" );
	ok( mesh.scale.z == initScaleZ, "OK, changing Z scale value is undone" );

	editor.redo();
	ok( mesh.scale.x == newScaleX, "OK, changing X scale value is redone" );
	ok( mesh.scale.y == newScaleY, "OK, changing Y scale value is redone" );
	ok( mesh.scale.z == newScaleZ, "OK, changing Z scale value is redone" );

});