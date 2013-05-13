Sidebar.Geometry.PlaneGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// width

	var widthRow = new UI.Panel();
	var width = new UI.Number( geometry.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ).setColor( '#666' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( geometry.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ).setColor( '#666' ) );
	heightRow.add( height );

	container.add( heightRow );

	// widthSegments

	var widthSegmentsRow = new UI.Panel();
	var widthSegments = new UI.Integer( geometry.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UI.Text( 'Width segments' ).setWidth( '90px' ).setColor( '#666' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UI.Panel();
	var heightSegments = new UI.Integer( geometry.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UI.Text( 'Height segments' ).setWidth( '90px' ).setColor( '#666' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );


	//

	function update() {

		var uuid = geometry.uuid;
		var name = geometry.name;
		var object;

		editor.geometries[uuid] = new THREE.PlaneGeometry(
			width.getValue(),
			height.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue()
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
