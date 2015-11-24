/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.BufferGeometry = function ( signals ) {

	var container = new UI.Panel();

	function update( object ) {

		if ( object === null ) return;

		var geometry = object.geometry;

		if ( geometry instanceof THREE.BufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			var index = geometry.index;

			if ( index !== null ) {

				var panel = new UI.Panel();
				panel.add( new UI.Text( 'index' ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( index.count ).format() ).setFontSize( '12px' ) );
				container.add( panel );

			}

			var attributes = geometry.attributes;

			for ( var name in attributes ) {

				var panel = new UI.Panel();
				panel.add( new UI.Text( name ).setWidth( '90px' ) );
				panel.add( new UI.Text( ( attributes[ name ].count ).format() ).setFontSize( '12px' ) );
				container.add( panel );

			}

		} else {

			container.setDisplay( 'none' );

		}

	};

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

}
