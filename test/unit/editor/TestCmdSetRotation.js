module( "CmdSetRotation" );

test( "Test CmdSetRotation (Undo and Redo)", function() {

	var editor = new Editor();

	var mesh = aBox();
	var initRotationX =  1.1 ;
	var initRotationY =  0.4 ;
	var initRotationZ = -2.0 ;
	mesh.rotation.x = initRotationX ;
	mesh.rotation.y = initRotationY ;
	mesh.rotation.z = initRotationZ ;

	editor.execute( new CmdAddObject( mesh ) );
	editor.select( mesh );

	// rotate the object
	var newRotationX =  -3.2 ;
	var newRotationY =   0.8 ;
	var newRotationZ =   1.5 ;
	var newRotation = new THREE.Euler( newRotationX, newRotationY, newRotationZ );
	editor.execute ( new CmdSetRotation( mesh, newRotation ) );

	ok( mesh.rotation.x != initRotationX, "OK, changing X rotation was successful" );
	ok( mesh.rotation.y != initRotationY, "OK, changing Y rotation was successful" );
	ok( mesh.rotation.z != initRotationZ, "OK, changing Z rotation was successful" );

	editor.undo();
	ok( mesh.rotation.x == initRotationX, "OK, changing X rotation value is undone" );
	ok( mesh.rotation.y == initRotationY, "OK, changing Y rotation value is undone" );
	ok( mesh.rotation.z == initRotationZ, "OK, changing Z rotation value is undone" );

	editor.redo();
	ok( mesh.rotation.x == newRotationX, "OK, changing X rotation value is redone" );
	ok( mesh.rotation.y == newRotationY, "OK, changing Y rotation value is redone" );
	ok( mesh.rotation.z == newRotationZ, "OK, changing Z rotation value is redone" );

});