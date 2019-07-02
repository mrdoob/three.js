/**
 * @author mrdoob / http://mrdoob.com/
 */

import { WebGLRenderer } from '../../build/three.module.js';

import { SVGRenderer } from '../../examples/jsm/renderers/SVGRenderer.js';
import { SoftwareRenderer } from '../../examples/jsm/renderers/SoftwareRenderer.js';
import { RaytracingRenderer } from '../../examples/jsm/renderers/RaytracingRenderer.js';

import { Panel, Row, Input, Checkbox, Select, UIText } from './libs/ui.js';
import { Boolean } from './libs/ui.three.js';

var SidebarProject = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var rendererTypes = {

		'WebGLRenderer': WebGLRenderer,
		'SVGRenderer': SVGRenderer,
		'SoftwareRenderer': SoftwareRenderer,
		'RaytracingRenderer': RaytracingRenderer

	};

	var container = new Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	// Title

	var titleRow = new Row();
	var title = new Input( config.getKey( 'project/title' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/title' ) ).setWidth( '90px' ) );
	titleRow.add( title );

	container.add( titleRow );

	// Editable

	var editableRow = new Row();
	var editable = new Checkbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/editable' ) ).setWidth( '90px' ) );
	editableRow.add( editable );

	container.add( editableRow );

	// VR

	var vrRow = new Row();
	var vr = new Checkbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );

	} );

	vrRow.add( new UIText( strings.getKey( 'sidebar/project/vr' ) ).setWidth( '90px' ) );
	vrRow.add( vr );

	container.add( vrRow );

	// Renderer

	var options = {};

	for ( var key in rendererTypes ) {

		if ( key.indexOf( 'WebGL' ) >= 0 && System.support.webgl === false ) continue;

		options[ key ] = key;

	}

	var rendererTypeRow = new Row();
	var rendererType = new Select().setOptions( options ).setWidth( '150px' ).onChange( function () {

		var value = this.getValue();

		config.setKey( 'project/renderer', value );

		updateRenderer();

	} );

	rendererTypeRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ) ).setWidth( '90px' ) );
	rendererTypeRow.add( rendererType );

	container.add( rendererTypeRow );

	if ( config.getKey( 'project/renderer' ) !== undefined ) {

		rendererType.setValue( config.getKey( 'project/renderer' ) );

	}

	// Renderer / Antialias

	var rendererPropertiesRow = new Row().setMarginLeft( '90px' );

	var rendererAntialias = new Boolean( config.getKey( 'project/renderer/antialias' ), strings.getKey( 'sidebar/project/antialias' ) ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererAntialias );

	// Renderer / Shadows

	var rendererShadows = new Boolean( config.getKey( 'project/renderer/shadows' ), strings.getKey( 'sidebar/project/shadows' ) ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );
	rendererPropertiesRow.add( rendererShadows );

	container.add( rendererPropertiesRow );

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

		}

		signals.rendererChanged.dispatch( renderer );

	}

	createRenderer( config.getKey( 'project/renderer' ), config.getKey( 'project/renderer/antialias' ), config.getKey( 'project/renderer/shadows' ) );

	return container;

};

export { SidebarProject };
