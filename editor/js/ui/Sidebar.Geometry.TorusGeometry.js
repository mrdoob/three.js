Sidebar.Geometry.TorusGeometry = function ( signals, object ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	var geometry = object.geometry;

	// radius

	var objectRadiusRow = new UI.Panel();
	var objectRadius = new UI.Number( geometry.radius ).onChange( update );

	objectRadiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ).setColor( '#666' ) );
	objectRadiusRow.add( objectRadius );

	container.add( objectRadiusRow );

	// 

	function update() {

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		object.geometry.dispose();

		object.geometry = new THREE.TorusGeometry( objectRadius.getValue(), 40, 8, 6, Math.PI * 2 );
		object.geometry.computeBoundingSphere();

		signals.objectChanged.dispatch( object );

	}

	return container;

}
