import * as THREE from 'three';

import { UIPanel, UIRow } from './libs/ui.js';

function MenubarExamples( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/examples' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Examples

	const items = [
		{ title: 'menubar/examples/Arkanoid', file: 'arkanoid.app.json' },
		{ title: 'menubar/examples/Camera', file: 'camera.app.json' },
		{ title: 'menubar/examples/Particles', file: 'particles.app.json' },
		{ title: 'menubar/examples/Pong', file: 'pong.app.json' },
		{ title: 'menubar/examples/Shaders', file: 'shaders.app.json' }
	];

	const loader = new THREE.FileLoader();

	for ( let i = 0; i < items.length; i ++ ) {

		( function ( i ) {

			const item = items[ i ];

			const option = new UIRow();
			option.setClass( 'option' );
			option.setTextContent( strings.getKey( item.title ) );
			option.onClick( function () {

				if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

					loader.load( 'examples/' + item.file, function ( text ) {

						editor.clear();
						editor.fromJSON( JSON.parse( text ) );

					} );

				}

			} );
			options.add( option );

		} )( i );

	}

	return container;

}

export { MenubarExamples };
