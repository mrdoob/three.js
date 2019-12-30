/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { SVGRenderer } from '../../examples/jsm/renderers/SVGRenderer.js';
import { RaytracingRenderer } from '../../examples/jsm/renderers/RaytracingRenderer.js';

import { UIPanel, UIRow, UIInput, UICheckbox, UISelect, UIText, UIListbox, UISpan, UIButton } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

var SidebarProject = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var rendererTypes = {

		'WebGLRenderer': THREE.WebGLRenderer,
		'SVGRenderer': SVGRenderer,
		'RaytracingRenderer': RaytracingRenderer

	};

	var container = new UISpan();

	var projectsettings = new UIPanel();
	projectsettings.setBorderTop( '0' );
	projectsettings.setPaddingTop( '20px' );

	container.add( projectsettings );

	// Title

	var titleRow = new UIRow();
	var title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/title' ) ).setWidth( '90px' ) );
	titleRow.add( title );

	projectsettings.add( titleRow );

	// Editable

	var editableRow = new UIRow();
	var editable = new UICheckbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/editable' ) ).setWidth( '90px' ) );
	editableRow.add( editable );

	projectsettings.add( editableRow );

	// Renderer

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new UIRow();
	var rendererType = new UISelect().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		config.setKey( 'project/renderer', value );

		updateRenderer();

	} );

	rendererTypeRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ) ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	projectsettings.add( rendererTypeRow );

	if ( config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( config.getKey( 'project/renderer' ) );

	}

	// Renderer / Antialias

	var rendererPropertiesRow = new UIRow().setMarginLeft( '90px' );

	var rendererAntialias = new UIBoolean( config.getKey( 'project/renderer/antialias' ), strings.getKey( 'sidebar/project/antialias' ) ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererAntialias );

	// Renderer / Shadows

	var rendererShadows = new UIBoolean( config.getKey( 'project/renderer/shadows' ), strings.getKey( 'sidebar/project/shadows' ) ).onChange( function () {

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

	var materials = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	materials.add( headerRow );

	var listbox = new UIListbox();
	signals.materialAdded.add( function () {

		listbox.setItems( Object.values( editor.materials ) );

	} );
	materials.add( listbox );

	var buttonsRow = new UIRow();
	buttonsRow.setPadding( '10px 0px' );
	materials.add( buttonsRow );

	/*
	var addButton = new UI.Button().setLabel( 'Add' ).setMarginRight( '5px' );
	addButton.onClick( function () {

		editor.addMaterial( new THREE.MeshStandardMaterial() );

	} );
	buttonsRow.add( addButton );
	*/

	var assignMaterial = new UIButton().setLabel( strings.getKey( 'sidebar/project/Assign' ) ).setMargin( '0px 5px' );
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

export { SidebarProject };
