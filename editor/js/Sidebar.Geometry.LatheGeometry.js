/**
 * @author rfm1201
 */

Sidebar.Geometry.LatheGeometry = function( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var parameters = object.geometry.parameters;

	// segments

	var segmentsRow = new UI.Row();
	var segments = new UI.Integer( parameters.segments ).onChange( update );

	segmentsRow.add( new UI.Text( 'Segments' ).setWidth( '90px' ) );
	segmentsRow.add( segments );

	container.add( segmentsRow );

	// phiStart

	var phiStartRow = new UI.Row();
	var phiStart = new UI.Number( parameters.phiStart * 180 / Math.PI ).onChange( update );

	phiStartRow.add( new UI.Text( 'Phi start (°)' ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UI.Row();
	var phiLength = new UI.Number( parameters.phiLength * 180 / Math.PI ).onChange( update );

	phiLengthRow.add( new UI.Text( 'Phi length (°)' ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// points

	var lastPointIdx = 0;
	var pointsUI = [];

	var pointsDiv = new UI.Div();
	var point;
	for ( var i = 0; i < parameters.points.length; i ++ ) {

		point = parameters.points[ i ];
		pointsDiv.add( createPointRow( point.x, point.z ) );

	}

	var pointsRow = new UI.Row().setDisplay( 'flex' );

	var btnAdd = new UI.Button( '+' ).setMarginRight( '15px' ).onClick( function() {

		pointsDiv.add( createPointRow( 0, 0 ) );
		update();

	} );

	pointsRow.add( new UI.Text( 'Points' ).setWidth( '50px' ), btnAdd, pointsDiv );
	container.add( pointsRow );

	//

	function createPointRow( x, y ) {

		var pointRow = new UI.Row();
		var lbl = new UI.Text( lastPointIdx + 1 ).setWidth( '20px' );
		var txtX = new UI.Number( x ).setRange( 0, Infinity ).setWidth( '40px' ).onChange( update );
		var txtY = new UI.Number( y ).setWidth( '40px' ).onChange( update );
		var idx = lastPointIdx;
		var btn = new UI.Button( '-' ).onClick( function() {

			deletePointRow( idx );

		} );

		pointsUI.push( { row: pointRow, lbl: lbl, x: txtX, y: txtY } );
		lastPointIdx ++;
		pointRow.add( lbl, txtX, txtY, btn );

		return pointRow;

	}

	function deletePointRow( idx ) {

		if ( ! pointsUI[ idx ] ) return;

		pointsDiv.remove( pointsUI[ idx ].row );
		pointsUI[ idx ] = null;

		update();

	}

	function update() {

		var points = [];
		var count = 0;
		var pointUI;
		for ( var i = 0; i < pointsUI.length; i ++ ) {

			pointUI = pointsUI[ i ];
			if ( ! pointUI ) {

				continue;

			}

			points.push( new THREE.Vector3( pointUI.x.getValue(), 0, pointUI.y.getValue() ) );
			count ++;
			pointUI.lbl.setValue( count );

		}

		editor.execute( new SetGeometryCommand( object, new THREE.LatheGeometry(
					points,
					segments.getValue(),
					phiStart.getValue() / 180 * Math.PI,
					phiLength.getValue() / 180 * Math.PI
				) ) );

	}

	return container;

}
