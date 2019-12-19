/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	Math as _Math,
	SphereBufferGeometry
} from '../../build/three.module.js';

import { UIRow, UIText, UIInteger, UINumber } from './libs/ui.js';

import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

var SidebarGeometrySphereGeometry = function ( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UIRow();
	var radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	// widthSegments

	var widthSegmentsRow = new UIRow();
	var widthSegments = new UIInteger( parameters.widthSegments ).setRange( 1, Infinity ).onChange( update );

	widthSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/widthsegments' ) ).setWidth( '90px' ) );
	widthSegmentsRow.add( widthSegments );

	container.add( widthSegmentsRow );

	// heightSegments

	var heightSegmentsRow = new UIRow();
	var heightSegments = new UIInteger( parameters.heightSegments ).setRange( 1, Infinity ).onChange( update );

	heightSegmentsRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/heightsegments' ) ).setWidth( '90px' ) );
	heightSegmentsRow.add( heightSegments );

	container.add( heightSegmentsRow );

	// phiStart

	var phiStartRow = new UIRow();
	var phiStart = new UINumber( parameters.phiStart * _Math.RAD2DEG ).setStep( 10 ).onChange( update );

	phiStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/phistart' ) ).setWidth( '90px' ) );
	phiStartRow.add( phiStart );

	container.add( phiStartRow );

	// phiLength

	var phiLengthRow = new UIRow();
	var phiLength = new UINumber( parameters.phiLength * _Math.RAD2DEG ).setStep( 10 ).onChange( update );

	phiLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/philength' ) ).setWidth( '90px' ) );
	phiLengthRow.add( phiLength );

	container.add( phiLengthRow );

	// thetaStart

	var thetaStartRow = new UIRow();
	var thetaStart = new UINumber( parameters.thetaStart * _Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaStartRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/thetastart' ) ).setWidth( '90px' ) );
	thetaStartRow.add( thetaStart );

	container.add( thetaStartRow );

	// thetaLength

	var thetaLengthRow = new UIRow();
	var thetaLength = new UINumber( parameters.thetaLength * _Math.RAD2DEG ).setStep( 10 ).onChange( update );

	thetaLengthRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/thetalength' ) ).setWidth( '90px' ) );
	thetaLengthRow.add( thetaLength );

	container.add( thetaLengthRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new SphereBufferGeometry(
			radius.getValue(),
			widthSegments.getValue(),
			heightSegments.getValue(),
			phiStart.getValue() * _Math.DEG2RAD,
			phiLength.getValue() * _Math.DEG2RAD,
			thetaStart.getValue() * _Math.DEG2RAD,
			thetaLength.getValue() * _Math.DEG2RAD
		) ) );

	}

	return container;

};

export { SidebarGeometrySphereGeometry };
