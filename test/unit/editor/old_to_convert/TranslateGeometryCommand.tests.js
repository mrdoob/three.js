/**
 * @author Temdog007 / https://github.com/Temdog007

 */

QUnit.module( "TranslateGeometryCommand" );

QUnit.test( "Test TranslateGeometryCommand (Undo and Redo)", function ( assert ) {

	var editor = new Editor();

	// initialize objects and geometries
	var tri = aTriangle( 'Guinea Pig' ); // vertices [0, 0, 0, 1, 1, 0, 2, 0, 0]

	var cmd = new TranslateGeometryCommand( tri, 1, 1, 1 );
	editor.execute( cmd );
	assert.ok( arrayEquals( tri.attributes.position.array, [ 1, 1, 1, 2, 2, 1, 3, 1, 1 ] ), "OK, tri vertices were translated correctly" );

	editor.undo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 0, 0, 0, 1, 1, 0, 2, 0, 0 ] ), "OK, tri vertices were translated correctly (after undo)" );

	editor.redo();
	assert.ok( arrayEquals( tri.attributes.position.array, [ 1, 1, 1, 2, 2, 1, 3, 1, 1 ] ), "OK, tri vertices were translated correctly (after redo)" );

} );
