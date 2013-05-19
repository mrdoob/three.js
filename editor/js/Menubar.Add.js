Menubar.Add = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.onMouseOver( function () { options.setDisplay( 'block' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'none' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'Add' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	options.setDisplay( 'none' );
	container.add( options );

	// add plane

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Plane' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Plane' ) );

	} );
	options.add( option );

	// add cube

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Cube' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Cube' ) );

	} );
	options.add( option );

	// add cylinder

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Cylinder' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Cylinder' ) );

	} );
	options.add( option );

	// add sphere

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Sphere' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Sphere' ) );

	} );
	options.add( option );

	// add icosahedron

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Icosahedron' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Icosahedron' ) );

	} );
	options.add( option );

	// add torus

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Torus' );
	option.onClick( function () {

		editor.select( editor.createObject( 'Torus' ) );

	} );
	options.add( option );

	// add torus knot

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'TorusKnot' );
	option.onClick( function () {

		editor.select( editor.createObject( 'TorusKnot' ) );

	} );
	options.add( option );

	// add group

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Group' );
	option.onClick( function () {

		editor.select( editor.createObject() );

	} );
	options.add( option );

	// divider

	options.add( new UI.HorizontalRule() );

	// add point light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Point light' );
	option.onClick( function () {

		editor.select( editor.createObject( 'PointLight' ) );

	} );
	options.add( option );

	// add spot light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Spot light' );
	option.onClick( function () {

		editor.select( editor.createObject( 'SpotLight' ) );

	} );
	options.add( option );

	// add directional light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Directional light' );
	option.onClick( function () {

		editor.select( editor.createObject( 'DirectionaLight' ) );

	} );
	options.add( option );

	// add hemisphere light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Hemisphere light' );
	option.onClick( function () {

		editor.select( editor.createObject( 'HemisphereLight' ) );

	} );
	options.add( option );

	// add ambient light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Ambient light' );
	option.onClick( function () {

		editor.select( editor.createObject( 'AmbientLight' ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// add material

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Phong material' );
	option.onClick( function () {

		editor.select( editor.createMaterial( 'Phong' ) );

	} );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Lambert material' );
	option.onClick( function () {

		editor.select( editor.createMaterial( 'Lambert' ) );

	} );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Normal material' );
	option.onClick( function () {

		editor.select( editor.createMaterial( 'Normal' ) );

	} );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Basic material' );
	option.onClick( function () {

		editor.select( editor.createMaterial( 'Basic' ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// add texture

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Texture' );
	option.onClick( function () {

		editor.select( editor.createTexture() );

	} );
	options.add( option );

	return container;

}
