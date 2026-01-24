import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

import { UINumber, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function SidebarProjectRenderer( editor ) {

	const config = editor.config;
	const signals = editor.signals;
	const strings = editor.strings;

	let currentRenderer = null;

	const container = new UIPanel();
	container.setBorderTop( '0px' );

	// Renderer

	const rendererRow = new UIRow();
	container.add( rendererRow );

	rendererRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ) ).setClass( 'Label' ) );

	const rendererTypeSelect = new UISelect().setOptions( {
		'WebGLRenderer': 'WebGL',
		'WebGPURenderer': 'WebGPU'
	} ).setWidth( '150px' ).onChange( createRenderer );
	rendererTypeSelect.setValue( config.getKey( 'project/renderer/type' ) );
	rendererRow.add( rendererTypeSelect );

	// Antialias

	const antialiasRow = new UIRow();
	container.add( antialiasRow );

	antialiasRow.add( new UIText( strings.getKey( 'sidebar/project/antialias' ) ).setClass( 'Label' ) );

	const antialiasBoolean = new UIBoolean( config.getKey( 'project/renderer/antialias' ) ).onChange( createRenderer );
	antialiasRow.add( antialiasBoolean );

	// Shadows

	const shadowsRow = new UIRow();
	container.add( shadowsRow );

	shadowsRow.add( new UIText( strings.getKey( 'sidebar/project/shadows' ) ).setClass( 'Label' ) );

	const shadowsBoolean = new UIBoolean( config.getKey( 'project/renderer/shadows' ) ).onChange( updateShadows );
	shadowsRow.add( shadowsBoolean );

	const shadowTypeSelect = new UISelect().setOptions( {
		0: 'Basic',
		1: 'PCF',
		3: 'VSM'
	} ).setWidth( '125px' ).onChange( updateShadows );
	shadowTypeSelect.setValue( config.getKey( 'project/renderer/shadowType' ) );
	shadowsRow.add( shadowTypeSelect );

	function updateShadows() {

		currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
		currentRenderer.shadowMap.type = parseFloat( shadowTypeSelect.getValue() );

		signals.rendererUpdated.dispatch();

	}

	// Tonemapping

	const toneMappingRow = new UIRow();
	container.add( toneMappingRow );

	toneMappingRow.add( new UIText( strings.getKey( 'sidebar/project/toneMapping' ) ).setClass( 'Label' ) );

	const toneMappingSelect = new UISelect().setOptions( {
		0: 'No',
		1: 'Linear',
		2: 'Reinhard',
		3: 'Cineon',
		4: 'ACESFilmic',
		6: 'AgX',
		7: 'Neutral'
	} ).setWidth( '120px' ).onChange( updateToneMapping );
	toneMappingSelect.setValue( config.getKey( 'project/renderer/toneMapping' ) );
	toneMappingRow.add( toneMappingSelect );

	const toneMappingExposure = new UINumber( config.getKey( 'project/renderer/toneMappingExposure' ) );
	toneMappingExposure.setDisplay( toneMappingSelect.getValue() === '0' ? 'none' : '' );
	toneMappingExposure.setWidth( '30px' ).setMarginLeft( '10px' );
	toneMappingExposure.setRange( 0, 10 );
	toneMappingExposure.onChange( updateToneMapping );
	toneMappingRow.add( toneMappingExposure );

	function updateToneMapping() {

		toneMappingExposure.setDisplay( toneMappingSelect.getValue() === '0' ? 'none' : '' );

		currentRenderer.toneMapping = parseFloat( toneMappingSelect.getValue() );
		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();
		signals.rendererUpdated.dispatch();

	}

	//

	async function createRenderer() {

		const rendererType = rendererTypeSelect.getValue();
		const antialias = antialiasBoolean.getValue();

		if ( rendererType === 'WebGPURenderer' ) {

			currentRenderer = new WebGPURenderer( { antialias: antialias } );
			await currentRenderer.init();

		} else {

			currentRenderer = new THREE.WebGLRenderer( { antialias: antialias, logarithmicDepthBuffer: true } );

		}

		currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
		currentRenderer.shadowMap.type = parseFloat( shadowTypeSelect.getValue() );
		currentRenderer.toneMapping = parseFloat( toneMappingSelect.getValue() );
		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

		signals.rendererCreated.dispatch( currentRenderer );
		signals.rendererUpdated.dispatch();

	}

	createRenderer();


	// Signals

	signals.editorCleared.add( function () {

		currentRenderer.shadowMap.enabled = true;
		currentRenderer.shadowMap.type = THREE.PCFShadowMap;
		currentRenderer.toneMapping = THREE.NeutralToneMapping;
		currentRenderer.toneMappingExposure = 1;

		shadowsBoolean.setValue( currentRenderer.shadowMap.enabled );
		shadowTypeSelect.setValue( currentRenderer.shadowMap.type );
		toneMappingSelect.setValue( currentRenderer.toneMapping );
		toneMappingExposure.setValue( currentRenderer.toneMappingExposure );
		toneMappingExposure.setDisplay( currentRenderer.toneMapping === 0 ? 'none' : '' );

		signals.rendererUpdated.dispatch();

	} );

	signals.rendererUpdated.add( function () {

		config.setKey(
			'project/renderer/type', rendererTypeSelect.getValue(),
			'project/renderer/antialias', antialiasBoolean.getValue(),
			'project/renderer/shadows', shadowsBoolean.getValue(),
			'project/renderer/shadowType', parseFloat( shadowTypeSelect.getValue() ),
			'project/renderer/toneMapping', parseFloat( toneMappingSelect.getValue() ),
			'project/renderer/toneMappingExposure', toneMappingExposure.getValue()
		);

	} );

	return container;

}

export { SidebarProjectRenderer };
