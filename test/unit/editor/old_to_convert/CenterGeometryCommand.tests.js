/**
 * @author Temdog007 / https://github.com/Temdog007

 */

QUnit.module( "CenterGeometryCommand" );

QUnit.test( "Test CenterGeometryCommand (Undo and Redo)", function ( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var tri = aTriangle( 'Guinea Pig' ); // vertices [0, 0, 0, 1, 1, 0, 2, 0, 0]

	var cmd = new CenterGeometryCommand( tri );
	editor.execute( cmd );
	assert.ok( arrayEquals( tri.attributes.position.array, [ - 1, - .5, 0, 0, 0.5, 0, 1, - 0.5, 0 ] ), "OK, tri vertices were centered correctly" );

	editor.undo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were centered correctly (after undo)" );

	editor.redo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ - 1, - .5, 0, 0, 0.5, 0, 1, - 0.5, 0 ] ), "OK, tri vertices were centered correctly (after redo)" );

} );
