/* global QUnit */

import * as Random from '../../../../examples/jsm/math/Random';

import { Vector3 } from '../../../../src/math/Vector3';

export default QUnit.module( 'Math', () => {

	QUnit.module( 'Random', () => {

		QUnit.test( 'onUnitSphere - basic', ( assert ) => {

			var vec = new Vector3();

			Random.onUnitSphere( vec );

			var zero = new Vector3();
			assert.notDeepEqual(
				vec,
				zero,
				'randomizes at least one component of the vector'
			);

			assert.ok( ( 1 - vec.length() ) <= Number.EPSILON, 'produces a unit vector' );

		} );

	} );

} );
