/**
 * @author Temdog007 / http://github.com/Temdog007
 */

Sidebar.Geometry.TubeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// points

	var lastPointIdx = 0;
	var pointsUI = [];

	var pointsRow = new UI.Row();
	pointsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/path' ) ).setWidth( '90px' ) );

	var points = new UI.Span().setDisplay( 'inline-block' );
	pointsRow.add( points );

	var pointsList = new UI.Div();
	points.add( pointsList );

	var parameterPoints = parameters.path.points;
	for ( var i = 0; i < parameterPoints.length; i ++ ) {

		var point = parameterPoints[ i ];
		pointsList.add( createPointRow( point.x, point.y, point.z ) );

	}

	var addPointButton = new UI.Button( '+' ).onClick( function () {

		if ( pointsUI.length === 0 ) {

			pointsList.add( createPointRow( 0, 0, 0 ) );

		} else {

			var point = pointsUI[ pointsUI.length - 1 ];

			pointsList.add( createPointRow( point.x.getValue(), point.y.getValue(), point.z.getValue() ) );

		}

		update();

	} );
	points.add( addPointButton );

	container.add( pointsRow );

	// radius

	var radiusRow = new UI.Row();
	var radius = new UI.Number( parameters.radius ).onChange( update );

	radiusRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tubularSegments

	var tubularSegmentsRow = new UI.Row();
	var tubularSegments = new UI.Integer( parameters.tubularSegments ).onChange( update );

	tubularSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	var radialSegmentsRow = new UI.Row();
	var radialSegments = new UI.Integer( parameters.radialSegments ).onChange( update );

	radialSegmentsRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// closed

	var closedRow = new UI.Row();
	var closed = new UI.Checkbox( parameters.closed ).onChange( update );

	closedRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/closed' ) ).setWidth( '90px' ) );
	closedRow.add( closed );

	container.add( closedRow );

	// curveType

	var curveTypeRow = new UI.Row();
	var curveType = new UI.Select().setOptions( { centripetal: 'centripetal', chordal: 'chordal', catmullrom: 'catmullrom' } ).setValue( parameters.path.curveType ).onChange( update );

	curveTypeRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/curvetype' ) ).setWidth( '90px' ), curveType );

	container.add( curveTypeRow );

	// tension

	var tensionRow = new UI.Row();
	var tension = new UI.Number( parameters.path.tension ).setStep( 0.01 ).onChange( update );

	tensionRow.add( new UI.Text( strings.getKey( 'sidebar/geometry/tube_geometry/tension' ) ).setWidth( '90px' ), tension );

	container.add( tensionRow );

	//

	function update() {

		var points = [];
		var count = 0;

		for ( var i = 0; i < pointsUI.length; i ++ ) {

			var pointUI = pointsUI[ i ];

			if ( ! pointUI ) continue;

			points.push( new THREE.Vector3( pointUI.x.getValue(), pointUI.y.getValue(), pointUI.z.getValue() ) );
			count ++;
			pointUI.lbl.setValue( count );

		}

		editor.execute( new SetGeometryCommand( object, new THREE[ geometry.type ](
			new THREE.CatmullRomCurve3( points, closed.getValue(), curveType.getValue(), tension.getValue() ),
			tubularSegments.getValue(),
			radius.getValue(),
			radialSegments.getValue(),
			closed.getValue()
		) ) );

	}

	function createPointRow( x, y, z ) {

		var pointRow = new UI.Div();
		var lbl = new UI.Text( lastPointIdx + 1 ).setWidth( '20px' );
		var txtX = new UI.Number( x ).setWidth( '30px' ).onChange( update );
		var txtY = new UI.Number( y ).setWidth( '30px' ).onChange( update );
		var txtZ = new UI.Number( z ).setWidth( '30px' ).onChange( update );
		var idx = lastPointIdx;
		var btn = new UI.Button( '-' ).onClick( function () {

			deletePointRow( idx );

		} );

		pointsUI.push( { row: pointRow, lbl: lbl, x: txtX, y: txtY, z: txtZ } );
		lastPointIdx ++;
		pointRow.add( lbl, txtX, txtY, txtZ, btn );

		return pointRow;

	}

	function deletePointRow( idx ) {

		if ( ! pointsUI[ idx ] ) return;

		pointsList.remove( pointsUI[ idx ].row );
		pointsUI[ idx ] = null;

		update();

	}

	return container;

};

Sidebar.Geometry.TubeBufferGeometry = Sidebar.Geometry.TubeGeometry;
