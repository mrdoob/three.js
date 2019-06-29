/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.BufferGeometry = function ( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	function update( object ) {

		if ( object === null ) return; // objectSelected.dispatch( null )
		if ( object === undefined ) return;

		var geometry = object.geometry;

		if ( geometry && geometry.isBufferGeometry ) {

			container.clear();
			container.setDisplay( 'block' );

			if ( object.isPoints === true ) {

				container.add( new UI.Text( strings.getKey( 'sidebar/geometry/buffer_geometry/points' ) ).setWidth( '80px' ) );

				var positions = [];
				var v = new THREE.Vector3();
				var attr = geometry.attributes.position;
				for ( var i = 0; i < attr.count; ++ i ) {

					v.fromBufferAttribute( attr, i );
					positions.push( v.clone() );

				}

				var points = new UI.Points3().setValue( positions ).onChange( function () {

					editor.execute( new SetGeometryCommand( editor, object, new THREE[ geometry.type ]().setFromPoints( points.getValue() ) ) );

				} );

				container.add( points );

				container.add( new UI.Break() );

			}

			var text = new UI.Text( strings.getKey( 'sidebar/geometry/buffer_geometry/attributes' ) ).setWidth( '90px' );
			container.add( text );

			var container2 = new UI.Span().setDisplay( 'inline-block' ).setWidth( '160px' );
			container.add( container2 );

			var index = geometry.index;

			if ( index !== null ) {

				container2.add( new UI.Text( strings.getKey( 'sidebar/geometry/buffer_geometry/index' ) ).setWidth( '80px' ) );
				container2.add( new UI.Text( ( index.count ).format() ).setFontSize( '12px' ) );
				container2.add( new UI.Break() );

			}

			var attributes = geometry.attributes;

			for ( var name in attributes ) {

				var attribute = attributes[ name ];

				container2.add( new UI.Text( name ).setWidth( '80px' ) );
				container2.add( new UI.Text( ( attribute.count ).format() + ' (' + attribute.itemSize + ')' ).setFontSize( '12px' ) );
				container2.add( new UI.Break() );

			}

		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( update );
	signals.geometryChanged.add( update );

	return container;

};
