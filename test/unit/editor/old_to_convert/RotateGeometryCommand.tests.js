/**
 * @author Temdog007 / https://github.com/Temdog007

 */

QUnit.module( "RotateGeometryCommand" );

QUnit.test( "Test RotateGeometryCommand (Undo and Redo)", function ( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var tri = aTriangle( 'Guinea Pig' ); // vertices [0, 0, 0, 1, 1, 0, 2, 0, 0]

	var cmd = new RotateGeometryCommand( tri, 180, 0, 45 );
	editor.execute( cmd );
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 0, 2, 0 ] ), "OK, tri vertices were rotated correctly" );

	editor.undo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were rotated correctly (after undo)" );

	editor.redo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 0, 2, 0 ] ), "OK, tri vertices were rotated correctly (after redo)" );

} );
