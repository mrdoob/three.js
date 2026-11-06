import { beforeEach, describe, test } from 'vitest';

import { TetrahedronGeometry } from '../../../../src/geometries/TetrahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'TetrahedronGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new TetrahedronGeometry(),
				new TetrahedronGeometry( parameters.radius ),
				new TetrahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new TetrahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'TetrahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new TetrahedronGeometry();
			assert.ok( object, 'Can instantiate a TetrahedronGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new TetrahedronGeometry();
			assert.ok(
				object.type === 'TetrahedronGeometry',
				'TetrahedronGeometry.type should be TetrahedronGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
