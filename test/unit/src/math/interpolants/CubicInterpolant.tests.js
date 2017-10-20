/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { CubicInterpolant } from '../../../../../src/math/interpolants/CubicInterpolant';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module.todo( 'CubicInterpolant', () => {

			// INHERITANCE
			QUnit.test( "Extending", ( assert ) => {} );

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PRIVATE STUFF
			QUnit.test( "DefaultSettings_", ( assert ) => {} );

			QUnit.test( "intervalChanged_", ( assert ) => {} );

			QUnit.test( "interpolate_", ( assert ) => {} );

		} );

	} );

} );
