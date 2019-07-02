/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	FileLoader
} from '../../build/three.module.js';

import { Panel, Row } from './libs/ui.js';

var MenubarExamples = function ( editor ) {

	var strings = editor.strings;

	var container = new Panel();
	container.setClass( 'menu' );

	var title = new Panel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/examples' ) );
	container.add( title );

	var options = new Panel();
	options.setClass( 'options' );
	container.add( options );

	// Examples

	var items = [
		{ title: 'Arkanoid', file: 'arkanoid.app.json' },
		{ title: 'Camera', file: 'camera.app.json' },
		{ title: 'Particles', file: 'particles.app.json' },
		{ title: 'Pong', file: 'pong.app.json' },
		{ title: 'Shaders', file: 'shaders.app.json' }
	];

	var loader = new FileLoader();

	for ( var i = 0; i < items.length; i ++ ) {

		( function ( i ) {

			var item = items[ i ];

			var option = new Row();
			option.setClass( 'option' );
			option.setTextContent( item.title );
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

};

export { MenubarExamples };
