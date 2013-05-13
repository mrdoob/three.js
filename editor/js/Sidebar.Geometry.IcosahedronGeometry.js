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

		var uuid = geometry.uuid;
		var name = geometry.name;
		var object;

		editor.geometries[uuid] = new THREE.IcosahedronGeometry(
			radius.getValue(),
			detail.getValue()
		);

		editor.geometries[uuid].computeBoundingSphere();
		editor.geometries[uuid].uuid = uuid;
		editor.geometries[uuid].name = name;

		for ( var i in editor.objects ) {

			object = editor.objects[i];

			if ( object.geometry && object.geometry.uuid == uuid ) {

				delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)
				object.geometry.dispose();

				object.geometry = editor.geometries[uuid];

				signals.objectChanged.dispatch( object );

			}

		}

	}

	return container;

}
