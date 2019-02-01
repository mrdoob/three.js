/**
 * @author Temdog007 / https://github.com/Temdog007

 */

QUnit.module( "ScaleGeometryCommand" );

QUnit.test( "Test ScaleGeometryCommand (Undo and Redo)", function ( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var tri = aTriangle( 'Guinea Pig' ); // vertices [0, 0, 0, 1, 1, 0, 2, 0, 0]

	var cmd = new ScaleGeometryCommand( tri, 2, 3, 4 );
	editor.execute( cmd );
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 2, 3, 0, 4, 0, 0 ] ), "OK, tri vertices were scaled correctly" );

	editor.undo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were scaled correctly (after undo)" );

	editor.redo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 2, 3, 0, 4, 0, 0 ] ), "OK, tri vertices were scaled correctly (after redo)" );

} );
