/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { CurvePath } from '../../../../../src/extras/core/CurvePath';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'CurvePath', () => {

			// INHERITANCE
			QUnit.test( "Extending", ( assert ) => {} );

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "add", ( assert ) => {} );

			QUnit.test( "closePath", ( assert ) => {} );

			QUnit.test( "getPoint", ( assert ) => {} );

			QUnit.test( "getLength", ( assert ) => {} );

			QUnit.test( "updateArcLengths", ( assert ) => {} );

			QUnit.test( "getCurveLengths", ( assert ) => {} );

			QUnit.test( "getSpacedPoints", ( assert ) => {} );

			QUnit.test( "getPoints", ( assert ) => {} );

			QUnit.test( "createPointsGeometry", ( assert ) => {} );

			QUnit.test( "createSpacedPointsGeometry", ( assert ) => {} );

			QUnit.test( "createGeometry", ( assert ) => {} );

		} );

	} );

} );
