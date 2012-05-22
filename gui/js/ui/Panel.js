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

	var positionX = new UI.FloatNumber( 'absolute' ).setX( '90px' ).onChanged( update );
	var positionY = new UI.FloatNumber( 'absolute' ).setX( '160px' ).onChanged( update );
	var positionZ = new UI.FloatNumber( 'absolute' ).setX( '230px' ).onChanged( update );

	properties.add( positionX, positionY, positionZ );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'rotation' ).setColor( '#666' ) );

	var rotationX = new UI.FloatNumber( 'absolute' ).setX( '90px' ).onChanged( update );
	var rotationY = new UI.FloatNumber( 'absolute' ).setX( '160px' ).onChanged( update );
	var rotationZ = new UI.FloatNumber( 'absolute' ).setX( '230px' ).onChanged( update );

	properties.add( rotationX, rotationY, rotationZ );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'scale' ).setColor( '#666' ) );

	var scaleX = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setX( '90px' ).onChanged( update );
	var scaleY = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setX( '160px' ).onChanged( update );
	var scaleZ = new UI.FloatNumber( 'absolute' ).setValue( 1 ).setX( '230px' ).onChanged( update );

	properties.add( scaleX, scaleY, scaleZ );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	container.add( properties );


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

			positionX.setValue( object.position.x );
			positionY.setValue( object.position.y );
			positionZ.setValue( object.position.z );

			rotationX.setValue( object.rotation.x );
			rotationY.setValue( object.rotation.y );
			rotationZ.setValue( object.rotation.z );

			scaleX.setValue( object.scale.x );
			scaleY.setValue( object.scale.y );
			scaleZ.setValue( object.scale.z );

		}

	} );

	return container;

}
