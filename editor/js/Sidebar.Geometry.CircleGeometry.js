Sidebar.Geometry.CircleGeometry = function ( signals, object ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	var geometry = object.geometry;

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( geometry.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// segments

	var segmentsRow = new UI.Panel();
	var segments = new UI.Integer( geometry.segments ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ).setColor( '#666' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	//

	function update() {

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		object.geometry.dispose();

		object.geometry = new THREE.CircleGeometry(
			radius.getValue(),
			segments.getValue()
		);

		object.geometry.computeBoundingSphere();

		signals.objectChanged.dispatch( object );

	}

	return container;

}
