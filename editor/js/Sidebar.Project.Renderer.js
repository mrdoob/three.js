import * as THREE from '../../build/three.module.js';

import { UINumber, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function SidebarProjectRenderer( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var currentRenderer = null;

	var container = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ).toUpperCase() ) );
	container.add( headerRow );

	// Antialias

	var antialiasRow = new UIRow();
	var antialiasBoolean = new UIBoolean( config.getKey( 'project/renderer/antialias' ) ).onChange( function () {

		createRenderer();

	} );

	antialiasRow.add( new UIText( strings.getKey( 'sidebar/project/antialias' ) ).setWidth( '90px' ) );
	antialiasRow.add( antialiasBoolean );

	container.add( antialiasRow );

	// Shadows

	var shadowsRow = new UIRow();
	var shadowsBoolean = new UIBoolean( config.getKey( 'project/renderer/shadows' ) ).onChange( function () {

		currentRenderer.shadowMap.enabled = this.getValue();
		signals.rendererUpdated.dispatch();

	} );

	shadowsRow.add( new UIText( strings.getKey( 'sidebar/project/shadows' ) ).setWidth( '90px' ) );
	shadowsRow.add( shadowsBoolean );

	var shadowTypeSelect = new UISelect().setOptions( {
		0: 'Basic',
		1: 'PCF',
		2: 'PCF (Soft)',
		//	3: 'VSM'
	} ).setWidth( '125px' ).onChange( function () {

		currentRenderer.shadowMap.type = parseFloat( this.getValue() );
		signals.rendererUpdated.dispatch();

	} );
	shadowTypeSelect.setValue( config.getKey( 'project/renderer/shadowType' ) );

	shadowsRow.add( shadowTypeSelect );

	container.add( shadowsRow );

	// Physically Correct lights

	var physicallyCorrectLightsRow = new UIRow();
	var physicallyCorrectLightsBoolean = new UIBoolean( config.getKey( 'project/renderer/physicallyCorrectLights' ) ).onChange( function () {

		currentRenderer.physicallyCorrectLights = this.getValue();
		signals.rendererUpdated.dispatch();

	} );

	physicallyCorrectLightsRow.add( new UIText( strings.getKey( 'sidebar/project/physicallyCorrectLights' ) ).setWidth( '90px' ) );
	physicallyCorrectLightsRow.add( physicallyCorrectLightsBoolean );

	container.add( physicallyCorrectLightsRow );

	// Tonemapping

	var toneMappingRow = new UIRow();
	var toneMappingSelect = new UISelect().setOptions( {
		0: 'None',
		1: 'Linear',
		2: 'Reinhard',
		3: 'Cineon',
		4: 'ACESFilmic'
	} ).setWidth( '120px' ).onChange( function () {

		currentRenderer.toneMapping = parseFloat( this.getValue() );
		toneMappingExposure.setDisplay( currentRenderer.toneMapping === 0 ? 'none' : '' );
		signals.rendererUpdated.dispatch();

	} );
	toneMappingSelect.setValue( config.getKey( 'project/renderer/toneMapping' ) );

	toneMappingRow.add( new UIText( strings.getKey( 'sidebar/project/toneMapping' ) ).setWidth( '90px' ) );
	toneMappingRow.add( toneMappingSelect );

	var toneMappingExposure = new UINumber( config.getKey( 'project/renderer/toneMappingExposure' ) );
	toneMappingExposure.setDisplay( toneMappingSelect.getValue() === '0' ? 'none' : '' );
	toneMappingExposure.setWidth( '30px' ).setMarginLeft( '10px' );
	toneMappingExposure.setRange( 0, 10 );
	toneMappingExposure.onChange( function () {

		currentRenderer.toneMappingExposure = this.getValue();
		signals.rendererUpdated.dispatch();

	} );
	toneMappingRow.add( toneMappingExposure );

	container.add( toneMappingRow );

	//

	function createRenderer() {

		currentRenderer = new THREE.WebGLRenderer( { antialias: antialiasBoolean.getValue() } );
		currentRenderer.outputEncoding = THREE.sRGBEncoding;
		currentRenderer.physicallyCorrectLights = physicallyCorrectLightsBoolean.getValue();
		currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
		currentRenderer.shadowMap.type = parseFloat( shadowTypeSelect.getValue() );
		currentRenderer.toneMapping = parseFloat( toneMappingSelect.getValue() );
		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

		signals.rendererChanged.dispatch( currentRenderer );

	}

	createRenderer();

	// signals

	signals.editorCleared.add( function () {

		currentRenderer.physicallyCorrectLights = false;
		currentRenderer.shadowMap.enabled = true;
		currentRenderer.shadowMap.type = 1;
		currentRenderer.toneMapping = 0;
		currentRenderer.toneMappingExposure = 1;

		refreshRendererUI();

		signals.rendererUpdated.dispatch();

	} );

	function refreshRendererUI() {

		physicallyCorrectLightsBoolean.setValue( currentRenderer.physicallyCorrectLights );
		shadowsBoolean.setValue( currentRenderer.shadowMap.enabled );
		shadowTypeSelect.setValue( currentRenderer.shadowMap.type );
		toneMappingSelect.setValue( currentRenderer.toneMapping );
		toneMappingExposure.setValue( currentRenderer.toneMappingExposure );
		toneMappingExposure.setDisplay( currentRenderer.toneMapping === 0 ? 'none' : '' );

	}

	signals.rendererUpdated.add( function () {

		config.setKey(
			'project/renderer/antialias', antialiasBoolean.getValue(),
			'project/renderer/physicallyCorrectLights', physicallyCorrectLightsBoolean.getValue(),
			'project/renderer/shadows', shadowsBoolean.getValue(),
			'project/renderer/shadowType', parseFloat( shadowTypeSelect.getValue() ),
			'project/renderer/toneMapping', parseFloat( toneMappingSelect.getValue() ),
			'project/renderer/toneMappingExposure', toneMappingExposure.getValue()
		);

	} );

	return container;

}

export { SidebarProjectRenderer };
