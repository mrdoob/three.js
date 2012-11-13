Menubar.Add = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'Add' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	options.setWidth( '140px' );
	container.add( options );

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

	// divider

	options.add( new UI.HorizontalRule() );

	// add directional light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Directional light' );
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

	// add point light

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Point light' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'Light ' + light.id;

		signals.objectAdded.dispatch( light );

	} );
	options.add( option );

	// add spot light

	// add hemisphere light

	// add ambient light


	function createDummyMaterial() {

		return new THREE.MeshPhongMaterial();

	};

	return container;

}
