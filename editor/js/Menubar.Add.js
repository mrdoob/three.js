import * as THREE from 'three';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

function MenubarAdd( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/add' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Group

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/group' ) );
	option.onClick( function () {

		const mesh = new THREE.Group();
		mesh.name = 'Group';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// Box

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/box' ) );
	option.onClick( function () {

		const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Box';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Capsule

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/capsule' ) );
	option.onClick( function () {

		const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Capsule';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Circle

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/circle' ) );
	option.onClick( function () {

		const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Circle';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Cylinder

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/cylinder' ) );
	option.onClick( function () {

		const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Cylinder';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Dodecahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/dodecahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.DodecahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Dodecahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Icosahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/icosahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.IcosahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Icosahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Lathe

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/lathe' ) );
	option.onClick( function () {

		const geometry = new THREE.LatheGeometry();
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
		mesh.name = 'Lathe';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Octahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/octahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.OctahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Octahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Plane

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/plane' ) );
	option.onClick( function () {

		const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Ring

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/ring' ) );
	option.onClick( function () {

		const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Ring';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Sphere

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/sphere' ) );
	option.onClick( function () {

		const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Sphere';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Sprite

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/sprite' ) );
	option.onClick( function () {

		const sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite';

		editor.execute( new AddObjectCommand( editor, sprite ) );

	} );
	options.add( option );

	// Tetrahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/tetrahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.TetrahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tetrahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Torus

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/torus' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Torus';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// TorusKnot

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/torusknot' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'TorusKnot';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Tube

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/tube' ) );
	option.onClick( function () {

		const path = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 2, 2, - 2 ),
			new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
			new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
			new THREE.Vector3( - 2, 2, 2 )
		] );

		const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tube';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// AmbientLight

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/ambientlight' ) );
	option.onClick( function () {

		const color = 0x222222;

		const light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// DirectionalLight

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/directionallight' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;

		const light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight';
		light.target.name = 'DirectionalLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// HemisphereLight

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/hemispherelight' ) );
	option.onClick( function () {

		const skyColor = 0x00aaff;
		const groundColor = 0xffaa00;
		const intensity = 1;

		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight';

		light.position.set( 0, 10, 0 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// PointLight

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/pointlight' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;

		const light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	// SpotLight

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/spotlight' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;
		const angle = Math.PI * 0.1;
		const penumbra = 0;

		const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
		light.name = 'SpotLight';
		light.target.name = 'SpotLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );

	// OrthographicCamera

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/orthographiccamera' ) );
	option.onClick( function () {

		const aspect = editor.camera.aspect;
		const camera = new THREE.OrthographicCamera( - aspect, aspect );
		camera.name = 'OrthographicCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	options.add( option );

	// PerspectiveCamera

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/perspectivecamera' ) );
	option.onClick( function () {

		const camera = new THREE.PerspectiveCamera();
		camera.name = 'PerspectiveCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	options.add( option );

	return container;

}

export { MenubarAdd };
