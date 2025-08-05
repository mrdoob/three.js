import * as THREE from 'three';

import { zipSync, strToU8 } from 'three/addons/libs/fflate.module.js';

import { UIButton, UICheckbox, UIPanel, UIInput, UIRow, UIText } from './libs/ui.js';

function SidebarProjectApp( editor ) {

	const config = editor.config;
	const signals = editor.signals;
	const strings = editor.strings;

	const save = editor.utils.save;

	const container = new UIPanel();
	container.setId( 'app' );

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/app' ).toUpperCase() ) );
	container.add( headerRow );

	// Title

	const titleRow = new UIRow();
	const title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/app/title' ) ).setClass( 'Label' ) );
	titleRow.add( title );

	container.add( titleRow );

	// Editable

	const editableRow = new UIRow();
	const editable = new UICheckbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/app/editable' ) ).setClass( 'Label' ) );
	editableRow.add( editable );

	container.add( editableRow );

	// Play/Stop

	let isPlaying = false;

	const playButton = new UIButton( strings.getKey( 'sidebar/project/app/play' ) );
	playButton.setWidth( '170px' );
	playButton.setMarginLeft( '120px' );
	playButton.setMarginBottom( '10px' );
	playButton.onClick( function () {

		if ( isPlaying === false ) {

			isPlaying = true;
			playButton.setTextContent( strings.getKey( 'sidebar/project/app/stop' ) );
			signals.startPlayer.dispatch();

		} else {

			isPlaying = false;
			playButton.setTextContent( strings.getKey( 'sidebar/project/app/play' ) );
			signals.stopPlayer.dispatch();

		}

	} );

	container.add( playButton );

	// Publish

	const publishButton = new UIButton( strings.getKey( 'sidebar/project/app/publish' ) );
	publishButton.setWidth( '170px' );
	publishButton.setMarginLeft( '120px' );
	publishButton.setMarginBottom( '10px' );
	publishButton.onClick( function () {

		const toZip = {};

		//

		let output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		output = JSON.stringify( output, null, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		toZip[ 'app.json' ] = strToU8( output );

		//

		const title = config.getKey( 'project/title' );

		const manager = new THREE.LoadingManager( function () {

			const zipped = zipSync( toZip, { level: 9 } );

			const blob = new Blob( [ zipped.buffer ], { type: 'application/zip' } );

			save( blob, ( title !== '' ? title : 'untitled' ) + '.zip' );

		} );

		const loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			content = content.replace( '<!-- title -->', title );

			let editButton = '';

			if ( config.getKey( 'project/editable' ) ) {

				editButton = [
					'			let button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
				].join( '\n' );

			}

			content = content.replace( '\t\t\t/* edit button */', editButton );

			toZip[ 'index.html' ] = strToU8( content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			toZip[ 'js/app.js' ] = strToU8( content );

		} );
		loader.load( '../build/three.core.js', function ( content ) {

			toZip[ 'js/three.core.js' ] = strToU8( content );

		} );
		loader.load( '../build/three.module.js', function ( content ) {

			toZip[ 'js/three.module.js' ] = strToU8( content );

		} );

	} );
	container.add( publishButton );

	// Signals

	signals.editorCleared.add( function () {

		title.setValue( '' );
		config.setKey( 'project/title', '' );

	} );

	return container;

}

export { SidebarProjectApp };
