import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow } from './libs/ui.js';

function MenubarExamples( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/examples' ) );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Examples

	var items = [
		{ title: 'menubar/examples/Arkanoid', file: 'arkanoid.app.json' },
		{ title: 'menubar/examples/Camera', file: 'camera.app.json' },
		{ title: 'menubar/examples/Particles', file: 'particles.app.json' },
		{ title: 'menubar/examples/Pong', file: 'pong.app.json' },
		{ title: 'menubar/examples/Shaders', file: 'shaders.app.json' }
	];

	var loader = new THREE.FileLoader();

	for ( var i = 0; i < items.length; i ++ ) {

		( function ( i ) {

			var item = items[ i ];

			var option = new UIRow();
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
