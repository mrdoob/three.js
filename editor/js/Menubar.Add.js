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

	// Group

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Group' );
	option.onClick( function () {

		var mesh = new THREE.Group();
		mesh.name = 'Group ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Plane

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Plane' );
	option.onClick( function () {

		var width = 200;
		var height = 200;

		var widthSegments = 1;
		var heightSegments = 1;

		var geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
		var material = new THREE.MeshPhongMaterial();
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Box

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Box' );
	option.onClick( function () {

		var width = 100;
		var height = 100;
		var depth = 100;

		var widthSegments = 1;
		var heightSegments = 1;
		var depthSegments = 1;

		var geometry = new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Box ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Circle

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Circle' );
	option.onClick( function () {

		var radius = 20;
		var segments = 8;

		var geometry = new THREE.CircleGeometry( radius, segments );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Circle ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Cylinder

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
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Cylinder ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Sphere

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Sphere' );
	option.onClick( function () {

		var radius = 75;
		var widthSegments = 32;
		var heightSegments = 16;
		var phiStart = 0;
		var phiLength = Math.PI * 2;
		var thetaStart = 0;
		var thetaLength = Math.PI;

		var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Sphere ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Icosahedron

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Icosahedron' );
	option.onClick( function () {

		var radius = 75;
		var detail = 2;

		var geometry = new THREE.IcosahedronGeometry( radius, detail );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Icosahedron ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// Torus

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
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'Torus ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	// TorusKnot

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
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
		mesh.name = 'TorusKnot ' + ( ++ meshCount );

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Sprite

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Sprite' );
	option.onClick( function () {

		var sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite ' + ( ++ meshCount );

		editor.addObject( sprite );
		editor.select( sprite );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// PointLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'PointLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight ' + ( ++ lightCount );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// SpotLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'SpotLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;
		var angle = Math.PI * 0.1;
		var exponent = 10;

		var light = new THREE.SpotLight( color, intensity, distance, angle, exponent );
		light.name = 'SpotLight ' + ( ++ lightCount );
		light.target.name = 'SpotLight ' + ( lightCount ) + ' Target';

		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// DirectionalLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'DirectionalLight' );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight ' + ( ++ lightCount );
		light.target.name = 'DirectionalLight ' + ( lightCount ) + ' Target';

		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// HemisphereLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'HemisphereLight' );
	option.onClick( function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight ' + ( ++ lightCount );

		light.position.set( 0.5, 1, 0.75 ).multiplyScalar( 200 );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	// AmbientLight

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'AmbientLight' );
	option.onClick( function() {

		var color = 0x222222;

		var light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight ' + ( ++ lightCount );

		editor.addObject( light );
		editor.select( light );

	} );
	options.add( option );

	return container;

}
