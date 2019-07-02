/**
 * @author Temdog007 / http://github.com/Temdog007
 */

import {
	CatmullRomCurve3,
	TubeBufferGeometry
} from '../../build/three.module.js';

import { Row, UIText, Integer, Select, Checkbox, UINumber } from './libs/ui.js';
import { Points3 } from './libs/ui.three.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

var SidebarGeometryTubeGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new Row();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// points

	var pointsRow = new Row();
	pointsRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/path' ) ).setWidth( '90px' ) );

	var points = new Points3().setValue( parameters.path.points ).onChange( update );
	pointsRow.add( points );

	container.add( pointsRow );

	// radius

	var radiusRow = new Row();
	var radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// tubularSegments

	var tubularSegmentsRow = new Row();
	var tubularSegments = new Integer( parameters.tubularSegments ).onChange( update );

	tubularSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/tubularsegments' ) ).setWidth( '90px' ) );
	tubularSegmentsRow.add( tubularSegments );

	container.add( tubularSegmentsRow );

	// radialSegments

	var radialSegmentsRow = new Row();
	var radialSegments = new Integer( parameters.radialSegments ).onChange( update );

	radialSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/radialsegments' ) ).setWidth( '90px' ) );
	radialSegmentsRow.add( radialSegments );

	container.add( radialSegmentsRow );

	// closed

	var closedRow = new Row();
	var closed = new Checkbox( parameters.closed ).onChange( update );

	closedRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/closed' ) ).setWidth( '90px' ) );
	closedRow.add( closed );

	container.add( closedRow );

	// curveType

	var curveTypeRow = new Row();
	var curveType = new Select().setOptions( { centripetal: 'centripetal', chordal: 'chordal', catmullrom: 'catmullrom' } ).setValue( parameters.path.curveType ).onChange( update );

	curveTypeRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/curvetype' ) ).setWidth( '90px' ), curveType );

	container.add( curveTypeRow );

	// tension

	var tensionRow = new Row().setDisplay( curveType.getValue() == 'catmullrom' ? '' : 'none' );
	var tension = new UINumber( parameters.path.tension ).setStep( 0.01 ).onChange( update );

	tensionRow.add( new UIText( strings.getKey( 'sidebar/geometry/tube_geometry/tension' ) ).setWidth( '90px' ), tension );

	container.add( tensionRow );

	//

	function update() {

		tensionRow.setDisplay( curveType.getValue() == 'catmullrom' ? '' : 'none' );

		editor.execute( new SetGeometryCommand( editor, object, new TubeBufferGeometry(
			new CatmullRomCurve3( points.getValue(), closed.getValue(), curveType.getValue(), tension.getValue() ),
			tubularSegments.getValue(),
			radius.getValue(),
			radialSegments.getValue(),
			closed.getValue()
		) ) );

	}

	return container;

};

export { SidebarGeometryTubeGeometry };
