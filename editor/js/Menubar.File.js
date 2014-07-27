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

			editor.config.clear();
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

		if ( geometry instanceof THREE.BufferGeometry ) {

			exportGeometry( THREE.BufferGeometryExporter );

		} else if ( geometry instanceof THREE.Geometry ) {

			exportGeometry( THREE.GeometryExporter );

		}

	} );
	options.add( option );

	// Export Object

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Object' );
	option.onClick( function () {

		if ( editor.selected === null ) {

			alert( 'No object selected' );
			return;

		}

		exportObject( THREE.ObjectExporter );

	} );
	options.add( option );

	// Export Scene

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export Scene' );
	option.onClick( function () {

		exportScene( THREE.ObjectExporter );

	} );
	options.add( option );

	// Export OBJ

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export OBJ' );
	option.onClick( function () {

		exportGeometry( THREE.OBJExporter );

	} );
	options.add( option );

	// Export STL

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Export STL' );
	option.onClick( function () {

		exportScene( THREE.STLExporter );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Test

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Test' );
	option.onClick( function () {

		var text = new UI.Text( 'blah' );
		editor.showDialog( text );

	} );
	options.add( option );


	//
	
	var exportGeometry = function ( exporterClass ) {

		var object = editor.selected;
		var exporter = new exporterClass();

		var output = exporter.parse( object.geometry );

		if ( exporter instanceof THREE.BufferGeometryExporter ||
		     exporter instanceof THREE.GeometryExporter ) {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		}

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	};

	var exportObject = function ( exporterClass ) {

		var object = editor.selected;
		var exporter = new exporterClass();

		var output = JSON.stringify( exporter.parse( object ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	};

	var exportScene = function ( exporterClass ) {

		var exporter = new exporterClass();

		var output = exporter.parse( editor.scene );

		if ( exporter instanceof THREE.ObjectExporter ) {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		}

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	};

	return container;

};