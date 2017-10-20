/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { PathPrototype } from '../../../../../src/extras/core/PathPrototype';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'PathPrototype', () => {

			// INHERITANCE
			QUnit.test( "Extending", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "fromPoints", ( assert ) => {} );

			QUnit.test( "moveTo", ( assert ) => {} );

			QUnit.test( "lineTo", ( assert ) => {} );

			QUnit.test( "quadraticCurveTo", ( assert ) => {} );

			QUnit.test( "bezierCurveTo", ( assert ) => {} );

			QUnit.test( "splineThru", ( assert ) => {} );

			QUnit.test( "arc", ( assert ) => {} );

			QUnit.test( "absarc", ( assert ) => {} );

			QUnit.test( "ellipse", ( assert ) => {} );

			QUnit.test( "absellipse", ( assert ) => {} );

		} );

	} );

} );
