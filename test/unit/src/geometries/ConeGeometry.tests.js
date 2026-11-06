import { beforeEach, describe, test } from 'vitest';

import { ConeGeometry } from '../../../../src/geometries/ConeGeometry.js';

import { CylinderGeometry } from '../../../../src/geometries/CylinderGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'ConeGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			geometries = [
				new ConeGeometry(),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ConeGeometry();
			assert.strictEqual(
				object instanceof CylinderGeometry, true,
				'ConeGeometry extends from CylinderGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ConeGeometry();
			assert.ok( object, 'Can instantiate a ConeGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ConeGeometry();
			assert.ok(
				object.type === 'ConeGeometry',
				'ConeGeometry.type should be ConeGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
