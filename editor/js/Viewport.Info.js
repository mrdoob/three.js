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

	const objectsText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const verticesText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const trianglesText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const frametimeText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' );
	const samplesText = new UIText( '0' ).setTextAlign( 'right' ).setWidth( '60px' ).setMarginRight( '6px' ).setHidden( true );

	const objectsUnitText = new UIText( strings.getKey( 'viewport/info/objects' ) );
	const verticesUnitText = new UIText( strings.getKey( 'viewport/info/vertices' ) );
	const trianglesUnitText = new UIText( strings.getKey( 'viewport/info/triangles' ) );
	const samplesUnitText = new UIText( strings.getKey( 'viewport/info/samples' ) ).setHidden( true );

	container.add( objectsText, objectsUnitText, new UIBreak() );
	container.add( verticesText, verticesUnitText, new UIBreak() );
	container.add( trianglesText, trianglesUnitText, new UIBreak() );
	container.add( frametimeText, new UIText( strings.getKey( 'viewport/info/rendertime' ) ), new UIBreak() );
	container.add( samplesText, samplesUnitText, new UIBreak() );

	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.objectChanged.add( update );
	signals.geometryChanged.add( update );
	signals.sceneRendered.add( updateFrametime );

	//

	const pluralRules = new Intl.PluralRules( editor.config.getKey( 'language' ) );

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
					const positionAttribute = geometry.attributes.position;

					// update counts only if vertex data are defined

					if ( positionAttribute !== undefined && positionAttribute !== null ) {

						vertices += positionAttribute.count;

					}

					if ( object.isMesh ) {

						if ( geometry.index !== null ) {

							triangles += geometry.index.count / 3;

						} else if ( positionAttribute !== undefined && positionAttribute !== null ) {

							triangles += positionAttribute.count / 3;

						}

					}

				}

			} );

		}

		objectsText.setValue( editor.utils.formatNumber( objects ) );
		verticesText.setValue( editor.utils.formatNumber( vertices ) );
		trianglesText.setValue( editor.utils.formatNumber( triangles ) );

		const pluralRules = new Intl.PluralRules( editor.config.getKey( 'language' ) );

		const objectsStringKey = ( pluralRules.select( objects ) === 'one' ) ? 'viewport/info/object' : 'viewport/info/objects';
		objectsUnitText.setValue( strings.getKey( objectsStringKey ) );

		const verticesStringKey = ( pluralRules.select( vertices ) === 'one' ) ? 'viewport/info/vertex' : 'viewport/info/vertices';
		verticesUnitText.setValue( strings.getKey( verticesStringKey ) );

		const trianglesStringKey = ( pluralRules.select( triangles ) === 'one' ) ? 'viewport/info/triangle' : 'viewport/info/triangles';
		trianglesUnitText.setValue( strings.getKey( trianglesStringKey ) );

	}

	function updateFrametime( frametime ) {

		frametimeText.setValue( Number( frametime ).toFixed( 2 ) );

	}

	//

	editor.signals.pathTracerUpdated.add( function ( samples ) {

		samples = Math.floor( samples );

		samplesText.setValue( samples );

		const samplesStringKey = ( pluralRules.select( samples ) === 'one' ) ? 'viewport/info/sample' : 'viewport/info/samples';
		samplesUnitText.setValue( strings.getKey( samplesStringKey ) );

	} );

	editor.signals.viewportShadingChanged.add( function () {

		const isRealisticShading = ( editor.viewportShading === 'realistic' );

		samplesText.setHidden( ! isRealisticShading );
		samplesUnitText.setHidden( ! isRealisticShading );

		container.setBottom( isRealisticShading ? '32px' : '20px' );

	} );

	return container;

}

export { ViewportInfo };
