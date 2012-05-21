var Panel = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setWidth( '300px' ).setHeight( '100%' );
	container.setBackgroundColor( '#eee' );

	var selected = null;

	// Properties

	var properties = new UI.Panel();
	properties.setMargin( '8px' );

	properties.add( new UI.Text().setText( 'PROPERTIES' ).setColor( '#666' ) );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	properties.add( new UI.Text().setText( 'position' ).setColor( '#666' ) );

	var positionX = new UI.FloatNumber( 'absolute' ).setX( '90px' );
	var positionY = new UI.FloatNumber( 'absolute' ).setX( '160px' );
	var positionZ = new UI.FloatNumber( 'absolute' ).setX( '230px' );

	properties.add( positionX, positionY, positionZ );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'rotation' ).setColor( '#666' ) );

	var rotationX = new UI.FloatNumber( 'absolute' ).setX( '90px' );
	var rotationY = new UI.FloatNumber( 'absolute' ).setX( '160px' );
	var rotationZ = new UI.FloatNumber( 'absolute' ).setX( '230px' );

	properties.add( rotationX, rotationY, rotationZ );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'scale' ).setColor( '#666' ) );

	var scaleX = new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '90px' );
	var scaleY = new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '160px' );
	var scaleZ = new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '230px' );

	properties.add( scaleX, scaleY, scaleZ );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	container.add( properties );

	//

	signals.objectSelected.add( function ( object ) {

		selected = object;

		if ( object ) {

			positionX.setNumber( object.position.x );
			positionY.setNumber( object.position.y );
			positionZ.setNumber( object.position.z );

			rotationX.setNumber( object.rotation.x );
			rotationY.setNumber( object.rotation.y );
			rotationZ.setNumber( object.rotation.z );

			scaleX.setNumber( object.scale.x );
			scaleY.setNumber( object.scale.y );
			scaleZ.setNumber( object.scale.z );

		}

	} );


	// Geometry

	var properties = new UI.Panel();
	properties.setMargin( '8px' );

	properties.add( new UI.Text().setText( 'GEOMETRY' ).setColor( '#666' ) );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	container.add( properties );


	// Material

	var properties = new UI.Panel();
	properties.setMargin( '8px' );

	properties.add( new UI.Text().setText( 'MATERIAL' ).setColor( '#666' ) );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	container.add( properties );

	return container;

}
