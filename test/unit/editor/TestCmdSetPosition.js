module( "CmdSetPosition" );

test( "Test CmdSetPosition (Undo and Redo)", function() {

	var editor = new Editor();

	var mesh = aBox();
	var initPosX =  50 ;
	var initPosY = -80 ;
	var initPosZ =  30 ;
	mesh.position.x = initPosX ;
	mesh.position.y = initPosY ;
	mesh.position.z = initPosZ ;

	editor.execute( new CmdAddObject( mesh ) );
	editor.select( mesh );

	// translate the object
	var newPosX = 100 ;
	var newPosY = 200 ;
	var newPosZ = 500 ;
	var newPosition = new THREE.Vector3( newPosX, newPosY, newPosZ );
	editor.execute( new CmdSetPosition( mesh, newPosition ) );

	ok( mesh.position.x != initPosX, "OK, changing X position was successful" );
	ok( mesh.position.y != initPosY, "OK, changing Y position was successful" );
	ok( mesh.position.z != initPosZ, "OK, changing Z position was successful" );

	editor.undo();
	ok( mesh.position.x == initPosX, "OK, changing X position value is undone" );
	ok( mesh.position.y == initPosY, "OK, changing Y position value is undone" );
	ok( mesh.position.z == initPosZ, "OK, changing Z position value is undone" );

	editor.redo();
	ok( mesh.position.x == newPosX, "OK, changing X position value is redone" );
	ok( mesh.position.y == newPosY, "OK, changing Y position value is redone" );
	ok( mesh.position.z == newPosZ, "OK, changing Z position value is redone" );

});