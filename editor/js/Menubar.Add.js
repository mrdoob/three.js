/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Add = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Add' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	//

	var meshCount = 0;
	var lightCount = 0;
	var cameraCount = 0;

	editor.signals.editorCleared.add( function () {

		meshCount = 0;
		lightCount = 0;
		cameraCount = 0;

	} );

	// Group

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Group' );
	option.onClick( function () {

		var mesh = new THREE.Group();
		mesh.name = 'Group ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Plane

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Plane' );
	option.onClick( function () {

		var geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );
		var material = new THREE.MeshStandardMaterial();
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Box

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Box' );
	option.onClick( function () {

		var geometry = new THREE.BoxBufferGeometry( 1, 1, 1, 1, 1, 1 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Box ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Circle

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Circle' );
	option.onClick( function () {

		var geometry = new THREE.CircleBufferGeometry( 1, 8, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Circle ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Cylinder

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Cylinder' );
	option.onClick( function () {

		var geometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 8, 1, false, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Cylinder ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Sphere

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Sphere' );
	option.onClick( function () {

		var geometry = new THREE.SphereBufferGeometry( 1, 8, 6, 0, Math.PI * 2, 0, Math.PI );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Sphere ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Icosahedron

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Icosahedron' );
	option.onClick( function () {

		var geometry = new THREE.IcosahedronGeometry( 1, 0 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Icosahedron ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Torus

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Torus' );
	option.onClick( function () {

		var geometry = new THREE.TorusBufferGeometry( 1, 0.4, 8, 6, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Torus ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// TorusKnot

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'TorusKnot' );
	option.onClick( function () {

		var geometry = new THREE.TorusKnotBufferGeometry( 1, 0.4, 64, 8, 2, 3 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'TorusKnot ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	/*
	// Teapot

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Teapot' );
	option.onClick( function () {

		var size = 50;
		var segments = 10;
		var bottom = true;
		var lid = true;
		var body = true;
		var fitLid = false;
		var blinnScale = true;

		var material = new THREE.MeshStandardMaterial();

		var geometry = new THREE.TeapotBufferGeometry( size, segments, bottom, lid, body, fitLid, blinnScale );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Teapot ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );
	*/

	// Lathe

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Lathe' );
	option.onClick( function() {

		var points = [
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 4, 0 ),
			new THREE.Vector2( 3.5, 0.5 ),
			new THREE.Vector2( 1, 0.75 ),
			new THREE.Vector2( 0.8, 1 ),
			new THREE.Vector2( 0.8, 4 ),
			new THREE.Vector2( 1, 4.2 ),
			new THREE.Vector2( 1.4, 4.8 ),
			new THREE.Vector2( 2, 5 ),
			new THREE.Vector2( 2.5, 5.4 ),
			new THREE.Vector2( 3, 12 )
		];
		var segments = 20;
		var phiStart = 0;
		var phiLength = 2 * Math.PI;

		var geometry = new THREE.LatheBufferGeometry( points, segments, phiStart, phiLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
		mesh.name = 'Lathe ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( mesh ) );

	} );
	options.add( option );

	// Sprite

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Sprite' );
	option.onClick( function () {

		var sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite ' + ( ++ meshCount );

		editor.execute( new AddObjectCommand( sprite ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// PointLight

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'PointLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight ' + ( ++ lightCount );

		editor.execute( new AddObjectCommand( light ) );

	} );
	options.add( option );

	// SpotLight

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'SpotLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;
		var angle = Math.PI * 0.1;
		var penumbra = 0;

		var light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
		light.name = 'SpotLight ' + ( ++ lightCount );
		light.target.name = 'SpotLight ' + ( lightCount ) + ' Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( light ) );

	} );
	options.add( option );

	// DirectionalLight

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'DirectionalLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight ' + ( ++ lightCount );
		light.target.name = 'DirectionalLight ' + ( lightCount ) + ' Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( light ) );

	} );
	options.add( option );

	// HemisphereLight

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'HemisphereLight' );
	option.onClick( function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight ' + ( ++ lightCount );

		light.position.set( 0, 10, 0 );

		editor.execute( new AddObjectCommand( light ) );

	} );
	options.add( option );

	// AmbientLight

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'AmbientLight' );
	option.onClick( function() {

		var color = 0x222222;

		var light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight ' + ( ++ lightCount );

		editor.execute( new AddObjectCommand( light ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// PerspectiveCamera

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'PerspectiveCamera' );
	option.onClick( function() {

		var camera = new THREE.PerspectiveCamera( 50, 1, 1, 10000 );
		camera.name = 'PerspectiveCamera ' + ( ++ cameraCount );

		editor.execute( new AddObjectCommand( camera ) );

	} );
	options.add( option );

	return container;

};
