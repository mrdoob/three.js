/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { CatmullRom, QuadraticBezier, CubicBezier } from '../../../../../src/extras/core/Interpolations';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'Interpolations', () => {

			// PUBLIC STUFF
			QUnit.test( "CatmullRom", ( assert ) => {} );

			QUnit.test( "QuadraticBezier", ( assert ) => {} );

			QUnit.test( "CubicBezier", ( assert ) => {} );

		} );

	} );

} );
