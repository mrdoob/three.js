/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Curve } from '../../../../../src/extras/core/Curve';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'Curve', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getPoint", ( assert ) => {} );

			QUnit.test( "getPointAt", ( assert ) => {} );

			QUnit.test( "getPoints", ( assert ) => {} );

			QUnit.test( "getSpacedPoints", ( assert ) => {} );

			QUnit.test( "getLength", ( assert ) => {} );

			QUnit.test( "getLengths", ( assert ) => {} );

			QUnit.test( "updateArcLengths", ( assert ) => {} );

			QUnit.test( "getUtoTmapping", ( assert ) => {} );

			QUnit.test( "getTangent", ( assert ) => {} );

			QUnit.test( "getTangentAt", ( assert ) => {} );

			QUnit.test( "computeFrenetFrames", ( assert ) => {} );

		} );

	} );

} );
