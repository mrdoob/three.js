/**
 * @author Temdog007 / http://github.com/Temdog007
 */

import * as THREE from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

var SidebarGeometryRingGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// innerRadius

	var innerRadiusRow = new UIRow();
	var innerRadius = new UINumber( parameters.innerRadius ).onChange( update );

	innerRadiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/innerRadius' ) ).setWidth( '90px' ) );
	innerRadiusRow.add( innerRadius );

	container.add( innerRadiusRow );

	// outerRadius

	var outerRadiusRow = new UIRow();
	var outerRadius = new UINumber( parameters.outerRadius ).onChange( update );

	outerRadiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/outerRadius' ) ).setWidth( '90px' ) );
	outerRadiusRow.add( outerRadius );

	container.add( outerRadiusRow );

	// thetaSegments

	var thetaSegmentsRow = new UIRow();
	var thetaSegments = new UIInteger( parameters.thetaSegments ).setRange( 3, Infinity ).onChange( update );

	thetaSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetaSegments' ) ).setWidth( '90px' ) );
	thetaSegmentsRow.add( thetaSegments );

	container.add( thetaSegmentsRow );

	// phiSegments

	var phiSegmentsRow = new UIRow();
	var phiSegments = new UIInteger( parameters.phiSegments ).setRange( 3, Infinity ).onChange( update );

	phiSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/phiSegments' ) ).setWidth( '90px' ) );
	phiSegmentsRow.add( phiSegments );

	container.add( phiSegmentsRow );

	// thetaStart

	var thetaStartRow = new UIRow();
	var thetaStart = new UINumber( parameters.thetaStart * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetastart' ) ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UIRow();
	var thetaLength = new UINumber( parameters.thetaLength * THREE.MathUtils.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/ring_geometry/thetalength' ) ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.RingBufferGeometry(
			innerRadius.getValue(),
			outerRadius.getValue(),
			thetaSegments.getValue(),
			phiSegments.getValue(),
			thetaStart.getValue() * THREE.MathUtils.DEG2RAD,
			thetaLength.getValue() * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

};

export { SidebarGeometryRingGeometry };
