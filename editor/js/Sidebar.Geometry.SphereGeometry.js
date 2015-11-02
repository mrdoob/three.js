/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.SphereGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// phiStart

	var phiStartRow = new UI.Panel();
	var phiStart = new UI.Number( parameters.phiStart ).onChange( update );

	phiStartRow.add( new UI.Text( 'Phi start' ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UI.Panel();
	var phiLength = new UI.Number( parameters.phiLength ).onChange( update );

	phiLengthRow.add( new UI.Text( 'Phi length' ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

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

		object.geometry = new THREE.SphereGeometry(
			radius.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			phiStart.getValue(),
			phiLength.getValue(),
			thetaStart.getValue(),
			thetaLength.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}
