var Properties = function ( signals ) {

	var selected = null;

	var container = new UI.Panel();
	container.setDisplay( 'none' );
	container.setPadding( '8px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text().setText( 'PROPERTIES' ).setColor( '#666' ) );

	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'position' ).setColor( '#666' ) );

	var positionX = new UI.FloatNumber( 'absolute' ).setLeft( '90px' ).onChanged( update );
	var positionY = new UI.FloatNumber( 'absolute' ).setLeft( '160px' ).onChanged( update );
	var positionZ = new UI.FloatNumber( 'absolute' ).setLeft( '230px' ).onChanged( update );

	container.add( positionX, positionY, positionZ );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'rotation' ).setColor( '#666' ) );

	var rotationX = new UI.FloatNumber( 'absolute' ).setLeft( '90px' ).onChanged( update );
	var rotationY = new UI.FloatNumber( 'absolute' ).setLeft( '160px' ).onChanged( update );
	var rotationZ = new UI.FloatNumber( 'absolute' ).setLeft( '230px' ).onChanged( update );

	container.add( rotationX, rotationY, rotationZ );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'scale' ).setColor( '#666' ) );

	var scaleX = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '90px' ).onChanged( update );
	var scaleY = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '160px' ).onChanged( update );
	var scaleZ = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setLeft( '230px' ).onChanged( update );

	container.add( scaleX, scaleY, scaleZ );

	container.add( new UI.Break(), new UI.Break(), new UI.Break() );


	// Geometry

	container.add( new UI.Text().setText( 'GEOMETRY' ).setColor( '#666' ) );

	container.add( new UI.Break(), new UI.Break() );

	container.add( new UI.Text().setText( 'class' ).setColor( '#666' ) );

	var geometryClass = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( geometryClass );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'vertices' ).setColor( '#666' ) );

	var verticesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( verticesCount );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'faces' ).setColor( '#666' ) );

	var facesCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( facesCount );

	container.add( new UI.HorizontalRule() );

	container.add( new UI.Text().setText( 'colors' ).setColor( '#666' ) );

	var colorsCount = new UI.Text( 'absolute' ).setLeft( '90px' ).setColor( '#444' ).setFontSize( '12px' );
	container.add( colorsCount );


	container.add( new UI.Break(), new UI.Break(), new UI.Break() );

	// Material

	container.add( new UI.Text().setText( 'MATERIAL' ).setColor( '#666' ) );

	container.add( new UI.Break(), new UI.Break(), new UI.Break() );


	// Events

	function update() {

		if ( selected ) {

			selected.position.x = positionX.getValue();
			selected.position.y = positionY.getValue();
			selected.position.z = positionZ.getValue();

			selected.rotation.x = rotationX.getValue();
			selected.rotation.y = rotationY.getValue();
			selected.rotation.z = rotationZ.getValue();

			selected.scale.x = scaleX.getValue();
			selected.scale.y = scaleY.getValue();
			selected.scale.z = scaleZ.getValue();

			signals.objectChanged.dispatch( selected );

		}

	}

	signals.objectSelected.add( function ( object ) {

		selected = object;

		if ( object ) {

			container.setDisplay( 'block' );

			positionX.setValue( object.position.x );
			positionY.setValue( object.position.y );
			positionZ.setValue( object.position.z );

			rotationX.setValue( object.rotation.x );
			rotationY.setValue( object.rotation.y );
			rotationZ.setValue( object.rotation.z );

			scaleX.setValue( object.scale.x );
			scaleY.setValue( object.scale.y );
			scaleZ.setValue( object.scale.z );

			geometryClass.setText( getGeometryInstanceName( object.geometry ) );
			verticesCount.setText( object.geometry.vertices.length );
			facesCount.setText( object.geometry.faces.length );
			colorsCount.setText( object.geometry.colors.length );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	function getGeometryInstanceName( object ) {

		// TODO: Is there a way of doing this automatically?

		if ( object instanceof THREE.ConvexGeometry ) return "ConvexGeometry";
		if ( object instanceof THREE.CubeGeometry ) return "CubeGeometry";
		if ( object instanceof THREE.CylinderGeometry ) return "CylinderGeometry";
		if ( object instanceof THREE.ExtrudeGeometry ) return "ExtrudeGeometry";
		if ( object instanceof THREE.IcosahedronGeometry ) return "IcosahedronGeometry";
		if ( object instanceof THREE.LatheGeometry ) return "LatheGeometry";
		if ( object instanceof THREE.OctahedronGeometry ) return "OctahedronGeometry";
		if ( object instanceof THREE.ParametricGeometry ) return "ParametricGeometry";
		if ( object instanceof THREE.PlaneGeometry ) return "PlaneGeometry";
		if ( object instanceof THREE.PolyhedronGeometry ) return "PolyhedronGeometry";
		if ( object instanceof THREE.SphereGeometry ) return "SphereGeometry";
		if ( object instanceof THREE.TetrahedronGeometry ) return "TetrahedronGeometry";
		if ( object instanceof THREE.TextGeometry ) return "TextGeometry";
		if ( object instanceof THREE.TorusGeometry ) return "TorusGeometry";
		if ( object instanceof THREE.TorusKnotGeometry ) return "TorusKnotGeometry";
		if ( object instanceof THREE.TubeGeometry ) return "TubeGeometry";

		if ( object instanceof THREE.Geometry ) return "Geometry";

	}

	return container;

}
