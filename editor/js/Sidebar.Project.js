/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer

	};

	var container = new UI.Span();

	var projectsettings = new UI.Panel();
	projectsettings.setBorderTop( '0' );
	projectsettings.setPaddingTop( '20px' );

	container.add( projectsettings );

	// Title

	var titleRow = new UI.Row();
	var title = new UI.Input( config.getKey( 'project/title' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UI.Text( strings.getKey( 'sidebar/project/title' ) ).setWidth( '90px' ) );
	titleRow.add( title );

	projectsettings.add( titleRow );

	// Editable

	var editableRow = new UI.Row();
	var editable = new UI.Checkbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UI.Text( strings.getKey( 'sidebar/project/editable' ) ).setWidth( '90px' ) );
	editableRow.add( editable );

	projectsettings.add( editableRow );

	// VR

	var vrRow = new UI.Row();
	var vr = new UI.Checkbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );

	} );

	vrRow.add( new UI.Text( strings.getKey( 'sidebar/project/vr' ) ).setWidth( '90px' ) );
	vrRow.add( vr );

	projectsettings.add( vrRow );

	// Renderer

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UI.Row();
	var rendererType = new UI.Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		config.setKey( 'project/renderer', value );

		updateRenderer();

	} );

	rendererTypeRow.add( new UI.Text( strings.getKey( 'sidebar/project/renderer' ) ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	projectsettings.add( rendererTypeRow );

	if ( config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( config.getKey( 'project/renderer' ) );

	}

	// Renderer / Antialias

	var rendererPropertiesRow = new UI.Row().setMarginLeft( '90px' );

	var rendererAntialias = new UI.THREE.Boolean( config.getKey( 'project/renderer/antialias' ), strings.getKey( 'sidebar/project/antialias' ) ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererAntialias );

	// Renderer / Shadows

	var rendererShadows = new UI.THREE.Boolean( config.getKey( 'project/renderer/shadows' ), strings.getKey( 'sidebar/project/shadows' ) ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererShadows );

	projectsettings.add( rendererPropertiesRow );

	//

	function updateRenderer() {

		createRenderer( rendererType.getValue(), rendererAntialias.getValue() );

	}

	function createRenderer( type, antialias, shadows ) {

		rendererPropertiesRow.setDisplay( type === 'WebGLRenderer' ? '' : 'none' );

		var parameters = {};

		switch ( type ) {

			case 'WebGLRenderer':
				parameters.antialias = antialias;
				break;

			case 'RaytracingRenderer':
				parameters.workers = navigator.hardwareConcurrency || 4;
				parameters.workerPath = '../examples/js/renderers/RaytracingWorker.js';
				parameters.randomize = true;
				parameters.blockSize = 64;
				break;

		}

		var renderer = new rendererTypes[ type ]( parameters );

		if ( shadows && renderer.shadowMap ) {

			renderer.shadowMap.enabled = true;
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		}

		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ) );

	// Materials

	var materials = new UI.Panel();

	var headerRow = new UI.Row();
	headerRow.add( new UI.Text( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	materials.add( headerRow );

	var listbox = new UI.Listbox();
	signals.materialAdded.add( function () {

		listbox.setItems( Object.values( editor.materials ) );

	} );
	materials.add( listbox );

	var buttonsRow = new UI.Row();
	buttonsRow.setPadding( '10px 0px' );
	materials.add( buttonsRow );

	/*
	var addButton = new UI.Button().setLabel( 'Add' ).setMarginRight( '5px' );
	addButton.onClick( function () {

		editor.addMaterial( new THREE.MeshStandardMaterial() );

	} );
	buttonsRow.add( addButton );
	*/

	var assignMaterial = new UI.Button().setLabel( 'Assign' ).setMargin( '0px 5px' );
	assignMaterial.onClick( function () {

		if ( editor.selected !== null ) {

			var material = editor.getMaterialById( parseInt( listbox.getValue() ) );

			if ( material !== undefined ) {

				editor.execute( new SetMaterialCommand( editor, editor.selected, material ) );

			}

		}

	} );
	buttonsRow.add( assignMaterial );

	container.add( materials );

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			var index = Object.values( editor.materials ).indexOf( object.material );
			listbox.selectIndex( index );

		}

	} );

	return container;

};
