/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CircleGeometry = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// segments

	var segmentsRow = new UI.Panel();
	var segments = new UI.Integer( parameters.segments ).setRange( 3, Infinity ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	//

	function update() {

		editor.execute( new CmdSetGeometry( object, new THREE.CircleGeometry(
			radius.getValue(),
			segments.getValue()
		) ) );

	}

	return container;

}
