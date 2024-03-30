import { UIPanel, UIBreak, UIText } from './libs/ui.js';

function ViewportInfo( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'info' );
	container.setPosition( 'absolute' );
	container.setLeft( '10px' );
	container.setBottom( '20px' );
	container.setFontSize( '12px' );
	container.setColor( '#fff' );
	container.setTextTransform( 'lowercase' );

	const objectsText  = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const verticesText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const trianglesText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const frametimeText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );

	container.add( objectsText, new UIText( strings.getKey( 'viewport/info/objects' ) ), new UIBreak() );
	container.add( verticesText, new UIText( strings.getKey( 'viewport/info/vertices' ) ), new UIBreak() );
	container.add( trianglesText, new UIText( strings.getKey( 'viewport/info/triangles' ) ), new UIBreak() );
	container.add( frametimeText, new UIText( strings.getKey( 'viewport/info/rendertime' ) ), new UIBreak() );

	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.geometryChanged.add( update );
	signals.sceneRendered.add( updateFrametime );

	//

	function update() {

		const scene = editor.scene;

		let objects = 0, vertices = 0, triangles = 0;

		for ( let i = 0, l = scene.children.length; i < l; i ++ ) {

			const object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object.isMesh || object.isPoints ) {

					const geometry = object.geometry;

					vertices += geometry.attributes.position.count;

					if ( object.isMesh ) {

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

	function updateFrametime( frametime ) {

		frametimeText.setValue( Number( frametime ).toFixed( 2 ) );

	}

	return container;

}

export { ViewportInfo };
