Sidebar.Geometry.SphereGeometry = function ( signals, geometry ) {

	var container = new UI.Panel();
	container.setBorderTop( '1px solid #ccc' );
	container.setPaddingTop( '10px' );

	// radius

	var radiusRow = new UI.Panel();
	var radius = new UI.Number( geometry.radius ).onChange( update );

	radiusRow.add( new UI.Text( 'Radius' ).setWidth( '90px' ).setColor( '#666' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

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

	// phiStart

	var phiStartRow = new UI.Panel();
	var phiStart = new UI.Number( geometry.phiStart ).onChange( update );

	phiStartRow.add( new UI.Text( 'Phi start' ).setWidth( '90px' ).setColor( '#666' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UI.Panel();
	var phiLength = new UI.Number( geometry.phiLength ).onChange( update );

	phiLengthRow.add( new UI.Text( 'Phi length' ).setWidth( '90px' ).setColor( '#666' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// thetaStart

	var thetaStartRow = new UI.Panel();
	var thetaStart = new UI.Number( geometry.thetaStart ).onChange( update );

	thetaStartRow.add( new UI.Text( 'Theta start' ).setWidth( '90px' ).setColor( '#666' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UI.Panel();
	var thetaLength = new UI.Number( geometry.thetaLength ).onChange( update );

	thetaLengthRow.add( new UI.Text( 'Theta length' ).setWidth( '90px' ).setColor( '#666' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );


	//

	function update() {

		var uuid = geometry.uuid;
		var name = geometry.name;
		var object;

		editor.geometries[uuid] = new THREE.SphereGeometry(
			radius.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			phiStart.getValue(),
			phiLength.getValue(),
			thetaStart.getValue(),
			thetaLength.getValue()
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
