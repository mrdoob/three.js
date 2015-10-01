/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.CylinderGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var parameters = object.geometry.parameters;

	// radiusTop

	var radiusTopRow = new UI.Panel();
	var radiusTop = new UI.Number( parameters.radiusTop ).onChange( update );

	radiusTopRow.add( new UI.Text( 'Radius top' ).setWidth( '90px' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	var radiusBottomRow = new UI.Panel();
	var radiusBottom = new UI.Number( parameters.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UI.Text( 'Radius bottom' ).setWidth( '90px' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radialSegments

	var radialSegmentsRow = new UI.Panel();
	var radialSegments = new UI.Integer( parameters.radialSegments ).setRange( 1, Infinity ).onChange( update );

	radialSegmentsRow.add( new UI.Text( 'Radial segments' ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	var openEndedRow = new UI.Panel();
	var openEnded = new UI.Checkbox( parameters.openEnded ).onChange( update );

	openEndedRow.add( new UI.Text( 'Open ended' ).setWidth( '90px' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		object.geometry.dispose();

		object.geometry = new THREE.CylinderGeometry(
			radiusTop.getValue(),
			radiusBottom.getValue(),
			height.getValue(),
			radialSegments.getValue(),
			heightSegments.getValue(),
			openEnded.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.geometryChanged.dispatch( object );

	}

	return container;

}
