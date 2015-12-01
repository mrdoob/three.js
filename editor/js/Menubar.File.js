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

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

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

		try {
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		} catch ( e ) {
			output = JSON.stringify( output );
		}

		exportString( output, 'geometry.json' );

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

		try {
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		} catch ( e ) {
			output = JSON.stringify( output );
		}

		exportString( output, 'model.json' );

	} );
	options.add( option );

	// Export Scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Scene' );
	option.onClick( function () {

		var output = editor.scene.toJSON();

		try {
			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		} catch ( e ) {
			output = JSON.stringify( output );
		}

		exportString( output, 'scene.json' );

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

		exportString( exporter.parse( object ), 'model.obj' );

	} );
	options.add( option );

	// Export STL

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export STL' );
	option.onClick( function () {

		var exporter = new THREE.STLExporter();

		exportString( exporter.parse( editor.scene ), 'model.stl' );

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
			'		<script src="js/app.js"></script>',
			'		<script>',
			'',
			'			var loader = new THREE.XHRLoader();',
			'			loader.load( \'app.json\', function ( text ) {',
			'',
			'				var player = new APP.Player();',
			'				player.load( JSON.parse( text ) );',
			'				player.setSize( window.innerWidth, window.innerHeight );',
			'				player.play();',
			'',
			'				document.body.appendChild( player.dom );',
			'',
			'				window.addEventListener( \'resize\', function () {',
			'					player.setSize( window.innerWidth, window.innerHeight );',
			'				} );',
			'',
			'			} );',
			'',
			'		</script>',
			'	</body>',
			'</html>'

		].join( '\n' ) );

		//

		var output = editor.toJSON();
		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file( 'app.json', output );

		//

		var manager = new THREE.LoadingManager( function () {

			location.href = 'data:application/zip;base64,' + zip.generate();

		} );

		var loader = new THREE.XHRLoader( manager );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file( 'js/app.js', content );

		} );
		loader.load( '../build/three.min.js', function ( content ) {

			zip.file( 'js/three.min.js', content );

		} );

	} );
	options.add( option );


	//

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	var exportString = function ( output, filename ) {

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		link.href = objectURL;
		link.download = filename || 'data.json';
		link.target = '_blank';

		var event = document.createEvent("MouseEvents");
		event.initMouseEvent(
			"click", true, false, window, 0, 0, 0, 0, 0
			, false, false, false, false, 0, null
		);
		link.dispatchEvent(event);

	};

	return container;

};
