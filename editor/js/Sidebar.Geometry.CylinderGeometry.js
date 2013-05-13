Sidebar.Geometry.CylinderGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// radiusTop

	var radiusTopRow = new UI.Panel();
	var radiusTop = new UI.Number( geometry.radiusTop ).onChange( update );

	radiusTopRow.add( new UI.Text( 'Radius top' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusTopRow.add( radiusTop );

	container.add( radiusTopRow );

	// radiusBottom

	var radiusBottomRow = new UI.Panel();
	var radiusBottom = new UI.Number( geometry.radiusBottom ).onChange( update );

	radiusBottomRow.add( new UI.Text( 'Radius bottom' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusBottomRow.add( radiusBottom );

	container.add( radiusBottomRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( geometry.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ).setColor( '#666' ) );
	heightRow.add( height );

	container.add( heightRow );

	// radiusSegments

	var radiusSegmentsRow = new UI.Panel();
	var radiusSegments = new UI.Integer( geometry.radiusSegments ).setRange( 1, Infinity ).onChange( update );

	radiusSegmentsRow.add( new UI.Text( 'Radius segments' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusSegmentsRow.add( radiusSegments );

	container.add( radiusSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( geometry.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ).setColor( '#666' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// openEnded

	var openEndedRow = new UI.Panel();
	var openEnded = new UI.Checkbox( geometry.openEnded ).onChange( update );

	openEndedRow.add( new UI.Text( 'Open ended' ).setWidth( '90px' ).setColor( '#666' ) );
	openEndedRow.add( openEnded );

	container.add( openEndedRow );

	//

	function update() {

		var uuid = geometry.uuid;
		var name = geometry.name;
		var object;

		editor.geometries[uuid] = new THREE.CylinderGeometry(
			radiusTop.getValue(),
			radiusBottom.getValue(),
			height.getValue(),
			radiusSegments.getValue(),
			heightSegments.getValue(),
			openEnded.getValue()
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
