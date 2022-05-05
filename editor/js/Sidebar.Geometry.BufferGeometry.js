import { UIRow, UIText, UISpan, UIBreak } from './libs/ui.js';

function SidebarGeometryBufferGeometry( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIRow();

	function update( object ) {

		if ( object === null ) return; // objectSelected.dispatch( null )
		if ( object === undefined ) return;

		const geometry = object.geometry;

		if ( geometry && geometry.isBufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			const text = new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/attributes' ) ).setWidth( '90px' );
			container.add( text );

			const container2 = new UISpan().setDisplay( 'inline-block' ).setVerticalAlign( 'middle' ).setWidth( '160px' );
			container.add( container2 );

			const index = geometry.index;

			if ( index !== null ) {

				container2.add( new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/index' ) ).setWidth( '80px' ) );
				container2.add( new UIText( ( index.count ).format() ).setFontSize( '12px' ) );
				container2.add( new UIBreak() );

			}

			const attributes = geometry.attributes;

			for ( const name in attributes ) {

				const attribute = attributes[ name ];

				container2.add( new UIText( name ).setWidth( '80px' ) );
				container2.add( new UIText( ( attribute.count ).format() + ' (' + attribute.itemSize + ')' ).setFontSize( '12px' ) );
				container2.add( new UIBreak() );

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
