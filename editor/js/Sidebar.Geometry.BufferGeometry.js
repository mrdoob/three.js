/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.BufferGeometry = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Row();

	function update( object ) {

		if ( object === null ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.BufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			var index = geometry.index;

			if ( index !== null ) {

				var panel = new UI.Row();
				panel.add( new UI.Text( 'index' ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( index.count ).format() ).setFontSize( '12px' ) );
				container.add( panel );

			}

			var attributes = geometry.attributes;

			for ( var name in attributes ) {

				var attribute = attributes[ name ];

				var panel = new UI.Row();
				panel.add( new UI.Text( name ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( attribute.count ).format() + ' (' + attribute.itemSize + ')' ).setFontSize( '12px' ) );
				container.add( panel );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

};
