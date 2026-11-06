import { beforeEach, describe, test } from 'vitest';

import { IcosahedronGeometry } from '../../../../src/geometries/IcosahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'IcosahedronGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new IcosahedronGeometry(),
				new IcosahedronGeometry( parameters.radius ),
				new IcosahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new IcosahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'IcosahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new IcosahedronGeometry();
			assert.ok( object, 'Can instantiate an IcosahedronGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new IcosahedronGeometry();
			assert.ok(
				object.type === 'IcosahedronGeometry',
				'IcosahedronGeometry.type should be IcosahedronGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
