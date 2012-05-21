var Panel = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setWidth( '300px' ).setHeight( '100%' );
	container.setBackgroundColor( '#eee' );


	// Properties

	var properties = new UI.Panel();
	properties.setMargin( '8px' );

	properties.add( new UI.Text().setText( 'PROPERTIES' ).setColor( '#666' ) );

	properties.add( new UI.Break() );
	properties.add( new UI.Break() );

	properties.add( new UI.Text().setText( 'position' ).setColor( '#666' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '90px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '160px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '230px' ) );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'rotation' ).setColor( '#666' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '90px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '160px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setX( '230px' ) );

	properties.add( new UI.HorizontalRule() );

	properties.add( new UI.Text().setText( 'scale' ).setColor( '#666' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '90px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '160px' ) );
	properties.add( new UI.FloatNumber( 'absolute' ).setNumber( 1 ).setX( '230px' ) );

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

	return container;

}
