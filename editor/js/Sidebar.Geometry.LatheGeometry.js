/**
 * @author rfm1201
 */

Sidebar.Geometry.LatheGeometry = function( editor, object ) {

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

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

	var pointsRow = new UI.Row();
	pointsRow.add( new UI.Text( 'Points' ).setWidth( '90px' ) );

	var points = new UI.Span().setDisplay( 'inline-block' );
	pointsRow.add( points );

	var pointsList = new UI.Div();
	points.add( pointsList );

	for ( var i = 0; i < parameters.points.length; i ++ ) {

		var point = parameters.points[ i ];
		pointsList.add( createPointRow( point.x, point.y ) );

	}

	var addPointButton = new UI.Button( '+' ).onClick( function() {

		if( pointsUI.length === 0 ){

			pointsList.add( createPointRow( 0, 0 ) );

		} else {

			var point = pointsUI[ pointsUI.length - 1 ];

			pointsList.add( createPointRow( point.x.getValue(), point.y.getValue() ) );

		}

		update();

	} );
	points.add( addPointButton );

	container.add( pointsRow );

	//

	function createPointRow( x, y ) {

		var pointRow = new UI.Div();
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

		pointsList.remove( pointsUI[ idx ].row );
		pointsUI[ idx ] = null;

		update();

	}

	function update() {

		var points = [];
		var count = 0;

		for ( var i = 0; i < pointsUI.length; i ++ ) {

			var pointUI = pointsUI[ i ];

			if ( ! pointUI ) continue;

			points.push( new THREE.Vector2( pointUI.x.getValue(), pointUI.y.getValue() ) );
			count ++;
			pointUI.lbl.setValue( count );

		}

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			points,
			segments.getValue(),
			phiStart.getValue() / 180 * Math.PI,
			phiLength.getValue() / 180 * Math.PI
		) ) );

	}

	return container;

};

Sidebar.Geometry.LatheBufferGeometry = Sidebar.Geometry.LatheGeometry;
