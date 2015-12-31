/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.PlaneGeometry = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var parameters = object.geometry.parameters;

	// width

	var widthRow = new UI.Row();
	var width = new UI.Number( parameters.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Row();
	var height = new UI.Number( parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	// widthSegments

	var widthSegmentsRow = new UI.Row();
	var widthSegments = new UI.Integer( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Row();
	var heightSegments = new UI.Integer( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( object, new THREE.PlaneGeometry(
			width.getValue(),
			height.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue()
		) ) );

	}

	return container;

}
