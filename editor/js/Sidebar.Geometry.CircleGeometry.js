/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CircleGeometry = function ( signals, object ) {

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

	// thetaStart

	var thetaStartRow = new UI.Panel();
	var thetaStart = new UI.Number( parameters.thetaStart ).onChange( update );

	thetaStartRow.add( new UI.Text( 'Theta start' ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UI.Panel();
	var thetaLength = new UI.Number( parameters.thetaLength ).onChange( update );

	thetaLengthRow.add( new UI.Text( 'Theta length' ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.CircleGeometry(
			radius.getValue(),
			segments.getValue(),
			thetaStart.getValue(),
			thetaLength.getValue()
		);

		signals.geometryChanged.dispatch( object );

	}

	return container;

}
