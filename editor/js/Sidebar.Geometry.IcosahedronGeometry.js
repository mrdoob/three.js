/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.IcosahedronGeometry = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// detail

	var detailRow = new UI.Row();
	var detail = new UI.Integer( parameters.detail ).setRange( 0, Infinity ).onChange( update );

	detailRow.add( new UI.Text( 'Detail' ).setWidth( '90px' ) );
	detailRow.add( detail );

	container.add( detailRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			radius.getValue(),
			detail.getValue()
		) ) );

		signals.objectChanged.dispatch( object );

	}

	return container;

};

Sidebar.Geometry.IcosahedronBufferGeometry = Sidebar.Geometry.IcosahedronGeometry;
