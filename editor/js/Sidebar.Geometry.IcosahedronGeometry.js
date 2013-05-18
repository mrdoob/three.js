Sidebar.Geometry.IcosahedronGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( geometry.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// detail

	var detailRow = new UI.Panel();
	var detail = new UI.Integer( geometry.detail ).setRange( 0, Infinity ).onChange( update );

	detailRow.add( new UI.Text( 'Detail' ).setWidth( '90px' ).setColor( '#666' ) );
	detailRow.add( detail );

	container.add( detailRow );


	//

	function update() {

		editor.remakeGeometry( geometry,
			{
				radius: radius.getValue(),
				detail: detail.getValue()
			}
		);

	}

	return container;

}
