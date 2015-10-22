/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

module( "NestedDoUndoRedo" );

test( "Test nested Do's, Undo's and Redo's", function() {

	var editor = new Editor();

	var mesh = aBox( 'One box unlike all others' );

	var initPosX      =  2 ;
	var initPosY      =  3 ;
	var initPosZ      =  4 ;
	var initRotationX = 12 ;
	var initRotationY = 13 ;
	var initRotationZ = 14 ;
	var initScaleX    = 22 ;
	var initScaleY    = 23 ;
	var initScaleZ    = 24 ;

	mesh.position.x = initPosX ;
	mesh.position.y = initPosY ;
	mesh.position.z = initPosZ ;
	mesh.rotation.x = initRotationX ;
	mesh.rotation.y = initRotationY ;
	mesh.rotation.z = initRotationZ ;
	mesh.scale.x    = initScaleX ;
	mesh.scale.y    = initScaleY ;
	mesh.scale.z    = initScaleZ ;

	// let's begin
	editor.execute( new AddObjectCommand( mesh ) );

	var newPos = new THREE.Vector3( initPosX + 100, initPosY, initPosZ );
	editor.execute( new SetPositionCommand( mesh, newPos ) );

	var newRotation = new THREE.Euler( initRotationX, initRotationY + 1000, initRotationZ );
	editor.execute( new SetRotationCommand( mesh, newRotation ) );

	var newScale = new THREE.Vector3( initScaleX, initScaleY, initScaleZ + 10000 );
	editor.execute( new SetScaleCommand( mesh, newScale ) );


	/* full check */

	ok( mesh.position.x ==   102, "OK, X position is correct " );
	ok( mesh.position.y ==     3, "OK, Y position is correct " );
	ok( mesh.position.z ==     4, "OK, Z position is correct " );

	ok( mesh.rotation.x ==    12, "OK, X rotation is correct " );
	ok( mesh.rotation.y ==  1013, "OK, Y rotation is correct " );
	ok( mesh.rotation.z ==    14, "OK, Z rotation is correct " );

	ok( mesh.scale.x    ==    22, "OK, X scale is correct " );
	ok( mesh.scale.y    ==    23, "OK, Y scale is correct " );
	ok( mesh.scale.z    == 10024, "OK, Z scale is correct " );


	editor.undo();  // rescaling undone
	editor.undo();  // rotation undone
	editor.undo();  // translation undone

	/* full check */

	ok( mesh.position.x ==     2, "OK, X position is correct " );
	ok( mesh.position.y ==     3, "OK, Y position is correct " );
	ok( mesh.position.z ==     4, "OK, Z position is correct " );

	ok( mesh.rotation.x ==    12, "OK, X rotation is correct " );
	ok( mesh.rotation.y ==    13, "OK, Y rotation is correct " );
	ok( mesh.rotation.z ==    14, "OK, Z rotation is correct " );

	ok( mesh.scale.x    ==    22, "OK, X scale is correct " );
	ok( mesh.scale.y    ==    23, "OK, Y scale is correct " );
	ok( mesh.scale.z    ==    24, "OK, Z scale is correct " );


	editor.redo();  // translation redone
	editor.redo();  // rotation redone

	editor.execute( new RemoveObjectCommand( mesh ) );
	ok( editor.scene.children.length == 0, "OK, object removal was successful" );

	editor.undo();  // removal undone
	ok( mesh.rotation.y ==    1013, "OK, Y rotation is correct " );


	editor.undo();  // rotation undone (expected!)

	/* full check */

	ok( mesh.position.x ==   102, "OK, X position is correct " );
	ok( mesh.position.y ==     3, "OK, Y position is correct " );
	ok( mesh.position.z ==     4, "OK, Z position is correct " );

	ok( mesh.rotation.x ==    12, "OK, X rotation is correct " );
	ok( mesh.rotation.y ==    13, "OK, Y rotation is correct " );
	ok( mesh.rotation.z ==    14, "OK, Z rotation is correct " );

	ok( mesh.scale.x    ==    22, "OK, X scale is correct " );
	ok( mesh.scale.y    ==    23, "OK, Y scale is correct " );
	ok( mesh.scale.z    ==    24, "OK, Z scale is correct " );


} );
