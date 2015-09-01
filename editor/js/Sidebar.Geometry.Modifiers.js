/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.Modifiers = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Panel().setPaddingLeft( '90px' );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new UI.Button( 'Compute Vertex Normals' );
	button.onClick( function () {

		geometry.computeVertexNormals();

		if ( geometry instanceof THREE.BufferGeometry ) {

			geometry.attributes.normal.needsUpdate = true;

		} else {

			geometry.normalsNeedUpdate = true;

		}

		signals.geometryChanged.dispatch( object );

	} );

	container.add( button );

	// Convert to Geometry/BufferGeometry

	var isBufferGeometry = geometry instanceof THREE.BufferGeometry;

	if ( geometry instanceof THREE.Geometry ) {

		var button = new UI.Button( 'Convert to BufferGeometry' );
		button.onClick( function () {

			if ( confirm( 'Are you sure?' ) === false ) return;

			editor.execute( new CmdSetGeometry( object, new THREE.BufferGeometry().fromGeometry( object.geometry ) ) );

		} );
		container.add( button );

	}

	//

	return container;

}
