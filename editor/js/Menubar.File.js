Menubar.File = function ( editor ) {

	var menuConfig,
		optionsPanel,
		fileInput;


	// helpers
	
	function exportGeometry ( exporterClass ) {

		var object = editor.selected;
		var exporter = new exporterClass();

		var output;

		if ( exporter instanceof THREE.BufferGeometryExporter ||
			 exporter instanceof THREE.Geometry2Exporter ||
		     exporter instanceof THREE.GeometryExporter ) {

			output = JSON.stringify( exporter.parse( object.geometry ), null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} else {

			output = exporter.parse( object.geometry );

		}

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	};

	function exportObject ( exporterClass ) {

		var object = editor.selected;
		var exporter = new exporterClass();

		var output = JSON.stringify( exporter.parse( object ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	}

	function exportScene ( exporterClass ) {

		var exporter = new exporterClass();

		var output = JSON.stringify( exporter.parse( editor.scene ), null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		var blob = new Blob( [ output ], { type: 'text/plain' } );
		var objectURL = URL.createObjectURL( blob );

		window.open( objectURL, '_blank' );
		window.focus();

	}

	// event handlers

	function onNewOptionClick () {

		if ( confirm( 'Are you sure?' ) ) {

			editor.config.clear();
			editor.storage.clear( function () {

				location.href = location.pathname;

			} );

		}

	}

	function onImportOptionClick () {

		fileInput.click();

	}

	function onFileInputChange ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );

	}

	function onExportGeometryOptionClick () {
		
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

		} else if ( geometry instanceof THREE.Geometry2 ) {

			exportGeometry( THREE.Geometry2Exporter );

		} else if ( geometry instanceof THREE.Geometry ) {

			exportGeometry( THREE.GeometryExporter );

		}

	}

	function onExportObjectOptionClick () {

		if ( editor.selected === null ) {

			alert( 'No object selected' );
			return;

		}

		exportObject( THREE.ObjectExporter );

	}

	function onExportSceneOptionClick () {

		exportScene( THREE.ObjectExporter );

	}

	function onExportOBJOptionClick () {

		exportGeometry( THREE.OBJExporter );

	}

	// create file input element for scene import

	fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', onFileInputChange);

	// configure menu contents
	
	with(UI.MenubarHelper) {

		menuConfig   = [
			createOption( 'New', onNewOptionClick ),
			createDivider(),

			createOption( 'Import', onImportOptionClick ),
			createDivider(),

			createOption( 'Export Geometry', onExportGeometryOptionClick ),
			createOption( 'Export Object', onExportObjectOptionClick ),
			createOption( 'Export Scene', onExportSceneOptionClick ),
			createOption( 'Export OBJ', onExportOBJOptionClick )
		];
	
	}

	optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

	return UI.MenubarHelper.createMenuContainer( 'File', optionsPanel );

}
