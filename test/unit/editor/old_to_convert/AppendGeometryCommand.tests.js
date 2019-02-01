/**
 * @author Temdog007 / https://github.com/Temdog007

 */

QUnit.module( "AppendGeometryCommand" );

QUnit.test( "Test AppendGeometryCommand (Undo and Redo)", function ( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var tri = aTriangle( 'Guinea Pig' ); // vertices [0, 0, 0, 1, 1, 0, 2, 0, 0]
	var tri2 = aTriangle( 'Guinea Pig' );

	var cmd = new AppendGeometryCommand( tri, tri2 );
	editor.execute( cmd );
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were appended correctly" );

	editor.undo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were appended correctly (after undo)" );

	editor.redo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were appended correctly (after redo)" );

} );
