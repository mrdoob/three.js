/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { ShapePath } from '../../../../../src/extras/core/ShapePath';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'ShapePath', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "moveTo", ( assert ) => {} );

			QUnit.test( "lineTo", ( assert ) => {} );

			QUnit.test( "quadraticCurveTo", ( assert ) => {} );

			QUnit.test( "bezierCurveTo", ( assert ) => {} );

			QUnit.test( "splineThru", ( assert ) => {} );

			QUnit.test( "toShapes", ( assert ) => {} );

		} );

	} );

} );
