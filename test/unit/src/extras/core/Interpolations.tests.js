/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { CatmullRom, QuadraticBezier, CubicBezier } from '../../../../../src/extras/core/Interpolations';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'Interpolations', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
