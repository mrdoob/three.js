/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIBreak, UIText } from './libs/ui.js';

var ViewportInfo = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setId( 'info' );
	container.setPosition( 'absolute' );
	container.setLeft( '10px' );
	container.setBottom( '10px' );
	container.setFontSize( '12px' );
	container.setColor( '#fff' );

	var objectsText = new UIText( '0' ).setMarginLeft( '6px' );
	var verticesText = new UIText( '0' ).setMarginLeft( '6px' );
	var trianglesText = new UIText( '0' ).setMarginLeft( '6px' );
	var frametimeText = new UIText( '0' ).setMarginLeft( '6px' );

	container.add( new UIText( strings.getKey( 'viewport/info/objects' ) ).setTextTransform( 'lowercase' ) );
	container.add( objectsText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/vertices' ) ).setTextTransform( 'lowercase' ) );
	container.add( verticesText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/triangles' ) ).setTextTransform( 'lowercase' ) );
	container.add( trianglesText, new UIBreak() );
	container.add( new UIText( strings.getKey( 'viewport/info/frametime' ) ).setTextTransform( 'lowercase' ) );
	container.add( frametimeText, new UIBreak() );

	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.geometryChanged.add( update );

	//

	function update() {

		var scene = editor.scene;

		var objects = 0, vertices = 0, triangles = 0;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object.isMesh ) {

					var geometry = object.geometry;

					if ( geometry.isGeometry ) {

						vertices += geometry.vertices.length;
						triangles += geometry.faces.length;

					} else if ( geometry.isBufferGeometry ) {

						vertices += geometry.attributes.position.count;

						if ( geometry.index !== null ) {

							triangles += geometry.index.count / 3;

						} else {

							triangles += geometry.attributes.position.count / 3;

						}

					}

				}

			} );

		}

		objectsText.setValue( objects.format() );
		verticesText.setValue( vertices.format() );
		trianglesText.setValue( triangles.format() );

	}

	signals.sceneRendered.add( updateFrametime );

	function updateFrametime( frametime ) {

		frametimeText.setValue( Number( frametime ).toFixed( 2 ) + " ms" );

	}

	return container;

};

export { ViewportInfo };
