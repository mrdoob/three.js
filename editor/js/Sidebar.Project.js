/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UITextArea, UIListbox, UISpan, UIButton, UISelect, UINumber } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

function SidebarProject( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var currentRenderer = null;
	var currentPmremGenerator = null;

	var container = new UISpan();

	var projectsettings = new UIPanel();
	projectsettings.setBorderTop( '0' );
	projectsettings.setPaddingTop( '20px' );

	container.add( projectsettings );

	// Title

	var titleRow = new UIRow();
	var title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).setWidth( '150px' ).onChange( function () {

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

	// WebVR

	var vrRow = new UIRow();
	var vr = new UICheckbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );

	} );

	vrRow.add( new UIText( strings.getKey( 'sidebar/project/vr' ) ).setWidth( '90px' ) );
	vrRow.add( vr );

	projectsettings.add( vrRow );

	// Renderer

	var rendererPanel = new UIPanel();
	container.add( rendererPanel );

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ).toUpperCase() ) );
	rendererPanel.add( headerRow );

	// Renderer / Antialias

	var antialiasRow = new UIRow();
	var antialiasBoolean = new UIBoolean( config.getKey( 'project/renderer/antialias' ) ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );

	antialiasRow.add( new UIText( strings.getKey( 'sidebar/project/antialias' ) ).setWidth( '90px' ) );
	antialiasRow.add( antialiasBoolean );

	rendererPanel.add( antialiasRow );

	// Renderer / Shadows

	var shadowsRow = new UIRow();
	var shadowsBoolean = new UIBoolean( config.getKey( 'project/renderer/shadows' ) ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );

	shadowsRow.add( new UIText( strings.getKey( 'sidebar/project/shadows' ) ).setWidth( '90px' ) );
	shadowsRow.add( shadowsBoolean );

	rendererPanel.add( shadowsRow );

	// Renderer / Shadow Type

	var shadowTypeRow = new UIRow();
	var shadowTypeSelect = new UISelect().setOptions( {
		0: 'Basic',
		1: 'PCF',
		2: 'PCF (Soft)',
	//	3: 'VSM'
	} ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/renderer/shadowType', parseFloat( this.getValue() ) );
		updateRenderer();

	} );
	shadowTypeSelect.setValue( config.getKey( 'project/renderer/shadowType' ) );

	shadowTypeRow.add( new UIText( strings.getKey( 'sidebar/project/shadowType' ) ).setWidth( '90px' ) );
	shadowTypeRow.add( shadowTypeSelect );

	rendererPanel.add( shadowTypeRow );

	// Renderer / Physically Correct lights

	var physicallyCorrectLightsRow = new UIRow();
	var physicallyCorrectLightsBoolean = new UIBoolean( config.getKey( 'project/renderer/physicallyCorrectLights' ) ).onChange( function () {

		config.setKey( 'project/renderer/physicallyCorrectLights', this.getValue() );
		updateRenderer();

	} );

	physicallyCorrectLightsRow.add( new UIText( strings.getKey( 'sidebar/project/physicallyCorrectLights' ) ).setWidth( '90px' ) );
	physicallyCorrectLightsRow.add( physicallyCorrectLightsBoolean );

	rendererPanel.add( physicallyCorrectLightsRow );

	// Renderer / Tonemapping

	var toneMappingRow = new UIRow();
	var toneMappingSelect = new UISelect().setOptions( {
		0: 'None',
		1: 'Linear',
		2: 'Reinhard',
		3: 'Cineon',
		4: 'ACESFilmic'
	} ).setWidth( '150px' ).onChange( function () {

		var toneMapping = parseFloat( this.getValue() );
		config.setKey( 'project/renderer/toneMapping', toneMapping );
		updateRenderer();

	} );
	toneMappingSelect.setValue( config.getKey( 'project/renderer/toneMapping' ) );

	toneMappingRow.add( new UIText( strings.getKey( 'sidebar/project/toneMapping' ) ).setWidth( '90px' ) );
	toneMappingRow.add( toneMappingSelect );

	rendererPanel.add( toneMappingRow );

	// Tonemapping / Exposure

	var toneMappingExposureRow = new UIRow();
	var toneMappingExposure = new UINumber( config.getKey( 'project/renderer/toneMappingExposure' ) ).setRange( 0, 10 ).onChange( function () {

		config.setKey( 'project/renderer/toneMappingExposure', this.getValue() );
		updateTonemapping();

	} );

	toneMappingExposureRow.add( new UIText( strings.getKey( 'sidebar/project/toneMappingExposure' ) ).setWidth( '90px' ) );
	toneMappingExposureRow.add( toneMappingExposure );
	rendererPanel.add( toneMappingExposureRow );

	//

	function updateRenderer() {

		createRenderer(
			antialiasBoolean.getValue(),
			shadowsBoolean.getValue(),
			shadowTypeSelect.getValue(),
			toneMappingSelect.getValue(),
			toneMappingExposure.getValue(),
			physicallyCorrectLightsBoolean.getValue()
		);

	}

	function createRenderer( antialias, shadows, shadowType, toneMapping, toneMappingExposure, physicallyCorrectLights ) {

		var parameters = { antialias: antialias };

		if ( currentRenderer !== null ) {

			currentRenderer.dispose();
			currentPmremGenerator.dispose();

		}

		currentRenderer = new THREE.WebGLRenderer( parameters );
		currentPmremGenerator = new THREE.PMREMGenerator( currentRenderer );
		currentPmremGenerator.compileCubemapShader();
		currentPmremGenerator.compileEquirectangularShader();

		if ( shadows ) {

			currentRenderer.shadowMap.enabled = true;
			currentRenderer.shadowMap.type = parseFloat( shadowType );

		}

		currentRenderer.toneMapping = parseFloat( toneMapping );
		currentRenderer.toneMappingExposure = toneMappingExposure;
		currentRenderer.physicallyCorrectLights = physicallyCorrectLights;

		signals.rendererChanged.dispatch( currentRenderer, currentPmremGenerator );

	}

	function updateTonemapping() {

		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

		signals.rendererUpdated.dispatch();

	}

	createRenderer(
		config.getKey( 'project/renderer/antialias' ),
		config.getKey( 'project/renderer/shadows' ),
		config.getKey( 'project/renderer/shadowType' ),
		config.getKey( 'project/renderer/toneMapping' ),
		config.getKey( 'project/renderer/toneMappingExposure' ),
		config.getKey( 'project/renderer/physicallyCorrectLights' )
	 );

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
	signals.materialChanged.add( refreshMaterialBrowserUI );
	signals.materialRemoved.add( refreshMaterialBrowserUI );

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	
	
	// remote scripts

	var remotescripts = new UIPanel();

	// title row
	var remoteScriptRow1 = new UIRow();

	// info text rows
	var remoteScriptRow2 = new UIRow();
	var remoteScriptRow3 = new UIRow();

	// add title text to row 1
	remoteScriptRow1.add( new UIText( strings.getKey( 'sidebar/project/remotescript' ) ).setWidth( '100%' ) );

	// add info text to rows 2 and 3
	remoteScriptRow2.add( new UIText( `- ${strings.getKey( 'sidebar/project/remotescripthelp1' )}` ).setWidth( '100%' ).setFontSize('10px').setPadding('10px 5px 0 5px') );
	remoteScriptRow3.add( new UIText( `- ${strings.getKey( 'sidebar/project/remotescripthelp2' )}` ).setWidth( '100%' ).setFontSize('10px').setPadding('10px 5px 0 5px') );


	// create the textarea for list of remote sources
	var remotescriptdata = new UITextArea().setWidth( '100%' ).setHeight( '140px' ).setFontSize( '12px' ).setValue( config.getKey( 'project/remoteScripts' ) );
	remotescriptdata.onChange( remoteScriptsUpdate );

	// had to specify border box so that text area would fit within the panel... css am i right?
	remotescriptdata.dom.style.boxSizing = "border-box";
	

	// load the title, then the text area, then the info rows
	remotescripts.add( remoteScriptRow1 );

	remotescripts.add( remotescriptdata );

	remotescripts.add( remoteScriptRow2 );
	remotescripts.add( remoteScriptRow3 );
	
	// add the entire panel to the project tab
	container.add( remotescripts );
	
	// handler for textarea onchange - updates saved list of URLs and loads the scripts to the header
	function remoteScriptsUpdate( ){

		config.setKey( 'project/remoteScripts', this.getValue() );
				
		loadRemoteScripts();

	}

	// Gets the list of saved URLs and loops through them injecting the scripts
	function loadRemoteScripts( ){
		var val = config.getKey( 'project/remoteScripts' );
		var remoteScripts = val.split(/\r?\n/);
		
		for (var i=0; i<remoteScripts.length; i++){
			injectScript(`${remoteScripts[i]}`).then((r) => {
				console.log(`Script ${r.src} loaded!`);
			}).catch(error => {
				console.error(error);
			});
		}
	}
	loadRemoteScripts(); // load saved scripts once on page load


	// function to load scripts as defined in the project tab - one script per line
	function injectScript( url ){
		return new Promise((resolve, reject) => {
			var src = url.trim();

			// check for empty string or single character
			if (src.length > 1 && !(document.querySelectorAll(`script[src="${src}"]`).length > 0)) {

				const script = document.createElement('script');

				script.className = "dynamicRemoteScript";
			
				script.src = src;
				script.addEventListener('load', resolve(script));
				script.addEventListener('error', e => reject(e.error));
				document.head.appendChild(script);	
			} else if (src.length < 2 || src == "undefined") {
				console.log(`Script src "${src}" not valid!`);
			} else {
				console.log(`Script already loaded: ${src}`);
			}
		});
	}
	
	
	return container;

}

export { SidebarProject };
