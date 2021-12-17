import { UIRow, UIText, UISpan, UIBreak } from './libs/ui.js';

function SidebarGeometryBufferGeometry( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIRow();

	function update( object ) {

		if ( object === null ) return; // objectSelected.dispatch( null )
		if ( object === undefined ) return;

		var geometry = object.geometry;

		if ( geometry && geometry.isBufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			var text = new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/attributes' ) ).setWidth( '90px' );
			container.add( text );

			var container2 = new UISpan().setDisplay( 'inline-block' ).setVerticalAlign( 'middle' ).setWidth( '160px' );
			container.add( container2 );

			var index = geometry.index;

			if ( index !== null ) {

				container2.add( new UIText( strings.getKey( 'sidebar/geometry/buffer_geometry/index' ) ).setWidth( '80px' ) );
				container2.add( new UIText( ( index.count ).format() ).setFontSize( '12px' ) );
				container2.add( new UIBreak() );

			}

			var attributes = geometry.attributes;

			for ( var name in attributes ) {

				var attribute = attributes[ name ];

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
