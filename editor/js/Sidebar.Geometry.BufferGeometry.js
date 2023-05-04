import { UIRow, UIText, UISpan, UIBreak, UICheckbox } from './libs/ui.js';

function SidebarGeometryBufferGeometry( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIRow();

	function update( object ) {

		if ( object === null ) return; // objectSelected.dispatch( null )
		if ( object === undefined ) return;

		const geometry = object.geometry;

		if ( geometry ) {

			container.clear();
			container.setDisplay( 'block' );

			// attributes

			const attributesRow = new UIRow();

			const textAttributes = new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/attributes' ) ).setWidth( '90px' );
			attributesRow.add( textAttributes );

			const containerAttributes = new UISpan().setDisplay( 'inline-block' ).setVerticalAlign( 'middle' ).setWidth( '160px' );
			attributesRow.add( containerAttributes );

			const index = geometry.index;

			if ( index !== null ) {

				containerAttributes.add( new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/index' ) ).setWidth( '80px' ) );
				containerAttributes.add( new UIText( ( index.count ).format() ).setFontSize( '12px' ) );
				containerAttributes.add( new UIBreak() );

			}

			const attributes = geometry.attributes;

			for ( const name in attributes ) {

				const attribute = attributes[ name ];

				containerAttributes.add( new UIText( name ).setWidth( '80px' ) );
				containerAttributes.add( new UIText( ( attribute.count ).format() + ' (' + attribute.itemSize + ')' ).setFontSize( '12px' ) );
				containerAttributes.add( new UIBreak() );

			}

			container.add( attributesRow );

			// morph targets

			const morphAttributes = geometry.morphAttributes;
			const hasMorphTargets = Object.keys( morphAttributes ).length > 0;

			if ( hasMorphTargets === true ) {

				// morph attributes

				const rowMorphAttributes = new UIRow();

				const textMorphAttributes = new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/morphAttributes' ) ).setWidth( '90px' );
				rowMorphAttributes.add( textMorphAttributes );

				const containerMorphAttributes = new UISpan().setDisplay( 'inline-block' ).setVerticalAlign( 'middle' ).setWidth( '160px' );
				rowMorphAttributes.add( containerMorphAttributes );

				for ( const name in morphAttributes ) {

					const morphTargets = morphAttributes[ name ];

					containerMorphAttributes.add( new UIText( name ).setWidth( '80px' ) );
					containerMorphAttributes.add( new UIText( ( morphTargets.length ).format() ).setFontSize( '12px' ) );
					containerMorphAttributes.add( new UIBreak() );

				}

				container.add( rowMorphAttributes );

				// morph relative

				const rowMorphRelative = new UIRow();

				const textMorphRelative = new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/morphRelative' ) ).setWidth( '90px' );
				rowMorphRelative.add( textMorphRelative );

				const checkboxMorphRelative = new UICheckbox().setValue( geometry.morphTargetsRelative ).setDisabled( true );
				rowMorphRelative.add( checkboxMorphRelative );

				container.add( rowMorphRelative );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}

export { SidebarGeometryBufferGeometry };
