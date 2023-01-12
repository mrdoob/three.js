/* global QUnit */

import { TubeGeometry } from '../../../../src/geometries/TubeGeometry.js';

import { LineCurve3 } from '../../../../src/extras/curves/LineCurve3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TubeGeometry', ( hooks ) => {

		var geometries = undefined; // eslint-disable-line no-unused-vars
		hooks.beforeEach( function () {

			var path = new LineCurve3( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ) );

			geometries = [
				new TubeGeometry( path ),
			];

		} );

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.todo( 'Standard geometry tests', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
