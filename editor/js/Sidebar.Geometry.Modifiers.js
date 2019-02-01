/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Geometry.Modifiers = function ( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var innerContainer = new UI.Row().setPaddingLeft( '90px' );
	container.add( innerContainer );

	var geometry = object.geometry;

	// Compute Vertex Normals

	var button = new UI.Button( 'Compute Vertex Normals' );
	button.onClick( function () {

		geometry.computeVertexNormals();

		if ( geometry instanceof THREE.BufferGeometry ) {

			geometry.attributes.normal.needsUpdate = true;

		} else {

			geometry.normalsNeedUpdate = true;

		}

		signals.geometryChanged.dispatch( object );

	} );
	innerContainer.add( button );

	var button = new UI.Button( 'Center' ).setMarginLeft( '45px' ).setMarginTop( '4px' );
	button.onClick( function () {

		editor.execute( new CenterGeometryCommand( editor.selected ) );

	} );
	innerContainer.add( button );

	var selections = new UI.Select().setOptions( {

		'translate': 'translate',
		'rotate': 'rotate',
		'scale': 'scale'

	} ).setWidth( '90px' ).setFontSize( '12px' ).setValue( 'translate' );
	container.add( selections );

	var container2 = new UI.Span().setDisplay( 'inline-block' ).setWidth( '160px' ).setMargin( '8px' );
	container.add( container2 );

	var row = new UI.Row();
	container2.add( row );

	row.add( new UI.Text( "X" ).setWidth( '30px' ) );
	var x = new UI.Input( 1 ).setWidth( '120px' ).setFontSize( '12px' );
	row.add( x );

	row.add( new UI.Text( "Y" ).setWidth( '30px' ) );
	var y = new UI.Input( 1 ).setWidth( '120px' ).setFontSize( '12px' );
	row.add( y );

	row.add( new UI.Text( "Z" ).setWidth( '30px' ) );
	var z = new UI.Input( 1 ).setWidth( '120px' ).setFontSize( '12px' );
	row.add( z );

	var v = new THREE.Vector3();
	function updateVector() {

		v.set( parseInt( x.getValue() ), parseInt( y.getValue() ), parseInt( z.getValue() ) );
		for ( var i = 0; i < 3; ++ i ) {

			if ( isNaN( v.getComponent( i ) ) ) {

				v.setComponent( i, 0 );

			}

		}

	}

	container2.add( new UI.Button( editor.strings.getKey( 'sidebar/buffer_geometry/modify' ) ).onClick( function () {

		var object = editor.selected;
		if ( object && object.geometry ) {

			var value = selections.getValue();
			updateVector();
			if ( value == 'translate' ) {

				editor.execute( new TranslateGeometryCommand( editor.selected, v.x, v.y, v.z ) );

			} else if ( value == 'rotate' ) {

				editor.execute( new RotateGeometryCommand( editor.selected, v.x * ( Math.PI / 180 ), v.y * ( Math.PI / 180 ), v.z * ( Math.PI / 180 ) ) );

			} else if ( value == 'scale' ) {

				editor.execute( new ScaleGeometryCommand( editor.selected, v.x, v.y, v.z ) );

			}

		}

	} ) );

	//

	return container;

};
