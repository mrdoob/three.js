Menubar.Add = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.onMouseOver( function () { options.setDisplay( 'block' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'block' ) } );

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

	// add cube

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Cube' );
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

	// add cylinder

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Cylinder' );
	option.onClick( function () {

		var radiusTop = 20;
		var radiusBottom = 20;
		var height = 100;
		var radiusSegments = 8;
		var heightSegments = 1;
		var openEnded = false;

		var geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Cylinder ' + mesh.id;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	// add sphere

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Sphere' );
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

	// add icosahedron

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Icosahedron' );
	option.onClick( function () {

		var radius = 75;
		var detail = 2;

		var geometry = new THREE.IcosahedronGeometry ( radius, detail );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Icosahedron ' + mesh.id;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	// add torus

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Torus' );
	option.onClick( function () {

		var radius = 100;
		var tube = 40;
		var radialSegments = 8;
		var tubularSegments = 6;
		var arc = Math.PI * 2;

		var geometry = new THREE.TorusGeometry( radius, tube, radialSegments, tubularSegments, arc );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'Torus ' + mesh.id;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	// add torus knot

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'TorusKnot' );
	option.onClick( function () {

		var radius = 100;
		var tube = 40;
		var radialSegments = 64;
		var tubularSegments = 8;
		var p = 2;
		var q = 3;
		var heightScale = 1;

		var geometry = new THREE.TorusKnotGeometry( radius, tube, radialSegments, tubularSegments, p, q, heightScale );
		var mesh = new THREE.Mesh( geometry, createDummyMaterial( geometry ) );
		mesh.name = 'TorusKnot ' + mesh.id;

		signals.objectAdded.dispatch( mesh );

	} );
	options.add( option );

	// divider

	options.add( new UI.HorizontalRule() );

	// add point light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Point light' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight ' + light.id;

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	// add spot light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Spot light' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;
		var angle = Math.PI * 0.1;
		var exponent = 10;

		var light = new THREE.SpotLight( color, intensity, distance, angle, exponent );
		light.name = 'SpotLight ' + light.id;
		light.target.name = 'SpotLight ' + light.id + ' Target';

		light.position.set( 0, 1, 0 ).multiplyScalar( 200 );

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	// add directional light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Directional light' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight ' + light.id;
		light.target.name = 'DirectionalLight ' + light.id + ' Target';

		light.position.set( 1, 1, 1 ).multiplyScalar( 200 );

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	// add hemisphere light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Hemisphere light' );
	option.onClick( function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight ' + light.id;

		light.position.set( 1, 1, 1 ).multiplyScalar( 200 );

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	// add ambient light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Ambient light' );
	option.onClick( function () {

		var color = 0x222222;

		var light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight ' + light.id;

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	//

	function createDummyMaterial() {

		return new THREE.MeshPhongMaterial();

	};

	return container;

}
