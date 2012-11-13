Menubar.Add = function ( signals ) {

	var container = new UI.Panel();
	container.setFloat( 'left' );
	container.setWidth( '50px' );
	container.setCursor( 'pointer' );
	container.onMouseOver( function () { options.setDisplay( '' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'none' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'Add' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' )
	container.add( title );

	//

	var options = new UI.Panel();
	options.setWidth( '140px' );
	options.setBackgroundColor( '#ddd' );
	options.setPadding( '0px' );
	options.setBorderTop( 'solid 1px #ccc' );
	options.setStyle( 'box-shadow', [ '0 3px 6px rgba(0,0,0,0.1), 3px 3px 6px rgba(0,0,0,0.2)' ] );
	options.setDisplay( 'none' );
	container.add( options );

	// add sphere

	var option = new UI.Panel();
	option.setTextContent( 'Sphere' ).setColor( '#666' ).setPadding( '6px 12px' );
	option.onClick( function () {

		var radius = 75;
		var widthSegments = 32;
		var heightSegments = 16;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Sphere ' + mesh.id;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	addHoverStyle( option );

	// add cube

	var option = new UI.Panel();
	option.setTextContent( 'Cube' ).setColor( '#666' ).setPadding( '6px 12px' );
	option.onClick( function () {

		var width = 100;
		var height = 100;
		var depth = 100;

		var widthSegments = 1;
		var heightSegments = 1;
		var depthSegments = 1;

		var geometry = new THREE.CubeGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Cube ' + mesh.id;

		signals.objectAdded.dispatch( mesh );


	} );
	options.add( option );

	addHoverStyle( option );

	// add plane

	var option = new UI.Panel();
	option.setTextContent( 'Plane' ).setColor( '#666' ).setPadding( '6px 12px' );
	option.onClick( function () {

		var width = 200;
		var height = 200;

		var widthSegments = 1;
		var heightSegments = 1;

		var geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Plane ' + mesh.id;

		mesh.rotation.x = - Math.PI/2;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	addHoverStyle( option );

	// divider

	var option = new UI.Panel();
	option.setBackgroundColor( '#ccc' ).setPadding( '1px 12px' );
	options.add( option );

	// add directional light

	var option = new UI.Panel();
	option.setTextContent( 'Directional light' ).setColor( '#666' ).setPadding( '6px 12px' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'Light ' + light.id;
		light.target.name = 'Light ' + light.id + ' target';

		light.target.properties.targetInverse = light;

		light.position.set( 1, 1, 1 ).multiplyScalar( 200 );

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	addHoverStyle( option );

	// add point light

	var option = new UI.Panel();
	option.setTextContent( 'Point light' ).setColor( '#666' ).setPadding( '6px 12px' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'Light ' + light.id;

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	addHoverStyle( option );

	// add spot light

	// add hemisphere light

	// add ambient light

	//

	function addHoverStyle( element ) {

		element.onMouseOver( function () { element.setBackgroundColor( '#356' ).setColor( '#eee' ); } );
		element.onMouseOut( function () { element.setBackgroundColor( 'transparent' ).setColor( '#666' ) } );

	}

	function createDummyMaterial() {

		return new THREE.MeshPhongMaterial();

	};

	return container;

}
