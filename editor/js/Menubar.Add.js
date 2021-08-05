import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

function MenubarAdd( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/add' ) );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Group

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/group' ) );
	option.onClick( function () {

		var mesh = new THREE.Group();
		mesh.name = 'Group';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Box

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/box' ) );
	option.onClick( function () {

		var geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Box';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Circle

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/circle' ) );
	option.onClick( function () {

		var geometry = new THREE.CircleGeometry( 1, 8, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Circle';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Cylinder

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/cylinder' ) );
	option.onClick( function () {

		var geometry = new THREE.CylinderGeometry( 1, 1, 1, 8, 1, false, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Cylinder';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Dodecahedron

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/dodecahedron' ) );
	option.onClick( function () {

		var geometry = new THREE.DodecahedronGeometry( 1, 0 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Dodecahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Icosahedron

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/icosahedron' ) );
	option.onClick( function () {

		var geometry = new THREE.IcosahedronGeometry( 1, 0 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Icosahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Lathe

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/lathe' ) );
	option.onClick( function () {

		var points = [
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 0.4, 0 ),
			new THREE.Vector2( 0.35, 0.05 ),
			new THREE.Vector2( 0.1, 0.075 ),
			new THREE.Vector2( 0.08, 0.1 ),
			new THREE.Vector2( 0.08, 0.4 ),
			new THREE.Vector2( 0.1, 0.42 ),
			new THREE.Vector2( 0.14, 0.48 ),
			new THREE.Vector2( 0.2, 0.5 ),
			new THREE.Vector2( 0.25, 0.54 ),
			new THREE.Vector2( 0.3, 1.2 )
		];

		var geometry = new THREE.LatheGeometry( points, 12, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
		mesh.name = 'Lathe';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Octahedron

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/octahedron' ) );
	option.onClick( function () {

		var geometry = new THREE.OctahedronGeometry( 1, 0 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Octahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Plane

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/plane' ) );
	option.onClick( function () {

		var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
		var material = new THREE.MeshStandardMaterial();
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Ring

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/ring' ) );
	option.onClick( function () {

		var geometry = new THREE.RingGeometry( 0.5, 1, 8, 1, 0, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Ring';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Sphere

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/sphere' ) );
	option.onClick( function () {

		var geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Sphere';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Sprite

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/sprite' ) );
	option.onClick( function () {

		var sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite';

		editor.execute( new AddObjectCommand( editor, sprite ) );

	} );
	options.add( option );

	// Tetrahedron

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/tetrahedron' ) );
	option.onClick( function () {

		var geometry = new THREE.TetrahedronGeometry( 1, 0 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tetrahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Torus

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/torus' ) );
	option.onClick( function () {

		var geometry = new THREE.TorusGeometry( 1, 0.4, 8, 6, Math.PI * 2 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Torus';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// TorusKnot

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/torusknot' ) );
	option.onClick( function () {

		var geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'TorusKnot';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Tube

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/tube' ) );
	option.onClick( function () {

		var path = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 2, 2, - 2 ),
			new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
			new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
			new THREE.Vector3( - 2, 2, 2 )
		] );

		var geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tube';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	/*
	// Teapot

	var option = new UIRow();
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

		var geometry = new TeapotGeometry( size, segments, bottom, lid, body, fitLid, blinnScale );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Teapot';

		editor.addObject( mesh );
		editor.select( mesh );

	} );
	options.add( option );
	*/

	//

	options.add( new UIHorizontalRule() );

	// AmbientLight

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/ambientlight' ) );
	option.onClick( function () {

		var color = 0x222222;

		var light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// DirectionalLight

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/directionallight' ) );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;

		var light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight';
		light.target.name = 'DirectionalLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// HemisphereLight

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/hemispherelight' ) );
	option.onClick( function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight';

		light.position.set( 0, 10, 0 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// PointLight

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/pointlight' ) );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;

		var light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// SpotLight

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/spotlight' ) );
	option.onClick( function () {

		var color = 0xffffff;
		var intensity = 1;
		var distance = 0;
		var angle = Math.PI * 0.1;
		var penumbra = 0;

		var light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
		light.name = 'SpotLight';
		light.target.name = 'SpotLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// OrthographicCamera

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/orthographiccamera' ) );
	option.onClick( function () {

		var aspect = editor.camera.aspect;
		var camera = new THREE.OrthographicCamera( - aspect, aspect );
		camera.name = 'OrthographicCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	options.add( option );

	// PerspectiveCamera

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/perspectivecamera' ) );
	option.onClick( function () {

		var camera = new THREE.PerspectiveCamera();
		camera.name = 'PerspectiveCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	options.add( option );

	return container;

}

export { MenubarAdd };
