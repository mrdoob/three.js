/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UIListbox, UISpan, UIButton, UISelect, UINumber } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

var SidebarProject = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var currentRenderer = null;

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

	var rendererPropertiesRow = new UIRow();
	rendererPropertiesRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ) ).setWidth( '90px' ) );

	// Renderer / Antialias

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

	// Tonemapping

	var tonemapping = new UIPanel();

	// Tonemapping / Header

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/toneMapping' ).toUpperCase() ) );
	tonemapping.add( headerRow );

	// Tonemapping / Type

	var toneMappingTypeRow = new UIRow();
	var rendererToneMappingTypeLabel = new UIText( strings.getKey( 'sidebar/project/toneMappingType' ) ).setWidth( '90px' );

	var rendererToneMappingTypeSelect = new UISelect().setOptions( {
		0: 'None',
		1: 'Linear',
		2: 'Reinhard',
		3: 'Uncharted2',
		4: 'Cineon',
		5: 'ACESFilmic',
	} ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/renderer/toneMapping', this.getValue() );
		updateRenderer();

	} );
	rendererToneMappingTypeSelect.setValue( config.getKey( 'project/renderer/toneMapping' ) );
	toneMappingTypeRow.add( rendererToneMappingTypeLabel, rendererToneMappingTypeSelect );
	tonemapping.add( toneMappingTypeRow );

	// Tonemapping / Exposure

	var toneMappingExposureRow = new UIRow();
	var rendererToneMappingExposureLabel = new UIText( strings.getKey( 'sidebar/project/toneMappingExposure' ) ).setWidth( '90px' );
	var rendererToneMappingExposure = new UINumber( config.getKey( 'project/renderer/toneMappingExposure' ) ).setRange( 0, 10 ).onChange( function () {

		config.setKey( 'project/renderer/toneMappingExposure', this.getValue() );
		updateTonemapping();

	} );
	toneMappingExposureRow.add( rendererToneMappingExposureLabel, rendererToneMappingExposure );
	tonemapping.add( toneMappingExposureRow );

	// Tonemapping / White Point

	var toneMappingWhitePointRow = new UIRow();
	var rendererToneMappingWhitePointLabel = new UIText( strings.getKey( 'sidebar/project/toneMappingWhitePoint' ) ).setWidth( '90px' );
	var rendererToneMappingWhitePoint = new UINumber( config.getKey( 'project/renderer/toneMappingWhitePoint' ) ).setRange( 0, 10 ).onChange( function () {

		config.setKey( 'project/renderer/toneMappingWhitePoint', this.getValue() );
		updateTonemapping();

	} );
	toneMappingWhitePointRow.add( rendererToneMappingWhitePointLabel, rendererToneMappingWhitePoint );
	tonemapping.add( toneMappingWhitePointRow );

	container.add( tonemapping );

	//

	function updateRenderer() {

		createRenderer( rendererAntialias.getValue(), rendererShadows.getValue(), rendererToneMappingTypeSelect.getValue() );

	}

	function createRenderer( antialias, shadows, toneMapping ) {

		var parameters = { antialias: antialias };
		currentRenderer = new THREE.WebGLRenderer( parameters );

		if ( shadows ) {

			currentRenderer.shadowMap.enabled = true;
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		}

		currentRenderer.toneMapping = parseFloat( toneMapping );

		signals.rendererChanged.dispatch( currentRenderer );

	}

	function updateTonemapping() {

		currentRenderer.toneMappingExposure = rendererToneMappingExposure.getValue();
		currentRenderer.toneMappingWhitePoint = rendererToneMappingWhitePoint.getValue();

		signals.rendererUpdated.dispatch();

	}

	createRenderer( config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ), config.getKey( 'project/renderer/toneMapping' ) );

	// Materials

	var materials = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	materials.add( headerRow );

	var listbox = new UIListbox();
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

		var selectedObject = editor.selected;

		if ( selectedObject !== null ) {

			var oldMaterial = selectedObject.material;

			// only assing materials to objects with a material property (e.g. avoid assigning material to THREE.Group)

			if ( oldMaterial !== undefined ) {

				var material = editor.getMaterialById( parseInt( listbox.getValue() ) );

				if ( material !== undefined ) {

					editor.removeMaterial( oldMaterial );
					editor.execute( new SetMaterialCommand( editor, selectedObject, material ) );
					editor.addMaterial( material );

				}

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

	signals.materialAdded.add( refreshMaterialBrowserUI );
	signals.materialRemoved.add( refreshMaterialBrowserUI );

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	return container;

};

export { SidebarProject };
