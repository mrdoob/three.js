/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Shape } from '../../../../../src/extras/core/Shape';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module.todo( 'Shape', () => {

			// INHERITANCE
			QUnit.test( "Extending", ( assert ) => {} );

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getPointsHoles", ( assert ) => {} );

			QUnit.test( "extractAllPoints", ( assert ) => {} );

			QUnit.test( "extractPoints", ( assert ) => {} );

		} );

	} );

} );
