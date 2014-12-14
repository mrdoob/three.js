/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'File' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// New

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Are you sure?' ) ) {

			editor.config.setKey(
				'camera/position', [ 500, 250, 500 ],
				'camera/target', [ 0, 0, 0 ]
			);

			editor.storage.clear( function () {

				location.href = location.pathname;

			} );

		}

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Import

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );

	} );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Import' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Export Geometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Geometry' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var geometry = object.geometry;

		if ( geometry === undefined ) {

			alert( 'The selected object doesn\'t have geometry.' );
			return;

		}

		var output = geometry.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		exportString( output );

	} );
	options.add( option );

	// Export Object

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Object' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected' );
			return;

		}

		var output = object.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		exportString( output );

	} );
	options.add( option );

	// Export Scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Scene' );
	option.onClick( function () {

		var output = editor.scene.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		exportString( output );

	} );
	options.add( option );

	// Export OBJ

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export OBJ' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var exporter = new THREE.OBJExporter();

		exportString( exporter.parse( object ) );

	} );
	options.add( option );

	// Export STL

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export STL' );
	option.onClick( function () {

		var exporter = new THREE.STLExporter();

		exportString( exporter.parse( editor.scene ) );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Publish

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Publish' );
	option.onClick( function () {

		var camera = editor.camera;

		var zip = new JSZip();

		zip.file( 'index.html', [

			'<!DOCTYPE html>',
			'<html lang="en">',
			'	<head>',
			'		<title>three.js</title>',
			'		<meta charset="utf-8">',
			'		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">',
			'		<style>',
			'		body {',
			'			margin: 0px;',
			'			overflow: hidden;',
			'		}',
			'		</style>',
			'	</head>',
			'	<body ontouchstart="">',
			'		<script src="js/three.min.js"></script>',
			'		<script src="js/OrbitControls.js"></script>',
			'		<script>',

			'			var camera, controls, scene, renderer;',

			'			var loader = new THREE.ObjectLoader();',
			'			loader.load( \'scene.json\', function ( object ) {',

			'				scene = object;',

			'				camera = new THREE.PerspectiveCamera( ' + camera.fov + ', 1, ' + camera.near + ', ' + camera.far + ' );',
			'				camera.position.set( ' + camera.position.x + ', ' + camera.position.y + ', ' + camera.position.z + ' );',
			'				camera.rotation.set( ' + camera.rotation.x + ', ' + camera.rotation.y + ', ' + camera.rotation.z + ' );',

			'				controls = new THREE.OrbitControls( camera );',
			'				controls.addEventListener( \'change\', render );',

			'				renderer = new THREE.WebGLRenderer();',
			'				renderer.setSize( window.innerWidth, window.innerHeight );',
			'				document.body.appendChild( renderer.domElement );',

			'				camera.aspect = window.innerWidth / window.innerHeight;',
			'				camera.updateProjectionMatrix();',

			'				animate();',
			'				render();',
			
			'			} );',

			'			var render = function () {',

			'				renderer.render( scene, camera );',

			'			};',

			'			var animate = function () {',

			'				requestAnimationFrame( animate );',
			'				controls.update();',

			'			};',

			'		</script>',
			'	</body>',
			'</html>'

		].join( '\n' ) );

		//

		var output = editor.scene.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file( 'scene.json', output );

		//

		var manager = new THREE.LoadingManager( function () {

			location.href = 'data:application/zip;base64,' + zip.generate();

		} );

		var loader = new THREE.XHRLoader( manager );
		loader.load( '../build/three.min.js', function ( content ) {

			zip.file( 'js/three.min.js', content );

		} );
		loader.load( '../examples/js/controls/OrbitControls.js', function ( content ) {

			zip.file( 'js/OrbitControls.js', content );

		} );

	} );
	options.add( option );

	/*
	// Test

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Test' );
	option.onClick( function () {

		var text = new UI.Text( 'blah' );
		editor.showDialog( text );

	} );
	options.add( option );
	*/



	//

	var exportString = function ( output ) {

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	};

	return container;

};
